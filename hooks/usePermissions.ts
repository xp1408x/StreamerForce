import { createClient } from '@/lib/supabase/client'; // Tu config de supabase
import { useEffect, useState } from 'react';

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
        // Transformamos el formato de tabla a un array simple de strings
        setPermissions(data.map((p: any) => p.permission_slug));
      }
      setLoading(false);
    }

    fetchPermissions();
  }, []);

  const hasPermission = (slug: string) => permissions.includes(slug);

  return { permissions, hasPermission, loading };
}