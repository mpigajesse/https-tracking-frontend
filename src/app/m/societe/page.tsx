"use client";

import { useMemo, useState } from "react";
import { FileCheck2, FileX2, Send, ShieldAlert, Users } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DOCUMENTS_REQUIS } from "@/lib/mobile/constants";
import { useMobileT, type MobileKey, type MobileT } from "@/lib/mobile/i18n";
import { trouveSociete } from "@/lib/mobile/mock-data";
import {
  CLE_STATUT_PROFIL,
  actionsSociete,
  documentsManquants,
  tonStatutProfil,
} from "@/lib/mobile/profil-machine";
import { useMobileStore } from "@/lib/mobile/store";
import type { InterimaireProfil, StatutProfil } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

type Variante = "success" | "danger" | "warning" | "info" | "neutral";

const VARIANTE: Record<ReturnType<typeof tonStatutProfil>, Variante> = {
  attente: "warning",
  actif: "info",
  valide: "success",
  alerte: "danger",
};

/** Onglets de tri : l'ordre suit le parcours d'un dossier. */
const FILTRES: { cle: "tous" | StatutProfil; labelKey: MobileKey }[] = [
  { cle: "tous", labelKey: "soc_filterAll" },
  { cle: "brouillon", labelKey: "sp_brouillon" },
  { cle: "en_attente_validation", labelKey: "sp_en_attente_validation" },
  { cle: "valide", labelKey: "sp_valide" },
  { cle: "refuse", labelKey: "sp_refuse" },
];

/**
 * Espace mobile de la société d'intérim.
 *
 * Version consultation et soumission : la saisie d'un nouveau profil reste sur
 * l'application web, où les formulaires longs et les pièces jointes se
 * manipulent mieux. Ici, la société suit l'avancement de ses dossiers, coche
 * les documents fournis et soumet à l'administrateur.
 */
export default function SocietePage() {
  const { compte, interimaires, envoyerProfil, basculerDocument } = useMobileStore();
  const { t } = useMobileT();
  const [filtre, setFiltre] = useState<"tous" | StatutProfil>("tous");

  const societe = compte?.societeId ? trouveSociete(compte.societeId) : undefined;

  const listes = useMemo(
    () => (filtre === "tous" ? interimaires : interimaires.filter((p) => p.statutProfil === filtre)),
    [interimaires, filtre],
  );

  if (!compte) return null;

  const soumettre = (profil: InterimaireProfil) => {
    const r = envoyerProfil(profil.id, {
      type: "SOUMETTRE",
      at: new Date().toISOString(),
      par: `${compte.prenom} ${compte.nom}`,
    });
    if (!r.ok) {
      toast.error(t(r.erreur as MobileKey));
      return;
    }
    toast.success(t("soc_submitted"));
  };

  const corriger = (profil: InterimaireProfil) => {
    const r = envoyerProfil(profil.id, {
      type: "CORRIGER",
      at: new Date().toISOString(),
      par: `${compte.prenom} ${compte.nom}`,
    });
    if (!r.ok) toast.error(t(r.erreur as MobileKey));
  };

  return (
    <>
      <TopBar
        titre={t("soc_title")}
        sousTitre={`${societe?.nom ?? compte.nom} · ${interimaires.length} ${t("soc_subtitle")}`}
      />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {FILTRES.map((f) => {
            const actif = filtre === f.cle;
            const n =
              f.cle === "tous"
                ? interimaires.length
                : interimaires.filter((p) => p.statutProfil === f.cle).length;
            return (
              <button
                key={f.cle}
                type="button"
                onClick={() => setFiltre(f.cle)}
                aria-pressed={actif}
                className={cn(
                  "shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors",
                  actif
                    ? "bg-[#CC0000] text-white"
                    : "bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300",
                )}
              >
                {t(f.labelKey)} <span className="m-num opacity-70">{n}</span>
              </button>
            );
          })}
        </div>

        {listes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
            <span aria-hidden className="inline-grid place-items-center w-12 h-12 rounded-xl bg-[#F5F5F5] dark:bg-[#2A2A2A]">
              <Users className="w-6 h-6 text-gray-400" />
            </span>
            <h2 className="mt-4 mb-0 text-lg font-bold text-gray-900 dark:text-white">{t("soc_empty")}</h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("soc_emptyDesc")}
            </p>
          </div>
        ) : (
          <section className="space-y-2.5">
            {listes.map((p) => (
              <CarteProfil
                key={p.id}
                profil={p}
                t={t}
                onBasculerDocument={(doc) => basculerDocument(p.id, doc)}
                onSoumettre={() => soumettre(p)}
                onCorriger={() => corriger(p)}
              />
            ))}
          </section>
        )}
      </div>
    </>
  );
}

function CarteProfil({
  profil,
  t,
  onBasculerDocument,
  onSoumettre,
  onCorriger,
}: {
  profil: InterimaireProfil;
  t: MobileT;
  onBasculerDocument: (doc: InterimaireProfil["documents"][number]) => void;
  onSoumettre: () => void;
  onCorriger: () => void;
}) {
  const { peutModifier, peutSoumettre, peutCorriger } = actionsSociete(profil);
  const manquants = documentsManquants(profil);

  return (
    <article className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] space-y-3">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="shrink-0 w-10 h-10 grid place-items-center rounded-xl bg-[#F5F5F5] dark:bg-[#2A2A2A] font-grotesk font-semibold text-sm text-gray-700 dark:text-gray-200"
        >
          {profil.initiales}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
            {profil.prenom} {profil.nom}
          </span>
          <span className="block mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
            {profil.fonction} · {profil.site}
          </span>
        </span>
        <StatusBadge variant={VARIANTE[tonStatutProfil(profil.statutProfil)]}>
          {t(CLE_STATUT_PROFIL[profil.statutProfil] as MobileKey)}
        </StatusBadge>
      </header>

      {/* Documents — cochables tant que le dossier est un brouillon */}
      <div className="flex flex-wrap gap-1.5">
        {DOCUMENTS_REQUIS.map((d) => {
          const fourni = profil.documents.includes(d.cle);
          return (
            <button
              key={d.cle}
              type="button"
              disabled={!peutModifier}
              onClick={() => onBasculerDocument(d.cle)}
              aria-pressed={fourni}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-opacity",
                fourni
                  ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                  : "bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]",
                peutModifier ? "active:opacity-70" : "opacity-90",
              )}
            >
              {fourni ? <FileCheck2 className="w-3 h-3" /> : <FileX2 className="w-3 h-3" />}
              {d.libelle}
            </button>
          );
        })}
      </div>

      {profil.statutProfil === "brouillon" && manquants.length > 0 && (
        <p className="m-0 text-xs text-gray-400">{t("soc_incomplete", { n: manquants.length })}</p>
      )}

      {profil.motifRefus && profil.statutProfil !== "valide" && (
        <p className="m-0 flex items-start gap-2 text-xs leading-relaxed text-[#CC0000] dark:text-[#FF6666]">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>
            <strong>{t("soc_refusedBy")} : </strong>
            {profil.motifRefus}
          </span>
        </p>
      )}

      {peutSoumettre && (
        <button
          type="button"
          onClick={onSoumettre}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
        >
          <Send className="w-4 h-4" />
          {t("soc_submit")}
        </button>
      )}

      {peutCorriger && (
        <button
          type="button"
          onClick={onCorriger}
          className="w-full px-4 py-3 rounded-xl border border-[#CC0000] text-[#CC0000] dark:text-[#FF6666] text-sm font-semibold"
        >
          {t("soc_fix")}
        </button>
      )}
    </article>
  );
}
