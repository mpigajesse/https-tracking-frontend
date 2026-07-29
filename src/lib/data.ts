/**
 * Les cinq rôles de la plateforme, dans l'ordre du flux :
 * l'admin crée les sociétés d'intérim, la société crée ses profils, l'admin les
 * valide, le réceptionniste scanne, le technicien valide la session.
 */
export type UserRole = 'admin' | 'societe' | 'technicien' | 'receptionniste' | 'interimaire';

export type SessionStatus =
  | 'en_attente_ouverture'
  | 'ouverte'
  | 'sortie_temporaire'
  | 'en_attente_fermeture'
  | 'fermee'
  | 'cloturee_auto'
  | 'cloturee_sortie_depassee'
  | 'en_litige'
  | 'annulee';

export type QRStatus = 'actif' | 'expire' | 'revoque';

export type AlertType =
  | 'non_cloturee'
  | 'depassement_48h'
  | 'en_litige'
  | 'sortie_depassee'
  | 'profil_a_valider';

/** Cycle de vie d'un profil intérimaire, de la saisie société à la validation admin. */
export type StatutProfil =
  | 'brouillon'
  | 'en_attente_validation'
  | 'valide'
  | 'refuse'
  | 'suspendu';

/** Motif déclaré par l'intérimaire au moment du scan de sortie. */
export type MotifSortie = 'fin_journee' | 'chantier' | 'course';

/** Durée maximale d'une sortie chantier ou course, en minutes. */
export const SORTIE_TEMP_TIMEOUT_MIN = 15;

/**
 * Nature du travail confié à l'intérimaire. Caractérise le profil et se
 * retrouve sur ses sessions, ce qui permet de ventiler les heures par activité
 * et non seulement par site.
 */
export const TYPES_ACTIVITE = {
  production: 'Production',
  maintenance: 'Maintenance',
  logistique: 'Logistique',
  nettoyage: 'Nettoyage',
  manutention: 'Manutention',
  chantier: 'Chantier',
  administratif: 'Administratif',
} as const;

export type TypeActivite = keyof typeof TYPES_ACTIVITE;

/* ── Services et demandeurs ───────────────────────────────────────────── */

/**
 * Service interne de l'entreprise utilisatrice. Regroupe les demandeurs
 * habilités à réclamer un intérimaire, et porte l'imputation des heures.
 */
export interface Service {
  id: string;
  nom: string;
  /** Code analytique court, utilisé dans les exports. */
  code: string;
  responsable: string;
  site: string;
  actif: boolean;
  createdAt: string;
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
  /** Nom du service, dupliqué pour l'affichage. */
  serviceNom: string;
  actif: boolean;
  createdAt: string;
}

/* ── Disponibilité des techniciens ────────────────────────────────────── */

/**
 * Déclaration de présence d'un technicien sur un site. Elle détermine qui est
 * notifié d'un scan : un technicien non déclaré ne reçoit rien.
 */
export interface DisponibiliteTechnicien {
  id: string;
  technicienId: string;
  technicienNom: string;
  site: string;
  /** ISO. */
  depuis: string;
  /** ISO. Absent tant que le technicien est disponible. */
  jusqu?: string;
  motifFin?: string;
}

export const MOTIFS_INDISPONIBILITE = [
  'Fin de service',
  'En intervention',
  'Congé',
  'Formation',
] as const;

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  site: string;
  statut: 'actif' | 'inactif';
  avatar?: string;
  createdAt: string;
  /** Renseigné pour le rôle `societe` : la société que le compte représente. */
  societeId?: string;
  /** Renseigné pour le rôle `interimaire` : le profil rattaché. */
  interimaireId?: string;
}

/* ── Sociétés d'intérim ───────────────────────────────────────────────── */

export type StatutSociete = 'active' | 'suspendue';

/**
 * Société d'intérim créée par l'admin. Seul acteur autorisé à saisir des
 * profils intérimaires, et ne voit que les siens.
 */
export interface Societe {
  id: string;
  nom: string;
  siret: string;
  email: string;
  telephone: string;
  adresse: string;
  contactNom: string;
  /** Sites sur lesquels la société est habilitée à placer des intérimaires. */
  sites: string[];
  statut: StatutSociete;
  createdAt: string;
  createdBy: string;
  /** Nombre d'intérimaires actuellement validés (dérivé, pour l'affichage). */
  nbInterimaires: number;
}

/** Documents attendus dans un dossier intérimaire avant validation admin. */
export const DOCUMENTS_REQUIS = [
  { cle: 'cin', libelle: "Pièce d'identité (CIN)" },
  { cle: 'assurance', libelle: "Attestation d'assurance" },
  { cle: 'contrat', libelle: 'Contrat de mission' },
  { cle: 'medical', libelle: 'Visite médicale' },
] as const;

export type DocumentCle = (typeof DOCUMENTS_REQUIS)[number]['cle'];

export interface Interimaire {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  /** Société d'intérim propriétaire du profil. */
  societeId: string;
  /** Nom de la société, dupliqué pour l'affichage. */
  agence: string;
  fonction: string;
  /** Nature du travail confié : caractérise le profil et ventile ses heures. */
  typeActivite: TypeActivite;
  site: string;
  dateDebut: string;
  dateFin: string;
  statut: 'actif' | 'inactif' | 'en_mission';
  photo?: string;
  qrStatus: QRStatus;
  qrToken?: string;
  totalHeures: number;

  /* — Validation administrative — */
  statutProfil: StatutProfil;
  documents: DocumentCle[];
  soumisLe?: string;
  statueLe?: string;
  statuePar?: string;
  motifRefus?: string;
}

/** Un profil ne peut pointer que s'il a été validé par l'administrateur. */
export function peutTravailler(i: Pick<Interimaire, 'statutProfil'>): boolean {
  return i.statutProfil === 'valide';
}

/** Les documents encore absents du dossier. */
export function documentsManquants(i: Pick<Interimaire, 'documents'>): DocumentCle[] {
  return DOCUMENTS_REQUIS.filter((d) => !i.documents.includes(d.cle)).map((d) => d.cle);
}

export interface Session {
  id: string;
  interimaire: string;
  interimaireNom: string;
  interimairePhoto?: string;
  /** Site où le scan d'entrée a eu lieu. */
  site: string;
  /**
   * Site sur lequel les heures sont imputées — toujours le site de départ.
   * Un changement de site pendant une sortie de moins de 15 minutes ne le
   * modifie pas : c'est la règle du site de départ.
   */
  siteFacturation?: string;
  fonction: string;
  typeActivite?: TypeActivite;
  /** Demandeur affecté par le technicien au moment de la validation. */
  demandeurId?: string;
  demandeurNom?: string;
  serviceNom?: string;
  heureDebut: string;
  heureFin?: string;
  duree?: number;
  statut: SessionStatus;
  /** Technicien ayant validé l'ouverture ou la clôture. */
  validatedBy?: string;
  createdAt: string;
  /** Motif de la dernière sortie déclarée. */
  motifSortie?: MotifSortie;
  /** ISO. Début de la sortie temporaire en cours, s'il y en a une. */
  sortieDebut?: string;
  /** ISO. Échéance de retour = début + 15 min. */
  sortieEcheance?: string;
  /** Précision libre saisie au scan de sortie. */
  sortiePrecision?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  interimaireNom: string;
  site: string;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

export const SITES = ['Site Casablanca', 'Site Rabat', 'Site Tanger', 'Site Fès', 'Site Marrakech'];
export const AGENCES = ['TempoPro', 'InterWork', 'FlexiStaff', 'ProIntérim', 'StaffPlus'];
export const FONCTIONS = ['Opérateur', 'Technicien', 'Chef d\'équipe', 'Magasinier', 'Conducteur'];

export type SiteStatut = 'actif' | 'maintenance' | 'ferme';

export interface Site {
  id: string;
  nom: string;
  ville: string;
  adresse: string;
  responsable: string;
  telephone: string;
  email: string;
  capaciteMax: number;
  statut: SiteStatut;
  createdAt: string;
  superficie?: string;
  secteur: string;
}

export const mockSites: Site[] = [
  { id: 'site1', nom: 'Site Casablanca', ville: 'Casablanca', adresse: 'Zone Industrielle Ain Sebaa, Lot 12', responsable: 'Karim Benali', telephone: '05 22 34 56 78', email: 'casablanca@pointage.ma', capaciteMax: 60, statut: 'actif', createdAt: '2023-01-10', superficie: '4 200 m²', secteur: 'Industrie' },
  { id: 'site2', nom: 'Site Rabat', ville: 'Rabat', adresse: 'Parc Industriel Technopolis, Bât. B', responsable: 'Fatima Alaoui', telephone: '05 37 78 90 12', email: 'rabat@pointage.ma', capaciteMax: 45, statut: 'actif', createdAt: '2023-03-15', superficie: '3 100 m²', secteur: 'Logistique' },
  { id: 'site3', nom: 'Site Tanger', ville: 'Tanger', adresse: 'Tanger Med Zone Franche, Lot 7', responsable: 'Hassan Chraibi', telephone: '05 39 45 67 89', email: 'tanger@pointage.ma', capaciteMax: 35, statut: 'actif', createdAt: '2023-05-20', superficie: '2 800 m²', secteur: 'Export' },
  { id: 'site4', nom: 'Site Fès', ville: 'Fès', adresse: 'Zone Industrielle Sidi Brahim, Rue 4', responsable: 'Leila Berrada', telephone: '05 35 60 23 45', email: 'fes@pointage.ma', capaciteMax: 30, statut: 'maintenance', createdAt: '2023-07-01', superficie: '2 200 m²', secteur: 'Textile' },
  { id: 'site5', nom: 'Site Marrakech', ville: 'Marrakech', adresse: 'Zone Industrielle M\'Hamid, Secteur 3', responsable: 'Abdelaziz Filali', telephone: '05 24 44 55 66', email: 'marrakech@pointage.ma', capaciteMax: 40, statut: 'actif', createdAt: '2023-09-12', superficie: '3 500 m²', secteur: 'Agroalimentaire' },
];

export const mockServices: Service[] = [
  { id: 'sv1', nom: 'Production', code: 'PROD', responsable: 'Fatima Alaoui', site: 'Site Casablanca', actif: true, createdAt: '2026-01-05' },
  { id: 'sv2', nom: 'Maintenance', code: 'MAINT', responsable: 'Youssef Ouali', site: 'Site Casablanca', actif: true, createdAt: '2026-01-05' },
  { id: 'sv3', nom: 'Logistique', code: 'LOG', responsable: 'Nadia Tazi', site: 'Site Casablanca', actif: true, createdAt: '2026-01-08' },
  { id: 'sv4', nom: 'Qualité', code: 'QUAL', responsable: 'Samir Bennis', site: 'Site Rabat', actif: true, createdAt: '2026-02-11' },
  { id: 'sv5', nom: 'Travaux neufs', code: 'TN', responsable: 'Hicham Draoui', site: 'Site Casablanca', actif: false, createdAt: '2026-03-02' },
];

export const mockDemandeurs: Demandeur[] = [
  { id: 'dm1', prenom: 'Fatima', nom: 'Alaoui', email: 'f.alaoui@lear.ma', telephone: '06 61 20 30 40', serviceId: 'sv1', serviceNom: 'Production', actif: true, createdAt: '2026-01-06' },
  { id: 'dm2', prenom: 'Mehdi', nom: 'Sabri', email: 'm.sabri@lear.ma', telephone: '06 62 31 41 51', serviceId: 'sv1', serviceNom: 'Production', actif: true, createdAt: '2026-01-06' },
  { id: 'dm3', prenom: 'Youssef', nom: 'Ouali', email: 'y.ouali@lear.ma', telephone: '06 63 42 52 62', serviceId: 'sv2', serviceNom: 'Maintenance', actif: true, createdAt: '2026-01-07' },
  { id: 'dm4', prenom: 'Nadia', nom: 'Tazi', email: 'n.tazi@lear.ma', telephone: '06 64 53 63 73', serviceId: 'sv3', serviceNom: 'Logistique', actif: true, createdAt: '2026-01-09' },
  { id: 'dm5', prenom: 'Samir', nom: 'Bennis', email: 's.bennis@lear.ma', telephone: '06 65 64 74 84', serviceId: 'sv4', serviceNom: 'Qualité', actif: true, createdAt: '2026-02-12' },
  { id: 'dm6', prenom: 'Hicham', nom: 'Draoui', email: 'h.draoui@lear.ma', serviceId: 'sv5', serviceNom: 'Travaux neufs', actif: false, createdAt: '2026-03-03' },
];

/**
 * Un seul technicien déclaré : le site de Rabat reste volontairement découvert,
 * pour rendre visible le cas « aucun technicien sur ce site ».
 */
export const mockDisponibilites: DisponibiliteTechnicien[] = [
  { id: 'dp1', technicienId: 'u2', technicienNom: 'Fatima Alaoui', site: 'Site Casablanca', depuis: '2026-07-28T06:00:00' },
  { id: 'dp0', technicienId: 'u5', technicienNom: 'Youssef Ouali', site: 'Site Tanger', depuis: '2026-07-27T06:00:00', jusqu: '2026-07-27T18:00:00', motifFin: 'Fin de service' },
];

export function trouveService(id: string): Service | undefined {
  return mockServices.find((s) => s.id === id);
}

/** Demandeurs affectables : actifs, et dont le service l'est aussi. */
export function demandeursAffectables(serviceId?: string): Demandeur[] {
  return mockDemandeurs.filter((d) => {
    if (!d.actif) return false;
    if (serviceId && d.serviceId !== serviceId) return false;
    return trouveService(d.serviceId)?.actif ?? false;
  });
}

export const mockSocietes: Societe[] = [
  { id: 'so1', nom: 'TempoPro', siret: '84291056700018', email: 'contact@tempopro.ma', telephone: '05 22 45 12 90', adresse: '12 rue des Oudayas, Casablanca', contactNom: 'Rachid Lemseffer', sites: ['Site Casablanca', 'Site Rabat'], statut: 'active', createdAt: '2026-01-12', createdBy: 'Karim Benali', nbInterimaires: 3 },
  { id: 'so2', nom: 'InterWork', siret: '51730948200025', email: 'rh@interwork.ma', telephone: '05 37 66 03 41', adresse: 'Parc Technopolis, Rabat', contactNom: 'Salma Idrissi', sites: ['Site Rabat'], statut: 'active', createdAt: '2026-02-03', createdBy: 'Karim Benali', nbInterimaires: 1 },
  { id: 'so3', nom: 'FlexiStaff', siret: '39028471600037', email: 'admin@flexistaff.ma', telephone: '05 39 22 78 55', adresse: 'Zone franche, Tanger', contactNom: 'Younes Haddad', sites: ['Site Tanger'], statut: 'suspendue', createdAt: '2026-03-20', createdBy: 'Karim Benali', nbInterimaires: 1 },
  { id: 'so4', nom: 'ProIntérim', siret: '72019384500044', email: 'contact@prointerim.ma', telephone: '05 35 60 11 22', adresse: 'Sidi Brahim, Fès', contactNom: 'Meriem Fassi', sites: ['Site Fès'], statut: 'active', createdAt: '2026-04-08', createdBy: 'Karim Benali', nbInterimaires: 1 },
  { id: 'so5', nom: 'StaffPlus', siret: '65483920100051', email: 'rh@staffplus.ma', telephone: '05 24 44 90 33', adresse: "M'Hamid, Marrakech", contactNom: 'Othmane Rami', sites: ['Site Marrakech'], statut: 'active', createdAt: '2026-05-19', createdBy: 'Karim Benali', nbInterimaires: 1 },
];

export const mockUsers: User[] = [
  { id: 'u1', nom: 'Benali', prenom: 'Karim', email: 'admin@pointage.ma', role: 'admin', site: 'Tous', statut: 'actif', createdAt: '2024-01-15' },
  { id: 'u2', nom: 'Alaoui', prenom: 'Fatima', email: 'tech@pointage.ma', role: 'technicien', site: 'Site Casablanca', statut: 'actif', createdAt: '2024-02-10' },
  { id: 'u3', nom: 'Chraibi', prenom: 'Hassan', email: 'recep@pointage.ma', role: 'receptionniste', site: 'Site Casablanca', statut: 'actif', createdAt: '2024-03-05' },
  { id: 'u4', nom: 'El Amrani', prenom: 'Mohamed', email: 'interim@pointage.ma', role: 'interimaire', site: 'Site Casablanca', statut: 'actif', createdAt: '2024-04-20', interimaireId: 'i1' },
  { id: 'u5', nom: 'Ouali', prenom: 'Youssef', email: 'tech2@pointage.ma', role: 'technicien', site: 'Site Tanger', statut: 'actif', createdAt: '2024-05-01' },
  { id: 'u6', nom: 'Tazi', prenom: 'Nadia', email: 'recep2@pointage.ma', role: 'receptionniste', site: 'Site Fès', statut: 'inactif', createdAt: '2024-05-15' },
  { id: 'u7', nom: 'Lemseffer', prenom: 'Rachid', email: 'societe@pointage.ma', role: 'societe', site: 'Tous', statut: 'actif', createdAt: '2026-01-12', societeId: 'so1' },
  { id: 'u8', nom: 'Idrissi', prenom: 'Salma', email: 'societe2@pointage.ma', role: 'societe', site: 'Tous', statut: 'actif', createdAt: '2026-02-03', societeId: 'so2' },
];

const DOCS_COMPLETS: DocumentCle[] = ['cin', 'assurance', 'contrat', 'medical'];

export const mockInterimaires: Interimaire[] = [
  { id: 'i1', nom: 'El Amrani', prenom: 'Mohamed', cin: 'AB123456', email: 'melamrani@gmail.com', telephone: '06 12 34 56 78', societeId: 'so1', agence: 'TempoPro', fonction: 'Opérateur', typeActivite: 'production', site: 'Site Casablanca', dateDebut: '2026-01-01', dateFin: '2026-12-31', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-001-2026', totalHeures: 342, statutProfil: 'valide', documents: DOCS_COMPLETS, soumisLe: '2026-01-15', statueLe: '2026-01-16', statuePar: 'Karim Benali' },
  { id: 'i2', nom: 'Bakkali', prenom: 'Aicha', cin: 'CD789012', email: 'abakkali@gmail.com', telephone: '06 98 76 54 32', societeId: 'so2', agence: 'InterWork', fonction: 'Technicien', typeActivite: 'maintenance', site: 'Site Rabat', dateDebut: '2026-02-01', dateFin: '2026-08-31', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-002-2026', totalHeures: 218, statutProfil: 'valide', documents: DOCS_COMPLETS, soumisLe: '2026-02-05', statueLe: '2026-02-06', statuePar: 'Karim Benali' },
  { id: 'i3', nom: 'Qasimi', prenom: 'Omar', cin: 'EF345678', email: 'oqasimi@gmail.com', telephone: '06 11 22 33 44', societeId: 'so3', agence: 'FlexiStaff', fonction: 'Magasinier', typeActivite: 'logistique', site: 'Site Tanger', dateDebut: '2026-03-15', dateFin: '2026-09-15', statut: 'en_mission', qrStatus: 'expire', totalHeures: 156, statutProfil: 'valide', documents: DOCS_COMPLETS, soumisLe: '2026-03-22', statueLe: '2026-03-23', statuePar: 'Karim Benali' },
  { id: 'i4', nom: 'Berrada', prenom: 'Leila', cin: 'GH901234', email: 'lberrada@gmail.com', telephone: '06 55 66 77 88', societeId: 'so4', agence: 'ProIntérim', fonction: 'Chef d\'équipe', typeActivite: 'production', site: 'Site Fès', dateDebut: '2025-11-01', dateFin: '2026-05-31', statut: 'actif', qrStatus: 'actif', totalHeures: 589, statutProfil: 'valide', documents: DOCS_COMPLETS, soumisLe: '2025-11-02', statueLe: '2025-11-03', statuePar: 'Karim Benali' },
  { id: 'i5', nom: 'Filali', prenom: 'Abdelaziz', cin: 'IJ567890', email: 'afilali@gmail.com', telephone: '06 99 88 77 66', societeId: 'so5', agence: 'StaffPlus', fonction: 'Conducteur', typeActivite: 'logistique', site: 'Site Marrakech', dateDebut: '2026-01-15', dateFin: '2026-07-15', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-005-2026', totalHeures: 402, statutProfil: 'valide', documents: DOCS_COMPLETS, soumisLe: '2026-01-20', statueLe: '2026-01-21', statuePar: 'Karim Benali' },
  { id: 'i6', nom: 'Cherkaoui', prenom: 'Zineb', cin: 'KL123456', email: 'zcherkaoui@gmail.com', telephone: '06 44 55 66 77', societeId: 'so1', agence: 'TempoPro', fonction: 'Opérateur', typeActivite: 'production', site: 'Site Casablanca', dateDebut: '2026-04-01', dateFin: '2026-10-01', statut: 'inactif', qrStatus: 'revoque', totalHeures: 45, statutProfil: 'suspendu', documents: DOCS_COMPLETS, soumisLe: '2026-04-02', statueLe: '2026-07-15', statuePar: 'Karim Benali', motifRefus: "Attestation d'assurance expirée le 01/07/2026" },

  /* — Dossiers en cours d'instruction : alimentent l'écran de validation admin — */
  { id: 'i7', nom: 'Naciri', prenom: 'Youssef', cin: 'MN654321', email: 'ynaciri@gmail.com', telephone: '06 21 43 65 87', societeId: 'so1', agence: 'TempoPro', fonction: 'Opérateur', typeActivite: 'production', site: 'Site Casablanca', dateDebut: '2026-08-01', dateFin: '2026-11-30', statut: 'inactif', qrStatus: 'revoque', totalHeures: 0, statutProfil: 'en_attente_validation', documents: DOCS_COMPLETS, soumisLe: '2026-07-26' },
  { id: 'i8', nom: 'Squalli', prenom: 'Nadia', cin: 'OP112233', email: 'nsqualli@gmail.com', telephone: '06 33 22 11 00', societeId: 'so2', agence: 'InterWork', fonction: 'Magasinier', typeActivite: 'logistique', site: 'Site Rabat', dateDebut: '2026-08-01', dateFin: '2026-12-15', statut: 'inactif', qrStatus: 'revoque', totalHeures: 0, statutProfil: 'en_attente_validation', documents: DOCS_COMPLETS, soumisLe: '2026-07-27' },

  /* — Brouillon incomplet : la société ne peut pas encore le soumettre — */
  { id: 'i9', nom: 'Tahiri', prenom: 'Anas', cin: 'QR445566', email: 'atahiri@gmail.com', telephone: '06 77 88 99 00', societeId: 'so1', agence: 'TempoPro', fonction: 'Conducteur', typeActivite: 'logistique', site: 'Site Casablanca', dateDebut: '2026-09-01', dateFin: '2027-01-31', statut: 'inactif', qrStatus: 'revoque', totalHeures: 0, statutProfil: 'brouillon', documents: ['cin', 'contrat'] },

  /* — Dossier refusé : la société doit le corriger — */
  { id: 'i10', nom: 'Bennani', prenom: 'Salma', cin: 'ST778899', email: 'sbennani@gmail.com', telephone: '06 10 20 30 40', societeId: 'so1', agence: 'TempoPro', fonction: 'Opérateur', typeActivite: 'production', site: 'Site Casablanca', dateDebut: '2026-08-15', dateFin: '2026-10-31', statut: 'inactif', qrStatus: 'revoque', totalHeures: 0, statutProfil: 'refuse', documents: DOCS_COMPLETS, soumisLe: '2026-07-20', statueLe: '2026-07-21', statuePar: 'Karim Benali', motifRefus: "Attestation d'assurance manquante" },
];

/** Les profils d'une société donnée. */
export function interimairesDeSociete(societeId: string): Interimaire[] {
  return mockInterimaires.filter((i) => i.societeId === societeId);
}

export function trouveSociete(id: string): Societe | undefined {
  return mockSocietes.find((s) => s.id === id);
}

export const mockSessions: Session[] = [
  { id: 's0', interimaire: 'i4', interimaireNom: 'Leila Berrada', site: 'Site Fès', fonction: 'Chef d\'équipe', typeActivite: 'production', heureDebut: '2026-02-18T07:45:00', statut: 'sortie_temporaire', createdAt: '2026-02-18T07:45:00', validatedBy: 'Youssef Ouali', motifSortie: 'chantier', sortieDebut: '2026-02-18T10:12:00', sortieEcheance: '2026-02-18T10:27:00', sortiePrecision: 'Chantier Nord — bâtiment C' },
  { id: 's1', interimaire: 'i1', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', fonction: 'Opérateur', typeActivite: 'production', heureDebut: '2026-02-18T08:00:00', statut: 'en_attente_fermeture', createdAt: '2026-02-18T08:00:00', validatedBy: 'Fatima Alaoui', motifSortie: 'fin_journee' },
  { id: 's2', interimaire: 'i2', interimaireNom: 'Aicha Bakkali', site: 'Site Rabat', fonction: 'Technicien', typeActivite: 'maintenance', heureDebut: '2026-02-18T07:30:00', statut: 'en_attente_fermeture', createdAt: '2026-02-18T07:30:00' },
  { id: 's3', interimaire: 'i5', interimaireNom: 'Abdelaziz Filali', site: 'Site Marrakech', fonction: 'Conducteur', typeActivite: 'logistique', heureDebut: '2026-02-18T06:00:00', statut: 'en_attente_ouverture', createdAt: '2026-02-18T06:00:00' },
  { id: 's4', interimaire: 'i4', interimaireNom: 'Leila Berrada', site: 'Site Fès', fonction: 'Chef d\'équipe', typeActivite: 'production', heureDebut: '2026-02-17T08:00:00', heureFin: '2026-02-17T17:00:00', duree: 9, statut: 'fermee', createdAt: '2026-02-17T08:00:00' },
  { id: 's5', interimaire: 'i3', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', fonction: 'Magasinier', typeActivite: 'logistique', heureDebut: '2026-02-15T08:00:00', statut: 'en_litige', createdAt: '2026-02-15T08:00:00' },
  { id: 's6', interimaire: 'i1', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', fonction: 'Opérateur', typeActivite: 'production', heureDebut: '2026-02-17T08:00:00', heureFin: '2026-02-17T16:30:00', duree: 8.5, statut: 'fermee', createdAt: '2026-02-17T08:00:00', validatedBy: 'Fatima Alaoui' },
  // Sortie chantier non honorée : le système a fermé la session au bout de 15 min.
  { id: 's7', interimaire: 'i2', interimaireNom: 'Aicha Bakkali', site: 'Site Rabat', fonction: 'Technicien', typeActivite: 'maintenance', heureDebut: '2026-02-17T07:30:00', heureFin: '2026-02-17T13:05:00', duree: 5.58, statut: 'cloturee_sortie_depassee', createdAt: '2026-02-17T07:30:00', motifSortie: 'course', sortieDebut: '2026-02-17T13:05:00', sortieEcheance: '2026-02-17T13:20:00' },
];

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'non_cloturee', message: 'Session non clôturée depuis plus de 12h', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', createdAt: '2026-02-17T20:00:00', severity: 'high' },
  { id: 'a2', type: 'depassement_48h', message: 'Dépassement 48h hebdomadaire détecté', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', createdAt: '2026-02-17T18:00:00', severity: 'medium' },
  { id: 'a3', type: 'en_litige', message: 'Session en litige - validation requise', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', createdAt: '2026-02-15T10:00:00', severity: 'high' },
  { id: 'a4', type: 'non_cloturee', message: 'Session ouverte sans validation du technicien', interimaireNom: 'Zineb Cherkaoui', site: 'Site Casablanca', createdAt: '2026-02-18T09:00:00', severity: 'medium' },
  { id: 'a5', type: 'sortie_depassee', message: 'Sortie course non honorée sous 15 min — session fermée automatiquement', interimaireNom: 'Aicha Bakkali', site: 'Site Rabat', createdAt: '2026-02-17T13:20:00', severity: 'high' },
  { id: 'a6', type: 'profil_a_valider', message: 'Deux dossiers intérimaires en attente de validation', interimaireNom: 'Youssef Naciri', site: 'Site Casablanca', createdAt: '2026-07-27T09:15:00', severity: 'medium' },
];

export const chartDataHeures = [
  { date: '12 Fév', heures: 245, cout: 3675 },
  { date: '13 Fév', heures: 312, cout: 4680 },
  { date: '14 Fév', heures: 289, cout: 4335 },
  { date: '15 Fév', heures: 198, cout: 2970 },
  { date: '16 Fév', heures: 156, cout: 2340 },
  { date: '17 Fév', heures: 340, cout: 5100 },
  { date: '18 Fév', heures: 287, cout: 4305 },
];

export const chartDataSites = [
  { site: 'Casablanca', heures: 1240, interimaires: 45 },
  { site: 'Rabat', heures: 980, interimaires: 38 },
  { site: 'Tanger', heures: 750, interimaires: 29 },
  { site: 'Fès', heures: 620, interimaires: 24 },
  { site: 'Marrakech', heures: 890, interimaires: 33 },
];

export const chartDataAgences = [
  { name: 'TempoPro', value: 35 },
  { name: 'InterWork', value: 25 },
  { name: 'FlexiStaff', value: 18 },
  { name: 'ProIntérim', value: 14 },
  { name: 'StaffPlus', value: 8 },
];

export const heatmapData = [
  { hour: '06h', lun: 12, mar: 15, mer: 10, jeu: 18, ven: 8, sam: 5, dim: 2 },
  { hour: '07h', lun: 45, mar: 52, mer: 48, jeu: 55, ven: 40, sam: 20, dim: 5 },
  { hour: '08h', lun: 85, mar: 92, mer: 88, jeu: 95, ven: 80, sam: 35, dim: 10 },
  { hour: '09h', lun: 78, mar: 85, mer: 80, jeu: 88, ven: 72, sam: 28, dim: 8 },
  { hour: '10h', lun: 70, mar: 75, mer: 72, jeu: 78, ven: 65, sam: 22, dim: 6 },
  { hour: '11h', lun: 68, mar: 72, mer: 70, jeu: 75, ven: 62, sam: 18, dim: 5 },
  { hour: '12h', lun: 40, mar: 45, mer: 42, jeu: 48, ven: 35, sam: 12, dim: 3 },
  { hour: '13h', lun: 55, mar: 60, mer: 58, jeu: 65, ven: 50, sam: 15, dim: 4 },
  { hour: '14h', lun: 75, mar: 80, mer: 78, jeu: 85, ven: 68, sam: 25, dim: 7 },
  { hour: '15h', lun: 72, mar: 78, mer: 75, jeu: 82, ven: 65, sam: 22, dim: 6 },
  { hour: '16h', lun: 60, mar: 65, mer: 62, jeu: 70, ven: 55, sam: 18, dim: 5 },
  { hour: '17h', lun: 30, mar: 35, mer: 32, jeu: 38, ven: 25, sam: 8, dim: 2 },
];

// Auth helper
export const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'admin@pointage.ma': { password: 'admin123', userId: 'u1' },
  'tech@pointage.ma': { password: 'tech123', userId: 'u2' },
  'recep@pointage.ma': { password: 'recep123', userId: 'u3' },
  'interim@pointage.ma': { password: 'interim123', userId: 'u4' },
  'societe@pointage.ma': { password: 'societe123', userId: 'u7' },
};
