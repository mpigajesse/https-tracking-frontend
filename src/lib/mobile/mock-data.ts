/**
 * Jeu de données mock partagé par les applications web et mobile.
 * Aucun appel réseau : le backend n'existe pas encore.
 *
 * Le jeu est construit pour donner à voir tout le flux d'un coup d'œil :
 * des profils dans chacun des cinq statuts de validation, deux sociétés
 * d'intérim, et un compte par rôle.
 */

import {
  TOUS_SITES,
  type Compte,
  type Demandeur,
  type DisponibiliteTechnicien,
  type InterimaireProfil,
  type Role,
  type Service,
  type Societe,
} from "./types";

/**
 * Sites de l'entreprise. Source unique pour les sélecteurs de site du mobile
 * (déclaration de disponibilité, sortie vers un autre site).
 */
export const SITES_CONNUS = [
  "Site Casablanca",
  "Site Rabat",
  "Site Tanger",
  "Site Fès",
  "Site Marrakech",
];

/* ── Services de l'entreprise utilisatrice ─────────────────────────────── */

export const SERVICES: Service[] = [
  { id: "sv1", nom: "Production", code: "PROD", responsable: "Fatima Alaoui", site: "Site Casablanca", actif: true },
  { id: "sv2", nom: "Maintenance", code: "MAINT", responsable: "Youssef Ouali", site: "Site Casablanca", actif: true },
  { id: "sv3", nom: "Logistique", code: "LOG", responsable: "Nadia Tazi", site: "Site Casablanca", actif: true },
  { id: "sv4", nom: "Qualité", code: "QUAL", responsable: "Samir Bennis", site: "Site Rabat", actif: true },
  { id: "sv5", nom: "Travaux neufs", code: "TN", responsable: "Hicham Draoui", site: "Site Casablanca", actif: false },
];

export function trouveService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/* ── Demandeurs ────────────────────────────────────────────────────────── */

/**
 * Chaque demandeur est rattaché à un service : c'est ce lien qui permet
 * d'imputer les heures d'une session au bon budget.
 */
export const DEMANDEURS: Demandeur[] = [
  { id: "dm1", prenom: "Fatima", nom: "Alaoui", email: "f.alaoui@lear.ma", telephone: "06 61 20 30 40", serviceId: "sv1", serviceNom: "Production", actif: true },
  { id: "dm2", prenom: "Mehdi", nom: "Sabri", email: "m.sabri@lear.ma", telephone: "06 62 31 41 51", serviceId: "sv1", serviceNom: "Production", actif: true },
  { id: "dm3", prenom: "Youssef", nom: "Ouali", email: "y.ouali@lear.ma", telephone: "06 63 42 52 62", serviceId: "sv2", serviceNom: "Maintenance", actif: true },
  { id: "dm4", prenom: "Nadia", nom: "Tazi", email: "n.tazi@lear.ma", telephone: "06 64 53 63 73", serviceId: "sv3", serviceNom: "Logistique", actif: true },
  { id: "dm5", prenom: "Samir", nom: "Bennis", email: "s.bennis@lear.ma", telephone: "06 65 64 74 84", serviceId: "sv4", serviceNom: "Qualité", actif: true },
  { id: "dm6", prenom: "Hicham", nom: "Draoui", email: "h.draoui@lear.ma", serviceId: "sv5", serviceNom: "Travaux neufs", actif: false },
];

export function trouveDemandeur(id: string): Demandeur | undefined {
  return DEMANDEURS.find((d) => d.id === id);
}

/** Les demandeurs actifs, éventuellement restreints à un service. */
export function demandeursActifs(serviceId?: string): Demandeur[] {
  return DEMANDEURS.filter((d) => d.actif && (!serviceId || d.serviceId === serviceId));
}

/* ── Disponibilité des techniciens ─────────────────────────────────────── */

/**
 * Un seul technicien déclaré au démarrage : le second site reste volontairement
 * découvert, pour que l'écran de validation montre le cas « aucun technicien ».
 */
export const DISPONIBILITES: DisponibiliteTechnicien[] = [
  {
    id: "dp1",
    technicienId: "m3",
    technicienNom: "Fatima Alaoui",
    site: "Site Casablanca",
    depuis: "2026-07-28T06:00:00.000Z",
  },
];

/* ── Sociétés d'intérim ────────────────────────────────────────────────── */

export const SOCIETES: Societe[] = [
  {
    id: "so1",
    nom: "TempoPro",
    siret: "84291056700018",
    email: "contact@tempopro.ma",
    telephone: "05 22 45 12 90",
    adresse: "12 rue des Oudayas, Casablanca",
    contactNom: "Rachid Lemseffer",
    sites: ["Site Casablanca", "Site Rabat"],
    statut: "active",
    creeLe: "2026-01-12",
    creePar: "Karim Benali",
  },
  {
    id: "so2",
    nom: "InterWork",
    siret: "51730948200025",
    email: "rh@interwork.ma",
    telephone: "05 37 66 03 41",
    adresse: "Parc Technopolis, Rabat",
    contactNom: "Salma Idrissi",
    sites: ["Site Casablanca"],
    statut: "active",
    creeLe: "2026-02-03",
    creePar: "Karim Benali",
  },
  {
    id: "so3",
    nom: "FlexiStaff",
    siret: "39028471600037",
    email: "admin@flexistaff.ma",
    telephone: "05 39 22 78 55",
    adresse: "Zone franche, Tanger",
    contactNom: "Younes Haddad",
    sites: ["Site Tanger"],
    statut: "suspendue",
    creeLe: "2026-03-20",
    creePar: "Karim Benali",
  },
];

export function trouveSociete(id: string): Societe | undefined {
  return SOCIETES.find((s) => s.id === id);
}

/* ── Comptes ───────────────────────────────────────────────────────────── */

/**
 * Un compte par rôle. L'intérimaire dispose d'un accès volontairement
 * minimal : son QR, sa session du jour, son historique.
 */
export const COMPTES: Compte[] = [
  {
    id: "m1",
    prenom: "Karim",
    nom: "Benali",
    role: "admin",
    site: TOUS_SITES,
    matricule: "ADM-0001",
  },
  {
    id: "m2",
    prenom: "Hassan",
    nom: "Chraibi",
    role: "receptionniste",
    site: "Site Casablanca",
    matricule: "REC-0204",
  },
  {
    id: "m3",
    prenom: "Fatima",
    nom: "Alaoui",
    role: "technicien",
    site: "Site Casablanca",
    matricule: "TEC-0117",
  },
  {
    id: "m4",
    prenom: "Rachid",
    nom: "Lemseffer",
    role: "societe",
    site: TOUS_SITES,
    matricule: "SOC-0031",
    societeId: "so1",
  },
  {
    id: "m5",
    prenom: "Mohamed",
    nom: "El Amrani",
    role: "interimaire",
    site: "Site Casablanca",
    matricule: "INT-0451",
    interimaireId: "i1",
  },
];

/** @deprecated Utiliser {@link COMPTES}. */
export const MOBILE_ACCOUNTS = COMPTES;

export const LIBELLE_ROLE: Record<Role, string> = {
  admin: "Administrateur",
  societe: "Société d'intérim",
  receptionniste: "Réceptionniste",
  technicien: "Technicien",
  interimaire: "Intérimaire",
};

/** Identifiants de démonstration — à supprimer avec l'arrivée de l'auth réelle. */
export const MOBILE_CREDENTIALS: Record<string, { code: string; accountId: string }> = {
  "ADM-0001": { code: "1234", accountId: "m1" },
  "REC-0204": { code: "1234", accountId: "m2" },
  "TEC-0117": { code: "1234", accountId: "m3" },
  "SOC-0031": { code: "1234", accountId: "m4" },
  "INT-0451": { code: "1234", accountId: "m5" },
};

/* ── Profils intérimaires ──────────────────────────────────────────────── */

const TOUS_DOCS: InterimaireProfil["documents"] = ["cin", "assurance", "contrat", "medical"];

export const INTERIMAIRES: InterimaireProfil[] = [
  {
    id: "i1",
    prenom: "Mohamed",
    nom: "El Amrani",
    cin: "AB123456",
    telephone: "06 12 34 56 78",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Opérateur",
    typeActivite: "production",
    site: "Site Casablanca",
    initiales: "ME",
    assuranceValideJusqu: "2026-12-31",
    contratFin: "2026-12-31",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-01-15",
    statueLe: "2026-01-16",
    statuePar: "Karim Benali",
  },
  {
    id: "i2",
    prenom: "Aicha",
    nom: "Bakkali",
    cin: "CD789012",
    telephone: "06 98 76 54 32",
    societeId: "so2",
    agence: "InterWork",
    fonction: "Technicien",
    typeActivite: "maintenance",
    site: "Site Casablanca",
    initiales: "AB",
    assuranceValideJusqu: "2026-08-31",
    contratFin: "2026-08-31",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-02-05",
    statueLe: "2026-02-06",
    statuePar: "Karim Benali",
  },
  {
    id: "i3",
    prenom: "Omar",
    nom: "Qasimi",
    cin: "EF345678",
    telephone: "06 11 22 33 44",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Magasinier",
    typeActivite: "logistique",
    site: "Site Casablanca",
    initiales: "OQ",
    assuranceValideJusqu: "2026-09-15",
    contratFin: "2026-09-15",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-03-01",
    statueLe: "2026-03-02",
    statuePar: "Karim Benali",
  },
  {
    id: "i4",
    prenom: "Zineb",
    nom: "Cherkaoui",
    cin: "KL123456",
    telephone: "06 44 55 66 77",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Opérateur",
    typeActivite: "production",
    site: "Site Casablanca",
    initiales: "ZC",
    assuranceValideJusqu: "2026-10-01",
    contratFin: "2026-10-01",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-03-18",
    statueLe: "2026-03-19",
    statuePar: "Karim Benali",
  },
  {
    id: "i5",
    prenom: "Abdelaziz",
    nom: "Filali",
    cin: "IJ567890",
    telephone: "06 99 88 77 66",
    societeId: "so2",
    agence: "InterWork",
    fonction: "Conducteur",
    typeActivite: "logistique",
    site: "Site Casablanca",
    initiales: "AF",
    assuranceValideJusqu: "2026-07-15",
    contratFin: "2026-07-15",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-04-02",
    statueLe: "2026-04-03",
    statuePar: "Karim Benali",
  },
  {
    id: "i6",
    prenom: "Leila",
    nom: "Berrada",
    cin: "GH901234",
    telephone: "06 55 66 77 88",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Chef d'équipe",
    typeActivite: "production",
    site: "Site Rabat",
    initiales: "LB",
    assuranceValideJusqu: "2026-05-31",
    contratFin: "2026-05-31",
    statutProfil: "valide",
    documents: TOUS_DOCS,
    soumisLe: "2026-04-10",
    statueLe: "2026-04-11",
    statuePar: "Karim Benali",
  },

  /* — Dossiers en cours d'instruction : alimentent l'écran de validation admin — */
  {
    id: "i7",
    prenom: "Youssef",
    nom: "Naciri",
    cin: "MN654321",
    telephone: "06 21 43 65 87",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Opérateur",
    typeActivite: "production",
    site: "Site Casablanca",
    initiales: "YN",
    assuranceValideJusqu: "2027-01-31",
    contratFin: "2026-11-30",
    statutProfil: "en_attente_validation",
    documents: TOUS_DOCS,
    soumisLe: "2026-07-26",
  },
  {
    id: "i8",
    prenom: "Nadia",
    nom: "Squalli",
    cin: "OP112233",
    telephone: "06 33 22 11 00",
    societeId: "so2",
    agence: "InterWork",
    fonction: "Magasinier",
    typeActivite: "logistique",
    site: "Site Casablanca",
    initiales: "NS",
    assuranceValideJusqu: "2027-02-28",
    contratFin: "2026-12-15",
    statutProfil: "en_attente_validation",
    documents: TOUS_DOCS,
    soumisLe: "2026-07-27",
  },

  /* — Brouillon incomplet : la société ne peut pas encore le soumettre — */
  {
    id: "i9",
    prenom: "Anas",
    nom: "Tahiri",
    cin: "QR445566",
    telephone: "06 77 88 99 00",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Conducteur",
    typeActivite: "logistique",
    site: "Site Casablanca",
    initiales: "AT",
    assuranceValideJusqu: "2027-03-31",
    contratFin: "2027-01-31",
    statutProfil: "brouillon",
    documents: ["cin", "contrat"],
  },

  /* — Dossier refusé : la société doit le corriger — */
  {
    id: "i10",
    prenom: "Salma",
    nom: "Bennani",
    cin: "ST778899",
    telephone: "06 10 20 30 40",
    societeId: "so1",
    agence: "TempoPro",
    fonction: "Opérateur",
    typeActivite: "production",
    site: "Site Casablanca",
    initiales: "SB",
    assuranceValideJusqu: "2026-06-30",
    contratFin: "2026-10-31",
    statutProfil: "refuse",
    documents: TOUS_DOCS,
    soumisLe: "2026-07-20",
    statueLe: "2026-07-21",
    statuePar: "Karim Benali",
    motifRefus: "Attestation d'assurance manquante",
  },

  /* — Profil suspendu : ne peut plus scanner — */
  {
    id: "i11",
    prenom: "Hamza",
    nom: "Ouazzani",
    cin: "UV990011",
    telephone: "06 60 50 40 30",
    societeId: "so2",
    agence: "InterWork",
    fonction: "Magasinier",
    typeActivite: "logistique",
    site: "Site Casablanca",
    initiales: "HO",
    assuranceValideJusqu: "2026-07-01",
    contratFin: "2026-09-30",
    statutProfil: "suspendu",
    documents: TOUS_DOCS,
    soumisLe: "2026-05-02",
    statueLe: "2026-07-15",
    statuePar: "Karim Benali",
    motifRefus: "Attestation d'assurance expirée le 01/07/2026",
  },
];

export function trouveInterimaire(id: string): InterimaireProfil | undefined {
  return INTERIMAIRES.find((i) => i.id === id);
}

export function nomComplet(i: Pick<InterimaireProfil, "prenom" | "nom">): string {
  return `${i.prenom} ${i.nom}`;
}

/** Les profils d'une société donnée. */
export function interimairesDeSociete(societeId: string): InterimaireProfil[] {
  return INTERIMAIRES.filter((i) => i.societeId === societeId);
}
