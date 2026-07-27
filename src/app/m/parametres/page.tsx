"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Globe,
  Info,
  Moon,
  Palette,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { CUTOFF_JOUR_COMPTABLE, PAUSE_TIMEOUT_MIN, QR_TOKEN_TTL_S } from "@/lib/mobile/constants";
import { useMobileT } from "@/lib/mobile/i18n";
import { useMobileTheme, type ThemeMode } from "@/lib/mobile/theme";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Préférences locales à l'appareil, hors thème et langue qui ont leur provider. */
interface Preferences {
  notifTimeout: boolean;
  notifValidation: boolean;
  notifAutoClose: boolean;
  son: boolean;
  haptique: boolean;
  ecranAllume: boolean;
}

const DEFAUTS: Preferences = {
  notifTimeout: true,
  notifValidation: true,
  notifAutoClose: false,
  son: true,
  haptique: true,
  ecranAllume: false,
};

const CLE_PREFS = "lear_mobile_prefs";

export default function ParametresPage() {
  const { t } = useMobileT();
  const { lang, setLang } = useI18n();
  const { mode, setMode } = useMobileTheme();
  const [prefs, setPrefs] = useState<Preferences>(DEFAUTS);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_PREFS);
      if (brut) setPrefs({ ...DEFAUTS, ...(JSON.parse(brut) as Partial<Preferences>) });
    } catch {
      // Stockage indisponible : on reste sur les valeurs par défaut.
    }
  }, []);

  /* Chaque bascule est persistée immédiatement : pas de bouton « Enregistrer »,
     qui serait un piège sur mobile où l'on quitte l'écran d'un geste. */
  const basculer = (cle: keyof Preferences) => {
    const suivant = { ...prefs, [cle]: !prefs[cle] };
    setPrefs(suivant);
    try {
      window.localStorage.setItem(CLE_PREFS, JSON.stringify(suivant));
    } catch {
      // Préférence non persistée : sans effet sur la session courante.
    }
    toast.success(t("se_saved"));
  };

  const changerTheme = (m: ThemeMode) => {
    setMode(m);
    toast.success(t("se_saved"));
  };

  const changerLangue = (l: Lang) => {
    setLang(l);
    toast.success(t("se_saved"));
  };

  return (
    <>
      <TopBar titre={t("se_title")} sousTitre={t("se_subtitle")} retour />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {/* ── Apparence ── */}
        <Bloc titre={t("se_appearance")} icone={Palette}>
          <span className="block mb-2 text-xs text-gray-500 dark:text-gray-400">{t("se_theme")}</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "light" as const, label: t("se_light"), icone: Sun },
                { v: "dark" as const, label: t("se_dark"), icone: Moon },
                { v: "auto" as const, label: t("se_auto"), icone: Smartphone },
              ]
            ).map(({ v, label, icone: Icone }) => (
              <button
                key={v}
                type="button"
                onClick={() => changerTheme(v)}
                aria-pressed={mode === v}
                className={cn(
                  "flex flex-col items-center gap-2 py-3.5 rounded-xl border text-xs font-medium transition-colors",
                  mode === v
                    ? "border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
                    : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300",
                )}
              >
                <Icone className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          <Note>{t("se_themeNote")}</Note>
        </Bloc>

        {/* ── Langue ── */}
        <Bloc titre={t("se_language")} icone={Globe}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "fr" as const, label: "Français", code: "FR" },
                { v: "en" as const, label: "English", code: "EN" },
              ]
            ).map(({ v, label, code }) => (
              <button
                key={v}
                type="button"
                onClick={() => changerLangue(v)}
                aria-pressed={lang === v}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-colors",
                  lang === v
                    ? "border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
                    : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300",
                )}
              >
                <span
                  aria-hidden
                  className="m-num shrink-0 w-7 h-7 grid place-items-center rounded-lg bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-[10px] font-bold"
                >
                  {code}
                </span>
                {label}
              </button>
            ))}
          </div>
          <Note>{t("se_langNote")}</Note>
        </Bloc>

        {/* ── Notifications ── */}
        <Bloc titre={t("se_notifications")} icone={Bell}>
          <Bascule
            label={t("se_notifTimeout")}
            actif={prefs.notifTimeout}
            onChange={() => basculer("notifTimeout")}
          />
          <Bascule
            label={t("se_notifValidation")}
            actif={prefs.notifValidation}
            onChange={() => basculer("notifValidation")}
          />
          <Bascule
            label={t("se_notifAutoClose")}
            actif={prefs.notifAutoClose}
            onChange={() => basculer("notifAutoClose")}
          />
        </Bloc>

        {/* ── Poste de scan ── */}
        <Bloc titre={t("se_station")} icone={ScanLine}>
          <Bascule label={t("se_sound")} actif={prefs.son} onChange={() => basculer("son")} />
          <Bascule label={t("se_haptic")} actif={prefs.haptique} onChange={() => basculer("haptique")} />
          <Bascule
            label={t("se_keepAwake")}
            actif={prefs.ecranAllume}
            onChange={() => basculer("ecranAllume")}
          />
          <Note>{t("se_stationNote")}</Note>
        </Bloc>

        {/* ── Règles du processus (lecture seule) ── */}
        <Bloc titre={t("se_rules")} icone={ShieldCheck}>
          <Ligne label={t("se_pauseTimeout")} valeur={`${PAUSE_TIMEOUT_MIN} ${t("minutes")}`} />
          <Ligne label={t("se_tokenValidity")} valeur={`${QR_TOKEN_TTL_S} ${t("seconds")}`} />
          <Ligne
            label={t("se_dayCutoff")}
            valeur={`${CUTOFF_JOUR_COMPTABLE.heure}:${String(CUTOFF_JOUR_COMPTABLE.minute).padStart(2, "0")}`}
          />
          <Note>{t("se_rulesNote")}</Note>
        </Bloc>

        {/* ── À propos ── */}
        <Bloc titre={t("se_about")} icone={Info}>
          <Ligne label={t("se_version")} valeur="1.0.0" />
          <Ligne label={t("se_reference")} valeur="CDC-POINT-2026-V1.0" />
        </Bloc>
      </div>
    </>
  );
}

/* ── Primitives d'écran ────────────────────────────────────────────────── */

function Bloc({
  titre,
  icone: Icone,
  children,
}: {
  titre: string;
  icone: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-center gap-2 mb-3">
        <Icone className="w-4 h-4 text-[#CC0000]" />
        <h2 className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {titre}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** Interrupteur accessible — pas de dépendance UI supplémentaire pour si peu. */
function Bascule({
  label,
  actif,
  onChange,
}: {
  label: string;
  actif: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={onChange}
      className="w-full flex items-center justify-between gap-3 py-3 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0 text-left"
    >
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span
        aria-hidden
        className={cn(
          "shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors",
          /* Inactif : #2A2A2A se confondrait avec la carte #1C1C1C — on monte
             d'un cran pour que la piste de l'interrupteur reste perceptible. */
          actif ? "bg-[#CC0000]" : "bg-gray-300 dark:bg-[#3A3A3A]",
        )}
      >
        <span
          className={cn(
            "block w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
            actif && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="m-num text-sm text-gray-900 dark:text-gray-100 text-right">{valeur}</span>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 mb-0 text-xs leading-relaxed text-gray-400 dark:text-gray-400">{children}</p>
  );
}
