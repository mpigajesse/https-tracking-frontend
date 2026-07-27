"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Check, ScanLine, X } from "lucide-react";
import { QR_TOKEN_TTL_S } from "@/lib/mobile/constants";
import { CLE_SCAN } from "@/lib/mobile/session-machine";
import { useMobileT, type MobileKey } from "@/lib/mobile/i18n";
import type { InterimaireProfil, ScanKind } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

/**
 * Phases de la lecture, calquées sur le comportement d'un vrai lecteur QR.
 * Les durées sont volontairement lisibles à l'œil : la simulation sert à
 * démontrer le geste au poste, pas à imiter la vitesse d'un capteur.
 */
const PHASES = [
  { id: "viser", cle: "scan_phase1", ms: 900 },
  { id: "detecte", cle: "scan_phase2", ms: 650 },
  { id: "lecture", cle: "scan_phase3", ms: 850 },
  { id: "valide", cle: "scan_phase4", ms: 500 },
] as const;

type PhaseId = (typeof PHASES)[number]["id"];

interface ScanSimulationProps {
  profil: InterimaireProfil;
  kind: ScanKind;
  /** Appelé une fois la lecture terminée : c'est là que le scan est enregistré. */
  onTermine: () => void;
  onAnnuler: () => void;
}

export function ScanSimulation({ profil, kind, onTermine, onAnnuler }: ScanSimulationProps) {
  const [index, setIndex] = useState(0);
  const reduit = useReducedMotion();
  const { t } = useMobileT();
  const phase: PhaseId = PHASES[index].id;
  const detecte = index >= 1;

  /* Jeton de session : même charge utile que celle attendue par le backend,
     avec expiration courte — c'est le volet anti-duplication du BPMN. */
  const payload = useMemo(
    () =>
      JSON.stringify({
        v: 1,
        int: profil.id,
        cin: profil.cin,
        site: profil.site,
        exp: Date.now() + QR_TOKEN_TTL_S * 1000,
        tok: Math.random().toString(36).slice(2, 10).toUpperCase(),
      }),
    [profil],
  );

  /* Déroulé automatique des phases, puis remontée du résultat. */
  useEffect(() => {
    const duree = reduit ? 120 : PHASES[index].ms;
    const minuterie = window.setTimeout(() => {
      if (index < PHASES.length - 1) {
        setIndex((i) => i + 1);
        return;
      }
      onTermine();
    }, duree);
    return () => window.clearTimeout(minuterie);
  }, [index, reduit, onTermine]);

  const progression = ((index + 1) / PHASES.length) * 100;
  const accent = detecte ? "#16A34A" : "#CC0000";

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Lecture du QR Code de ${profil.prenom} ${profil.nom}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ y: 24, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="w-full max-w-[420px] rounded-2xl overflow-hidden border border-[#1C1C1C] bg-[#111111] shadow-2xl"
        >
          {/* En-tête */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1C1C1C]">
            <ScanLine className="w-4 h-4 text-[#CC0000]" />
            <div className="flex-1 min-w-0">
              <p className="m-0 text-sm font-medium text-white truncate">{t(CLE_SCAN[kind] as MobileKey)}</p>
              <p className="mt-0.5 mb-0 text-xs text-gray-400 truncate">
                {profil.prenom} {profil.nom}
              </p>
            </div>
            <button
              type="button"
              onClick={onAnnuler}
              aria-label={t("scan_cancelRead")}
              className="shrink-0 w-8 h-8 grid place-items-center rounded-lg border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Champ de vision de la caméra */}
          <div className="m-trame relative aspect-square bg-[#0A0A0A]">
            {/* Le badge de l'intérimaire entre dans le champ puis se stabilise */}
            <motion.div
              initial={{ scale: 0.55, y: 46, rotate: -7, opacity: 0 }}
              animate={
                detecte
                  ? { scale: 1, y: 0, rotate: 0, opacity: 1 }
                  : { scale: 0.86, y: 14, rotate: -3, opacity: 1 }
              }
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="absolute inset-0 grid place-items-center"
            >
              <div className="rounded-xl bg-white p-3 shadow-2xl">
                <QRCodeSVG value={payload} size={148} level="M" bgColor="#ffffff" fgColor="#111111" />
                <p className="m-num mt-2 mb-0 text-center text-[10px] font-semibold text-gray-500">
                  {profil.cin}
                </p>
              </div>
            </motion.div>

            {/* Coins de visée : rouge en recherche, vert dès la détection */}
            {(
              [
                "top-6 left-6 rounded-tl-lg border-t-2 border-l-2",
                "top-6 right-6 rounded-tr-lg border-t-2 border-r-2",
                "bottom-6 left-6 rounded-bl-lg border-b-2 border-l-2",
                "bottom-6 right-6 rounded-br-lg border-b-2 border-r-2",
              ] as const
            ).map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={cn("absolute w-9 h-9 transition-colors duration-300", pos)}
                style={{ borderColor: accent }}
              />
            ))}

            {/* Ligne de balayage — disparaît une fois le code verrouillé */}
            {!detecte && !reduit && (
              <motion.span
                aria-hidden
                initial={{ top: "18%" }}
                animate={{ top: ["18%", "82%", "18%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[12%] right-[12%] h-0.5 rounded-full bg-[#CC0000] shadow-[0_0_18px_#CC0000]"
              />
            )}

            {/* Confirmation de lecture */}
            {phase === "valide" && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 grid place-items-center bg-black/55"
              >
                <span className="w-16 h-16 grid place-items-center rounded-full bg-green-600 text-white">
                  <Check className="w-8 h-8" strokeWidth={3} />
                </span>
              </motion.div>
            )}
          </div>

          {/* État de la lecture */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-sm font-medium transition-colors"
                style={{ color: detecte ? "#4ADE80" : "#F5F5F5" }}
              >
                {t(PHASES[index].cle)}
              </span>
              <span className="m-num text-xs text-gray-400">
                {index + 1}/{PHASES.length}
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={Math.round(progression)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("scan_phase3")}
              className="mt-3 h-1 rounded-full bg-[#2A2A2A] overflow-hidden"
            >
              <motion.div
                animate={{ width: `${progression}%` }}
                transition={{ duration: 0.35 }}
                className="h-full rounded-full"
                style={{ background: accent }}
              />
            </div>

            <p className="m-num mt-3 mb-0 text-xs text-gray-400">
              {t("scan_tokenNote", { n: QR_TOKEN_TTL_S })}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
