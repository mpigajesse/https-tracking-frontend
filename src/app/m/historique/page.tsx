"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { SessionStatusBadge } from "@/components/mobile/SessionStatusBadge";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT, type MobileT } from "@/lib/mobile/i18n";
import { calculeDuree, formatDuree, formatHeure, formatJour } from "@/lib/mobile/time";
import type { Session } from "@/lib/mobile/types";

/** Historique des sessions du périmètre du compte (son site, ou tous pour l'admin). */
export default function HistoriquePage() {
  const { compte, sessions, now } = useMobileStore();
  const { t } = useMobileT();
  if (!compte) return null;

  const liste = [...sessions].sort(
    (a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime(),
  );

  const totalNet = liste
    .filter((s) => s.statut === "cloturee_validee")
    .reduce((acc, s) => acc + calculeDuree(s, now).netMs, 0);

  return (
    <>
      <TopBar
        titre={t("hi_title")}
        sousTitre={`${compte.site} · ${liste.length} ${t(liste.length > 1 ? "hi_sessions" : "hi_session")}`}
        action={
          <span className="m-num shrink-0 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
            {formatDuree(totalNet)}
          </span>
        }
      />

      <div className="m-scroll px-4 pt-4 space-y-2.5">
        {liste.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
            <CalendarDays className="w-6 h-6 mx-auto text-gray-400" />
            <p className="mt-3 mb-0 text-sm text-gray-500 dark:text-gray-400">
              {t("hi_empty")}
            </p>
          </div>
        )}
        {liste.map((s) => (
          <LigneHistorique key={s.id} session={s} now={now} t={t} />
        ))}
      </div>
    </>
  );
}

function LigneHistorique({ session, now, t }: { session: Session; now: number; t: MobileT }) {
  const duree = calculeDuree(session, now);
  const profil = trouveInterimaire(session.interimaireId);

  return (
    <Link
      href={`/m/historique/${session.id}`}
      className="block p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000] transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-gray-900 dark:text-white truncate">
            {profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
          </p>
          <p className="m-num mt-0.5 mb-0 text-xs text-gray-500 dark:text-gray-400 truncate">
            {formatJour(session.debut)} · {formatHeure(session.debut)}
            {session.fin ? ` → ${formatHeure(session.fin)}` : ` → ${t("hi_ongoing")}`}
          </p>
        </div>
        <ChevronRight className="shrink-0 w-4 h-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <SessionStatusBadge statut={session.statut} />
        <span className="m-num px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-xs text-gray-600 dark:text-gray-300">
          {formatDuree(duree.netMs)} {t("hi_net")}
        </span>
        {session.pauses.length > 0 && (
          <span className="m-num px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-xs text-gray-600 dark:text-gray-300">
            {session.pauses.length} {t(session.pauses.length > 1 ? "hi_pauses" : "hi_pause")}
          </span>
        )}
      </div>
    </Link>
  );
}
