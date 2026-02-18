'use client';

import AppLayout from '@/components/layout/AppLayout';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Download, RefreshCw, Search,
  CheckCircle2, XCircle, Clock, Filter,
  ChevronDown, Eye
} from 'lucide-react';
import { mockInterimaires } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import toast from 'react-hot-toast';

const statusConfig = {
  actif:   { label: 'Actif',   color: 'bg-green-500/20 text-green-400 border border-green-500/30',  icon: CheckCircle2 },
  expire:  { label: 'Expiré',  color: 'bg-amber-500/20  text-amber-400  border border-amber-500/30', icon: Clock },
  revoque: { label: 'Révoqué', color: 'bg-[#CC0000]/20  text-[#FF4444]  border border-[#CC0000]/30', icon: XCircle },
};

export default function QRCodesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'actif' | 'expire' | 'revoque'>('all');
  const [selected, setSelected] = useState<typeof mockInterimaires[0] | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>(
    Object.fromEntries(mockInterimaires.map(i => [i.id, i.qrToken || `QR-${i.id}-2025`]))
  );

  const filtered = mockInterimaires.filter(i => {
    const matchSearch = `${i.prenom} ${i.nom} ${i.cin} ${i.site}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.qrStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const refreshToken = (id: string) => {
    setTokens(prev => ({ ...prev, [id]: `QR-${id}-${Date.now()}` }));
    toast.success('QR Code renouvelé');
  };

  const revokeToken = (id: string, nom: string) => {
    toast.error(`QR révoqué pour ${nom}`);
  };

  const stats = {
    total:   mockInterimaires.length,
    actif:   mockInterimaires.filter(i => i.qrStatus === 'actif').length,
    expire:  mockInterimaires.filter(i => i.qrStatus === 'expire').length,
    revoque: mockInterimaires.filter(i => i.qrStatus === 'revoque').length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
              QR Codes
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {stats.total} intérimaires · {stats.actif} QR actifs
            </p>
          </div>
          <button
            onClick={() => toast.success('Export PDF en cours...')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
          >
            <Download className="w-4 h-4" />
            Exporter tous
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total,   icon: QrCode,        color: 'from-[#CC0000] to-[#7A0000]' },
            { label: 'Actifs', value: stats.actif,  icon: CheckCircle2,  color: 'from-green-700 to-green-900' },
            { label: 'Expirés', value: stats.expire, icon: Clock,        color: 'from-amber-700 to-amber-900' },
            { label: 'Révoqués', value: stats.revoque, icon: XCircle,    color: 'from-[#CC0000] to-[#400000]' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#1C1C1C] rounded-xl p-4 border border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#9CA3AF] text-xs font-medium">{label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Rechercher par nom, CIN, site..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#CC0000] transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-9 pr-8 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-[#CC0000] transition-colors cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="expire">Expirés</option>
              <option value="revoque">Révoqués</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1C1C1C] rounded-2xl border border-[#2A2A2A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#111111]">
                  {['Intérimaire', 'CIN', 'Site', 'Statut QR', 'Token', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filtered.map((interimaire, idx) => {
                  const status = statusConfig[interimaire.qrStatus];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={interimaire.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-[#232323] transition-colors"
                    >
                      {/* Intérimaire */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {interimaire.prenom[0]}{interimaire.nom[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium">{interimaire.prenom} {interimaire.nom}</p>
                            <p className="text-[#9CA3AF] text-xs">{interimaire.fonction}</p>
                          </div>
                        </div>
                      </td>
                      {/* CIN */}
                      <td className="px-4 py-3 text-[#9CA3AF] font-mono text-xs">{interimaire.cin}</td>
                      {/* Site */}
                      <td className="px-4 py-3 text-[#D1D5DB] text-xs">{interimaire.site}</td>
                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      {/* Token */}
                      <td className="px-4 py-3">
                        <code className="text-[#CC0000] text-xs font-mono bg-[#CC0000]/10 px-2 py-0.5 rounded">
                          {tokens[interimaire.id]}
                        </code>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(interimaire)}
                            className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-[#CC0000]/20 transition-colors"
                            title="Voir QR"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => refreshToken(interimaire.id)}
                            className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:bg-green-500/20 transition-colors"
                            title="Renouveler"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => revokeToken(interimaire.id, `${interimaire.prenom} ${interimaire.nom}`)}
                            className="p-1.5 rounded-lg bg-[#2A2A2A] text-[#9CA3AF] hover:text-[#FF4444] hover:bg-[#CC0000]/20 transition-colors"
                            title="Révoquer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#6B7280]">
                <QrCode className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun QR code trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
                  QR Code
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#6B7280] hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: selected.id,
                    nom: `${selected.prenom} ${selected.nom}`,
                    site: selected.site,
                    token: tokens[selected.id],
                    expires: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
                  })}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#111111"
                  level="H"
                />
              </div>

              <p className="text-white font-semibold">{selected.prenom} {selected.nom}</p>
              <p className="text-[#9CA3AF] text-sm mt-1">{selected.site} · {selected.fonction}</p>
              <code className="block mt-2 text-[#CC0000] text-xs font-mono bg-[#CC0000]/10 px-3 py-1.5 rounded-lg">
                {tokens[selected.id]}
              </code>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { refreshToken(selected.id); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#CC0000] transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renouveler
                </button>
                <button
                  onClick={() => toast.success('Téléchargement PDF')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#CC0000,#7A0000)' }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
