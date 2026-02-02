import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  ShieldCheck,
  Radio,
  Server,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/usePermissions'; // Import usePermissions

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  // No longer directly use 'permission' field here. Roles are checked via usePermissions.
}

const commonNavItems: NavItem[] = [
  { title: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
];

const streamerNavItems: NavItem[] = [
  { title: 'Mi Stream', href: '/dashboard/streamer', icon: Radio },
  { title: 'Horarios', href: '/dashboard/streamer/schedule', icon: FileText },
  { title: 'Mis Productos', href: '/dashboard/streamer/products', icon: ShoppingBag },
];

const modNavItems: NavItem[] = [
  { title: 'Moderación', href: '/dashboard/mod', icon: ShieldCheck },
  { title: 'Usuarios', href: '/dashboard/mod/users', icon: Users },
  { title: 'Servidores', href: '/dashboard/mod/servers', icon: Server },
];

const adminNavItems: NavItem[] = [
  { title: 'Administración', href: '/dashboard/admin', icon: Settings },
  { title: 'Roles y Permisos', href: '/dashboard/admin/permissions', icon: ShieldCheck },
  { title: 'Tienda Global', href: '/dashboard/admin/shop', icon: ShoppingBag },
  { title: 'Contenido/Blog', href: '/dashboard/admin/content', icon: FileText },
];

export function DashboardSidebar() { // Removed 'permissions' prop
  const pathname = usePathname();
  const { isAdmin, isMod, isStreamer } = usePermissions(); // Use new role flags

  // Filter nav items based on role flags
  const filteredStreamerNavItems = isStreamer ? streamerNavItems : [];
  const filteredModNavItems = isMod ? modNavItems : [];
  const filteredAdminNavItems = isAdmin ? adminNavItems : [];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            W
          </div>
          <span className="group-data-[collapsible=icon]:hidden">Werexp</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredStreamerNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Streamer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredStreamerNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredModNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Moderación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredModNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredAdminNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
