'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { Class } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type ClassFormLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'

type ClassForm = {
  title: string; description: string; instructor: string; duration_minutes: number;
  level: ClassFormLevel; price: number; max_students: number; schedule_day: string;
  schedule_time: string; category: string; is_active: boolean; image_url: string;
}

const EMPTY_CLASS: ClassForm = {
  title: '', description: '', instructor: 'Priya', duration_minutes: 60,
  level: 'All Levels', price: 50000, max_students: 10,
  schedule_day: '', schedule_time: '', category: 'Hatha', is_active: true, image_url: '',
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState<ClassForm>(EMPTY_CLASS)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
    setClasses(data || [])
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY_CLASS); setModal(true) }
  const openEdit = (c: Class) => {
    setEditing(c)
    setForm({
      title: c.title, description: c.description || '', instructor: c.instructor,
      duration_minutes: c.duration_minutes, level: c.level as ClassFormLevel, price: c.price,
      max_students: c.max_students, schedule_day: c.schedule_day || '',
      schedule_time: c.schedule_time || '', category: c.category,
      is_active: c.is_active, image_url: c.image_url || '',
    })
    setModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes), max_students: Number(form.max_students) }
    const res = editing
      ? await fetch('/api/admin/classes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      : await fetch('/api/admin/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast.error(editing ? 'Failed to update' : 'Failed to create'); setSaving(false); return }
    toast.success(editing ? 'Class updated' : 'Class created')
    setModal(false); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class? This will also delete all bookings.')) return
    const res = await fetch('/api/admin/classes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) { toast.error('Failed to delete'); return }
    toast.success('Deleted'); load()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your yoga class offerings</p>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Class
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Category', 'Level', 'Price', 'Schedule', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.title}</td>
                  <td className="px-6 py-4 text-gray-500">{c.category}</td>
                  <td className="px-6 py-4 text-gray-500">{c.level}</td>
                  <td className="px-6 py-4 text-gray-900">{formatPrice(c.price)}</td>
                  <td className="px-6 py-4 text-gray-500">{c.schedule_day} {c.schedule_time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-sage-600 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Class' : 'New Class'}</h2>
                <button onClick={() => setModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                {[
                  { label: 'Title', key: 'title', type: 'text', required: true },
                  { label: 'Instructor', key: 'instructor', type: 'text', required: true },
                  { label: 'Price (paise, e.g. 50000 = ₹500)', key: 'price', type: 'number', required: true },
                  { label: 'Duration (minutes)', key: 'duration_minutes', type: 'number', required: true },
                  { label: 'Max Students', key: 'max_students', type: 'number', required: true },
                  { label: 'Schedule Day', key: 'schedule_day', type: 'text' },
                  { label: 'Schedule Time (e.g. 06:30 AM)', key: 'schedule_time', type: 'text' },
                  { label: 'Image URL (optional)', key: 'image_url', type: 'url' },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type} value={(form as any)[key]} required={required}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    {['Hatha', 'Vinyasa', 'Yin', 'Meditation', 'Power', 'Restorative'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} rows={3} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-sage-600" />
                  <span className="text-sm text-gray-700">Active (visible to students)</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Class'}
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
