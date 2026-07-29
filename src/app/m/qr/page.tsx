"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { TopBar } from "@/components/mobile/TopBar";
import { QR_TOKEN_TTL_S } from "@/lib/mobile/constants";
import { useMobileT } from "@/lib/mobile/i18n";
import { useMobileStore } from "@/lib/mobile/store";

/**
 * QR Code personnel de l'intérimaire.
 *
 * Écran volontairement mono-tâche : un grand code, un nom, un compte à rebours.
 * Le jeton est à durée de vie courte et se renouvelle tout seul — l'intérimaire
 * n'a rien à faire d'autre que présenter son téléphone à l'accueil.
 */
export default function MonQRPage() {
  const { compte, profil } = useMobileStore();
  const { t } = useMobileT();
  const [emisA, setEmisA] = useState<number | null>(null);
  const [restant, setRestant] = useState(QR_TOKEN_TTL_S);

  const moi = compte?.interimaireId ? profil(compte.interimaireId) : undefined;

  /* Le jeton n'est fabriqué que côté client : il dépend de l'horloge, et un
     rendu serveur produirait une valeur différente à l'hydratation. */
  useEffect(() => {
    setEmisA(Date.now());
  }, []);

  useEffect(() => {
    if (emisA === null) return;
    const id = window.setInterval(() => {
      const ecoule = Math.floor((Date.now() - emisA) / 1000);
      const reste = QR_TOKEN_TTL_S - ecoule;
      // Expiration : on renouvelle sans intervention, le code reste toujours valide.
      if (reste <= 0) setEmisA(Date.now());
      else setRestant(reste);
    }, 1000);
    return () => window.clearInterval(id);
  }, [emisA]);

  if (!compte) return null;

  const jeton = emisA === null ? "" : `QR-${compte.matricule}-${emisA.toString(36).toUpperCase()}`;
  const valeur = JSON.stringify({
    id: compte.interimaireId,
    matricule: compte.matricule,
    site: compte.site,
    jeton,
  });

  return (
    <>
      <TopBar titre={t("int_myQr")} sousTitre={compte.site} />

      <div className="m-scroll px-4 pt-4 space-y-4">
        <section className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-6 text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-block p-4 bg-white rounded-2xl border border-gray-200"
          >
            {emisA === null ? (
              // Réservation de la place exacte du code : aucun saut de mise en page.
              <div className="w-[240px] h-[240px] rounded-lg bg-gray-100 animate-pulse" />
            ) : (
              <QRCodeSVG value={valeur} size={240} bgColor="#FFFFFF" fgColor="#111111" level="H" />
            )}
          </motion.div>

          <p className="m-0 mt-5 text-lg font-semibold text-gray-900 dark:text-white">
            {compte.prenom} {compte.nom}
          </p>
          <p className="m-num m-0 mt-1 text-sm text-gray-500 dark:text-gray-400">{compte.matricule}</p>

          <p className="m-0 mt-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {t("int_myQrDesc")}
          </p>
        </section>

        {/* Le renouvellement automatique est annoncé : sans cela, un code qui
            change tout seul passe pour un bug. */}
        <p className="m-num m-0 flex items-center justify-center gap-2 text-xs text-gray-400">
          <RefreshCw className="w-3.5 h-3.5" />
          {restant} {t("seconds")}
        </p>

        {moi && moi.statutProfil !== "valide" && (
          <p className="m-0 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-sm leading-relaxed text-amber-800 dark:text-amber-300 text-center">
            {moi.statutProfil === "refuse"
              ? t("int_profilRefused")
              : moi.statutProfil === "suspendu"
                ? t("int_profilSuspended")
                : t("int_profilPending")}
          </p>
        )}
      </div>
    </>
  );
}
