import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'red' | 'green' | 'yellow' | 'dark' | 'purple';
  index?: number;
}

const colorConfig = {
  red: {
    bg: 'bg-[#FFF0F0] dark:bg-[#2A0000]',
    icon: 'bg-[#CC0000]',
    text: 'text-[#CC0000]',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'bg-green-600',
    text: 'text-green-600 dark:text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  dark: {
    bg: 'bg-[#F5F5F5] dark:bg-[#1C1C1C]',
    icon: 'bg-[#1C1C1C] dark:bg-[#2A2A2A]',
    text: 'text-[#1C1C1C] dark:text-gray-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'red', index = 0 }: StatCardProps) {
  const colors = colorConfig[color];
  const isPositive = trend && trend.value > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 font-grotesk tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isPositive ? 'text-green-600 dark:text-green-400' : 'text-[#CC0000]')}>
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
