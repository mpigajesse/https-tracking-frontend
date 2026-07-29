'use client';

/**
 * Services internes de l'entreprise utilisatrice.
 *
 * Un service porte l'imputation des heures : chaque demandeur lui est rattaché,
 * et chaque session validée hérite du service de son demandeur. Désactiver un
 * service retire donc ses demandeurs de la liste d'affectation — c'est pourquoi
 * on affiche le nombre de demandeurs concernés avant de basculer le statut.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';
import { mockServices, mockDemandeurs, SITES, type Service } from '@/lib/data';
import {
  Layers, Plus, Search, User, Hash, MapPin, Users,
  PauseCircle, PlayCircle, ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

interface FormState {
  nom: string;
  code: string;
  responsable: string;
  site: string;
}

const FORM_VIDE: FormState = { nom: '', code: '', responsable: '', site: SITES[0] };

export default function ServicesPage() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VIDE);
  const [aDesactiver, setADesactiver] = useState<Service | null>(null);

  /* Nombre de demandeurs par service : dérivé, jamais saisi. */
  const compteDemandeurs = useMemo(() => {
    const parService = new Map<string, number>();
    for (const d of mockDemandeurs) {
      parService.set(d.serviceId, (parService.get(d.serviceId) ?? 0) + 1);
    }
    return parService;
  }, []);

  const filtres = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.nom.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.responsable.toLowerCase().includes(q),
    );
  }, [services, search]);

  const formValide = form.nom.trim() !== '' && form.code.trim() !== '';

  const enregistrer = () => {
    if (!formValide) return;
    const service: Service = {
      ...form,
      code: form.code.trim().toUpperCase(),
      id: `sv${Date.now()}`,
      actif: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setServices((prev) => [...prev, service]);
    setShowModal(false);
    setForm(FORM_VIDE);
    toast.success(t('svc_created'));
  };

  const basculer = (service: Service) => {
    const actif = service.actif;
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, actif: !actif } : s)));
    toast.success(actif ? t('svc_disabled') : t('svc_enabled'));
    setADesactiver(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-[#CC0000]" />
              {t('svc_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('svc_subtitle')}</p>
          </div>
          <button
            onClick={() => { setForm(FORM_VIDE); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
          >
            <Plus className="w-4 h-4" />
            {t('svc_new')}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className={`${inputCls} pl-9`}
          />
        </div>

        {filtres.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
            <Layers className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">{t('svc_empty')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('svc_emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtres.map((s, idx) => {
                const nb = compteDemandeurs.get(s.id) ?? 0;
                return (
                  <motion.article
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-5"
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-1 ${s.actif ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#3A3A3A]'}`}
                    />

                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">{s.nom}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Hash className="w-3 h-3" /> {s.code}
                        </p>
                      </div>
                      <StatusBadge variant={s.actif ? 'success' : 'neutral'}>
                        {s.actif ? t('active') : t('inactive')}
                      </StatusBadge>
                    </header>

                    <dl className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <dd className="truncate">{s.responsable}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <dd className="truncate">{s.site}</dd>
                      </div>
                    </dl>

                    <footer className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 text-gray-400" />
                        <strong className="font-semibold text-gray-900 dark:text-white">{nb}</strong>
                        {t('svc_requesters').toLowerCase()}
                      </span>
                      <button
                        onClick={() => (s.actif ? setADesactiver(s) : basculer(s))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          s.actif
                            ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {s.actif ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        {s.actif ? t('disable') : t('svc_activate')}
                      </button>
                    </footer>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={t('svc_new')}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={enregistrer}
              disabled={!formValide}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              {t('save')}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('svc_name')}</span>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('svc_code')}</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="PROD"
              className={`${inputCls} mt-1 uppercase`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('svc_manager')}</span>
            <input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_site')}</span>
            <select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className={`${inputCls} mt-1`}>
              {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </Modal>

      {/* La désactivation a un effet en cascade : on le dit avant de confirmer. */}
      <Modal
        open={aDesactiver !== null}
        onClose={() => setADesactiver(null)}
        title={t('disable')}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setADesactiver(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => aDesactiver && basculer(aDesactiver)}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              {t('disable')}
            </button>
          </div>
        }
      >
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('svc_disabled')}
            {aDesactiver && (
              <strong className="block mt-2 text-gray-900 dark:text-white">
                {aDesactiver.nom} — {compteDemandeurs.get(aDesactiver.id) ?? 0} {t('svc_requesters').toLowerCase()}
              </strong>
            )}
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
}
