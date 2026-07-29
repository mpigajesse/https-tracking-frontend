'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockInterimaires, mockSocietes, Interimaire, SITES as DEFAULT_SITES, AGENCES, FONCTIONS, QRStatus, TYPES_ACTIVITE, TypeActivite } from '@/lib/data';
import {
  Plus, Search, Download, Upload, Edit2, Power, QrCode,
  UserCheck, Users, Building2, MapPin, Trash2, Settings2,
  TrendingUp, ChevronRight, Activity, Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

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
  { gradient: 'from-[#CC0000] to-[#7A0000]', light: 'bg-[#FFF0F0] dark:bg-[#2A0000]', text: 'text-[#CC0000]', border: 'border-[#CC0000]/30', bar: 'bg-[#CC0000]' },
  { gradient: 'from-[#AA0000] to-[#5A0000]', light: 'bg-[#FFF5F5] dark:bg-[#1C0000]', text: 'text-[#AA0000] dark:text-[#FF4444]', border: 'border-[#AA0000]/30', bar: 'bg-[#AA0000]' },
  { gradient: 'from-[#CC0000] to-[#AA0000]', light: 'bg-[#FFF0F0] dark:bg-[#2A0000]', text: 'text-[#CC0000]', border: 'border-[#CC0000]/30', bar: 'bg-[#CC0000]' },
  { gradient: 'from-[#880000] to-[#440000]', light: 'bg-[#FFF0F0] dark:bg-[#1A0000]', text: 'text-[#880000] dark:text-[#FF6666]', border: 'border-[#880000]/30', bar: 'bg-[#880000]' },
  { gradient: 'from-[#CC0000] to-[#660000]', light: 'bg-[#FFF0F0] dark:bg-[#220000]', text: 'text-[#CC0000]', border: 'border-[#CC0000]/30', bar: 'bg-[#CC0000]' },
];

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
}

function PulseDot({ color = 'bg-[#CC0000]' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="w-full h-1.5 bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

export default function InterimairesPage() {
  const { t } = useI18n();
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
  const [liveOffset, setLiveOffset] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newOffset: Record<string, number> = {};
      sites.forEach(s => { newOffset[s.id] = Math.floor(Math.random() * 3) - 1; });
      setLiveOffset(newOffset);
    }, 4000);
    return () => clearInterval(interval);
  }, [sites]);

  const router = useRouter();
  const allSiteNames = sites.map(s => s.nom);

  const [form, setForm] = useState({
    nom: '', prenom: '', cin: '', email: '', telephone: '',
    agence: AGENCES[0], fonction: FONCTIONS[0],
    typeActivite: 'production' as TypeActivite,
    site: allSiteNames[0] || DEFAULT_SITES[0],
    dateDebut: '', dateFin: '', statut: 'en_mission' as 'actif' | 'inactif' | 'en_mission',
  });

  const [siteForm, setSiteForm] = useState({
    nom: '', ville: '', adresse: '', responsable: '', capacite: 50, statut: 'actif' as 'actif' | 'inactif',
  });

  const statutLabel: Record<string, string> = {
    en_mission: t('inter_statut_mission'),
    actif:      t('inter_statut_actif'),
    inactif:    t('inter_statut_inactif'),
  };

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

  const enMissionBySite = (siteNom: string) => data.filter(i => i.site === siteNom && i.statut === 'en_mission').length;

  const handleAdd = () => {
    setEditItem(null);
    setForm({ nom: '', prenom: '', cin: '', email: '', telephone: '', agence: AGENCES[0], fonction: FONCTIONS[0], typeActivite: 'production', site: allSiteNames[0] || DEFAULT_SITES[0], dateDebut: '', dateFin: '', statut: 'en_mission' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
      toast.success(t('inter_toast_edited'));
    } else {
      // Créé par l'admin, qui est aussi le valideur : le dossier naît validé,
      // contrairement à un profil saisi par une société d'intérim.
      const societe = mockSocietes.find(s => s.nom === form.agence);
      const newItem: Interimaire = {
        id: `i${Date.now()}`,
        ...form,
        societeId: societe?.id ?? mockSocietes[0].id,
        qrStatus: 'actif',
        totalHeures: 0,
        statutProfil: 'valide',
        documents: ['cin', 'assurance', 'contrat', 'medical'],
        soumisLe: new Date().toISOString().slice(0, 10),
        statueLe: new Date().toISOString().slice(0, 10),
        statuePar: 'Administrateur',
      };
      setData(prev => [...prev, newItem]);
      toast.success(t('inter_toast_added'));
    }
    setShowModal(false);
  };

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
      toast.success(t('inter_toast_site_edited'));
    } else {
      const newSite: Site = { id: `site${Date.now()}`, ...siteForm };
      setSites(prev => [...prev, newSite]);
      toast.success(t('inter_toast_site_added'));
    }
    setShowSiteModal(false);
  };

  const handleDeleteSite = (siteId: string) => {
    const s = sites.find(x => x.id === siteId);
    if (!s) return;
    const count = data.filter(i => i.site === s.nom).length;
    if (count > 0) { toast.error(`${t('inter_error_assigned')} ${count} ${t('inter_error_assigned2')}`); return; }
    setSites(prev => prev.filter(x => x.id !== siteId));
    toast.success(t('inter_toast_site_deleted'));
  };

  const columns = [
    {
      key: 'nom', label: t('inter_col_inter'),
      render: (i: Interimaire) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {i.prenom[0]}{i.nom[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{i.prenom} {i.nom}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{i.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'cin',     label: t('inter_col_cin'),     render: (i: Interimaire) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.cin}</span> },
    { key: 'agence',  label: t('inter_col_agence'),  render: (i: Interimaire) => <span className="text-gray-700 dark:text-gray-300">{i.agence}</span> },
    { key: 'fonction',label: t('inter_col_fonction'), render: (i: Interimaire) => <span className="text-gray-700 dark:text-gray-300">{i.fonction}</span> },
    {
      key: 'site', label: t('inter_col_site'),
      render: (i: Interimaire) => (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] font-medium border border-[#CC0000]/20">
          <MapPin className="w-3 h-3" />{i.site.replace('Site ', '')}
        </span>
      ),
    },
    { key: 'statut',   label: t('inter_col_statut'), render: (i: Interimaire) => <StatusBadge variant={statutBadge[i.statut]}>{statutLabel[i.statut]}</StatusBadge> },
    { key: 'qrStatus', label: t('inter_col_qr'),     render: (i: Interimaire) => <StatusBadge variant={qrBadge[i.qrStatus]}>{i.qrStatus.charAt(0).toUpperCase() + i.qrStatus.slice(1)}</StatusBadge> },
    {
      key: 'actions', label: t('inter_col_actions'),
      render: (i: Interimaire) => (
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); router.push(`/interimaires/${i.id}`); }} className="p-1.5 rounded-lg text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors" title="QR">
            <QrCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setEditItem(i); setForm({ nom: i.nom, prenom: i.prenom, cin: i.cin, email: i.email, telephone: i.telephone, agence: i.agence, fonction: i.fonction, typeActivite: i.typeActivite, site: i.site, dateDebut: i.dateDebut, dateFin: i.dateFin, statut: i.statut }); setShowModal(true); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
          ><Edit2 className="w-3.5 h-3.5" /></button>
          <button
            onClick={e => { e.stopPropagation(); setData(p => p.map(x => x.id === i.id ? { ...x, statut: x.statut === 'inactif' ? 'actif' : 'inactif' } : x)); toast.success(t('inter_toast_status')); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"
          ><Power className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  const kpis = [
    { label: t('inter_kpi_mission'), count: data.filter(i => i.statut === 'en_mission').length, icon: UserCheck },
    { label: t('inter_kpi_qr'),      count: data.filter(i => i.qrStatus === 'actif').length,    icon: QrCode    },
    { label: t('inter_kpi_sites'),   count: sites.filter(s => s.statut === 'actif').length,     icon: Building2 },
    { label: t('inter_kpi_total'),   count: data.filter(i => i.statut !== 'inactif').length,    icon: Users     },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inter_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.length} {t('inter_tab_list').toLowerCase()} · {sites.filter(s => s.statut === 'actif').length} {t('inter_kpi_sites').toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'liste' ? (
              <>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 text-sm hover:border-[#CC0000]/40 hover:text-[#CC0000] transition-colors">
                  <Upload className="w-4 h-4" />{t('inter_import')}
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 text-sm hover:border-[#CC0000]/40 hover:text-[#CC0000] transition-colors">
                  <Download className="w-4 h-4" />{t('inter_export')}
                </button>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all shadow-sm hover:shadow-[0_0_12px_rgba(204,0,0,0.4)]">
                  <Plus className="w-4 h-4" />{t('inter_add')}
                </button>
              </>
            ) : (
              <button onClick={handleAddSite} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all shadow-sm hover:shadow-[0_0_12px_rgba(204,0,0,0.4)]">
                <Plus className="w-4 h-4" />{t('inter_add_site')}
              </button>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-4 hover:border-[#CC0000]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F0] dark:bg-[#2A0000] flex items-center justify-center">
                  <s.icon className="text-[#CC0000]" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#CC0000] tabular-nums"><AnimatedNumber value={s.count} /></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#1C1C1C] rounded-xl w-fit border border-gray-200 dark:border-[#2A2A2A]">
          {(['liste', 'sites'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'bg-[#CC0000] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#CC0000] dark:hover:text-[#FF4444]'
              }`}
            >
              {tab === 'liste' ? (
                <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{t('inter_tab_list')}</span>
              ) : (
                <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" />{t('inter_tab_sites')}</span>
              )}
            </button>
          ))}
        </div>

        {/* List tab */}
        {activeTab === 'liste' && (
          <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A]">
            <div className="p-4 border-b border-gray-100 dark:border-[#2A2A2A] flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('inter_search')}
                  className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] w-full text-gray-900 dark:text-white placeholder-gray-400" />
              </div>
              <select value={filterSite} onChange={e => setFilterSite(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#111111] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CC0000]">
                <option>{t('all')}</option>
                {sites.map(s => <option key={s.id}>{s.nom}</option>)}
              </select>
              <select value={filterAgence} onChange={e => setFilterAgence(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#111111] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CC0000]">
                <option>{t('all')}</option>
                {AGENCES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <DataTable columns={columns} data={filtered} onRowClick={i => router.push(`/interimaires/${i.id}`)} />
            <div className="p-4 border-t border-gray-100 dark:border-[#2A2A2A] text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} {t('inter_results')}
            </div>
          </div>
        )}

        {/* Sites tab */}
        {activeTab === 'sites' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF0F0] dark:bg-[#2A0000] border border-[#CC0000]/30 rounded-xl">
              <PulseDot color="bg-[#CC0000]" />
              <span className="text-sm text-[#CC0000] font-medium">{t('inter_live')}</span>
              <Wifi className="w-3.5 h-3.5 text-[#CC0000] ml-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sites.map((site, idx) => {
                const colorSet = SITE_COLORS[idx % SITE_COLORS.length];
                const total = countBySite(site.nom);
                const enMission = enMissionBySite(site.nom);
                const pct = site.capacite > 0 ? Math.min(100, Math.round((total / site.capacite) * 100)) : 0;
                const isFocused = focusSite === site.id;
                return (
                  <div key={site.id} onClick={() => setFocusSite(isFocused ? null : site.id)}
                    className={`relative bg-white dark:bg-[#1C1C1C] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${isFocused ? 'border-[#CC0000] shadow-lg shadow-[#CC0000]/20 scale-[1.01]' : 'border-gray-200 dark:border-[#2A2A2A] hover:border-[#CC0000]/40 hover:shadow-md'}`}
                  >
                    <div className={`h-1.5 w-full bg-gradient-to-r ${colorSet.gradient}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorSet.gradient} flex items-center justify-center shadow-sm`}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{site.nom}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{site.ville}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {site.statut === 'actif'
                            ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] font-medium border border-[#CC0000]/20"><PulseDot color="bg-[#CC0000]" />{t('inter_site_active')}</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 font-medium">{t('inter_site_inactive')}</span>
                          }
                        </div>
                      </div>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-4xl font-bold tabular-nums text-[#CC0000]"><AnimatedNumber value={total} duration={600} /></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('inter_present')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums"><AnimatedNumber value={enMission} duration={600} /></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('inter_mission')}</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          <span>{t('inter_occupation')}</span>
                          <span className="font-semibold text-[#CC0000]">{pct}%</span>
                        </div>
                        <AnimatedBar pct={pct} color={colorSet.bar} />
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('inter_capacity')} : {site.capacite} {t('inter_postes')}</div>
                      </div>
                      <div className={`overflow-hidden transition-all duration-500 ${isFocused ? 'max-h-24 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-3 border-t border-gray-100 dark:border-[#2A2A2A] space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><MapPin className="w-3 h-3 text-[#CC0000]" />{site.adresse}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><UserCheck className="w-3 h-3 text-[#CC0000]" />{t('inter_site_resp')} : {site.responsable}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
                        <button onClick={e => { e.stopPropagation(); setFilterSite(site.nom); setActiveTab('liste'); }} className="flex items-center gap-1.5 text-xs font-medium text-[#CC0000] hover:underline">
                          <Activity className="w-3 h-3" />{t('inter_see_staff')}<ChevronRight className="w-3 h-3" />
                        </button>
                        <div className="flex gap-1">
                          <button onClick={e => { e.stopPropagation(); handleEditSite(site); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteSite(site.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary table */}
            <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#CC0000]" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('inter_summary')}</span>
                </div>
                <span className="text-xs text-gray-400">{sites.length} {t('inter_sites_count')}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#2A2A2A]">
                      {[t('inter_tbl_site'), t('inter_tbl_city'), t('inter_tbl_resp'), t('inter_tbl_present'), t('inter_tbl_mission'), t('inter_tbl_cap'), t('inter_tbl_occ'), t('inter_tbl_status'), ''].map(h => (
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
                        <tr key={site.id} className="border-b border-gray-50 dark:border-[#2A2A2A]/50 hover:bg-[#FFF0F0]/30 dark:hover:bg-[#2A0000]/20 transition-colors">
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${colorSet.bar}`} /><span className="font-medium text-gray-900 dark:text-white">{site.nom}</span></div></td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.ville}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.responsable}</td>
                          <td className="px-4 py-3"><span className="font-bold tabular-nums text-[#CC0000]"><AnimatedNumber value={total} duration={500} /></span></td>
                          <td className="px-4 py-3"><span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums"><AnimatedNumber value={enMission} duration={500} /></span></td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.capacite}</td>
                          <td className="px-4 py-3 w-32"><div className="flex items-center gap-2"><AnimatedBar pct={pct} color={colorSet.bar} /><span className="text-xs font-semibold tabular-nums text-[#CC0000] w-8 text-right">{pct}%</span></div></td>
                          <td className="px-4 py-3">
                            {site.statut === 'actif'
                              ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#FFF0F0] dark:bg-[#2A0000] text-[#CC0000] border border-[#CC0000]/20 font-medium">{t('inter_site_active')}</span>
                              : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2A2A2A] text-gray-500 font-medium">{t('inter_site_inactive')}</span>
                            }
                          </td>
                          <td className="px-4 py-3"><button onClick={() => handleEditSite(site)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Settings2 className="w-3.5 h-3.5" /></button></td>
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

      {/* Modal: Intérimaire */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? t('inter_modal_edit') : t('inter_modal_add')} size="xl"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">{t('inter_cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all">{t('inter_save')}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: t('inter_form_firstname'), key: 'prenom', type: 'text' },
            { label: t('inter_form_lastname'),  key: 'nom',    type: 'text' },
            { label: t('inter_form_cin'),       key: 'cin',    type: 'text' },
            { label: t('inter_form_tel'),       key: 'telephone', type: 'tel' },
            { label: t('inter_form_email'),     key: 'email',  type: 'email' },
          ].map(f => (
            <div key={f.key} className={f.key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
          {[
            { label: t('inter_form_agence'),   key: 'agence',   options: AGENCES },
            { label: t('inter_form_fonction'),  key: 'fonction', options: FONCTIONS },
            { label: t('inter_form_site'),      key: 'site',     options: sites.map(s => s.nom) },
          ].map(s => (
            <div key={s.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{s.label}</label>
              <select value={(form as Record<string, string>)[s.key]} onChange={e => setForm(p => ({ ...p, [s.key]: e.target.value }))} className={inputCls}>
                {s.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {/* Champ à part : la valeur stockée est une clé, l'affichage un libellé. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('activite_label')}</label>
            <select
              value={form.typeActivite}
              onChange={e => setForm(p => ({ ...p, typeActivite: e.target.value as TypeActivite }))}
              className={inputCls}
            >
              {Object.entries(TYPES_ACTIVITE).map(([cle, libelle]) => (
                <option key={cle} value={cle}>{libelle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('inter_form_start')}</label>
            <input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('inter_form_end')}</label>
            <input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} className={inputCls} />
          </div>
        </div>
      </Modal>

      {/* Modal: Site */}
      <Modal open={showSiteModal} onClose={() => setShowSiteModal(false)} title={editSite ? t('inter_modal_site_edit') : t('inter_modal_site_add')} size="lg"
        footer={
          <>
            <button onClick={() => setShowSiteModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">{t('inter_cancel')}</button>
            <button onClick={handleSaveSite} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all">{t('inter_save')}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: t('inter_site_name'), key: 'nom',         type: 'text', span: true  },
            { label: t('inter_site_city'), key: 'ville',       type: 'text', span: false },
            { label: t('inter_site_resp'), key: 'responsable', type: 'text', span: false },
            { label: t('inter_site_addr'), key: 'adresse',     type: 'text', span: true  },
          ].map(f => (
            <div key={f.key} className={f.span ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              <input type={f.type} value={(siteForm as Record<string, string | number>)[f.key] as string} onChange={e => setSiteForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('inter_site_cap')}</label>
            <input type="number" min={1} value={siteForm.capacite} onChange={e => setSiteForm(p => ({ ...p, capacite: parseInt(e.target.value) || 1 }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('inter_site_status')}</label>
            <select value={siteForm.statut} onChange={e => setSiteForm(p => ({ ...p, statut: e.target.value as 'actif' | 'inactif' }))} className={inputCls}>
              <option value="actif">{t('inter_site_active')}</option>
              <option value="inactif">{t('inter_site_inactive')}</option>
            </select>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
