'use client'

import { useEffect, useRef, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { GalleryImage } from '@/types'
import Image from 'next/image'
import { Plus, Trash2, Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const res = await fetch('/api/admin/gallery')
    if (res.ok) {
      const data = await res.json()
      setImages(data || [])
    }
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (caption) formData.append('caption', caption)
      formData.append('sort_order', String(images.length))

      const res = await fetch('/api/admin/gallery/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Upload failed')
      }

      toast.success('Image uploaded')
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (img: GalleryImage) => {
    const storagePath = img.image_url.split('/').pop()
    const res = await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, storage_path: storagePath }),
    })
    if (!res.ok) { toast.error('Failed to delete'); return }
    toast.success('Deleted')
    load()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage studio photos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="font-medium text-gray-900 mb-4">Upload New Photo</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text" placeholder="Caption (optional)" value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
            <label className={`btn-primary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading...' : 'Choose Photo'}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square">
              <Image src={img.image_url} alt={img.alt_text || 'Gallery'} fill className="object-cover" sizes="25vw" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                  {img.caption}
                </div>
              )}
              <button
                onClick={() => handleDelete(img)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No photos uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
