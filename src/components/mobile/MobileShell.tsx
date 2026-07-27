"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMobileStore } from "@/lib/mobile/store";
import { BottomNav } from "./BottomNav";

/** Routes accessibles sans compte connecté. */
const ROUTES_PUBLIQUES = ["/m/login"];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const { pret, compte, sessions } = useMobileStore();
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
    if (!compte) return {};
    const aValider = sessions.filter(
      (s) => s.statut === "en_attente_ouverture" || s.statut === "en_attente_cloture",
    ).length;
    const alertes = sessions.filter((s) => s.statut === "pause_timeout" || s.statut === "en_litige").length;
    const compteurs: Record<string, number> = { "/m": aValider, "/m/alertes": alertes };
    return compteurs;
  }, [compte, sessions]);

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
      {compte && !publique && <BottomNav badges={badges} />}
    </div>
  );
}
