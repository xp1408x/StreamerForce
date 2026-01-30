import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Server } from "lucide-react"

interface GameServer {
  id: string
  name: string
  game_type: string
  status: string
  description: string | null
  server_ip: string | null
  max_players: number | null
  current_players: number | null
  image_url: string | null
}

export function ServerCard({ server }: { server: GameServer }) {
  const statusConfig = {
    active: { label: "Activo", color: "bg-green-500/20 text-green-400 border-green-500/50" },
    coming_soon: { label: "Próximamente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    maintenance: { label: "Mantenimiento", color: "bg-red-500/20 text-red-400 border-red-500/50" },
  }

  const currentStatus = statusConfig[server.status as keyof typeof statusConfig]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardHeader className="p-0">
        <div className="relative h-48">
          {server.image_url ? (
            <Image
              src={server.image_url || "/placeholder.svg"}
              alt={server.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}
          <div className="absolute top-4 right-4">
            <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">{server.name}</h3>
          <Badge variant="outline" className="uppercase text-xs">
            {server.game_type}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {server.description || "Sin descripción disponible."}
        </p>

        <div className="flex items-center gap-4 text-sm">
          {server.server_ip && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Server className="h-4 w-4" />
              <code className="text-xs">{server.server_ip.split(":")[0]}</code>
            </div>
          )}
          {server.max_players && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">
                {server.current_players || 0}/{server.max_players}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href={`/servers/${server.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
