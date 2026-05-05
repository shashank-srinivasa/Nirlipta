
interface AboutProps {
  aboutText?: string | null
  teacherName?: string | null
  teacherPhotoUrl?: string | null
  aboutHeading?: string | null
  aboutHeadingSub?: string | null
  yearsExperience?: string | null
  studentsTaught?: string | null
  certification?: string | null
  specialisations?: string | null
}


export default function About({
  aboutText,
  teacherName,
  teacherPhotoUrl,
  aboutHeading,
  aboutHeadingSub,
  yearsExperience,
  studentsTaught,
  certification,
  specialisations,
}: AboutProps) {
  const name = teacherName || 'Ashwini Karmbadka'
  const heading = aboutHeading || 'Trained in tradition.'
  const headingSub = aboutHeadingSub || 'Grounded in real life.'
  const years = yearsExperience || null
  const students = studentsTaught || null
  const cert = certification || null
  const specs = specialisations || null

  const stats = [
    years   && { value: years,    label: 'Years of practice & teaching' },
    students && { value: students, label: 'Students taught' },
    specs   && { value: specs,    label: 'Specialisations' },
    cert    && { value: cert,     label: 'RYT Certified' },
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <section className="py-28 section-parchment relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-700 via-marigold-400 to-kumkum-500" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl border border-marigold-400/25 pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full border-2 border-kumkum-400/15 pointer-events-none" />

            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-parchment-200">
              {teacherPhotoUrl ? (
                <>
                  <img src={teacherPhotoUrl} alt={name} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-ink/20 text-sm text-center px-8">Photo not uploaded yet.<br />Add it in Admin → Settings.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">The teacher</p>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink tracking-tight mb-8 leading-tight">
              {heading}<br />
              <span className="italic font-normal text-ink/60">{headingSub}</span>
            </h2>

            {aboutText ? (
              <div className="space-y-5">
                {aboutText.split('\n\n').map((para, i) => (
                  <p key={i} className="text-ink/60 leading-[1.8] text-[1.05rem]">{para}</p>
                ))}
              </div>
            ) : (
              <p className="text-ink/30 italic">Bio not written yet. Add it in Admin → Settings → About Text.</p>
            )}

            {stats.length > 0 && (
              <div className={`mt-10 grid gap-6 border-t border-parchment-300 pt-10`} style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)` }}>
                {stats.map(s => (
                  <div key={s.label}>
                    <p className="text-xl font-display font-semibold text-terracotta-400 leading-snug">{s.value}</p>
                    <p className="text-xs text-ink/35 mt-1.5 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
    </section>
  )
}
