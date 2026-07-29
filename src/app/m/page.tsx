"use client";

import Link from "next/link";
import { ChevronRight, DoorOpen, Inbox, LogOut } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { EcranInterimaire } from "@/components/mobile/ecrans/EcranInterimaire";
import { trouveInterimaire } from "@/lib/mobile/mock-data";
import { useMobileT, type MobileKey, type MobileT } from "@/lib/mobile/i18n";
import { calculeDuree, formatDuree, formatHeure } from "@/lib/mobile/time";
import { useMobileStore } from "@/lib/mobile/store";
import type { Role, Session } from "@/lib/mobile/types";
import { cn } from "@/lib/utils";

/** Clé de traduction du libellé de rôle, pour le sous-titre de la barre haute. */
const CLE_ROLE: Record<Role, MobileKey> = {
  admin: "role_admin",
  societe: "role_societe",
  receptionniste: "role_receptionniste",
  technicien: "role_technicien",
  interimaire: "role_interimaire",
};

/**
 * Écran d'accueil : la file d'attente humaine.
 *
 * Deux décisions y aboutissent — valider l'identité à l'ouverture, valider la
 * clôture en fin de journée. C'est le **technicien** qui les prend : le
 * réceptionniste ne fait que scanner. L'admin y accède aussi, tous sites
 * confondus, en tant que superviseur.
 *
 * L'intérimaire, lui, est renvoyé vers son écran simplifié.
 */
export default function FileValidationPage() {
  const { compte, sessions, now } = useMobileStore();
  const { t } = useMobileT();
  if (!compte) return null;

  if (compte.role === "interimaire") return <EcranInterimaire compte={compte} />;

  const ouvertures = sessions.filter((s) => s.statut === "en_attente_ouverture");
  const clotures = sessions.filter((s) => s.statut === "en_attente_cloture");
  const total = ouvertures.length + clotures.length;

  return (
    <>
      <TopBar
        titre={t("nav_validate")}
        sousTitre={`${t(CLE_ROLE[compte.role])} · ${compte.site}`}
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
        {total === 0 && <FileVide t={t} />}

        {ouvertures.length > 0 && (
          <Groupe
            titre={t("home_openings")}
            compte={ouvertures.length}
            icone={<DoorOpen className="w-4 h-4" />}
            couleur="text-yellow-600"
          >
            {ouvertures.map((s) => (
              <LigneSession key={s.id} session={s} now={now} type="ouverture" t={t} />
            ))}
          </Groupe>
        )}

        {clotures.length > 0 && (
          <Groupe
            titre={t("home_closures")}
            compte={clotures.length}
            icone={<LogOut className="w-4 h-4" />}
            couleur="text-blue-600"
          >
            {clotures.map((s) => (
              <LigneSession key={s.id} session={s} now={now} type="cloture" t={t} />
            ))}
          </Groupe>
        )}
      </div>
    </>
  );
}

function Groupe({
  titre,
  compte,
  icone,
  couleur,
  children,
}: {
  titre: string;
  compte: number;
  icone: React.ReactNode;
  couleur: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className={couleur}>{icone}</span>
        <h2 className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {titre}
        </h2>
        <span className="m-num text-xs text-gray-400 dark:text-gray-400">{compte}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function LigneSession({
  session,
  now,
  type,
  t,
}: {
  session: Session;
  now: number;
  type: "ouverture" | "cloture";
  t: MobileT;
}) {
  const profil = trouveInterimaire(session.interimaireId);
  const duree = calculeDuree(session, now);
  const reference = type === "ouverture" ? session.debut : (session.fin ?? session.debut);
  const attenteMin = Math.floor((now - new Date(reference).getTime()) / 60_000);
  const urgent = attenteMin >= 5;

  return (
    <Link
      href={`/m/validations/${session.id}`}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-[#1C1C1C] transition-colors hover:border-[#CC0000]",
        urgent ? "border-red-300 dark:border-red-900" : "border-gray-200 dark:border-[#2A2A2A]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "shrink-0 w-11 h-11 grid place-items-center rounded-xl font-grotesk font-semibold text-sm",
          type === "ouverture"
            ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
        )}
      >
        {profil?.initiales ?? "??"}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
          {profil ? `${profil.prenom} ${profil.nom}` : session.interimaireId}
        </span>
        <span className="m-num block mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
          {type === "ouverture"
            ? `${t("home_scanAt")} ${formatHeure(session.debut)} · ${t("home_waiting")} ${attenteMin} ${t("minutes")}`
            : `${t("home_exitAt")} ${formatHeure(session.fin ?? session.debut)} · ${formatDuree(duree.brutMs)} ${t("home_gross")}`}
        </span>
        <span className="block mt-0.5 text-xs text-gray-400 dark:text-gray-400 truncate">
          {session.site}
        </span>
      </span>

      <ChevronRight className="shrink-0 w-4 h-4 text-gray-400" />
    </Link>
  );
}

function FileVide({ t }: { t: MobileT }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
      <div className="w-12 h-12 mx-auto grid place-items-center rounded-xl bg-green-50 dark:bg-green-900/20">
        <Inbox className="w-6 h-6 text-green-600" />
      </div>
      <h2 className="mt-4 mb-0 text-lg font-bold text-gray-900 dark:text-white">{t("home_emptyTitle")}</h2>
      <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t("home_emptyDesc")}
      </p>
    </div>
  );
}
