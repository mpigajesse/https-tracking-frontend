'use client';

/**
 * Étape 2 du flux : la société d'intérim saisit ses profils, complète leur
 * dossier, puis les soumet à l'administrateur.
 *
 * La société ne voit que ses propres profils, et ne peut modifier qu'un
 * brouillon : une fois soumis, le dossier lui échappe jusqu'à la décision de
 * l'admin. Un dossier refusé peut être repris, corrigé, et soumis à nouveau.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { ProfilStatusBadge } from '@/components/ui/ProfilStatusBadge';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import {
  mockInterimaires, mockSocietes, DOCUMENTS_REQUIS, documentsManquants,
  FONCTIONS, TYPES_ACTIVITE,
  type Interimaire, type DocumentCle, type TypeActivite,
} from '@/lib/data';
import {
  UserCheck, Plus, Search, Send, FileCheck2, FileX2, Pencil,
  ShieldAlert, Calendar, IdCard, Phone, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

interface FormState {
  prenom: string;
  nom: string;
  cin: string;
  email: string;
  telephone: string;
  fonction: string;
  typeActivite: TypeActivite;
  site: string;
  dateDebut: string;
  dateFin: string;
}

const FORM_VIDE: FormState = {
  prenom: '', nom: '', cin: '', email: '', telephone: '',
  fonction: FONCTIONS[0], typeActivite: 'production',
  site: '', dateDebut: '', dateFin: '',
};

export default function MesInterimairesPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  /* La société du compte connecté. À défaut (consultation par un admin),
     on retombe sur la première société pour que l'écran reste démontrable. */
  const societe = useMemo(
    () => mockSocietes.find((s) => s.id === user?.societeId) ?? mockSocietes[0],
    [user],
  );

  const [profils, setProfils] = useState<Interimaire[]>(mockInterimaires);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({ ...FORM_VIDE, site: societe.sites[0] ?? '' });
  const [enEdition, setEnEdition] = useState<Interimaire | null>(null);

  const miens = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profils
      .filter((p) => p.societeId === societe.id)
      .filter((p) => !q || `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.cin.toLowerCase().includes(q));
  }, [profils, societe.id, search]);

  const formValide =
    form.prenom.trim() !== '' && form.nom.trim() !== '' && form.cin.trim() !== '' && form.site !== '';

  const ouvrirCreation = () => {
    setEnEdition(null);
    setForm({ ...FORM_VIDE, site: societe.sites[0] ?? '' });
    setShowModal(true);
  };

  const ouvrirEdition = (p: Interimaire) => {
    setEnEdition(p);
    setForm({
      prenom: p.prenom, nom: p.nom, cin: p.cin, email: p.email, telephone: p.telephone,
      fonction: p.fonction, typeActivite: p.typeActivite,
      site: p.site, dateDebut: p.dateDebut, dateFin: p.dateFin,
    });
    setShowModal(true);
  };

  const enregistrer = () => {
    if (!formValide) return;
    if (enEdition) {
      setProfils((prev) => prev.map((p) => (p.id === enEdition.id ? { ...p, ...form } : p)));
      toast.success(t('save'));
    } else {
      const profil: Interimaire = {
        ...form,
        id: `i${Date.now()}`,
        societeId: societe.id,
        agence: societe.nom,
        statut: 'inactif',
        qrStatus: 'revoque',
        totalHeures: 0,
        statutProfil: 'brouillon',
        documents: [],
      };
      setProfils((prev) => [...prev, profil]);
      toast.success(t('mine_created'));
    }
    setShowModal(false);
  };

  /** Un document ne peut être ajouté ou retiré que tant que le dossier est un brouillon. */
  const basculerDocument = (profil: Interimaire, doc: DocumentCle) => {
    if (profil.statutProfil !== 'brouillon') return;
    setProfils((prev) =>
      prev.map((p) =>
        p.id === profil.id
          ? {
              ...p,
              documents: p.documents.includes(doc)
                ? p.documents.filter((d) => d !== doc)
                : [...p.documents, doc],
            }
          : p,
      ),
    );
  };

  const soumettre = (p: Interimaire) => {
    setProfils((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? {
              ...x,
              statutProfil: 'en_attente_validation',
              soumisLe: new Date().toISOString().slice(0, 10),
              motifRefus: undefined,
            }
          : x,
      ),
    );
    toast.success(t('mine_submitted'));
  };

  /** Reprendre un dossier refusé : il redevient modifiable. */
  const corriger = (p: Interimaire) => {
    setProfils((prev) => prev.map((x) => (x.id === p.id ? { ...x, statutProfil: 'brouillon' } : x)));
    toast.success(t('mine_fix'));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── En-tête ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-[#CC0000]" />
              {t('mine_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {societe.nom} — {t('mine_subtitle')}
            </p>
          </div>
          <button
            onClick={ouvrirCreation}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-lg shadow-red-600/20 transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
          >
            <Plus className="w-4 h-4" />
            {t('mine_new')}
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

        {/* ── Dossiers ── */}
        {miens.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
            <UserCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">{t('mine_empty')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('mine_emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {miens.map((p, idx) => {
                const manquants = documentsManquants(p);
                const brouillon = p.statutProfil === 'brouillon';
                const complet = manquants.length === 0;
                return (
                  <motion.article
                    key={p.id}
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
                          {p.prenom.charAt(0)}{p.nom.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                            {p.prenom} {p.nom}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.fonction} · {p.site}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <IdCard className="w-3 h-3" /> {p.cin}
                            </span>
                            {p.telephone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {p.telephone}
                              </span>
                            )}
                            {p.soumisLe && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {p.soumisLe}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ProfilStatusBadge statut={p.statutProfil} />
                    </div>

                    {/* Documents — cliquables tant que le dossier est un brouillon */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {t('mine_documents')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {DOCUMENTS_REQUIS.map((d) => {
                          const fourni = p.documents.includes(d.cle);
                          const cls = fourni
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]';
                          return (
                            <button
                              key={d.cle}
                              type="button"
                              disabled={!brouillon}
                              onClick={() => basculerDocument(p, d.cle)}
                              aria-pressed={fourni}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-opacity ${cls} ${
                                brouillon ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
                              }`}
                            >
                              {fourni ? <FileCheck2 className="w-3 h-3" /> : <FileX2 className="w-3 h-3" />}
                              {d.libelle}
                            </button>
                          );
                        })}
                      </div>
                      {brouillon && (
                        <p className={`mt-2 text-xs ${complet ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                          {complet ? t('mine_complete') : t('mine_incomplete')}
                        </p>
                      )}
                    </div>

                    {/* Motif du refus renvoyé par l'admin */}
                    {p.statutProfil === 'refuse' && p.motifRefus && (
                      <p className="mt-3 flex items-start gap-2 text-xs text-[#CC0000] dark:text-[#FF6666]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
                        <span>
                          <strong>{t('mine_refusedBy')} :</strong> {p.motifRefus}
                        </span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A] flex flex-wrap gap-2">
                      {brouillon && (
                        <>
                          <button
                            onClick={() => soumettre(p)}
                            disabled={!complet}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                          >
                            <Send className="w-4 h-4" />
                            {t('mine_submit')}
                          </button>
                          <button
                            onClick={() => ouvrirEdition(p)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            {t('edit')}
                          </button>
                        </>
                      )}
                      {p.statutProfil === 'refuse' && (
                        <button
                          onClick={() => corriger(p)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#CC0000] text-[#CC0000] text-sm font-medium hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          {t('mine_fix')}
                        </button>
                      )}
                      {p.statutProfil === 'valide' && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('prof_approved')}
                        </span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Création / édition d'un profil ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={enEdition ? t('edit') : t('mine_new')}
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
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_firstname')}</span>
            <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_lastname')}</span>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CIN</span>
            <input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_tel')}</span>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_email')}</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_fonction')}</span>
            <select value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })} className={`${inputCls} mt-1`}>
              {FONCTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('activite_label')}</span>
            <select
              value={form.typeActivite}
              onChange={(e) => setForm({ ...form, typeActivite: e.target.value as TypeActivite })}
              className={`${inputCls} mt-1`}
            >
              {Object.entries(TYPES_ACTIVITE).map(([cle, libelle]) => (
                <option key={cle} value={cle}>{libelle}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_site')}</span>
            <select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className={`${inputCls} mt-1`}>
              {societe.sites.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_start')}</span>
            <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('inter_form_end')}</span>
            <input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
        </div>
      </Modal>
    </AppLayout>
  );
}
