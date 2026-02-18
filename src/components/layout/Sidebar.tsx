'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n, TranslationKey } from '@/lib/i18n';
import { UserRole } from '@/lib/data';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: TranslationKey;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
}

const navItems: NavItem[] = [
  { labelKey: 'nav_dashboard',     href: '/dashboard',     icon: LayoutDashboard, roles: ['admin'] },
  { labelKey: 'nav_users',         href: '/utilisateurs',  icon: Users,           roles: ['admin'] },
  { labelKey: 'nav_sites',         href: '/sites',         icon: Building2,       roles: ['admin'] },
  { labelKey: 'nav_alerts',        href: '/alertes',       icon: Bell,            roles: ['admin'], badge: 4 },
  { labelKey: 'nav_interimaires',  href: '/interimaires',  icon: UserCheck,       roles: ['admin', 'technicien'] },
  { labelKey: 'nav_qrcodes',       href: '/qr-codes',      icon: QrCode,          roles: ['technicien'] },
  { labelKey: 'nav_validation',    href: '/validation',    icon: CheckSquare,     roles: ['admin', 'technicien'] },
  { labelKey: 'nav_scan',          href: '/scan',          icon: Camera,          roles: ['receptionniste'] },
  { labelKey: 'nav_presents',      href: '/presents',      icon: ClipboardList,   roles: ['receptionniste'] },
  { labelKey: 'nav_my_dashboard',  href: '/mon-dashboard', icon: LayoutDashboard, roles: ['interimaire'] },
  { labelKey: 'nav_my_sessions',   href: '/mes-sessions',  icon: History,         roles: ['interimaire'] },
  { labelKey: 'nav_my_qr',         href: '/mon-qr',        icon: QrCode,          roles: ['interimaire'] },
  { labelKey: 'nav_settings',      href: '/parametres',    icon: Settings,        roles: ['admin', 'technicien', 'receptionniste', 'interimaire'] },
];

const roleColorMap: Record<UserRole, string> = {
  admin:          'bg-[#CC0000]',
  technicien:     'bg-green-500',
  receptionniste: 'bg-amber-500',
  interimaire:    'bg-blue-500',
};

const roleKeyMap: Record<UserRole, TranslationKey> = {
  admin:          'role_admin',
  technicien:     'role_technicien',
  receptionniste: 'role_receptionniste',
  interimaire:    'role_interimaire',
};

/* ── Sidebar animated background ────────────────────────────────── */
function SidebarBackground() {
  const mouseY = useMotionValue(0.5);
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      if (!sidebar) return;
      const rect = sidebar.getBoundingClientRect();
      if (e.clientX > rect.right) return;
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseY]);

  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: i % 3 === 0 ? 7 : i % 3 === 1 ? 5 : 3,
    red: i % 4 === 0,
    dur: 4 + Math.random() * 5,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]" />

      {/* Animated red blob top */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12], y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 -left-10 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, #CC0000 0%, transparent 70%)' }}
      />

      {/* Mouse-follow glow */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{
          top: useSpring(useMotionValue(40), { stiffness: 40, damping: 20 }),
          background: 'radial-gradient(circle, rgba(204,0,0,0.18) 0%, transparent 70%)',
          y: springY,
        }}
      />

      {/* Animated red blob bottom */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, #CC0000 0%, transparent 70%)' }}
      />

      {/* Optical flares */}
      {[
        { top: '15%', left: '60%', size: 40, delay: 0 },
        { top: '50%', left: '20%', size: 28, delay: 1.5 },
        { top: '80%', left: '70%', size: 34, delay: 3 },
      ].map((f, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{
            top: f.top, left: f.left,
            width: f.size, height: f.size,
            background: 'radial-gradient(circle, rgba(204,0,0,0.7) 0%, transparent 70%)',
          }}
        />
      ))}

      {/* Vertical lens streak */}
      <motion.div
        animate={{ opacity: [0, 0.12, 0], scaleY: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 w-px h-full"
        style={{ background: 'linear-gradient(to bottom, transparent, #CC0000, transparent)' }}
      />

      {/* Concentric rings */}
      {[60, 100, 140, 180].map((r, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.04, 0.1, 0.04], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CC0000]"
          style={{ width: r, height: r }}
        />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -18, 0],
            x: [0, Math.random() > 0.5 ? 6 : -6, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: p.red ? [1, 1.5, 1] : [1, 1.2, 1],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.red ? '#CC0000' : 'rgba(255,255,255,0.7)',
            boxShadow: p.red
              ? `0 0 ${p.size * 2}px rgba(204,0,0,0.6)`
              : `0 0 ${p.size}px rgba(255,255,255,0.3)`,
          }}
        />
      ))}

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)',
        }}
      />
    </div>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const filteredNav = navItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Shared inner content for both desktop and mobile
  const sidebarContent = (isMobile: boolean) => (
    <>
      <SidebarBackground />

      {/* ── Logo ── */}
      <div className="relative flex items-center h-16 px-4 border-b border-[#CC0000]/20 bg-[#0A0A0A]/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-md">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lear_Corporation_logo.svg/960px-Lear_Corporation_logo.svg.png"
              alt="Lear Corporation"
              width={32}
              height={32}
              className="object-contain"
              unoptimized
            />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1"
              >
                <span className="text-white font-bold text-base whitespace-nowrap tracking-wide" style={{ fontFamily: 'var(--font-syne)' }}>
                  Lear Corporation
                </span>
                <div className="text-[#CC0000] text-[10px] whitespace-nowrap uppercase tracking-widest font-semibold mt-0.5">
                  Pointage Intérimaires
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          {/* Close button on mobile */}
          {isMobile && (
            <div className="relative ml-2 flex-shrink-0 w-7 h-7">
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #CC0000, transparent 60%, #CC0000)',
                  padding: 2,
                }}
              />
              <motion.button
                onClick={onMobileClose}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                className="absolute inset-[2px] rounded-full bg-[#CC0000] text-white flex items-center justify-center cursor-pointer z-10"
                style={{ boxShadow: '0 0 10px rgba(204,0,0,0.7)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex-1 overflow-y-auto py-4 px-2 z-10">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} onClick={isMobile ? onMobileClose : undefined}>
              <motion.div
                whileHover={{ x: (!collapsed || isMobile) ? 4 : 0 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer relative group',
                  isActive
                    ? 'bg-[#CC0000] text-white shadow-lg shadow-[#CC0000]/30'
                    : 'text-[#9CA3AF] hover:bg-[#1C1C1C] hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {t(item.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge && (!collapsed || isMobile) && (
                  <span className="ml-auto bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && !isMobile && (
                  <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId={isMobile ? 'activeIndicatorMobile' : 'activeIndicator'}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full"
                  />
                )}

                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1C1C1C] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#2A2A2A]">
                    {t(item.labelKey)}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── User profile ── */}
      {user && (
        <div className="relative border-t border-[#CC0000]/20 p-3 bg-[#0A0A0A]/80 backdrop-blur-sm z-10">
          <div className={cn('flex items-center gap-3', collapsed && !isMobile && 'justify-center')}>
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{user.prenom} {user.nom}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('w-2 h-2 rounded-full', roleColorMap[user.role])} />
                    <span className="text-[#6B7280] text-xs">{t(roleKeyMap[user.role])}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {(!collapsed || isMobile) && (
              <button onClick={handleLogout} className="p-1.5 text-[#6B7280] hover:text-[#CC0000] transition-colors" title={t('logout')}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Collapse toggle (desktop only) ── */}
      {!isMobile && (
        <div className="absolute -right-4 top-20 z-[60]">
          <div className="relative w-7 h-7">
            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #CC0000, transparent 60%, #CC0000)',
                padding: 2,
              }}
            />
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-[2px] rounded-full bg-[#CC0000] text-white flex items-center justify-center cursor-pointer z-10"
              style={{ boxShadow: '0 0 10px rgba(204,0,0,0.7)' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden md:flex flex-col h-screen border-r border-[#CC0000]/20 flex-shrink-0"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-40 flex flex-col h-screen w-[260px] border-r border-[#CC0000]/20 overflow-hidden md:hidden"
          >
            {sidebarContent(true)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
