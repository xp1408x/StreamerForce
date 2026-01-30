"use server"

import { stripe } from "@/lib/stripe"
import { getProductFromDatabase } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string, minecraftUsername?: string) {
  const product = await getProductFromDatabase(productId)

  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price_in_cents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      product_id: productId,
      user_id: user?.id || "anonymous",
      minecraft_username: minecraftUsername || "",
      game_command: product.game_command || "",
    },
  })

  // Record purchase in database
  if (user) {
    await supabase.from("purchases").insert({
      user_id: user.id,
      product_id: productId,
      stripe_session_id: session.id,
      amount_paid: product.price_in_cents,
      status: "pending",
      minecraft_username: minecraftUsername,
    })
  }

  return session.client_secret
}

export async function checkPaymentStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === "paid") {
    const supabase = await createClient()

    // Update purchase status
    await supabase.from("purchases").update({ status: "completed" }).eq("stripe_session_id", sessionId)

    return { success: true, metadata: session.metadata }
  }

  return { success: false }
}
