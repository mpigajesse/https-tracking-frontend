'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockInterimaires, mockSessions } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Clock, QrCode, MapPin, TrendingUp, Calendar } from 'lucide-react';
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

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #CC0000 0%, #7A0000 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">Bonjour,</p>
              <h1 className="text-2xl font-bold mt-1 font-syne">{user?.prenom} {user?.nom}</h1>
              <p className="text-red-200 text-sm mt-1">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold font-grotesk tabular-nums">
                {interimaireData?.totalHeures || 342}h
              </div>
              <div className="text-red-200 text-sm">Ce mois-ci</div>
            </div>
          </div>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total heures"
            value={`${interimaireData?.totalHeures || 342}h`}
            subtitle="cette mission"
            icon={Clock}
            color="red"
            index={0}
          />
          <StatCard
            title="Cette semaine"
            value="44h"
            subtitle="5 jours travaillés"
            icon={Calendar}
            color="green"
            trend={{ value: 10, label: 'vs semaine passée' }}
            index={1}
          />
          <StatCard
            title="Sites travaillés"
            value="2"
            subtitle="Casablanca, Rabat"
            icon={MapPin}
            color="dark"
            index={2}
          />
        </div>

        {/* QR Code + Weekly chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* My QR */}
          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-syne">Mon QR Code actif</h3>
            <div className="flex justify-center mb-4">
              {showQR ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-3 bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <QRCodeSVG value={myQrValue} size={160} fgColor="#111111" />
                </motion.div>
              ) : (
                <div className="w-44 h-44 rounded-xl border-2 border-dashed border-[#E5E5E5] dark:border-[#2A2A2A] flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowQR(!showQR)}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              {showQR ? 'Masquer QR' : 'Afficher mon QR'}
            </motion.button>
            <div className="mt-3">
              <StatusBadge variant="success">QR Actif</StatusBadge>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white font-syne">Heures cette semaine</h3>
              <TrendingUp className="w-5 h-5 text-[#CC0000]" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="learGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CC0000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CC0000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1C1C1C',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#F5F5F5',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="heures"
                  stroke="#CC0000"
                  strokeWidth={2.5}
                  fill="url(#learGrad)"
                  name="Heures"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white font-syne">Sessions récentes</h3>
            <a href="/mes-sessions" className="text-xs text-[#CC0000] hover:underline font-medium">
              Voir tout
            </a>
          </div>
          <div className="space-y-3">
            {mockSessions.slice(0, 3).map(s => (
              <div
                key={s.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#111111]"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.statut === 'fermee' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{s.site}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(s.heureDebut).toLocaleDateString('fr-FR')} · {new Date(s.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {s.duree && (
                  <span className="text-sm font-bold text-[#CC0000] font-grotesk tabular-nums">
                    {s.duree}h
                  </span>
                )}
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
