import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { formatDate, sanitizeHtml } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('blog_posts').select('title, excerpt').eq('slug', params.slug).single()
  return { title: data?.title, description: data?.excerpt || undefined }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  return (
    <div className="pt-20 min-h-screen bg-parchment-50">
      {post.cover_image_url && (
        <div className="relative h-72 md:h-96">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink/40 hover:text-ink transition-colors mb-8">
          <ChevronLeft size={16} /> All posts
        </Link>

        <p className="text-xs text-terracotta-400 mb-3 tracking-wide">
          {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-ink tracking-tight mb-4 leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-xl text-ink/55 mb-10 leading-relaxed border-b border-parchment-300 pb-10">{post.excerpt}</p>
        )}

        <div
          className="prose-yoga"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content.replace(/\n/g, '<br />')) }}
        />
      </div>
    </div>
  )
}
