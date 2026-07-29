"use client";

import { useState } from "react";
import { MapPin, PowerOff, Radio, Users } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { MOTIFS_INDISPONIBILITE } from "@/lib/mobile/constants";
import { useMobileT } from "@/lib/mobile/i18n";
import { SITES_CONNUS } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { formatHeure, formatJour } from "@/lib/mobile/time";
import { cn } from "@/lib/utils";

/**
 * Déclaration de disponibilité du technicien.
 *
 * C'est le préalable au reste du flux : un scan ne notifie que les techniciens
 * déclarés sur le site concerné. Un site sans technicien est donc signalé
 * explicitement — un silence de notification doit toujours avoir une cause
 * visible, jamais passer pour une panne.
 */
export default function DisponibilitePage() {
  const {
    compte, maDisponibilite, techniciensDisponibles,
    declarerDisponibilite, cloreDisponibilite,
  } = useMobileStore();
  const { t } = useMobileT();
  const [motif, setMotif] = useState("");

  if (!compte) return null;

  const declarer = (site: string) => {
    declarerDisponibilite(site);
    toast.success(t("dispo_declared", { site }));
  };

  const terminer = () => {
    cloreDisponibilite(motif || undefined);
    setMotif("");
    toast.success(t("dispo_ended"));
  };

  const collegues = maDisponibilite
    ? techniciensDisponibles(maDisponibilite.site).filter((d) => d.technicienId !== compte.id)
    : [];

  return (
    <>
      <TopBar titre={t("dispo_title")} sousTitre={t("dispo_subtitle")} retour />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {maDisponibilite ? (
          <>
            {/* État courant, mis en avant : c'est l'information que le
                technicien vient vérifier en premier. */}
            <section
              className="rounded-2xl p-6 text-center text-white"
              style={{ background: "linear-gradient(135deg, #16803C, #0B4A22)" }}
            >
              <span aria-hidden className="inline-grid place-items-center w-12 h-12 rounded-xl bg-white/15">
                <Radio className="w-6 h-6" strokeWidth={2} />
              </span>
              <p className="m-0 mt-4 text-xs uppercase tracking-wide text-white/80">{t("dispo_on")}</p>
              <p className="m-0 mt-1 text-xl font-bold">{maDisponibilite.site}</p>
              <p className="m-num m-0 mt-2 text-sm text-white/80">
                {t("dispo_since")} {formatHeure(maDisponibilite.depuis)} ·{" "}
                {formatJour(maDisponibilite.depuis)}
              </p>
            </section>

            {collegues.length > 0 && (
              <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
                <span className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  {t("dispo_onSite")} — {collegues.length}
                </span>
                <ul className="m-0 p-0 list-none space-y-1.5">
                  {collegues.map((d) => (
                    <li key={d.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {d.technicienNom}
                      <span className="m-num ml-2 text-xs text-gray-400">
                        {t("dispo_since")} {formatHeure(d.depuis)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Changement de site : la déclaration précédente se clôt d'elle-même. */}
            <ChoixSite
              titre={t("dispo_chooseSite")}
              siteCourant={maDisponibilite.site}
              onChoisir={declarer}
              t={t}
            />

            <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] space-y-3">
              <label className="block">
                <span className="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("dispo_reason")}
                </span>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]"
                >
                  <option value="">—</option>
                  {MOTIFS_INDISPONIBILITE.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={terminer}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#CC0000] text-[#CC0000] dark:text-[#FF6666] text-sm font-semibold"
              >
                <PowerOff className="w-4 h-4" />
                {t("dispo_end")}
              </button>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-6 text-center">
              <span aria-hidden className="inline-grid place-items-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <PowerOff className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </span>
              <p className="m-0 mt-4 text-base font-semibold text-amber-900 dark:text-amber-300">
                {t("dispo_none")}
              </p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-400">
                {t("dispo_noneDesc")}
              </p>
            </section>

            <ChoixSite titre={t("dispo_declare")} onChoisir={declarer} t={t} />
          </>
        )}
      </div>
    </>
  );
}

function ChoixSite({
  titre,
  siteCourant,
  onChoisir,
  t,
}: {
  titre: string;
  siteCourant?: string;
  onChoisir: (site: string) => void;
  t: ReturnType<typeof useMobileT>["t"];
}) {
  const { techniciensDisponibles } = useMobileStore();

  return (
    <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <span className="block mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {titre}
      </span>
      <div className="space-y-2">
        {SITES_CONNUS.map((site) => {
          const courant = site === siteCourant;
          const couverture = techniciensDisponibles(site).length;
          return (
            <button
              key={site}
              type="button"
              disabled={courant}
              onClick={() => onChoisir(site)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-colors",
                courant
                  ? "border-green-300 dark:border-green-900 bg-green-50 dark:bg-green-950/40 cursor-default"
                  : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] hover:border-[#CC0000]",
              )}
            >
              <MapPin
                className={cn(
                  "w-4 h-4 shrink-0",
                  courant ? "text-green-600" : "text-gray-400",
                )}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                  {site}
                </span>
                {/* Un site sans technicien est signalé : c'est l'information
                    qui doit décider où se déclarer en priorité. */}
                <span
                  className={cn(
                    "block mt-0.5 text-xs",
                    couverture === 0 ? "text-[#CC0000] dark:text-[#FF6666]" : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {couverture === 0
                    ? t("dispo_uncovered")
                    : `${couverture} ${t("dispo_onSite").toLowerCase()}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
