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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton component

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  current_roles: string[];
  current_role_levels: number[];
}

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [myMaxRoleLevel, setMyMaxRoleLevel] = useState<number>(0);
  const [allRolesWithLevels, setAllRolesWithLevels] = useState<{ name: string; level: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();
  const { toast } = useToast();

  // State for the current authenticated user\'s ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchCurrentUser();
      await fetchMyMaxRoleLevel();
      await fetchAllRolesWithLevels();
      await fetchUsersWithRoles();
      setLoading(false);
    };
    initializeData();
  }, [searchTerm]); // Re-run when searchTerm changes

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchMyMaxRoleLevel = async () => {
    const { data, error } = await supabase.rpc('get_my_max_level');
    if (error) {
      console.error('Error fetching my max role level:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar tu nivel de rol.',
        variant: 'destructive',
      });
    } else {
      setMyMaxRoleLevel(data || 0);
    }
  };

  const fetchAllRolesWithLevels = async () => {
    const { data, error } = await supabase.from('roles').select('name, role_level');
    if (error) {
      console.error('Error fetching all roles with levels:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los roles disponibles.',
        variant: 'destructive',
      });
    } else {
      setAllRolesWithLevels(data.map(role => ({ name: role.name, level: role.role_level })));
    }
  };

  const fetchUsersWithRoles = async () => {
    const { data, error } = await supabase.from('profiles')
      .select(`
        id,
        username,
        display_name,
        email:auth.users(email),
        user_roles(roles(name, role_level))
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
        current_role_levels: profile.user_roles.map((ur: any) => ur.roles.role_level), // Fetch role levels as well
      }));
      setUsers(formattedUsers);
    }
  };

  const handleRoleChange = async (targetUserId: string, targetUserCurrentRoles: string[], targetUserCurrentRoleLevels: number[], newRoleName: string, actionType: 'assign' | 'degrade') => {
    // 1. Prevent self-assignment
    if (targetUserId === currentUserId) {
      toast({
        title: 'Acción denegada',
        description: 'No puedes cambiar tu propio rol.',
        variant: 'destructive',
      });
      return;
    }

    // Get the level of the new role and the target user\'s highest role level
    const newRoleLevel = allRolesWithLevels.find(role => role.name === newRoleName)?.level || 0;
    const targetUserMaxRoleLevel = Math.max(...targetUserCurrentRoleLevels);

    // 2. Hierarchical check based on myMaxRoleLevel
    if (myMaxRoleLevel <= newRoleLevel && actionType === 'assign') {
      toast({
        title: 'Acción denegada',
        description: `Tu rango (${myMaxRoleLevel}) es insuficiente para asignar el rol de ${newRoleName} (nivel ${newRoleLevel}).`,
        variant: 'destructive',
      });
      return;
    }

    if (myMaxRoleLevel <= targetUserMaxRoleLevel && actionType === 'degrade') {
        toast({
            title: 'Acción denegada',
            description: `Tu rango (${myMaxRoleLevel}) es insuficiente para degradar a un usuario con un rol de nivel ${targetUserMaxRoleLevel} o superior.`,
            variant: 'destructive',
        });
        return;
    }

    // Check if the user already has the role for 'assign' action
    if (actionType === 'assign' && targetUserCurrentRoles.includes(newRoleName)) {
      toast({
        title: 'Información',
        description: `El usuario ya tiene el rol de ${newRoleName}.`,
        variant: 'default',
      });
      return;
    }

    // Check if the user does not have the role for 'degrade' action
    if (actionType === 'degrade' && !targetUserCurrentRoles.includes(newRoleName)) {
        toast({
            title: 'Información',
            description: `El usuario no tiene el rol de ${newRoleName} para degradar.`,
            variant: 'default',
        });
        return;
    }

    const { data, error } = await supabase.rpc('manage_user_role', {
      p_target_user_id: targetUserId,
      p_role_name: newRoleName,
      p_action: actionType,
    });

    if (error) {
      console.error('Error managing user role:', error);
      toast({
        title: 'Error',
        description: `Error al ${actionType === 'assign' ? 'asignar' : 'degradar'} el rol ${newRoleName}: ${error.message}`,
        variant: 'destructive',
      });
    } else if (data && data.success) {
      toast({
        title: 'Éxito',
        description: data.message,
        variant: 'default',
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

  // Filter roles based on myMaxRoleLevel for assignment
  const assignableRoles = allRolesWithLevels.filter(role => role.level < myMaxRoleLevel);

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
                            {user.current_roles.map((role) => {
                                // Find the role level for display if needed
                                const roleInfo = allRolesWithLevels.find(r => r.name === role);
                                return (
                                <span key={role} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {role} {roleInfo ? `(Nivel: ${roleInfo.level})` : ''}
                                </span>
                                );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Select onValueChange={(value) => handleRoleChange(user.id, user.current_roles, user.current_role_levels, value, 'assign')}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Asignar Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => (
                                <SelectItem
                                  key={role.name}
                                  value={role.name}
                                  disabled={user.current_roles.includes(role.name) || user.id === currentUserId}
                                >
                                  {role.name} (Nivel: {role.level})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select onValueChange={(value) => handleRoleChange(user.id, user.current_roles, user.current_role_levels, value, 'degrade')}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Degradar Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {user.current_roles.filter(roleName => {
                                const role = allRolesWithLevels.find(r => r.name === roleName);
                                return role && role.level < myMaxRoleLevel; // Only allow degrading roles lower than my own max level
                              }).map((roleName) => {
                                const role = allRolesWithLevels.find(r => r.name === roleName);
                                return (
                                  <SelectItem
                                    key={roleName}
                                    value={roleName}
                                    disabled={user.id === currentUserId}
                                  >
                                    {roleName} (Nivel: {role?.level})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
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
