'use client';

import React from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShieldCheck, 
  Server, 
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function ModDashboard() {
  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Moderación</h1>
          <p className="text-muted-foreground">
            Supervisa usuarios, reportes y estado de los servidores.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Online</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,204</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Abiertos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servidores Activos</CardTitle>
              <Server className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acciones hoy</CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reportes Recientes</CardTitle>
            <CardDescription>
              Últimas denuncias realizadas por los usuarios en el juego o web.
            </CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar reportes..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline">Filtros</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { user: "Player_One", reason: "Griefing", server: "Survival 1", status: "pending", date: "Hace 5m" },
                  { user: "Gamer_X", reason: "Lenguaje Inapropiado", server: "Lobby", status: "reviewing", date: "Hace 15m" },
                  { user: "BuildMaster", reason: "Uso de Hacks", server: "Survival 2", status: "pending", date: "Hace 1h" },
                ].map((report, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{report.user}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{report.server}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardClientLayout>
  );
}
