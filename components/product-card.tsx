import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price_in_cents: number
  product_type: string
  image_url: string | null
}

export function ProductCard({ product }: { product: Product }) {
  const productTypeLabels: Record<string, string> = {
    membership: "Membresía",
    item: "Item",
    land_claim: "Terreno",
    cosmetic: "Cosmético",
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">{productTypeLabels[product.product_type] || product.product_type}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1">
        <h3 className="text-lg font-bold mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{product.description}</p>
        <div className="text-2xl font-bold text-primary">${(product.price_in_cents / 100).toFixed(2)}</div>
      </CardContent>

      <CardFooter>
        <Button variant="default" className="w-full" asChild>
          <Link href={`/shop/${product.id}`}>Comprar Ahora</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
