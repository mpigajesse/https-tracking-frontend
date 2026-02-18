'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockSessions, Session, SessionStatus } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Edit3, Clock, MapPin,
  RefreshCw, ChevronDown, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge: Record<SessionStatus, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  en_attente_ouverture: 'info',
  ouverte: 'success',
  en_attente_fermeture: 'warning',
  fermee: 'success',
  cloturee_auto: 'neutral',
  en_litige: 'danger',
  annulee: 'neutral',
};

const statusLabel: Record<SessionStatus, string> = {
  en_attente_ouverture: 'Att. ouverture',
  ouverte: 'Ouverte',
  en_attente_fermeture: 'Att. fermeture',
  fermee: 'Fermée',
  cloturee_auto: 'Clôturée auto',
  en_litige: 'En litige',
  annulee: 'Annulée',
};

export default function ValidationPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [selectedTab, setSelectedTab] = useState<'ouverture' | 'fermeture' | 'litige'>('ouverture');
  const [correctModal, setCorrectModal] = useState<Session | null>(null);
  const [correctedHeure, setCorrectedHeure] = useState('');

  const ouverturePending = sessions.filter(s => s.statut === 'en_attente_ouverture');
  const fermeturePending = sessions.filter(s => s.statut === 'en_attente_fermeture');
  const litigePending = sessions.filter(s => s.statut === 'en_litige');

  const displayed = selectedTab === 'ouverture' ? ouverturePending : selectedTab === 'fermeture' ? fermeturePending : litigePending;

  const validate = (id: string, type: 'ouverture' | 'fermeture') => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, statut: type === 'ouverture' ? 'ouverte' : 'fermee' };
    }));
    toast.success('Session validée', { icon: '✅' });
  };

  const refuse = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, statut: 'annulee' } : s));
    toast.error('Session refusée', { icon: '❌' });
  };

  const correct = (session: Session) => {
    setCorrectModal(session);
    setCorrectedHeure(session.heureDebut.split('T')[1]?.slice(0, 5) || '');
  };

  const applyCorrection = () => {
    if (correctModal) {
      const base = correctModal.heureDebut.split('T')[0];
      setSessions(prev => prev.map(s => s.id === correctModal.id ? { ...s, heureDebut: `${base}T${correctedHeure}:00`, statut: 'ouverte' } : s));
      toast.success('Correction appliquée');
      setCorrectModal(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validation Sessions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Traitement des demandes en temps réel</p>
          </div>
          <button className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-1 w-fit">
          {[
            { key: 'ouverture', label: 'Demandes ouverture', count: ouverturePending.length, color: 'text-blue-600' },
            { key: 'fermeture', label: 'Demandes fermeture', count: fermeturePending.length, color: 'text-yellow-600' },
            { key: 'litige', label: 'En litige', count: litigePending.length, color: 'text-red-600' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#334155]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  selectedTab === tab.key ? 'bg-white/20 text-white' : `bg-gray-100 dark:bg-[#334155] ${tab.color}`
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-16 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aucune demande en attente</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toutes les sessions sont à jour.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {displayed.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-5 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {session.interimaireNom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{session.interimaireNom}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{session.fonction}</div>
                    </div>
                    <StatusBadge variant={statusBadge[session.statut]}>{statusLabel[session.statut]}</StatusBadge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {session.site}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(session.heureDebut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => validate(session.id, selectedTab === 'fermeture' ? 'fermeture' : 'ouverture')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Valider
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => correct(session)}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                      title="Corriger"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => refuse(session.id)}
                      className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Refuser"
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
        title="Corriger l'heure"
        size="sm"
        footer={
          <>
            <button onClick={() => setCorrectModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={applyCorrection} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Appliquer</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Correction manuelle pour <strong>{correctModal?.interimaireNom}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Heure corrigée</label>
            <input
              type="time"
              value={correctedHeure}
              onChange={e => setCorrectedHeure(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
