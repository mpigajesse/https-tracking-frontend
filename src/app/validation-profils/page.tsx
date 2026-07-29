'use client';

/**
 * Étape 3 du flux : l'administrateur statue sur les dossiers soumis par les
 * sociétés d'intérim.
 *
 * C'est le point de contrôle qui conditionne tout le reste : tant qu'un profil
 * n'est pas validé ici, le scan de son QR est refusé automatiquement à
 * l'accueil. Le refus exige donc un motif, journalisé et renvoyé à la société.
 */

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { ProfilStatusBadge } from '@/components/ui/ProfilStatusBadge';
import { useI18n } from '@/lib/i18n';
import {
  mockInterimaires, DOCUMENTS_REQUIS, documentsManquants,
  type Interimaire, type StatutProfil,
} from '@/lib/data';
import {
  BadgeCheck, Check, X, Search, FileCheck2, FileX2, Building2,
  Calendar, Phone, IdCard, PauseCircle, PlayCircle, ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MOTIFS_REFUS = [
  "Pièce d'identité illisible ou expirée",
  "Attestation d'assurance manquante",
  'Contrat de mission incomplet',
  'Visite médicale non fournie',
  "Doublon d'un profil existant",
];

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

type Onglet = 'en_attente' | 'valides' | 'refuses';

const ONGLETS: { cle: Onglet; statuts: StatutProfil[] }[] = [
  { cle: 'en_attente', statuts: ['en_attente_validation'] },
  { cle: 'valides', statuts: ['valide'] },
  { cle: 'refuses', statuts: ['refuse', 'suspendu'] },
];

export default function ValidationProfilsPage() {
  const { t } = useI18n();
  const [profils, setProfils] = useState<Interimaire[]>(mockInterimaires);
  const [onglet, setOnglet] = useState<Onglet>('en_attente');
  const [search, setSearch] = useState('');
  /** Dossier en cours de refus ou de suspension : le motif est obligatoire. */
  const [aRefuser, setARefuser] = useState<{ profil: Interimaire; suspension: boolean } | null>(null);
  const [motif, setMotif] = useState('');
  const [motifLibre, setMotifLibre] = useState('');

  const statutsVisibles = ONGLETS.find((o) => o.cle === onglet)!.statuts;

  const filtres = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profils
      .filter((p) => statutsVisibles.includes(p.statutProfil))
      .filter(
        (p) =>
          !q ||
          `${p.prenom} ${p.nom}`.toLowerCase().includes(q) ||
          p.agence.toLowerCase().includes(q) ||
          p.cin.toLowerCase().includes(q),
      );
  }, [profils, statutsVisibles, search]);

  const nbEnAttente = profils.filter((p) => p.statutProfil === 'en_attente_validation').length;

  const aujourdhui = () => new Date().toISOString().slice(0, 10);

  const valider = (p: Interimaire) => {
    setProfils((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, statutProfil: 'valide', statueLe: aujourdhui(), statuePar: 'Administrateur', motifRefus: undefined, qrStatus: 'actif', statut: 'actif' }
          : x,
      ),
    );
    toast.success(t('prof_approved'));
  };

  const reactiver = (p: Interimaire) => {
    setProfils((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, statutProfil: 'valide', statueLe: aujourdhui(), statuePar: 'Administrateur', motifRefus: undefined, qrStatus: 'actif' }
          : x,
      ),
    );
    toast.success(t('prof_reactivated'));
  };

  const motifRetenu = motif === '__autre' ? motifLibre.trim() : motif;

  const confirmerRefus = () => {
    if (!aRefuser || !motifRetenu) return;
    const { profil, suspension } = aRefuser;
    setProfils((prev) =>
      prev.map((x) =>
        x.id === profil.id
          ? {
              ...x,
              statutProfil: suspension ? 'suspendu' : 'refuse',
              statueLe: aujourdhui(),
              statuePar: 'Administrateur',
              motifRefus: motifRetenu,
              qrStatus: 'revoque',
            }
          : x,
      ),
    );
    toast.success(suspension ? t('prof_suspendedOk') : t('prof_refused'));
    setARefuser(null);
    setMotif('');
    setMotifLibre('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── En-tête ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <BadgeCheck className="w-6 h-6 text-[#CC0000]" />
            {t('prof_title')}
            {nbEnAttente > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#CC0000] text-white text-xs font-bold">
                {nbEnAttente}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('prof_subtitle')}</p>
        </div>

        {/* ── Onglets ── */}
        <div className="flex flex-wrap gap-2">
          {ONGLETS.map((o) => {
            const actif = onglet === o.cle;
            const n = profils.filter((p) => o.statuts.includes(p.statutProfil)).length;
            const label =
              o.cle === 'en_attente' ? t('prof_pending') : o.cle === 'valides' ? t('sp_valide') : t('sp_refuse');
            return (
              <button
                key={o.cle}
                onClick={() => setOnglet(o.cle)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  actif
                    ? 'bg-[#CC0000] text-white'
                    : 'bg-gray-100 dark:bg-[#1C1C1C] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A2A]'
                }`}
              >
                {label} <span className="opacity-70">({n})</span>
              </button>
            );
          })}
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
        {filtres.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
            <FileCheck2 className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">{t('prof_empty')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('prof_emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtres.map((p, idx) => {
                const manquants = documentsManquants(p);
                const enAttente = p.statutProfil === 'en_attente_validation';
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
                      {/* Identité */}
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
                              <Building2 className="w-3 h-3" /> {p.agence}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <IdCard className="w-3 h-3" /> {p.cin}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {p.telephone}
                            </span>
                            {p.soumisLe && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {t('prof_submittedOn')} {p.soumisLe}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ProfilStatusBadge statut={p.statutProfil} />
                    </div>

                    {/* Documents du dossier */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {DOCUMENTS_REQUIS.map((d) => {
                        const fourni = p.documents.includes(d.cle);
                        return (
                          <span
                            key={d.cle}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                              fourni
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]'
                            }`}
                          >
                            {fourni ? <FileCheck2 className="w-3 h-3" /> : <FileX2 className="w-3 h-3" />}
                            {d.libelle}
                          </span>
                        );
                      })}
                    </div>

                    {/* Motif de la décision négative */}
                    {p.motifRefus && (
                      <p className="mt-3 flex items-start gap-2 text-xs text-[#CC0000] dark:text-[#FF6666]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
                        {p.motifRefus}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A] flex flex-wrap gap-2">
                      {enAttente && (
                        <>
                          <button
                            onClick={() => valider(p)}
                            disabled={manquants.length > 0}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            {t('prof_approve')}
                          </button>
                          <button
                            onClick={() => { setARefuser({ profil: p, suspension: false }); setMotif(''); setMotifLibre(''); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#CC0000] text-[#CC0000] text-sm font-medium hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
                          >
                            <X className="w-4 h-4" />
                            {t('prof_refuse')}
                          </button>
                        </>
                      )}
                      {p.statutProfil === 'valide' && (
                        <button
                          onClick={() => { setARefuser({ profil: p, suspension: true }); setMotif(''); setMotifLibre(''); }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                        >
                          <PauseCircle className="w-4 h-4" />
                          {t('prof_suspend')}
                        </button>
                      )}
                      {p.statutProfil === 'suspendu' && (
                        <button
                          onClick={() => reactiver(p)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {t('prof_reactivate')}
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Motif de refus / suspension ── */}
      <Modal
        open={aRefuser !== null}
        onClose={() => setARefuser(null)}
        title={aRefuser?.suspension ? t('prof_suspend') : t('prof_refuse')}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setARefuser(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={confirmerRefus}
              disabled={!motifRetenu}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              {aRefuser?.suspension ? t('prof_suspend') : t('prof_refuse')}
            </button>
          </div>
        }
      >
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('prof_motif')}
          </legend>
          {MOTIFS_REFUS.map((m) => (
            <label key={m} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="motif"
                value={m}
                checked={motif === m}
                onChange={() => setMotif(m)}
                className="accent-[#CC0000]"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">{m}</span>
            </label>
          ))}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="motif"
              value="__autre"
              checked={motif === '__autre'}
              onChange={() => setMotif('__autre')}
              className="accent-[#CC0000]"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">{t('prof_otherMotif')}</span>
          </label>
          {motif === '__autre' && (
            <textarea
              value={motifLibre}
              onChange={(e) => setMotifLibre(e.target.value)}
              rows={3}
              className={`${inputCls} mt-1`}
              placeholder={t('prof_motif')}
            />
          )}
          {!motifRetenu && (
            <p className="text-xs text-gray-400 pt-1">{t('prof_motifRequired')}</p>
          )}
        </fieldset>
      </Modal>
    </AppLayout>
  );
}
