
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

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&q=80'
const DEFAULT_ABOUT = `Ashwini has been teaching yoga for over a decade — in Bengaluru studios, in Puttur backyards, and occasionally on rooftops when the weather allowed.

Her approach is rooted in classical Hatha but she moves fluidly into Vinyasa when the room calls for it. Alignment matters. So does breath. So does showing up on the days you don't feel like it.

She won't flatter bad posture, but she will meet you exactly where you are.`

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
  const photo = teacherPhotoUrl || DEFAULT_PHOTO
  const heading = aboutHeading || 'Trained in tradition.'
  const headingSub = aboutHeadingSub || 'Grounded in real life.'
  const years = yearsExperience || '15+'
  const students = studentsTaught || '400+'
  const cert = certification || '200hr'
  const specs = specialisations || 'Hatha & Vinyasa'

  const stats = [
    { value: students, label: 'Students taught' },
    { value: specs, label: 'Specialisations' },
    { value: cert, label: 'RYT Certified' },
  ]

  return (
    <section className="py-28 section-parchment relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-700 via-marigold-400 to-kumkum-500" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl border border-marigold-400/25 pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full border-2 border-kumkum-400/15 pointer-events-none" />

            <div className="aspect-[4/5] relative rounded-3xl overflow-hidden">
              <img
                src={photo}
                alt={name}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
            </div>

            <div className="absolute -bottom-5 -right-5 glass-light rounded-2xl px-5 py-4 shadow-lg border border-parchment-300">
              <p className="text-2xl font-display font-semibold text-ink">{years}</p>
              <p className="text-xs text-ink/40 mt-0.5">years of practice & teaching</p>
            </div>
          </div>

          <div>
            <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">The teacher</p>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-ink tracking-tight mb-8 leading-tight">
              {heading}<br />
              <span className="italic font-normal text-ink/60">{headingSub}</span>
            </h2>

            <div className="space-y-5">
              {(aboutText || DEFAULT_ABOUT).split('\n\n').map((para, i) => (
                <p key={i} className="text-ink/60 leading-[1.8] text-[1.05rem]">{para}</p>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-parchment-300 pt-10">
              {stats.map(s => (
                <div key={s.label}>
                  <p className="text-xl font-display font-semibold text-terracotta-400 leading-snug">{s.value}</p>
                  <p className="text-xs text-ink/35 mt-1.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
    </section>
  )
}
