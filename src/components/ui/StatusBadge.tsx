import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  danger:  'bg-[#FFF0F0] text-[#CC0000] dark:bg-[#2A0000] dark:text-[#FF6666]',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  info:    'bg-[#F5F5F5] text-[#1C1C1C] dark:bg-[#2A2A2A] dark:text-gray-300',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-[#2A2A2A] dark:text-gray-300',
  primary: 'text-white',
};

const dots: Record<BadgeVariant, string> = {
  success: 'bg-green-500',
  danger:  'bg-[#CC0000]',
  warning: 'bg-yellow-500',
  info:    'bg-[#6B7280]',
  neutral: 'bg-gray-400',
  primary: 'bg-white',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const isPrimary = variant === 'primary';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      style={isPrimary ? { background: 'linear-gradient(135deg, #CC0000, #7A0000)' } : undefined}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[variant])} />
      {children}
    </span>
  );
}
