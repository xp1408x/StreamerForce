"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"

export function ClientServerFilter({ servers }: { servers: any[] }) {
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSelected(params.get('server'))
    const onPop = () => setSelected(new URLSearchParams(window.location.search).get('server'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function setServer(server: string | null) {
    const url = new URL(window.location.href)
    if (server) url.searchParams.set('server', server)
    else url.searchParams.delete('server')
    history.pushState(null, '', url.toString())
    setSelected(server)
  }

  return (
    <>
      <Badge variant={!selected ? 'default' : 'outline'} className="cursor-pointer" asChild>
        <button onClick={() => setServer(null)}>Todos</button>
      </Badge>
      {servers.map((server) => (
        <Badge key={server.id} variant={selected === server.id ? 'default' : 'outline'} className="cursor-pointer" asChild>
          <button onClick={() => setServer(server.id)}>{server.name}</button>
        </Badge>
      ))}
    </>
  )
}

export function ClientProductsByServer({ servers, products }: { servers: any[]; products: any[] }) {
  const [serverId, setServerId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setServerId(params.get('server'))
    const onPop = () => setServerId(new URLSearchParams(window.location.search).get('server'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const byServer = React.useMemo(() => {
    const grouped: Record<string, any[]> = {}
    ;(products || []).forEach((p: any) => {
      const sid = p.server_id
      if (!grouped[sid]) grouped[sid] = []
      grouped[sid].push(p)
    })
    return grouped
  }, [products])

  if (!products || products.length === 0) {
    return <div className="text-center py-12">No hay productos disponibles</div>
  }

  if (serverId) {
    const server = servers?.find((s) => s.id === serverId)
    const serverProducts = byServer[serverId] || []
    return (
      <div key={serverId} className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">{server?.name || 'Servidor'}</h2>
          <div className="text-xs text-muted-foreground">{server?.game_type}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serverProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {Object.entries(byServer).map(([serverId, serverProducts]) => {
        const server = servers?.find((s) => s.id === serverId)
        if (!server) return null
        return (
          <div key={serverId} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{server.name}</h2>
              <div className="text-xs text-muted-foreground">{server.game_type}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {serverProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
