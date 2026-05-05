'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { Testimonial } from '@/types'
import { Loader2, Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const BG_OPTIONS = [
  { label: 'Deep Navy', value: 'bg-indigo-700' },
  { label: 'Forest Green', value: 'bg-forest-700' },
  { label: 'Dark Brown', value: 'bg-[#5C2D0A]' },
  { label: 'Charcoal', value: 'bg-gray-800' },
  { label: 'Deep Teal', value: 'bg-teal-800' },
  { label: 'Plum', value: 'bg-purple-900' },
]

const EMPTY: Omit<Testimonial, 'id' | 'created_at'> = {
  name: '', role: '', text: '', bg_color: 'bg-indigo-700', sort_order: 0, is_active: true,
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ ...EMPTY })

  const load = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/testimonials')
    if (res.ok) {
      const data = await res.json()
      setTestimonials(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (t: Testimonial) => {
    setSaving(t.id)
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
    })
    if (!res.ok) toast.error('Failed to update')
    else {
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !t.is_active } : x))
      toast.success(t.is_active ? 'Hidden from site' : 'Now showing on site')
    }
    setSaving(null)
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    setSaving(id)
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) toast.error('Failed to delete')
    else {
      setTestimonials(prev => prev.filter(x => x.id !== id))
      toast.success('Deleted')
    }
    setSaving(null)
  }

  const handleAdd = async () => {
    if (!newForm.name.trim() || !newForm.text.trim()) {
      toast.error('Name and testimonial text are required')
      return
    }
    setSaving('new')
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, sort_order: testimonials.length }),
    })
    if (!res.ok) toast.error('Failed to add')
    else {
      const data = await res.json()
      setTestimonials(prev => [...prev, data])
      setNewForm({ ...EMPTY })
      setAdding(false)
      toast.success('Testimonial added')
    }
    setSaving(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
            <p className="text-sm text-gray-500 mt-1">
              Toggle the eye icon to show or hide each testimonial on the site. Hidden ones are kept but not displayed.
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus size={15} /> Add testimonial
          </button>
        </div>

        {adding && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">New Testimonial</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    value={newForm.name}
                    onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Priya S."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Duration</label>
                  <input
                    value={newForm.role}
                    onChange={e => setNewForm(p => ({ ...p, role: e.target.value }))}
                    placeholder="e.g. Student, 1 year"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial *</label>
                <textarea
                  rows={4}
                  value={newForm.text}
                  onChange={e => setNewForm(p => ({ ...p, text: e.target.value }))}
                  placeholder="What did they say?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewForm(p => ({ ...p, bg_color: opt.value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${opt.value} ${newForm.bg_color === opt.value ? 'ring-2 ring-offset-2 ring-gray-900' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={saving === 'new'}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
                >
                  {saving === 'new' ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
                </button>
                <button
                  onClick={() => { setAdding(false); setNewForm({ ...EMPTY }) }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400">No testimonials yet.</p>
            <p className="text-sm text-gray-300 mt-1">Add the first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map(t => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex gap-0 ${!t.is_active ? 'opacity-50' : 'border-gray-100'}`}
              >
                <div className={`w-1.5 shrink-0 ${t.bg_color}`} />
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                        <span className="text-gray-300">·</span>
                        <p className="text-xs text-gray-400">{t.role}</p>
                        {!t.is_active && (
                          <span className="ml-1 text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">hidden</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{t.text}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(t)}
                        disabled={saving === t.id}
                        title={t.is_active ? 'Hide from site' : 'Show on site'}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {saving === t.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : t.is_active ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTestimonial(t.id)}
                        disabled={saving === t.id}
                        title="Delete"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Tip: Use the <Eye size={11} className="inline" /> icon to show/hide. The testimonials section won&apos;t appear on the site if all are hidden.
        </p>
      </div>
    </div>
  )
}
