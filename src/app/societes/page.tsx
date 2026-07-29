'use client';

/**
 * Étape 1 du flux : l'administrateur crée et pilote les sociétés d'intérim.
 *
 * Une société suspendue reste visible mais ses intérimaires ne peuvent plus
 * pointer : le contrôle automatique du scan refuse l'entrée. La suspension
 * est donc une décision lourde, matérialisée par une confirmation explicite.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';
import { mockSocietes, mockInterimaires, SITES, type Societe } from '@/lib/data';
import {
  Briefcase, Plus, Search, MapPin, Phone, Mail, User, Hash,
  PauseCircle, PlayCircle, Users, ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

interface FormState {
  nom: string;
  siret: string;
  email: string;
  telephone: string;
  adresse: string;
  contactNom: string;
  sites: string[];
}

const FORM_VIDE: FormState = {
  nom: '', siret: '', email: '', telephone: '', adresse: '', contactNom: '', sites: [],
};

export default function SocietesPage() {
  const { t } = useI18n();
  const [societes, setSocietes] = useState<Societe[]>(mockSocietes);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VIDE);
  const [aSuspendre, setASuspendre] = useState<Societe | null>(null);

  /* Le compteur d'intérimaires est dérivé des profils, jamais saisi à la main :
     il reste juste quand un dossier change de statut. */
  const compteValides = useMemo(() => {
    const parSociete = new Map<string, number>();
    for (const i of mockInterimaires) {
      if (i.statutProfil !== 'valide') continue;
      parSociete.set(i.societeId, (parSociete.get(i.societeId) ?? 0) + 1);
    }
    return parSociete;
  }, []);

  const filtrees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return societes;
    return societes.filter(
      (s) =>
        s.nom.toLowerCase().includes(q) ||
        s.contactNom.toLowerCase().includes(q) ||
        s.siret.includes(q),
    );
  }, [societes, search]);

  const formValide = form.nom.trim() !== '' && form.email.trim() !== '' && form.sites.length > 0;

  const enregistrer = () => {
    if (!formValide) return;
    const societe: Societe = {
      ...form,
      id: `so${Date.now()}`,
      statut: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: 'Administrateur',
      nbInterimaires: 0,
    };
    setSocietes((prev) => [...prev, societe]);
    setShowModal(false);
    setForm(FORM_VIDE);
    toast.success(t('soc_created'));
  };

  const basculerStatut = (societe: Societe) => {
    const active = societe.statut === 'active';
    setSocietes((prev) =>
      prev.map((s) => (s.id === societe.id ? { ...s, statut: active ? 'suspendue' : 'active' } : s)),
    );
    toast.success(active ? t('soc_suspended') : t('soc_activated'));
    setASuspendre(null);
  };

  const basculerSite = (site: string) => {
    setForm((f) => ({
      ...f,
      sites: f.sites.includes(site) ? f.sites.filter((s) => s !== site) : [...f.sites, site],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── En-tête ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-[#CC0000]" />
              {t('soc_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('soc_subtitle')}</p>
          </div>
          <button
            onClick={() => { setForm(FORM_VIDE); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
          >
            <Plus className="w-4 h-4" />
            {t('soc_new')}
          </button>
        </div>

        {/* ── Recherche ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className={`${inputCls} pl-9`}
          />
        </div>

        {/* ── Grille des sociétés ── */}
        {filtrees.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
            <Briefcase className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">{t('soc_empty')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('soc_emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtrees.map((s, idx) => {
                const active = s.statut === 'active';
                const nbValides = compteValides.get(s.id) ?? 0;
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
                    {/* Liseré de statut : lecture immédiate sans lire le badge. */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-1 ${active ? 'bg-emerald-500' : 'bg-[#CC0000]'}`}
                    />

                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">{s.nom}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Hash className="w-3 h-3" /> {s.siret}
                        </p>
                      </div>
                      <StatusBadge variant={active ? 'success' : 'danger'}>
                        {active ? t('active') : t('inactive')}
                      </StatusBadge>
                    </header>

                    <dl className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <dd className="truncate">{s.contactNom}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <dd className="truncate">{s.email}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <dd>{s.telephone}</dd>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <dd className="truncate">{s.adresse}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.sites.map((site) => (
                        <span
                          key={site}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-300"
                        >
                          {site}
                        </span>
                      ))}
                    </div>

                    <footer className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 text-gray-400" />
                        <strong className="font-semibold text-gray-900 dark:text-white">{nbValides}</strong>
                        {t('soc_workers').toLowerCase()}
                      </span>
                      <button
                        onClick={() => (active ? setASuspendre(s) : basculerStatut(s))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? 'text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000]'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        {active ? t('soc_suspend') : t('soc_activate')}
                      </button>
                    </footer>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Création ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={t('soc_new')}
        size="xl"
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
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('soc_name')}</span>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('soc_siret')}</span>
            <input
              value={form.siret}
              onChange={(e) => setForm({ ...form, siret: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('soc_contact')}</span>
            <input
              value={form.contactNom}
              onChange={(e) => setForm({ ...form, contactNom: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('login_email')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('phone')}</span>
            <input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('address')}</span>
            <input
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('soc_sites')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {SITES.map((site) => {
                const choisi = form.sites.includes(site);
                return (
                  <button
                    key={site}
                    type="button"
                    onClick={() => basculerSite(site)}
                    aria-pressed={choisi}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      choisi
                        ? 'border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000]'
                        : 'border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {site}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </Modal>

      {/* ── Confirmation de suspension ── */}
      <Modal
        open={aSuspendre !== null}
        onClose={() => setASuspendre(null)}
        title={t('soc_suspend')}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setASuspendre(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => aSuspendre && basculerStatut(aSuspendre)}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              {t('soc_suspend')}
            </button>
          </div>
        }
      >
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('soc_suspended')}
            {aSuspendre && <strong className="block mt-2 text-gray-900 dark:text-white">{aSuspendre.nom}</strong>}
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
}
