'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, classes(title, schedule_day, schedule_time)')
        .order('created_at', { ascending: false })
      setBookings(data || [])
    }
    load()
  }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const totalRevenue = bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.amount_paid, 0)

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
          <div className="flex gap-2">
            {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                  filter === f ? 'bg-sage-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'Class', 'Date', 'Contact', 'Amount', 'Status', 'Booked'].map((h) => (
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
