'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Clock, Building2, Users, Shield } from 'lucide-react';
import { useAuth, getDashboardRoute } from '@/lib/auth-context';
import toast from 'react-hot-toast';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success('Connexion réussie !');
      // Get user from localStorage to determine role
      const stored = localStorage.getItem('pointage_user');
      if (stored) {
        const user = JSON.parse(stored);
        router.push(getDashboardRoute(user.role));
      }
    } else {
      setAttempts(a => a + 1);
      setError(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@pointage.ma', password: 'admin123', color: 'bg-blue-600' },
    { role: 'Technicien', email: 'tech@pointage.ma', password: 'tech123', color: 'bg-green-600' },
    { role: 'Réceptionniste', email: 'recep@pointage.ma', password: 'recep123', color: 'bg-purple-600' },
    { role: 'Intérimaire', email: 'interim@pointage.ma', password: 'interim123', color: 'bg-orange-600' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel - industrial illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
        {/* Geometric pattern */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 1 }}
              className="absolute border border-blue-500/20 rounded-full"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">PointagePro</div>
              <div className="text-blue-400 text-xs">Gestion Intérimaires</div>
            </div>
          </div>

          {/* Main illustration content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                Digitalisez votre<br />
                <span className="text-blue-400">gestion RH</span><br />
                intérimaires
              </h1>
              <p className="text-gray-400 text-lg mb-10">
                Pointage en temps réel, QR codes sécurisés, validation double circuit sur 5 sites industriels.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Sites actifs', value: '5', icon: Building2 },
                { label: 'Intérimaires', value: '169', icon: Users },
                { label: 'Sessions / j', value: '340+', icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <stat.icon className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-gray-600 text-xs">
            © 2026 PointagePro – Document Confidentiel
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-[#0F172A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-gray-900 font-bold text-xl">PointagePro</div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-200 dark:border-[#334155] p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Accédez à votre espace de gestion</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-5 text-sm text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                {attempts >= 3 && <span className="ml-auto text-xs">({attempts} tentatives)</span>}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir</span>
                </label>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Mot de passe oublié ?
                </a>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-center text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Comptes de démonstration</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left"
                >
                  <span className={`w-2 h-2 rounded-full ${acc.color}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
