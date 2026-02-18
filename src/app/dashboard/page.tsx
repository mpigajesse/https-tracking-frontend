'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import {
  Clock, DollarSign, Users, AlertTriangle,
  TrendingUp, Filter, Download, RefreshCw,
  Building2, Calendar, ChevronDown,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  chartDataHeures, chartDataSites, chartDataAgences, heatmapData, mockAlerts, mockSessions,
  SITES, AGENCES,
} from '@/lib/data';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';

const PIE_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED'];

const heatIntensity = (val: number) => {
  if (val === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (val < 20) return 'bg-blue-100 dark:bg-blue-900/30';
  if (val < 40) return 'bg-blue-200 dark:bg-blue-800/40';
  if (val < 60) return 'bg-blue-400 dark:bg-blue-700/60';
  if (val < 80) return 'bg-blue-600 dark:bg-blue-600/80';
  return 'bg-blue-800 dark:bg-blue-500';
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('7j');
  const [selectedSite, setSelectedSite] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard 360°</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vue analytique complète – Mis à jour à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Date range */}
            <div className="flex bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] overflow-hidden">
              {['7j', '30j', '3m', '1a'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#334155]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            {/* Site filter */}
            <div className="relative">
              <select
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Tous</option>
                {SITES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Heures totales (7j)"
            value="1 827"
            subtitle="heures travaillées"
            icon={Clock}
            trend={{ value: 12.4, label: 'vs sem. passée' }}
            color="blue"
            index={0}
          />
          <StatCard
            title="Coût intérim estimé"
            value="27 405 MAD"
            subtitle="cette semaine"
            icon={DollarSign}
            trend={{ value: -3.2, label: 'vs sem. passée' }}
            color="green"
            index={1}
          />
          <StatCard
            title="Intérimaires présents"
            value="169"
            subtitle="sur 5 sites"
            icon={Users}
            trend={{ value: 5.8, label: 'vs hier' }}
            color="purple"
            index={2}
          />
          <StatCard
            title="Alertes actives"
            value="4"
            subtitle="sessions à valider"
            icon={AlertTriangle}
            trend={{ value: -1, label: 'vs hier' }}
            color="red"
            index={3}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Line chart */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Évolution des heures</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Heures & coûts sur 7 jours</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartDataHeures}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Legend />
                <Line type="monotone" dataKey="heures" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} name="Heures" />
                <Line type="monotone" dataKey="cout" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 4 }} name="Coût (MAD)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Répartition Agences</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">% intérimaires par agence</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartDataAgences} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {chartDataAgences.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {chartDataAgences.map((ag, i) => (
                <div key={ag.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-gray-600 dark:text-gray-400">{ag.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{ag.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Comparatif sites</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Heures & effectifs par site</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataSites} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                <XAxis dataKey="site" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                <Legend />
                <Bar dataKey="heures" fill="#2563EB" radius={[4, 4, 0, 0]} name="Heures" />
                <Bar dataKey="interimaires" fill="#16A34A" radius={[4, 4, 0, 0]} name="Intérimaires" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Heatmap charge horaire</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Nombre de pointages par heure/jour</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-gray-400 font-normal text-left pr-2 w-12">Heure</th>
                    {DAYS.map(d => (
                      <th key={d} className="text-gray-400 font-normal text-center px-1">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map(row => (
                    <tr key={row.hour}>
                      <td className="text-gray-500 dark:text-gray-400 pr-2 py-0.5">{row.hour}</td>
                      {([row.lun, row.mar, row.mer, row.jeu, row.ven, row.sam, row.dim] as number[]).map((val, j) => (
                        <td key={j} className="px-0.5 py-0.5">
                          <div
                            className={`w-full h-6 rounded ${heatIntensity(val)} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
                            title={`${row.hour} ${DAYS[j]}: ${val}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Faible</span>
              {['bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'].map(c => (
                <span key={c} className={`w-4 h-3 rounded ${c}`} />
              ))}
              <span>Élevé</span>
            </div>
          </div>
        </div>

        {/* Recent alerts + sessions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent alerts */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Alertes récentes</h3>
              <a href="/alertes" className="text-xs text-blue-600 hover:underline">Voir tout</a>
            </div>
            <div className="space-y-3">
              {mockAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#0F172A]">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.interimaireNom} – {alert.site}</p>
                  </div>
                  <StatusBadge variant={alert.severity === 'high' ? 'danger' : 'warning'}>
                    {alert.severity === 'high' ? 'Urgent' : 'Moyen'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sessions récentes</h3>
              <a href="/validation" className="text-xs text-blue-600 hover:underline">Voir tout</a>
            </div>
            <div className="space-y-3">
              {mockSessions.slice(0, 4).map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#0F172A]">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {session.interimaireNom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.interimaireNom}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.site} · {new Date(session.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <StatusBadge variant={
                    session.statut === 'fermee' ? 'success' :
                    session.statut === 'en_litige' ? 'danger' :
                    session.statut === 'en_attente_fermeture' ? 'warning' : 'info'
                  }>
                    {session.statut === 'fermee' ? 'Fermée' :
                     session.statut === 'en_litige' ? 'Litige' :
                     session.statut === 'en_attente_fermeture' ? 'Att. fermeture' : 'Att. ouverture'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
