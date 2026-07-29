'use client';

/**
 * Demandeurs — personnes habilitées à réclamer un intérimaire.
 *
 * Chaque demandeur est rattaché à un service : c'est ce lien qui porte
 * l'imputation. Un demandeur reste visible même si son service est désactivé,
 * mais il devient non affectable — l'écran le signale explicitement plutôt que
 * de le masquer, pour que l'administrateur comprenne pourquoi il a disparu de
 * la liste de validation.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';
import { mockDemandeurs, mockServices, type Demandeur } from '@/lib/data';
import {
  UserSquare2, Plus, Search, Mail, Phone, Layers,
  PauseCircle, PlayCircle, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  serviceId: string;
}

export default function DemandeursPage() {
  const { t } = useI18n();
  const services = mockServices;
  const [demandeurs, setDemandeurs] = useState<Demandeur[]>(mockDemandeurs);
  const [search, setSearch] = useState('');
  const [filtreService, setFiltreService] = useState<'tous' | string>('tous');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    prenom: '', nom: '', email: '', telephone: '', serviceId: services[0]?.id ?? '',
  });

  const filtres = useMemo(() => {
    const q = search.trim().toLowerCase();
    return demandeurs
      .filter((d) => filtreService === 'tous' || d.serviceId === filtreService)
      .filter(
        (d) =>
          !q ||
          `${d.prenom} ${d.nom}`.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.serviceNom.toLowerCase().includes(q),
      );
  }, [demandeurs, filtreService, search]);

  const formValide =
    form.prenom.trim() !== '' && form.nom.trim() !== '' && form.serviceId !== '';

  const enregistrer = () => {
    if (!formValide) return;
    const service = services.find((s) => s.id === form.serviceId);
    const demandeur: Demandeur = {
      ...form,
      id: `dm${Date.now()}`,
      serviceNom: service?.nom ?? '—',
      actif: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDemandeurs((prev) => [...prev, demandeur]);
    setShowModal(false);
    setForm({ prenom: '', nom: '', email: '', telephone: '', serviceId: services[0]?.id ?? '' });
    toast.success(t('dem_created'));
  };

  const basculer = (d: Demandeur) => {
    setDemandeurs((prev) => prev.map((x) => (x.id === d.id ? { ...x, actif: !x.actif } : x)));
    toast.success(d.actif ? t('dem_disabled') : t('dem_enabled'));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <UserSquare2 className="w-6 h-6 text-[#CC0000]" />
              {t('dem_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dem_subtitle')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={services.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
          >
            <Plus className="w-4 h-4" />
            {t('dem_new')}
          </button>
        </div>

        {services.length === 0 && (
          <p className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-sm text-amber-800 dark:text-amber-300">
            {t('dem_noService')}
          </p>
        )}

        {/* Filtre par service : c'est l'axe de lecture naturel de cette liste. */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltreService('tous')}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
              filtreService === 'tous'
                ? 'bg-[#CC0000] text-white'
                : 'bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('all')} <span className="opacity-70">({demandeurs.length})</span>
          </button>
          {services.map((s) => {
            const n = demandeurs.filter((d) => d.serviceId === s.id).length;
            const actif = filtreService === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFiltreService(s.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                  actif
                    ? 'bg-[#CC0000] text-white'
                    : 'bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300'
                }`}
              >
                {s.nom} <span className="opacity-70">({n})</span>
              </button>
            );
          })}
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
            <UserSquare2 className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">{t('dem_empty')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dem_emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtres.map((d, idx) => {
                const service = services.find((s) => s.id === d.serviceId);
                const serviceInactif = service ? !service.actif : true;
                return (
                  <motion.article
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className="w-11 h-11 rounded-xl grid place-items-center text-white text-sm font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                        >
                          {d.prenom.charAt(0)}{d.nom.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                            {d.prenom} {d.nom}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3" /> {d.serviceNom}
                            {service && <span className="text-gray-400">· {service.code}</span>}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {d.email}
                            </span>
                            {d.telephone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {d.telephone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <StatusBadge variant={d.actif ? 'success' : 'neutral'}>
                        {d.actif ? t('active') : t('inactive')}
                      </StatusBadge>
                    </div>

                    {/* Un demandeur actif dont le service est fermé reste inaffectable :
                        la cause doit être lisible, sinon elle passe pour un bug. */}
                    {d.actif && serviceInactif && (
                      <p className="mt-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                        {t('dem_serviceInactive')}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                      <button
                        onClick={() => basculer(d)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          d.actif
                            ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {d.actif ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        {d.actif ? t('disable') : t('svc_activate')}
                      </button>
                    </div>
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
        title={t('dem_new')}
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
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_firstname')}</span>
            <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_lastname')}</span>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_email')}</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_tel')}</span>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('dem_service')}</span>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className={`${inputCls} mt-1`}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom} ({s.code}){s.actif ? '' : ` — ${t('inactive')}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </AppLayout>
  );
}
