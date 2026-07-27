"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Settings } from "lucide-react";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT } from "@/lib/mobile/i18n";

interface TopBarProps {
  titre: string;
  /** Ligne de contexte : site, matricule, heure de rafraîchissement… */
  sousTitre?: string;
  /** Affiche la flèche de retour à la place du logo. */
  retour?: boolean;
  /** Contenu aligné à droite (compteur, action secondaire). */
  action?: React.ReactNode;
  /** Masque le raccourci vers le profil (écrans de détail). */
  sansProfil?: boolean;
}

export function TopBar({ titre, sousTitre, retour = false, action, sansProfil = false }: TopBarProps) {
  const router = useRouter();
  const { compte } = useMobileStore();
  const { t } = useMobileT();

  return (
    <header className="sticky top-0 z-30 m-safe-top bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2A2A] px-4 pb-3">
      <div className="flex items-center gap-3">
        {retour ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("cancel")}
            className="shrink-0 w-9 h-9 grid place-items-center rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div
            aria-hidden
            className="shrink-0 w-9 h-9 grid place-items-center rounded-xl text-white font-grotesk font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
          >
            L
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{titre}</h1>
          {sousTitre && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{sousTitre}</p>
          )}
        </div>

        {action}

        {!sansProfil && !retour && compte && (
          <Link
            href="/m/parametres"
            aria-label={t("nav_settings")}
            className="shrink-0 w-9 h-9 grid place-items-center rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-500 dark:text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}

        {!sansProfil && !retour && compte && (
          <Link
            href="/m/profil"
            aria-label={t("nav_profile")}
            className="shrink-0 w-9 h-9 grid place-items-center rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#2A2A2A] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#CC0000] transition-colors"
          >
            {compte.prenom[0]}
            {compte.nom[0]}
          </Link>
        )}
      </div>
    </header>
  );
}
