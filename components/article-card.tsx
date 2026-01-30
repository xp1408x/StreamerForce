import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author_name: string
  author_avatar: string | null
  category: string | null
  published_at: string | null
}

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const categoryLabels: Record<string, string> = {
    review: "Review",
    news: "Noticia",
    tutorial: "Tutorial",
    opinion: "Opinión",
  }

  if (featured) {
    return (
      <Link href={`/blog/${article.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-[300px]">
              {article.cover_image ? (
                <Image
                  src={article.cover_image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
              )}
              {article.category && (
                <div className="absolute top-4 left-4">
                  <Badge variant="default" className="bg-background/90 backdrop-blur-sm">
                    {categoryLabels[article.category] || article.category}
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-balance group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                {article.excerpt && <p className="text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={article.author_avatar || "/placeholder.svg"} alt={article.author_name} />
                  <AvatarFallback>{article.author_name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{article.author_name}</p>
                  {article.published_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.published_at).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${article.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48">
            {article.cover_image ? (
              <Image
                src={article.cover_image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
            )}
            {article.category && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary">{categoryLabels[article.category] || article.category}</Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">{article.excerpt}</p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.author_avatar || "/placeholder.svg"} alt={article.author_name} />
              <AvatarFallback>{article.author_name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">{article.author_name}</p>
              {article.published_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.published_at).toLocaleDateString("es-ES")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
