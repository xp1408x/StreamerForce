"use client"

import { useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
// For static export we call the remote backend directly (it should expose an endpoint
// to create a Stripe checkout session). Configure the backend URL with
// NEXT_PUBLIC_BACKEND_URL (e.g. https://api.tusitio.com).
async function startCheckoutSessionClient(productId: string, minecraftUsername?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!apiUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set")

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, minecraftUsername }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create checkout session: ${res.status} ${text}`)
  }

  const data = await res.json()
  // Backend should return { client_secret: string }
  return data.client_secret
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  productId: string
  productName: string
  gameType?: string
}

export function CheckoutForm({ productId, productName, gameType }: CheckoutFormProps) {
  const [minecraftUsername, setMinecraftUsername] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleStartCheckout = async () => {
    if (gameType === "minecraft" && !minecraftUsername.trim()) {
      setError("Por favor ingresa tu nombre de usuario de Minecraft")
      return
    }

    try {
      setError(null)
      const secret = await startCheckoutSessionClient(productId, minecraftUsername)
      setClientSecret(secret)
      setShowCheckout(true)
    } catch (err) {
      setError("Error al iniciar el proceso de pago. Por favor intenta de nuevo.")
      console.error(err)
    }
  }

  if (paymentStatus === "success") {
    return (
      <Card className="bg-green-500/10 border-green-500/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Pago Completado</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu compra de <strong>{productName}</strong> ha sido procesada exitosamente. El item aparecerá en tu
                inventario dentro del servidor en los próximos minutos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showCheckout && clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completar Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              clientSecret,
              onComplete: async () => {
                setPaymentStatus("processing")
                // Give Stripe a moment to process
                setTimeout(async () => {
                  setPaymentStatus("success")
                }, 2000)
              },
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprar Producto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameType === "minecraft" && (
          <div className="space-y-2">
            <Label htmlFor="minecraft-username">Nombre de Usuario en Minecraft</Label>
            <Input
              id="minecraft-username"
              type="text"
              placeholder="TuNombreEnMinecraft"
              value={minecraftUsername}
              onChange={(e) => setMinecraftUsername(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ingresa tu nombre de usuario exacto para recibir el item en el juego
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button onClick={handleStartCheckout} className="w-full" size="lg">
          Proceder al Pago
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Pago seguro procesado por Stripe. Entrega automática tras confirmación.
        </p>
      </CardContent>
    </Card>
  )
}
