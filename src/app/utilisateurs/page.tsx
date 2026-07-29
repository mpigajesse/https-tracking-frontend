'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockUsers, User, UserRole, SITES } from '@/lib/data';
import { Plus, Search, Download, Edit2, Power, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useI18n } from '@/lib/i18n';

const roleBadge: Record<UserRole, 'danger' | 'success' | 'info' | 'warning'> = {
  admin: 'danger',
  societe: 'info',
  technicien: 'success',
  receptionniste: 'warning',
  interimaire: 'info',
};

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]';

export default function UtilisateursPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    role: 'technicien' as UserRole,
    site: SITES[0],
    statut: 'actif' as 'actif' | 'inactif',
  });

  const roleLabels: Record<UserRole, string> = {
    admin: t('users_role_admin'),
    societe: t('role_societe'),
    technicien: t('users_role_tech'),
    receptionniste: t('users_role_recep'),
    interimaire: t('users_role_interim'),
  };

  const filtered = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email} ${u.site}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditUser(null);
    setForm({ nom: '', prenom: '', email: '', role: 'technicien', site: SITES[0], statut: 'actif' });
    setShowModal(true);
  };

  const handleEdit = (u: User) => {
    setEditUser(u);
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, site: u.site, statut: u.statut });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
      toast.success(t('users_toast_edited'));
    } else {
      const newUser: User = { id: `u${Date.now()}`, ...form, createdAt: new Date().toISOString().split('T')[0] };
      setUsers(prev => [...prev, newUser]);
      toast.success(t('users_toast_created'));
    }
    setShowModal(false);
  };

  const handleToggle = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, statut: u.statut === 'actif' ? 'inactif' : 'actif' } : u));
    toast.success(t('users_toast_status'));
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success(t('users_toast_deleted'));
  };

  const exportCSV = () => {
    const csv = [
      [t('users_form_lastname'), t('users_form_firstname'), t('users_form_email'), t('users_form_role'), t('users_form_site'), t('users_col_status')],
      ...filtered.map(u => [u.nom, u.prenom, u.email, u.role, u.site, u.statut]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'utilisateurs.csv'; a.click();
    toast.success(t('users_toast_export'));
  };

  const kpis = [
    { label: t('users_kpi_admins'), count: users.filter(u => u.role === 'admin').length },
    { label: t('users_kpi_tech'),   count: users.filter(u => u.role === 'technicien').length },
    { label: t('users_kpi_recep'),  count: users.filter(u => u.role === 'receptionniste').length },
    { label: t('users_kpi_interim'),count: users.filter(u => u.role === 'interimaire').length },
  ];

  const columns = [
    {
      key: 'nom',
      label: t('users_col_user'),
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CC0000] to-[#7A0000] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {u.prenom[0]}{u.nom[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{u.prenom} {u.nom}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', label: t('users_col_role'), render: (u: User) => <StatusBadge variant={roleBadge[u.role]}>{roleLabels[u.role]}</StatusBadge> },
    { key: 'site', label: t('users_col_site'), render: (u: User) => <span className="text-gray-700 dark:text-gray-300">{u.site}</span> },
    {
      key: 'statut',
      label: t('users_col_status'),
      render: (u: User) => <StatusBadge variant={u.statut === 'actif' ? 'success' : 'neutral'}>{u.statut === 'actif' ? t('users_status_active') : t('users_status_inactive')}</StatusBadge>,
    },
    { key: 'createdAt', label: t('users_col_created'), render: (u: User) => <span className="text-gray-500 dark:text-gray-400 text-xs">{u.createdAt}</span> },
    {
      key: 'actions',
      label: t('users_col_actions'),
      render: (u: User) => (
        <div className="flex items-center gap-1">
          <button onClick={e => { e.stopPropagation(); handleEdit(u); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); handleToggle(u.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Power className="w-3.5 h-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(u.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-[#CC0000] hover:bg-[#FFF0F0] dark:hover:bg-[#2A0000] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('users_title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} {t('users_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1C1C1C] text-gray-700 dark:text-gray-300 text-sm hover:border-[#CC0000]/40 hover:text-[#CC0000] transition-colors">
              <Download className="w-4 h-4" />{t('users_export')}
            </button>
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all shadow-sm hover:shadow-[0_0_12px_rgba(204,0,0,0.4)]">
              <Plus className="w-4 h-4" />{t('users_add')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map(s => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="bg-[#FFF0F0] dark:bg-[#2A0000] rounded-xl p-4 border border-[#CC0000]/20">
              <div className="text-2xl font-bold text-[#CC0000] tabular-nums">{s.count}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1C1C1C] rounded-xl border border-gray-200 dark:border-[#2A2A2A]">
          <div className="p-4 border-b border-gray-100 dark:border-[#2A2A2A]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('users_search')}
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] w-full sm:w-80 transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          <DataTable columns={columns} data={filtered} />
          <div className="p-4 border-t border-gray-100 dark:border-[#2A2A2A] text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} {t('users_results')}
          </div>
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? t('users_modal_edit') : t('users_modal_add')}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
              {t('users_cancel')}
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC0000] to-[#AA0000] hover:from-[#AA0000] hover:to-[#880000] text-white text-sm font-medium transition-all">
              {t('users_save')}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('users_form_firstname')}</label>
            <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('users_form_lastname')}</label>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('users_form_email')}</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('users_form_role')}</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className={inputCls}>
              <option value="admin">{t('users_role_admin')}</option>
              <option value="technicien">{t('users_role_tech')}</option>
              <option value="receptionniste">{t('users_role_recep')}</option>
              <option value="interimaire">{t('users_role_interim')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('users_form_site')}</label>
            <select value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} className={inputCls}>
              <option>{t('all')}</option>
              {SITES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
