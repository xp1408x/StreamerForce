
'use client';

import React from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAdmin, isMod, isStreamer } = usePermissions(); // Destructure new flags

  const stats = [
    {
      title: "Seguidores",
      value: "1,234",
      icon: Users,
      description: "+12% este mes",
      color: "text-blue-500"
    },
    {
      title: "Ventas",
      value: "45",
      icon: ShoppingBag,
      description: "+5 hoy",
      color: "text-green-500"
    },
    {
      title: "Créditos",
      value: "12,500",
      icon: TrendingUp,
      description: "Balance actual",
      color: "text-amber-500"
    },
    {
      title: "Comentarios",
      value: "89",
      icon: MessageSquare,
      description: "24 sin responder",
      color: "text-purple-500"
    }
  ];

  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Principal</h1>
          <p className="text-muted-foreground">
            Bienvenido de nuevo. Aquí tienes un resumen de tu actividad.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tienes 3 notificaciones importantes hoy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Nueva compra de producto
                      </p>
                      <p className="text-sm text-muted-foreground">
                        El usuario @jugador{i} compró "Rango VIP"
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      hace {i*2}h
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Accesos Directos</CardTitle>
              <CardDescription>
                Acciones rápidas según tus permisos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {isStreamer && (
                <Button asChild variant="outline" className="justify-start gap-2 w-full">
                  <Link href="/dashboard/streamer">
                    <Radio className="h-4 w-4" />
                    Panel de Streamer
                  </Link>
                </Button>
              )}
              {isMod && (
                <Button asChild variant="outline" className="justify-start gap-2 w-full">
                  <Link href="/dashboard/mod">
                    <ShieldAlert className="h-4 w-4" />
                    Panel de Moderación
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button asChild variant="outline" className="justify-start gap-2 w-full">
                  <Link href="/dashboard/admin">
                    <ShieldAlert className="h-4 w-4" />
                    Administración Sistema
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="justify-start gap-2 w-full">
                <Link href="/profile">
                  <Users className="h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardClientLayout>
  );
}
