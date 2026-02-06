'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import UserDetailClient from '@/components/dashboard/UserDetailClient';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Users, ChevronRight, UserCog } from 'lucide-react';

export default function ModUsersListPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Cargar roles para el filtro (nota: column name es `name` en la tabla roles)
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name')
        .order('role_level', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        setRoles(data || []);
      }
    };
    fetchRoles();
  }, [supabase]);

  // 2. Fetch de usuarios con filtros combinados
  const fetchUsers = useCallback(async (search: string, roleId: string) => {
    setIsLoading(true);

    // Uso de !inner para devolver sólo usuarios que tengan user_roles (ideal para búsqueda por rol)
    let query = supabase
      .from('profiles')
      .select('id, username, display_name, user_roles!inner(role_id, roles(name, role_level))')
      .ilike('username', `%${search}%`)
      .limit(20);

    if (roleId !== 'all') {
      // filter() es más fiable para rutas embebidas en Supabase JS
      query = query.filter('user_roles.role_id', 'eq', roleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  }, [supabase]);

  // Debounce para la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(searchTerm, roleFilter);
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, roleFilter, fetchUsers]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
          <p className="text-muted-foreground">Busca usuarios para gestionar sus permisos individuales.</p>
        </div>
        <Users className="hidden md:block h-8 w-8 text-muted-foreground opacity-20" />
      </header>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por username..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Buscando usuarios...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Usuario</TableHead>
                    <TableHead className="hidden md:table-cell">Roles</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        No se encontraron usuarios con esos filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{u.display_name || 'Sin nombre'}</span>
                            <span className="text-xs text-muted-foreground">@{u.username}</span>
                            {/* Badge solo para mobile */}
                            <div className="md:hidden mt-1 flex gap-1">
                              {(u.user_roles || []).map((ur: any) => (
                                <Badge key={ur.role_id + '_' + ur.roles.name} variant="outline" className="text-[10px] px-1 py-0">
                                  {ur.roles?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(u.user_roles || []).map((ur: any) => (
                              <Badge key={ur.role_id + '_' + ur.roles.name} variant="secondary">
                                {ur.roles?.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" onClick={() => setSelectedUserId(u.id)}>
                            <span className="hidden md:inline mr-2">Gestionar</span>
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40">
          <div className="w-full max-w-4xl bg-background rounded-lg shadow-lg overflow-auto">
            <UserDetailClient id={selectedUserId} onClose={() => setSelectedUserId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}