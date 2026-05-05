'use client'

import { useState } from 'react'

export default function ReviewForm() {
  const [form, setForm] = useState({ name: '', role: '', text: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setStatus('error'); return }
      setStatus('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="text-center py-10">
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-semibold text-ink">Thank you for sharing.</p>
        <p className="text-sm text-gray-500 mt-1">Your review will appear on the site once approved.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Your name <span className="text-terracotta-400">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Priya Sharma"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white/80"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">How long have you practiced? <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            placeholder="Student since 2022"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white/80"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Your review <span className="text-terracotta-400">*</span></label>
        <textarea
          rows={4}
          value={form.text}
          onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
          placeholder="Share what your experience has been like..."
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none bg-white/80"
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
