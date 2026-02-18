'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockAlerts, Alert, AlertType } from '@/lib/data';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Scale, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

const alertTypeIcon: Record<AlertType, React.ElementType> = {
  non_cloturee: Clock,
  depassement_48h: AlertTriangle,
  en_litige: Scale,
};

const alertTypeColor: Record<AlertType, string> = {
  non_cloturee:    'text-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000]',
  depassement_48h: 'text-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000]',
  en_litige:       'text-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000]',
};

export default function AlertesPage() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | AlertType>('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const dismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success(t('alerts_treat'));
  };

  const dismissAll = () => {
    setAlerts([]);
    toast.success(t('alerts_treat_all'));
  };

  const alertTypeLabel: Record<AlertType, string> = {
    non_cloturee:    t('alert_non_cloturee'),
    depassement_48h: t('alert_depassement'),
    en_litige:       t('alert_litige'),
  };

  const summaryCards = [
    { type: 'non_cloturee'    as AlertType, label: t('alert_non_cloturee'), icon: Clock          },
    { type: 'depassement_48h' as AlertType, label: t('alert_depassement'),  icon: AlertTriangle  },
    { type: 'en_litige'       as AlertType, label: t('alert_litige'),       icon: Scale          },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('alerts_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{alerts.length} {t('alerts_count')}</p>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={dismissAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              {t('alerts_treat_all')}
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map(({ type, label, icon: Icon }) => {
            const count = alerts.filter(a => a.type === type).length;
            const isActive = filter === type;
            return (
              <motion.button
                key={type}
                onClick={() => setFilter(isActive ? 'all' : type)}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] shadow-[0_0_12px_rgba(204,0,0,0.2)]'
                    : 'border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] hover:border-[#CC0000]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[#FFF0F0] dark:bg-[#2A0000]">
                  <Icon className="w-5 h-5 text-[#CC0000]" />
                </div>
                <div className="text-2xl font-bold text-[#CC0000] tabular-nums">{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{label}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Alerts list */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-16 text-center">
            <CheckCheck className="w-12 h-12 text-[#CC0000] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('alerts_none_title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('alerts_none_sub')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert, i) => {
              const Icon = alertTypeIcon[alert.type];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-4 flex items-start gap-4 hover:border-[#CC0000]/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alertTypeColor[alert.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{alertTypeLabel[alert.type]}</span>
                      <StatusBadge variant={alert.severity === 'high' ? 'danger' : 'warning'}>
                        {alert.severity === 'high' ? t('alert_urgent') : t('alert_medium')}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{alert.interimaireNom}</span>
                      <span>•</span>
                      <span>{alert.site}</span>
                      <span>•</span>
                      <span>{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] text-xs font-medium hover:bg-[#FFE0E0] dark:hover:bg-[#3A0000] border border-[#CC0000]/20 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('alerts_treat')}
                    </button>
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
