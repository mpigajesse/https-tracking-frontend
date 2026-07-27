/**
 * Jeu de données mock de l'application mobile.
 * Aucun appel réseau : le backend n'existe pas encore, l'app web actuelle
 * utilise déjà le même principe (voir src/lib/data.ts).
 */

import { TOUS_SITES, type InterimaireProfil, type MobileAccount } from "./types";

/**
 * Deux comptes seulement. L'intérimaire ne se connecte pas : il présente son
 * QR Code au poste, le titulaire du mobile enregistre le scan pour lui.
 */
export const MOBILE_ACCOUNTS: MobileAccount[] = [
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
];

export const LIBELLE_ROLE: Record<MobileAccount["role"], string> = {
  admin: "Administrateur",
  receptionniste: "Réceptionniste",
};

/** Identifiants de démonstration — à supprimer avec l'arrivée de l'auth réelle. */
export const MOBILE_CREDENTIALS: Record<string, { code: string; accountId: string }> = {
  "ADM-0001": { code: "1234", accountId: "m1" },
  "REC-0204": { code: "1234", accountId: "m2" },
};

export const INTERIMAIRES: InterimaireProfil[] = [
  {
    id: "i1",
    prenom: "Mohamed",
    nom: "El Amrani",
    cin: "AB123456",
    agence: "TempoPro",
    fonction: "Opérateur",
    site: "Site Casablanca",
    initiales: "ME",
    assuranceValideJusqu: "2026-12-31",
    contratFin: "2026-12-31",
  },
  {
    id: "i2",
    prenom: "Aicha",
    nom: "Bakkali",
    cin: "CD789012",
    agence: "InterWork",
    fonction: "Technicien",
    site: "Site Casablanca",
    initiales: "AB",
    assuranceValideJusqu: "2026-08-31",
    contratFin: "2026-08-31",
  },
  {
    id: "i3",
    prenom: "Omar",
    nom: "Qasimi",
    cin: "EF345678",
    agence: "FlexiStaff",
    fonction: "Magasinier",
    site: "Site Casablanca",
    initiales: "OQ",
    assuranceValideJusqu: "2026-09-15",
    contratFin: "2026-09-15",
  },
  {
    id: "i4",
    prenom: "Zineb",
    nom: "Cherkaoui",
    cin: "KL123456",
    agence: "TempoPro",
    fonction: "Opérateur",
    site: "Site Casablanca",
    initiales: "ZC",
    assuranceValideJusqu: "2026-10-01",
    contratFin: "2026-10-01",
  },
  {
    id: "i5",
    prenom: "Abdelaziz",
    nom: "Filali",
    cin: "IJ567890",
    agence: "StaffPlus",
    fonction: "Conducteur",
    site: "Site Casablanca",
    initiales: "AF",
    assuranceValideJusqu: "2026-07-15",
    contratFin: "2026-07-15",
  },
  {
    id: "i6",
    prenom: "Leila",
    nom: "Berrada",
    cin: "GH901234",
    agence: "ProIntérim",
    fonction: "Chef d'équipe",
    site: "Site Rabat",
    initiales: "LB",
    assuranceValideJusqu: "2026-05-31",
    contratFin: "2026-05-31",
  },
];

export function trouveInterimaire(id: string): InterimaireProfil | undefined {
  return INTERIMAIRES.find((i) => i.id === id);
}

export function nomComplet(i: Pick<InterimaireProfil, "prenom" | "nom">): string {
  return `${i.prenom} ${i.nom}`;
}
