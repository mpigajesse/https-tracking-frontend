import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  index?: number;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    trend: 'text-green-500',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    trend: 'text-yellow-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'bg-red-600',
    text: 'text-red-600 dark:text-red-400',
    trend: 'text-red-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-500',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue', index = 0 }: StatCardProps) {
  const colors = colorConfig[color];
  const isPositive = trend && trend.value > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
              <span>{isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%</span>
              <span className="text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.text)} />
        </div>
      </div>
    </motion.div>
  );
}
