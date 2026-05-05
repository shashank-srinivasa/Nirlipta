export const dynamic = 'force-dynamic'

import AdminSidebar from '../AdminSidebar'
import { createServiceClient } from '@/lib/supabase/server'
import { Mail, Phone, Clock } from 'lucide-react'

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminMessagesPage() {
  const supabase = createServiceClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Contact form submissions from the website. Reply directly by email or phone.
          </p>
        </div>

        {!messages || messages.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Mail size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No messages yet.</p>
            <p className="text-sm text-gray-300 mt-1">When someone fills out the contact form, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{msg.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Mail size={11} /> {msg.email}
                        </a>
                      )}
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Phone size={11} /> {msg.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                    <Clock size={11} />
                    {formatRelative(msg.created_at)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                <div className="flex gap-2 mt-4">
                  {msg.email && (
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your enquiry`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Mail size={11} /> Reply by email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
