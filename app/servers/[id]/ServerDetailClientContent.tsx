"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Server, Package, CheckCircle2, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

interface Roadmap {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  estimated_date: string | null
  completed_date: string | null
}

export default function ServerDetailClientContent() {
  const { id } = useParams()
  const [server, setServer] = useState<any>(null)
  const [roadmapItems, setRoadmapItems] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const supabase = createClient()
        const { data: serverData, error: err } = await supabase
          .from("game_servers")
          .select("*")
          .eq("id", id)
          .single()

        if (err || !serverData) {
          setError(true)
          setLoading(false)
          return
        }

        const { data: roadmaps } = await supabase
          .from("server_roadmaps")
          .select("*")
          .eq("server_id", id)
          .order("status", { ascending: false })
          .order("priority", { ascending: false })

        setServer(serverData)
        setRoadmapItems(roadmaps || [])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching server:", err)
        setError(true)
        setLoading(false)
      }
    }

    if (id) fetchServer()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !server) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Servidor no encontrado</h1>
          <p className="text-muted-foreground">Lo sentimos, no pudimos encontrar este servidor.</p>
        </div>
      </div>
    )
  }

  const features = server.features as string[] | null

  const statusConfig = {
    active: { label: "Activo", color: "bg-green-500/20 text-green-400 border-green-500/50" },
    coming_soon: { label: "Próximamente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    maintenance: { label: "Mantenimiento", color: "bg-red-500/20 text-red-400 border-red-500/50" },
  }

  const currentStatus = statusConfig[server.status as keyof typeof statusConfig] || statusConfig.coming_soon

  const roadmapStatusConfig = {
    completed: { icon: CheckCircle2, label: "Completado", color: "text-green-500" },
    in_progress: { icon: Loader2, label: "En Progreso", color: "text-yellow-500" },
    planned: { icon: Clock, label: "Planeado", color: "text-muted-foreground" },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
          {server.image_url ? (
            <Image src={server.image_url} alt={server.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold">{server.name}</h1>
              <Badge className={currentStatus.color}>{currentStatus.label}</Badge>
            </div>
            <p className="text-muted-foreground uppercase text-sm tracking-wide">{server.game_type}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Sobre el Servidor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {server.description || "Sin descripción disponible."}
                </p>
              </CardContent>
            </Card>

            {features && features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {roadmapItems && roadmapItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Roadmap de Actualizaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roadmapItems.map((item: Roadmap) => {
                      const statusInfo =
                        roadmapStatusConfig[item.status as keyof typeof roadmapStatusConfig] ||
                        roadmapStatusConfig.planned
                      const StatusIcon = statusInfo.icon

                      return (
                        <div key={item.id} className="p-4 rounded-lg border border-border bg-card">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                              <h4 className="font-semibold">{item.title}</h4>
                            </div>
                            <Badge
                              variant={
                                item.priority === "high"
                                  ? "destructive"
                                  : item.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Media" : "Baja"}
                            </Badge>
                          </div>
                          {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className={statusInfo.color}>{statusInfo.label}</span>
                            {item.estimated_date && (
                              <span>Estimado: {new Date(item.estimated_date).toLocaleDateString("es-ES")}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Servidor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {server.server_ip && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Dirección IP</span>
                    </div>
                    <code className="text-sm font-mono font-semibold">{server.server_ip}</code>
                  </div>
                )}
                {server.version && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Versión</span>
                    </div>
                    <p className="text-sm font-semibold">{server.version}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Mejora tu Experiencia</h3>
                <Button className="w-full" asChild>
                  <Link href={`/shop?server=${server.id}`}>Ir a la Tienda</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}