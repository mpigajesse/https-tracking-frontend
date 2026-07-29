"use client";

import { useState } from "react";
import { Briefcase, LogOut, MapPin, ShoppingBag, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionSheet } from "@/components/mobile/ActionSheet";
import { SORTIE_TEMP_TIMEOUT_MIN } from "@/lib/mobile/constants";
import { useMobileT } from "@/lib/mobile/i18n";
import type { MotifSortie } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

interface Option {
  motif: MotifSortie;
  icone: LucideIcon;
  labelKey: "sortie_fin_journee" | "sortie_chantier" | "sortie_course";
  descKey: "sortie_fin_journeeDesc" | "sortie_chantierDesc" | "sortie_courseDesc";
  /** Vrai si le motif suspend la session au lieu de la clore. */
  temporaire: boolean;
}

/**
 * L'ordre place la fin de journée en premier : c'est le cas majoritaire.
 * Les deux sorties temporaires suivent, visuellement groupées par leur minuterie.
 */
const OPTIONS: Option[] = [
  {
    motif: "fin_journee",
    icone: LogOut,
    labelKey: "sortie_fin_journee",
    descKey: "sortie_fin_journeeDesc",
    temporaire: false,
  },
  {
    motif: "chantier",
    icone: Briefcase,
    labelKey: "sortie_chantier",
    descKey: "sortie_chantierDesc",
    temporaire: true,
  },
  {
    motif: "course",
    icone: ShoppingBag,
    labelKey: "sortie_course",
    descKey: "sortie_courseDesc",
    temporaire: true,
  },
];

interface SortieMotifSheetProps {
  ouvert: boolean;
  onFermer: () => void;
  /** Site de la session, proposé par défaut comme destination. */
  siteSession: string;
  /** Sites sélectionnables en destination. */
  sites: readonly string[];
  /** `precision` et `siteDestination` ne valent que pour une sortie temporaire. */
  onConfirmer: (motif: MotifSortie, precision?: string, siteDestination?: string) => void;
}

/**
 * Choix du motif au scan de sortie.
 *
 * C'est le point où l'intérimaire décide du sort de sa session : la clore, ou
 * la suspendre pour une durée bornée. La feuille rend cette conséquence
 * explicite avant la confirmation, parce qu'un choix erroné ferme une journée
 * de travail ou déclenche une clôture automatique.
 */
export function SortieMotifSheet({
  ouvert,
  onFermer,
  siteSession,
  sites,
  onConfirmer,
}: SortieMotifSheetProps) {
  const { t } = useMobileT();
  const [motif, setMotif] = useState<MotifSortie | null>(null);
  const [precision, setPrecision] = useState("");
  const [siteDestination, setSiteDestination] = useState(siteSession);

  const choisi = OPTIONS.find((o) => o.motif === motif);
  const changeDeSite = siteDestination !== siteSession;

  const reinitialiser = () => {
    setMotif(null);
    setPrecision("");
    setSiteDestination(siteSession);
  };

  const fermer = () => {
    reinitialiser();
    onFermer();
  };

  const confirmer = () => {
    if (!motif) return;
    const temporaire = choisi?.temporaire ?? false;
    onConfirmer(
      motif,
      temporaire ? precision.trim() || undefined : undefined,
      temporaire && changeDeSite ? siteDestination : undefined,
    );
    reinitialiser();
  };

  return (
    <ActionSheet
      ouvert={ouvert}
      titre={t("sortie_title")}
      description={t("sortie_desc", { n: SORTIE_TEMP_TIMEOUT_MIN })}
      onFermer={fermer}
    >
      <div className="space-y-2.5">
        {OPTIONS.map((o) => {
          const actif = motif === o.motif;
          const Icone = o.icone;
          return (
            <button
              key={o.motif}
              type="button"
              onClick={() => setMotif(o.motif)}
              aria-pressed={actif}
              className={cn(
                "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                actif
                  ? "border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000]"
                  : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-gray-300 dark:hover:border-[#3A3A3A]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "shrink-0 w-10 h-10 grid place-items-center rounded-xl",
                  actif
                    ? "bg-[#CC0000] text-white"
                    : "bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-300",
                )}
              >
                <Icone className="w-5 h-5" strokeWidth={2} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t(o.labelKey)}
                  </span>
                  {o.temporaire && (
                    <span className="m-num inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                      <Timer className="w-3 h-3" />
                      {SORTIE_TEMP_TIMEOUT_MIN} min
                    </span>
                  )}
                </span>
                <span className="block mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {t(o.descKey, { n: SORTIE_TEMP_TIMEOUT_MIN })}
                </span>
              </span>
            </button>
          );
        })}

        {/* La précision n'a de sens que pour une sortie qui doit être justifiée. */}
        {choisi?.temporaire && (
          <label className="block pt-1">
            <span className="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("sortie_precision")}
            </span>
            <input
              type="text"
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
              placeholder={t("sortie_precisionPlaceholder")}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
            />
          </label>
        )}

        {/* Site rejoint. Cas rare, donc replié derrière un sélecteur discret
            plutôt que mis au même niveau que le motif. */}
        {choisi?.temporaire && (
          <label className="block">
            <span className="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("site_destination")}
            </span>
            <select
              value={siteDestination}
              onChange={(e) => setSiteDestination(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
            >
              {sites.map((s) => (
                <option key={s} value={s}>
                  {s === siteSession ? `${s} — ${t("sortie_sameSite")}` : s}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Rappel de la conséquence, affiché seulement quand elle s'applique. */}
        {choisi?.temporaire && (
          <p className="m-0 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            <Timer className="w-4 h-4 shrink-0 mt-px" />
            <span>
              <strong>{t("sortie_rule", { n: SORTIE_TEMP_TIMEOUT_MIN })} — </strong>
              {t("sortie_ruleDesc")}
            </span>
          </p>
        )}

        {/* La règle du site de départ n'est rappelée que si elle s'applique
            vraiment : afficher une exception qui ne joue pas est du bruit. */}
        {choisi?.temporaire && changeDeSite && (
          <p className="m-0 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs leading-relaxed text-blue-800 dark:text-blue-300">
            <MapPin className="w-4 h-4 shrink-0 mt-px" />
            <span>
              <strong>{t("site_ruleTitle")} — </strong>
              {t("site_ruleDesc", { n: SORTIE_TEMP_TIMEOUT_MIN })}{" "}
              <strong>
                {t("site_billedTo")} {siteSession}.
              </strong>
            </span>
          </p>
        )}

        <button
          type="button"
          onClick={confirmer}
          disabled={!motif}
          className="w-full mt-1 px-4 py-3.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
        >
          {t("sortie_confirm")}
        </button>
      </div>
    </ActionSheet>
  );
}
