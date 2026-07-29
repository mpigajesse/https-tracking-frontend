"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { CLE_STATUT } from "@/lib/mobile/session-machine";
import { useMobileT, type MobileKey } from "@/lib/mobile/i18n";
import type { SessionStatus } from "@/lib/mobile/types";

type Variant = "success" | "danger" | "warning" | "info" | "neutral";

/**
 * Correspondance statut BPMN → variante du badge partagé avec l'app web.
 * Réutiliser `StatusBadge` plutôt que recréer une pastille garantit que les
 * deux surfaces restent identiques quand la charte évolue.
 */
const VARIANTE: Record<SessionStatus, Variant> = {
  en_attente_ouverture: "warning",
  en_attente_cloture: "warning",
  ouverte: "success",
  en_pause: "info",
  pause_timeout: "danger",
  sortie_temporaire: "info",
  en_litige: "danger",
  refusee: "danger",
  cloturee_validee: "success",
  cloturee_timeout: "danger",
  cloturee_sortie_depassee: "danger",
  cloturee_auto: "warning",
};

export function varianteStatut(statut: SessionStatus): Variant {
  return VARIANTE[statut];
}

export function SessionStatusBadge({ statut, className }: { statut: SessionStatus; className?: string }) {
  const { t } = useMobileT();
  return (
    <StatusBadge variant={VARIANTE[statut]} className={className}>
      {t(CLE_STATUT[statut] as MobileKey)}
    </StatusBadge>
  );
}
