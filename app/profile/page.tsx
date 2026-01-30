"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(profileData)

      const { data: userRoles } = await supabase
        .from("user_roles")
        .select(`
          roles(name)
        `)
        .eq("user_id", user.id)

      const rolesList = userRoles?.map(ur => ur.roles?.name).filter(Boolean) || []
      setRoles(rolesList)

      setLoading(false)
    }

    getProfile()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>
              Gestiona tu información personal y roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || ""} />
                <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profile?.display_name || 'Usuario'}</h2>
                <p className="text-muted-foreground">@{profile?.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Información de la Cuenta</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Miembro desde:</strong> {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                <p><strong>Email confirmado:</strong> {user.email_confirmed_at ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}