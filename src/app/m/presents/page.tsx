"use client";

import Link from "next/link";
import { Clock, UsersRound } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { SessionStatusBadge } from "@/components/mobile/SessionStatusBadge";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileStore } from "@/lib/mobile/store";
import { useMobileT } from "@/lib/mobile/i18n";
import { calculeDuree, formatChrono, formatHeure } from "@/lib/mobile/time";
import type { Session, SessionStatus } from "@/lib/mobile/types";

/** Statuts considérés comme « présent sur site », dans l'ordre d'affichage. */
const PRESENTS: SessionStatus[] = ["ouverte", "en_pause", "pause_timeout", "en_attente_cloture"];

/** Vue temps réel des personnes présentes — équivalent mobile de la liste sécurité. */
export default function PresentsPage() {
  const { compte, sessions, now } = useMobileStore();
  const { t } = useMobileT();
  if (!compte) return null;

  const presents = sessions
    .filter((s) => PRESENTS.includes(s.statut))
    .sort((a, b) => PRESENTS.indexOf(a.statut) - PRESENTS.indexOf(b.statut));

  const enPause = presents.filter((s) => s.statut === "en_pause" || s.statut === "pause_timeout").length;

  return (
    <>
      <TopBar
        titre={t("pr_title")}
        sousTitre={`${compte.site} · ${t("pr_updated")} ${new Date(now).toLocaleTimeString()}`}
      />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {/* Deux compteurs, pas un tableau de bord : l'écran sert le coup d'œil */}
        <div className="grid grid-cols-2 gap-3">
          <Compteur
            label={t("pr_atPost")}
            valeur={presents.length - enPause}
            icone={<UsersRound className="w-5 h-5 text-green-600" />}
            fond="bg-green-50 dark:bg-green-900/20"
            texte="text-green-600"
          />
          <Compteur
            label={t("pr_onPause")}
            valeur={enPause}
            icone={<Clock className="w-5 h-5 text-blue-600" />}
            fond="bg-blue-50 dark:bg-blue-900/20"
            texte="text-blue-600"
          />
        </div>

        {presents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
            <UsersRound className="w-6 h-6 mx-auto text-gray-400" />
            <p className="mt-3 mb-0 text-sm text-gray-500 dark:text-gray-400">
              {t("pr_empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {presents.map((s) => (
              <LignePresent key={s.id} session={s} now={now} depuis={t("pr_since")} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Compteur({
  label,
  valeur,
  icone,
  fond,
  texte,
}: {
  label: string;
  valeur: number;
  icone: React.ReactNode;
  fond: string;
  texte: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${fond}`}>{icone}</div>
        <div>
          <div className={`m-num font-grotesk text-2xl font-bold ${texte}`}>{valeur}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function LignePresent({ session, now, depuis }: { session: Session; now: number; depuis: string }) {
  const profil = trouveInterimaire(session.interimaireId);
  const duree = calculeDuree(session, now);

  return (
    <Link
      href={`/m/historique/${session.id}`}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000] transition-colors"
    >
      <span
        aria-hidden
        className="shrink-0 w-11 h-11 grid place-items-center rounded-xl bg-[#F5F5F5] dark:bg-[#2A2A2A] font-grotesk font-semibold text-sm text-gray-700 dark:text-gray-200"
      >
        {profil?.initiales ?? "??"}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
          {profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
        </span>
        <span className="m-num block mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
          {depuis} {formatHeure(session.debut)} · {profil?.fonction}
        </span>
        <span className="block mt-1.5">
          <SessionStatusBadge statut={session.statut} />
        </span>
      </span>

      <span className="m-num shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
        {formatChrono(duree.netMs)}
      </span>
    </Link>
  );
}
