'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { Testimonial } from '@/types'
import { Loader2, Trash2, Eye, EyeOff, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/testimonials')
    if (res.ok) setTestimonials(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const pending = testimonials.filter(t => !t.is_active)
  const approved = testimonials.filter(t => t.is_active)

  const approve = async (t: Testimonial) => {
    setSaving(t.id)
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, is_active: true }),
    })
    if (!res.ok) toast.error('Failed')
    else { setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_active: true } : x)); toast.success('Approved — now showing on site') }
    setSaving(null)
  }

  const hide = async (t: Testimonial) => {
    setSaving(t.id)
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, is_active: false }),
    })
    if (!res.ok) toast.error('Failed')
    else { setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_active: false } : x)); toast.success('Hidden from site') }
    setSaving(null)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    setSaving(id)
    const res = await adminFetch('/api/admin/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) toast.error('Failed')
    else { setTestimonials(prev => prev.filter(x => x.id !== id)); toast.success('Deleted') }
    setSaving(null)
  }

  const Card = ({ t, isPending }: { t: Testimonial; isPending: boolean }) => (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex ${isPending ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className={`w-1.5 shrink-0 ${t.bg_color}`} />
      <div className="flex-1 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
              {t.role && <><span className="text-gray-300">·</span><p className="text-xs text-gray-400">{t.role}</p></>}
              {isPending && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">awaiting approval</span>}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isPending ? (
              <button onClick={() => approve(t)} disabled={saving === t.id} title="Approve — show on site"
                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                {saving === t.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              </button>
            ) : (
              <button onClick={() => hide(t)} disabled={saving === t.id} title="Hide from site"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                {saving === t.id ? <Loader2 size={15} className="animate-spin" /> : <EyeOff size={15} />}
              </button>
            )}
            <button onClick={() => remove(t.id)} disabled={saving === t.id} title="Delete permanently"
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Students submit reviews from the About page. Approve the genuine ones to show on the site.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-3">
                  Awaiting approval ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map(t => <Card key={t.id} t={t} isPending={true} />)}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Showing on site ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                  No approved reviews yet. Approve submissions above to show them on the site.
                </div>
              ) : (
                <div className="space-y-3">
                  {approved.map(t => <Card key={t.id} t={t} isPending={false} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
