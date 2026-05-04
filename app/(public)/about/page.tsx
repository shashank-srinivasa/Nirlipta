import { createClient } from '@/lib/supabase/server'
import About from '@/components/sections/About'
import Testimonials from '@/components/sections/Testimonials'
import WhatsAppSection from '@/components/sections/WhatsAppSection'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }
export const revalidate = 3600

export default async function AboutPage() {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('*').single()

  const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'

  return (
    <div className="pt-16">
      <About
        aboutText={settings?.about_text}
        teacherName={settings?.teacher_name}
        teacherPhotoUrl={settings?.teacher_photo_url}
        aboutHeading={settings?.about_heading}
        aboutHeadingSub={settings?.about_heading_sub}
        yearsExperience={settings?.years_experience}
        studentsTaught={settings?.students_taught}
        certification={settings?.certification}
        specialisations={settings?.specialisations}
      />
      <Testimonials />
      <WhatsAppSection whatsapp={whatsapp} />
    </div>
  )
}
