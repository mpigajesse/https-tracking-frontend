'use client';

import AppLayout from '@/components/layout/AppLayout';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { mockInterimaires } from '@/lib/data';
import toast from 'react-hot-toast';

export default function MonQRPage() {
  const interimaire = mockInterimaires[0];
  const [token, setToken] = useState(interimaire.qrToken || 'QR-001-2025');

  const refresh = () => {
    setToken(`QR-${Date.now()}`);
    toast.success('QR Code renouvelé');
  };

  const qrValue = JSON.stringify({
    id: interimaire.id,
    nom: `${interimaire.prenom} ${interimaire.nom}`,
    site: interimaire.site,
    token,
    expires: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
  });

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon QR Code</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Présentez ce QR lors de l'entrée/sortie</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-[#334155] p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-gray-200"
          >
            <QRCodeSVG value={qrValue} size={220} bgColor="#FFFFFF" fgColor="#0F172A" level="H" includeMargin={false} />
          </motion.div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{interimaire.prenom} {interimaire.nom}</p>
          <p className="text-xs font-mono text-gray-400 mt-1">{token}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={refresh} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              Renouveler
            </button>
            <button onClick={() => toast.success('Téléchargement PDF')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
