import Hero from '@/components/sections/Hero'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('studio_settings').select('studio_name, tagline, teacher_name').single()
  const name = data?.studio_name || 'Nirlipta'
  const teacher = data?.teacher_name || 'Ashwini Karmbadka'
  const tagline = data?.tagline || 'Hatha & Vinyasa yoga in Bengaluru'
  return {
    title: `${name} by ${teacher.split(' ')[0]} — Yoga, Bengaluru`,
    description: tagline,
    openGraph: { title: `${name} by ${teacher.split(' ')[0]}`, description: tagline },
  }
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('studio_name, tagline').single()
  const studioName = settings?.studio_name || 'Nirlipta'
  const tagline = settings?.tagline || null

  return <Hero studioName={studioName} tagline={tagline} />
}
