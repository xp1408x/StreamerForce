import { createStaticClient } from "@/lib/supabase/server"
import { getAllStreamerSlugs } from "@/lib/products"

export async function generateStaticParams() {
  const slugs = await getAllStreamerSlugs()
  return slugs.map((slug) => ({ slug }))
}
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Heart, ExternalLink } from "lucide-react"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function StreamerPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createStaticClient()

  const { data: streamerData } = await supabase.from("streamers").select(`
    *,
    stream_schedules(start_slot, end_slot, is_active),
    streamer_socials(platform, url)
  `).eq("slug", slug).single()

  if (!streamerData) {
    notFound()
  }

  // Transform data
  const schedule: Record<string, string> = {}
  streamerData.stream_schedules?.forEach((s: any) => {
    if (s.is_active) {
      schedule[`slot_${s.start_slot}`] = `Slot ${s.start_slot}-${s.end_slot}`
    }
  })

  const socialLinks: Record<string, string> = {}
  streamerData.streamer_socials?.forEach((s: any) => {
    socialLinks[s.platform] = s.url
  })

  const streamer = {
    ...streamerData,
    stream_schedule: schedule,
    social_links: socialLinks
  }

  const daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-accent/20">
          {streamer.banner_url && (
            <Image
              src={streamer.banner_url || "/placeholder.svg"}
              alt={`${streamer.name} banner`}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
                    {streamer.avatar_url ? (
                      <Image
                        src={streamer.avatar_url || "/placeholder.svg"}
                        alt={streamer.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
                    )}
                  </div>
                  <h1 className="text-2xl font-bold">{streamer.name}</h1>
                </div>

                {/* Social Links */}
                {socialLinks && (
                  <div className="space-y-2 mb-6">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <Button
                        key={platform}
                        variant="outline"
                        className="w-full justify-start gap-2 bg-transparent"
                        asChild
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Support Button */}
                {streamer.donation_link && (
                  <Button className="w-full gap-2" size="lg" asChild>
                    <a href={streamer.donation_link} target="_blank" rel="noopener noreferrer">
                      <Heart className="h-4 w-4" />
                      Apoyar al Streamer
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre {streamer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {streamer.description || "Sin descripción disponible."}
                </p>
              </CardContent>
            </Card>

            {/* Schedule */}
            {schedule && Object.keys(schedule).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horario de Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daysOrder
                      .filter((day) => schedule[day])
                      .map((day) => (
                        <div key={day} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium capitalize">{day}</span>
                          <Badge variant="secondary">{schedule[day]}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
