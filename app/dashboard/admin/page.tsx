'use client';

import DashboardClientLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  ShieldCheck, 
  ShoppingBag, 
  Users,
  Database,
  Lock,
  History,
  AlertOctagon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import React, { useState } from 'react';

export default function AdminDashboard() {
  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración Global</h1>
          <p className="text-muted-foreground">
            Control total del sistema, permisos y auditoría.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <p className="text-xs text-muted-foreground">+180 esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,560.00</div>
              <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">4 del sistema / 4 personalizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado DB</CardTitle>
              <Database className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Saludable</div>
              <p className="text-xs text-muted-foreground">Latencia: 12ms</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle onClick={() => setShowLogs(!showLogs)} className="cursor-pointer">Logs de Auditoría (public.audit_logs)</CardTitle>
              <CardDescription>
                Registro de cambios críticos realizados en la base de datos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tabla</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { action: "UPDATE", table: "user_roles", user: "Admin_Principal", date: "Hace 2m" },
                    { action: "INSERT", table: "shop_products", user: "Streamer_SrGato", date: "Hace 15m" },
                    { action: "DELETE", table: "survey_votes", user: "Mod_Gamer", date: "Hace 1h" },
                    { action: "UPDATE", table: "permissions", user: "Admin_Principal", date: "Hace 3h" },
                  ].map((log, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant={log.action === 'DELETE' ? 'destructive' : log.action === 'INSERT' ? 'default' : 'outline'}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.table}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{log.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="ghost" className="w-full mt-4 text-xs">Ver todos los logs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle onClick={() => setShowConfig(!showConfig)} className="cursor-pointer">Configuración Rápida</CardTitle>
              <CardDescription>
                Accesos administrativos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Lock className="h-4 w-4" />
                Gestionar Permisos
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                Backups de Datos
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Configuración Global
              </Button>
              <div className="pt-4 mt-4 border-t">
                <Button variant="destructive" className="w-full gap-2">
                  <AlertOctagon className="h-4 w-4" />
                  Mantenimiento Sistema
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardClientLayout>
  );
}
