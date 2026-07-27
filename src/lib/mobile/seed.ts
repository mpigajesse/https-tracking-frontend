/**
 * Construction du jeu de sessions de démonstration.
 *
 * Les sessions sont fabriquées en rejouant la machine à états — jamais écrites
 * « à la main » — afin que leur journal d'audit et leurs statuts soient
 * cohérents avec le BPMN, et qu'une régression de la machine se voie ici.
 */

import { appliquer, creerSession } from "./session-machine";
import type { Session } from "./types";

const MIN = 60_000;
const H = 60 * MIN;

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

  /* i1 — le compte intérimaire de démo : session ouverte, une pause déjà prise. */
  const s1 = rejoue(creerSession({ interimaireId: "i1", site: "Site Casablanca", at: iso(now, -7 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -7 * H + 40_000), par: "Fatima Alaoui" },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -3 * H) },
    { type: "SCAN", kind: "retour_pause", at: iso(now, -3 * H + 34 * MIN) },
  ]);
  sessions.push(s1);

  /* i2 — vient de scanner : alimente la file de validation d'ouverture. */
  sessions.push(creerSession({ interimaireId: "i2", site: "Site Casablanca", at: iso(now, -2 * MIN) }));

  /* i3 — en pause, échéance proche : le timeout se déclenchera en direct. */
  const s3 = rejoue(creerSession({ interimaireId: "i3", site: "Site Casablanca", at: iso(now, -6 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -6 * H + 30_000), par: "Hassan Chraibi" },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -37 * MIN) },
  ]);
  sessions.push(s3);

  /* i4 — timeout déjà dépassé : alimente l'écran d'arbitrage A / B / C. */
  const s4 = rejoue(creerSession({ interimaireId: "i4", site: "Site Casablanca", at: iso(now, -5 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -5 * H + 25_000), par: "Fatima Alaoui" },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -58 * MIN) },
    { type: "PAUSE_TIMEOUT", at: iso(now, -18 * MIN) },
  ]);
  sessions.push(s4);

  /* i5 — sortie scannée : alimente la file de validation de clôture. */
  const s5 = rejoue(creerSession({ interimaireId: "i5", site: "Site Casablanca", at: iso(now, -9 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -9 * H + 20_000), par: "Hassan Chraibi" },
    { type: "SCAN", kind: "depart_pause", at: iso(now, -5 * H) },
    { type: "SCAN", kind: "retour_pause", at: iso(now, -5 * H + 45 * MIN) },
    { type: "SCAN", kind: "sortie", at: iso(now, -90_000) },
  ]);
  sessions.push(s5);

  /* i6 — autre site : visible par l'admin, invisible pour le réceptionniste
     de Casablanca. Sert à vérifier le cloisonnement par site. */
  const s6 = rejoue(creerSession({ interimaireId: "i6", site: "Site Rabat", at: iso(now, -4 * H) }), [
    { type: "VALIDER_OUVERTURE", at: iso(now, -4 * H + 35_000), par: "Nadia Tazi" },
  ]);
  sessions.push(s6);

  /* i1 — historique de la veille, clôturé et validé. */
  const veille = rejoue(
    creerSession({ interimaireId: "i1", site: "Site Casablanca", at: iso(now, -24 * H - 8 * H) }),
    [
      { type: "VALIDER_OUVERTURE", at: iso(now, -24 * H - 8 * H + 30_000), par: "Fatima Alaoui" },
      { type: "SCAN", kind: "depart_pause", at: iso(now, -24 * H - 4 * H) },
      { type: "SCAN", kind: "retour_pause", at: iso(now, -24 * H - 4 * H + 45 * MIN) },
      { type: "SCAN", kind: "sortie", at: iso(now, -24 * H + 15 * MIN) },
      { type: "VALIDER_CLOTURE", at: iso(now, -24 * H + 16 * MIN), par: "Fatima Alaoui" },
    ],
  );
  sessions.push(veille);

  /* i1 — avant-veille clôturée automatiquement à 23:30 (scénario 4). */
  const debutAvantVeille = new Date(now - 48 * H - 8 * H);
  const cutoff = new Date(debutAvantVeille);
  cutoff.setHours(23, 30, 0, 0);
  const avantVeille = rejoue(
    creerSession({ interimaireId: "i1", site: "Site Casablanca", at: debutAvantVeille.toISOString() }),
    [
      { type: "VALIDER_OUVERTURE", at: iso(debutAvantVeille.getTime(), 30_000), par: "Hassan Chraibi" },
      { type: "CLOTURE_AUTO", at: cutoff.toISOString() },
    ],
  );
  sessions.push(avantVeille);

  return sessions;
}
