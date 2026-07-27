"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BellOff, Clock, DoorClosed, PencilLine, TimerReset } from "lucide-react";
import toast from "react-hot-toast";
import { TopBar } from "@/components/mobile/TopBar";
import { ActionSheet } from "@/components/mobile/ActionSheet";
import { SessionStatusBadge } from "@/components/mobile/SessionStatusBadge";
import { PROLONGATIONS_MIN } from "@/lib/mobile/constants";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT, type MobileT } from "@/lib/mobile/i18n";
import { formatChrono, formatHeure, pauseEnCours, resteAvantEcheance } from "@/lib/mobile/time";
import type { Session } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

type Arbitrage = { session: Session; option: "A" | "B" | "C" } | null;

/**
 * Écran d'arbitrage du scénario « timeout de pause » : le système a alerté,
 * l'opérateur tranche entre les trois options prévues au BPMN.
 */
export default function AlertesPage() {
  const { compte, sessions, envoyer, now } = useMobileStore();
  const { t } = useMobileT();
  const [arbitrage, setArbitrage] = useState<Arbitrage>(null);

  const timeouts = sessions.filter((s) => s.statut === "pause_timeout");
  const litiges = sessions.filter((s) => s.statut === "en_litige");
  const aVerifier = sessions.filter((s) => s.aVerifier && s.statut !== "en_litige" && s.fin);

  if (!compte) return null;
  const valideur = `${compte.prenom} ${compte.nom}`;
  const total = timeouts.length + litiges.length;

  return (
    <>
      <TopBar
        titre={t("al_title")}
        sousTitre={`${compte.site} · ${t("al_subtitle")}`}
        action={
          <span
            className={cn(
              "m-num shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
              total > 0
                ? "bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]"
                : "bg-gray-100 text-gray-500 dark:bg-[#2A2A2A] dark:text-gray-400",
            )}
          >
            {total}
          </span>
        }
      />

      <div className="m-scroll px-4 pt-4 space-y-6">
        {total === 0 && aVerifier.length === 0 && <AucuneAlerte t={t} />}

        {timeouts.length > 0 && (
          <section>
            <EnTete titre={t("al_timeouts")} compte={timeouts.length} couleur="text-[#CC0000]" />
            <div className="space-y-3">
              {timeouts.map((s) => (
                <CarteTimeout
                  key={s.id}
                  session={s}
                  now={now}
                  t={t}
                  onArbitrer={(o) => setArbitrage({ session: s, option: o })}
                />
              ))}
            </div>
          </section>
        )}

        {litiges.length > 0 && (
          <section>
            <EnTete titre={t("al_disputes")} compte={litiges.length} couleur="text-[#CC0000]" />
            <div className="space-y-2.5">
              {litiges.map((s) => (
                <LigneSimple key={s.id} session={s} detail={s.motif ?? t("al_anomalySignaled")} />
              ))}
            </div>
          </section>
        )}

        {aVerifier.length > 0 && (
          <section>
            <EnTete titre={t("al_toCheck")} compte={aVerifier.length} couleur="text-yellow-600" />
            <div className="space-y-2.5">
              {aVerifier.map((s) => (
                <LigneSimple
                  key={s.id}
                  session={s}
                  detail={s.motif ?? t("al_nonNominal")}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {arbitrage && (
        <SheetArbitrage
          session={arbitrage.session}
          option={arbitrage.option}
          valideur={valideur}
          onFermer={() => setArbitrage(null)}
          onEnvoyer={envoyer}
          t={t}
        />
      )}
    </>
  );
}

/* ── Sous-composants ───────────────────────────────────────────────────── */

function EnTete({ titre, compte, couleur }: { titre: string; compte: number; couleur: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className={cn("m-0 text-xs font-semibold uppercase tracking-wide", couleur)}>{titre}</h2>
      <span className="m-num text-xs text-gray-400 dark:text-gray-400">{compte}</span>
    </div>
  );
}

function CarteTimeout({
  session,
  now,
  t,
  onArbitrer,
}: {
  session: Session;
  now: number;
  t: MobileT;
  onArbitrer: (option: "A" | "B" | "C") => void;
}) {
  const profil = trouveInterimaire(session.interimaireId);
  const pause = pauseEnCours(session);
  const depassement = pause ? -resteAvantEcheance(pause, now) : 0;

  return (
    <article className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-base font-bold text-gray-900 dark:text-white truncate">
            {profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
          </p>
          <p className="mt-0.5 mb-0 text-xs text-gray-500 dark:text-gray-400 truncate">
            {profil?.fonction} · {session.site}
          </p>
        </div>
        <SessionStatusBadge statut={session.statut} />
      </div>

      {/* Compteur de dépassement : la donnée qui motive la décision */}
      <div className="mt-3.5 flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] border border-red-200 dark:border-red-900">
        <span className="flex items-center gap-2 text-[#CC0000] dark:text-[#FF6666]">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{t("al_overrun")}</span>
        </span>
        <span className="m-num text-base font-bold text-[#CC0000] dark:text-[#FF6666]">
          +{formatChrono(depassement)}
        </span>
      </div>

      {pause && (
        <p className="m-num mt-2.5 mb-0 text-xs text-gray-500 dark:text-gray-400">
          {t("al_pauseStart")} {formatHeure(pause.debut)} · {t("al_deadline")} {formatHeure(pause.echeance)}
        </p>
      )}

      <hr className="my-4 border-gray-100 dark:border-[#2A2A2A]" />

      <span className="block mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t("al_decision")}
      </span>
      <div className="space-y-2">
        <OptionBtn
          lettre="A"
          icone={<DoorClosed className="w-4 h-4" />}
          titre={t("al_optA")}
          detail={
            pause ? t("al_optA_detail", { h: formatHeure(pause.debut) }) : t("al_optA_detailFallback")
          }
          couleur="text-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] border-red-200 dark:border-red-900"
          onClick={() => onArbitrer("A")}
        />
        <OptionBtn
          lettre="B"
          icone={<TimerReset className="w-4 h-4" />}
          titre={t("al_optB")}
          detail={t("al_optB_detail")}
          couleur="text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900"
          onClick={() => onArbitrer("B")}
        />
        <OptionBtn
          lettre="C"
          icone={<PencilLine className="w-4 h-4" />}
          titre={t("al_optC")}
          detail={t("al_optC_detail")}
          couleur="text-blue-700 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900"
          onClick={() => onArbitrer("C")}
        />
      </div>
    </article>
  );
}

function OptionBtn({
  lettre,
  icone,
  titre,
  detail,
  couleur,
  onClick,
}: {
  lettre: string;
  icone: React.ReactNode;
  titre: string;
  detail: string;
  couleur: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000] transition-colors text-left"
    >
      <span
        aria-hidden
        className={cn(
          "m-num shrink-0 w-8 h-8 grid place-items-center rounded-lg border text-xs font-bold",
          couleur,
        )}
      >
        {lettre}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          <span className={couleur.split(" ")[0]}>{icone}</span>
          {titre}
        </span>
        <span className="block mt-0.5 text-xs text-gray-500 dark:text-gray-400">{detail}</span>
      </span>
    </button>
  );
}

function LigneSimple({ session, detail }: { session: Session; detail: string }) {
  const profil = trouveInterimaire(session.interimaireId);
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
        </span>
        <SessionStatusBadge statut={session.statut} />
      </div>
      <p className="mt-2 mb-0 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{detail}</p>
    </div>
  );
}

function AucuneAlerte({ t }: { t: MobileT }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
      <div className="w-12 h-12 mx-auto grid place-items-center rounded-xl bg-green-50 dark:bg-green-900/20">
        <BellOff className="w-6 h-6 text-green-600" />
      </div>
      <h2 className="mt-4 mb-0 text-lg font-bold text-gray-900 dark:text-white">{t("al_emptyTitle")}</h2>
      <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t("al_emptyDesc")}
      </p>
    </div>
  );
}

/* ── Feuille d'arbitrage ───────────────────────────────────────────────── */

function SheetArbitrage({
  session,
  option,
  valideur,
  onFermer,
  onEnvoyer,
  t,
}: {
  session: Session;
  option: "A" | "B" | "C";
  valideur: string;
  onFermer: () => void;
  onEnvoyer: ReturnType<typeof useMobileStore>["envoyer"];
  t: MobileT;
}) {
  const [minutes, setMinutes] = useState<number>(PROLONGATIONS_MIN[1]);
  const [heure, setHeure] = useState(() => new Date().toTimeString().slice(0, 5));
  const [justification, setJustification] = useState("");

  const confirmer = () => {
    const at = new Date().toISOString();

    if (option === "A") {
      const r = onEnvoyer(session.id, { type: "DECISION_FERMER", at, par: valideur });
      if (!r.ok) return toast.error(t(r.erreur));
      toast.success(t("al_closedFlag"));
    } else if (option === "B") {
      const r = onEnvoyer(session.id, { type: "DECISION_PROLONGER", at, par: valideur, minutes });
      if (!r.ok) return toast.error(t(r.erreur));
      toast.success(t("al_extended", { n: minutes }));
    } else {
      if (!justification.trim()) return toast.error(t("al_justifRequired"));
      const [h, m] = heure.split(":").map(Number);
      const retour = new Date();
      retour.setHours(h, m, 0, 0);
      const r = onEnvoyer(session.id, {
        type: "DECISION_RETOUR_MANUEL",
        at,
        par: valideur,
        heureRetour: retour.toISOString(),
        justification: justification.trim(),
      });
      if (!r.ok) return toast.error(t(r.erreur));
      toast.success(t("al_manualOk"));
    }
    onFermer();
  };

  const titres = { A: t("al_optA"), B: t("al_optB"), C: t("al_optC") } as const;

  const descriptions = {
    A: t("al_sheetA_desc"),
    B: t("al_sheetB_desc"),
    C: t("al_sheetC_desc"),
  } as const;

  return (
    <ActionSheet ouvert titre={titres[option]} description={descriptions[option]} onFermer={onFermer}>
      <div className="space-y-3">
        {option === "B" && (
          <div className="grid grid-cols-3 gap-2">
            {PROLONGATIONS_MIN.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={cn(
                  "m-num py-4 rounded-xl border text-base font-semibold transition-colors",
                  minutes === m
                    ? "border-[#CC0000] bg-red-600 text-white"
                    : "border-gray-200 dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300",
                )}
              >
                +{m} {t("minutes")}
              </button>
            ))}
          </div>
        )}

        {option === "C" && (
          <>
            <div>
              <label
                htmlFor="heure-retour"
                className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {t("al_returnTime")}
              </label>
              <input
                id="heure-retour"
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="m-num w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-base focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="justif"
                className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {t("al_justification")}
              </label>
              <textarea
                id="justif"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t("al_justifPlaceholder")}
                className="w-full min-h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm resize-none placeholder:text-gray-400 focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-colors"
              />
            </div>
          </>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={confirmer}
          disabled={option === "C" && !justification.trim()}
          className="w-full px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {t("al_confirmOption", { o: option })}
        </motion.button>
      </div>
    </ActionSheet>
  );
}
