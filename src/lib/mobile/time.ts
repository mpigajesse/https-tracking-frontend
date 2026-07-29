/**
 * Calculs temporels du processus de pointage.
 * Fonctions pures : aucune dépendance à React ni au store.
 */

import { CUTOFF_JOUR_COMPTABLE, PAUSE_TIMEOUT_MIN, SORTIE_TEMP_TIMEOUT_MIN } from "./constants";
import type { DureeSession, Pause, Session, SortieTemporaire } from "./types";

const MS_MIN = 60_000;

export function minutesToMs(min: number): number {
  return min * MS_MIN;
}

/** Horodatage de référence de la session : ouverture validée, sinon scan d'entrée. */
export function debutEffectif(session: Session): string {
  return session.ouvertureValideeA ?? session.debut;
}

/** Échéance de retour d'une pause = début + timeout + prolongations accordées. */
export function calculeEcheance(debutISO: string, prolongationMin = 0): string {
  const base = new Date(debutISO).getTime();
  return new Date(base + minutesToMs(PAUSE_TIMEOUT_MIN + prolongationMin)).toISOString();
}

/**
 * Échéance de retour d'une sortie temporaire = début + 15 min.
 * Aucune prolongation possible : la règle des 15 minutes est ferme.
 */
export function calculeEcheanceSortie(debutISO: string): string {
  const base = new Date(debutISO).getTime();
  return new Date(base + minutesToMs(SORTIE_TEMP_TIMEOUT_MIN)).toISOString();
}

/** Durée d'un intervalle borné. Un intervalle ouvert est compté jusqu'à `now`. */
function dureeIntervalleMs(debutISO: string, finISO: string | undefined, now: number): number {
  const debut = new Date(debutISO).getTime();
  const fin = finISO ? new Date(finISO).getTime() : now;
  return Math.max(0, fin - debut);
}

/** Durée d'une pause. Une pause encore ouverte est comptée jusqu'à `now`. */
export function dureePauseMs(pause: Pause, now: number): number {
  return dureeIntervalleMs(pause.debut, pause.fin, now);
}

/** Durée d'une sortie temporaire. Une sortie en cours est comptée jusqu'à `now`. */
export function dureeSortieMs(sortie: SortieTemporaire, now: number): number {
  return dureeIntervalleMs(sortie.debut, sortie.fin, now);
}

/**
 * Temps réel payable = (fin − début) − Σ pauses − Σ sorties temporaires.
 * Tant que la session est ouverte, `fin` vaut `now` (compteur vivant).
 */
export function calculeDuree(session: Session, now: number): DureeSession {
  const debut = new Date(debutEffectif(session)).getTime();
  const fin = session.fin ? new Date(session.fin).getTime() : now;
  const brutMs = Math.max(0, fin - debut);
  const pausesMs = session.pauses.reduce((acc, p) => acc + dureePauseMs(p, fin), 0);
  const sortiesMs = session.sorties.reduce((acc, s) => acc + dureeSortieMs(s, fin), 0);
  return {
    brutMs,
    pausesMs,
    sortiesMs,
    netMs: Math.max(0, brutMs - pausesMs - sortiesMs),
  };
}

/** Millisecondes restantes avant l'échéance de retour. Négatif = timeout dépassé. */
export function resteAvantEcheance(intervalle: Pause | SortieTemporaire, now: number): number {
  return new Date(intervalle.echeance).getTime() - now;
}

/** La pause en cours, s'il y en a une. */
export function pauseEnCours(session: Session): Pause | undefined {
  return session.pauses.find((p) => !p.fin);
}

/** La sortie temporaire en cours, s'il y en a une. */
export function sortieEnCours(session: Session): SortieTemporaire | undefined {
  return session.sorties.find((s) => !s.fin);
}

/** Instant de clôture forcée (23:30) du jour de la session. */
export function cutoffJourComptable(session: Session): number {
  const d = new Date(debutEffectif(session));
  d.setHours(CUTOFF_JOUR_COMPTABLE.heure, CUTOFF_JOUR_COMPTABLE.minute, 0, 0);
  return d.getTime();
}

/* ── Formatage ─────────────────────────────────────────────────────────── */

/** « 8h15 » — durée lisible, usage titre. */
export function formatDuree(ms: number): string {
  const totalMin = Math.floor(ms / MS_MIN);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/** « 08:15:32 » — chronomètre monospace. */
export function formatChrono(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** « 12:34 » — compte à rebours mm:ss, borné à zéro. Usage : sortie de 15 min. */
export function formatRestant(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** « 12:40 » — heure d'horloge. */
export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** « 12:40:35 » — horodatage d'audit à la seconde. */
export function formatHorodatage(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** « lun. 27 juil. » */
export function formatJour(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
