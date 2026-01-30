import { createStaticClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckoutForm } from "@/components/checkout-form"
import { Package, Tag, Sparkles } from "lucide-react"
import { getAllProductIds } from "@/lib/products"

export async function generateStaticParams() {
  const productIds = await getAllProductIds()
  return productIds.map((id) => ({ id }))
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createStaticClient()

  const { data: product } = await supabase
    .from("shop_products")
    .select("*, game_servers(name, game_type)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  const metadata = product.metadata as Record<string, unknown> | null
  const server = product.game_servers

  const productTypeLabels: Record<string, string> = {
    membership: "Membresía",
    item: "Item",
    land_claim: "Terreno",
    cosmetic: "Cosmético",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            {product.image_url ? (
              <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{productTypeLabels[product.product_type] || product.product_type}</Badge>
                {server && (
                  <Badge variant="secondary" className="uppercase text-xs">
                    {server.game_type}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {server && <p className="text-muted-foreground">Para: {server.name}</p>}
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold mb-1">${(product.price_in_cents / 100).toFixed(2)} USD</div>
                <p className="text-sm text-muted-foreground">Entrega instantánea en el juego</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>

            {/* Metadata/Features */}
            {metadata && Object.keys(metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Detalles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {Object.entries(metadata).map(([key, value]) => {
                      // Skip arrays (like perks) for now, handle them separately
                      if (Array.isArray(value)) {
                        return (
                          <div key={key} className="grid grid-cols-3 gap-2">
                            <dt className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</dt>
                            <dd className="col-span-2 text-sm">
                              <ul className="list-disc list-inside space-y-1">
                                {value.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                        )
                      }
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <dt className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</dt>
                          <dd className="col-span-2 text-sm font-medium">{String(value)}</dd>
                        </div>
                      )
                    })}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Checkout Form */}
            <CheckoutForm productId={product.id} productName={product.name} gameType={server?.game_type} />
          </div>
        </div>
      </div>
    </div>
  )
}
