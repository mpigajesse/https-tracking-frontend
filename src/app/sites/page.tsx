'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';
import {
  mockSites, mockInterimaires, mockSessions, Site, SiteStatut,
} from '@/lib/data';
import {
  Building2, Plus, Search, Edit2, Trash2, MapPin, Phone, Mail,
  Users, Activity, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Layers, RefreshCw, Eye, ChevronRight, Download,
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Animated counter ── */
function useAnimatedNumber(target: number, duration = 1.2) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const rounded = useTransform(spring, v => Math.round(v));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    motionVal.set(target);
    const unsub = rounded.on('change', v => setDisplay(v));
    return unsub;
  }, [target, motionVal, rounded]);
  return display;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const n = useAnimatedNumber(value);
  return <>{n}{suffix}</>;
}

/* ── Live pulse ── */
function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CC0000] opacity-60" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#CC0000]" />
    </span>
  );
}

/* ── Capacity bar ── */
function CapacityBar({ current, max, presentLabel, maxLabel, capLabel }: {
  current: number; max: number; presentLabel: string; maxLabel: string; capLabel: string;
}) {
  const pct = Math.min((current / max) * 100, 100);
  const color = pct >= 90 ? 'bg-[#CC0000]' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{current} {presentLabel}</span>
        <span>{maxLabel} {max}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-[#111111] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <div className="text-xs text-gray-400">{pct.toFixed(0)}% {capLabel}</div>
    </div>
  );
}

const secteurColors: Record<string, string> = {
  Industrie:       'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
  Logistique:      'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
  Export:          'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
  Textile:         'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
  Agroalimentaire: 'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
};

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

const emptyForm = {
  nom: '', ville: '', adresse: '', responsable: '', telephone: '',
  email: '', capaciteMax: 50, statut: 'actif' as SiteStatut, superficie: '', secteur: 'Industrie',
};

export default function SitesPage() {
  const { t } = useI18n();
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<SiteStatut | 'tous'>('tous');
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(interval);
  }, []);

  const getLiveCount = useCallback((siteName: string) => {
    const base = mockSessions.filter(
      s => s.site === siteName && (s.statut === 'ouverte' || s.statut === 'en_attente_fermeture')
    ).length;
    const variance = Math.floor(((tick * 7 + siteName.length * 3) % 5));
    return base + variance;
  }, [tick]);

  const getInterimaireCount = useCallback((siteName: string) => {
    return mockInterimaires.filter(i => i.site === siteName && i.statut !== 'inactif').length;
  }, []);

  const statutConfig = {
    actif:       { label: t('sites_statut_actif'),       variant: 'success' as const, icon: CheckCircle2 },
    maintenance: { label: t('sites_statut_maintenance'),  variant: 'warning' as const, icon: AlertTriangle },
    ferme:       { label: t('sites_statut_ferme'),        variant: 'neutral' as const, icon: XCircle },
  };

  const filtered = sites.filter(s => {
    const matchSearch = `${s.nom} ${s.ville} ${s.responsable} ${s.secteur}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || s.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const totalPresents     = sites.reduce((sum, s) => sum + getLiveCount(s.nom), 0);
  const totalActifs       = sites.filter(s => s.statut === 'actif').length;
  const totalCapacite     = sites.filter(s => s.statut === 'actif').reduce((sum, s) => sum + s.capaciteMax, 0);
  const totalInterimaires = sites.reduce((sum, s) => sum + getInterimaireCount(s.nom), 0);

  const handleAdd  = () => { setEditSite(null); setForm(emptyForm); setShowModal(true); };
  const handleEdit = (s: Site) => {
    setEditSite(s);
    setForm({ nom: s.nom, ville: s.ville, adresse: s.adresse, responsable: s.responsable, telephone: s.telephone, email: s.email, capaciteMax: s.capaciteMax, statut: s.statut, superficie: s.superficie ?? '', secteur: s.secteur });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nom || !form.ville || !form.responsable) { toast.error(t('sites_toast_required')); return; }
    if (editSite) {
      setSites(prev => prev.map(s => s.id === editSite.id ? { ...s, ...form } : s));
      toast.success(t('sites_toast_updated'));
    } else {
      const newSite: Site = { id: `site${Date.now()}`, ...form, createdAt: new Date().toISOString().split('T')[0] };
      setSites(prev => [...prev, newSite]);
      toast.success(t('sites_toast_created'));
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, nom: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    if (selectedSite?.id === id) setSelectedSite(null);
    toast.success(`${nom} ${t('sites_toast_deleted')}`);
  };

  const handleToggleStatut = (id: string) => {
    setSites(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next: SiteStatut = s.statut === 'actif' ? 'maintenance' : s.statut === 'maintenance' ? 'ferme' : 'actif';
      return { ...s, statut: next };
    }));
    toast.success(t('sites_toast_statut'));
  };

  const exportCSV = () => {
    const csv = [
      ['Nom', 'Ville', 'Responsable', 'Statut', 'Capacité'],
      ...filtered.map(s => [s.nom, s.ville, s.responsable, s.statut, s.capaciteMax]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sites.csv'; a.click();
    toast.success(t('sites_toast_export') ?? 'Export réussi');
  };

  const kpis = [
    { label: t('sites_kpi_presents'),  value: totalPresents,     icon: Activity,     live: true },
    { label: t('sites_kpi_active'),    value: totalActifs,       icon: CheckCircle2 },
    { label: t('sites_kpi_assigned'),  value: totalInterimaires, icon: Users },
    { label: t('sites_kpi_capacity'),  value: totalCapacite,     icon: Layers },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#CC0000]" />
              {t('sites_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <LivePulse />
              {t('sites_subtitle')} · {sites.length} {t('sites_configured')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 text-sm hover:border-[#CC0000]/40 hover:text-[#CC0000] transition-colors"
            >
              <Download className="w-4 h-4" />{t('users_export') ?? 'Export'}
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all shadow-sm hover:shadow-[0_0_12px_rgba(204,0,0,0.4)]"
            >
              <Plus className="w-4 h-4" />
              {t('sites_new')}
            </motion.button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FFF0F0] dark:bg-[#2A0000] rounded-xl p-4 border border-[#CC0000]/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold text-[#CC0000] tabular-nums">
                      <AnimatedCounter value={kpi.value} />
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-[#1C1C1C]/60 text-[#CC0000]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                {kpi.live && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[#CC0000]">
                    <LivePulse />
                    <span>{t('sites_live_label')}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('sites_search')}
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] w-64 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              />
            </div>
            <div className="flex bg-gray-100 dark:bg-[#1C1C1C] rounded-xl p-1 gap-1 border border-gray-200 dark:border-[#2A2A2A]">
              {(['tous', 'actif', 'maintenance', 'ferme'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filterStatut === s
                      ? 'bg-gradient-to-r from-[#CC0000] to-[#AA0000] text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#CC0000] dark:hover:text-[#FF6666]'
                  }`}
                >
                  {s === 'tous' ? t('sites_filter_all') : s === 'actif' ? t('sites_filter_active') : s === 'maintenance' ? t('sites_filter_maintenance') : t('sites_filter_closed')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTick(t => t + 1)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-[#CC0000] border border-gray-200 dark:border-[#2A2A2A] rounded-xl bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000]/40 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('sites_refresh')}
            </button>
            <div className="flex bg-gray-100 dark:bg-[#1C1C1C] rounded-xl p-1 border border-gray-200 dark:border-[#2A2A2A]">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-gradient-to-r from-[#CC0000] to-[#AA0000] text-white shadow-sm' : 'text-gray-400 hover:text-[#CC0000]'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5v-3z" /></svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-gradient-to-r from-[#CC0000] to-[#AA0000] text-white shadow-sm' : 'text-gray-400 hover:text-[#CC0000]'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="w-16 h-16 text-[#CC0000]/20 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('sites_empty')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('sites_empty_sub')}</p>
          </motion.div>

        ) : view === 'grid' ? (
          /* ── Grid view ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((site, i) => {
                const cfg = statutConfig[site.statut];
                const StatusIcon = cfg.icon;
                const liveCount = getLiveCount(site.nom);
                const intCount = getInterimaireCount(site.nom);
                const isSelected = selectedSite?.id === site.id;

                return (
                  <motion.div
                    key={site.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedSite(isSelected ? null : site)}
                    className={`bg-white dark:bg-[#1C1C1C] rounded-2xl border transition-all cursor-pointer hover:shadow-lg hover:shadow-[#CC0000]/10 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-[#CC0000] ring-2 ring-[#CC0000]/20 shadow-lg shadow-[#CC0000]/10'
                        : 'border-gray-200 dark:border-[#2A2A2A]'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-5 rounded-t-2xl bg-[#FFF0F0] dark:bg-[#2A0000]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1C1C1C] flex items-center justify-center shadow-sm">
                            <Building2 className="w-5 h-5 text-[#CC0000]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{site.nom}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {site.ville}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${secteurColors[site.secteur] ?? 'bg-[#FFF0F0] text-[#CC0000]'}`}>
                            {site.secteur}
                          </span>
                          <StatusBadge variant={cfg.variant}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </StatusBadge>
                        </div>
                      </div>
                    </div>

                    {/* Live presence */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <LivePulse />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('sites_live_presence')}</span>
                        </div>
                        <motion.span
                          key={`${site.id}-${liveCount}`}
                          initial={{ scale: 1.4, color: '#CC0000' }}
                          animate={{ scale: 1, color: 'inherit' }}
                          transition={{ duration: 0.4 }}
                          className="text-2xl font-bold text-gray-900 dark:text-white"
                        >
                          <AnimatedCounter value={liveCount} />
                        </motion.span>
                      </div>
                      <CapacityBar
                        current={liveCount}
                        max={site.capaciteMax}
                        presentLabel={t('sites_present_label')}
                        maxLabel={t('sites_max_label')}
                        capLabel={t('sites_cap_label')}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="px-5 py-3 grid grid-cols-3 divide-x divide-gray-100 dark:divide-[#2A2A2A]">
                      <div className="text-center pr-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('sites_interimaires_col')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{intCount}</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('sites_capacity_col')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{site.capaciteMax}</p>
                      </div>
                      <div className="text-center pl-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('sites_superficie_col')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{site.superficie ?? '—'}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-[#2A2A2A]">
                      <span className="text-xs text-gray-400">{t('sites_resp_label')} {site.responsable}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); handleEdit(site); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleToggleStatut(site.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(site.id, site.nom); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedSite(isSelected ? null : site); }}
                          className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'text-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000]' : 'text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000]'}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        ) : (
          /* ── List view ── */
          <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
              {filtered.map((site, i) => {
                const cfg = statutConfig[site.statut];
                const liveCount = getLiveCount(site.nom);
                const intCount = getInterimaireCount(site.nom);
                return (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] cursor-pointer transition-colors group"
                    onClick={() => setSelectedSite(selectedSite?.id === site.id ? null : site)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#CC0000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{site.nom}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${secteurColors[site.secteur] ?? 'bg-[#FFF0F0] text-[#CC0000]'}`}>{site.secteur}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {site.adresse}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1.5">
                          <LivePulse />
                          <motion.span
                            key={`list-${site.id}-${liveCount}`}
                            initial={{ scale: 1.3, color: '#CC0000' }}
                            animate={{ scale: 1, color: 'inherit' }}
                            className="text-lg font-bold text-gray-900 dark:text-white"
                          >
                            <AnimatedCounter value={liveCount} />
                          </motion.span>
                        </div>
                        <p className="text-xs text-gray-400">{t('sites_present_label')}</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{intCount}</p>
                        <p className="text-xs text-gray-400">{t('sites_interimaires_col')}</p>
                      </div>
                      <StatusBadge variant={cfg.variant}>{cfg.label}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); handleEdit(site); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(site.id, site.nom); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Detail panel ── */}
        <AnimatePresence>
          {selectedSite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl border border-[#CC0000]/30 shadow-xl shadow-[#CC0000]/5">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-[#FFF0F0] dark:bg-[#2A0000] rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">{selectedSite.nom}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('sites_detail_title')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[#CC0000] hover:bg-white/50 dark:hover:bg-[#1C1C1C]/50 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">{t('sites_detail_info')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><span className="text-gray-700 dark:text-gray-300">{selectedSite.adresse}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{selectedSite.telephone}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{selectedSite.email}</span></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">{t('sites_detail_resp')}</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-semibold text-sm">
                        {selectedSite.responsable.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedSite.responsable}</p>
                        <p className="text-xs text-gray-500">{t('sites_detail_chef')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">{t('sites_detail_live_cap')}</h4>
                    <CapacityBar
                      current={getLiveCount(selectedSite.nom)}
                      max={selectedSite.capaciteMax}
                      presentLabel={t('sites_present_label')}
                      maxLabel={t('sites_max_label')}
                      capLabel={t('sites_cap_label')}
                    />
                    <div className="flex gap-4 text-sm">
                      <div><span className="text-gray-500 text-xs">{t('sites_detail_secteur')}</span><p className="font-medium text-gray-900 dark:text-white">{selectedSite.secteur}</p></div>
                      <div><span className="text-gray-500 text-xs">{t('sites_detail_superficie')}</span><p className="font-medium text-gray-900 dark:text-white">{selectedSite.superficie ?? '—'}</p></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">{t('sites_detail_active')}</h4>
                    <div className="space-y-2">
                      {mockInterimaires.filter(i => i.site === selectedSite.nom && i.statut !== 'inactif').slice(0, 4).map(inter => (
                        <div key={inter.id} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {inter.prenom[0]}{inter.nom[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{inter.prenom} {inter.nom}</p>
                            <p className="text-xs text-gray-400 truncate">{inter.fonction}</p>
                          </div>
                        </div>
                      ))}
                      {getInterimaireCount(selectedSite.nom) === 0 && (
                        <p className="text-xs text-gray-400">{t('sites_detail_none')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editSite ? t('sites_modal_edit') : t('sites_modal_new')}
        size="xl"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
              {t('sites_modal_cancel')}
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all">
              {t('sites_modal_save')}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: t('sites_form_nom'),       key: 'nom',         type: 'text',   colSpan: 2 },
            { label: t('sites_form_ville'),      key: 'ville',       type: 'text' },
            { label: t('sites_form_secteur'),    key: 'secteur',     type: 'select', options: ['Industrie', 'Logistique', 'Export', 'Textile', 'Agroalimentaire'] },
            { label: t('sites_form_adresse'),    key: 'adresse',     type: 'text',   colSpan: 2 },
            { label: t('sites_form_resp'),       key: 'responsable', type: 'text' },
            { label: t('sites_form_tel'),        key: 'telephone',   type: 'text' },
            { label: t('sites_form_email'),      key: 'email',       type: 'email' },
            { label: t('sites_form_superficie'), key: 'superficie',  type: 'text' },
            { label: t('sites_form_cap'),        key: 'capaciteMax', type: 'number' },
            { label: t('sites_form_statut'),     key: 'statut',      type: 'select', options: ['actif', 'maintenance', 'ferme'] },
          ].map(field => (
            <div key={field.key} className={(field as any).colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={String(form[field.key as keyof typeof form])}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className={inputCls}
                >
                  {field.options?.map(o => (
                    <option key={o} value={o}>
                      {o === 'actif' ? t('sites_statut_actif') : o === 'maintenance' ? t('sites_statut_maintenance') : o === 'ferme' ? t('sites_statut_ferme') : o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={String(form[field.key as keyof typeof form])}
                  onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </AppLayout>
  );
}
