'use client';

import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockAlerts, Alert, AlertType } from '@/lib/data';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Scale, Filter, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const alertTypeLabel: Record<AlertType, string> = {
  non_cloturee: 'Session non clôturée',
  depassement_48h: 'Dépassement 48h',
  en_litige: 'Session en litige',
};

const alertTypeIcon: Record<AlertType, React.ElementType> = {
  non_cloturee: Clock,
  depassement_48h: AlertTriangle,
  en_litige: Scale,
};

const alertTypeColor: Record<AlertType, string> = {
  non_cloturee: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  depassement_48h: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  en_litige: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | AlertType>('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const dismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alerte traitée');
  };

  const dismissAll = () => {
    setAlerts([]);
    toast.success('Toutes les alertes traitées');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertes & Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{alerts.length} alerte(s) active(s)</p>
          </div>
          {alerts.length > 0 && (
            <button onClick={dismissAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
              <CheckCheck className="w-4 h-4" />
              Tout traiter
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { type: 'non_cloturee' as AlertType, label: 'Non clôturées', icon: Clock, color: 'blue' },
            { type: 'depassement_48h' as AlertType, label: 'Dépassement 48h', icon: AlertTriangle, color: 'yellow' },
            { type: 'en_litige' as AlertType, label: 'En litige', icon: Scale, color: 'red' },
          ].map(({ type, label, icon: Icon, color }) => {
            const count = alerts.filter(a => a.type === type).length;
            return (
              <motion.button
                key={type}
                onClick={() => setFilter(filter === type ? 'all' : type)}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-xl border text-left transition-all ${
                  filter === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}-50 dark:bg-${color}-900/20`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div className={`text-2xl font-bold text-${count > 0 ? color + '-600' : 'gray'}-600 dark:text-${color}-400`}>{count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{label}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Alerts list */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-16 text-center">
            <CheckCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aucune alerte</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toutes les alertes ont été traitées.</p>
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
                  className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-4 flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alertTypeColor[alert.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{alertTypeLabel[alert.type]}</span>
                      <StatusBadge variant={alert.severity === 'high' ? 'danger' : 'warning'}>
                        {alert.severity === 'high' ? 'Urgent' : 'Moyen'}
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Traiter
                    </button>
                    <button onClick={() => dismiss(alert.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
