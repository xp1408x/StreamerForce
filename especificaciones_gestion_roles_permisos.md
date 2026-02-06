Especificación Técnica: Arquitectura de
Gestión de Usuarios y Permisos
Este documento detalla la lógica de negocio y las restricciones de seguridad (RLS) para la
implementación de los paneles de Administración y Moderación.

1. Jerarquía de Poder (Niveles de Rol)
El sistema se rige por la columna role_level en la tabla public.roles. Ninguna acción
administrativa puede afectar a un usuario de nivel igual o superior.
Rol Nivel (role_level) Alcance de Gestión
Super Admin 100 Puede promover a admin
(nivel 80) y gestionar todo
el sistema.
Admin 80 Puede promover/degradar
hasta nivel mod (50). No
puede tocar a otros
Admins.
Mod 50 Puede aplicar overrides
(permisos específicos) a
niveles < 50.
Streamer 30 Usuario con herramientas
de creación.
Viewer 10 Usuario base.

2. Lógica de Permisos (Pesos)
Cada permiso en public.permissions tiene un weight (peso).
● Un usuario solo puede asignar un permiso si Su Nivel de Rol > Peso del Permiso.
● Un Moderador (50) puede asignar permisos de peso 10, 20, 30 o 40, pero nunca uno de
peso 50 o superior.

3. Funcionalidad del Panel de Administrador (Roles)
Objetivo: Gestionar la membresía de los usuarios en los distintos rangos del sistema.
● Requisito de Permiso: El ejecutor debe poseer perm:manage:assign.
● Promoción (INSERT): - La UI debe filtrar los roles disponibles: role_level <
mi_nivel_maximo.
○ No se puede asignar un rol a uno mismo.
● Degradación (UPDATE):
○ Se realiza mediante Soft Delete seteando deleted_at = now() en la tabla user_roles.
○ Solo permitido si nivel_objetivo < mi_nivel_maximo.

4. Funcionalidad del Panel de Moderador (Overrides)
Objetivo: Otorgar permisos extra o aplicar restricciones (mutes/baneos) individuales.
● Requisito de Permiso: admin:user:ban para sanciones o perm:manage:assign para
privilegios.
● Validación de Permiso: Solo se muestran permisos donde weight < mi_nivel_maximo e
is_assignable = true.
● Acciones:
○ Añadir (INSERT): Crear un registro en user_permission_overrides.
○ Remover (UPDATE): Setear deleted_at = now() en el override.
○ Jerarquía: Un Moderador no puede mutear a un Administrador ni a otro Moderador.

5. Auditoría Inmutable
Cada cambio realizado en estos paneles genera una entrada automática en public.audit_logs
mediante triggers:
● actor_id: ID del administrador que ejecutó la acción.
● target_user_id: ID del usuario que recibió el cambio.
● record_pk: ID del registro afectado.
● old_data / new_data: Captura del estado en JSONB para auditoría forense.

6. Consideraciones para el Frontend
(Next.js/React/Mobile)
Validación Preventiva: Antes de enviar la transacción, comparar get_my_max_level()
con el nivel del objetivo para deshabilitar botones en la UI.
Manejo de Errores: Si la RLS rebota la petición (violación de política), mostrar: "Acción
denegada: Tu rango es insuficiente para gestionar a este usuario o permiso".
Sincronización: Tras un cambio de rol, refrescar la sesión o el estado global de permisos
del usuario afectado si es posible.
Nota de Seguridad: Las políticas RLS ya están configuradas en la base de datos con
operadores de comparación estricta (<). La UI debe reflejar esta misma lógica para evitar frustración del usuario.