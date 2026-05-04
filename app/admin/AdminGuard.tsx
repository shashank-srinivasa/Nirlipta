'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const verify = async () => {
      const token = sessionStorage.getItem('admin_token')
      if (!token) {
        if (pathname !== '/admin/login') router.replace('/admin/login')
        else setAuthed(true)
        return
      }

      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const { valid } = await res.json()
        if (valid) {
          setAuthed(true)
        } else {
          sessionStorage.removeItem('admin_token')
          router.replace('/admin/login')
        }
      } catch {
        router.replace('/admin/login')
      }
    }

    verify()
  }, [pathname, router])

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
