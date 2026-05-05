'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { formatPrice } from '@/lib/utils'
import { Users, BookOpen, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, classes: 0, students: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const [bookingsRes, classesRes] = await Promise.all([
        adminFetch('/api/admin/bookings'),
        adminFetch('/api/admin/classes'),
      ])
      const bookings = bookingsRes.ok ? await bookingsRes.json() : []
      const classes = classesRes.ok ? await classesRes.json() : []

      const confirmed = bookings.filter((b: any) => b.status === 'confirmed')
      const revenue = confirmed.reduce((sum: number, b: any) => sum + b.amount_paid, 0)
      const uniqueStudents = new Set(confirmed.map((b: any) => b.student_email)).size
      const activeClasses = classes.filter((c: any) => c.is_active).length

      setStats({ bookings: confirmed.length, revenue, classes: activeClasses, students: uniqueStudents })
      setRecentBookings(confirmed.slice(0, 5))
    }
    load()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.bookings, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
            { label: 'Active Classes', value: stats.classes, icon: Calendar, color: 'bg-sage-50 text-sage-600' },
            { label: 'Unique Students', value: stats.students, icon: Users, color: 'bg-purple-50 text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-sage-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">No confirmed bookings yet.</p>
            ) : (
              recentBookings.map((b, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.classes?.title}</p>
                    <p className="text-xs text-gray-500">{b.student_name} · {b.student_email}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(b.amount_paid)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
