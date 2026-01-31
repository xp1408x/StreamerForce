"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"

export function CTASection() {
  const [hidden, setHidden] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (mounted && user) {
          setHidden(true)
        }
      } catch (err) {
        // ignore
      }
    }

    checkUser()
    return () => { mounted = false }
  }, [supabase])

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // If already logged in, hide CTA and redirect to profile
      setHidden(true)
      router.push("/profile")
      return
    }

    // Not logged in: go to signup
    router.push("/auth/sign-up")
  }

  if (hidden) return null

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Gamepad2 className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-4">¿Listo para unirte?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Forma parte de la comunidad StreamerForce. Juega, conecta y disfruta con otros gamers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={handleCreate}>
              Crear Cuenta
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/shop">Visitar Tienda</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
