/**
 * Machine à états d'une session de pointage.
 *
 * Transcription directe des passerelles XOR du BPMN : chaque transition est gardée,
 * et toute transition produit son entrée de journal d'audit. Module pur — aucune
 * dépendance React — de façon à rester vérifiable indépendamment de l'UI.
 */

import { MOTIFS_CTRL_AUTO, MOTIFS_SORTIE, SORTIE_TEMP_TIMEOUT_MIN } from "./constants";
import {
  calculeDuree,
  calculeEcheance,
  calculeEcheanceSortie,
  formatDuree,
  formatHeure,
  pauseEnCours,
  sortieEnCours,
} from "./time";
import type {
  AuditEntry,
  CtrlAutoFailure,
  Lane,
  MotifSortieTemporaire,
  ScanDisponible,
  ScanKind,
  Session,
  SessionStatus,
} from "./types";

/* ── Événements ────────────────────────────────────────────────────────── */

export type SessionEvent =
  /** Scan QR émis par l'intérimaire (hors scan d'entrée, qui crée la session). */
  | { type: "SCAN"; kind: Exclude<ScanKind, "entree" | "sortie_temporaire">; at: string }
  /** Sortie temporaire déclarée : chantier ou course, 15 minutes maximum. */
  | {
      type: "SCAN_SORTIE_TEMPORAIRE";
      motif: MotifSortieTemporaire;
      at: string;
      precision?: string;
      /** Site rejoint, s'il diffère du site de la session (cas rare). */
      siteDestination?: string;
    }
  /** Minuterie système : les 15 minutes de sortie temporaire sont écoulées. */
  | { type: "SORTIE_TIMEOUT"; at: string }
  /** Contrôles automatiques du système en échec → refus immédiat. */
  | { type: "CTRL_AUTO_KO"; cause: CtrlAutoFailure; at: string }
  /**
   * Validation d'ouverture par le technicien. C'est à ce moment qu'un
   * demandeur est affecté à la session : la validation et l'imputation sont
   * une seule et même décision.
   */
  | {
      type: "VALIDER_OUVERTURE";
      at: string;
      par: string;
      demandeurId: string;
      demandeurNom: string;
      serviceNom: string;
    }
  | { type: "REFUSER_OUVERTURE"; at: string; par: string; motif: string }
  /** Minuterie système : échéance de retour de pause dépassée. */
  | { type: "PAUSE_TIMEOUT"; at: string }
  /** Option A — clôture, la fin est fixée à l'heure de départ en pause. */
  | { type: "DECISION_FERMER"; at: string; par: string }
  /** Option B — prolongation du délai de retour. */
  | { type: "DECISION_PROLONGER"; at: string; par: string; minutes: number }
  /** Option C — saisie manuelle de l'heure de retour, justification obligatoire. */
  | { type: "DECISION_RETOUR_MANUEL"; at: string; par: string; heureRetour: string; justification: string }
  | { type: "VALIDER_CLOTURE"; at: string; par: string }
  | { type: "SIGNALER_ANOMALIE"; at: string; par: string; motif: string }
  /** Minuterie système 23:30 — jour comptable clos. */
  | { type: "CLOTURE_AUTO"; at: string };

/**
 * Codes d'erreur métier. La machine ne produit jamais de texte destiné à
 * l'écran : la traduction est faite par l'interface, via le dictionnaire mobile.
 */
export type ErreurCode =
  | "err_notAwaitingOpen"
  | "err_motifRequired"
  | "err_needOpenSession"
  | "err_timeoutBlocked"
  | "err_noPause"
  | "err_endPauseFirst"
  | "err_noOpenSession"
  | "err_noTimeout"
  | "err_justifRequired"
  | "err_notAwaitingClose"
  | "err_alreadyClosed"
  | "err_ctrlEntryOnly"
  | "err_noSortie"
  | "err_endSortieFirst"
  | "err_demandeurRequired";

export type TransitionResult =
  | { ok: true; session: Session }
  | { ok: false; erreur: ErreurCode };

/* ── Libellés ──────────────────────────────────────────────────────────── */

/**
 * Clés de traduction des statuts et des types de scan.
 * La couche métier expose des clés, jamais du texte : l'interface traduit.
 */
export const CLE_STATUT: Record<SessionStatus, string> = {
  en_attente_ouverture: "st_en_attente_ouverture",
  refusee: "st_refusee",
  ouverte: "st_ouverte",
  en_pause: "st_en_pause",
  pause_timeout: "st_pause_timeout",
  sortie_temporaire: "st_sortie_temporaire",
  en_attente_cloture: "st_en_attente_cloture",
  en_litige: "st_en_litige",
  cloturee_validee: "st_cloturee_validee",
  cloturee_timeout: "st_cloturee_timeout",
  cloturee_sortie_depassee: "st_cloturee_sortie_depassee",
  cloturee_auto: "st_cloturee_auto",
};

export const CLE_SCAN: Record<ScanKind, string> = {
  entree: "scan_entree",
  depart_pause: "scan_depart_pause",
  retour_pause: "scan_retour_pause",
  sortie_temporaire: "scan_sortie_temporaire",
  retour_sortie: "scan_retour_sortie",
  sortie: "scan_sortie",
};

/** Couleur sémantique du statut, consommée par les pastilles et bordures. */
export function tonStatut(statut: SessionStatus): "attente" | "actif" | "alerte" | "valide" {
  switch (statut) {
    case "en_attente_ouverture":
    case "en_attente_cloture":
      return "attente";
    case "ouverte":
    case "en_pause":
    case "sortie_temporaire":
      return "actif";
    case "pause_timeout":
    case "en_litige":
    case "refusee":
      return "alerte";
    case "cloturee_validee":
      return "valide";
    case "cloturee_timeout":
    case "cloturee_sortie_depassee":
    case "cloturee_auto":
      return "alerte";
  }
}

/* ── Helpers internes ──────────────────────────────────────────────────── */

let compteur = 0;
function nouvelId(prefixe: string): string {
  compteur += 1;
  return `${prefixe}-${Date.now().toString(36)}-${compteur}`;
}

function log(
  at: string,
  lane: Lane,
  message: string,
  tone: AuditEntry["tone"] = "neutre",
  par?: string,
): AuditEntry {
  return { id: nouvelId("log"), at, lane, message, tone, par };
}

/** Applique une transition en préservant l'immuabilité et en empilant l'audit. */
function transite(
  session: Session,
  patch: Partial<Session>,
  entrees: AuditEntry[],
): TransitionResult {
  return {
    ok: true,
    session: { ...session, ...patch, audit: [...session.audit, ...entrees] },
  };
}

function refus(erreur: ErreurCode): TransitionResult {
  return { ok: false, erreur };
}

/* ── Création ──────────────────────────────────────────────────────────── */

/**
 * Scan d'entrée : contrôles automatiques réussis → session « En attente d'ouverture ».
 * L'horodatage est celui du serveur ; il ne sera figé définitivement qu'à l'approbation.
 */
export function creerSession(params: {
  interimaireId: string;
  site: string;
  at: string;
}): Session {
  const { interimaireId, site, at } = params;
  return {
    id: nouvelId("S"),
    interimaireId,
    site,
    // Le site de scan devient le site imputé, et le reste quoi qu'il arrive.
    siteFacturation: site,
    debut: at,
    statut: "en_attente_ouverture",
    pauses: [],
    sorties: [],
    aVerifier: false,
    audit: [
      log(at, "interimaire", `Scan d'entrée — site ${site}`, "neutre"),
      log(
        at,
        "systeme",
        "Contrôles auto : QR valide · profil validé par l'admin · aucune session ouverte",
        "ok",
      ),
      log(at, "systeme", "Session créée — horodatage serveur", "neutre"),
      log(at, "valideur", "Notification envoyée au technicien (photo + infos du jour)", "neutre"),
    ],
  };
}

/**
 * Scan d'entrée refusé par les contrôles automatiques : la session est créée
 * puis immédiatement annulée, pour que le refus reste journalisé et auditable.
 */
export function creerSessionRefusee(params: {
  interimaireId: string;
  site: string;
  at: string;
  cause: CtrlAutoFailure;
}): Session {
  const { interimaireId, site, at, cause } = params;
  const motif = MOTIFS_CTRL_AUTO[cause];
  return {
    id: nouvelId("S"),
    interimaireId,
    site,
    // Le site de scan devient le site imputé, et le reste quoi qu'il arrive.
    siteFacturation: site,
    debut: at,
    fin: at,
    statut: "refusee",
    pauses: [],
    sorties: [],
    aVerifier: false,
    motif,
    audit: [
      log(at, "interimaire", `Scan d'entrée — site ${site}`, "neutre"),
      log(at, "systeme", `REFUS — contrôle automatique échoué : ${motif}`, "alerte"),
      log(at, "systeme", "Session annulée et journalisée", "alerte"),
    ],
  };
}

/* ── Réducteur ─────────────────────────────────────────────────────────── */

export function appliquer(session: Session, evt: SessionEvent): TransitionResult {
  switch (evt.type) {
    /* — Couloir valideur : contrôle d'identité — */
    case "VALIDER_OUVERTURE": {
      if (session.statut !== "en_attente_ouverture") {
        return refus("err_notAwaitingOpen");
      }
      // Sans demandeur, les heures ne pourraient être imputées à aucun service :
      // l'affectation est donc une condition de la validation, pas une option.
      if (!evt.demandeurId) return refus("err_demandeurRequired");
      return transite(
        session,
        {
          statut: "ouverte",
          ouvertureValideeA: session.debut,
          valideParOuverture: evt.par,
          demandeurId: evt.demandeurId,
          demandeurNom: evt.demandeurNom,
          serviceNom: evt.serviceNom,
        },
        [
          log(evt.at, "valideur", "Identité validée (photo · CIN · assurance)", "ok", evt.par),
          log(
            evt.at,
            "valideur",
            `Demandeur affecté — ${evt.demandeurNom} · service ${evt.serviceNom}`,
            "ok",
            evt.par,
          ),
          log(
            evt.at,
            "systeme",
            `Session OUVERTE — horodatage définitif figé à ${formatHeure(session.debut)}`,
            "ok",
          ),
          log(evt.at, "interimaire", `Confirmation : session ouverte à ${formatHeure(session.debut)}`, "neutre"),
        ],
      );
    }

    case "REFUSER_OUVERTURE": {
      if (session.statut !== "en_attente_ouverture") {
        return refus("err_notAwaitingOpen");
      }
      if (!evt.motif.trim()) return refus("err_motifRequired");
      return transite(session, { statut: "refusee", fin: evt.at, motif: evt.motif }, [
        log(evt.at, "valideur", `REFUS identité — motif : ${evt.motif}`, "alerte", evt.par),
        log(evt.at, "systeme", "Refus journalisé · session annulée", "alerte"),
      ]);
    }

    /* — Couloir intérimaire : scans de pause et de sortie — */
    case "SCAN": {
      if (evt.kind === "depart_pause") {
        if (session.statut !== "ouverte") {
          return refus("err_needOpenSession");
        }
        const pause = {
          id: nouvelId("P"),
          debut: evt.at,
          echeance: calculeEcheance(evt.at),
          prolongationMin: 0,
        };
        return transite(session, { statut: "en_pause", pauses: [...session.pauses, pause] }, [
          log(evt.at, "interimaire", "Scan — départ en pause", "neutre"),
          log(
            evt.at,
            "systeme",
            `Pause démarrée · retour attendu avant ${formatHeure(pause.echeance)}`,
            "neutre",
          ),
        ]);
      }

      if (evt.kind === "retour_sortie") {
        if (session.statut !== "sortie_temporaire") return refus("err_noSortie");
        const courante = sortieEnCours(session);
        if (!courante) return refus("err_noSortie");
        const sorties = session.sorties.map((s) =>
          s.id === courante.id ? { ...s, fin: evt.at } : s,
        );
        const duree = new Date(evt.at).getTime() - new Date(courante.debut).getTime();
        const journalRetour = [
          log(evt.at, "interimaire", `Scan — retour de ${MOTIFS_SORTIE[courante.motif]}`, "neutre"),
          log(evt.at, "systeme", `Retour dans les délais · absence ${formatDuree(duree)} · reprise`, "ok"),
        ];
        // Le retour dans les temps confirme la règle : rien ne bascule sur le
        // site visité, la totalité de la session reste au site de départ.
        if (courante.siteDestination) {
          journalRetour.push(
            log(
              evt.at,
              "systeme",
              `Passage par ${courante.siteDestination} · session intégralement comptabilisée sur ${session.siteFacturation}`,
              "ok",
            ),
          );
        }
        return transite(session, { statut: "ouverte", sorties }, journalRetour);
      }

      if (evt.kind === "retour_pause") {
        if (session.statut !== "en_pause") {
          return session.statut === "pause_timeout"
            ? refus("err_timeoutBlocked")
            : refus("err_noPause");
        }
        const courante = pauseEnCours(session);
        if (!courante) return refus("err_noPause");
        const pauses = session.pauses.map((p) => (p.id === courante.id ? { ...p, fin: evt.at } : p));
        const duree = new Date(evt.at).getTime() - new Date(courante.debut).getTime();
        return transite(session, { statut: "ouverte", pauses }, [
          log(evt.at, "interimaire", "Scan — retour de pause", "neutre"),
          log(evt.at, "systeme", `Durée de pause = ${formatDuree(duree)} · reprise`, "ok"),
        ]);
      }

      // sortie définitive — fin de journée
      if (session.statut !== "ouverte") {
        if (session.statut === "en_pause" || session.statut === "pause_timeout") {
          return refus("err_endPauseFirst");
        }
        if (session.statut === "sortie_temporaire") return refus("err_endSortieFirst");
        return refus("err_noOpenSession");
      }
      const provisoire = calculeDuree({ ...session, fin: evt.at }, new Date(evt.at).getTime());
      return transite(session, { statut: "en_attente_cloture", fin: evt.at }, [
        log(evt.at, "interimaire", "Scan — sortie · fin de journée", "neutre"),
        log(evt.at, "systeme", "Session ouverte confirmée · cohérence de durée vérifiée", "ok"),
        log(
          evt.at,
          "valideur",
          `Notification de clôture au technicien — ${formatDuree(provisoire.brutMs)} brut calculé`,
          "neutre",
        ),
      ]);
    }

    /* — Couloir intérimaire : sortie temporaire (chantier ou course) — */
    case "SCAN_SORTIE_TEMPORAIRE": {
      if (session.statut !== "ouverte") {
        if (session.statut === "en_pause" || session.statut === "pause_timeout") {
          return refus("err_endPauseFirst");
        }
        return refus("err_needOpenSession");
      }
      // Un changement de site est possible, mais reste sans effet sur
      // l'imputation : `siteFacturation` n'est jamais réécrit ici.
      const changeDeSite = Boolean(evt.siteDestination && evt.siteDestination !== session.site);
      const sortie = {
        id: nouvelId("X"),
        motif: evt.motif,
        debut: evt.at,
        echeance: calculeEcheanceSortie(evt.at),
        precision: evt.precision,
        siteDestination: changeDeSite ? evt.siteDestination : undefined,
      };
      const libelle = MOTIFS_SORTIE[evt.motif];

      const journal = [
        log(
          evt.at,
          "interimaire",
          `Scan — sortie ${libelle.toLowerCase()}${evt.precision ? ` · ${evt.precision}` : ""}`,
          "neutre",
        ),
        log(
          evt.at,
          "systeme",
          `Sortie temporaire · ${SORTIE_TEMP_TIMEOUT_MIN} min accordées · retour avant ${formatHeure(sortie.echeance)}`,
          "neutre",
        ),
      ];

      if (changeDeSite) {
        journal.push(
          log(
            evt.at,
            "systeme",
            `Changement de site vers ${evt.siteDestination} · heures maintenues sur ${session.siteFacturation} (règle du site de départ)`,
            "alerte",
          ),
        );
      }

      return transite(
        session,
        { statut: "sortie_temporaire", sorties: [...session.sorties, sortie] },
        journal,
      );
    }

    /* — Couloir système : dépassement des 15 minutes → clôture d'office — */
    case "SORTIE_TIMEOUT": {
      if (session.statut !== "sortie_temporaire") return refus("err_noSortie");
      const courante = sortieEnCours(session);
      if (!courante) return refus("err_noSortie");
      // La session s'arrête à l'heure du départ : le temps hors site n'est pas payé.
      const sorties = session.sorties.map((s) =>
        s.id === courante.id ? { ...s, fin: courante.debut, depassee: true } : s,
      );
      const libelle = MOTIFS_SORTIE[courante.motif];
      return transite(
        session,
        {
          statut: "cloturee_sortie_depassee",
          fin: courante.debut,
          sorties,
          aVerifier: true,
          motif: `Dépassement du délai de ${SORTIE_TEMP_TIMEOUT_MIN} min — sortie ${libelle.toLowerCase()}`,
        },
        [
          log(
            evt.at,
            "systeme",
            `ALERTE — aucun retour ${SORTIE_TEMP_TIMEOUT_MIN} min après la sortie ${libelle.toLowerCase()} de ${formatHeure(courante.debut)}`,
            "alerte",
          ),
          log(
            evt.at,
            "systeme",
            `Session fermée automatiquement · fin fixée à ${formatHeure(courante.debut)}`,
            "alerte",
          ),
          log(evt.at, "valideur", "Flag « À vérifier » — régularisation attendue", "neutre"),
        ],
      );
    }

    /* — Couloir système : minuterie de pause — */
    case "PAUSE_TIMEOUT": {
      if (session.statut !== "en_pause") return refus("err_noPause");
      const courante = pauseEnCours(session);
      if (!courante) return refus("err_noPause");
      return transite(session, { statut: "pause_timeout" }, [
        log(
          evt.at,
          "systeme",
          `ALERTE timeout — aucun retour · départ de pause ${formatHeure(courante.debut)}`,
          "alerte",
        ),
        log(evt.at, "valideur", "Décision Technicien requise (A / B / C)", "neutre"),
      ]);
    }

    /* — Couloir valideur : arbitrage du timeout — */
    case "DECISION_FERMER": {
      if (session.statut !== "pause_timeout") return refus("err_noTimeout");
      const courante = pauseEnCours(session);
      if (!courante) return refus("err_noPause");
      // La fin de session est ramenée à l'heure de départ en pause, et cette pause
      // est retirée du décompte : elle n'a jamais eu lieu dans le temps facturé.
      const pauses = session.pauses.filter((p) => p.id !== courante.id);
      return transite(
        session,
        {
          statut: "cloturee_timeout",
          fin: courante.debut,
          pauses,
          aVerifier: true,
          valideParCloture: evt.par,
          motif: "Fermeture anticipée — timeout pause",
        },
        [
          log(
            evt.at,
            "valideur",
            `Option A — clôture · fin fixée à ${formatHeure(courante.debut)}`,
            "alerte",
            evt.par,
          ),
          log(evt.at, "systeme", "Session clôturée · flag « À vérifier » posé", "alerte"),
        ],
      );
    }

    case "DECISION_PROLONGER": {
      if (session.statut !== "pause_timeout") return refus("err_noTimeout");
      const courante = pauseEnCours(session);
      if (!courante) return refus("err_noPause");
      const prolongationMin = courante.prolongationMin + evt.minutes;
      const echeance = calculeEcheance(courante.debut, prolongationMin);
      const pauses = session.pauses.map((p) =>
        p.id === courante.id ? { ...p, prolongationMin, echeance } : p,
      );
      return transite(session, { statut: "en_pause", pauses }, [
        log(
          evt.at,
          "valideur",
          `Option B — délai +${evt.minutes} min · nouvelle échéance ${formatHeure(echeance)}`,
          "neutre",
          evt.par,
        ),
        log(evt.at, "systeme", "Surveillance de la pause poursuivie", "neutre"),
      ]);
    }

    case "DECISION_RETOUR_MANUEL": {
      if (session.statut !== "pause_timeout") return refus("err_noTimeout");
      if (!evt.justification.trim()) return refus("err_justifRequired");
      const courante = pauseEnCours(session);
      if (!courante) return refus("err_noPause");
      const pauses = session.pauses.map((p) =>
        p.id === courante.id
          ? { ...p, fin: evt.heureRetour, retourManuel: true, justification: evt.justification }
          : p,
      );
      return transite(session, { statut: "ouverte", pauses, aVerifier: true }, [
        log(
          evt.at,
          "valideur",
          `Option C — retour manuel à ${formatHeure(evt.heureRetour)} · ${evt.justification}`,
          "neutre",
          evt.par,
        ),
        log(evt.at, "systeme", "Justification journalisée · statut « En cours »", "ok"),
      ]);
    }

    /* — Couloir valideur : clôture — */
    case "VALIDER_CLOTURE": {
      if (session.statut !== "en_attente_cloture") return refus("err_notAwaitingClose");
      const d = calculeDuree(session, new Date(evt.at).getTime());
      return transite(session, { statut: "cloturee_validee", valideParCloture: evt.par }, [
        log(evt.at, "valideur", "Clôture validée", "ok", evt.par),
        log(
          evt.at,
          "systeme",
          `Temps réel = ${formatDuree(d.brutMs)} − ${formatDuree(d.pausesMs)} pause − ${formatDuree(d.sortiesMs)} sortie = ${formatDuree(d.netMs)}`,
          "ok",
        ),
        log(evt.at, "systeme", "Session CLÔTURÉE / VALIDÉE", "ok"),
      ]);
    }

    case "SIGNALER_ANOMALIE": {
      if (session.statut !== "en_attente_cloture") return refus("err_notAwaitingClose");
      if (!evt.motif.trim()) return refus("err_motifRequired");
      return transite(
        session,
        { statut: "en_litige", motif: evt.motif, aVerifier: true, valideParCloture: evt.par },
        [log(evt.at, "valideur", `Anomalie signalée — ${evt.motif}`, "alerte", evt.par)],
      );
    }

    /* — Couloir système : clôture forcée du jour comptable — */
    case "CLOTURE_AUTO": {
      const ouvrables: SessionStatus[] = [
        "ouverte",
        "en_pause",
        "pause_timeout",
        "sortie_temporaire",
        "en_attente_cloture",
      ];
      if (!ouvrables.includes(session.statut)) return refus("err_alreadyClosed");
      const pauses = session.pauses.map((p) => (p.fin ? p : { ...p, fin: evt.at }));
      const sorties = session.sorties.map((s) => (s.fin ? s : { ...s, fin: evt.at }));
      return transite(
        session,
        { statut: "cloturee_auto", fin: evt.at, pauses, sorties, aVerifier: true },
        [
          log(evt.at, "systeme", "23:30 — jour comptable clos · session encore ouverte", "alerte"),
          log(evt.at, "systeme", "Clôture forcée · flag « À vérifier »", "alerte"),
          log(evt.at, "valideur", "Correction de l'heure de sortie attendue le lendemain", "neutre"),
        ],
      );
    }

    case "CTRL_AUTO_KO":
      return refus("err_ctrlEntryOnly");
  }
}

/* ── Vue « que puis-je scanner ? » ─────────────────────────────────────── */

/**
 * Détermine le scan à enregistrer au poste pour un intérimaire donné, selon
 * l'état de sa session. Sans session active, l'action est le scan d'entrée.
 */
export function scanDisponible(session: Session | undefined): ScanDisponible {
  if (!session || session.statut === "refusee") {
    return { kind: "entree", libelleKey: "act_entree", actif: true };
  }
  switch (session.statut) {
    case "en_attente_ouverture":
      return {
        kind: "entree",
        libelleKey: "act_awaitValidation",
        actif: false,
        raisonKey: "act_awaitValidationWhy",
      };
    case "ouverte":
      // Session en cours : le geste par défaut est la sortie, l'intérimaire
      // choisira ensuite son motif (fin de journée, chantier ou course).
      return { kind: "sortie", libelleKey: "act_sortie", actif: true };
    case "sortie_temporaire":
      return { kind: "retour_sortie", libelleKey: "act_retour_sortie", actif: true };
    case "en_pause":
      return { kind: "retour_pause", libelleKey: "act_retour_pause", actif: true };
    case "pause_timeout":
      return {
        kind: "retour_pause",
        libelleKey: "act_timeoutBlocked",
        actif: false,
        raisonKey: "act_timeoutBlockedWhy",
      };
    case "en_attente_cloture":
      return {
        kind: "sortie",
        libelleKey: "act_awaitClosure",
        actif: false,
        raisonKey: "act_awaitClosureWhy",
      };
    default:
      return {
        kind: "entree",
        libelleKey: "act_dayDone",
        actif: false,
        raisonKey: "act_dayDoneWhy",
      };
  }
}

/** Une session ouverte peut aussi être clôturée par scan de sortie depuis l'état « ouverte ». */
export function peutScannerSortie(session: Session | undefined): boolean {
  return session?.statut === "ouverte";
}

/** Une pause repas ne peut être déclarée que depuis une session pleinement ouverte. */
export function peutPrendrePause(session: Session | undefined): boolean {
  return session?.statut === "ouverte";
}
