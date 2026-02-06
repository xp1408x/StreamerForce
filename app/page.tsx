import { createClient } from "@/lib/supabase/server"
import { CTASection } from "@/components/cta-section"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerCard } from "@/components/server-card"
import { StreamerCard } from "@/components/streamer-card"
import { ArticleCard } from "@/components/article-card"
import { Gamepad2, Server, Users, BookOpen, ShoppingBag, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()

  // Iniciar las consultas en paralelo para evitar waterfalls
  const serversP = supabase.from("game_servers").select("*").eq("status", "active").limit(3)
  const streamersP = supabase.from("streamers").select("*").limit(3)
  const articlesP = supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3)

  const [serversRes, streamersRes, articlesRes] = await Promise.all([serversP, streamersP, articlesP])

  const servers = serversRes?.data
  const streamers = streamersRes?.data
  const articles = articlesRes?.data

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Bienvenido a <span className="text-primary">StreamerForce</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
              Tu comunidad gaming definitiva. Servidores, streamers, tienda y revista. Todo en un solo lugar.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/servers">
                  <Server className="mr-2 h-5 w-5" />
                  Ver Servidores
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/streamers">
                  <Users className="mr-2 h-5 w-5" />
                  Conocer Streamers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Server className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Servidores de Juegos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Minecraft, Valheim, L4D2 y más. Únete a nuestra comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Streamers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Apoya a tus creadores favoritos y únete a sus streams en vivo.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Tienda</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mejora tu experiencia con items y membresías exclusivas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Revista Gaming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Noticias, reviews y tutoriales del mundo gamer.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Servers */}
      {servers && servers.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Servidores Activos</h2>
                  <p className="text-muted-foreground">Únete ahora y comienza a jugar</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/servers">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Streamers */}
      {streamers && streamers.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Nuestros Streamers</h2>
                  <p className="text-muted-foreground">Conoce a los creadores de contenido</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/streamers">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streamers.map((streamer) => (
                  <StreamerCard key={streamer.id} streamer={streamer} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {articles && articles.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Últimos Artículos</h2>
                  <p className="text-muted-foreground">Lo más reciente de nuestra revista</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/blog">
                    Ver Todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section (client-side: will check session on interaction) */}
      <CTASection />
    </div>
  )
}
