import { createClient } from '@/lib/supabase/server'

let cached: { whatsapp: string } | null = null

export async function getWhatsApp(): Promise<string> {
  if (cached) return cached.whatsapp
  const supabase = createClient()
  const { data } = await supabase.from('studio_settings').select('whatsapp_number').single()
  const whatsapp = data?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  cached = { whatsapp }
  return whatsapp
}
