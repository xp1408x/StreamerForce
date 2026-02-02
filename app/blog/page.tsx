import { createClient } from "@/lib/supabase/server"
import React from 'react'
import { ClientCategoryFilter, ClientArticleGrid } from '@/components/blog-client'
import { ArticleCard } from "@/components/article-card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author_name: string
  author_avatar: string | null
  category: string | null
  tags: string[] | null
  published_at: string | null
}

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const supabase = await createClient()

  // Get all categories and articles (fetch everything at build time). Filtering
  // by category will happen client-side so the page can be fully statically
  // prerendered and still support `?category=` URLs in the browser.
  const { data: allArticles } = await supabase.from("articles").select(`
    *,
    profiles(display_name, avatar_url),
    article_categories(name)
  `).eq("published", true).order("published_at", { ascending: false })

  // Transform data to match interface
  const articles = allArticles?.map(article => ({
    ...article,
    author_name: article.profiles?.display_name || 'Anónimo',
    author_avatar: article.profiles?.avatar_url,
    category: article.article_categories?.name
  })) || []

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))

  const categoryLabels: Record<string, string> = {
    review: "Reviews",
    news: "Noticias",
    tutorial: "Tutoriales",
    opinion: "Opinión",
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Blog StreamerForce</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Noticias, reviews, tutoriales y opinión sobre el mundo de los videojuegos. Tu revista gaming de confianza.
          </p>
        </div>

        {/* Category Filter (client-side filtering to allow static export) */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <ClientCategoryFilter categories={categories} categoryLabels={categoryLabels} />
        </div>

        {/* Articles (rendered, client component will handle filtering) */}
        <ClientArticleGrid articles={articles} />
          {/* Prepare for adding client components below */}

        {(!articles || articles.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay artículos disponibles</h3>
            <p className="text-muted-foreground">Vuelve pronto para leer nuevas publicaciones.</p>
          </div>
        )}
      </div>
    </div>
  )
}


