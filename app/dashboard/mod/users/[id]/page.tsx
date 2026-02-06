'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, ArrowLeft, ShieldCheck, ShieldAlert, 
  RotateCcw, Info, User, Lock, Unlock 
} from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [assignablePerms, setAssignablePerms] = useState<any[]>([]);
  const [myLevel, setMyLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener mi nivel jerárquico
      const { data: level } = await supabase.rpc('get_my_max_level');
      const myCurrentLevel = level || 0;
      setMyLevel(myCurrentLevel);

      // 2. Obtener permisos que puedo asignar (los que pesan menos que yo)
      const { data: perms } = await supabase.from('permissions')
        .select('id, slug, short_description, description, weight')
        .eq('is_assignable', true)
        .lt('weight', myCurrentLevel);
      setAssignablePerms(perms || []);

      // 3. Obtener datos básicos del usuario objetivo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name,
          user_roles(roles(name, role_level))
        `)
        .eq('id', id)
        .single();

      if (profileError || !profile) {
        throw new Error("Usuario no encontrado");
      }

      // 4. Obtener datos de moderación vía RPC (Evita error 400 en .select)
      const { data: modData, error: modError } = await supabase
        .rpc('get_moderation_data', { p_user_id: id });

      if (modError) console.error("Error cargando permisos de moderación:", modError);

      // Consolidar datos
      setUser({
        ...profile,
        moderation_perms: modData || []
      });

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      router.push('/dashboard/mod/users');
    } finally {
      setLoading(false);
    }
  }, [id, supabase, toast, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (permId: string, action: 'grant' | 'restrict' | 'clear') => {
    // 1. Limpiar overrides existentes
    const { error: upError } = await supabase
      .from('user_permission_overrides')
      .update({ deleted_at: new Date().toISOString() })
      .match({ user_id: id, permission_id: permId })
      .is('deleted_at', null);

    if (upError) return toast({ title: "Denegado", description: "Fallo de jerarquía", variant: "destructive" });

    // 2. Insertar nueva regla si no es 'clear'
    if (action !== 'clear') {
      const { error: inError } = await supabase
        .from('user_permission_overrides')
        .insert({
          user_id: id,
          permission_id: permId,
          is_enabled: action === 'grant'
        });
      if (inError) return toast({ title: "Error", description: "Nivel insuficiente", variant: "destructive" });
    }

    toast({ title: "Permiso actualizado correctamente" });
    fetchData(); // Refrescar estado completo
  };

  // --- RENDERS CONDICIONALES ---

  // 1. Mientras carga, mostramos un spinner limpio
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando perfil de usuario...</p>
      </div>
    );
  }

  // 2. Si no hay usuario (y ya terminó de cargar), mostramos error
  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">No se encontró la información del usuario.</p>
        <Button onClick={() => router.back()}>Volver atrás</Button>
      </div>
    );
  }

  // 3. Render principal (Aquí user ya es seguro y no es null)
  const targetLevel = user.user_roles 
    ? Math.max(...user.user_roles.map((r: any) => r.roles?.role_level || 0), 0)
    : 0;

  const canManage = myLevel > targetLevel;

  return (
    <TooltipProvider>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
        </Button>

        {/* Cabecera del Usuario */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-xl border">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.display_name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="flex gap-2 mt-2">
                {user.user_roles?.map((ur: any) => (
                  <Badge key={ur.roles.name} variant="secondary">{ur.roles.name}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right w-full md:w-auto">
            <Badge variant={canManage ? "outline" : "destructive"} className="px-4 py-1">
              Nivel de Seguridad: {targetLevel}
            </Badge>
            {!canManage && <p className="text-[10px] text-destructive mt-1 font-bold uppercase tracking-wider">Rango Superior o Igual</p>}
          </div>
        </div>

        {/* Sección de Permisos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Permisos del Sistema</CardTitle>
              <CardDescription>Visualiza y gestiona las excepciones para este usuario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignablePerms.map(p => {
                const status = user.moderation_perms?.find((mp: any) => mp.slug === p.slug);
                const isEnabled = status?.is_enabled ?? false;
                const isOverride = status?.is_override ?? false;
                const hasPerm = !!status;

                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
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
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Acceso</CardTitle>
              <CardDescription>Cómo ve el sistema a este usuario actualmente.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Slugs Activos:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.moderation_perms?.filter((p:any) => p.is_enabled).map((p: any) => (
                      <Badge key={p.slug} variant="default">{p.slug}</Badge>
                    ))}
                    {user.moderation_perms?.filter((p:any) => p.is_enabled).length === 0 && <p className="text-sm italic">Ninguno</p>}
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}