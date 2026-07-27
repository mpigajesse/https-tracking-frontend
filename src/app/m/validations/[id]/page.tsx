"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { ActionSheet } from "@/components/mobile/ActionSheet";
import { AuditTimeline } from "@/components/mobile/AuditTimeline";
import { InterimaireCard } from "@/components/mobile/InterimaireCard";
import { SessionStatusBadge } from "@/components/mobile/SessionStatusBadge";
import { DUREE_SESSION_MAX_H, MOTIFS_REFUS } from "@/lib/mobile/constants";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT, type MobileT } from "@/lib/mobile/i18n";
import { calculeDuree, formatDuree, formatHeure } from "@/lib/mobile/time";
import { cn } from "@/lib/utils";

export default function ValidationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { compte, sessions, envoyer, now } = useMobileStore();
  const { t } = useMobileT();

  const [sheetRefus, setSheetRefus] = useState(false);
  const [motif, setMotif] = useState("");
  const [motifLibre, setMotifLibre] = useState("");

  const session = sessions.find((s) => s.id === id);
  if (!compte || !session) {
    return (
      <>
        <TopBar titre={t("val_notFound")} retour />
        <div className="m-scroll px-4 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("val_notFound")}
          </p>
        </div>
      </>
    );
  }

  const profil = trouveInterimaire(session.interimaireId);
  const duree = calculeDuree(session, now);
  const valideur = `${compte.prenom} ${compte.nom}`;
  const estOuverture = session.statut === "en_attente_ouverture";
  const dureeSuspecte = duree.brutMs > DUREE_SESSION_MAX_H * 3_600_000;
  const motifFinal = (motif === "__libre__" ? motifLibre : motif).trim();

  const approuver = () => {
    const at = new Date().toISOString();
    const r = envoyer(
      session.id,
      estOuverture
        ? { type: "VALIDER_OUVERTURE", at, par: valideur }
        : { type: "VALIDER_CLOTURE", at, par: valideur },
    );
    if (!r.ok) {
      toast.error(t(r.erreur));
      return;
    }
    toast.success(t(estOuverture ? "val_openedOk" : "val_closedOk"));
    router.replace("/m");
  };

  const rejeter = () => {
    if (!motifFinal) {
      toast.error(t("val_motifRequired"));
      return;
    }
    const at = new Date().toISOString();
    const r = envoyer(
      session.id,
      estOuverture
        ? { type: "REFUSER_OUVERTURE", at, par: valideur, motif: motifFinal }
        : { type: "SIGNALER_ANOMALIE", at, par: valideur, motif: motifFinal },
    );
    if (!r.ok) {
      toast.error(t(r.erreur));
      return;
    }
    setSheetRefus(false);
    toast.success(t(estOuverture ? "val_refusedOk" : "val_anomalyOk"));
    router.replace("/m");
  };

  return (
    <>
      <TopBar
        titre={t(estOuverture ? "val_identity" : "val_closure")}
        sousTitre={`${session.id} · ${session.site}`}
        retour
        action={<SessionStatusBadge statut={session.statut} />}
      />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {profil && (
          <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
            <InterimaireCard profil={profil} detaille={estOuverture} />
          </section>
        )}

        {estOuverture ? (
          <ConsigneControle t={t} />
        ) : (
          <RecapDuree
            brut={duree.brutMs}
            pauses={duree.pausesMs}
            net={duree.netMs}
            debut={session.ouvertureValideeA ?? session.debut}
            fin={session.fin ?? new Date(now).toISOString()}
            suspecte={dureeSuspecte}
            t={t}
          />
        )}

        <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
          <span className="block mb-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("de_audit")}
          </span>
          <AuditTimeline entrees={session.audit} recentDabord limite={6} />
        </section>

        {/* Décision : approuver domine visuellement, refuser reste accessible */}
        <div className="space-y-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={approuver}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            <Check className="w-4 h-4" />
            {t(estOuverture ? "val_approveOpen" : "val_approveClose")}
          </motion.button>
          <button
            type="button"
            onClick={() => setSheetRefus(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#1C1C1C] text-[#CC0000] dark:text-[#FF6666] text-sm font-medium hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
          >
            {estOuverture ? <ShieldAlert className="w-4 h-4" /> : <TriangleAlert className="w-4 h-4" />}
            {t(estOuverture ? "val_refuseOpen" : "val_reportAnomaly")}
          </button>
        </div>
      </div>

      <ActionSheet
        ouvert={sheetRefus}
        onFermer={() => setSheetRefus(false)}
        titre={t(estOuverture ? "val_motifOpen" : "val_motifAnomaly")}
        description={t("val_motifDesc")}
      >
        <div className="space-y-2">
          {[...MOTIFS_REFUS, "__libre__"].map((m) => (
            <label
              key={m}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl border text-sm cursor-pointer transition-colors",
                motif === m
                  ? "border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
                  : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300",
              )}
            >
              <input
                type="radio"
                name="motif"
                checked={motif === m}
                onChange={() => setMotif(m)}
                className="accent-[#CC0000]"
              />
              {m === "__libre__" ? t("val_otherMotif") : m}
            </label>
          ))}

          {motif === "__libre__" && (
            <textarea
              className="w-full min-h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm resize-none placeholder:text-gray-400 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
              placeholder={t("val_motifPlaceholder")}
              value={motifLibre}
              onChange={(e) => setMotifLibre(e.target.value)}
              autoFocus
            />
          )}

          <button
            type="button"
            onClick={rejeter}
            disabled={!motifFinal}
            className="w-full mt-1 px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {t(estOuverture ? "val_confirmRefuse" : "val_confirmAnomaly")}
          </button>
        </div>
      </ActionSheet>
    </>
  );
}

function ConsigneControle({ t }: { t: MobileT }) {
  return (
    <section className="p-4 rounded-xl border-l-4 border-l-yellow-500 border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-yellow-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-500">
          {t("val_doubleTitle")}
        </span>
      </div>
      <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {t("val_doubleDesc")}
      </p>
    </section>
  );
}

function RecapDuree({
  brut,
  pauses,
  net,
  debut,
  fin,
  suspecte,
  t,
}: {
  brut: number;
  pauses: number;
  net: number;
  debut: string;
  fin: string;
  suspecte: boolean;
  t: MobileT;
}) {
  return (
    <section className="p-5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t("val_computed")}
      </span>

      <div className="m-num font-grotesk mt-2 text-4xl font-bold text-gray-900 dark:text-white">
        {formatDuree(net)}
      </div>
      <p className="m-num mt-1.5 mb-0 text-xs text-gray-500 dark:text-gray-400">
        {formatDuree(brut)} {t("val_grossMinus")} {formatDuree(pauses)} {t("val_ofPauses")}
      </p>

      <div className="flex gap-2 mt-4 flex-wrap">
        <span className="m-num px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-xs text-gray-600 dark:text-gray-300">
          {t("val_entry")} {formatHeure(debut)}
        </span>
        <span className="m-num px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-xs text-gray-600 dark:text-gray-300">
          {t("val_exit")} {formatHeure(fin)}
        </span>
      </div>

      {suspecte && (
        <p className="mt-4 mb-0 px-3.5 py-3 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] border border-red-200 dark:border-red-900 text-xs leading-relaxed text-[#CC0000] dark:text-[#FF6666]">
          {t("val_tooLong", { n: DUREE_SESSION_MAX_H })}
        </p>
      )}
    </section>
  );
}
