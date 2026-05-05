'use client'

import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

export default function Providers() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1C1408',
          color: '#FAF6EC',
          borderRadius: '12px',
          fontSize: '14px',
          border: '1px solid rgba(245,168,32,0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    />
  )
}
