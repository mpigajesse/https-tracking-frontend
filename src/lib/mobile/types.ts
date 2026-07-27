/**
 * Modèle de domaine de l'application mobile de pointage.
 * Fidèle au BPMN « Cycle de vie d'une session de pointage » (3 couloirs, 4 scénarios).
 */

import type { MOTIFS_CTRL_AUTO } from "./constants";

/* ── Acteurs ───────────────────────────────────────────────────────────── */

/** Couloirs BPMN. Le couloir « Système » n'a pas d'écran : il agit seul. */
export type Lane = "interimaire" | "systeme" | "valideur";

/**
 * Rôles disposant d'une interface mobile.
 *
 * L'intérimaire n'a pas de compte : il présente son QR au poste, et c'est
 * l'utilisateur du mobile qui émet le scan en son nom. Les deux profils du
 * couloir « valideur » du BPMN sont donc fusionnés dans `receptionniste`.
 */
export type MobileRole = "admin" | "receptionniste";

export interface MobileAccount {
  id: string;
  prenom: string;
  nom: string;
  role: MobileRole;
  /** Site d'affectation. L'admin porte `TOUS_SITES`. */
  site: string;
  matricule: string;
}

/** Portée d'un compte admin : aucune restriction de site. */
export const TOUS_SITES = "Tous les sites";

export interface InterimaireProfil {
  id: string;
  prenom: string;
  nom: string;
  cin: string;
  agence: string;
  fonction: string;
  site: string;
  /** Initiales affichées à défaut de photo (données mock). */
  initiales: string;
  assuranceValideJusqu: string;
  contratFin: string;
}

/* ── Cycle de vie d'une session ────────────────────────────────────────── */

/**
 * Statuts issus des libellés BPMN. L'ordre reflète le fil du processus.
 * Les statuts `cloturee_*` et `refusee` sont terminaux.
 */
export type SessionStatus =
  | "en_attente_ouverture"
  | "refusee"
  | "ouverte"
  | "en_pause"
  | "pause_timeout"
  | "en_attente_cloture"
  | "en_litige"
  | "cloturee_validee"
  | "cloturee_timeout"
  | "cloturee_auto";

export const STATUTS_TERMINAUX: readonly SessionStatus[] = [
  "refusee",
  "cloturee_validee",
  "cloturee_timeout",
  "cloturee_auto",
];

/** Les quatre scans que l'intérimaire peut émettre au cours d'une journée. */
export type ScanKind = "entree" | "depart_pause" | "retour_pause" | "sortie";

export type CtrlAutoFailure = keyof typeof MOTIFS_CTRL_AUTO;

export interface Pause {
  id: string;
  /** ISO. Horodatage serveur du scan « départ pause ». */
  debut: string;
  /** ISO. Absent tant que l'intérimaire n'est pas revenu. */
  fin?: string;
  /** ISO. Échéance de retour = début + timeout (recalculée si prolongation). */
  echeance: string;
  /** Minutes accordées en plus par le valideur (option B), cumulées. */
  prolongationMin: number;
  /** Vrai si la fin a été saisie manuellement par un valideur (option C). */
  retourManuel?: boolean;
  justification?: string;
}

/** Entrée du journal d'audit horodaté (panneau « LOG » du BPMN). */
export interface AuditEntry {
  id: string;
  /** ISO. */
  at: string;
  lane: Lane;
  message: string;
  tone: "neutre" | "ok" | "alerte";
  /** Auteur humain de l'action, si applicable. */
  par?: string;
}

export interface Session {
  id: string;
  interimaireId: string;
  site: string;
  /** ISO. Horodatage serveur du scan d'entrée (provisoire tant que non validé). */
  debut: string;
  /** ISO. Horodatage définitif figé à l'approbation du valideur. */
  ouvertureValideeA?: string;
  /** ISO. Fin de session, quelle qu'en soit la cause. */
  fin?: string;
  statut: SessionStatus;
  pauses: Pause[];
  /** Nom du valideur ayant approuvé l'ouverture. */
  valideParOuverture?: string;
  /** Nom du valideur ayant statué sur la clôture. */
  valideParCloture?: string;
  /** Motif obligatoire en cas de refus, d'anomalie ou de contrôle auto échoué. */
  motif?: string;
  /** Flag « À vérifier » : clôture non nominale, contrôle humain requis. */
  aVerifier: boolean;
  audit: AuditEntry[];
}

/* ── Vues calculées ────────────────────────────────────────────────────── */

/** Décomposition du temps payable : (fin − début) − Σ pauses. */
export interface DureeSession {
  /** Millisecondes écoulées entre l'ouverture et la fin (ou maintenant). */
  brutMs: number;
  /** Millisecondes cumulées de pause (les pauses en cours comptent). */
  pausesMs: number;
  /** Temps réel payable, jamais négatif. */
  netMs: number;
}

/**
 * Ce qui peut être scanné pour un intérimaire à cet instant précis.
 * Les libellés sont des **clés de traduction**, jamais du texte : la couche
 * métier ne connaît pas la langue de l'interface.
 */
export interface ScanDisponible {
  kind: ScanKind;
  /** Clé du libellé d'action (dictionnaire mobile). */
  libelleKey: string;
  /** Faux si l'action est visible mais bloquée (session en attente, par ex.). */
  actif: boolean;
  /** Clé de la raison du blocage, à afficher. */
  raisonKey?: string;
}
