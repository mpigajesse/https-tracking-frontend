"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Search } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { ScanViewfinder } from "@/components/mobile/ScanViewfinder";
import { ScanSimulation } from "@/components/mobile/ScanSimulation";
import { SortieMotifSheet } from "@/components/mobile/SortieMotifSheet";
import { CLE_SCAN, scanDisponible } from "@/lib/mobile/session-machine";
import { useMobileT, type MobileKey, type MobileT } from "@/lib/mobile/i18n";
import { MOTIFS_CTRL_AUTO, MOTIFS_SORTIE } from "@/lib/mobile/constants";
import { SITES_CONNUS } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import {
  type CtrlAutoFailure,
  type InterimaireProfil,
  type MotifSortie,
  type ScanKind,
} from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

/** Lecture en cours : quel badge est présenté au lecteur, et pour quel scan. */
type Lecture = { profil: InterimaireProfil; kind: ScanKind } | null;

/**
 * Poste de scan.
 *
 * L'intérimaire n'a pas de compte : il présente son QR Code au poste et
 * l'utilisateur du mobile enregistre le scan en son nom. Le type de scan
 * (entrée, pause, retour, sortie) est **déduit de l'état de sa session** —
 * l'opérateur n'a jamais à le choisir, ce qui supprime toute saisie erronée.
 */
export default function ScanPage() {
  const { compte, interimaires, sessionActive, scannerEntree, envoyer } = useMobileStore();
  const { t } = useMobileT();
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [lecture, setLecture] = useState<Lecture>(null);
  const [echecSimule, setEchecSimule] = useState<CtrlAutoFailure | "">("");
  /** Profil dont on attend le motif de sortie, après lecture du QR. */
  const [sortiePour, setSortiePour] = useState<InterimaireProfil | null>(null);

  /* Le cloisonnement par site est fait par le store ; il ne reste ici que la
     recherche textuelle. */
  const portee = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return interimaires;
    return interimaires.filter((i) =>
      `${i.prenom} ${i.nom} ${i.fonction} ${i.agence} ${i.cin}`.toLowerCase().includes(q),
    );
  }, [interimaires, recherche]);

  /* Le scan n'est enregistré qu'à la fin de la lecture du QR, jamais au tap :
     l'ordre reflète le geste réel au poste. */
  const enregistrer = useCallback(() => {
    if (!lecture) return;
    const { profil, kind } = lecture;
    setLecture(null);
    const at = new Date().toISOString();

    if (kind === "entree") {
      const creee = scannerEntree(profil.id, profil.site, echecSimule || undefined);
      if (creee.statut === "refusee") {
        // Le motif vient de la session : les contrôles réels priment sur la simulation.
        toast.error(`${t("scan_refused")} — ${creee.motif ?? ""}`);
        return;
      }
      toast.success(t("scan_entryOk"));
      router.push("/m");
      return;
    }

    // Une sortie appelle d'abord un motif : fin de journée, chantier ou course.
    if (kind === "sortie") {
      setSortiePour(profil);
      return;
    }

    // Une sortie temporaire ne s'atteint que par le choix de motif ci-dessus :
    // `scanDisponible` ne propose jamais ce type directement.
    if (kind === "sortie_temporaire") return;

    const session = sessionActive(profil.id);
    if (!session) {
      toast.error(t("scan_noSession"));
      return;
    }
    const r = envoyer(session.id, { type: "SCAN", kind, at });
    if (!r.ok) {
      toast.error(t(r.erreur));
      return;
    }
    toast.success(`${t(CLE_SCAN[kind] as MobileKey)} — ${t("scan_recorded")}`);
  }, [lecture, echecSimule, scannerEntree, sessionActive, envoyer, router, t]);

  /** Applique le motif choisi : clôture de la journée, ou suspension de 15 min. */
  const confirmerSortie = useCallback(
    (motif: MotifSortie, precision?: string, siteDestination?: string) => {
      const profil = sortiePour;
      setSortiePour(null);
      if (!profil) return;

      const session = sessionActive(profil.id);
      if (!session) {
        toast.error(t("scan_noSession"));
        return;
      }
      const at = new Date().toISOString();

      const r =
        motif === "fin_journee"
          ? envoyer(session.id, { type: "SCAN", kind: "sortie", at })
          : envoyer(session.id, {
              type: "SCAN_SORTIE_TEMPORAIRE",
              motif,
              at,
              precision,
              siteDestination,
            });

      if (!r.ok) {
        toast.error(t(r.erreur));
        return;
      }
      toast.success(t("sortie_registered", { motif: MOTIFS_SORTIE[motif].toLowerCase() }));
      if (motif === "fin_journee") router.push("/m");
    },
    [sortiePour, sessionActive, envoyer, router, t],
  );

  if (!compte) return null;

  return (
    <>
      <TopBar titre={t("scan_title")} sousTitre={`${compte.site} · ${t("scan_subtitle")}`} />

      <div className="m-scroll px-4 pt-4 space-y-4">
        <ScanViewfinder />

        <p className="m-0 text-sm leading-relaxed text-center text-gray-500 dark:text-gray-400">
          {t("scan_hint")}
        </p>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("scan_searchPlaceholder")}
            aria-label={t("scan_searchPlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
          />
        </div>

        <section className="space-y-2.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("scan_listTitle")} — {portee.length}
          </span>

          {portee.length === 0 && (
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400">{t("noResult")}</p>
          )}

          {portee.map((profil) => {
            const session = sessionActive(profil.id);
            const action = scanDisponible(session);

            return (
              <div
                key={profil.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] space-y-3"
              >
                <div className="flex items-center gap-3">
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
                </div>

                {action.actif ? (
                  <button
                    type="button"
                    onClick={() => setLecture({ profil, kind: action.kind })}
                    disabled={lecture !== null}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                      action.kind === "entree"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "border border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-800 dark:text-gray-200 hover:border-[#CC0000]",
                    )}
                  >
                    {t(action.libelleKey as MobileKey)}
                  </button>
                ) : (
                  <p className="m-0 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {t(action.libelleKey as MobileKey)}.
                    </span>{" "}
                    {action.raisonKey && t(action.raisonKey as MobileKey)}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <SimulateurControles valeur={echecSimule} onChange={setEchecSimule} t={t} />
      </div>

      {lecture && (
        <ScanSimulation
          profil={lecture.profil}
          kind={lecture.kind}
          onTermine={enregistrer}
          onAnnuler={() => setLecture(null)}
        />
      )}

      <SortieMotifSheet
        ouvert={sortiePour !== null}
        onFermer={() => setSortiePour(null)}
        siteSession={sortiePour?.site ?? compte.site}
        sites={SITES_CONNUS}
        onConfirmer={confirmerSortie}
      />
    </>
  );
}

/** Permet de démontrer le scénario « refus / anti-fraude » du BPMN. */
function SimulateurControles({
  valeur,
  onChange,
  t,
}: {
  valeur: CtrlAutoFailure | "";
  onChange: (v: CtrlAutoFailure | "") => void;
  t: MobileT;
}) {
  return (
    <details className="rounded-xl border border-dashed border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-4">
      <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        {t("scan_simTitle")}
      </summary>
      <div className="mt-3 space-y-2">
        {(["", ...Object.keys(MOTIFS_CTRL_AUTO)] as (CtrlAutoFailure | "")[]).map((k) => (
          <label
            key={k || "aucun"}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors",
              valeur === k
                ? "border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
                : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300",
            )}
          >
            <input
              type="radio"
              name="echec"
              checked={valeur === k}
              onChange={() => onChange(k)}
              className="accent-[#CC0000]"
            />
            {k ? MOTIFS_CTRL_AUTO[k] : t("scan_simNone")}
          </label>
        ))}
      </div>
      <p className="mt-3 mb-0 text-xs leading-relaxed text-gray-400 dark:text-gray-400">
        {t("scan_simNote")}
      </p>
    </details>
  );
}
