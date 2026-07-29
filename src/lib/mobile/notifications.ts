/**
 * Fabrique des notifications poussées vers un rôle.
 *
 * Le technicien est le principal destinataire : dès qu'un réceptionniste
 * scanne un QR, une notification « ouverture à valider » lui parvient, et
 * c'est lui — pas le réceptionniste — qui statue sur la session.
 *
 * Module pur : la persistance et le cloisonnement par site sont l'affaire du store.
 */

import { SORTIE_TEMP_TIMEOUT_MIN } from "./constants";
import { formatHeure } from "./time";
import { TOUS_SITES, type Notification, type NotificationKind, type Role } from "./types";

let compteur = 0;
function nouvelId(): string {
  compteur += 1;
  return `N-${Date.now().toString(36)}-${compteur}`;
}

interface BaseParams {
  at: string;
  site: string;
  sessionId?: string;
  interimaireId?: string;
  societeId?: string;
}

function creer(
  kind: NotificationKind,
  destinataire: Role,
  titre: string,
  detail: string,
  base: BaseParams,
): Notification {
  return {
    id: nouvelId(),
    kind,
    destinataire,
    site: base.site,
    at: base.at,
    titre,
    detail,
    lue: false,
    sessionId: base.sessionId,
    interimaireId: base.interimaireId,
    societeId: base.societeId,
  };
}

/* ── Notifications du technicien ───────────────────────────────────────── */

/** Le réceptionniste vient de scanner une entrée : le technicien doit valider. */
export function notifOuverture(params: BaseParams & { nomInterimaire: string }): Notification {
  return creer(
    "ouverture_a_valider",
    "technicien",
    "Nouvelle entrée à valider",
    `${params.nomInterimaire} a été scanné à ${formatHeure(params.at)} — contrôlez l'identité puis validez la session.`,
    params,
  );
}

/** L'intérimaire a scanné sa sortie de fin de journée : clôture à valider. */
export function notifCloture(
  params: BaseParams & { nomInterimaire: string; dureeLisible: string },
): Notification {
  return creer(
    "cloture_a_valider",
    "technicien",
    "Session à clôturer",
    `${params.nomInterimaire} est sorti à ${formatHeure(params.at)} — ${params.dureeLisible} brut à valider.`,
    params,
  );
}

/** Les 15 minutes de sortie temporaire sont écoulées : la session a été fermée. */
export function notifSortieDepassee(
  params: BaseParams & { nomInterimaire: string; motifLisible: string },
): Notification {
  return creer(
    "sortie_depassee",
    "technicien",
    "Sortie dépassée — session fermée",
    `${params.nomInterimaire} n'est pas revenu de sa sortie ${params.motifLisible.toLowerCase()} dans les ${SORTIE_TEMP_TIMEOUT_MIN} min. La session a été fermée automatiquement.`,
    params,
  );
}

/** Le délai de retour de pause repas est dépassé : arbitrage requis. */
export function notifPauseTimeout(params: BaseParams & { nomInterimaire: string }): Notification {
  return creer(
    "pause_timeout",
    "technicien",
    "Retour de pause en retard",
    `${params.nomInterimaire} n'est pas revenu de pause — clôturez, prolongez ou saisissez le retour.`,
    params,
  );
}

/* ── Notifications de l'administrateur et de la société ────────────────── */

/** La société a soumis un dossier : l'admin doit statuer. */
export function notifProfilASoumettre(
  params: BaseParams & { nomInterimaire: string; nomSociete: string },
): Notification {
  return creer("profil_a_valider", "admin", "Profil à valider", `${params.nomSociete} a soumis le dossier de ${params.nomInterimaire}.`, {
    ...params,
    site: TOUS_SITES,
  });
}

/** L'admin a statué : la société est informée du sort de son dossier. */
export function notifProfilStatue(
  params: BaseParams & { nomInterimaire: string; valide: boolean; motif?: string },
): Notification {
  const titre = params.valide ? "Profil validé" : "Profil refusé";
  const detail = params.valide
    ? `${params.nomInterimaire} est validé et peut commencer le travail.`
    : `${params.nomInterimaire} a été refusé — ${params.motif ?? "motif non précisé"}.`;
  return creer("profil_statue", "societe", titre, detail, params);
}

/* ── Lecture ───────────────────────────────────────────────────────────── */

/**
 * Notifications visibles par un compte : celles de son rôle, limitées à son
 * site. L'admin, porteur de `TOUS_SITES`, voit tout.
 */
export function notificationsVisibles(
  toutes: readonly Notification[],
  role: Role,
  site: string,
): Notification[] {
  return toutes
    .filter((n) => n.destinataire === role)
    .filter((n) => site === TOUS_SITES || n.site === TOUS_SITES || n.site === site)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function compteNonLues(notifications: readonly Notification[]): number {
  return notifications.filter((n) => !n.lue).length;
}

/**
 * Notification adressée à l'admin quand un site n'a aucun technicien déclaré.
 *
 * Sans elle, un scan sur un site découvert resterait sans destinataire et donc
 * sans trace : le silence serait indiscernable d'une panne de notification.
 */
export function notifSiteNonCouvert(
  params: BaseParams & { nomInterimaire: string },
): Notification {
  return creer(
    "ouverture_a_valider",
    "admin",
    "Site sans technicien déclaré",
    `${params.nomInterimaire} a été scanné sur ${params.site}, mais aucun technicien n'y est déclaré disponible.`,
    params,
  );
}
