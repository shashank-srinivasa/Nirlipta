'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Check } from 'lucide-react'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-parchment-300 bg-parchment-50/50 focus:outline-none focus:ring-2 focus:ring-marigold-400 focus:border-transparent text-sm text-ink placeholder:text-ink/30 transition"

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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="Your name" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required
            placeholder="you@example.com" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">Message *</label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
            placeholder="What would you like to know..." className={inputClass + ' resize-none'} />
        </div>
        <button type="submit" disabled={loading}
          className="btn-marigold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
