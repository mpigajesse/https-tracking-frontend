"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ActionSheetProps {
  ouvert: boolean;
  titre: string;
  description?: string;
  onFermer: () => void;
  children: React.ReactNode;
}

/**
 * Feuille d'action glissant du bas — le geste attendu sur mobile pour une
 * décision engageante (refus, arbitrage), plutôt qu'une boîte de dialogue centrée.
 */
export function ActionSheet({ ouvert, titre, description, onFermer, children }: ActionSheetProps) {
  useEffect(() => {
    if (!ouvert) return;
    const surEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    document.addEventListener("keydown", surEchap);
    return () => document.removeEventListener("keydown", surEchap);
  }, [ouvert, onFermer]);

  return (
    <AnimatePresence>
      {ouvert && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFermer}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titre}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[61] max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#1C1C1C] border-t border-gray-200 dark:border-[#2A2A2A] px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl"
          >
            <div
              aria-hidden
              className="w-10 h-1 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-[#2A2A2A]"
            />

            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white m-0">{titre}</h2>
                {description && (
                  <p className="mt-1.5 mb-0 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onFermer}
                aria-label="Fermer"
                className="shrink-0 w-8 h-8 grid place-items-center rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
