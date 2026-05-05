'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Plus, X, Loader2, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_BOOKING = {
  class_id: '',
  student_name: '',
  student_email: '',
  student_phone: '',
  booking_date: '',
  amount_paid: 0,
  notes: '',
  status: 'confirmed',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_BOOKING)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [bookingsRes, classesRes] = await Promise.all([
      adminFetch('/api/admin/bookings'),
      adminFetch('/api/admin/classes'),
    ])
    if (bookingsRes.ok) setBookings(await bookingsRes.json())
    if (classesRes.ok) setClasses((await classesRes.json()).filter((c: any) => c.is_active))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const totalRevenue = bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.amount_paid, 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await adminFetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount_paid: Math.round(Number(form.amount_paid) * 100) }),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Failed to add booking'); setSaving(false); return }
    toast.success('Booking added')
    setModal(false)
    setForm(EMPTY_BOOKING)
    setSaving(false)
    load()
  }

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking permanently?')) return
    const res = await adminFetch('/api/admin/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Failed to delete booking'); return }
    setBookings(prev => prev.filter(b => b.id !== id))
    toast.success('Booking deleted')
  }

  const updateStatus = async (id: string, status: string, sendEmail = false) => {
    const res = await adminFetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, send_confirmation: sendEmail }),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Failed to update status'); return }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    if (sendEmail) toast.success('Confirmed and confirmation email sent')
  }

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-50 text-green-600',
    pending: 'bg-amber-50 text-amber-600',
    cancelled: 'bg-red-50 text-red-600',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">
              {bookings.filter((b) => b.status === 'confirmed').length} confirmed · {formatPrice(totalRevenue)} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                    filter === f ? 'bg-sage-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Add booking
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'Class', 'Date', 'Contact', 'Amount', 'Status', 'Booked', ''].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No bookings found.</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{b.student_name}</p>
                      <p className="text-xs text-gray-400">{b.student_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{b.classes?.title}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(b.booking_date)}</td>
                    <td className="px-6 py-4 text-gray-600">{b.student_phone}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(b.amount_paid)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={b.status}
                          onChange={e => updateStatus(b.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-400 ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="pending">pending</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        {b.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed', true)}
                            title="Confirm and send email to student"
                            className="p-1 text-gray-300 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(b.created_at)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteBooking(b.id)} title="Delete booking" className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Add Manual Booking</h2>
                <button onClick={() => setModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select required value={form.class_id} onChange={e => {
                    const cls = classes.find((c: any) => c.id === e.target.value)
                    setForm(p => ({ ...p, class_id: e.target.value, amount_paid: cls ? cls.price / 100 : p.amount_paid }))
                  }} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400">
                    <option value="">Select a class</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.title} — {c.schedule_day || 'flexible'}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student name *</label>
                    <input required type="text" value={form.student_name} onChange={e => setForm(p => ({ ...p, student_name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input required type="tel" value={form.student_phone} onChange={e => setForm(p => ({ ...p, student_phone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.student_email} onChange={e => setForm(p => ({ ...p, student_email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input required type="date" value={form.booking_date} onChange={e => setForm(p => ({ ...p, booking_date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input type="number" min="0" value={form.amount_paid} onChange={e => setForm(p => ({ ...p, amount_paid: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input type="text" placeholder="e.g. paid cash, referred by..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Add Booking'}
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
