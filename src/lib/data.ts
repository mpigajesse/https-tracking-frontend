export type UserRole = 'admin' | 'technicien' | 'receptionniste' | 'interimaire';

export type SessionStatus = 
  | 'en_attente_ouverture'
  | 'ouverte'
  | 'en_attente_fermeture'
  | 'fermee'
  | 'cloturee_auto'
  | 'en_litige'
  | 'annulee';

export type QRStatus = 'actif' | 'expire' | 'revoque';

export type AlertType = 'non_cloturee' | 'depassement_48h' | 'en_litige';

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
}

export interface Interimaire {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  agence: string;
  fonction: string;
  site: string;
  dateDebut: string;
  dateFin: string;
  statut: 'actif' | 'inactif' | 'en_mission';
  photo?: string;
  qrStatus: QRStatus;
  qrToken?: string;
  totalHeures: number;
}

export interface Session {
  id: string;
  interimaire: string;
  interimaireNom: string;
  interimairePhoto?: string;
  site: string;
  fonction: string;
  heureDebut: string;
  heureFin?: string;
  duree?: number;
  statut: SessionStatus;
  validatedBy?: string;
  createdAt: string;
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

export const mockUsers: User[] = [
  { id: 'u1', nom: 'Benali', prenom: 'Karim', email: 'admin@pointage.ma', role: 'admin', site: 'Tous', statut: 'actif', createdAt: '2024-01-15' },
  { id: 'u2', nom: 'Alaoui', prenom: 'Fatima', email: 'tech@pointage.ma', role: 'technicien', site: 'Site Casablanca', statut: 'actif', createdAt: '2024-02-10' },
  { id: 'u3', nom: 'Chraibi', prenom: 'Hassan', email: 'recep@pointage.ma', role: 'receptionniste', site: 'Site Rabat', statut: 'actif', createdAt: '2024-03-05' },
  { id: 'u4', nom: 'Mansouri', prenom: 'Sara', email: 'interim@pointage.ma', role: 'interimaire', site: 'Site Casablanca', statut: 'actif', createdAt: '2024-04-20' },
  { id: 'u5', nom: 'Ouali', prenom: 'Youssef', email: 'tech2@pointage.ma', role: 'technicien', site: 'Site Tanger', statut: 'actif', createdAt: '2024-05-01' },
  { id: 'u6', nom: 'Tazi', prenom: 'Nadia', email: 'recep2@pointage.ma', role: 'receptionniste', site: 'Site Fès', statut: 'inactif', createdAt: '2024-05-15' },
];

export const mockInterimaires: Interimaire[] = [
  { id: 'i1', nom: 'El Amrani', prenom: 'Mohamed', cin: 'AB123456', email: 'melamrani@gmail.com', telephone: '06 12 34 56 78', agence: 'TempoPro', fonction: 'Opérateur', site: 'Site Casablanca', dateDebut: '2025-01-01', dateFin: '2025-12-31', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-001-2025', totalHeures: 342 },
  { id: 'i2', nom: 'Bakkali', prenom: 'Aicha', cin: 'CD789012', email: 'abakkali@gmail.com', telephone: '06 98 76 54 32', agence: 'InterWork', fonction: 'Technicien', site: 'Site Rabat', dateDebut: '2025-02-01', dateFin: '2025-08-31', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-002-2025', totalHeures: 218 },
  { id: 'i3', nom: 'Qasimi', prenom: 'Omar', cin: 'EF345678', email: 'oqasimi@gmail.com', telephone: '06 11 22 33 44', agence: 'FlexiStaff', fonction: 'Magasinier', site: 'Site Tanger', dateDebut: '2025-03-15', dateFin: '2025-09-15', statut: 'en_mission', qrStatus: 'expire', totalHeures: 156 },
  { id: 'i4', nom: 'Berrada', prenom: 'Leila', cin: 'GH901234', email: 'lberrada@gmail.com', telephone: '06 55 66 77 88', agence: 'ProIntérim', fonction: 'Chef d\'équipe', site: 'Site Fès', dateDebut: '2024-11-01', dateFin: '2025-05-31', statut: 'actif', qrStatus: 'actif', totalHeures: 589 },
  { id: 'i5', nom: 'Filali', prenom: 'Abdelaziz', cin: 'IJ567890', email: 'afilali@gmail.com', telephone: '06 99 88 77 66', agence: 'StaffPlus', fonction: 'Conducteur', site: 'Site Marrakech', dateDebut: '2025-01-15', dateFin: '2025-07-15', statut: 'en_mission', qrStatus: 'actif', qrToken: 'QR-005-2025', totalHeures: 402 },
  { id: 'i6', nom: 'Cherkaoui', prenom: 'Zineb', cin: 'KL123456', email: 'zcherkaoui@gmail.com', telephone: '06 44 55 66 77', agence: 'TempoPro', fonction: 'Opérateur', site: 'Site Casablanca', dateDebut: '2025-04-01', dateFin: '2025-10-01', statut: 'inactif', qrStatus: 'revoque', totalHeures: 45 },
];

export const mockSessions: Session[] = [
  { id: 's1', interimaire: 'i1', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', fonction: 'Opérateur', heureDebut: '2026-02-18T08:00:00', statut: 'en_attente_fermeture', createdAt: '2026-02-18T08:00:00' },
  { id: 's2', interimaire: 'i2', interimaireNom: 'Aicha Bakkali', site: 'Site Rabat', fonction: 'Technicien', heureDebut: '2026-02-18T07:30:00', statut: 'en_attente_fermeture', createdAt: '2026-02-18T07:30:00' },
  { id: 's3', interimaire: 'i5', interimaireNom: 'Abdelaziz Filali', site: 'Site Marrakech', fonction: 'Conducteur', heureDebut: '2026-02-18T06:00:00', statut: 'en_attente_ouverture', createdAt: '2026-02-18T06:00:00' },
  { id: 's4', interimaire: 'i4', interimaireNom: 'Leila Berrada', site: 'Site Fès', fonction: 'Chef d\'équipe', heureDebut: '2026-02-17T08:00:00', heureFin: '2026-02-17T17:00:00', duree: 9, statut: 'fermee', createdAt: '2026-02-17T08:00:00' },
  { id: 's5', interimaire: 'i3', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', fonction: 'Magasinier', heureDebut: '2026-02-15T08:00:00', statut: 'en_litige', createdAt: '2026-02-15T08:00:00' },
  { id: 's6', interimaire: 'i1', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', fonction: 'Opérateur', heureDebut: '2026-02-17T08:00:00', heureFin: '2026-02-17T16:30:00', duree: 8.5, statut: 'fermee', createdAt: '2026-02-17T08:00:00' },
];

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'non_cloturee', message: 'Session non clôturée depuis plus de 12h', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', createdAt: '2026-02-17T20:00:00', severity: 'high' },
  { id: 'a2', type: 'depassement_48h', message: 'Dépassement 48h hebdomadaire détecté', interimaireNom: 'Mohamed El Amrani', site: 'Site Casablanca', createdAt: '2026-02-17T18:00:00', severity: 'medium' },
  { id: 'a3', type: 'en_litige', message: 'Session en litige - validation requise', interimaireNom: 'Omar Qasimi', site: 'Site Tanger', createdAt: '2026-02-15T10:00:00', severity: 'high' },
  { id: 'a4', type: 'non_cloturee', message: 'Session ouverte sans validation réceptionniste', interimaireNom: 'Zineb Cherkaoui', site: 'Site Casablanca', createdAt: '2026-02-18T09:00:00', severity: 'medium' },
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
};
