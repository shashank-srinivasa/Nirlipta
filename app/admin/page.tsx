'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { formatPrice } from '@/lib/utils'
import { Users, BookOpen, IndianRupee, Calendar } from 'lucide-react'
import Link from 'next/link'

type Period = 'today' | 'week' | 'month' | 'all'

function startOf(period: Period): Date | null {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'week') { const d = new Date(now); d.setDate(d.getDate() - 6); return d }
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return null
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('month')
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [activeClasses, setActiveClasses] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [bookingsRes, classesRes] = await Promise.all([
        adminFetch('/api/admin/bookings'),
        adminFetch('/api/admin/classes'),
      ])
      const bookings = bookingsRes.ok ? await bookingsRes.json() : []
      const classes = classesRes.ok ? await classesRes.json() : []
      setAllBookings(bookings)
      setActiveClasses(classes.filter((c: any) => c.is_active).length)
      setLoading(false)
    }
    load()
  }, [])

  const cutoff = startOf(period)
  const confirmed = allBookings.filter((b: any) => {
    if (b.status !== 'confirmed') return false
    if (!cutoff) return true
    return new Date(b.created_at) >= cutoff
  })
  const pending = allBookings.filter((b: any) => b.status === 'pending')
  const revenue = confirmed.reduce((s: number, b: any) => s + b.amount_paid, 0)
  const uniqueStudents = new Set(confirmed.map((b: any) => b.student_email)).size
  const recentBookings = [...allBookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

  const PERIOD_LABELS: Record<Period, string> = { today: 'Today', week: 'Last 7 days', month: 'This month', all: 'All time' }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
          </div>
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {(['today', 'week', 'month', 'all'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-sage-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Confirmed Bookings', value: confirmed.length, sub: PERIOD_LABELS[period], icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
              { label: 'Revenue', value: formatPrice(revenue), sub: PERIOD_LABELS[period], icon: IndianRupee, color: 'bg-green-50 text-green-600' },
              { label: 'Active Classes', value: activeClasses, sub: 'Total', icon: Calendar, color: 'bg-sage-50 text-sage-600' },
              { label: 'Unique Students', value: uniqueStudents, sub: PERIOD_LABELS[period], icon: Users, color: 'bg-purple-50 text-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-sm text-sage-600 hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentBookings.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No bookings yet.</p>
              ) : (
                recentBookings.map((b, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.classes?.title || 'Unknown class'}</p>
                      <p className="text-xs text-gray-400">{b.student_name} · {b.booking_date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-sm font-medium text-gray-900">{formatPrice(b.amount_paid)}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}>{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Pending</h2>
              <Link href="/admin/bookings" className="text-sm text-sage-600 hover:underline">{pending.length} total →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pending.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No pending bookings.</p>
              ) : pending.slice(0, 5).map((b, i) => (
                <div key={i} className="px-6 py-3.5">
                  <p className="text-sm font-medium text-gray-900">{b.student_name}</p>
                  <p className="text-xs text-gray-400">{b.classes?.title} · {b.booking_date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
