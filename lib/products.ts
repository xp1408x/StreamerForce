export interface Product {
  id: string
  server_id: string
  name: string
  description: string
  price_in_cents: number
  product_type: string
  game_command: string | null
  image_url: string | null
  metadata: Record<string, unknown> | null
}

import { createStaticClient } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"

export async function getAllProductIds(): Promise<string[]> {
  const supabase = createStaticClient()

  const { data, error } = await supabase
    .from("shop_products")
    .select("id")
    .eq("is_active", true)

  if (error || !data) return []

  return data.map((product) => product.id)
}

export async function getAllStreamerSlugs(): Promise<string[]> {
  const supabase = createStaticClient()

  const { data, error } = await supabase.from("streamers").select("slug")

  if (error || !data) return []

  return data.map((streamer) => streamer.slug)
}

// This will be fetched from Supabase, but we define the interface here
export async function getProductFromDatabase(productId: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return data as Product
}
