'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Bell,
  UserCheck,
  QrCode,
  CheckSquare,
  Camera,
  ClipboardList,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/data';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Utilisateurs', href: '/utilisateurs', icon: Users, roles: ['admin'] },
  { label: 'Alertes', href: '/alertes', icon: Bell, roles: ['admin'], badge: 4 },
  { label: 'Intérimaires', href: '/interimaires', icon: UserCheck, roles: ['admin', 'technicien'] },
  { label: 'QR Codes', href: '/qr-codes', icon: QrCode, roles: ['technicien'] },
  { label: 'Validation', href: '/validation', icon: CheckSquare, roles: ['admin', 'technicien'] },
  { label: 'Scan QR', href: '/scan', icon: Camera, roles: ['receptionniste'] },
  { label: 'Présents', href: '/presents', icon: ClipboardList, roles: ['receptionniste'] },
  { label: 'Mon Dashboard', href: '/mon-dashboard', icon: LayoutDashboard, roles: ['interimaire'] },
  { label: 'Mes Sessions', href: '/mes-sessions', icon: History, roles: ['interimaire'] },
  { label: 'Mon QR Code', href: '/mon-qr', icon: QrCode, roles: ['interimaire'] },
  { label: 'Paramètres', href: '/parametres', icon: Settings, roles: ['admin', 'technicien', 'receptionniste', 'interimaire'] },
];

const roleColors: Record<UserRole, string> = {
  admin: 'bg-blue-500',
  technicien: 'bg-green-500',
  receptionniste: 'bg-purple-500',
  interimaire: 'bg-orange-500',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  technicien: 'Technicien',
  receptionniste: 'Réceptionniste',
  interimaire: 'Intérimaire',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const filteredNav = navItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[#0F172A] border-r border-[#1E293B] overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="text-white font-bold text-lg whitespace-nowrap">PointagePro</span>
                <div className="text-[#64748B] text-xs whitespace-nowrap">Gestion intérimaires</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer relative group',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E293B] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#334155]">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      {user && (
        <div className="border-t border-[#1E293B] p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-white text-sm font-medium truncate">{user.prenom} {user.nom}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('w-2 h-2 rounded-full', roleColors[user.role])} />
                    <span className="text-[#64748B] text-xs">{roleLabels[user.role]}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button onClick={handleLogout} className="p-1.5 text-[#64748B] hover:text-red-400 transition-colors" title="Déconnexion">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
