import { createClient } from '@/lib/supabase/client'; // Tu config de supabase
import { useEffect, useState } from 'react';

const ADMIN_PERMISSIONS = [
  'admin:users:manage',
  'admin:user:ban',
  'admin:audit:view',
  'admin:restore',
  'admin:system:config',
  'storage:manage:all',
  'perm:manage:assign',
  'perm:manage:system',
  'wallet:manage:all',
  'blog:edit:all',
  'blog:delete:all',
  'shop:item:manage:all',
  'shop:item:approve',
  'shop:stats:view:all',
  'shop:purchase:all',
  'shop:refund:all',
  'shop:coupon:manage',
  'shop:support:manage',
  'server:manage:all',
  'server:staff:assign:all',
  'survey:manage:all',
  'stream:manage:all',
  'social:comment:all',
  'game:command:execute',
  'game:whitelist:manage',
];

const MOD_PERMISSIONS = [
  'blog:comment:moderate',
  'shop:support:manage',
  'admin:user:ban',
  'social:comment:all',
];

const STREAMER_PERMISSIONS = [
  'stream:manage:self',
  'shop:item:manage:self',
  'survey:manage:self',
];

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPermissions() {
      const { data, error } = await supabase.rpc('get_my_permissions');

      if (error) {
        console.error("Error cargando permisos:", error);
      } else {
        setPermissions(data.map((p: any) => p.permission_slug));
      }
      setLoading(false);
    }

    fetchPermissions();
  }, []);

  const hasPermission = (slug: string) => permissions.includes(slug);

  const isAdmin = permissions.some(p => ADMIN_PERMISSIONS.includes(p));
  const isMod = permissions.some(p => MOD_PERMISSIONS.includes(p));
  const isStreamer = permissions.some(p => STREAMER_PERMISSIONS.includes(p));

  return { permissions, hasPermission, loading, isAdmin, isMod, isStreamer };
}