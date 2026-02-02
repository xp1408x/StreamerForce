import { createClient } from "@/lib/supabase/server"
import { StreamerCard } from "@/components/streamer-card"

interface Streamer {
  id: string
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  banner_url: string | null
  stream_schedule: Record<string, string> | null
  social_links: Record<string, string> | null
  donation_link: string | null
}

export const dynamic = "force-dynamic"

export default async function StreamersPage() {
  const supabase = await createClient()
  const { data: streamersData } = await supabase.from("streamers").select(`
    *,
    stream_schedules(start_slot, end_slot, is_active),
    streamer_socials(platform, url)
  `).order("name")

  // Transform data to match interface
  const streamers = streamersData?.map(streamer => {
    // Build stream_schedule from stream_schedules
    const schedule: Record<string, string> = {}
    streamer.stream_schedules?.forEach((s: any) => {
      if (s.is_active) {
        // Convert slots to day/time, but for simplicity, just use slots as keys
        schedule[`slot_${s.start_slot}`] = `Slot ${s.start_slot}-${s.end_slot}`
      }
    })

    // Build social_links from streamer_socials
    const social_links: Record<string, string> = {}
    streamer.streamer_socials?.forEach((s: any) => {
      social_links[s.platform] = s.url
    })

    return {
      ...streamer,
      stream_schedule: schedule,
      social_links
    }
  }) || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Nuestros Streamers</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Conoce a los creadores de contenido que forman parte de la familia StreamerForce. Apoya sus streams y únete a
            sus comunidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streamers?.map((streamer: Streamer) => (
            <StreamerCard key={streamer.id} streamer={streamer} />
          ))}
        </div>
      </div>
    </div>
  )
}
