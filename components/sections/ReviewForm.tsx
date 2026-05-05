'use client'

import { useState } from 'react'

type FormFields = { name: string; role: string; text: string }
type Errors = Partial<Record<keyof FormFields, string>>

export default function ReviewForm() {
  const [form, setForm] = useState<FormFields>({ name: '', role: '', text: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [serverError, setServerError] = useState('')

  const set = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Please enter your name'
    if (!form.text.trim()) e.text = 'Please write your review'
    else if (form.text.trim().length < 20) e.text = 'Review is too short — write at least a sentence'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setServerError('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.error || 'Something went wrong'); setStatus('error'); return }
      setStatus('done')
    } catch {
      setServerError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const inputClass = (key: keyof FormFields) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white/80 transition ${
      errors[key]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-gray-200 focus:ring-sage-400'
    }`

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
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Your name <span className="text-terracotta-400">*</span></label>
          <input type="text" value={form.name} onChange={set('name')}
            placeholder="Priya Sharma" className={inputClass('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">How long have you practiced? <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="text" value={form.role} onChange={set('role')}
            placeholder="Student since 2022" className={inputClass('role')} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Your review <span className="text-terracotta-400">*</span></label>
        <textarea rows={4} value={form.text} onChange={set('text')}
          placeholder="Share what your experience has been like..."
          className={inputClass('text') + ' resize-none'} />
        {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text}</p>}
      </div>
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary disabled:opacity-60">
        {status === 'submitting' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
