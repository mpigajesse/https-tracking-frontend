/**
 * Dates des données de démonstration, recalées sur aujourd'hui.
 *
 * Les jeux fictifs ont été écrits à une date donnée (sessions du 18 février,
 * dossiers et disponibilités du 28 juillet 2026). Laissés tels quels, ils
 * vieillissent : sessions « en cours » ouvertes depuis des mois, durées de
 * présence de plusieurs milliers d'heures, contrats tous expirés. Chaque date
 * est donc décalée d'autant de jours entiers qu'il s'en est écoulé depuis sa
 * date de référence : l'heure est conservée et les écarts entre dates aussi.
 */

const JOUR_MS = 86_400_000;

function debutDuJour(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Nombre de jours entiers entre la date de référence du jeu et aujourd'hui. */
function decalageJours(reference: string): number {
  const ref = new Date(`${reference}T00:00:00`);
  return Math.round((debutDuJour(new Date()) - ref.getTime()) / JOUR_MS);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Décale `iso` (« AAAA-MM-JJ » ou « AAAA-MM-JJTHH:MM:SS[.sss][Z] ») du nombre de
 * jours écoulés depuis `reference`, en gardant exactement son format.
 */
export function relatif(iso: string, reference: string): string {
  const [date, reste] = iso.split('T');
  const [a, m, j] = date.split('-').map(Number);
  const d = new Date(a, m - 1, j + decalageJours(reference));
  const jour = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return reste === undefined ? jour : `${jour}T${reste}`;
}

/** Libellé court (« 12 févr. ») du jour situé `ilYa` jours avant aujourd'hui. */
export function jourCourt(ilYa: number): string {
  const d = new Date(debutDuJour(new Date()) - ilYa * JOUR_MS);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
