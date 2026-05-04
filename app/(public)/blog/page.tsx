import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog' }
export const revalidate = 3600

export default async function BlogPage() {
  const supabase = createClient()
  const [{ data: posts }, { data: settings }] = await Promise.all([
    supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }),
    supabase.from('studio_settings').select('blog_page_subtitle, teacher_name').single(),
  ])
  const teacherName = settings?.teacher_name?.split(' ')[0] || 'Ashwini'
  const subtitle = settings?.blog_page_subtitle ||
    `Things ${teacherName} writes when she is not on the mat. Yoga, occasionally. Life between classes, mostly.`

  return (
    <div className="pt-16">
      <div className="section-parchment py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-kumkum-500 via-marigold-400 to-forest-700" />
        <div className="max-w-7xl mx-auto">
          <p className="text-terracotta-400 text-xs font-medium tracking-[0.2em] uppercase mb-4">Notes & thoughts</p>
          <h1 className="text-5xl md:text-6xl font-display font-semibold text-ink tracking-tight mb-5 leading-tight">The blog.</h1>
          <p className="text-xl text-ink/50 max-w-xl leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="section-parchment max-w-7xl mx-auto px-6 md:px-12 py-16">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="card-base overflow-hidden hover:border-marigold-400/50 transition-colors">
                  {post.cover_image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-ink/30 mb-2">
                      {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                    </p>
                    <h2 className="text-lg font-display font-semibold text-ink mb-2 group-hover:text-marigold-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-ink/50 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}
                    <p className="mt-4 text-sm text-terracotta-400 font-medium group-hover:underline">Read more →</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-ink/30 text-lg font-display">No posts yet.</p>
            <p className="text-ink/25 text-sm mt-2">Check back soon for reflections and insights.</p>
          </div>
        )}
      </div>
    </div>
  )
}
