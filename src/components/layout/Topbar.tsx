'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Settings,
  User,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { mockAlerts } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');

  const unreadAlerts = mockAlerts.length;

  return (
    <header className="h-16 bg-white dark:bg-[#1C1C1C] border-b border-[#E5E5E5] dark:border-[#2A2A2A] flex items-center justify-between px-6 flex-shrink-0 z-30">

      {/* Search + hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A] hover:text-[#CC0000] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            className="pl-9 pr-4 py-2 text-sm bg-[#F5F5F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] text-[#111111] dark:text-white placeholder-[#9CA3AF] w-64 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Language toggle — Lear red pill */}
        <motion.button
          onClick={toggleLang}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-1 px-1 py-1 rounded-full border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#111111] overflow-hidden"
          title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'absolute top-1 h-6 w-8 rounded-full bg-[#CC0000] shadow-sm',
              lang === 'fr' ? 'left-1' : 'left-[calc(100%-36px)]'
            )}
          />
          <span className={cn('relative z-10 px-2 py-0.5 text-xs font-bold rounded-full transition-colors w-8 text-center', lang === 'fr' ? 'text-white' : 'text-[#6B7280]')}>FR</span>
          <span className={cn('relative z-10 px-2 py-0.5 text-xs font-bold rounded-full transition-colors w-8 text-center', lang === 'en' ? 'text-white' : 'text-[#6B7280]')}>EN</span>
        </motion.button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A] hover:text-[#CC0000] transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 rounded-lg text-[#6B7280] hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A] hover:text-[#CC0000] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#CC0000] text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {unreadAlerts}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1C1C1C] rounded-xl shadow-2xl border border-[#E5E5E5] dark:border-[#2A2A2A] z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                  <span className="font-semibold text-[#111111] dark:text-white text-sm">{t('notifications')}</span>
                  <span className="text-xs text-[#CC0000] cursor-pointer hover:underline">{t('mark_all_read')}</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-colors border-b border-[#F0F0F0] dark:border-[#2A2A2A]/50 cursor-pointer">
                      <span className={cn(
                        'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                        alert.severity === 'high' ? 'bg-[#CC0000]' : 'bg-amber-500'
                      )} />
                      <div>
                        <p className="text-sm text-[#111111] dark:text-white">{alert.message}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{alert.interimaireNom} – {alert.site}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center">
                  <a href="/alertes" className="text-xs text-[#CC0000] hover:underline">{t('see_all_alerts')}</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#2A2A2A] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user?.prenom[0]}{user?.nom[0]}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-[#111111] dark:text-white">{user?.prenom} {user?.nom}</div>
              <div className="text-xs text-[#6B7280]">{user?.site}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1C1C1C] rounded-xl shadow-2xl border border-[#E5E5E5] dark:border-[#2A2A2A] z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
                  <p className="text-sm font-semibold text-[#111111] dark:text-white">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-[#6B7280]">{user?.email}</p>
                </div>
                <div className="py-1">
                  <a href="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-[#374151] dark:text-[#D1D5DB] hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-colors">
                    <User className="w-4 h-4" />
                    {t('my_profile')}
                  </a>
                  <a href="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-[#374151] dark:text-[#D1D5DB] hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-colors">
                    <Settings className="w-4 h-4" />
                    {t('settings')}
                  </a>
                </div>
                <div className="border-t border-[#E5E5E5] dark:border-[#2A2A2A] py-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay */}
      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
