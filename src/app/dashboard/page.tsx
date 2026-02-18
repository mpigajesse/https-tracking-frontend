'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import {
  Clock, DollarSign, Users, AlertTriangle,
  TrendingUp, Download, RefreshCw, ChevronDown,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  chartDataHeures, chartDataSites, chartDataAgences, heatmapData, mockAlerts, mockSessions, SITES,
} from '@/lib/data';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useI18n } from '@/lib/i18n';

const LEAR_RED   = '#CC0000';
const CHART_GREEN  = '#16A34A';
const CHART_AMBER  = '#F59E0B';
const CHART_SLATE  = '#64748B';
const CHART_PURPLE = '#7C3AED';
const PIE_COLORS = [LEAR_RED, '#1C1C1C', CHART_GREEN, CHART_AMBER, CHART_PURPLE];

const heatIntensity = (val: number) => {
  if (val === 0) return 'bg-gray-100 dark:bg-[#1C1C1C]';
  if (val < 20)  return 'bg-[#FFF0F0] dark:bg-[#2A0000]';
  if (val < 40)  return 'bg-[#FFCCCC] dark:bg-[#550000]';
  if (val < 60)  return 'bg-[#FF8080] dark:bg-[#880000]';
  if (val < 80)  return 'bg-[#CC0000] dark:bg-[#AA0000]';
  return 'bg-[#7A0000] dark:bg-[#CC0000]';
};

const tooltipStyle = {
  contentStyle: { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#F5F5F5' },
  labelStyle: { color: '#9CA3AF' },
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [dateRange, setDateRange] = useState('7j');
  const [selectedSite, setSelectedSite] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const DAYS = t('dash_days').split(',');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const sessionStatusLabel = (statut: string) => {
    const map: Record<string, string> = {
      fermee: t('dash_status_closed'),
      en_litige: t('dash_status_dispute'),
      en_attente_fermeture: t('dash_status_wait_close'),
      en_attente_ouverture: t('dash_status_wait_open'),
    };
    return map[statut] ?? statut;
  };

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dash_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('dash_subtitle')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] overflow-hidden">
              {['7j', '30j', '3m', '1a'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className="px-3 py-2 text-sm font-medium transition-colors"
                  style={{ background: dateRange === range ? LEAR_RED : 'transparent', color: dateRange === range ? '#fff' : undefined }}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="relative">
              <select
                value={selectedSite}
                onChange={e => setSelectedSite(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="">{t('dash_filter_all')}</option>
                {SITES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-600 dark:text-gray-400 hover:text-[#CC0000] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
            >
              <Download className="w-4 h-4" />
              {t('dash_export')}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title={t('dash_kpi_hours')} value="1 827" subtitle={t('dash_kpi_hours_sub')} icon={Clock} trend={{ value: 12.4, label: t('dash_vs_last_week') }} color="red" index={0} />
          <StatCard title={t('dash_kpi_cost')} value="27 405 MAD" subtitle={t('dash_kpi_cost_sub')} icon={DollarSign} trend={{ value: -3.2, label: t('dash_vs_last_week') }} color="green" index={1} />
          <StatCard title={t('dash_kpi_present')} value="169" subtitle={t('dash_kpi_present_sub')} icon={Users} trend={{ value: 5.8, label: t('dash_vs_yesterday') }} color="dark" index={2} />
          <StatCard title={t('dash_kpi_alerts')} value="4" subtitle={t('dash_kpi_alerts_sub')} icon={AlertTriangle} trend={{ value: -1, label: t('dash_vs_yesterday') }} color="red" index={3} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_chart_hours_title')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dash_chart_hours_sub')}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#CC0000]" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartDataHeures}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="heures" stroke={LEAR_RED} strokeWidth={2.5} dot={{ fill: LEAR_RED, r: 4 }} name={t('dash_chart_hours_legend')} />
                <Line type="monotone" dataKey="cout" stroke={CHART_GREEN} strokeWidth={2.5} dot={{ fill: CHART_GREEN, r: 4 }} name={t('dash_chart_cost_legend')} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_chart_agencies_title')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dash_chart_agencies_sub')}</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartDataAgences} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {chartDataAgences.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
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
          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_chart_sites_title')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dash_chart_sites_sub')}</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartDataSites} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" strokeOpacity={0.5} />
                <XAxis dataKey="site" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="heures" fill={LEAR_RED} radius={[4, 4, 0, 0]} name={t('dash_chart_sites_h')} />
                <Bar dataKey="interimaires" fill={CHART_SLATE} radius={[4, 4, 0, 0]} name={t('dash_chart_sites_i')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_heatmap_title')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dash_heatmap_sub')}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-gray-400 font-normal text-left pr-2 w-12">{t('dash_heatmap_hour')}</th>
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
              <span>{t('dash_heatmap_low')}</span>
              {['bg-[#FFF0F0]', 'bg-[#FFCCCC]', 'bg-[#FF8080]', 'bg-[#CC0000]', 'bg-[#7A0000]'].map((c, i) => (
                <span key={i} className={`w-4 h-3 rounded ${c}`} />
              ))}
              <span>{t('dash_heatmap_high')}</span>
            </div>
          </div>
        </div>

        {/* Recent alerts + sessions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_recent_alerts')}</h3>
              <a href="/alertes" className="text-xs text-[#CC0000] hover:text-[#AA0000] transition-colors">{t('dash_see_all')}</a>
            </div>
            <div className="space-y-3">
              {mockAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#111111]">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'high' ? 'bg-[#CC0000]' : 'bg-[#F59E0B]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.interimaireNom} – {alert.site}</p>
                  </div>
                  <StatusBadge variant={alert.severity === 'high' ? 'danger' : 'warning'}>
                    {alert.severity === 'high' ? t('dash_urgent') : t('dash_medium')}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('dash_recent_sessions')}</h3>
              <a href="/validation" className="text-xs text-[#CC0000] hover:text-[#AA0000] transition-colors">{t('dash_see_all')}</a>
            </div>
            <div className="space-y-3">
              {mockSessions.slice(0, 4).map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F5] dark:bg-[#111111]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #7A0000)' }}
                  >
                    {session.interimaireNom.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.interimaireNom}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.site} · {new Date(session.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <StatusBadge variant={
                    session.statut === 'fermee' ? 'success' :
                    session.statut === 'en_litige' ? 'danger' :
                    session.statut === 'en_attente_fermeture' ? 'warning' : 'info'
                  }>
                    {sessionStatusLabel(session.statut)}
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
