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
  Globe,
  Settings,
  User,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { mockAlerts } from '@/lib/data';
import { cn } from '@/lib/utils';

const PAGES_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/utilisateurs': 'Gestion Utilisateurs',
  '/alertes': 'Alertes & Notifications',
  '/interimaires': 'Gestion Intérimaires',
  '/validation': 'Validation Sessions',
  '/scan': 'Scan QR',
  '/presents': 'Liste Présents',
  '/mon-dashboard': 'Mon Dashboard',
  '/mes-sessions': 'Mes Sessions',
  '/mon-qr': 'Mon QR Code',
  '/parametres': 'Paramètres',
  '/qr-codes': 'QR Codes',
};

export default function Topbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lang, setLang] = useState('FR');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const unreadAlerts = mockAlerts.length;

  return (
    <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155] flex items-center justify-between px-6 flex-shrink-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 w-64 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'FR' ? 'AR' : 'FR')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
        >
          <Globe className="w-4 h-4" />
          {lang}
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadAlerts}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#334155]">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">Tout marquer lu</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors border-b border-gray-50 dark:border-[#334155]/50 cursor-pointer">
                      <span className={cn(
                        'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                        alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      )} />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alert.interimaireNom} – {alert.site}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center">
                  <a href="/alertes" className="text-xs text-blue-600 hover:underline">Voir toutes les alertes</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.prenom[0]}{user?.nom[0]}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.prenom} {user?.nom}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.site}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-gray-200 dark:border-[#334155] z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#334155]">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <a href="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors">
                    <User className="w-4 h-4" />
                    Mon profil
                  </a>
                  <a href="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors">
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </a>
                </div>
                <div className="border-t border-gray-100 dark:border-[#334155] py-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
