"use client";

import { formatHorodatage } from "@/lib/mobile/time";
import type { AuditEntry, Lane } from "@/lib/mobile/types";
import { useMobileT } from "@/lib/mobile/i18n";
import { cn } from "@/lib/utils";

/** Couleur de couloir : on lit d'un coup d'œil qui a agi. */
const POINT_LANE: Record<Lane, string> = {
  interimaire: "bg-blue-500",
  systeme: "bg-purple-500",
  societe: "bg-amber-500",
  valideur: "bg-[#CC0000]",
};

const TEXTE_LANE: Record<Lane, string> = {
  interimaire: "text-blue-600 dark:text-blue-400",
  systeme: "text-purple-600 dark:text-purple-400",
  societe: "text-amber-600 dark:text-amber-400",
  valideur: "text-[#CC0000] dark:text-[#FF6666]",
};

const CLE_LANE = {
  interimaire: "lane_interimaire",
  systeme: "lane_systeme",
  societe: "lane_societe",
  valideur: "lane_valideur",
} as const;

const TEXTE_TON = {
  neutre: "text-gray-700 dark:text-gray-300",
  ok: "text-green-700 dark:text-green-400",
  alerte: "text-[#CC0000] dark:text-[#FF6666]",
} as const;

interface AuditTimelineProps {
  entrees: AuditEntry[];
  /** Affiche les entrées les plus récentes en premier. */
  recentDabord?: boolean;
  /** Limite le nombre d'entrées rendues. */
  limite?: number;
}

/** Journal d'audit horodaté — panneau « LOG » du modèle BPMN. */
export function AuditTimeline({ entrees, recentDabord = false, limite }: AuditTimelineProps) {
  const { t } = useMobileT();
  const liste = recentDabord ? [...entrees].reverse() : entrees;
  const visibles = limite ? liste.slice(0, limite) : liste;

  if (visibles.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 m-0">{t("de_noEvent")}</p>;
  }

  return (
    <ol className="list-none m-0 p-0">
      {visibles.map((e, i) => {
        const dernier = i === visibles.length - 1;
        return (
          <li key={e.id} className="grid grid-cols-[auto_1fr] gap-3">
            {/* Rail vertical + point : structure de timeline, pas une simple liste */}
            <div className="grid justify-items-center w-3">
              <span aria-hidden className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0", POINT_LANE[e.lane])} />
              {!dernier && (
                <span aria-hidden className="w-px flex-1 min-h-3.5 mt-1 bg-gray-200 dark:bg-[#2A2A2A]" />
              )}
            </div>

            <div className={cn("min-w-0", dernier ? "pb-0" : "pb-4")}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <time className="m-num text-xs font-mono text-gray-500 dark:text-gray-400">
                  {formatHorodatage(e.at)}
                </time>
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", TEXTE_LANE[e.lane])}>
                  {t(CLE_LANE[e.lane])}
                </span>
              </div>
              <p className={cn("mt-0.5 mb-0 text-sm leading-relaxed break-words", TEXTE_TON[e.tone])}>
                {e.message}
              </p>
              {e.par && (
                <p className="mt-0.5 mb-0 text-xs text-gray-400 dark:text-gray-400">{t("by")} {e.par}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
