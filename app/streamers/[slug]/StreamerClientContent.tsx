"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation" // <--- Importamos esto
import { createClient } from "@/lib/supabase/client"

export default function StreamerClientContent() { // <--- Quitamos la prop { slug }
  const params = useParams()
  const slug = params?.slug as string // <--- Obtenemos el slug aquí
  
  const [streamer, setStreamer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchStreamer = async () => {
      if (!slug) return;
      
      try {
        const supabase = createClient()
        const { data, error: err } = await supabase
          .from("streamers")
          .select(`
            *,
            stream_schedules(start_slot, end_slot, is_active),
            streamer_socials(platform, url)
          `)
          .eq("slug", slug)
          .single()

        if (err || !data) {
          setError(true)
        } else {
          setStreamer(data)
        }
      } catch (e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStreamer()
  }, [slug])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>No encontrado</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{streamer?.display_name || streamer?.name}</h1>
    </div>
  )
}