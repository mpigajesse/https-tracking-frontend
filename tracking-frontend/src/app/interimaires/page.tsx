'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockInterimaires, Interimaire, SITES as DEFAULT_SITES, AGENCES, FONCTIONS, QRStatus } from '@/lib/data';
import {
  Plus, Search, Download, Upload, Edit2, Power, QrCode,
  UserCheck, Users, Building2, MapPin, Trash2, Settings2,
  TrendingUp, ChevronRight, Activity, Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';

const qrBadge: Record<QRStatus, 'success' | 'warning' | 'danger'> = {
  actif: 'success',
  expire: 'warning',
  revoque: 'danger',
};

const statutBadge: Record<string, 'success' | 'info' | 'neutral'> = {
  en_mission: 'success',
  actif: 'info',
  inactif: 'neutral',
};

const statutLabel: Record<string, string> = {
  en_mission: 'En mission',
  actif: 'Actif',
  inactif: 'Inactif',
};

interface Site {
  id: string;
  nom: string;
  ville: string;
  adresse: string;
  responsable: string;
  statut: 'actif' | 'inactif';
  capacite: number;
}

const SITE_COLORS = [
  { bg: 'from-blue-500 to-blue-700', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', border: 'border-blue-200 dark:border-blue-800', bar: 'bg-blue-500' },
  { bg: 'from-purple-500 to-purple-700', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800', bar: 'bg-purple-500' },
  { bg: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', bar: 'bg-emerald-500' },
  { bg: 'from-orange-500 to-orange-700', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800', bar: 'bg-orange-500' },
  { bg: 'from-rose-500 to-rose-700', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600', border: 'border-rose-200 dark:border-rose-800', bar: 'bg-rose-500' },
];

/* ── Animated number ──────────────────────────────── */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display}</>;
}

/* ── Pulse dot ────────────────────────────────────── */
function PulseDot({ color = 'bg-green-500' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

/* ── Bar fill animation ───────────────────────────── */
function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function InterimairesPage() {
  const [data, setData] = useState<Interimaire[]>(mockInterimaires);
  const [sites, setSites] = useState<Site[]>([
    { id: 's1', nom: 'Site Casablanca', ville: 'Casablanca', adresse: 'Zone Industrielle Ain Sebaa', responsable: 'Karim Benali', statut: 'actif', capacite: 60 },
    { id: 's2', nom: 'Site Rabat', ville: 'Rabat', adresse: 'Technopolis Sala Al Jadida', responsable: 'Fatima Alaoui', statut: 'actif', capacite: 50 },
    { id: 's3', nom: 'Site Tanger', ville: 'Tanger', adresse: 'Zone Franche Tanger Med', responsable: 'Hassan Chraibi', statut: 'actif', capacite: 40 },
    { id: 's4', nom: 'Site Fès', ville: 'Fès', adresse: 'Zone Industrielle Sidi Brahim', responsable: 'Sara Mansouri', statut: 'actif', capacite: 35 },
    { id: 's5', nom: 'Site Marrakech', ville: 'Marrakech', adresse: 'Zone Industrielle Sidi Ghanem', responsable: 'Youssef Ouali', statut: 'actif', capacite: 45 },
  ]);

  const [activeTab, setActiveTab] = useState<'liste' | 'sites'>('liste');
  const [search, setSearch] = useState('');
  const [filterSite, setFilterSite] = useState('Tous');
  const [filterAgence, setFilterAgence] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [editItem, setEditItem] = useState<Interimaire | null>(null);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [focusSite, setFocusSite] = useState<string | null>(null);

  // Simulate live count fluctuation
  const [liveOffset, setLiveOffset] = useState<Record<string, number>>({});
  useEffect(() => {
    const interval = setInterval(() => {
      const newOffset: Record<string, number> = {};
      sites.forEach(s => {
        newOffset[s.id] = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      });
      setLiveOffset(newOffset);
    }, 4000);
    return () => clearInterval(interval);
  }, [sites]);

  const router = useRouter();

  const allSiteNames = sites.map(s => s.nom);

  const [form, setForm] = useState({
    nom: '', prenom: '', cin: '', email: '', telephone: '',
    agence: AGENCES[0], fonction: FONCTIONS[0], site: allSiteNames[0] || DEFAULT_SITES[0],
    dateDebut: '', dateFin: '', statut: 'en_mission' as 'actif' | 'inactif' | 'en_mission',
  });

  const [siteForm, setSiteForm] = useState({
    nom: '', ville: '', adresse: '', responsable: '', capacite: 50, statut: 'actif' as 'actif' | 'inactif',
  });

  const filtered = data.filter(i => {
    const matchSearch = `${i.nom} ${i.prenom} ${i.cin} ${i.agence} ${i.fonction}`.toLowerCase().includes(search.toLowerCase());
    const matchSite = filterSite === 'Tous' || i.site === filterSite;
    const matchAgence = filterAgence === 'Tous' || i.agence === filterAgence;
    return matchSearch && matchSite && matchAgence;
  });

  const countBySite = (siteNom: string) => {
    const base = data.filter(i => i.site === siteNom && i.statut !== 'inactif').length;
    const sid = sites.find(s => s.nom === siteNom)?.id ?? '';
    return Math.max(0, base + (liveOffset[sid] ?? 0));
  };

  const enMissionBySite = (siteNom: string) =>
    data.filter(i => i.site === siteNom && i.statut === 'en_mission').length;

  /* ── Interimaire handlers ── */
  const handleAdd = () => {
    setEditItem(null);
    setForm({ nom: '', prenom: '', cin: '', email: '', telephone: '', agence: AGENCES[0], fonction: FONCTIONS[0], site: allSiteNames[0] || DEFAULT_SITES[0], dateDebut: '', dateFin: '', statut: 'en_mission' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
      toast.success('Fiche modifiée');
    } else {
      const newItem: Interimaire = { id: `i${Date.now()}`, ...form, qrStatus: 'actif', totalHeures: 0 };
      setData(prev => [...prev, newItem]);
      toast.success('Intérimaire ajouté');
    }
    setShowModal(false);
  };

  /* ── Site handlers ── */
  const handleAddSite = () => {
    setEditSite(null);
    setSiteForm({ nom: '', ville: '', adresse: '', responsable: '', capacite: 50, statut: 'actif' });
    setShowSiteModal(true);
  };

  const handleEditSite = (s: Site) => {
    setEditSite(s);
    setSiteForm({ nom: s.nom, ville: s.ville, adresse: s.adresse, responsable: s.responsable, capacite: s.capacite, statut: s.statut });
    setShowSiteModal(true);
  };

  const handleSaveSite = () => {
    if (editSite) {
      setSites(prev => prev.map(s => s.id === editSite.id ? { ...s, ...siteForm } : s));
      toast.success('Site modifié');
    } else {
      const newSite: Site = { id: `site${Date.now()}`, ...siteForm };
      setSites(prev => [...prev, newSite]);
      toast.success('Site ajouté');
    }
    setShowSiteModal(false);
  };

  const handleDeleteSite = (siteId: string) => {
    const s = sites.find(x => x.id === siteId);
    if (!s) return;
    const count = data.filter(i => i.site === s.nom).length;
    if (count > 0) { toast.error(`Impossible : ${count} intérimaire(s) affecté(s) à ce site`); return; }
    setSites(prev => prev.filter(x => x.id !== siteId));
    toast.success('Site supprimé');
  };

  const columns = [
    {
      key: 'nom',
      label: 'Intérimaire',
      render: (i: Interimaire) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {i.prenom[0]}{i.nom[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{i.prenom} {i.nom}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{i.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'cin', label: 'CIN', render: (i: Interimaire) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.cin}</span> },
    { key: 'agence', label: 'Agence', render: (i: Interimaire) => <span className="text-gray-700 dark:text-gray-300">{i.agence}</span> },
    { key: 'fonction', label: 'Fonction', render: (i: Interimaire) => <span className="text-gray-700 dark:text-gray-300">{i.fonction}</span> },
    {
      key: 'site', label: 'Site', render: (i: Interimaire) => (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#0F172A] text-gray-600 dark:text-gray-400 font-medium">
          <MapPin className="w-3 h-3" />{i.site.replace('Site ', '')}
        </span>
      )
    },
    { key: 'statut', label: 'Statut', render: (i: Interimaire) => <StatusBadge variant={statutBadge[i.statut]}>{statutLabel[i.statut]}</StatusBadge> },
    { key: 'qrStatus', label: 'QR Code', render: (i: Interimaire) => <StatusBadge variant={qrBadge[i.qrStatus]}>{i.qrStatus.charAt(0).toUpperCase() + i.qrStatus.slice(1)}</StatusBadge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (i: Interimaire) => (
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); router.push(`/interimaires/${i.id}`); }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Voir QR"><QrCode className="w-3.5 h-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); setEditItem(i); setForm({ nom: i.nom, prenom: i.prenom, cin: i.cin, email: i.email, telephone: i.telephone, agence: i.agence, fonction: i.fonction, site: i.site, dateDebut: i.dateDebut, dateFin: i.dateFin, statut: i.statut }); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); setData(p => p.map(x => x.id === i.id ? { ...x, statut: x.statut === 'inactif' ? 'actif' : 'inactif' } : x)); toast.success('Statut mis à jour'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"><Power className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Intérimaires</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.length} intérimaires · {sites.filter(s => s.statut === 'actif').length} sites actifs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'liste' ? (
              <>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />Import CSV
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />Export
                </button>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" />Ajouter
                </button>
              </>
            ) : (
              <button onClick={handleAddSite} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />Nouveau site
              </button>
            )}
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'En mission', count: data.filter(i => i.statut === 'en_mission').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: UserCheck },
            { label: 'QR actifs', count: data.filter(i => i.qrStatus === 'actif').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: QrCode },
            { label: 'Sites actifs', count: sites.filter(s => s.statut === 'actif').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Building2 },
            { label: 'Total effectif', count: data.filter(i => i.statut !== 'inactif').length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: Users },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>
                    <AnimatedNumber value={s.count} />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#0F172A] rounded-xl w-fit">
          {(['liste', 'sites'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'liste' ? (
                <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Intérimaires</span>
              ) : (
                <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" />Gestion Sites</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: LISTE INTÉRIMAIRES
        ══════════════════════════════════════════════ */}
        {activeTab === 'liste' && (
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155]">
            <div className="p-4 border-b border-gray-100 dark:border-[#334155] flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-white placeholder-gray-400" />
              </div>
              <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tous</option>
                {sites.map(s => <option key={s.id}>{s.nom}</option>)}
              </select>
              <select value={filterAgence} onChange={e => setFilterAgence(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tous</option>
                {AGENCES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={i => router.push(`/interimaires/${i.id}`)}
            />
            <div className="p-4 border-t border-gray-100 dark:border-[#334155] text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} résultat(s)
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: GESTION SITES
        ══════════════════════════════════════════════ */}
        {activeTab === 'sites' && (
          <div className="space-y-6">

            {/* Live banner */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <PulseDot color="bg-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">Données en temps réel — mise à jour automatique</span>
              <Wifi className="w-3.5 h-3.5 text-green-500 ml-auto" />
            </div>

            {/* Site cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sites.map((site, idx) => {
                const colorSet = SITE_COLORS[idx % SITE_COLORS.length];
                const total = countBySite(site.nom);
                const enMission = enMissionBySite(site.nom);
                const pct = site.capacite > 0 ? Math.min(100, Math.round((total / site.capacite) * 100)) : 0;
                const isFocused = focusSite === site.id;

                return (
                  <div
                    key={site.id}
                    onClick={() => setFocusSite(isFocused ? null : site.id)}
                    className={`relative bg-white dark:bg-[#1E293B] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
                      ${isFocused
                        ? `border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 scale-[1.01]`
                        : 'border-gray-200 dark:border-[#334155] hover:border-gray-300 dark:hover:border-[#475569] hover:shadow-md'
                      }`}
                  >
                    {/* Gradient top strip */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colorSet.bg}`} />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorSet.bg} flex items-center justify-center shadow-sm`}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{site.nom}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{site.ville}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {site.statut === 'actif'
                            ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium"><PulseDot color="bg-green-400" />Actif</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">Inactif</span>
                          }
                        </div>
                      </div>

                      {/* Big live counter */}
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className={`text-4xl font-bold tabular-nums ${colorSet.text} transition-all duration-500`}>
                            <AnimatedNumber value={total} duration={600} />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">intérimaires présents</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                            <AnimatedNumber value={enMission} duration={600} />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">en mission</div>
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          <span>Taux d&apos;occupation</span>
                          <span className={`font-semibold ${colorSet.text}`}>{pct}%</span>
                        </div>
                        <AnimatedBar pct={pct} color={colorSet.bar} />
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Capacité : {site.capacite} postes</div>
                      </div>

                      {/* Adresse + responsable (shown when focused) */}
                      <div className={`overflow-hidden transition-all duration-500 ${isFocused ? 'max-h-24 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-3 border-t border-gray-100 dark:border-[#334155] space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <MapPin className="w-3 h-3 text-gray-400" />{site.adresse}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <UserCheck className="w-3 h-3 text-gray-400" />Resp. : {site.responsable}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#334155]">
                        <button
                          onClick={e => { e.stopPropagation(); setFilterSite(site.nom); setActiveTab('liste'); }}
                          className={`flex items-center gap-1.5 text-xs font-medium ${colorSet.text} hover:underline`}
                        >
                          <Activity className="w-3 h-3" />
                          Voir effectif
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); handleEditSite(site); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteSite(site.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#334155] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Récapitulatif des sites</span>
                </div>
                <span className="text-xs text-gray-400">{sites.length} sites configurés</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#334155]">
                      {['Site', 'Ville', 'Responsable', 'Présents', 'En mission', 'Capacité', 'Occupation', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site, idx) => {
                      const colorSet = SITE_COLORS[idx % SITE_COLORS.length];
                      const total = countBySite(site.nom);
                      const enMission = enMissionBySite(site.nom);
                      const pct = site.capacite > 0 ? Math.min(100, Math.round((total / site.capacite) * 100)) : 0;
                      return (
                        <tr key={site.id} className="border-b border-gray-50 dark:border-[#334155]/50 hover:bg-gray-50 dark:hover:bg-[#0F172A]/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${colorSet.bar}`} />
                              <span className="font-medium text-gray-900 dark:text-white">{site.nom}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.ville}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.responsable}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold tabular-nums ${colorSet.text}`}>
                              <AnimatedNumber value={total} duration={500} />
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-green-600 tabular-nums">
                              <AnimatedNumber value={enMission} duration={500} />
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.capacite}</td>
                          <td className="px-4 py-3 w-32">
                            <div className="flex items-center gap-2">
                              <AnimatedBar pct={pct} color={colorSet.bar} />
                              <span className={`text-xs font-semibold tabular-nums ${colorSet.text} w-8 text-right`}>{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {site.statut === 'actif'
                              ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">Actif</span>
                              : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inactif</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleEditSite(site)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <Settings2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal : Intérimaire ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? "Modifier l'intérimaire" : 'Nouvel intérimaire'} size="xl"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Enregistrer</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Prénom', key: 'prenom', type: 'text' },
            { label: 'Nom', key: 'nom', type: 'text' },
            { label: 'CIN', key: 'cin', type: 'text' },
            { label: 'Téléphone', key: 'telephone', type: 'tel' },
            { label: 'Email', key: 'email', type: 'email' },
          ].map(f => (
            <div key={f.key} className={f.key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {[
            { label: 'Agence', key: 'agence', options: AGENCES },
            { label: 'Fonction', key: 'fonction', options: FONCTIONS },
            { label: 'Site', key: 'site', options: sites.map(s => s.nom) },
          ].map(s => (
            <div key={s.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{s.label}</label>
              <select value={(form as Record<string, string>)[s.key]} onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {s.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date début mission</label>
            <input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date fin mission</label>
            <input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Modal>

      {/* ── Modal : Site ── */}
      <Modal open={showSiteModal} onClose={() => setShowSiteModal(false)} title={editSite ? 'Modifier le site' : 'Nouveau site'} size="lg"
        footer={
          <>
            <button onClick={() => setShowSiteModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={handleSaveSite} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Enregistrer</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nom du site', key: 'nom', type: 'text', span: true },
            { label: 'Ville', key: 'ville', type: 'text', span: false },
            { label: 'Responsable', key: 'responsable', type: 'text', span: false },
            { label: 'Adresse', key: 'adresse', type: 'text', span: true },
          ].map(f => (
            <div key={f.key} className={f.span ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={(siteForm as Record<string, string | number>)[f.key] as string} onChange={e => setSiteForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Capacité (postes)</label>
            <input type="number" min={1} value={siteForm.capacite} onChange={e => setSiteForm(p => ({ ...p, capacite: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Statut</label>
            <select value={siteForm.statut} onChange={e => setSiteForm(p => ({ ...p, statut: e.target.value as 'actif' | 'inactif' }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
