import Hero from '@/components/sections/Hero'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('studio_name, tagline').single()
  const studioName = settings?.studio_name || 'Nirlipta'
  const tagline = settings?.tagline || null

  return <Hero studioName={studioName} tagline={tagline} />
}
