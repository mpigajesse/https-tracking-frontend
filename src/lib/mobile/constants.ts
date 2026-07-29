/**
 * Constantes du processus de pointage — réf. CDC-POINT-2026-V1.1.
 *
 * Toute valeur métier temporelle vit ici : aucun nombre magique dans les écrans.
 *
 * Le flux couvert par ces constantes :
 *   Admin crée une société d'intérim → la société crée des profils intérimaires
 *   → l'admin valide les profils → l'intérimaire validé peut travailler
 *   → le réceptionniste scanne son QR → le technicien reçoit une notification
 *   → le technicien valide la session.
 */

/* ── Types d'activité ──────────────────────────────────────────────────── */

/**
 * Nature du travail confié à l'intérimaire. Caractérise le profil et se
 * retrouve sur chaque session, ce qui permet de ventiler les heures par
 * activité et non seulement par site.
 */
export const TYPES_ACTIVITE = {
  production: "Production",
  maintenance: "Maintenance",
  logistique: "Logistique",
  nettoyage: "Nettoyage",
  manutention: "Manutention",
  chantier: "Chantier",
  administratif: "Administratif",
} as const;

/** Durée maximale d'une pause repas avant déclenchement de l'alerte timeout (minutes). */
export const PAUSE_TIMEOUT_MIN = 40;

/**
 * Durée maximale d'une sortie temporaire (chantier ou course).
 * Au-delà, la session se ferme automatiquement : c'est la règle des 15 minutes.
 */
export const SORTIE_TEMP_TIMEOUT_MIN = 15;

/** Seuil d'avertissement avant expiration d'une sortie temporaire (minutes). */
export const SORTIE_TEMP_ALERTE_MIN = 5;

/** Prolongations possibles accordées par le Technicien (option B). */
export const PROLONGATIONS_MIN = [10, 20, 30] as const;

/** Heure de clôture du jour comptable — clôture forcée des sessions restées ouvertes. */
export const CUTOFF_JOUR_COMPTABLE = { heure: 23, minute: 30 } as const;

/** Durée de validité d'un jeton de scan affiché sur mobile (secondes). */
export const QR_TOKEN_TTL_S = 120;

/** Au-delà, la durée de session est considérée incohérente → anomalie possible. */
export const DUREE_SESSION_MAX_H = 12;

/* ── Sorties temporaires ───────────────────────────────────────────────── */

/**
 * Motifs de sortie proposés à l'intérimaire au moment du scan de sortie.
 * `fin_journee` termine la session ; les deux autres la suspendent 15 minutes.
 */
export const MOTIFS_SORTIE = {
  fin_journee: "Fin de journée",
  chantier: "Chantier",
  course: "Course",
} as const;

/** Motifs de sortie qui suspendent la session sans la clore. */
export const MOTIFS_SORTIE_TEMPORAIRE = ["chantier", "course"] as const;

/* ── Cycle de vie d'un profil intérimaire ──────────────────────────────── */

/** Libellés des statuts de validation d'un profil intérimaire. */
export const LIBELLE_STATUT_PROFIL = {
  brouillon: "Brouillon",
  en_attente_validation: "En attente de validation",
  valide: "Validé",
  refuse: "Refusé",
  suspendu: "Suspendu",
} as const;

/** Motifs de refus d'un profil proposés à l'admin (un motif est obligatoire). */
export const MOTIFS_REFUS_PROFIL = [
  "Pièce d'identité illisible ou expirée",
  "Attestation d'assurance manquante",
  "Contrat de mission incomplet",
  "Visite médicale non fournie",
  "Doublon d'un profil existant",
] as const;

/** Documents attendus dans un dossier intérimaire avant validation admin. */
export const DOCUMENTS_REQUIS = [
  { cle: "cin", libelle: "Pièce d'identité (CIN)" },
  { cle: "assurance", libelle: "Attestation d'assurance" },
  { cle: "contrat", libelle: "Contrat de mission" },
  { cle: "medical", libelle: "Visite médicale" },
] as const;

/* ── Validation d'ouverture / clôture de session ───────────────────────── */

/* ── Disponibilité des techniciens ─────────────────────────────────────── */

/**
 * Un technicien ne reçoit les notifications d'un site que s'il s'y est déclaré
 * disponible. Sans déclaration, personne n'est notifié : l'écran de validation
 * signale alors explicitement le site comme non couvert.
 */
export const MOTIFS_INDISPONIBILITE = [
  "Fin de service",
  "En intervention",
  "Congé",
  "Formation",
] as const;

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
  profil_non_valide: "Profil non validé par l'administrateur",
  societe_suspendue: "Société d'intérim suspendue",
} as const;
