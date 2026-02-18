import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'blue';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  blue: 'bg-blue-600 text-white',
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-green-500': variant === 'success',
        'bg-red-500': variant === 'danger',
        'bg-yellow-500': variant === 'warning',
        'bg-blue-500': variant === 'info' || variant === 'blue',
        'bg-gray-400': variant === 'neutral',
      })} />
      {children}
    </span>
  );
}
