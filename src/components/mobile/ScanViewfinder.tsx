"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Loader2, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanViewfinderProps {
  /** Passe le viseur en état « lecture du code ». */
  enLecture?: boolean;
  /** Grise le viseur quand aucun scan n'est possible. */
  inactif?: boolean;
}

/**
 * Viseur de scan. La caméra n'est pas branchée : le mobile est un prototype
 * front, la lecture réelle du QR viendra avec l'intégration native / getUserMedia.
 * Le viseur reste fidèle au geste attendu au poste.
 */
export function ScanViewfinder({ enLecture = false, inactif = false }: ScanViewfinderProps) {
  const reduit = useReducedMotion();

  return (
    <div
      className={cn(
        "m-trame relative aspect-square rounded-2xl overflow-hidden border transition-opacity",
        "bg-[#111111] border-gray-200 dark:border-[#2A2A2A]",
        inactif && "opacity-40",
      )}
    >
      {/* Coins du cadre de visée */}
      <span aria-hidden className="absolute top-6 left-6 w-8 h-8 rounded-tl-lg border-t-2 border-l-2 border-[#CC0000]" />
      <span aria-hidden className="absolute top-6 right-6 w-8 h-8 rounded-tr-lg border-t-2 border-r-2 border-[#CC0000]" />
      <span aria-hidden className="absolute bottom-6 left-6 w-8 h-8 rounded-bl-lg border-b-2 border-l-2 border-[#CC0000]" />
      <span aria-hidden className="absolute bottom-6 right-6 w-8 h-8 rounded-br-lg border-b-2 border-r-2 border-[#CC0000]" />

      {/* Ligne de balayage */}
      {!inactif && !reduit && (
        <motion.span
          aria-hidden
          initial={{ top: "18%" }}
          animate={{ top: ["18%", "82%", "18%"] }}
          transition={{ duration: enLecture ? 1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[12%] right-[12%] h-0.5 rounded-full bg-[#CC0000] shadow-[0_0_18px_#CC0000]"
        />
      )}

      <div className="absolute inset-0 grid place-items-center">
        {enLecture ? (
          <span className="grid justify-items-center gap-2.5 text-[#FF6666]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-medium uppercase tracking-wide">Lecture du code…</span>
          </span>
        ) : (
          <QrCode className="w-14 h-14 text-gray-600" strokeWidth={1.1} />
        )}
      </div>
    </div>
  );
}
