'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockInterimaires, mockSessions, chartDataHeures } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import {
  Clock, QrCode, MapPin, TrendingUp, Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const weeklyData = [
  { day: 'Lun', heures: 8 },
  { day: 'Mar', heures: 7.5 },
  { day: 'Mer', heures: 8.5 },
  { day: 'Jeu', heures: 9 },
  { day: 'Ven', heures: 7 },
  { day: 'Sam', heures: 4 },
  { day: 'Dim', heures: 0 },
];

export default function MonDashboardPage() {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  // Find interimaire data for this user
  const interimaireData = mockInterimaires.find(i => i.statut === 'en_mission');
  const myQrValue = interimaireData ? JSON.stringify({
    id: interimaireData.id,
    nom: `${interimaireData.prenom} ${interimaireData.nom}`,
    site: interimaireData.site,
    token: interimaireData.qrToken,
  }) : 'DEMO-QR';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Bonjour,</p>
              <h1 className="text-2xl font-bold mt-1">{user?.prenom} {user?.nom}</h1>
              <p className="text-blue-200 text-sm mt-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{interimaireData?.totalHeures || 342}h</div>
              <div className="text-blue-200 text-sm">Ce mois-ci</div>
            </div>
          </div>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total heures" value={`${interimaireData?.totalHeures || 342}h`} subtitle="cette mission" icon={Clock} color="blue" index={0} />
          <StatCard title="Cette semaine" value="44h" subtitle="5 jours travaillés" icon={Calendar} color="green" trend={{ value: 10, label: 'vs semaine passée' }} index={1} />
          <StatCard title="Sites travaillés" value="2" subtitle="Casablanca, Rabat" icon={MapPin} color="purple" index={2} />
        </div>

        {/* QR Code + Weekly chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* My QR */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mon QR Code actif</h3>
            <div className="flex justify-center mb-4">
              {showQR ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-3 bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <QRCodeSVG value={myQrValue} size={160} />
                </motion.div>
              ) : (
                <div className="w-44 h-44 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#334155] flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowQR(!showQR)}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
            >
              {showQR ? 'Masquer QR' : 'Afficher mon QR'}
            </motion.button>
            <div className="mt-3">
              <StatusBadge variant="success">QR Actif</StatusBadge>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Heures cette semaine</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="heures" stroke="#2563EB" strokeWidth={2.5} fill="url(#blueGrad)" name="Heures" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sessions récentes</h3>
            <a href="/mes-sessions" className="text-xs text-blue-600 hover:underline">Voir tout</a>
          </div>
          <div className="space-y-3">
            {mockSessions.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-[#0F172A]">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.statut === 'fermee' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{s.site}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(s.heureDebut).toLocaleDateString('fr-FR')} · {new Date(s.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {s.duree && <span className="text-sm font-bold text-blue-600">{s.duree}h</span>}
                <StatusBadge variant={s.statut === 'fermee' ? 'success' : 'warning'}>
                  {s.statut === 'fermee' ? 'Terminée' : 'En cours'}
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
