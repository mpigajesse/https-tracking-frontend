'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockSessions, SITES } from '@/lib/data';
import { motion } from 'framer-motion';
import { History, Download, Filter, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  fermee: 'success',
  en_litige: 'danger',
  en_attente_fermeture: 'warning',
  en_attente_ouverture: 'info',
  ouverte: 'info',
  cloturee_auto: 'neutral',
  annulee: 'neutral',
};

const STATUS_LABELS: Record<string, string> = {
  fermee: 'Terminée',
  en_litige: 'En litige',
  en_attente_fermeture: 'Att. fermeture',
  en_attente_ouverture: 'Att. ouverture',
  ouverte: 'En cours',
  cloturee_auto: 'Clôturée auto',
  annulee: 'Annulée',
};

export default function MesSessionsPage() {
  const [filterSite, setFilterSite] = useState('Tous');
  const [filterMonth, setFilterMonth] = useState('02');
  const [search, setSearch] = useState('');

  const sessions = mockSessions.filter(s => {
    const matchSite = filterSite === 'Tous' || s.site === filterSite;
    const date = new Date(s.heureDebut);
    const matchMonth = `${date.getMonth() + 1}`.padStart(2, '0') === filterMonth;
    return matchSite && matchMonth;
  });

  const totalHeures = sessions.reduce((acc, s) => acc + (s.duree || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Sessions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Historique complet de pointage</p>
          </div>
          <button
            onClick={() => toast.success('Export téléchargé')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total sessions', value: sessions.length, color: 'text-blue-600' },
            { label: 'Heures ce mois', value: `${totalHeures}h`, color: 'text-green-600' },
            { label: 'Terminées', value: sessions.filter(s => s.statut === 'fermee').length, color: 'text-green-600' },
            { label: 'En litige', value: sessions.filter(s => s.statut === 'en_litige').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155]">
          <div className="p-4 border-b border-gray-100 dark:border-[#334155] flex flex-wrap gap-3">
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                <option key={m} value={m}>{new Date(2026, parseInt(m)-1).toLocaleString('fr-FR', { month: 'long' })}</option>
              ))}
            </select>
            <select
              value={filterSite}
              onChange={e => setFilterSite(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Tous</option>
              {SITES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          {sessions.length === 0 ? (
            <div className="p-16 text-center">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune session pour cette période</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#334155]">
                <thead className="bg-gray-50 dark:bg-[#0F172A]">
                  <tr>
                    {['Date', 'Site', 'Heure début', 'Heure fin', 'Durée', 'Statut'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#334155]">
                  {sessions.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(s.heureDebut).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.site}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                        {new Date(s.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                        {s.heureFin ? new Date(s.heureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {s.duree ? `${s.duree}h` : '–'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={STATUS_MAP[s.statut] || 'neutral'}>
                          {STATUS_LABELS[s.statut] || s.statut}
                        </StatusBadge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-gray-100 dark:border-[#334155] flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{sessions.length} session(s)</span>
            <span className="font-semibold text-blue-600">{totalHeures}h total</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
