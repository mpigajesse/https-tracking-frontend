"use client";

import { useParams } from "next/navigation";
import { Coffee } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { AuditTimeline } from "@/components/mobile/AuditTimeline";
import { SessionStatusBadge } from "@/components/mobile/SessionStatusBadge";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT } from "@/lib/mobile/i18n";
import {
  calculeDuree,
  debutEffectif,
  dureePauseMs,
  formatDuree,
  formatHeure,
  formatJour,
} from "@/lib/mobile/time";

/** Détail d'une session : décomposition du temps, pauses et journal complet. */
export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { sessions, now } = useMobileStore();
  const { t } = useMobileT();
  const session = sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <>
        <TopBar titre={t("de_notFound")} retour />
        <div className="m-scroll px-4 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("de_notFound")}
          </p>
        </div>
      </>
    );
  }

  const duree = calculeDuree(session, now);
  const profil = trouveInterimaire(session.interimaireId);
  const finRef = session.fin ? new Date(session.fin).getTime() : now;

  return (
    <>
      <TopBar
        titre={profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
        sousTitre={`${formatJour(session.debut)} · ${session.id}`}
        retour
        action={<SessionStatusBadge statut={session.statut} />}
      />

      <div className="m-scroll px-4 pt-4 space-y-4">
        <section className="p-5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
          <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("de_payable")}
          </span>
          <div className="m-num font-grotesk mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            {formatDuree(duree.netMs)}
          </div>

          <div className="mt-5">
            <Ligne label={t("de_opening")} valeur={formatHeure(debutEffectif(session))} />
            <Ligne label={t("de_end")} valeur={session.fin ? formatHeure(session.fin) : t("hi_ongoing")} />
            <Ligne label={t("de_gross")} valeur={formatDuree(duree.brutMs)} />
            <Ligne label={t("de_totalPauses")} valeur={`− ${formatDuree(duree.pausesMs)}`} />
            <Ligne label={t("de_site")} valeur={session.site} />
            {session.valideParOuverture && (
              <Ligne label={t("de_openedBy")} valeur={session.valideParOuverture} />
            )}
            {session.valideParCloture && (
              <Ligne label={t("de_closedBy")} valeur={session.valideParCloture} />
            )}
          </div>

          {session.motif && (
            <p className="mt-4 mb-0 px-3.5 py-3 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] border border-red-200 dark:border-red-900 text-xs leading-relaxed text-[#CC0000] dark:text-[#FF6666]">
              {session.motif}
            </p>
          )}
        </section>

        {session.pauses.length > 0 && (
          <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
            <span className="block mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("de_pausesTitle")} — {session.pauses.length}
            </span>
            <div className="space-y-2">
              {session.pauses.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#F5F5F5] dark:bg-[#2A2A2A]"
                >
                  <Coffee className="shrink-0 w-4 h-4 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <p className="m-num m-0 text-sm text-gray-900 dark:text-gray-100">
                      {formatHeure(p.debut)} → {p.fin ? formatHeure(p.fin) : t("hi_ongoing")}
                    </p>
                    {(p.retourManuel || p.prolongationMin > 0) && (
                      <p className="mt-0.5 mb-0 text-xs text-gray-500 dark:text-gray-400">
                        {p.retourManuel && `${t("de_manualReturn")} · ${p.justification}`}
                        {p.prolongationMin > 0 && ` +${p.prolongationMin} ${t("de_extraGranted")}`}
                      </p>
                    )}
                  </div>
                  <span className="m-num shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatDuree(dureePauseMs(p, finRef))}
                  </span>
                  <span className="m-num shrink-0 text-xs text-gray-400">#{i + 1}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
          <span className="block mb-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("de_audit")} — {session.audit.length} {t("de_events")}
          </span>
          <AuditTimeline entrees={session.audit} />
        </section>
      </div>
    </>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 dark:border-[#2A2A2A] last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="m-num text-sm text-gray-900 dark:text-gray-100 text-right">{valeur}</span>
    </div>
  );
}
