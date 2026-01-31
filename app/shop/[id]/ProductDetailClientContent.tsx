"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckoutForm } from "@/components/checkout-form"
import { Package, Tag, Sparkles, Loader2 } from "lucide-react"

export default function ProductDetailClientContent() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [server, setServer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createClient()
        const { data: productData, error: err } = await supabase
          .from("shop_products")
          .select("*, game_servers(name, game_type)")
          .eq("id", id)
          .eq("is_active", true)
          .single()

        if (err || !productData) {
          setError(true)
          setLoading(false)
          return
        }

        setProduct(productData)
        setServer(productData.game_servers)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(true)
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
      </div>
    )
  }

  const metadata = product.metadata as Record<string, unknown> | null
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
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{productTypeLabels[product.product_type] || product.product_type}</Badge>
                {server && <Badge variant="secondary" className="uppercase text-xs">{server.game_type}</Badge>}
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
              <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />Descripción</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{product.description}</p></CardContent>
            </Card>

            {metadata && Object.keys(metadata).length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Detalles</CardTitle></CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {Object.entries(metadata).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <dt className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</dt>
                        <dd className="col-span-2 text-sm font-medium">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            <CheckoutForm productId={product.id} productName={product.name} gameType={server?.game_type} />
          </div>
        </div>
      </div>
    </div>
  )
}