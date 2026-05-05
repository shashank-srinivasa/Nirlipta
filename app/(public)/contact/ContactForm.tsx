'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Check } from 'lucide-react'

type FormFields = { name: string; email: string; phone: string; message: string }
type Errors = Partial<Record<keyof FormFields, string>>

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState<FormFields>({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})

  const set = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Please enter your name'
    if (!form.email.trim()) e.email = 'Please enter your email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.message.trim()) e.message = 'Please write a message'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success("Message sent! Ashwini will be in touch.")
    } catch {
      toast.error("Couldn't send — try WhatsApp instead.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (key: keyof FormFields) =>
    `w-full px-4 py-3 rounded-xl border bg-parchment-50/50 focus:outline-none focus:ring-2 focus:border-transparent text-sm text-ink placeholder:text-ink/30 transition ${
      errors[key]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-parchment-300 focus:ring-marigold-400'
    }`

  if (sent) {
    return (
      <div className="card-base p-10 text-center">
        <div className="w-16 h-16 bg-marigold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-marigold-600" />
        </div>
        <h3 className="text-xl font-display font-semibold text-ink mb-2">Thank you.</h3>
        <p className="text-ink/50 text-sm">Ashwini will get back to you soon.</p>
      </div>
    )
  }

  return (
    <div className="card-base p-8">
      <h2 className="text-xl font-display font-semibold text-ink mb-6">Send a message</h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={set('name')}
              placeholder="Your name" className={inputClass('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+91 98765 43210" className={inputClass('phone')} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" className={inputClass('email')} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Message *</label>
          <textarea value={form.message} onChange={set('message')} rows={5}
            placeholder="What would you like to know..." className={inputClass('message') + ' resize-none'} />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="btn-marigold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
