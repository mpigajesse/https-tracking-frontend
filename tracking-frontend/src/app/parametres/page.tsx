'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Globe, Palette, Lock, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'security', label: 'Sécurité', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Apparence', icon: Palette },
];

export default function ParametresPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true, alerts: true });
  const [darkAuto, setDarkAuto] = useState(true);
  const [lang, setLang] = useState('fr');

  const handleSave = () => toast.success('Paramètres enregistrés');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte et préférences</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Tabs sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#334155]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="xl:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6"
            >
              {/* Profile tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Informations personnelles</h3>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {user?.prenom[0]}{user?.nom[0]}
                    </div>
                    <div>
                      <button className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                        Changer la photo
                      </button>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG. Max 2MB</p>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                        <input
                          defaultValue={f.value}
                          disabled={f.disabled}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              )}

              {/* Security tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sécurité du compte</h3>
                  <div className="space-y-4">
                    {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le mot de passe'].map(label => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                      <Shield className="w-4 h-4" />
                      Mettre à jour
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Préférences notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Notifications email', desc: 'Recevoir les alertes par email' },
                      { key: 'push', label: 'Notifications push', desc: 'Notifications en temps réel' },
                      { key: 'weekly', label: 'Rapport hebdomadaire', desc: 'Résumé des heures chaque lundi' },
                      { key: 'alerts', label: 'Alertes critiques', desc: 'Sessions non clôturées et litiges' },
                    ].map(n => (
                      <div key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0F172A]">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.desc}</div>
                        </div>
                        <button
                          onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${notifs[n.key as keyof typeof notifs] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifs[n.key as keyof typeof notifs] ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Apparence & Langue</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thème</label>
                      <div className="flex gap-3">
                        {['Clair', 'Sombre', 'Auto'].map(t => (
                          <button
                            key={t}
                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                              (t === 'Clair' && !darkAuto) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setDarkAuto(t === 'Auto')}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langue</label>
                      <select value={lang} onChange={e => setLang(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
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
