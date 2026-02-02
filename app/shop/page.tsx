import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { ClientServerFilter, ClientProductsByServer } from "@/components/shop-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, AlertCircle } from "lucide-react"

interface Product {
  id: string
  server_id: string
  name: string
  description: string
  price_in_cents: number
  product_type: string
  image_url: string | null
  metadata: Record<string, unknown> | null
}

interface Server {
  id: string
  name: string
  game_type: string
}

export const dynamic = "force-dynamic"

export default async function ShopPage() {
  const supabase = await createClient()

  // Get all servers
  const { data: servers } = await supabase.from("game_servers").select("id, name, game_type").order("name")

  // Get all active products at build time. Client-side filtering will handle
  // server-based filtering when the user selects a server.
  const { data: products } = await supabase.from("shop_products").select("*, game_servers(name, game_type)").eq(
    "is_active",
    true,
  )

  // Group products by server
  const productsByServer = products?.reduce(
    (acc, product) => {
      const serverId = product.server_id
      if (!acc[serverId]) {
        acc[serverId] = []
      }
      acc[serverId].push(product)
      return acc
    },
    {} as Record<string, typeof products>,
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Tienda StreamerForce</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Mejora tu experiencia en nuestros servidores. Todos los items se entregan automáticamente en el juego tras
            la compra.
          </p>
        </div>

        {/* Info Alert */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Entrega Automática</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tras completar tu compra, los items aparecerán automáticamente en tu inventario dentro del servidor.
                  Asegúrate de proporcionar tu nombre de usuario correcto en Minecraft.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Filter Pills (client-side) */}
        {servers && servers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <ClientServerFilter servers={servers} />
          </div>
        )}

        {/* Products by Server (client-side filter to allow static export) */}
        <ClientProductsByServer servers={servers || []} products={products || []} />

        {(!products || products.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay productos disponibles</h3>
              <p className="text-muted-foreground">Vuelve pronto para ver nuevos items en la tienda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
