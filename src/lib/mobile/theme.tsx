"use client";

/**
 * Gestion du thème de l'application mobile.
 *
 * Applique la classe `dark` sur `<html>` — même mécanisme que l'application
 * web (`@custom-variant dark` dans globals.css), mais **persisté** et capable
 * de suivre le réglage système, ce que le bouton du Topbar web ne fait pas.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "auto";

const CLE = "lear_theme";

interface ThemeContextType {
  mode: ThemeMode;
  /** Thème réellement appliqué : `auto` résolu selon la préférence système. */
  resolu: "light" | "dark";
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeContextType | undefined>(undefined);

function prefereSombre(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applique(sombre: boolean) {
  document.documentElement.classList.toggle("dark", sombre);
}

export function MobileThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [systemeSombre, setSystemeSombre] = useState(false);

  /* Lecture de la préférence stockée, après hydratation pour éviter tout
     écart de rendu serveur / client. */
  useEffect(() => {
    setSystemeSombre(prefereSombre());
    try {
      const stocke = window.localStorage.getItem(CLE) as ThemeMode | null;
      if (stocke === "light" || stocke === "dark" || stocke === "auto") setModeState(stocke);
    } catch {
      // Stockage indisponible : on reste sur le thème clair.
    }
  }, []);

  /* Suivi du réglage système, utile uniquement en mode auto. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const surChangement = (e: MediaQueryListEvent) => setSystemeSombre(e.matches);
    mq.addEventListener("change", surChangement);
    return () => mq.removeEventListener("change", surChangement);
  }, []);

  const resolu: "light" | "dark" =
    mode === "auto" ? (systemeSombre ? "dark" : "light") : mode;

  useEffect(() => {
    applique(resolu === "dark");
  }, [resolu]);

  /* Le thème est global au document : on le rend au thème clair en quittant
     l'app mobile, pour ne pas imposer la préférence à l'application web. */
  useEffect(() => {
    return () => applique(false);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(CLE, m);
    } catch {
      // Préférence non persistée : sans effet sur la session courante.
    }
  }, []);

  const valeur = useMemo(() => ({ mode, resolu, setMode }), [mode, resolu, setMode]);

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useMobileTheme(): ThemeContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMobileTheme doit être utilisé dans MobileThemeProvider");
  return ctx;
}
