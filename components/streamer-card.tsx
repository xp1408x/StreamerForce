import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface Streamer {
  id: string
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  stream_schedule: Record<string, string> | null
}

export function StreamerCard({ streamer }: { streamer: Streamer }) {
  const schedule = streamer.stream_schedule as Record<string, string> | null
  const nextStream = schedule ? Object.keys(schedule)[0] : null

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {streamer.avatar_url ? (
            <Image
              src={streamer.avatar_url || "/placeholder.svg"}
              alt={streamer.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2">{streamer.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {streamer.description || "Sin descripción disponible."}
        </p>

        {nextStream && schedule && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Próximo stream:</span>
            <Badge variant="secondary" className="capitalize">
              {nextStream}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href={`/streamers/${streamer.slug}`}>Ver Perfil</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
