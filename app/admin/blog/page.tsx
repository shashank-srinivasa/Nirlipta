'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { BlogPost } from '@/types'
import { Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify, formatDate } from '@/lib/utils'

const EMPTY: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '', is_published: false,
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const res = await fetch('/api/admin/blog')
    if (res.ok) {
      const data = await res.json()
      setPosts(data || [])
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p: BlogPost) => { setEditing(p); setForm(p); setModal(true) }

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: editing ? prev.slug : slugify(title) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      published_at: form.is_published && !editing?.is_published ? new Date().toISOString() : editing?.published_at || null,
    }

    if (editing) {
      const res = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...payload }),
      })
      if (!res.ok) { toast.error('Failed to update'); setSaving(false); return }
      toast.success('Post updated')
    } else {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error || 'Failed to create'); setSaving(false); return
      }
      toast.success('Post created')
    }
    setModal(false); setSaving(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast.error('Failed to delete'); return }
    toast.success('Deleted'); load()
  }

  const togglePublish = async (p: BlogPost) => {
    const res = await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: p.id,
        is_published: !p.is_published,
        published_at: !p.is_published ? new Date().toISOString() : null,
      }),
    })
    if (!res.ok) { toast.error('Failed'); return }
    toast.success(p.is_published ? 'Unpublished' : 'Published')
    load()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Blog</h1>
            <p className="text-sm text-gray-500 mt-1">Write and publish posts</p>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Post
          </button>
        </div>

        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No posts yet.</div>
          )}
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.is_published ? `Published ${formatDate(p.published_at!)}` : 'Draft'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublish(p)} className={`p-1.5 transition-colors ${p.is_published ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}>
                  {p.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-sage-600 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Post' : 'New Post'}</h2>
                <button onClick={() => setModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={form.title || ''} required onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" value={form.slug || ''} required onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea rows={2} value={form.excerpt || ''} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input type="url" value={form.cover_image_url || ''} onChange={(e) => setForm((p) => ({ ...p, cover_image_url: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea rows={12} required value={form.content || ''} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write your post content here..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sage-400" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_published || false} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
                    className="w-4 h-4 rounded accent-sage-600" />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
