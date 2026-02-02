'use client';

import React from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Radio, 
  Calendar,   ShoppingBag, 
  MessageSquare,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

export default function StreamerDashboard() {
  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Streamer</h1>
            <p className="text-muted-foreground">
              Gestiona tu contenido, horarios y productos.
            </p>
          </div>
          <Button className="gap-2">
            <Radio className="h-4 w-4" />
            Ir a mi perfil público
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscriptores</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+18 nuevos este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">En 3 servidores diferentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Stream</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoy 18:00</div>
              <p className="text-xs text-muted-foreground">En 4 horas y 20 min</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Últimos Comentarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Usuario_{i}</p>
                          <p className="text-sm text-muted-foreground">
                            "Me encantó el último stream de crónicas, ¿cuándo es el siguiente evento?"
                          </p>
                          <Button variant="link" className="p-0 h-auto text-xs">Responder</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enlaces Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    Editar Bio <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Configurar Donaciones <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Ver Estadísticas <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Tu Agenda Semanal</CardTitle>
                <CardDescription>
                  Configura tus bloques de transmisión. Cada bloque representa 30 minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Calendario Interactivo de Slots (Próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products">
             <Card>
              <CardHeader>
                <CardTitle>Tus Productos</CardTitle>
                <CardDescription>
                  Gestiona los items y beneficios que vendes en los servidores.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Editor de Productos de la Tienda (Próximamente)</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardClientLayout>
  );
}
