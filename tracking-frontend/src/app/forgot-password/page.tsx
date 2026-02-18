'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0F172A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-gray-900 dark:text-white font-bold text-xl">PointagePro</div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-200 dark:border-[#334155] p-8">
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  Saisissez votre email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email envoyé !</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte email.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
