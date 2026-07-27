"use client";

/**
 * État global de l'application mobile.
 *
 * Rôle particulier : ce store joue aussi le **couloir « Système »** du BPMN.
 * Les deux minuteries automatiques (timeout de pause, clôture 23:30) sont
 * déclenchées ici, sans intervention humaine, comme dans le modèle.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MOBILE_ACCOUNTS, MOBILE_CREDENTIALS } from "./mock-data";
import { construireSeed } from "./seed";
import {
  appliquer,
  creerSession,
  creerSessionRefusee,
  type ErreurCode,
  type SessionEvent,
} from "./session-machine";
import { cutoffJourComptable, pauseEnCours } from "./time";
import {
  STATUTS_TERMINAUX,
  TOUS_SITES,
  type CtrlAutoFailure,
  type MobileAccount,
  type Session,
} from "./types";

const CLE_COMPTE = "lear_mobile_account";

interface MobileStore {
  /** Faux tant que l'hydratation client n'est pas terminée. */
  pret: boolean;
  compte: MobileAccount | null;
  /** Sessions visibles par le compte connecté : filtrées par site, sauf pour l'admin. */
  sessions: Session[];
  /** Horloge partagée, rafraîchie chaque seconde (chronos et échéances). */
  now: number;

  connexion: (
    matricule: string,
    code: string,
  ) => { ok: true } | { ok: false; erreur: "err_badCredentials" | "err_accountNotFound" };
  deconnexion: () => void;

  /** Scan d'entrée au poste : crée la session après contrôles automatiques. */
  scannerEntree: (interimaireId: string, site: string, echec?: CtrlAutoFailure) => Session;
  /** Applique un événement à une session ; retourne l'erreur métier le cas échéant. */
  envoyer: (sessionId: string, evt: SessionEvent) => { ok: true } | { ok: false; erreur: ErreurCode };

  /** Session active d'un intérimaire, s'il en a une. */
  sessionActive: (interimaireId: string) => Session | undefined;
  sessionsDe: (interimaireId: string) => Session[];
}

const Ctx = createContext<MobileStore | undefined>(undefined);

/** Une session est « vivante » tant qu'elle n'a pas atteint un statut terminal. */
function estActive(s: Session): boolean {
  return !STATUTS_TERMINAUX.includes(s.statut) && s.statut !== "en_litige";
}

export function MobileStoreProvider({ children }: { children: React.ReactNode }) {
  const [pret, setPret] = useState(false);
  const [compte, setCompte] = useState<MobileAccount | null>(null);
  const [toutes, setToutes] = useState<Session[]>([]);
  const [now, setNow] = useState(() => Date.now());

  /* Hydratation : seed et compte ne sont construits que côté client, pour
     éviter tout écart de rendu serveur / client sur des données horodatées. */
  useEffect(() => {
    const t = Date.now();
    setToutes(construireSeed(t));
    setNow(t);
    try {
      const brut = window.localStorage.getItem(CLE_COMPTE);
      if (brut) {
        const id = JSON.parse(brut) as string;
        setCompte(MOBILE_ACCOUNTS.find((a) => a.id === id) ?? null);
      }
    } catch {
      // Stockage indisponible (navigation privée) : on démarre déconnecté.
    }
    setPret(true);
  }, []);

  /* Horloge globale. */
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  /* Cloisonnement : un réceptionniste ne voit que son site, l'admin voit tout. */
  const sessions = useMemo(() => {
    if (!compte) return [];
    if (compte.role === "admin" || compte.site === TOUS_SITES) return toutes;
    return toutes.filter((s) => s.site === compte.site);
  }, [toutes, compte]);

  const appliquerInterne = useCallback((sessionId: string, evt: SessionEvent) => {
    let erreur: ErreurCode | null = null;
    setToutes((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const r = appliquer(s, evt);
        if (!r.ok) {
          erreur = r.erreur;
          return s;
        }
        return r.session;
      }),
    );
    return erreur;
  }, []);

  /* Couloir Système — minuterie de pause (40 min) et clôture du jour comptable.
     Opère sur toutes les sessions, y compris celles hors du site du compte. */
  const dejaDeclenche = useRef(new Set<string>());
  useEffect(() => {
    if (!pret) return;
    for (const s of toutes) {
      if (!estActive(s)) continue;

      if (s.statut === "en_pause") {
        const p = pauseEnCours(s);
        const cle = `timeout:${p?.id}:${p?.echeance}`;
        if (p && now >= new Date(p.echeance).getTime() && !dejaDeclenche.current.has(cle)) {
          dejaDeclenche.current.add(cle);
          appliquerInterne(s.id, { type: "PAUSE_TIMEOUT", at: new Date(now).toISOString() });
        }
      }

      const cutoff = cutoffJourComptable(s);
      const cleCutoff = `cutoff:${s.id}`;
      if (now >= cutoff && !dejaDeclenche.current.has(cleCutoff)) {
        dejaDeclenche.current.add(cleCutoff);
        appliquerInterne(s.id, { type: "CLOTURE_AUTO", at: new Date(cutoff).toISOString() });
      }
    }
  }, [now, toutes, pret, appliquerInterne]);

  const connexion = useCallback((matricule: string, code: string) => {
    const creds = MOBILE_CREDENTIALS[matricule.trim().toUpperCase()];
    if (!creds || creds.code !== code) {
      return { ok: false as const, erreur: "err_badCredentials" as const };
    }
    const trouve = MOBILE_ACCOUNTS.find((a) => a.id === creds.accountId);
    if (!trouve) return { ok: false as const, erreur: "err_accountNotFound" as const };
    setCompte(trouve);
    try {
      window.localStorage.setItem(CLE_COMPTE, JSON.stringify(trouve.id));
    } catch {
      // Session non persistée : sans effet sur l'utilisation courante.
    }
    return { ok: true as const };
  }, []);

  const deconnexion = useCallback(() => {
    setCompte(null);
    try {
      window.localStorage.removeItem(CLE_COMPTE);
    } catch {
      // Rien à nettoyer.
    }
  }, []);

  const scannerEntree = useCallback((interimaireId: string, site: string, echec?: CtrlAutoFailure) => {
    const at = new Date().toISOString();
    const session = echec
      ? creerSessionRefusee({ interimaireId, site, at, cause: echec })
      : creerSession({ interimaireId, site, at });
    setToutes((prev) => [...prev, session]);
    return session;
  }, []);

  const envoyer = useCallback(
    (sessionId: string, evt: SessionEvent) => {
      const erreur = appliquerInterne(sessionId, evt);
      return erreur ? { ok: false as const, erreur } : { ok: true as const };
    },
    [appliquerInterne],
  );

  const sessionsDe = useCallback(
    (interimaireId: string) =>
      sessions
        .filter((s) => s.interimaireId === interimaireId)
        .sort((a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime()),
    [sessions],
  );

  const sessionActive = useCallback(
    (interimaireId: string) => sessions.find((s) => s.interimaireId === interimaireId && estActive(s)),
    [sessions],
  );

  const valeur = useMemo<MobileStore>(
    () => ({
      pret,
      compte,
      sessions,
      now,
      connexion,
      deconnexion,
      scannerEntree,
      envoyer,
      sessionActive,
      sessionsDe,
    }),
    [pret, compte, sessions, now, connexion, deconnexion, scannerEntree, envoyer, sessionActive, sessionsDe],
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useMobileStore(): MobileStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMobileStore doit être utilisé dans MobileStoreProvider");
  return ctx;
}
