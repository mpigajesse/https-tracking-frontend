'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { mockUsers, User, UserRole, SITES } from '@/lib/data';
import {
  Plus, Search, Download, Edit2, Power, Trash2,
  Shield, User as UserIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  technicien: 'Technicien',
  receptionniste: 'Réceptionniste',
  interimaire: 'Intérimaire',
};

const roleBadge: Record<UserRole, 'blue' | 'success' | 'info' | 'warning'> = {
  admin: 'blue',
  technicien: 'success',
  receptionniste: 'info',
  interimaire: 'warning',
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'technicien' as UserRole, site: SITES[0], statut: 'actif' as 'actif' | 'inactif' });

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
      toast.success('Utilisateur modifié');
    } else {
      const newUser: User = { id: `u${Date.now()}`, ...form, createdAt: new Date().toISOString().split('T')[0] };
      setUsers(prev => [...prev, newUser]);
      toast.success('Utilisateur créé');
    }
    setShowModal(false);
  };

  const handleToggle = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, statut: u.statut === 'actif' ? 'inactif' : 'actif' } : u));
    toast.success('Statut mis à jour');
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Utilisateur supprimé');
  };

  const exportCSV = () => {
    const csv = [
      ['Nom', 'Prénom', 'Email', 'Rôle', 'Site', 'Statut'],
      ...filtered.map(u => [u.nom, u.prenom, u.email, u.role, u.site, u.statut]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'utilisateurs.csv'; a.click();
    toast.success('Export CSV téléchargé');
  };

  const columns = [
    {
      key: 'nom',
      label: 'Utilisateur',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {u.prenom[0]}{u.nom[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{u.prenom} {u.nom}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (u: User) => <StatusBadge variant={roleBadge[u.role]}>{roleLabels[u.role]}</StatusBadge>,
    },
    { key: 'site', label: 'Site', render: (u: User) => <span className="text-gray-700 dark:text-gray-300">{u.site}</span> },
    {
      key: 'statut',
      label: 'Statut',
      render: (u: User) => <StatusBadge variant={u.statut === 'actif' ? 'success' : 'neutral'}>{u.statut === 'actif' ? 'Actif' : 'Inactif'}</StatusBadge>,
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (u: User) => <span className="text-gray-500 dark:text-gray-400 text-xs">{u.createdAt}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u: User) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(u); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleToggle(u.id); }} className={`p-1.5 rounded-lg transition-colors ${u.statut === 'actif' ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}><Power className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Utilisateurs</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} utilisateurs enregistrés</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Techniciens', count: users.filter(u => u.role === 'technicien').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Réceptionnistes', count: users.filter(u => u.role === 'receptionniste').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Intérimaires', count: users.filter(u => u.role === 'interimaire').length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100 dark:border-[#334155]`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-[#334155]">
          <div className="p-4 border-b border-gray-100 dark:border-[#334155]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, site..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80 transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          <DataTable columns={columns} data={filtered} />
          <div className="p-4 border-t border-gray-100 dark:border-[#334155] flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filtered.length} résultats</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors">Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Enregistrer</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prénom</label>
            <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom</label>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rôle</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="admin">Administrateur</option>
              <option value="technicien">Technicien</option>
              <option value="receptionniste">Réceptionniste</option>
              <option value="interimaire">Intérimaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site</label>
            <select value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tous</option>
              {SITES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
