// app/dashboard/mod/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export default function ModUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [assignablePerms, setAssignablePerms] = useState<any[]>([]);
  const [myLevel, setMyLevel] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const loadCoreData = async () => {
      // 1. Mi nivel y permisos asignables
      const { data: level } = await supabase.rpc('get_my_max_level');
      setMyLevel(level || 0);

      const { data: perms } = await supabase.from('permissions')
        .select('id, slug, description, short_description, weight')
        .eq('is_assignable', true)
        .lt('weight', level || 0);
      setAssignablePerms(perms || []);
      
      fetchUsers();
    };
    loadCoreData();
  }, [searchTerm]);

  const fetchUsers = async () => {
    // Solo traemos lo mínimo del perfil
    const { data } = await supabase.from('profiles')
      .select(`
        id, username, display_name,
        user_roles(roles(role_level))
      `)
      .ilike('username', `%${searchTerm}%`)
      .limit(10);

    if (data) {
      // Para cada usuario, traemos sus permisos finales usando la nueva función RPC
      const usersWithPerms = await Promise.all(data.map(async (u) => {
        const { data: activePerms } = await supabase.rpc('get_user_permissions', { p_user_id: u.id });
        return { ...u, activePerms: activePerms?.map((ap: any) => ap.slug) || [] };
      }));
      setUsers(usersWithPerms);
    }
  };

  const handleAction = async (targetId: string, permId: string, action: 'grant' | 'restrict' | 'clear') => {
    // 1. Limpiar overrides anteriores para ese permiso
    await supabase.from('user_permission_overrides')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', targetId)
      .eq('permission_id', permId)
      .is('deleted_at', null);

    // 2. Si no es "clear", insertar el nuevo
    if (action !== 'clear') {
      const { error } = await supabase.from('user_permission_overrides').insert({
        user_id: targetId,
        permission_id: permId,
        is_enabled: action === 'grant'
      });
      
      if (error) return toast({ title: "Error", description: "RLS: Nivel insuficiente", variant: "destructive" });
    }

    toast({ title: "Actualizado" });
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Permisos</CardTitle>
          <Input placeholder="Buscar por username..." onChange={(e) => setSearchTerm(e.target.value)} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Permisos Actuales</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const targetLevel = Math.max(...u.user_roles.map((r: any) => r.roles.role_level), 0);
                const canManage = myLevel > targetLevel;

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-bold">{u.display_name}</div>
                      <div className="text-xs text-muted-foreground">@{u.username}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.activePerms.map((p: string) => (
                          <span key={p} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select disabled={!canManage} onValueChange={(val) => {
                        const [pId, act] = val.split(':');
                        handleAction(u.id, pId, act as any);
                      }}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Modificar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignablePerms.map(p => (
                            <React.Fragment key={p.id}>
                              <SelectItem value={`${p.id}:grant`}>🟢 Otorgar {p.slug}</SelectItem>
                              <SelectItem value={`${p.id}:restrict`}>🔴 Restringir {p.slug}</SelectItem>
                              <SelectItem value={`${p.id}:clear`}>⚪ Limpiar {p.slug}</SelectItem>
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}