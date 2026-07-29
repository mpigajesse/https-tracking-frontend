"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Briefcase, ClipboardCheck, History, QrCode, Radio, ScanLine, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMobileT } from "@/lib/mobile/i18n";
import type { Role } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

type LabelKey =
  | "nav_validate"
  | "nav_presents"
  | "nav_scan"
  | "nav_alerts"
  | "nav_history"
  | "soc_title"
  | "int_todayTitle"
  | "int_myQr"
  | "dispo_title";

interface Onglet {
  href: string;
  labelKey: LabelKey;
  icon: LucideIcon;
  /** L'onglet central, mis en avant : le geste réflexe du rôle. */
  proeminent?: boolean;
}

/**
 * Navigation par rôle : chaque profil ne voit que ses propres gestes.
 *
 * Le réceptionniste scanne mais ne valide pas ; le technicien valide mais ne
 * scanne pas. L'intérimaire n'a que trois onglets, sans jargon métier :
 * son interface doit rester lisible par quelqu'un qui l'ouvre une fois par jour.
 */
const ONGLETS_PAR_ROLE: Record<Role, Onglet[]> = {
  admin: [
    { href: "/m", labelKey: "nav_validate", icon: ClipboardCheck },
    { href: "/m/presents", labelKey: "nav_presents", icon: Users },
    { href: "/m/scan", labelKey: "nav_scan", icon: ScanLine, proeminent: true },
    { href: "/m/alertes", labelKey: "nav_alerts", icon: Bell },
    { href: "/m/historique", labelKey: "nav_history", icon: History },
  ],
  technicien: [
    { href: "/m", labelKey: "nav_validate", icon: ClipboardCheck },
    { href: "/m/presents", labelKey: "nav_presents", icon: Users },
    { href: "/m/alertes", labelKey: "nav_alerts", icon: Bell, proeminent: true },
    { href: "/m/disponibilite", labelKey: "dispo_title", icon: Radio },
    { href: "/m/historique", labelKey: "nav_history", icon: History },
  ],
  receptionniste: [
    { href: "/m/presents", labelKey: "nav_presents", icon: Users },
    { href: "/m/scan", labelKey: "nav_scan", icon: ScanLine, proeminent: true },
    { href: "/m/historique", labelKey: "nav_history", icon: History },
  ],
  societe: [
    { href: "/m/societe", labelKey: "soc_title", icon: Briefcase, proeminent: true },
    { href: "/m/presents", labelKey: "nav_presents", icon: Users },
    { href: "/m/historique", labelKey: "nav_history", icon: History },
  ],
  interimaire: [
    { href: "/m", labelKey: "int_todayTitle", icon: ClipboardCheck },
    { href: "/m/qr", labelKey: "int_myQr", icon: QrCode, proeminent: true },
    { href: "/m/historique", labelKey: "nav_history", icon: History },
  ],
};

interface BottomNavProps {
  role: Role;
  /** Compteurs par href, injectés par la coque. */
  badges?: Record<string, number>;
}

export function BottomNav({ role, badges = {} }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useMobileT();
  const onglets = ONGLETS_PAR_ROLE[role];
  const estActif = (href: string) => (href === "/m" ? pathname === "/m" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 m-safe-bottom bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#2A2A2A]"
    >
      <ul
        className="grid items-end h-[72px] px-1.5 m-0 list-none"
        style={{ gridTemplateColumns: `repeat(${onglets.length}, minmax(0, 1fr))` }}
      >
        {onglets.map((o) => {
          const actif = estActif(o.href);
          const badge = badges[o.href] ?? 0;
          const Icone = o.icon;

          if (o.proeminent) {
            return (
              <li key={o.href} className="grid place-items-center">
                <Link
                  href={o.href}
                  aria-label={t(o.labelKey)}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "relative grid place-items-center w-14 h-14 mb-3 rounded-2xl text-white transition-shadow",
                    actif ? "lear-glow" : "shadow-lg shadow-red-600/25",
                  )}
                  style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
                >
                  <Icone className="w-6 h-6" strokeWidth={2.1} />
                  {badge > 0 && (
                    <span
                      aria-label={`${badge} à traiter`}
                      className="m-num absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-white text-[#CC0000] text-[10px] font-bold ring-2 ring-[#CC0000]"
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          }

          return (
            <li key={o.href}>
              <Link
                href={o.href}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 pt-3 pb-3.5 transition-colors",
                  actif
                    ? "text-[#CC0000]"
                    : "text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                )}
              >
                <span className="relative leading-none">
                  <Icone className="w-5 h-5" strokeWidth={actif ? 2.3 : 1.8} />
                  {badge > 0 && (
                    <span
                      aria-label={`${badge} à traiter`}
                      className="m-num absolute -top-1.5 -right-2 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-[#CC0000] text-white text-[10px] font-bold"
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none text-center">{t(o.labelKey)}</span>
                {actif && (
                  <span
                    aria-hidden
                    className="absolute top-0 w-6 h-0.5 rounded-full bg-[#CC0000]"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
