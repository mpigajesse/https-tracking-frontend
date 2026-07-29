"use client";

import { Briefcase, ShoppingBag, Timer } from "lucide-react";
import { SORTIE_TEMP_ALERTE_MIN, MOTIFS_SORTIE } from "@/lib/mobile/constants";
import { useMobileT } from "@/lib/mobile/i18n";
import { formatRestant, resteAvantEcheance } from "@/lib/mobile/time";
import type { SortieTemporaire } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

interface SortieCountdownProps {
  sortie: SortieTemporaire;
  now: number;
  /** `compact` pour une ligne de liste, `plein` pour un écran dédié. */
  variante?: "compact" | "plein";
}

/**
 * Compte à rebours d'une sortie temporaire.
 *
 * Le rouge n'apparaît que dans les dernières minutes : une alerte permanente
 * ne serait plus une alerte. Le chiffre reste lisible de loin en variante
 * pleine, parce qu'il est consulté d'un coup d'œil, souvent à bout de bras.
 */
export function SortieCountdown({ sortie, now, variante = "compact" }: SortieCountdownProps) {
  const { t } = useMobileT();
  const reste = resteAvantEcheance(sortie, now);
  const depasse = reste <= 0;
  const urgent = !depasse && reste <= SORTIE_TEMP_ALERTE_MIN * 60_000;
  const Icone = sortie.motif === "chantier" ? Briefcase : ShoppingBag;

  const ton = depasse
    ? "bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
    : urgent
      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
      : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400";

  if (variante === "compact") {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium", ton)}
      >
        <Icone className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{MOTIFS_SORTIE[sortie.motif]}</span>
        <span className="m-num font-bold tabular-nums">
          {depasse ? t("sortie_overdue") : formatRestant(reste)}
        </span>
      </span>
    );
  }

  return (
    <div className={cn("rounded-2xl p-5 text-center", ton)}>
      <span className="inline-flex items-center gap-2 text-sm font-semibold">
        <Icone className="w-4 h-4" />
        {MOTIFS_SORTIE[sortie.motif]}
        {sortie.precision && (
          <span className="font-normal opacity-80">· {sortie.precision}</span>
        )}
      </span>

      {depasse ? (
        <p className="m-0 mt-3 text-lg font-bold">{t("sortie_overdue")}</p>
      ) : (
        <>
          <p className="m-0 mt-3 text-xs uppercase tracking-wide opacity-70">
            {t("sortie_countdown")}
          </p>
          <p className="m-num m-0 mt-1 text-5xl font-bold tabular-nums leading-none">
            {formatRestant(reste)}
          </p>
        </>
      )}

      <p className="m-0 mt-3 inline-flex items-center gap-1.5 text-xs opacity-80">
        <Timer className="w-3.5 h-3.5" />
        {t("sortie_ruleDesc")}
      </p>
    </div>
  );
}
