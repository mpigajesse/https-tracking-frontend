"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ClipboardCheck, LogOut, Monitor, Users } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT } from "@/lib/mobile/i18n";

export default function ProfilPage() {
  const { compte, sessions, deconnexion } = useMobileStore();
  const { t } = useMobileT();
  const router = useRouter();
  if (!compte) return null;

  const nom = `${compte.prenom} ${compte.nom}`;
  const traitees = sessions.filter(
    (s) => s.valideParOuverture === nom || s.valideParCloture === nom,
  ).length;

  const seDeconnecter = () => {
    deconnexion();
    router.replace("/m/login");
  };

  return (
    <>
      <TopBar titre={t("nav_profile")} sousTitre={compte.matricule} retour />

      <div className="m-scroll px-4 pt-4 space-y-4">
        <section className="p-5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] flex items-center gap-4">
          <div
            aria-hidden
            className="shrink-0 w-14 h-14 grid place-items-center rounded-2xl text-white font-grotesk font-bold text-xl"
            style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
          >
            {compte.prenom[0]}
            {compte.nom[0]}
          </div>
          <div className="min-w-0">
            <p className="m-0 text-lg font-bold text-gray-900 dark:text-white truncate">{nom}</p>
            <p className="mt-0.5 mb-0 text-xs text-gray-500 dark:text-gray-400 truncate">
              {t(compte.role === "admin" ? "role_admin" : "role_receptionniste")} · {compte.matricule}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label={t("pf_handled")}
            valeur={traitees}
            icone={<ClipboardCheck className="w-5 h-5 text-green-600" />}
            fond="bg-green-50 dark:bg-green-900/20"
            texte="text-green-600"
          />
          <Stat
            label={t("pf_visible")}
            valeur={sessions.length}
            icone={<Users className="w-5 h-5 text-blue-600" />}
            fond="bg-blue-50 dark:bg-blue-900/20"
            texte="text-blue-600"
          />
        </div>

        <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
          <span className="block mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("pf_scopeTitle")}
          </span>
          <Ligne icone={<Building2 className="w-4 h-4" />} label={t("pf_scope")} valeur={compte.site} />
          <Ligne
            label={t("pf_role")}
            valeur={t(compte.role === "admin" ? "role_admin" : "role_receptionniste")}
          />
        </section>

        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
        >
          <Monitor className="w-4 h-4" />
          {t("pf_openWeb")}
        </Link>

        <button
          type="button"
          onClick={seDeconnecter}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#1C1C1C] text-[#CC0000] dark:text-[#FF6666] text-sm font-medium hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("pf_logout")}
        </button>

        <p className="m-0 text-center text-xs text-gray-400 dark:text-gray-400">
          Lear Track mobile · réf. CDC-POINT-2026-V1.0
        </p>
      </div>
    </>
  );
}

function Stat({
  label,
  valeur,
  icone,
  fond,
  texte,
}: {
  label: string;
  valeur: number;
  icone: React.ReactNode;
  fond: string;
  texte: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${fond}`}>{icone}</div>
        <div className="min-w-0">
          <div className={`m-num font-grotesk text-2xl font-bold ${texte}`}>{valeur}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</div>
        </div>
      </div>
    </div>
  );
}

function Ligne({
  icone,
  label,
  valeur,
}: {
  icone?: React.ReactNode;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
      <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {icone}
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{valeur}</span>
    </div>
  );
}
