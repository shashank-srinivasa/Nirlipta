'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Class } from '@/types'
import { formatPrice, formatTime } from '@/lib/utils'
import { Loader2, MessageCircle, CreditCard } from 'lucide-react'

declare global { interface Window { Razorpay: any } }

type PaymentMode = 'whatsapp' | 'razorpay' | 'both'

const DAY_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

function getDayIndices(scheduleDay: string | null): number[] {
  if (!scheduleDay) return []
  return scheduleDay.split(',').map(d => DAY_MAP[d.trim().toLowerCase()]).filter(i => i !== undefined) as number[]
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getValidDates(scheduleDay: string | null): string {
  const indices = getDayIndices(scheduleDay)
  if (!indices.length) return ''
  const today = new Date()
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (indices.includes(d.getDay())) return toLocalDateStr(d)
  }
  return ''
}

function isValidDate(dateStr: string, scheduleDay: string | null): boolean {
  const indices = getDayIndices(scheduleDay)
  if (!indices.length) return true
  return indices.includes(new Date(dateStr + 'T00:00:00').getDay())
}

interface Props {
  yoga: Class
  teacherName?: string
  studioName?: string
  whatsapp?: string
  paymentMode?: PaymentMode
}

export default function BookingForm({
  yoga,
  teacherName = 'Ashwini Karmbadka',
  studioName = 'Nirlipta',
  whatsapp = '919999999999',
  paymentMode = 'whatsapp',
}: Props) {
  const router = useRouter()
  const teacherFirst = teacherName.split(' ')[0]
  const whatsappClean = whatsapp.replace(/\D/g, '')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ booking_date: '', student_name: '', student_email: '', student_phone: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const minDate = getValidDates(yoga.schedule_day)
  const scheduleHint = yoga.schedule_day
    ? `This class runs on ${yoga.schedule_day.split(',').map(d => d.trim() + 's').join(', ')}${yoga.schedule_time ? ` at ${formatTime(yoga.schedule_time)}` : ''}${yoga.recurrence && yoga.recurrence !== 'one-time' ? ` (${yoga.recurrence})` : ''}`
    : null

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.booking_date) e.booking_date = 'Pick a date'
    else if (!isValidDate(form.booking_date, yoga.schedule_day))
      e.booking_date = `This class runs on ${yoga.schedule_day?.split(',').map(d => d.trim()).join(', ')} only`
    if (!form.student_name.trim()) e.student_name = 'Enter your name'
    if (!form.student_email.trim() || !/\S+@\S+\.\S+/.test(form.student_email))
      e.student_email = 'Enter a valid email'
    if (!form.student_phone.trim() || form.student_phone.trim().length < 7)
      e.student_phone = 'Enter a valid phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleWhatsApp = async () => {
    if (!validate()) return
    setLoading(true)
    // Save as pending booking so admin can track it
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, class_id: yoga.id, amount_paid: yoga.price, status: 'pending' }),
      })
    } catch { /* non-blocking — proceed regardless */ }
    setLoading(false)
    const lines = [
      `Hi ${teacherFirst}, I'd like to book a class.`,
      `Class: ${yoga.title}`,
      `Date: ${form.booking_date}`,
      `Name: ${form.student_name}`,
      `Email: ${form.student_email}`,
      `Phone: ${form.student_phone}`,
    ].join('\n')
    window.open(`https://wa.me/${whatsappClean}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener,noreferrer')
    router.push('/booking-sent')
  }

  const loadRazorpay = () => new Promise<boolean>(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePay = async () => {
    if (!validate()) return
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway failed to load'); setLoading(false); return }
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: yoga.price, classId: yoga.id, ...form }),
      })
      const { order, keyId, error } = await orderRes.json()
      if (error) { toast.error(error); setLoading(false); return }
      new window.Razorpay({
        key: keyId, amount: order.amount, currency: order.currency,
        name: `${studioName} by ${teacherFirst}`, description: yoga.title,
        order_id: order.id,
        prefill: { name: form.student_name, email: form.student_email, contact: form.student_phone },
        theme: { color: '#F5A820' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, class_id: yoga.id, amount_paid: yoga.price, ...response }),
          })
          const result = await verifyRes.json()
          if (result.success) router.push(`/payment-success?booking=${result.bookingId}`)
          else toast.error(`Payment verification failed. Message ${teacherFirst} directly.`)
          setLoading(false)
        },
        modal: { ondismiss: () => setLoading(false) },
      }).open()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: undefined })) }}
        placeholder={placeholder}
        className={`w-full bg-white/6 border rounded-xl px-4 py-3 text-sm text-parchment-100 placeholder-white/20 focus:outline-none focus:bg-white/10 transition ${errors[key] ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-marigold-400/50'}`}
      />
      {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="bg-ink rounded-3xl border border-white/8 overflow-hidden">
      <div className="px-7 py-6 border-b border-white/8">
        <h2 className="text-lg font-display font-semibold text-parchment-100">Book your spot</h2>
        <p className="text-sm text-white/35 mt-0.5">{formatPrice(yoga.price)} per session</p>
      </div>

      <div className="px-7 py-6 space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Date</label>
          <input
            type="date"
            min={minDate || undefined}
            value={form.booking_date}
            onChange={e => { setForm(p => ({ ...p, booking_date: e.target.value })); setErrors(p => ({ ...p, booking_date: undefined })) }}
            className={`w-full bg-white/6 border rounded-xl px-4 py-3 text-sm text-parchment-100 focus:outline-none focus:bg-white/10 transition ${errors.booking_date ? 'border-red-400/60' : 'border-white/10 focus:border-marigold-400/50'}`}
          />
          {scheduleHint && <p className="text-xs text-white/30 mt-1">{scheduleHint}</p>}
          {errors.booking_date && <p className="text-xs text-red-400 mt-1">{errors.booking_date}</p>}
        </div>

        {field('student_name', 'Your name', 'text', 'Full name')}
        {field('student_email', 'Email', 'email', 'you@example.com')}
        {field('student_phone', 'Phone', 'tel', '+91 98765 43210')}
      </div>

      <div className="px-7 pb-7 space-y-3">
        {(paymentMode === 'whatsapp' || paymentMode === 'both') && (
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-400 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle size={16} /> Confirm via WhatsApp
          </button>
        )}
        {(paymentMode === 'razorpay' || paymentMode === 'both') && (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-marigold-400 hover:bg-marigold-300 text-ink py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <><CreditCard size={16} /> Pay {formatPrice(yoga.price)}</>}
          </button>
        )}

        <div className="pt-2 border-t border-white/6 text-center">
          <a
            href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Hi ${teacherFirst}, I have a question about ${yoga.title}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-marigold-300 transition-colors"
          >
            Have a question? Chat with {teacherFirst} →
          </a>
        </div>
      </div>
    </div>
  )
}
