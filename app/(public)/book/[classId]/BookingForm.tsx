'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Class } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Loader2, MessageCircle, CreditCard } from 'lucide-react'

declare global { interface Window { Razorpay: any } }

type Step = 'date' | 'name' | 'email' | 'phone' | 'notes' | 'confirm'
type PaymentMode = 'whatsapp' | 'razorpay' | 'both'

const STEPS: Step[] = ['date', 'name', 'email', 'phone', 'notes', 'confirm']
const KEYS = ['booking_date', 'student_name', 'student_email', 'student_phone', 'notes'] as const

const buildPrompts = (teacherFirst: string): Record<Step, string> => ({
  date:    'Which date works for you?',
  name:    "What's your name?",
  email:   'And your email?',
  phone:   'Your phone number?',
  notes:   `Anything ${teacherFirst} should know? (injuries, experience, questions)`,
  confirm: 'All set. How would you like to confirm?',
})

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
  const [step, setStep] = useState(0)
  const teacherFirst = teacherName.split(' ')[0]
  const PROMPT = buildPrompts(teacherFirst)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [form, setForm] = useState({
    booking_date: '', student_name: '', student_email: '',
    student_phone: '', notes: '',
  })

  const currentStep = STEPS[step] as Step

  const messages = useMemo(() => {
    const msgs: { role: 'ashwini' | 'student'; text: string }[] = []
    msgs.push({ role: 'ashwini', text: `Booking: ${yoga.title} · ${formatPrice(yoga.price)}` })
    STEPS.slice(0, step + 1).forEach((s, i) => {
      msgs.push({ role: 'ashwini', text: PROMPT[s] })
      const val = form[KEYS[i] as keyof typeof form]
      if (val && i < step) msgs.push({ role: 'student', text: val })
    })
    return msgs
  }, [form, step, yoga.title, yoga.price, PROMPT])

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleNext = () => {
    if (!input.trim() && currentStep !== 'notes') { toast.error('Please fill this in'); return }
    if (currentStep === 'email' && !/\S+@\S+\.\S+/.test(input)) { toast.error('Valid email please'); return }
    if (currentStep === 'phone' && input.trim().length < 7) { toast.error('Enter a valid phone number'); return }
    setForm(prev => ({ ...prev, [KEYS[step]]: input.trim() }))
    setInput('')
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  // ── WhatsApp booking ────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const lines = [
      `Hi ${teacherFirst}, I'd like to book a class.`,
      `Class: ${yoga.title}`,
      `Date: ${form.booking_date}`,
      `Name: ${form.student_name}`,
      `Email: ${form.student_email}`,
      `Phone: ${form.student_phone}`,
      form.notes ? `Notes: ${form.notes}` : '',
    ].filter(Boolean).join('\n')

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    router.push('/booking-sent')
  }

  // ── Razorpay booking ────────────────────────────────────────────────────
  const loadRazorpay = () => new Promise<boolean>(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePay = async () => {
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway failed to load'); setLoading(false); return }

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: yoga.price, classId: yoga.id }),
      })
      const { order, keyId, error } = await orderRes.json()
      if (error) { toast.error(error); setLoading(false); return }

      new window.Razorpay({
        key: keyId,
        amount: order.amount, currency: order.currency,
        name: `${studioName} by ${teacherFirst}`,
        description: yoga.title,
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

  return (
    <div className="bg-ink rounded-3xl border border-marigold-400/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-marigold-400 flex items-center justify-center shrink-0">
          <span className="text-ink text-xs font-bold font-display">N</span>
        </div>
        <div>
          <p className="text-sm font-medium text-parchment-100">{teacherName}</p>
          <p className="text-xs text-white/30">Booking assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/30">online</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="px-6 py-6 space-y-3 min-h-[280px] max-h-[380px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'typingIn 0.3s ease-out both', animationDelay: `${i * 40}ms` }}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'ashwini'
                ? 'bg-white/15 text-parchment-100 rounded-tl-sm border border-white/10'
                : 'bg-marigold-400 text-ink rounded-tr-sm font-medium'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input / Confirm area */}
      <div className="px-6 pb-6 border-t border-white/8 pt-4">
        {currentStep !== 'confirm' ? (
          <div className="flex gap-2">
            {currentStep === 'date' ? (
              <input
                type="date" min={minDate} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                className="flex-1 bg-white/8 border border-white/10 text-parchment-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold-400/50 focus:bg-white/10 transition"
              />
            ) : (
              <input
                type={currentStep === 'email' ? 'email' : currentStep === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder={currentStep === 'notes' ? 'Type or skip →' : 'Type here…'}
                autoFocus
                className="flex-1 bg-white/8 border border-white/10 text-parchment-100 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-marigold-400/50 focus:bg-white/10 transition"
              />
            )}
            <button
              onClick={handleNext}
              className="bg-marigold-400 hover:bg-marigold-300 text-ink rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95"
            >
              {currentStep === 'notes' ? (input ? 'Send' : 'Skip') : '→'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Booking summary */}
            <div className="bg-white/5 rounded-xl p-4 text-sm space-y-1.5 border border-white/8">
              <div className="flex justify-between">
                <span className="text-white/40">Class</span>
                <span className="text-parchment-200 font-medium">{yoga.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Date</span>
                <span className="text-parchment-200">{form.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Name</span>
                <span className="text-parchment-200">{form.student_name}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span className="text-white/40">Price</span>
                <span className="text-marigold-300 font-semibold text-base">{formatPrice(yoga.price)}</span>
              </div>
            </div>

            {/* Payment options */}
            {paymentMode === 'whatsapp' && (
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle size={17} /> Confirm via WhatsApp
              </button>
            )}

            {paymentMode === 'razorpay' && (
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-marigold-400 hover:bg-marigold-300 text-ink py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  : <><CreditCard size={17} /> Pay {formatPrice(yoga.price)} · UPI / Card</>}
              </button>
            )}

            {paymentMode === 'both' && (
              <div className="space-y-3">
                <p className="text-center text-xs text-white/30 mb-1">Choose how to confirm</p>
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full bg-marigold-400 hover:bg-marigold-300 text-ink py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : <><CreditCard size={17} /> Pay now · {formatPrice(yoga.price)}</>}
                </button>
                <button
                  onClick={handleWhatsApp}
                  disabled={loading}
                  className="w-full bg-white/10 hover:bg-green-500/20 border border-white/10 hover:border-green-400/30 text-parchment-100 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  <MessageCircle size={17} className="text-green-400" /> Message on WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
