// app/dashboard/admin/permissions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input'; // For searching users

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  current_roles: string[];
}

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles')
      .select(`
        id,
        username,
        display_name,
        email:auth.users(email),
        user_roles(roles(name))
      `)
      .ilike('username', `%${searchTerm}%`)
      .limit(10); // Limit for demonstration, implement pagination for large datasets

    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios.',
        variant: 'destructive',
      });
    } else {
      const formattedUsers = data.map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        email: profile.email ? profile.email.email : 'N/A', // Extract email from joined auth.users
        current_roles: profile.user_roles.map((ur: any) => ur.roles.name),
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, currentRoles: string[], newRole: string) => {
    if (currentRoles.includes(newRole)) {
      toast({
        title: 'Información',
        description: `El usuario ya tiene el rol de ${newRole}.`,
        variant: 'default',
      });
      return;
    }

    // Determine action: 'assign'
    const action = 'assign';

    // Call Supabase RPC for manage_user_role
    const { data, error } = await supabase.rpc('manage_user_role', {
      p_target_user_id: userId,
      p_role_name: newRole,
      p_action: action,
    });

    if (error) {
      console.error('Error managing user role:', error);
      toast({
        title: 'Error',
        description: `Error al asignar el rol ${newRole}: ${error.message}`,
        variant: 'destructive',
      });
    } else if (data && data.success) {
      toast({
        title: 'Éxito',
        description: data.message,
        variant: 'success',
      });
      fetchUsersWithRoles(); // Refresh user list after successful role change
    } else if (data && !data.success) {
        toast({
            title: 'Fallo',
            description: data.message,
            variant: 'destructive',
        });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsersWithRoles();
  };

  const allPossibleRoles = ['viewer', 'streamer', 'mod', 'admin', 'super_admin'];

  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos de Usuarios</h1>
            <p className="text-muted-foreground">
              Asigna y gestiona los roles de los usuarios en el sistema.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Usuarios</CardTitle>
            <CardDescription>
              Busca usuarios y modifica sus roles directamente desde aquí.
            </CardDescription>
            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
              <Input
                type="text"
                placeholder="Buscar por nombre de usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Buscar</Button>
            </form>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles Actuales</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No se encontraron usuarios.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {user.display_name} (@{user.username})
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.current_roles.map((role) => (
                              <span key={role} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {role}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select onValueChange={(value) => handleRoleChange(user.id, user.current_roles, value)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Asignar Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {allPossibleRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Optionally add a remove role button/logic */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardClientLayout>
  );
}
