import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('studio_settings').select('whatsapp_number, studio_name, teacher_name').single()
  const whatsapp = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'
  const studioName = settings?.studio_name || 'Nirlipta'
  const teacherName = settings?.teacher_name || 'Ashwini Karmbadka'

  return (
    <>
      <Navbar studioName={studioName} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton whatsapp={whatsapp} teacherName={teacherName} />
    </>
  )
}
