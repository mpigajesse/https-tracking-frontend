'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockInterimaires, mockSessions, QRStatus } from '@/lib/data';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, QrCode, RefreshCw, Download, Clock,
  MapPin, Phone, Mail, Building2, Calendar, CheckCircle2, XCircle, RotateCcw,
  History, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const qrLabels: Record<QRStatus, string> = {
  actif: 'Actif',
  expire: 'Expiré',
  revoque: 'Révoqué',
};

export default function DetailInterimairePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const interimaire = mockInterimaires.find(i => i.id === id);

  const [qrStatus, setQrStatus] = useState<QRStatus>(interimaire?.qrStatus || 'actif');
  const [qrToken, setQrToken] = useState(interimaire?.qrToken || '');
  const [showQR, setShowQR] = useState(false);
  const [generating, setGenerating] = useState(false);

  const sessions = mockSessions.filter(s => s.interimaire === id);

  if (!interimaire) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Intérimaire introuvable</p>
        </div>
      </AppLayout>
    );
  }

  const generateQR = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    const token = `QR-${id.toUpperCase()}-${Date.now()}`;
    setQrToken(token);
    setQrStatus('actif');
    setShowQR(true);
    setGenerating(false);
    toast.success('QR Code généré avec succès');
  };

  const revokeQR = () => {
    setQrStatus('revoque');
    setShowQR(false);
    toast.success('QR Code révoqué');
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${interimaire.nom}-${interimaire.prenom}.svg`;
      a.click();
      toast.success('QR Code téléchargé');
    }
  };

  const qrValue = JSON.stringify({
    id: interimaire.id,
    nom: `${interimaire.prenom} ${interimaire.nom}`,
    site: interimaire.site,
    token: qrToken,
    expires: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="xl:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {interimaire.prenom[0]}{interimaire.nom[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{interimaire.prenom} {interimaire.nom}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{interimaire.fonction}</p>
                <div className="flex gap-2 mt-3">
                  <StatusBadge variant={interimaire.statut === 'en_mission' ? 'success' : interimaire.statut === 'actif' ? 'info' : 'neutral'}>
                    {interimaire.statut === 'en_mission' ? 'En mission' : interimaire.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </StatusBadge>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                {[
                  { icon: Shield, label: 'CIN', value: interimaire.cin },
                  { icon: Building2, label: 'Agence', value: interimaire.agence },
                  { icon: MapPin, label: 'Site', value: interimaire.site },
                  { icon: Mail, label: 'Email', value: interimaire.email },
                  { icon: Phone, label: 'Téléphone', value: interimaire.telephone },
                  { icon: Calendar, label: 'Début mission', value: interimaire.dateDebut },
                  { icon: Calendar, label: 'Fin mission', value: interimaire.dateFin },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total hours */}
              <div className="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <div className="text-3xl font-bold text-blue-600">{interimaire.totalHeures}h</div>
                <div className="text-xs text-blue-600/70 mt-1">Total heures travaillées</div>
              </div>
            </motion.div>
          </div>

          {/* QR + Sessions */}
          <div className="xl:col-span-2 space-y-6">
            {/* QR Code section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">QR Code</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Token sécurisé valide 2 minutes</p>
                </div>
                <StatusBadge variant={qrStatus === 'actif' ? 'success' : qrStatus === 'expire' ? 'warning' : 'danger'}>
                  {qrLabels[qrStatus]}
                </StatusBadge>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* QR display */}
                <div className="relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {showQR && qrToken ? (
                      <motion.div
                        key="qr"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="p-4 bg-white rounded-2xl shadow-lg border-2 border-blue-200"
                      >
                        <QRCodeSVG
                          id="qr-svg"
                          value={qrValue}
                          size={180}
                          bgColor="#FFFFFF"
                          fgColor="#0F172A"
                          level="H"
                          includeMargin={false}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-48 h-48 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#334155] flex items-center justify-center"
                      >
                        <div className="text-center">
                          <QrCode className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">{qrStatus === 'revoque' ? 'QR révoqué' : 'Générer un QR'}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <motion.button
                    onClick={generateQR}
                    disabled={generating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-70 transition-all"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                  >
                    {generating ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" />Génération...</>
                    ) : (
                      <><QrCode className="w-4 h-4" />Générer QR Code</>
                    )}
                  </motion.button>
                  {showQR && (
                    <>
                      <button onClick={downloadQR} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors">
                        <Download className="w-4 h-4" />
                        Télécharger PDF
                      </button>
                      <button onClick={revokeQR} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Révoquer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {qrToken && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-[#0F172A] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate">{qrToken}</span>
                </div>
              )}
            </motion.div>

            {/* Sessions history */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <History className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Historique QR</h3>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{sessions.length} session(s)</span>
              </div>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune session enregistrée</p>
                ) : sessions.map(s => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-[#0F172A]">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.statut === 'fermee' ? 'bg-green-500' : s.statut === 'en_litige' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{s.site}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(s.heureDebut).toLocaleDateString('fr-FR')} · {new Date(s.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {s.heureFin && ` → ${new Date(s.heureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                    {s.duree && <span className="text-sm font-semibold text-blue-600">{s.duree}h</span>}
                    <StatusBadge variant={s.statut === 'fermee' ? 'success' : s.statut === 'en_litige' ? 'danger' : 'warning'}>
                      {s.statut === 'fermee' ? 'Fermée' : s.statut === 'en_litige' ? 'Litige' : 'En cours'}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
