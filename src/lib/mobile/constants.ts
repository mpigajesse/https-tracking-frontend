/**
 * Constantes du processus de pointage — dérivées du modèle BPMN
 * (mobile/bpmn-pointage-interim.html, réf. CDC-POINT-2026-V1.0).
 *
 * Toute valeur métier temporelle vit ici : aucun nombre magique dans les écrans.
 */

/** Durée maximale d'une pause avant déclenchement de l'alerte timeout (minutes). */
export const PAUSE_TIMEOUT_MIN = 40;

/** Prolongations possibles accordées par le Technicien (option B). */
export const PROLONGATIONS_MIN = [10, 20, 30] as const;

/** Heure de clôture du jour comptable — clôture forcée des sessions restées ouvertes. */
export const CUTOFF_JOUR_COMPTABLE = { heure: 23, minute: 30 } as const;

/** Durée de validité d'un jeton de scan affiché sur mobile (secondes). */
export const QR_TOKEN_TTL_S = 120;

/** Au-delà, la durée de session est considérée incohérente → anomalie possible. */
export const DUREE_SESSION_MAX_H = 12;

/** Motifs de refus proposés au valideur (un motif est obligatoire). */
export const MOTIFS_REFUS = [
  "Photo non conforme à la personne",
  "CIN invalide ou expirée",
  "Assurance non à jour",
  "Intérimaire non affecté à ce site",
  "Documents manquants",
] as const;

/** Causes d'échec des contrôles automatiques (passerelle « Contrôles OK ? »). */
export const MOTIFS_CTRL_AUTO = {
  qr_expire: "QR Code expiré",
  interimaire_inactif: "Intérimaire inactif",
  session_deja_ouverte: "Une session est déjà ouverte",
  mauvais_site: "Site incohérent avec l'affectation",
} as const;
