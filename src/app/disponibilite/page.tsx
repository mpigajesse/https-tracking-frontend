'use client';

/**
 * Disponibilité des techniciens par site.
 *
 * Écran à deux lectures : le technicien y déclare le site qu'il couvre, et
 * l'administrateur y voit la couverture globale. C'est le préalable au reste du
 * flux — un scan sur un site sans technicien déclaré ne notifie personne, et
 * bascule vers l'administrateur. Un site découvert est donc mis en évidence.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import {
  mockDisponibilites, MOTIFS_INDISPONIBILITE, SITES,
  type DisponibiliteTechnicien,
} from '@/lib/data';
import { Radio, PowerOff, MapPin, Clock, AlertTriangle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

function heure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function jour(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function DisponibilitePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [dispos, setDispos] = useState<DisponibiliteTechnicien[]>(mockDisponibilites);
  const [motif, setMotif] = useState('');

  const estTechnicien = user?.role === 'technicien';

  /** Déclaration ouverte du compte connecté, s'il en a une. */
  const mienne = useMemo(
    () => dispos.find((d) => d.technicienId === user?.id && !d.jusqu),
    [dispos, user],
  );

  /** Techniciens actuellement déclarés, par site. */
  const couverture = useMemo(() => {
    const parSite = new Map<string, DisponibiliteTechnicien[]>();
    for (const site of SITES) parSite.set(site, []);
    for (const d of dispos) {
      if (d.jusqu) continue;
      parSite.set(d.site, [...(parSite.get(d.site) ?? []), d]);
    }
    return parSite;
  }, [dispos]);

  const historique = useMemo(
    () => dispos.filter((d) => d.jusqu).sort((a, b) => (b.jusqu ?? '').localeCompare(a.jusqu ?? '')),
    [dispos],
  );

  const declarer = (site: string) => {
    if (!user) return;
    const at = new Date().toISOString();
    setDispos((prev) => [
      // Une seule déclaration ouverte à la fois : changer de site clôt la précédente.
      ...prev.map((d) =>
        d.technicienId === user.id && !d.jusqu
          ? { ...d, jusqu: at, motifFin: 'Changement de site' }
          : d,
      ),
      {
        id: `dp${Date.now()}`,
        technicienId: user.id,
        technicienNom: `${user.prenom} ${user.nom}`,
        site,
        depuis: at,
      },
    ]);
    toast.success(`${t('dispo_declared')} — ${site}`);
  };

  const terminer = () => {
    if (!user) return;
    const at = new Date().toISOString();
    setDispos((prev) =>
      prev.map((d) =>
        d.technicienId === user.id && !d.jusqu
          ? { ...d, jusqu: at, motifFin: motif || undefined }
          : d,
      ),
    );
    setMotif('');
    toast.success(t('dispo_ended'));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-[#CC0000]" />
            {t('dispo_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dispo_subtitle')}</p>
        </div>

        {/* ── Bloc personnel du technicien ── */}
        {estTechnicien && (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {mienne ? (
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: 'linear-gradient(135deg, #16803C, #0B4A22)' }}
              >
                <span aria-hidden className="inline-grid place-items-center w-12 h-12 rounded-xl bg-white/15">
                  <Radio className="w-6 h-6" />
                </span>
                <p className="mt-4 text-xs uppercase tracking-wide text-white/80">{t('dispo_on')}</p>
                <p className="mt-1 text-2xl font-bold">{mienne.site}</p>
                <p className="mt-2 text-sm text-white/80">
                  {t('dispo_since')} {heure(mienne.depuis)} · {jour(mienne.depuis)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-6">
                <span aria-hidden className="inline-grid place-items-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                  <PowerOff className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </span>
                <p className="mt-4 text-base font-semibold text-amber-900 dark:text-amber-300">
                  {t('dispo_none')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-400">
                  {t('dispo_noneDesc')}
                </p>
              </div>
            )}

            {mienne && (
              <div className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-5 space-y-3">
                <label className="block">
                  <span className="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t('dispo_reason')}
                  </span>
                  <select value={motif} onChange={(e) => setMotif(e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    {MOTIFS_INDISPONIBILITE.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={terminer}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#CC0000] text-[#CC0000] text-sm font-medium hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
                >
                  <PowerOff className="w-4 h-4" />
                  {t('dispo_end')}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── Couverture par site ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {t('dispo_coverage')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SITES.map((site) => {
              const presents = couverture.get(site) ?? [];
              const decouvert = presents.length === 0;
              const cestMonSite = mienne?.site === site;
              return (
                <motion.article
                  key={site}
                  layout
                  className={`relative overflow-hidden rounded-2xl border p-5 ${
                    decouvert
                      ? 'border-[#CC0000]/40 bg-[#FFF7F7] dark:bg-[#1C1010]'
                      : 'border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C]'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-1 ${decouvert ? 'bg-[#CC0000]' : 'bg-emerald-500'}`}
                  />
                  <header className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {site}
                    </h3>
                    <StatusBadge variant={decouvert ? 'danger' : 'success'}>
                      {presents.length}
                    </StatusBadge>
                  </header>

                  {decouvert ? (
                    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#CC0000] dark:text-[#FF6666]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>
                        <strong>{t('dispo_uncovered')}.</strong> {t('dispo_uncoveredDesc')}
                      </span>
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 list-none p-0 m-0">
                      {presents.map((d) => (
                        <li key={d.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {d.technicienNom}
                          <span className="text-xs text-gray-400">
                            {t('dispo_since')} {heure(d.depuis)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {estTechnicien && !cestMonSite && (
                    <button
                      onClick={() => declarer(site)}
                      className="mt-4 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-[#CC0000] hover:text-[#CC0000] transition-colors"
                    >
                      {t('dispo_declare')}
                    </button>
                  )}
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ── Historique ── */}
        {historique.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              {t('dispo_history')}
            </h2>
            <div className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              <AnimatePresence initial={false}>
                {historique.slice(0, 8).map((d) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                  >
                    <span className="text-gray-900 dark:text-white">{d.technicienNom}</span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {d.site}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {heure(d.depuis)} → {d.jusqu && heure(d.jusqu)}
                    </span>
                    {d.motifFin && (
                      <span className="text-xs text-gray-400">{d.motifFin}</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
