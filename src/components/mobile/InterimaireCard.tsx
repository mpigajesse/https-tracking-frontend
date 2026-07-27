"use client";

import { BadgeCheck, Building2, IdCard, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMobileT } from "@/lib/mobile/i18n";
import type { InterimaireProfil } from "@/lib/mobile/types";

interface InterimaireCardProps {
  profil: InterimaireProfil;
  /** Développe les pièces à contrôler (CIN, assurance, affectation). */
  detaille?: boolean;
}

/**
 * Bloc d'identité présenté au valideur. C'est le support du contrôle humain :
 * la moitié « personne » de la double validation anti-fraude du BPMN.
 */
export function InterimaireCard({ profil, detaille = false }: InterimaireCardProps) {
  const { t } = useMobileT();

  return (
    <div>
      <div className="flex items-center gap-3.5">
        {/* Photo absente en mock : initiales sur pastille, jamais un avatar générique */}
        <div
          aria-hidden
          className="shrink-0 w-14 h-14 grid place-items-center rounded-2xl bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#2A2A2A] font-grotesk font-semibold text-lg text-gray-700 dark:text-gray-200"
        >
          {profil.initiales}
        </div>

        <div className="min-w-0">
          <p className="m-0 text-base font-bold text-gray-900 dark:text-white truncate">
            {profil.prenom} {profil.nom}
          </p>
          <p className="mt-0.5 mb-0 text-xs text-gray-500 dark:text-gray-400 truncate">
            {profil.fonction} · {profil.agence}
          </p>
        </div>
      </div>

      {detaille && (
        <dl className="mt-4 mb-0 grid gap-0">
          <Piece icone={IdCard} label={t("id_cin")} valeur={profil.cin} />
          <Piece
            icone={ShieldCheck}
            label={t("id_insurance")}
            valeur={t("id_insuranceUntil", { d: profil.assuranceValideJusqu })}
          />
          <Piece icone={Building2} label={t("id_assignment")} valeur={profil.site} />
          <Piece icone={BadgeCheck} label={t("id_contractEnd")} valeur={profil.contratFin} />
        </dl>
      )}
    </div>
  );
}

function Piece({ icone: Icone, label, valeur }: { icone: LucideIcon; label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
      <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Icone className="w-4 h-4" />
        {label}
      </dt>
      <dd className="m-0 text-sm text-gray-900 dark:text-gray-100 text-right">{valeur}</dd>
    </div>
  );
}
