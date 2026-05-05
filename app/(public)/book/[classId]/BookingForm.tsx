'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Class } from '@/types'
import { formatPrice, formatTime } from '@/lib/utils'
import { Loader2, MessageCircle, CreditCard, Calendar, User, Mail, Phone } from 'lucide-react'

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

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getNextValidDate(scheduleDay: string | null): string {
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
  initialDate?: string
}

export default function BookingForm({
  yoga,
  teacherName = 'Ashwini Karmbadka',
  studioName = 'Nirlipta',
  whatsapp = '919999999999',
  paymentMode = 'whatsapp',
  initialDate = '',
}: Props) {
  const router = useRouter()
  const teacherFirst = teacherName.split(' ')[0]
  const whatsappClean = whatsapp.replace(/\D/g, '')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    booking_date: initialDate,
    student_name: '',
    student_email: '',
    student_phone: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const minDate = getNextValidDate(yoga.schedule_day)
  const scheduleHint = yoga.schedule_day
    ? `Runs on ${yoga.schedule_day.split(',').map(d => d.trim() + 's').join(', ')}${yoga.schedule_time ? ` at ${formatTime(yoga.schedule_time)}` : ''}`
    : null

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.booking_date) e.booking_date = 'Please select a date'
    else if (!isValidDate(form.booking_date, yoga.schedule_day))
      e.booking_date = `This class runs on ${yoga.schedule_day?.split(',').map(d => d.trim()).join(', ')} only`
    if (!form.student_name.trim() || form.student_name.trim().length < 2)
      e.student_name = 'Please enter your full name'
    if (!form.student_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.student_email))
      e.student_email = 'Please enter a valid email address'
    const digits = form.student_phone.replace(/\D/g, '')
    if (!digits || digits.length < 10)
      e.student_phone = 'Please enter a valid 10-digit phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleWhatsApp = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, class_id: yoga.id, amount_paid: yoga.price }),
      })
    } catch { /* non-blocking */ }
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

  const inputBase = 'w-full border rounded-xl px-4 py-3 text-sm text-ink placeholder-ink/30 focus:outline-none focus:ring-2 transition bg-white'
  const inputOk = 'border-parchment-300 focus:border-marigold-400 focus:ring-marigold-400/20'
  const inputErr = 'border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-red-50/30'

  const field = (
    key: keyof typeof form,
    label: string,
    icon: React.ReactNode,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-ink/70 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/25">{icon}</span>
        <input
          type={type}
          value={form[key]}
          onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: undefined })) }}
          placeholder={placeholder}
          className={`${inputBase} pl-10 ${errors[key] ? inputErr : inputOk}`}
        />
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-parchment-300 shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="px-6 py-5 border-b border-parchment-200 bg-parchment-50">
        <h2 className="text-lg font-display font-semibold text-ink">Reserve your spot</h2>
        <p className="text-sm text-ink/45 mt-0.5">{formatPrice(yoga.price)} per session</p>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Date</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/25">
              <Calendar size={15} />
            </span>
            <input
              type="date"
              min={minDate || undefined}
              value={form.booking_date}
              onChange={e => { setForm(p => ({ ...p, booking_date: e.target.value })); setErrors(p => ({ ...p, booking_date: undefined })) }}
              className={`${inputBase} pl-10 ${errors.booking_date ? inputErr : inputOk}`}
            />
          </div>
          {scheduleHint && !errors.booking_date && (
            <p className="text-xs text-ink/35 mt-1">{scheduleHint}</p>
          )}
          {errors.booking_date && <p className="text-xs text-red-500 mt-1">{errors.booking_date}</p>}
        </div>

        {field('student_name', 'Full name', <User size={15} />, 'text', 'Your full name')}
        {field('student_email', 'Email', <Mail size={15} />, 'email', 'you@example.com')}
        {field('student_phone', 'Phone', <Phone size={15} />, 'tel', '+91 98765 43210')}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 space-y-3">
        {(paymentMode === 'whatsapp' || paymentMode === 'both') && (
          <button
            onClick={handleWhatsApp}
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={16} />}
            Confirm via WhatsApp
          </button>
        )}
        {(paymentMode === 'razorpay' || paymentMode === 'both') && (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-ink hover:bg-ink/80 text-parchment-100 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <><CreditCard size={16} /> Pay {formatPrice(yoga.price)}</>}
          </button>
        )}

        <p className="text-center text-xs text-ink/30 pt-1">
          Have a question?{' '}
          <a
            href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Hi ${teacherFirst}, I have a question about ${yoga.title}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-marigold-500 hover:underline"
          >
            Chat with {teacherFirst}
          </a>
        </p>
      </div>
    </div>
  )
}
