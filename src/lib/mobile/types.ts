/**
 * Modèle de domaine du pointage des intérimaires.
 *
 * Deux processus s'enchaînent :
 *
 *  1. ONBOARDING — l'admin crée une société d'intérim, la société crée des
 *     profils intérimaires, l'admin les valide. Seul un profil `valide` peut
 *     travailler.
 *
 *  2. POINTAGE — le réceptionniste scanne le QR de l'intérimaire, le technicien
 *     est notifié puis valide la session. À la sortie, l'intérimaire déclare un
 *     motif : fin de journée (clôture) ou chantier / course (15 minutes de
 *     suspension, au-delà desquelles la session se ferme d'elle-même).
 */

import type { MOTIFS_CTRL_AUTO, MOTIFS_SORTIE, TYPES_ACTIVITE } from "./constants";

/* ── Acteurs ───────────────────────────────────────────────────────────── */

/** Couloirs du processus. Le couloir « Système » n'a pas d'écran : il agit seul. */
export type Lane = "interimaire" | "systeme" | "societe" | "valideur";

/**
 * Les cinq rôles de la plateforme.
 *
 * - `admin` — crée les sociétés, valide les profils, voit tous les sites.
 * - `societe` — société d'intérim : crée et soumet ses profils intérimaires.
 * - `receptionniste` — scanne les QR à l'accueil du site. Ne valide rien.
 * - `technicien` — reçoit les notifications et valide ouvertures et clôtures.
 * - `interimaire` — interface volontairement minimale (QR, session en cours).
 */
export type Role = "admin" | "societe" | "receptionniste" | "technicien" | "interimaire";

/** Rôles habilités à valider une session (couloir « valideur »). */
export const ROLES_VALIDEURS: readonly Role[] = ["technicien", "admin"];

export interface Compte {
  id: string;
  prenom: string;
  nom: string;
  role: Role;
  /** Site d'affectation. L'admin porte `TOUS_SITES`. */
  site: string;
  matricule: string;
  /** Renseigné pour le rôle `societe` : la société que le compte représente. */
  societeId?: string;
  /** Renseigné pour le rôle `interimaire` : le profil rattaché au compte. */
  interimaireId?: string;
}

/** @deprecated Conservé le temps de la migration des écrans mobiles. */
export type MobileRole = Role;
/** @deprecated Utiliser {@link Compte}. */
export type MobileAccount = Compte;

/** Portée d'un compte admin : aucune restriction de site. */
export const TOUS_SITES = "Tous les sites";

/* ── Société d'intérim ─────────────────────────────────────────────────── */

export type StatutSociete = "active" | "suspendue";

/**
 * Société d'intérim, créée par l'admin. Elle est le seul acteur autorisé à
 * saisir des profils intérimaires, et ne voit que les siens.
 */
export interface Societe {
  id: string;
  nom: string;
  siret: string;
  email: string;
  telephone: string;
  adresse: string;
  /** Interlocuteur unique côté société. */
  contactNom: string;
  /** Sites sur lesquels la société est habilitée à placer des intérimaires. */
  sites: string[];
  statut: StatutSociete;
  /** ISO. */
  creeLe: string;
  /** Nom de l'admin ayant créé le compte. */
  creePar: string;
}

/* ── Services et demandeurs ────────────────────────────────────────────── */

/**
 * Service interne de l'entreprise utilisatrice (production, maintenance…).
 * Un service regroupe les demandeurs habilités à réclamer un intérimaire, et
 * porte donc l'imputation analytique des heures.
 */
export interface Service {
  id: string;
  nom: string;
  /** Code analytique court, utilisé dans les exports. */
  code: string;
  responsable: string;
  site: string;
  actif: boolean;
}

/**
 * Personne qui demande un intérimaire. Toujours rattachée à un service :
 * c'est ce rattachement qui permet d'imputer les heures au bon budget.
 */
export interface Demandeur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  serviceId: string;
  /** Nom du service, dupliqué pour l'affichage (données mock). */
  serviceNom: string;
  actif: boolean;
}

export function nomDemandeur(d: Pick<Demandeur, "prenom" | "nom">): string {
  return `${d.prenom} ${d.nom}`;
}

/* ── Disponibilité des techniciens ─────────────────────────────────────── */

/**
 * Déclaration de présence d'un technicien sur un site.
 *
 * C'est elle qui détermine qui est notifié d'un scan : un technicien non
 * déclaré ne reçoit rien. Une déclaration close (`jusqu` renseigné) reste
 * dans l'historique plutôt que d'être supprimée, pour rester auditable.
 */
export interface DisponibiliteTechnicien {
  id: string;
  technicienId: string;
  /** Nom complet du technicien, dupliqué pour l'affichage. */
  technicienNom: string;
  site: string;
  /** ISO. Début de la période de disponibilité. */
  depuis: string;
  /** ISO. Absent tant que le technicien est disponible. */
  jusqu?: string;
  /** Motif de fin de disponibilité, s'il a été précisé. */
  motifFin?: string;
}

/** Une disponibilité est en cours tant qu'elle n'a pas été close. */
export function estDisponible(d: DisponibiliteTechnicien): boolean {
  return !d.jusqu;
}

/* ── Profil intérimaire ────────────────────────────────────────────────── */

/** Nature du travail confié à l'intérimaire. */
export type TypeActivite = keyof typeof TYPES_ACTIVITE;

/**
 * Cycle de vie d'un profil, du brouillon société à la validation admin.
 * Seul `valide` ouvre le droit de scanner.
 */
export type StatutProfil =
  | "brouillon"
  | "en_attente_validation"
  | "valide"
  | "refuse"
  | "suspendu";

/** Clé d'un document du dossier (voir `DOCUMENTS_REQUIS`). */
export type DocumentCle = "cin" | "assurance" | "contrat" | "medical";

export interface InterimaireProfil {
  id: string;
  prenom: string;
  nom: string;
  cin: string;
  telephone: string;
  /** Société d'intérim propriétaire du profil. */
  societeId: string;
  /** Nom de la société, dupliqué pour l'affichage (données mock). */
  agence: string;
  fonction: string;
  /** Nature du travail confié : caractérise le profil et ventile ses heures. */
  typeActivite: TypeActivite;
  site: string;
  /** Initiales affichées à défaut de photo (données mock). */
  initiales: string;
  assuranceValideJusqu: string;
  contratFin: string;

  /* — Validation administrative — */
  statutProfil: StatutProfil;
  /** Documents fournis par la société. */
  documents: DocumentCle[];
  /** ISO. Date de soumission à l'admin. */
  soumisLe?: string;
  /** ISO. Date de décision de l'admin. */
  statueLe?: string;
  /** Nom de l'admin ayant statué. */
  statuePar?: string;
  /** Obligatoire en cas de refus ou de suspension. */
  motifRefus?: string;
}

/** Un profil ne peut pointer que s'il a été validé par l'administrateur. */
export function peutTravailler(profil: InterimaireProfil): boolean {
  return profil.statutProfil === "valide";
}

/* ── Cycle de vie d'une session ────────────────────────────────────────── */

/**
 * Statuts d'une session. L'ordre reflète le fil du processus.
 * Les statuts `cloturee_*` et `refusee` sont terminaux.
 */
export type SessionStatus =
  | "en_attente_ouverture"
  | "refusee"
  | "ouverte"
  | "en_pause"
  | "pause_timeout"
  | "sortie_temporaire"
  | "en_attente_cloture"
  | "en_litige"
  | "cloturee_validee"
  | "cloturee_timeout"
  | "cloturee_sortie_depassee"
  | "cloturee_auto";

export const STATUTS_TERMINAUX: readonly SessionStatus[] = [
  "refusee",
  "cloturee_validee",
  "cloturee_timeout",
  "cloturee_sortie_depassee",
  "cloturee_auto",
];

/** Les scans que l'intérimaire peut émettre au cours d'une journée. */
export type ScanKind =
  | "entree"
  | "depart_pause"
  | "retour_pause"
  | "sortie_temporaire"
  | "retour_sortie"
  | "sortie";

export type CtrlAutoFailure = keyof typeof MOTIFS_CTRL_AUTO;

/** Motif déclaré par l'intérimaire au scan de sortie. */
export type MotifSortie = keyof typeof MOTIFS_SORTIE;

/** Les deux motifs qui suspendent la session au lieu de la clore. */
export type MotifSortieTemporaire = Exclude<MotifSortie, "fin_journee">;

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

/**
 * Sortie temporaire déclarée par l'intérimaire (chantier ou course).
 * La session reste ouverte, mais le compte à rebours de 15 minutes court :
 * en cas de dépassement, le système ferme la session sans intervention humaine.
 */
export interface SortieTemporaire {
  id: string;
  motif: MotifSortieTemporaire;
  /** ISO. Horodatage du scan de sortie. */
  debut: string;
  /** ISO. Absent tant que l'intérimaire n'est pas revenu. */
  fin?: string;
  /** ISO. Échéance de retour = début + 15 min. */
  echeance: string;
  /** Vrai si l'échéance a été dépassée : la session a été fermée d'office. */
  depassee?: boolean;
  /** Précision libre saisie au scan (« chantier Nord », « pièce détachée »…). */
  precision?: string;
  /**
   * Site rejoint le temps de la sortie, s'il diffère du site de la session.
   *
   * Cas rare. Il ne modifie **pas** le site de facturation : un retour dans les
   * 15 minutes laisse l'intégralité de la session imputée au site de départ.
   * Voir {@link Session.siteFacturation}.
   */
  siteDestination?: string;
}

/** Entrée du journal d'audit horodaté. */
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
  /** Site où le scan d'entrée a eu lieu. */
  site: string;
  /**
   * Site sur lequel les heures sont imputées.
   *
   * Vaut toujours le site de départ : même si l'intérimaire rejoint un autre
   * site pendant une sortie chantier, un retour dans les 15 minutes laisse
   * toute la session comptabilisée ici. C'est la règle du site de départ.
   */
  siteFacturation: string;
  /** Demandeur affecté par le technicien au moment de la validation. */
  demandeurId?: string;
  /** Nom du demandeur et de son service, figés à l'affectation (données mock). */
  demandeurNom?: string;
  serviceNom?: string;
  /** ISO. Horodatage serveur du scan d'entrée (provisoire tant que non validé). */
  debut: string;
  /** ISO. Horodatage définitif figé à l'approbation du valideur. */
  ouvertureValideeA?: string;
  /** ISO. Fin de session, quelle qu'en soit la cause. */
  fin?: string;
  statut: SessionStatus;
  pauses: Pause[];
  /** Sorties chantier / course déclarées au cours de la journée. */
  sorties: SortieTemporaire[];
  /** Nom du technicien ayant approuvé l'ouverture. */
  valideParOuverture?: string;
  /** Nom du technicien ayant statué sur la clôture. */
  valideParCloture?: string;
  /** Motif obligatoire en cas de refus, d'anomalie ou de contrôle auto échoué. */
  motif?: string;
  /** Flag « À vérifier » : clôture non nominale, contrôle humain requis. */
  aVerifier: boolean;
  audit: AuditEntry[];
}

/* ── Notifications ─────────────────────────────────────────────────────── */

/**
 * Événements poussés vers un rôle. Le technicien est le principal destinataire :
 * c'est lui qui est prévenu dès qu'un réceptionniste a scanné un QR.
 */
export type NotificationKind =
  | "ouverture_a_valider"
  | "cloture_a_valider"
  | "pause_timeout"
  | "sortie_depassee"
  | "profil_a_valider"
  | "profil_statue";

export interface Notification {
  id: string;
  kind: NotificationKind;
  /** Rôle destinataire : la notification n'est visible que par lui. */
  destinataire: Role;
  /** Site concerné, pour le cloisonnement. `TOUS_SITES` = tous. */
  site: string;
  /** ISO. */
  at: string;
  titre: string;
  detail: string;
  lue: boolean;
  sessionId?: string;
  interimaireId?: string;
  societeId?: string;
}

/* ── Vues calculées ────────────────────────────────────────────────────── */

/** Décomposition du temps payable : (fin − début) − Σ pauses − Σ sorties. */
export interface DureeSession {
  /** Millisecondes écoulées entre l'ouverture et la fin (ou maintenant). */
  brutMs: number;
  /** Millisecondes cumulées de pause (les pauses en cours comptent). */
  pausesMs: number;
  /** Millisecondes cumulées de sortie temporaire. */
  sortiesMs: number;
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
