'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, Lock, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'profile',       label: 'Profil',         icon: User },
  { key: 'security',      label: 'Sécurité',        icon: Lock },
  { key: 'notifications', label: 'Notifications',   icon: Bell },
  { key: 'appearance',    label: 'Apparence',        icon: Palette },
];

export default function ParametresPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true, alerts: true });
  const [darkAuto, setDarkAuto] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('light');
  const [lang, setLang] = useState('fr');

  const handleSave = () => toast.success('Paramètres enregistrés');

  /* ── shared input class ── */
  const inputCls =
    'w-full px-3 py-2 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#111111] text-[#111111] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] disabled:opacity-60 disabled:cursor-not-allowed transition-colors';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl font-bold text-[#111111] dark:text-white"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Paramètres
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Gérez votre compte et préférences</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ── Tabs sidebar ── */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.key
                      ? 'bg-[#CC0000] text-white shadow-md shadow-[#CC0000]/25'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content panel ── */}
          <div className="xl:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] p-6"
            >

              {/* ── Profile ── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3
                    className="font-semibold text-[#111111] dark:text-white text-lg"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    Informations personnelles
                  </h3>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#CC0000]/20">
                      {user?.prenom[0]}{user?.nom[0]}
                    </div>
                    <div>
                      <button className="px-4 py-2 rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2A] text-sm text-[#374151] dark:text-[#D1D5DB] hover:border-[#CC0000] hover:text-[#CC0000] transition-colors">
                        Changer la photo
                      </button>
                      <p className="text-xs text-[#9CA3AF] mt-1">JPG, PNG. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Prénom', value: user?.prenom || '' },
                      { label: 'Nom', value: user?.nom || '' },
                      { label: 'Email', value: user?.email || '', cols: 2 },
                      { label: 'Site', value: user?.site || '' },
                      { label: 'Rôle', value: user?.role || '', disabled: true },
                    ].map(f => (
                      <div key={f.label} className={f.cols === 2 ? 'col-span-2' : ''}>
                        <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">{f.label}</label>
                        <input defaultValue={f.value} disabled={f.disabled} className={inputCls} />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-medium transition-colors shadow-md shadow-[#CC0000]/25"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              )}

              {/* ── Security ── */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-[#111111] dark:text-white text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
                    Sécurité du compte
                  </h3>
                  <div className="space-y-4">
                    {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le mot de passe'].map(label => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={inputCls + ' pr-10'}
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#CC0000] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-medium transition-colors shadow-md shadow-[#CC0000]/25"
                    >
                      <Shield className="w-4 h-4" />
                      Mettre à jour
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-[#111111] dark:text-white text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
                    Préférences notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'email',  label: 'Notifications email',   desc: 'Recevoir les alertes par email' },
                      { key: 'push',   label: 'Notifications push',    desc: 'Notifications en temps réel' },
                      { key: 'weekly', label: 'Rapport hebdomadaire',  desc: 'Résumé des heures chaque lundi' },
                      { key: 'alerts', label: 'Alertes critiques',     desc: 'Sessions non clôturées et litiges' },
                    ].map(n => (
                      <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-[#F5F5F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <div>
                          <div className="text-sm font-medium text-[#111111] dark:text-white">{n.label}</div>
                          <div className="text-xs text-[#6B7280] mt-0.5">{n.desc}</div>
                        </div>
                        <button
                          onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            notifs[n.key as keyof typeof notifs]
                              ? 'bg-[#CC0000] shadow-sm shadow-[#CC0000]/30'
                              : 'bg-[#D1D5DB] dark:bg-[#374151]'
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                            notifs[n.key as keyof typeof notifs] ? 'translate-x-5' : ''
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Appearance ── */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-[#111111] dark:text-white text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
                    Apparence & Langue
                  </h3>
                  <div className="space-y-5">
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">Thème</label>
                      <div className="flex gap-3">
                        {(['light', 'dark', 'auto'] as const).map(mode => {
                          const labels = { light: 'Clair', dark: 'Sombre', auto: 'Auto' };
                          const active = themeMode === mode;
                          return (
                            <button
                              key={mode}
                              onClick={() => {
                                setThemeMode(mode);
                                if (mode === 'dark') document.documentElement.classList.add('dark');
                                else document.documentElement.classList.remove('dark');
                              }}
                              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                active
                                  ? 'border-[#CC0000] bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000]'
                                  : 'border-[#E5E5E5] dark:border-[#2A2A2A] text-[#6B7280] hover:border-[#CC0000]/50 hover:text-[#CC0000]'
                              }`}
                            >
                              {labels[mode]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">Langue</label>
                      <select
                        value={lang}
                        onChange={e => setLang(e.target.value)}
                        className={inputCls}
                      >
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-medium transition-colors shadow-md shadow-[#CC0000]/25"
                    >
                      <Save className="w-4 h-4" />
                      Appliquer
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
