"use client";

/**
 * État global de l'application.
 *
 * Rôle particulier : ce store joue aussi le **couloir « Système »**.
 * Les trois minuteries automatiques y sont déclenchées, sans intervention
 * humaine : timeout de pause repas, dépassement des 15 minutes de sortie
 * temporaire, et clôture du jour comptable à 23:30.
 *
 * Il porte également les notifications : chaque événement notable pousse un
 * message vers le rôle concerné — le technicien pour les sessions, l'admin
 * pour les profils, la société pour les décisions la concernant.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MOTIFS_SORTIE } from "./constants";
import {
  COMPTES,
  DEMANDEURS,
  DISPONIBILITES,
  INTERIMAIRES,
  MOBILE_CREDENTIALS,
  SERVICES,
  SOCIETES,
  nomComplet,
  trouveSociete,
} from "./mock-data";
import {
  notifCloture,
  notifOuverture,
  notifPauseTimeout,
  notifProfilASoumettre,
  notifProfilStatue,
  notifSiteNonCouvert,
  notifSortieDepassee,
  notificationsVisibles,
} from "./notifications";
import { appliquerProfil, type ErreurProfil, type ProfilEvent } from "./profil-machine";
import { construireSeed } from "./seed";
import {
  appliquer,
  creerSession,
  creerSessionRefusee,
  type ErreurCode,
  type SessionEvent,
} from "./session-machine";
import { calculeDuree, cutoffJourComptable, formatDuree, pauseEnCours, sortieEnCours } from "./time";
import {
  STATUTS_TERMINAUX,
  TOUS_SITES,
  type Compte,
  type CtrlAutoFailure,
  type Demandeur,
  type DisponibiliteTechnicien,
  type InterimaireProfil,
  type Notification,
  type Service,
  type Session,
  type Societe,
} from "./types";

const CLE_COMPTE = "lear_mobile_account";

interface MobileStore {
  /** Faux tant que l'hydratation client n'est pas terminée. */
  pret: boolean;
  compte: Compte | null;
  /** Sessions visibles par le compte connecté (cloisonnement par rôle et par site). */
  sessions: Session[];
  /** Profils visibles par le compte connecté. */
  interimaires: InterimaireProfil[];
  /** Sociétés visibles : toutes pour l'admin, la sienne pour une société. */
  societes: Societe[];
  /** Notifications adressées au rôle du compte connecté, plus récentes d'abord. */
  notifications: Notification[];
  nonLues: number;
  /** Services de l'entreprise utilisatrice. */
  services: Service[];
  /** Demandeurs, tous services confondus. */
  demandeurs: Demandeur[];
  /** Déclarations de disponibilité, ouvertes et closes. */
  disponibilites: DisponibiliteTechnicien[];
  /** Horloge partagée, rafraîchie chaque seconde (chronos et échéances). */
  now: number;

  connexion: (
    matricule: string,
    code: string,
  ) => { ok: true } | { ok: false; erreur: "err_badCredentials" | "err_accountNotFound" };
  deconnexion: () => void;

  /**
   * Scan d'entrée au poste. Les contrôles automatiques sont évalués ici :
   * profil validé par l'admin, société active, aucune session déjà ouverte.
   */
  scannerEntree: (interimaireId: string, site: string, echec?: CtrlAutoFailure) => Session;
  /** Applique un événement à une session ; retourne l'erreur métier le cas échéant. */
  envoyer: (sessionId: string, evt: SessionEvent) => { ok: true } | { ok: false; erreur: ErreurCode };

  /** Applique un événement au cycle de vie d'un profil intérimaire. */
  envoyerProfil: (
    interimaireId: string,
    evt: ProfilEvent,
  ) => { ok: true } | { ok: false; erreur: ErreurProfil };
  /** Création d'un profil par une société — le dossier naît en brouillon. */
  creerProfil: (
    donnees: Omit<InterimaireProfil, "id" | "statutProfil" | "initiales" | "agence">,
  ) => InterimaireProfil;
  /** Ajoute ou retire un document du dossier (société, avant soumission). */
  basculerDocument: (interimaireId: string, doc: InterimaireProfil["documents"][number]) => void;

  /** Création d'une société par l'admin. */
  creerSociete: (donnees: Omit<Societe, "id" | "creeLe" | "creePar" | "statut">) => Societe;
  /** Active ou suspend une société. */
  basculerSociete: (societeId: string) => void;

  marquerNotificationLue: (id: string) => void;
  marquerToutesLues: () => void;

  /* ── Services et demandeurs ── */
  creerService: (donnees: Omit<Service, "id" | "actif">) => Service;
  basculerService: (serviceId: string) => void;
  creerDemandeur: (donnees: Omit<Demandeur, "id" | "actif" | "serviceNom">) => Demandeur;
  basculerDemandeur: (demandeurId: string) => void;
  /** Demandeurs actifs, éventuellement restreints à un service. */
  demandeursDisponibles: (serviceId?: string) => Demandeur[];

  /* ── Disponibilité du technicien connecté ── */
  /** Déclaration en cours du compte connecté, s'il en a une. */
  maDisponibilite: DisponibiliteTechnicien | undefined;
  /** Techniciens actuellement déclarés sur un site. */
  techniciensDisponibles: (site: string) => DisponibiliteTechnicien[];
  declarerDisponibilite: (site: string) => void;
  cloreDisponibilite: (motif?: string) => void;

  /** Session active d'un intérimaire, s'il en a une. */
  sessionActive: (interimaireId: string) => Session | undefined;
  sessionsDe: (interimaireId: string) => Session[];
  /** Profil par identifiant, toutes portées confondues. */
  profil: (interimaireId: string) => InterimaireProfil | undefined;
}

const Ctx = createContext<MobileStore | undefined>(undefined);

/** Une session est « vivante » tant qu'elle n'a pas atteint un statut terminal. */
function estActive(s: Session): boolean {
  return !STATUTS_TERMINAUX.includes(s.statut) && s.statut !== "en_litige";
}

let compteurId = 0;
function nouvelId(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now().toString(36)}-${compteurId}`;
}

function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function MobileStoreProvider({ children }: { children: React.ReactNode }) {
  const [pret, setPret] = useState(false);
  const [compte, setCompte] = useState<Compte | null>(null);
  const [toutes, setToutes] = useState<Session[]>([]);
  const [profils, setProfils] = useState<InterimaireProfil[]>(INTERIMAIRES);
  const [societesToutes, setSocietesToutes] = useState<Societe[]>(SOCIETES);
  const [notifsToutes, setNotifsToutes] = useState<Notification[]>([]);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [demandeurs, setDemandeurs] = useState<Demandeur[]>(DEMANDEURS);
  const [disponibilites, setDisponibilites] = useState<DisponibiliteTechnicien[]>(DISPONIBILITES);
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
        setCompte(COMPTES.find((a) => a.id === id) ?? null);
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

  const pousser = useCallback((n: Notification) => {
    setNotifsToutes((prev) => [n, ...prev]);
  }, []);

  const nomDe = useCallback(
    (interimaireId: string) => {
      const p = profils.find((i) => i.id === interimaireId);
      return p ? nomComplet(p) : "Intérimaire";
    },
    [profils],
  );

  /* ── Cloisonnement des données par rôle ──────────────────────────────── */

  const sessions = useMemo(() => {
    if (!compte) return [];
    switch (compte.role) {
      case "admin":
        return toutes;
      case "societe": {
        const miens = new Set(
          profils.filter((p) => p.societeId === compte.societeId).map((p) => p.id),
        );
        return toutes.filter((s) => miens.has(s.interimaireId));
      }
      case "interimaire":
        return toutes.filter((s) => s.interimaireId === compte.interimaireId);
      default:
        // Réceptionniste et technicien : leur site uniquement.
        return compte.site === TOUS_SITES ? toutes : toutes.filter((s) => s.site === compte.site);
    }
  }, [toutes, compte, profils]);

  const interimaires = useMemo(() => {
    if (!compte) return [];
    switch (compte.role) {
      case "admin":
        return profils;
      case "societe":
        return profils.filter((p) => p.societeId === compte.societeId);
      case "interimaire":
        return profils.filter((p) => p.id === compte.interimaireId);
      default:
        return compte.site === TOUS_SITES ? profils : profils.filter((p) => p.site === compte.site);
    }
  }, [profils, compte]);

  const societes = useMemo(() => {
    if (!compte) return [];
    if (compte.role === "admin") return societesToutes;
    if (compte.role === "societe") return societesToutes.filter((s) => s.id === compte.societeId);
    return [];
  }, [societesToutes, compte]);

  const notifications = useMemo(() => {
    if (!compte) return [];
    return notificationsVisibles(notifsToutes, compte.role, compte.site);
  }, [notifsToutes, compte]);

  const nonLues = useMemo(() => notifications.filter((n) => !n.lue).length, [notifications]);

  /* ── Transitions de session ──────────────────────────────────────────── */

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

  /* Couloir Système — trois minuteries automatiques.
     Opère sur toutes les sessions, y compris hors du périmètre du compte. */
  const dejaDeclenche = useRef(new Set<string>());
  useEffect(() => {
    if (!pret) return;
    for (const s of toutes) {
      if (!estActive(s)) continue;
      const at = new Date(now).toISOString();

      /* Pause repas — délai de retour dépassé : arbitrage humain requis. */
      if (s.statut === "en_pause") {
        const p = pauseEnCours(s);
        const cle = `timeout:${p?.id}:${p?.echeance}`;
        if (p && now >= new Date(p.echeance).getTime() && !dejaDeclenche.current.has(cle)) {
          dejaDeclenche.current.add(cle);
          appliquerInterne(s.id, { type: "PAUSE_TIMEOUT", at });
          pousser(
            notifPauseTimeout({
              at,
              site: s.site,
              sessionId: s.id,
              interimaireId: s.interimaireId,
              nomInterimaire: nomDe(s.interimaireId),
            }),
          );
        }
      }

      /* Sortie temporaire — les 15 minutes sont écoulées : la session se ferme
         d'elle-même, sans décision humaine. C'est la règle de dépassement. */
      if (s.statut === "sortie_temporaire") {
        const x = sortieEnCours(s);
        const cle = `sortie:${x?.id}`;
        if (x && now >= new Date(x.echeance).getTime() && !dejaDeclenche.current.has(cle)) {
          dejaDeclenche.current.add(cle);
          appliquerInterne(s.id, { type: "SORTIE_TIMEOUT", at });
          pousser(
            notifSortieDepassee({
              at,
              site: s.site,
              sessionId: s.id,
              interimaireId: s.interimaireId,
              nomInterimaire: nomDe(s.interimaireId),
              motifLisible: MOTIFS_SORTIE[x.motif],
            }),
          );
        }
      }

      /* Jour comptable clos à 23:30 — clôture forcée. */
      const cutoff = cutoffJourComptable(s);
      const cleCutoff = `cutoff:${s.id}`;
      if (now >= cutoff && !dejaDeclenche.current.has(cleCutoff)) {
        dejaDeclenche.current.add(cleCutoff);
        appliquerInterne(s.id, { type: "CLOTURE_AUTO", at: new Date(cutoff).toISOString() });
      }
    }
  }, [now, toutes, pret, appliquerInterne, pousser, nomDe]);

  /* ── Authentification ────────────────────────────────────────────────── */

  const connexion = useCallback((matricule: string, code: string) => {
    const creds = MOBILE_CREDENTIALS[matricule.trim().toUpperCase()];
    if (!creds || creds.code !== code) {
      return { ok: false as const, erreur: "err_badCredentials" as const };
    }
    const trouve = COMPTES.find((a) => a.id === creds.accountId);
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

  /* ── Scan d'entrée et contrôles automatiques ─────────────────────────── */

  /**
   * Évalue les contrôles automatiques. L'ordre suit celui du processus :
   * on refuse d'abord sur l'état administratif, ensuite sur l'état de session.
   */
  const controleAuto = useCallback(
    (interimaireId: string, site: string): CtrlAutoFailure | undefined => {
      const profil = profils.find((p) => p.id === interimaireId);
      if (!profil) return "interimaire_inactif";
      if (profil.statutProfil !== "valide") return "profil_non_valide";

      const societe = societesToutes.find((s) => s.id === profil.societeId);
      if (societe?.statut === "suspendue") return "societe_suspendue";

      if (profil.site !== site) return "mauvais_site";
      if (toutes.some((s) => s.interimaireId === interimaireId && estActive(s))) {
        return "session_deja_ouverte";
      }
      return undefined;
    },
    [profils, societesToutes, toutes],
  );

  const scannerEntree = useCallback(
    (interimaireId: string, site: string, echec?: CtrlAutoFailure) => {
      const at = new Date().toISOString();
      const cause = echec ?? controleAuto(interimaireId, site);
      const session = cause
        ? creerSessionRefusee({ interimaireId, site, at, cause })
        : creerSession({ interimaireId, site, at });
      setToutes((prev) => [...prev, session]);

      // Le technicien est prévenu dès que le scan aboutit : c'est lui qui valide.
      // Si aucun technicien n'est déclaré sur le site, l'admin est alerté à sa
      // place — un scan ne doit jamais rester sans destinataire.
      if (!cause) {
        const base = {
          at,
          site,
          sessionId: session.id,
          interimaireId,
          nomInterimaire: nomDe(interimaireId),
        };
        const couvert = disponibilites.some((d) => !d.jusqu && d.site === site);
        pousser(couvert ? notifOuverture(base) : notifSiteNonCouvert(base));
      }
      return session;
    },
    [controleAuto, pousser, nomDe, disponibilites],
  );

  const envoyer = useCallback(
    (sessionId: string, evt: SessionEvent) => {
      const erreur = appliquerInterne(sessionId, evt);
      if (erreur) return { ok: false as const, erreur };

      // Une sortie de fin de journée met la session dans la file du technicien.
      if (evt.type === "SCAN" && evt.kind === "sortie") {
        const s = toutes.find((x) => x.id === sessionId);
        if (s) {
          const d = calculeDuree({ ...s, fin: evt.at }, new Date(evt.at).getTime());
          pousser(
            notifCloture({
              at: evt.at,
              site: s.site,
              sessionId,
              interimaireId: s.interimaireId,
              nomInterimaire: nomDe(s.interimaireId),
              dureeLisible: formatDuree(d.brutMs),
            }),
          );
        }
      }
      return { ok: true as const };
    },
    [appliquerInterne, toutes, pousser, nomDe],
  );

  /* ── Cycle de vie des profils ────────────────────────────────────────── */

  const envoyerProfil = useCallback(
    (interimaireId: string, evt: ProfilEvent) => {
      // La transition est calculée sur l'état courant avant d'être appliquée :
      // cela permet de décider des notifications à partir du profil résultant.
      const avant = profils.find((p) => p.id === interimaireId);
      if (!avant) return { ok: false as const, erreur: "errp_notDraft" as ErreurProfil };

      const resultat = appliquerProfil(avant, evt);
      if (!resultat.ok) return { ok: false as const, erreur: resultat.erreur };

      const apres = resultat.profil;
      setProfils((prev) => prev.map((p) => (p.id === interimaireId ? apres : p)));

      if (evt.type === "SOUMETTRE") {
        pousser(
          notifProfilASoumettre({
            at: evt.at,
            site: apres.site,
            interimaireId: apres.id,
            societeId: apres.societeId,
            nomInterimaire: nomComplet(apres),
            nomSociete: trouveSociete(apres.societeId)?.nom ?? apres.agence,
          }),
        );
      }
      if (evt.type === "VALIDER" || evt.type === "REFUSER") {
        pousser(
          notifProfilStatue({
            at: evt.at,
            site: apres.site,
            interimaireId: apres.id,
            societeId: apres.societeId,
            nomInterimaire: nomComplet(apres),
            valide: evt.type === "VALIDER",
            motif: evt.type === "REFUSER" ? evt.motif : undefined,
          }),
        );
      }
      return { ok: true as const };
    },
    [profils, pousser],
  );

  const creerProfil = useCallback<MobileStore["creerProfil"]>((donnees) => {
    const societe = trouveSociete(donnees.societeId);
    const profil: InterimaireProfil = {
      ...donnees,
      id: nouvelId("i"),
      initiales: initiales(donnees.prenom, donnees.nom),
      agence: societe?.nom ?? "—",
      statutProfil: "brouillon",
    };
    setProfils((prev) => [...prev, profil]);
    return profil;
  }, []);

  const basculerDocument = useCallback<MobileStore["basculerDocument"]>((interimaireId, doc) => {
    setProfils((prev) =>
      prev.map((p) => {
        if (p.id !== interimaireId) return p;
        const documents = p.documents.includes(doc)
          ? p.documents.filter((d) => d !== doc)
          : [...p.documents, doc];
        return { ...p, documents };
      }),
    );
  }, []);

  /* ── Sociétés ────────────────────────────────────────────────────────── */

  const creerSocieteAction = useCallback<MobileStore["creerSociete"]>((donnees) => {
    const societe: Societe = {
      ...donnees,
      id: nouvelId("so"),
      statut: "active",
      creeLe: new Date().toISOString().slice(0, 10),
      creePar: "Administrateur",
    };
    setSocietesToutes((prev) => [...prev, societe]);
    return societe;
  }, []);

  const basculerSociete = useCallback((societeId: string) => {
    setSocietesToutes((prev) =>
      prev.map((s) =>
        s.id === societeId
          ? { ...s, statut: s.statut === "active" ? "suspendue" : "active" }
          : s,
      ),
    );
  }, []);

  /* ── Notifications ───────────────────────────────────────────────────── */

  const marquerNotificationLue = useCallback((id: string) => {
    setNotifsToutes((prev) => prev.map((n) => (n.id === id ? { ...n, lue: true } : n)));
  }, []);

  const marquerToutesLues = useCallback(() => {
    setNotifsToutes((prev) => prev.map((n) => ({ ...n, lue: true })));
  }, []);

  /* ── Services et demandeurs ──────────────────────────────────────────── */

  const creerService = useCallback<MobileStore["creerService"]>((donnees) => {
    const service: Service = { ...donnees, id: nouvelId("sv"), actif: true };
    setServices((prev) => [...prev, service]);
    return service;
  }, []);

  const basculerService = useCallback((serviceId: string) => {
    setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, actif: !s.actif } : s)));
  }, []);

  const creerDemandeur = useCallback<MobileStore["creerDemandeur"]>(
    (donnees) => {
      const service = services.find((s) => s.id === donnees.serviceId);
      const demandeur: Demandeur = {
        ...donnees,
        id: nouvelId("dm"),
        serviceNom: service?.nom ?? "—",
        actif: true,
      };
      setDemandeurs((prev) => [...prev, demandeur]);
      return demandeur;
    },
    [services],
  );

  const basculerDemandeur = useCallback((demandeurId: string) => {
    setDemandeurs((prev) => prev.map((d) => (d.id === demandeurId ? { ...d, actif: !d.actif } : d)));
  }, []);

  /* Un demandeur inactif, ou rattaché à un service fermé, ne peut plus être
     affecté : l'imputation resterait sans budget en face. */
  const demandeursDisponibles = useCallback(
    (serviceId?: string) =>
      demandeurs.filter((d) => {
        if (!d.actif) return false;
        if (serviceId && d.serviceId !== serviceId) return false;
        return services.find((s) => s.id === d.serviceId)?.actif ?? false;
      }),
    [demandeurs, services],
  );

  /* ── Disponibilité des techniciens ───────────────────────────────────── */

  const maDisponibilite = useMemo(
    () => disponibilites.find((d) => d.technicienId === compte?.id && !d.jusqu),
    [disponibilites, compte],
  );

  const techniciensDisponibles = useCallback(
    (site: string) => disponibilites.filter((d) => !d.jusqu && d.site === site),
    [disponibilites],
  );

  const declarerDisponibilite = useCallback(
    (site: string) => {
      if (!compte) return;
      const at = new Date().toISOString();
      setDisponibilites((prev) => [
        // Une seule déclaration ouverte à la fois : changer de site clôt la
        // précédente plutôt que d'en empiler une seconde.
        ...prev.map((d) =>
          d.technicienId === compte.id && !d.jusqu
            ? { ...d, jusqu: at, motifFin: "Changement de site" }
            : d,
        ),
        {
          id: nouvelId("dp"),
          technicienId: compte.id,
          technicienNom: `${compte.prenom} ${compte.nom}`,
          site,
          depuis: at,
        },
      ]);
    },
    [compte],
  );

  const cloreDisponibilite = useCallback(
    (motif?: string) => {
      if (!compte) return;
      const at = new Date().toISOString();
      setDisponibilites((prev) =>
        prev.map((d) =>
          d.technicienId === compte.id && !d.jusqu ? { ...d, jusqu: at, motifFin: motif } : d,
        ),
      );
    },
    [compte],
  );

  /* ── Sélecteurs ──────────────────────────────────────────────────────── */

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

  const profil = useCallback(
    (interimaireId: string) => profils.find((p) => p.id === interimaireId),
    [profils],
  );

  const valeur = useMemo<MobileStore>(
    () => ({
      pret,
      compte,
      sessions,
      interimaires,
      societes,
      notifications,
      nonLues,
      services,
      demandeurs,
      disponibilites,
      now,
      connexion,
      deconnexion,
      scannerEntree,
      envoyer,
      envoyerProfil,
      creerProfil,
      basculerDocument,
      creerSociete: creerSocieteAction,
      basculerSociete,
      marquerNotificationLue,
      marquerToutesLues,
      creerService,
      basculerService,
      creerDemandeur,
      basculerDemandeur,
      demandeursDisponibles,
      maDisponibilite,
      techniciensDisponibles,
      declarerDisponibilite,
      cloreDisponibilite,
      sessionActive,
      sessionsDe,
      profil,
    }),
    [
      pret,
      compte,
      sessions,
      interimaires,
      societes,
      notifications,
      nonLues,
      services,
      demandeurs,
      disponibilites,
      now,
      connexion,
      deconnexion,
      scannerEntree,
      envoyer,
      envoyerProfil,
      creerProfil,
      basculerDocument,
      creerSocieteAction,
      basculerSociete,
      marquerNotificationLue,
      marquerToutesLues,
      creerService,
      basculerService,
      creerDemandeur,
      basculerDemandeur,
      demandeursDisponibles,
      maDisponibilite,
      techniciensDisponibles,
      declarerDisponibilite,
      cloreDisponibilite,
      sessionActive,
      sessionsDe,
      profil,
    ],
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useMobileStore(): MobileStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMobileStore doit être utilisé dans MobileStoreProvider");
  return ctx;
}
