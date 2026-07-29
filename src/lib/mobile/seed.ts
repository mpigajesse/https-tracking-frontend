/**
 * Construction du jeu de sessions de démonstration.
 *
 * Les sessions sont fabriquées en rejouant la machine à états — jamais écrites
 * « à la main » — afin que leur journal d'audit et leurs statuts soient
 * cohérents avec le processus, et qu'une régression de la machine se voie ici.
 *
 * Le jeu couvre chaque branche du flux, dont les deux issues d'une sortie
 * temporaire : le retour dans les 15 minutes, et le dépassement qui ferme
 * la session d'office.
 */

import { appliquer, creerSession } from "./session-machine";
import type { Session } from "./types";

const MIN = 60_000;
const H = 60 * MIN;

/** Technicien de garde sur Casablanca dans le jeu de démonstration. */
const TECHNICIEN = "Fatima Alaoui";

/**
 * Demandeur affecté par défaut lors des validations d'ouverture rejouées.
 * Une session validée porte toujours un demandeur : c'est lui qui détermine
 * le service auquel les heures sont imputées.
 */
const DEMANDE_PROD = {
  demandeurId: "dm1",
  demandeurNom: "Fatima Alaoui",
  serviceNom: "Production",
} as const;

/** Second demandeur, pour que la ventilation par service ne soit pas uniforme. */
const DEMANDE_MAINT = {
  demandeurId: "dm3",
  demandeurNom: "Youssef Ouali",
  serviceNom: "Maintenance",
} as const;

function iso(base: number, offsetMs: number): string {
  return new Date(base + offsetMs).toISOString();
}

/** Applique une suite d'événements en ignorant les transitions refusées. */
function rejoue(session: Session, evts: Parameters<typeof appliquer>[1][]): Session {
  return evts.reduce((s, e) => {
    const r = appliquer(s, e);
    return r.ok ? r.session : s;
  }, session);
}

/**
 * @param now Instant de référence (injecté pour rester déterministe et testable).
 */
export function construireSeed(now: number): Session[] {
  const sessions: Session[] = [];

  /* i1 — le compte intérimaire de démo : session ouverte, une pause repas prise
     et une course déjà revenue dans les temps. */
  const s1 = rejoue(creerSession({ interimaireId: "i1", site: "Site Casablanca", at: iso(now, -7 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -7 * H + 40_000), par: TECHNICIEN, ...DEMANDE_PROD },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -4 * H) },
    { type: "SCAN", kind: "retour_pause", at: iso(now, -4 * H + 34 * MIN) },
    {
      type: "SCAN_SORTIE_TEMPORAIRE",
      motif: "course",
      at: iso(now, -2 * H),
      precision: "Retrait pièce détachée",
    },
    { type: "SCAN", kind: "retour_sortie", at: iso(now, -2 * H + 11 * MIN) },
  ]);
  sessions.push(s1);

  /* i2 — vient de scanner : alimente la file de validation d'ouverture du technicien. */
  sessions.push(creerSession({ interimaireId: "i2", site: "Site Casablanca", at: iso(now, -2 * MIN) }));

  /* i3 — sortie chantier en cours, échéance dans ~4 min : le compte à rebours
     des 15 minutes tourne à l'écran, et le timeout se déclenchera en direct. */
  const s3 = rejoue(creerSession({ interimaireId: "i3", site: "Site Casablanca", at: iso(now, -6 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -6 * H + 30_000), par: TECHNICIEN, ...DEMANDE_MAINT },
    {
      type: "SCAN_SORTIE_TEMPORAIRE",
      motif: "chantier",
      at: iso(now, -11 * MIN),
      precision: "Chantier Nord — bâtiment C",
      // Cas rare : l'intérimaire rejoint un autre site. Un retour dans les
      // 15 minutes laisse malgré tout toute la session sur Casablanca.
      siteDestination: "Site Rabat",
    },
  ]);
  sessions.push(s3);

  /* i4 — pause repas dont le délai est déjà dépassé : alimente l'arbitrage A / B / C. */
  const s4 = rejoue(creerSession({ interimaireId: "i4", site: "Site Casablanca", at: iso(now, -5 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -5 * H + 25_000), par: TECHNICIEN, ...DEMANDE_PROD },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -58 * MIN) },
    { type: "PAUSE_TIMEOUT", at: iso(now, -18 * MIN) },
  ]);
  sessions.push(s4);

  /* i5 — sortie de fin de journée scannée : alimente la file de clôture du technicien. */
  const s5 = rejoue(creerSession({ interimaireId: "i5", site: "Site Casablanca", at: iso(now, -9 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -9 * H + 20_000), par: TECHNICIEN, ...DEMANDE_PROD },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -5 * H) },
    { type: "SCAN", kind: "retour_pause", at: iso(now, -5 * H + 45 * MIN) },
    { type: "SCAN", kind: "sortie", at: iso(now, -90_000) },
  ]);
  sessions.push(s5);

  /* i6 — autre site : visible par l'admin, invisible pour le personnel de
     Casablanca. Sert à vérifier le cloisonnement par site. */
  const s6 = rejoue(creerSession({ interimaireId: "i6", site: "Site Rabat", at: iso(now, -4 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -4 * H + 35_000), par: "Nadia Tazi", ...DEMANDE_PROD },
  ]);
  sessions.push(s6);

  /* i4 — la veille : sortie chantier non honorée, session fermée d'office
     par le système au bout de 15 minutes (règle de dépassement). */
  const depassee = rejoue(
    creerSession({ interimaireId: "i4", site: "Site Casablanca", at: iso(now, -24 * H - 7 * H) }),
    [
      { type: "VALIDER_OUVERTURE", at: iso(now, -24 * H - 7 * H + 30_000), par: TECHNICIEN, ...DEMANDE_PROD },
      {
        type: "SCAN_SORTIE_TEMPORAIRE",
        motif: "chantier",
        at: iso(now, -24 * H - 3 * H),
        precision: "Chantier Sud",
      },
      { type: "SORTIE_TIMEOUT", at: iso(now, -24 * H - 3 * H + 15 * MIN) },
    ],
  );
  sessions.push(depassee);

  /* i1 — historique de la veille, clôturé et validé par le technicien. */
  const veille = rejoue(
    creerSession({ interimaireId: "i1", site: "Site Casablanca", at: iso(now, -24 * H - 8 * H) }),
    [
      { type: "VALIDER_OUVERTURE", at: iso(now, -24 * H - 8 * H + 30_000), par: TECHNICIEN, ...DEMANDE_PROD },
      { type: "SCAN", kind: "depart_pause", at: iso(now, -24 * H - 4 * H) },
      { type: "SCAN", kind: "retour_pause", at: iso(now, -24 * H - 4 * H + 45 * MIN) },
      { type: "SCAN", kind: "sortie", at: iso(now, -24 * H + 15 * MIN) },
      { type: "VALIDER_CLOTURE", at: iso(now, -24 * H + 16 * MIN), par: TECHNICIEN },
    ],
  );
  sessions.push(veille);

  /* i1 — avant-veille clôturée automatiquement à 23:30. */
  const debutAvantVeille = new Date(now - 48 * H - 8 * H);
  const cutoff = new Date(debutAvantVeille);
  cutoff.setHours(23, 30, 0, 0);
  const avantVeille = rejoue(
    creerSession({ interimaireId: "i1", site: "Site Casablanca", at: debutAvantVeille.toISOString() }),
    [
      { type: "VALIDER_OUVERTURE", at: iso(debutAvantVeille.getTime(), 30_000), par: TECHNICIEN, ...DEMANDE_PROD },
      { type: "CLOTURE_AUTO", at: cutoff.toISOString() },
    ],
  );
  sessions.push(avantVeille);

  return sessions;
}
