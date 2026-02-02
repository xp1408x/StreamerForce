import { createClient } from "@/lib/supabase/server"
import { ServerCard } from "@/components/server-card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

interface GameServer {
  id: string
  name: string
  game_type: string
  status: string
  description: string | null
  server_ip: string | null
  version: string | null
  max_players: number | null
  current_players: number | null
  image_url: string | null
  features: string[] | null
}

export default async function ServersPage() {
  const supabase = await createClient()
  
  const { data: serversData, error } = await supabase
    .from("game_servers")
    .select("*")
    .order("status", { ascending: false })
    .order("name")

  const servers = (serversData || []) as GameServer[]
  const activeServers = servers.filter((s) => s.status === "active")
  const comingSoonServers = servers.filter((s) => s.status === "coming_soon")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Nuestros Servidores</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Únete a nuestros servidores de juegos y forma parte de una comunidad activa.
          </p>
        </div>

        {/* Active Servers */}
        {activeServers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Servidores Activos</h2>
              <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/50">
                En Línea
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Servers */}
        {comingSoonServers.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Próximamente</h2>
              <Badge variant="secondary">En Desarrollo</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
