'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { Plus, Trash2, X, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

type AdminUser = { id: string; email: string; name: string; is_active: boolean; created_at: string }

const EMPTY = { name: '', email: '', password: '' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await adminFetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to add admin'); setSaving(false); return }
    toast.success('Admin user added')
    setModal(false); setForm(EMPTY); setSaving(false); load()
  }

  const toggleActive = async (u: AdminUser) => {
    const res = await adminFetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, is_active: !u.is_active }),
    })
    if (!res.ok) { toast.error('Failed to update'); return }
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x))
    toast.success(u.is_active ? 'Access revoked' : 'Access restored')
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this admin permanently?')) return
    const res = await adminFetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('Admin removed')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Users</h1>
            <p className="text-sm text-gray-500 mt-1">Up to 5 admins can access the dashboard.</p>
          </div>
          <button onClick={() => setModal(true)} disabled={users.length >= 5}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40">
            <Plus size={15} /> Add admin
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                <ShieldCheck size={28} className="mx-auto mb-3 text-gray-200" />
                No DB admin users yet. Login currently uses environment credentials.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleActive(u)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'} transition-colors`}>
                          {u.is_active ? 'Active' : 'Revoked'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => remove(u.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Add Admin</h2>
                <button onClick={() => { setModal(false); setForm(EMPTY) }} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ashwini Karmbadka"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@studio.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 8 characters" minLength={8}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setModal(false); setForm(EMPTY) }} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : 'Add Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
