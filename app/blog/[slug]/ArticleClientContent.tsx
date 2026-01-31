"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Tag, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ArticleClientContent() {
  const { slug } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const supabase = createClient()
        const { data: articleData, error: err } = await supabase.from("articles").select(`
          *,
          profiles(display_name, avatar_url),
          article_categories(name)
        `).eq("slug", slug).eq("published", true).single()

        if (err || !articleData) {
          setError(true)
          setLoading(false)
          return
        }

        const transformedArticle = {
          ...articleData,
          author_name: articleData.profiles?.display_name || 'Anónimo',
          author_avatar: articleData.profiles?.avatar_url,
          category: articleData.article_categories?.name
        }

        setArticle(transformedArticle)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching article:", err)
        setError(true)
        setLoading(false)
      }
    }

    if (slug) fetchArticle()
  }, [slug])

  if (loading) return <div className="container mx-auto px-4 py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Artículo no encontrado</h1>
      </div>
    )
  }

  const tags = article.tags as string[] | null
  const categoryLabels: Record<string, string> = {
    review: "Review",
    news: "Noticia",
    tutorial: "Tutorial",
    opinion: "Opinión",
  }

  const wordCount = article.content?.split(/\s+/).length || 0
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="default">{categoryLabels[article.category] || article.category}</Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readingTime} min de lectura
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{article.title}</h1>

          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-12 w-12">
              <AvatarImage src={article.author_avatar || "/placeholder.svg"} alt={article.author_name} />
              <AvatarFallback>{article.author_name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{article.author_name}</p>
              {article.published_at && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.published_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {article.cover_image && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
            <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div className="whitespace-pre-wrap leading-relaxed">{article.content}</div>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex items-start gap-3 py-6 border-t border-border">
            <Tag className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            ← Volver al Blog
          </Link>
        </div>
      </div>
    </article>
  )
}