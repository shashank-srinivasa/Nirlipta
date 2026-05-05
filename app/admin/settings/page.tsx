'use client'

import { useEffect, useRef, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { adminFetch } from '@/lib/admin-fetch'
import { StudioSettings } from '@/types'
import { Loader2, Eye, EyeOff, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { compressImage } from '@/lib/compress-image'

type Section = {
  title: string
  description: string
  fields: {
    label: string
    key: keyof StudioSettings
    type?: string
    multiline?: boolean
    placeholder?: string
    hint?: string
    secret?: boolean
  }[]
}

function PhotoPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [uploading, setUploading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = () => setSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initial = centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 4 / 5, width, height), width, height)
    setCrop(initial)
    setCompletedCrop(initial)
  }

  const applyCrop = async () => {
    const img = imgRef.current
    if (!img || !completedCrop) return
    setUploading(true)

    const canvas = document.createElement('canvas')
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    const outW = 800
    const outH = 1000
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, outW, outH,
    )

    try {
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/jpeg', 0.85)
      )
      const formData = new FormData()
      formData.append('file', new File([blob], 'teacher.jpg', { type: 'image/jpeg' }))
      const resp = await (await import('@/lib/admin-fetch')).adminFetch('/api/admin/settings/upload', { method: 'POST', body: formData })
      if (!resp.ok) throw new Error((await resp.json()).error || 'Upload failed')
      const { publicUrl } = await resp.json()
      onChange(publicUrl)
      setSrc(null)
      toast.success('Photo saved')
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value && <img src={value} alt="Teacher photo" className="w-16 h-20 rounded-xl object-cover border border-gray-200" />}
        <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}>
          <Upload size={14} />
          {value ? 'Change photo' : 'Choose photo'}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-red-400 hover:text-red-600">Remove</button>
        )}
      </div>

      {src && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Crop photo</h3>
            <p className="text-xs text-gray-400">Drag to adjust. Best results with a portrait shot.</p>
            <div className="max-h-[60vh] overflow-auto flex justify-center">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={4 / 5}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={src} onLoad={onImageLoad} className="max-w-full" alt="crop" />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setSrc(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={applyCrop} disabled={uploading} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60">
                {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Use this crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const SECTIONS: Section[] = [
  {
    title: 'Studio',
    description: 'Basic information shown across the site.',
    fields: [
      { label: 'Studio Name', key: 'studio_name', placeholder: 'Nirlipta' },
      { label: 'Tagline', key: 'tagline', placeholder: 'A short line that appears under the name' },
    ],
  },
  {
    title: 'Teacher',
    description: "Your name and photo shown on the About page, booking form, and footer.",
    fields: [
      { label: 'Teacher Name', key: 'teacher_name', placeholder: 'Ashwini Karmbadka', hint: 'Full name, used on the booking screen and footer.' },
      { label: 'Teacher Photo', key: 'teacher_photo_url', type: 'photo', hint: 'Pick a photo from your device. Stored directly in the database.' },
      { label: 'Footer Tagline', key: 'footer_tagline', placeholder: 'Yoga with Ashwini. Bengaluru and Puttur.', hint: 'One line shown under your name in the footer.' },
    ],
  },
  {
    title: 'About Page',
    description: 'Content shown on the About page.',
    fields: [
      { label: 'About Text', key: 'about_text', multiline: true, placeholder: 'Write about yourself and your teaching...' },
      { label: 'Heading', key: 'about_heading', placeholder: 'Trained in tradition.', hint: 'First line of the large heading on the About page.' },
      { label: 'Heading (sub-line)', key: 'about_heading_sub', placeholder: 'Grounded in real life.', hint: 'Second line of the heading, shown in italic.' },
      { label: 'Years of Experience', key: 'years_experience', placeholder: '15+' },
      { label: 'Students Taught', key: 'students_taught', placeholder: '400+' },
      { label: 'Certification', key: 'certification', placeholder: '200hr', hint: 'E.g. 200hr RYT, 500hr RYT' },
      { label: 'Specialisations', key: 'specialisations', placeholder: 'Hatha & Vinyasa' },
    ],
  },
  {
    title: 'Page Copy',
    description: 'Subtitle text on the Classes and Blog listing pages.',
    fields: [
      {
        label: 'Classes Page Subtitle',
        key: 'classes_page_subtitle',
        multiline: true,
        placeholder: 'Hatha on the slower days. Vinyasa when you need to move something. Pick what your body is asking for.',
      },
      {
        label: 'Blog Page Subtitle',
        key: 'blog_page_subtitle',
        multiline: true,
        placeholder: 'Things Ashwini writes when she is not on the mat. Yoga, occasionally. Life between classes, mostly.',
      },
    ],
  },
  {
    title: 'Contact',
    description: 'How students can reach you.',
    fields: [
      { label: 'Address', key: 'address', multiline: true, placeholder: 'Studio address' },
      { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
      { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
      {
        label: 'WhatsApp Number',
        key: 'whatsapp_number',
        type: 'tel',
        placeholder: '919876543210',
        hint: 'Include country code, no spaces or + sign. E.g. 919876543210 for an Indian number.',
      },
    ],
  },
  {
    title: 'Social Media',
    description: 'Links shown in the footer.',
    fields: [
      { label: 'Instagram URL', key: 'instagram_url', type: 'url', placeholder: 'https://instagram.com/yourhandle' },
      { label: 'YouTube URL', key: 'youtube_url', type: 'url', placeholder: 'https://youtube.com/@yourchannel' },
      { label: 'Facebook URL', key: 'facebook_url', type: 'url', placeholder: 'https://facebook.com/yourpage' },
    ],
  },
  {
    title: 'Payments (Razorpay)',
    description: 'Only needed when payment mode includes Razorpay. Go to razorpay.com → Settings → API Keys. Use Test keys while testing, Live keys for real payments.',
    fields: [
      {
        label: 'Razorpay Key ID',
        key: 'razorpay_key_id',
        placeholder: 'rzp_live_xxxxxxxxxxxx',
        hint: 'Starts with rzp_test_ (for testing) or rzp_live_ (for real payments).',
      },
      {
        label: 'Razorpay Key Secret',
        key: 'razorpay_key_secret',
        secret: true,
        placeholder: '••••••••••••••••••••',
        hint: 'Keep this private. Never share it with anyone.',
      },
    ],
  },
]

type PaymentMode = 'whatsapp' | 'razorpay' | 'both'

const PAYMENT_MODES: { value: PaymentMode; label: string; description: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp only', description: 'Students message you to confirm booking. No online payment.' },
  { value: 'razorpay', label: 'Online payment only', description: 'Students pay via UPI/Card through Razorpay. Requires API keys above.' },
  { value: 'both', label: 'Both', description: 'Students choose: pay online or message you. Requires Razorpay keys.' },
]

function PaymentModeSelector({ value, onChange }: { value: PaymentMode; onChange: (v: PaymentMode) => void }) {
  return (
    <div className="space-y-2">
      {PAYMENT_MODES.map(mode => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
            value === mode.value
              ? 'border-sage-400 bg-sage-50 ring-1 ring-sage-400'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
            value === mode.value ? 'border-sage-500' : 'border-gray-300'
          }`}>
            {value === mode.value && <div className="w-2 h-2 rounded-full bg-sage-500" />}
          </div>
          <div>
            <p className={`text-sm font-medium ${value === mode.value ? 'text-sage-800' : 'text-gray-700'}`}>
              {mode.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{mode.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Partial<StudioSettings>>({})
  const [saving, setSaving] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await adminFetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        if (data) setForm(data)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await adminFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Failed to save settings'); setSaving(false); return }
    toast.success('Settings saved!')
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your studio information and integrations</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Payment mode — rendered before the Razorpay keys section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Booking Method</h2>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Choose how students confirm their booking. Switch to Razorpay when you&apos;re ready to accept online payments.
              </p>
            </div>
            <div className="px-6 py-5">
              <PaymentModeSelector
                value={(form.payment_mode as PaymentMode) || 'whatsapp'}
                onChange={v => setForm(p => ({ ...p, payment_mode: v }))}
              />
            </div>
          </div>

          {SECTIONS.map(section => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.description}</p>
              </div>
              <div className="px-6 py-5 space-y-5">
                {section.fields.map(({ label, key, type, multiline, placeholder, hint, secret }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      {type === 'photo' ? (
                        <PhotoPicker
                          value={(form[key] as string) || ''}
                          onChange={v => setForm(p => ({ ...p, [key]: v }))}
                        />
                      ) : multiline ? (
                        <textarea
                          rows={3}
                          value={(form[key] as string) || ''}
                          placeholder={placeholder}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
                        />
                      ) : (
                        <input
                          type={secret && !showSecret ? 'password' : type || 'text'}
                          value={(form[key] as string) || ''}
                          placeholder={placeholder}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 pr-10"
                        />
                      )}
                      {secret && (
                        <button
                          type="button"
                          onClick={() => setShowSecret(s => !s)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                    {hint && <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{hint}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Settings'}
            </button>
            <p className="text-xs text-gray-400">Changes take effect immediately.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
