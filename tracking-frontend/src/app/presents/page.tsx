'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockInterimaires, mockSessions } from '@/lib/data';
import { motion } from 'framer-motion';
import {
  Users, Clock, Download, RefreshCw, Shield, Search, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Present {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  agence: string;
  heureEntree: string;
  site: string;
}

// Build presents from open sessions
const buildPresents = (): Present[] => {
  return mockSessions
    .filter(s => s.statut === 'ouverte' || s.statut === 'en_attente_fermeture')
    .map(s => {
      const interimaire = mockInterimaires.find(i => i.id === s.interimaire);
      return {
        id: s.id,
        nom: interimaire?.nom || '',
        prenom: interimaire?.prenom || '',
        fonction: interimaire?.fonction || '',
        agence: interimaire?.agence || '',
        heureEntree: s.heureDebut,
        site: s.site,
      };
    });
};

export default function PresentsPage() {
  const [presents] = useState<Present[]>(buildPresents());
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filtered = presents.filter(p =>
    `${p.nom} ${p.prenom} ${p.fonction} ${p.agence}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setLastRefresh(new Date());
    toast.success('Liste actualisée');
  };

  const exportPDF = () => {
    toast.success('Export PDF d\'urgence généré');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liste Présents – Sécurité</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mise à jour : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <motion.button
              onClick={exportPDF}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              <Shield className="w-4 h-4" />
              Export Urgence PDF
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{presents.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Présents sur site</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {presents.length > 0 ? `${Math.floor(
                    presents.reduce((acc, p) => {
                      const diff = (Date.now() - new Date(p.heureEntree).getTime()) / 3600000;
                      return acc + diff;
                    }, 0) / presents.length
                  )}h` : '0h'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Durée moy. présence</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(presents.map(p => p.agence))].length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Agences représentées</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155]">
          <div className="p-4 border-b border-gray-100 dark:border-[#334155]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom, fonction, agence..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun présent sur site</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#334155]">
                <thead className="bg-gray-50 dark:bg-[#0F172A]">
                  <tr>
                    {['#', 'Intérimaire', 'Fonction', 'Agence', 'Site', 'Heure entrée', 'Durée', 'Statut'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#334155]">
                  {filtered.map((p, i) => {
                    const duration = Math.floor((Date.now() - new Date(p.heureEntree).getTime()) / 3600000);
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                              {p.prenom[0]}{p.nom[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{p.prenom} {p.nom}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.fonction}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.agence}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.site}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                          {new Date(p.heureEntree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{duration}h</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant="success">Présent</StatusBadge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-gray-100 dark:border-[#334155] flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filtered.length} présent(s)</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
