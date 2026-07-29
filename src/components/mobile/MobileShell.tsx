"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMobileStore } from "@/lib/mobile/store";
import { BottomNav } from "./BottomNav";

/** Routes accessibles sans compte connecté. */
const ROUTES_PUBLIQUES = ["/m/login"];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const { pret, compte, sessions, nonLues } = useMobileStore();
  const pathname = usePathname();
  const router = useRouter();

  const publique = ROUTES_PUBLIQUES.includes(pathname);

  useEffect(() => {
    if (!pret) return;
    if (!compte && !publique) router.replace("/m/login");
    if (compte && publique) router.replace("/m");
  }, [pret, compte, publique, router]);

  /* Compteurs de la barre de navigation : ce qui attend une action humaine. */
  const badges = useMemo<Record<string, number>>(() => {
    if (!compte) return {} as Record<string, number>;
    const aValider = sessions.filter(
      (s) => s.statut === "en_attente_ouverture" || s.statut === "en_attente_cloture",
    ).length;
    // Une sortie en cours n'est pas une alerte : elle le devient au dépassement,
    // et la session bascule alors en `cloturee_sortie_depassee`.
    const alertes = sessions.filter(
      (s) => s.statut === "pause_timeout" || s.statut === "en_litige",
    ).length;
    return {
      "/m": aValider,
      "/m/alertes": Math.max(alertes, nonLues),
    };
  }, [compte, sessions, nonLues]);

  if (!pret) {
    return (
      <div className="m-viewport bg-[#F5F5F5] dark:bg-[#111111] grid place-items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">Chargement…</span>
      </div>
    );
  }

  // Pendant la redirection, on n'affiche pas un écran auquel l'utilisateur n'a pas droit.
  if (!compte && !publique) {
    return <div className="m-viewport bg-[#F5F5F5] dark:bg-[#111111]" />;
  }

  return (
    <div className="m-viewport bg-[#F5F5F5] dark:bg-[#111111]">
      {children}
      {compte && !publique && <BottomNav role={compte.role} badges={badges} />}
    </div>
  );
}
