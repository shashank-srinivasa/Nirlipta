import Hero from '@/components/sections/Hero'
import WhatsAppSection from '@/components/sections/WhatsAppSection'
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
  const { data: settings } = await supabase
    .from('studio_settings')
    .select('studio_name, tagline, whatsapp_number, teacher_name')
    .single()

  const studioName = settings?.studio_name || 'Nirlipta'
  const whatsapp = settings?.whatsapp_number || '919999999999'

  return (
    <>
      <Hero studioName={studioName} tagline={settings?.tagline} />
      <WhatsAppSection whatsapp={whatsapp} teacherName={settings?.teacher_name} />
    </>
  )
}
