"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Coffee, QrCode } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { SortieCountdown } from "@/components/mobile/SortieCountdown";
import { useMobileT, type MobileT } from "@/lib/mobile/i18n";
import { calculeDuree, formatChrono, formatDuree, formatHeure, sortieEnCours } from "@/lib/mobile/time";
import { useMobileStore } from "@/lib/mobile/store";
import type { Compte, InterimaireProfil, Session } from "@/lib/mobile/types";

/**
 * Écran d'accueil de l'intérimaire.
 *
 * Contrairement aux écrans métier, celui-ci ne montre ni file d'attente, ni
 * statut technique, ni jargon de processus : l'intérimaire est un travailleur
 * qui ouvre l'application quelques secondes par jour. On répond donc à trois
 * questions seulement — suis-je en poste, depuis combien de temps, et où est
 * mon QR Code.
 */
export function EcranInterimaire({ compte }: { compte: Compte }) {
  const { sessions, now, profil } = useMobileStore();
  const { t } = useMobileT();

  const moi = compte.interimaireId ? profil(compte.interimaireId) : undefined;

  /* La session du jour : la plus récente encore vivante. */
  const session = sessions.find(
    (s) =>
      s.interimaireId === compte.interimaireId &&
      ["en_attente_ouverture", "ouverte", "en_pause", "pause_timeout", "sortie_temporaire", "en_attente_cloture"].includes(
        s.statut,
      ),
  );

  return (
    <>
      <TopBar titre={`${t("int_hello")}, ${compte.prenom}`} sousTitre={compte.site} />

      <div className="m-scroll px-4 pt-4 space-y-4">
        {/* Un profil non validé bloque tout : on le dit avant tout le reste. */}
        {moi && moi.statutProfil !== "valide" && <BandeauProfil profil={moi} t={t} />}

        {session ? (
          <CarteSession session={session} now={now} t={t} />
        ) : (
          moi?.statutProfil === "valide" && <AucuneSession t={t} />
        )}

        {/* Le raccourci vers le QR reste toujours visible : c'est le geste
            principal de l'intérimaire, quel que soit son état de session. */}
        <Link
          href="/m/qr"
          className="flex items-center gap-4 p-5 rounded-2xl text-white transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #CC0000, #7A0000)" }}
        >
          <span aria-hidden className="shrink-0 w-12 h-12 grid place-items-center rounded-xl bg-white/15">
            <QrCode className="w-6 h-6" strokeWidth={2} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-base font-semibold">{t("int_myQr")}</span>
            <span className="block mt-0.5 text-sm text-white/80">{t("int_myQrDesc")}</span>
          </span>
        </Link>
      </div>
    </>
  );
}

/** Message clair quand le dossier n'ouvre pas (encore) le droit de travailler. */
function BandeauProfil({ profil, t }: { profil: InterimaireProfil; t: MobileT }) {
  const message =
    profil.statutProfil === "en_attente_validation" || profil.statutProfil === "brouillon"
      ? t("int_profilPending")
      : profil.statutProfil === "refuse"
        ? t("int_profilRefused")
        : t("int_profilSuspended");

  const attente = profil.statutProfil === "en_attente_validation" || profil.statutProfil === "brouillon";

  return (
    <div
      role="status"
      className={
        attente
          ? "flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
          : "flex items-start gap-3 p-4 rounded-2xl bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] dark:text-[#FF6666]"
      }
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-px" />
      <p className="m-0 text-sm leading-relaxed">{message}</p>
    </div>
  );
}

function CarteSession({ session, now, t }: { session: Session; now: number; t: MobileT }) {
  const duree = calculeDuree(session, now);
  const sortie = sortieEnCours(session);

  /* Une sortie en cours prend toute la place : c'est la seule information
     qui appelle une action immédiate de la part de l'intérimaire. */
  if (sortie) {
    return (
      <section className="space-y-3">
        <SortieCountdown sortie={sortie} now={now} variante="plein" />
        <p className="m-0 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("int_worked")} — <strong className="text-gray-900 dark:text-white">{formatDuree(duree.netMs)}</strong>
        </p>
      </section>
    );
  }

  const enAttente = session.statut === "en_attente_ouverture";
  const enPause = session.statut === "en_pause" || session.statut === "pause_timeout";

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-6 text-center">
      <span
        aria-hidden
        className={
          enAttente
            ? "inline-grid place-items-center w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600"
            : enPause
              ? "inline-grid place-items-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600"
              : "inline-grid place-items-center w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-600"
        }
      >
        {enAttente ? (
          <Clock className="w-7 h-7" />
        ) : enPause ? (
          <Coffee className="w-7 h-7" />
        ) : (
          <CheckCircle2 className="w-7 h-7" />
        )}
      </span>

      {enAttente ? (
        <>
          <p className="m-0 mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {t("act_awaitValidation")}
          </p>
          <p className="m-0 mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {t("act_awaitValidationWhy")}
          </p>
        </>
      ) : (
        <>
          <p className="m-0 mt-4 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("int_worked")}
          </p>
          <p className="m-num m-0 mt-1 text-5xl font-bold tabular-nums leading-none text-gray-900 dark:text-white">
            {formatChrono(duree.netMs)}
          </p>
          <p className="m-num m-0 mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t("int_since")} {formatHeure(session.ouvertureValideeA ?? session.debut)}
          </p>
        </>
      )}
    </section>
  );
}

function AucuneSession({ t }: { t: MobileT }) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-8 text-center">
      <span aria-hidden className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-[#F5F5F5] dark:bg-[#2A2A2A]">
        <Clock className="w-7 h-7 text-gray-400" />
      </span>
      <p className="m-0 mt-4 text-base font-semibold text-gray-900 dark:text-white">{t("int_noSession")}</p>
      <p className="m-0 mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t("int_noSessionDesc")}
      </p>
    </section>
  );
}
