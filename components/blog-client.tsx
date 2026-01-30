"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"
import { ArticleCard } from "@/components/article-card"

export function ClientCategoryFilter({ categories, categoryLabels }: { categories: string[]; categoryLabels: Record<string, string> }) {
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSelected(params.get('category'))
    const onPop = () => setSelected(new URLSearchParams(window.location.search).get('category'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function setCategory(category: string | null) {
    const url = new URL(window.location.href)
    if (category) {
      url.searchParams.set('category', category)
    } else {
      url.searchParams.delete('category')
    }
    history.pushState(null, '', url.toString())
    setSelected(category)
  }

  return (
    <>
      <Badge variant={!selected ? 'default' : 'outline'} className="cursor-pointer" asChild>
        <button onClick={() => setCategory(null)}>Todos</button>
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selected === category ? 'default' : 'outline'}
          className="cursor-pointer"
          asChild
        >
          <button onClick={() => setCategory(category)}>{categoryLabels[category] || category}</button>
        </Badge>
      ))}
    </>
  )
}

export function ClientArticleGrid({ articles }: { articles: any[] }) {
  const [category, setCategory] = React.useState<string | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCategory(params.get('category'))
    const onPop = () => setCategory(new URLSearchParams(window.location.search).get('category'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const filtered = React.useMemo(() => {
    if (!category) return articles
    return articles.filter((a) => String(a.category) === category)
  }, [articles, category])

  if (!filtered || filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay artículos disponibles</h3>
        <p className="text-muted-foreground">Vuelve pronto para leer nuevas publicaciones.</p>
      </div>
    )
  }

  return (
    <>
      {/* Featured if no category */}
      {!category && (
        <div className="mb-12">
          <ArticleCard article={filtered[0]} featured />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(category ? 0 : 1).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  )
}
