'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';
import type { StatutProfil } from '@/lib/data';

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

/**
 * Pastille du statut de validation d'un dossier intérimaire.
 *
 * Le code couleur porte une décision métier : seul `valide` est vert, parce que
 * c'est le seul statut qui autorise l'intérimaire à pointer. Tout le reste est
 * un dossier qui n'ouvre aucun droit.
 */
const VARIANTE: Record<StatutProfil, Variant> = {
  brouillon: 'neutral',
  en_attente_validation: 'warning',
  valide: 'success',
  refuse: 'danger',
  suspendu: 'danger',
};

const CLE: Record<StatutProfil, 'sp_brouillon' | 'sp_en_attente_validation' | 'sp_valide' | 'sp_refuse' | 'sp_suspendu'> = {
  brouillon: 'sp_brouillon',
  en_attente_validation: 'sp_en_attente_validation',
  valide: 'sp_valide',
  refuse: 'sp_refuse',
  suspendu: 'sp_suspendu',
};

export function varianteProfil(statut: StatutProfil): Variant {
  return VARIANTE[statut];
}

export function ProfilStatusBadge({ statut, className }: { statut: StatutProfil; className?: string }) {
  const { t } = useI18n();
  return (
    <StatusBadge variant={VARIANTE[statut]} className={className}>
      {t(CLE[statut])}
    </StatusBadge>
  );
}
