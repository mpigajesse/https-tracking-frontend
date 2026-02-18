'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockSessions, Session, SessionStatus } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Edit3, Clock, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

const statusBadge: Record<SessionStatus, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  en_attente_ouverture: 'info',
  ouverte: 'success',
  en_attente_fermeture: 'warning',
  fermee: 'success',
  cloturee_auto: 'neutral',
  en_litige: 'danger',
  annulee: 'neutral',
};

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

export default function ValidationPage() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [selectedTab, setSelectedTab] = useState<'ouverture' | 'fermeture' | 'litige'>('ouverture');
  const [correctModal, setCorrectModal] = useState<Session | null>(null);
  const [correctedHeure, setCorrectedHeure] = useState('');

  const statusLabel: Record<SessionStatus, string> = {
    en_attente_ouverture: t('val_status_wait_open'),
    ouverte:              t('val_status_open'),
    en_attente_fermeture: t('val_status_wait_close'),
    fermee:               t('val_status_closed'),
    cloturee_auto:        t('val_status_auto'),
    en_litige:            t('val_status_dispute'),
    annulee:              t('val_status_cancelled'),
  };

  const ouverturePending = sessions.filter(s => s.statut === 'en_attente_ouverture');
  const fermeturePending = sessions.filter(s => s.statut === 'en_attente_fermeture');
  const litigePending    = sessions.filter(s => s.statut === 'en_litige');

  const displayed = selectedTab === 'ouverture' ? ouverturePending : selectedTab === 'fermeture' ? fermeturePending : litigePending;

  const validate = (id: string, type: 'ouverture' | 'fermeture') => {
    setSessions(prev => prev.map(s => s.id !== id ? s : { ...s, statut: type === 'ouverture' ? 'ouverte' : 'fermee' }));
    toast.success(t('val_validate'), { icon: '✅' });
  };

  const refuse = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, statut: 'annulee' } : s));
    toast.error(t('val_refuse'), { icon: '❌' });
  };

  const correct = (session: Session) => {
    setCorrectModal(session);
    setCorrectedHeure(session.heureDebut.split('T')[1]?.slice(0, 5) || '');
  };

  const applyCorrection = () => {
    if (correctModal) {
      const base = correctModal.heureDebut.split('T')[0];
      setSessions(prev => prev.map(s => s.id === correctModal.id ? { ...s, heureDebut: `${base}T${correctedHeure}:00`, statut: 'ouverte' } : s));
      toast.success(t('val_apply'));
      setCorrectModal(null);
    }
  };

  const tabs = [
    { key: 'ouverture', label: t('val_tab_open'),    count: ouverturePending.length },
    { key: 'fermeture', label: t('val_tab_close'),   count: fermeturePending.length },
    { key: 'litige',    label: t('val_tab_dispute'), count: litigePending.length    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('val_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('val_subtitle')}</p>
          </div>
          <button className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-600 dark:text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000]/40 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-1 w-fit gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === tab.key
                  ? 'bg-[#CC0000] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#CC0000] dark:hover:text-[#FF4444]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  selectedTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          {displayed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-16 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-[#CC0000] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('val_no_pending')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('val_no_pending_sub')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {displayed.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-5 hover:border-[#CC0000]/30 hover:shadow-md transition-all"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[#CC0000] to-[#AA0000] rounded-t-xl -mt-5 -mx-5 mb-4 w-[calc(100%+2.5rem)]" />

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-bold text-sm">
                      {session.interimaireNom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{session.interimaireNom}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{session.fonction}</div>
                    </div>
                    <StatusBadge variant={statusBadge[session.statut]}>{statusLabel[session.statut]}</StatusBadge>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-[#CC0000]" />
                      {session.site}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-[#CC0000]" />
                      {new Date(session.heureDebut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => validate(session.id, selectedTab === 'fermeture' ? 'fermeture' : 'ouverture')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-semibold transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('val_validate')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => correct(session)}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 hover:border-[#CC0000]/40 hover:text-[#CC0000] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => refuse(session.id)}
                      className="px-3 py-2.5 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] hover:bg-[#FFE0E0] dark:hover:bg-[#3A0000] border border-[#CC0000]/20 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Correction modal */}
      <Modal
        open={!!correctModal}
        onClose={() => setCorrectModal(null)}
        title={t('val_correct_title')}
        size="sm"
        footer={
          <>
            <button onClick={() => setCorrectModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
              {t('val_cancel')}
            </button>
            <button onClick={applyCorrection} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all">
              {t('val_apply')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('val_correct_label')} <strong className="text-gray-900 dark:text-white">{correctModal?.interimaireNom}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('val_corrected_hour')}</label>
            <input
              type="time"
              value={correctedHeure}
              onChange={e => setCorrectedHeure(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
