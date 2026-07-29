/**
 * Cycle de vie d'un profil intérimaire — de la saisie par la société
 * d'intérim jusqu'à la validation par l'administrateur.
 *
 *   brouillon ──soumettre──> en_attente_validation ──valider──> valide
 *        ^                          │                             │
 *        └────────corriger──────────┴──refuser──> refuse          └──suspendre──> suspendu
 *
 * Seul un profil `valide` ouvre le droit de scanner : c'est la garde vérifiée
 * par les contrôles automatiques au moment du scan d'entrée.
 *
 * Module pur — aucune dépendance React — comme `session-machine`.
 */

import { DOCUMENTS_REQUIS } from "./constants";
import type { DocumentCle, InterimaireProfil, StatutProfil } from "./types";

/* ── Événements ────────────────────────────────────────────────────────── */

export type ProfilEvent =
  /** La société soumet le dossier à l'administrateur. */
  | { type: "SOUMETTRE"; at: string; par: string }
  /** L'admin valide : l'intérimaire peut commencer le travail. */
  | { type: "VALIDER"; at: string; par: string }
  /** L'admin refuse : motif obligatoire, la société peut corriger. */
  | { type: "REFUSER"; at: string; par: string; motif: string }
  /** La société reprend un dossier refusé pour le corriger. */
  | { type: "CORRIGER"; at: string; par: string }
  /** L'admin suspend un profil validé (assurance expirée, incident…). */
  | { type: "SUSPENDRE"; at: string; par: string; motif: string }
  /** L'admin lève la suspension. */
  | { type: "REACTIVER"; at: string; par: string };

export type ErreurProfil =
  | "errp_notDraft"
  | "errp_notPending"
  | "errp_notRefused"
  | "errp_notValid"
  | "errp_notSuspended"
  | "errp_motifRequired"
  | "errp_documentsMissing";

export type ResultatProfil =
  | { ok: true; profil: InterimaireProfil }
  | { ok: false; erreur: ErreurProfil };

/* ── Libellés ──────────────────────────────────────────────────────────── */

/** Clés de traduction des statuts de profil. */
export const CLE_STATUT_PROFIL: Record<StatutProfil, string> = {
  brouillon: "sp_brouillon",
  en_attente_validation: "sp_en_attente_validation",
  valide: "sp_valide",
  refuse: "sp_refuse",
  suspendu: "sp_suspendu",
};

/** Couleur sémantique du statut, consommée par les pastilles. */
export function tonStatutProfil(statut: StatutProfil): "attente" | "actif" | "alerte" | "valide" {
  switch (statut) {
    case "brouillon":
      return "attente";
    case "en_attente_validation":
      return "attente";
    case "valide":
      return "valide";
    case "refuse":
    case "suspendu":
      return "alerte";
  }
}

/* ── Complétude du dossier ─────────────────────────────────────────────── */

/** Les documents encore absents du dossier. */
export function documentsManquants(profil: InterimaireProfil): DocumentCle[] {
  return DOCUMENTS_REQUIS.filter((d) => !profil.documents.includes(d.cle)).map((d) => d.cle);
}

/** Un dossier est soumissible dès lors que les quatre documents sont fournis. */
export function dossierComplet(profil: InterimaireProfil): boolean {
  return documentsManquants(profil).length === 0;
}

/* ── Réducteur ─────────────────────────────────────────────────────────── */

function refus(erreur: ErreurProfil): ResultatProfil {
  return { ok: false, erreur };
}

function change(profil: InterimaireProfil, patch: Partial<InterimaireProfil>): ResultatProfil {
  return { ok: true, profil: { ...profil, ...patch } };
}

export function appliquerProfil(profil: InterimaireProfil, evt: ProfilEvent): ResultatProfil {
  switch (evt.type) {
    case "SOUMETTRE": {
      if (profil.statutProfil !== "brouillon" && profil.statutProfil !== "refuse") {
        return refus("errp_notDraft");
      }
      if (!dossierComplet(profil)) return refus("errp_documentsMissing");
      return change(profil, {
        statutProfil: "en_attente_validation",
        soumisLe: evt.at,
        motifRefus: undefined,
        statueLe: undefined,
        statuePar: undefined,
      });
    }

    case "VALIDER": {
      if (profil.statutProfil !== "en_attente_validation") return refus("errp_notPending");
      return change(profil, {
        statutProfil: "valide",
        statueLe: evt.at,
        statuePar: evt.par,
        motifRefus: undefined,
      });
    }

    case "REFUSER": {
      if (profil.statutProfil !== "en_attente_validation") return refus("errp_notPending");
      if (!evt.motif.trim()) return refus("errp_motifRequired");
      return change(profil, {
        statutProfil: "refuse",
        statueLe: evt.at,
        statuePar: evt.par,
        motifRefus: evt.motif,
      });
    }

    case "CORRIGER": {
      if (profil.statutProfil !== "refuse") return refus("errp_notRefused");
      return change(profil, { statutProfil: "brouillon" });
    }

    case "SUSPENDRE": {
      if (profil.statutProfil !== "valide") return refus("errp_notValid");
      if (!evt.motif.trim()) return refus("errp_motifRequired");
      return change(profil, {
        statutProfil: "suspendu",
        statueLe: evt.at,
        statuePar: evt.par,
        motifRefus: evt.motif,
      });
    }

    case "REACTIVER": {
      if (profil.statutProfil !== "suspendu") return refus("errp_notSuspended");
      return change(profil, {
        statutProfil: "valide",
        statueLe: evt.at,
        statuePar: evt.par,
        motifRefus: undefined,
      });
    }
  }
}

/* ── Actions disponibles par rôle ──────────────────────────────────────── */

/** Ce que la société peut faire sur l'un de ses profils, à cet instant. */
export function actionsSociete(profil: InterimaireProfil): {
  peutModifier: boolean;
  peutSoumettre: boolean;
  peutCorriger: boolean;
} {
  const brouillon = profil.statutProfil === "brouillon";
  return {
    peutModifier: brouillon,
    peutSoumettre: brouillon && dossierComplet(profil),
    peutCorriger: profil.statutProfil === "refuse",
  };
}

/** Ce que l'admin peut faire sur un profil, à cet instant. */
export function actionsAdmin(profil: InterimaireProfil): {
  peutValider: boolean;
  peutRefuser: boolean;
  peutSuspendre: boolean;
  peutReactiver: boolean;
} {
  const enAttente = profil.statutProfil === "en_attente_validation";
  return {
    peutValider: enAttente,
    peutRefuser: enAttente,
    peutSuspendre: profil.statutProfil === "valide",
    peutReactiver: profil.statutProfil === "suspendu",
  };
}
