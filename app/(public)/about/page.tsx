import { createClient } from '@/lib/supabase/server'
import About from '@/components/sections/About'
import Testimonials from '@/components/sections/Testimonials'
import ReviewForm from '@/components/sections/ReviewForm'
import WhatsAppSection from '@/components/sections/WhatsAppSection'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('studio_settings').select('teacher_name, about_text, studio_name').single()
  const teacher = data?.teacher_name || 'Ashwini Karmbadka'
  const studio = data?.studio_name || 'Nirlipta'
  const desc = data?.about_text?.slice(0, 160) || `Meet ${teacher}, the teacher behind ${studio}.`
  return { title: `About ${teacher}`, description: desc }
}
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

      <section className="py-20 bg-parchment-50">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <div className="mb-8">
            <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">Leave a review</p>
            <h2 className="text-3xl font-display font-semibold text-ink leading-tight">
              Practiced with us?
            </h2>
            <p className="text-sm text-gray-500 mt-2">Your experience helps others find their way to the mat. Reviews are moderated before appearing on the site.</p>
          </div>
          <ReviewForm />
        </div>
      </section>

      <WhatsAppSection whatsapp={whatsapp} />
    </div>
  )
}
