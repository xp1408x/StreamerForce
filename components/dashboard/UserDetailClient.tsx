"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, ShieldCheck, ShieldAlert, RotateCcw, Info, User, Lock, Unlock } from 'lucide-react'

export default function UserDetailClient({ id, onClose }: { id: string, onClose: () => void }) {
  const routerRef = useRef(false)
  const supabase = createClient()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [assignablePerms, setAssignablePerms] = useState<any[]>([])
  const [myLevel, setMyLevel] = useState(0)
  const [loading, setLoading] = useState(true)

  // prevent double-fetch in StrictMode/dev by tracking if we've already requested
  const didFetchRef = useRef(false)

  const fetchData = useCallback(async () => {
    if (didFetchRef.current) return
    didFetchRef.current = true

    setLoading(true)
    try {
      const { data: level } = await supabase.rpc('get_my_max_level')
      const myCurrentLevel = level || 0
      setMyLevel(myCurrentLevel)

      const { data: perms } = await supabase.from('permissions')
        .select('id, slug, short_description, description, weight')
        .eq('is_assignable', true)
        .lt('weight', myCurrentLevel)
      setAssignablePerms(perms || [])

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name,
          user_roles(roles(name, role_level))
        `)
        .eq('id', id)
        .single()

      if (profileError || !profile) throw new Error('Usuario no encontrado')

      const { data: modData, error: modError } = await supabase.rpc('get_moderation_data', { p_user_id: id })
      if (modError) console.error('Error cargando permisos de moderación:', modError)

      setUser({ ...profile, moderation_perms: modData || [] })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      onClose()
    } finally {
      setLoading(false)
    }
  }, [id, supabase, toast, onClose])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAction = async (permId: string, action: 'grant' | 'restrict' | 'clear') => {
    const { error: upError } = await supabase
      .from('user_permission_overrides')
      .update({ deleted_at: new Date().toISOString() })
      .match({ user_id: id, permission_id: permId })
      .is('deleted_at', null)

    if (upError) return toast({ title: 'Denegado', description: 'Fallo de jerarquía', variant: 'destructive' })

    if (action !== 'clear') {
      const { error: inError } = await supabase
        .from('user_permission_overrides')
        .insert({ user_id: id, permission_id: permId, is_enabled: action === 'grant' })
      if (inError) return toast({ title: 'Error', description: 'Nivel insuficiente', variant: 'destructive' })
    }

    toast({ title: 'Permiso actualizado correctamente' })
    // allow re-fetch if needed
    didFetchRef.current = false
    fetchData()
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Cargando perfil...</p>
    </div>
  )

  if (!user) return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">No se encontró la información del usuario.</p>
      <div className="mt-4">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  )

  const targetLevel = user.user_roles ? Math.max(...user.user_roles.map((r:any) => r.roles?.role_level || 0), 0) : 0
  const canManage = myLevel > targetLevel

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User size={24} /></div>
            <div>
              <h3 className="text-lg font-bold">{user.display_name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={canManage ? 'outline' : 'destructive'}>Nivel: {targetLevel}</Badge>
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Permisos del Sistema</CardTitle>
              <CardDescription>Visualiza y gestiona las excepciones para este usuario.</CardDescription>
            </CardHeader>
            <CardContent>
              {assignablePerms.map(p => {
                const status = user.moderation_perms?.find((mp:any) => mp.slug === p.slug)
                const isEnabled = status?.is_enabled ?? false
                const isOverride = status?.is_override ?? false
                const hasPerm = !!status

                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card mb-2">
                    <div className="flex items-center gap-3">
                      {hasPerm && isEnabled ? <ShieldCheck className="text-green-500" /> : <ShieldAlert className="text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-bold flex items-center gap-1">
                          {p.short_description}
                          {isOverride && (
                            <Tooltip>
                              <TooltipTrigger><Info size={12} className="text-yellow-500"/></TooltipTrigger>
                              <TooltipContent>Excepción manual aplicada</TooltipContent>
                            </Tooltip>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{p.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {!canManage ? (
                        <Lock size={16} className="text-muted-foreground mr-2" />
                      ) : (
                        <>
                          {isOverride ? (
                            <Button size="icon" variant="outline" className="h-8 w-8 text-yellow-600" onClick={() => handleAction(p.id, 'clear')}>
                              <RotateCcw size={14} />
                            </Button>
                          ) : hasPerm ? (
                            <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleAction(p.id, 'restrict')}>
                              <Unlock size={14} />
                            </Button>
                          ) : (
                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600" onClick={() => handleAction(p.id, 'grant')}>
                              <Lock size={14} />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
