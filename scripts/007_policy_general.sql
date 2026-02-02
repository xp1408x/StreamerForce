-- SELECT: Ver solo lo publicado o lo propio, a menos que seas editor global
CREATE POLICY article_select_policy ON public.articles FOR SELECT
USING (
  deleted_at IS NULL AND (
    published = true 
    OR author_id = auth.uid() 
    OR has_permission('blog:edit:all')
  )
);

-- INSERT: Crear para uno mismo o para otros si tienes el permiso :all
CREATE POLICY article_insert_policy ON public.articles FOR INSERT
WITH CHECK (
  has_permission('blog:create:all') 
  OR (has_permission('blog:create:self') AND author_id = auth.uid())
);

-- UPDATE: Editar o marcar como eliminado (soft delete)
CREATE POLICY article_update_policy ON public.articles FOR UPDATE
USING (
  has_permission('blog:edit:all') 
  OR (has_permission('blog:edit:self') AND author_id = auth.uid())
)
WITH CHECK (
  has_permission('blog:edit:all') 
  OR (has_permission('blog:edit:self') AND author_id = auth.uid())
);

-- WALLETS:

-- SELECT: Ver solo mi dinero o todo si soy admin financiero
CREATE POLICY wallet_select_policy ON public.wallets FOR SELECT
USING (
  user_id = auth.uid() AND has_permission('wallet:view:self')
  OR has_permission('wallet:manage:all')
);

-- UPDATE: Solo el admin financiero puede ajustar balances (poyectando auditoría)
CREATE POLICY wallet_update_policy ON public.wallets FOR UPDATE
USING (has_permission('wallet:manage:all'))
WITH CHECK (has_permission('wallet:manage:all'));


-- ARTICLE COMMENTS:

-- SELECT: Todo lo que no esté borrado es público
CREATE POLICY comment_select_policy ON public.article_comments FOR SELECT
USING (deleted_at IS NULL);

-- INSERT: Solo si tienes permiso de comentar y eres tú el autor
CREATE POLICY comment_insert_policy ON public.article_comments FOR INSERT
WITH CHECK (
  has_permission('blog:comment:create') AND user_id = auth.uid()
);

-- UPDATE: Solo el autor edita su texto, o un mod para "borrar" (deleted_at)
CREATE POLICY comment_update_policy ON public.article_comments FOR UPDATE
USING (
  (user_id = auth.uid() AND has_permission('social:comment:self'))
  OR has_permission('blog:comment:moderate')
);


-- USER_ROLES: Solo el admin puede asignar o quitar roles
CREATE POLICY user_role_select_policy ON public.user_roles FOR SELECT
USING (true);

CREATE POLICY user_role_insert_policy ON public.user_roles FOR INSERT
WITH CHECK (has_permission('admin:users:manage'));

CREATE POLICY user_role_update_policy ON public.user_roles FOR UPDATE
USING (has_permission('admin:users:manage'));



-- OVERRIDES: Solo el super_admin o encargado de sistema

CREATE POLICY override_insert_policy ON public.user_permission_overrides
FOR INSERT 
WITH CHECK (
  -- 1. Permiso delegable
  has_permission('admin:user:ban') 
  AND
  (SELECT is_assignable FROM public.permissions WHERE id = permission_id) = true
  AND
  -- 2. JERARQUÍA: Tu nivel debe ser mayor al nivel del usuario objetivo
  public.get_my_max_level() > (
      SELECT COALESCE(MAX(r.role_level), 0)
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = user_permission_overrides.user_id
  )
  AND
  -- 3. PESO: El peso del permiso debe ser ESTRICTAMENTE MENOR a tu nivel
  (SELECT weight FROM public.permissions WHERE id = permission_id) < public.get_my_max_level()
  AND
  -- 4. No auto-gestión
  user_id <> auth.uid()
);

CREATE POLICY overrides_update_policy ON public.user_permission_overrides
FOR UPDATE
USING (
  -- 1. El ejecutor debe tener el permiso de baneo/moderación
  public.has_permission('admin:user:ban')
  AND
  -- 2. JERARQUÍA: Solo puedes editar registros de usuarios con menor rango que tú
  public.get_my_max_level() > (
      SELECT COALESCE(MAX(r.role_level), 0)
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = public.user_permission_overrides.user_id
      AND ur.deleted_at IS NULL
  )
)
WITH CHECK (
  -- 3. PESO: Si se intenta cambiar el permiso, el nuevo también debe ser menor a tu nivel
  (SELECT weight FROM public.permissions WHERE id = permission_id) < public.get_my_max_level()
);

CREATE POLICY override_select_policy ON public.user_permission_overrides FOR SELECT 
USING (true);


-- PROFILES
CREATE POLICY profile_select_policy ON public.profiles FOR SELECT 
USING (deleted_at IS NULL AND (has_permission('profile:view:all') OR auth.uid() = id));

-- Permitir que el sistema (o el usuario al registrarse) cree su propio perfil
CREATE POLICY profile_insert_policy ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY profile_update_policy ON public.profiles FOR UPDATE 
USING (auth.uid() = id AND has_permission('profile:edit:self'))
WITH CHECK (auth.uid() = id);


-- USER_GAME_IDENTITIES
CREATE POLICY identity_select_policy ON public.user_game_identities FOR SELECT 
USING (deleted_at IS NULL);

CREATE POLICY identity_insert_policy ON public.user_game_identities FOR INSERT 
WITH CHECK (auth.uid() = user_id AND has_permission('identity:manage:self'));

CREATE POLICY identity_update_policy ON public.user_game_identities FOR UPDATE 
USING (auth.uid() = user_id AND has_permission('identity:manage:self'));


-- FOLLOWS & FAVORITES
CREATE POLICY follow_select_policy ON public.profile_follows FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY follow_insert_policy ON public.profile_follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id AND has_permission('social:follow:self'));

CREATE POLICY follow_update_policy ON public.profile_follows FOR UPDATE 
USING (auth.uid() = follower_id AND has_permission('social:follow:self'));


-- SHOP_PRODUCTS
CREATE POLICY product_select_policy ON public.shop_products FOR SELECT
USING (deleted_at IS NULL AND (status = 'active' OR has_permission('shop:item:manage:all') OR has_permission('shop:item:approve')));

CREATE POLICY product_insert_policy ON public.shop_products FOR INSERT
WITH CHECK (has_permission('shop:item:manage:all') OR (has_permission('shop:item:manage:self') AND streamer_id IN (SELECT id FROM public.streamers WHERE profile_id = auth.uid())));

CREATE POLICY product_update_policy ON public.shop_products FOR UPDATE
USING (has_permission('shop:item:manage:all') OR (has_permission('shop:item:manage:self') AND streamer_id IN (SELECT id FROM public.streamers WHERE profile_id = auth.uid())));


-- PURCHASES
CREATE POLICY purchase_select_policy ON public.purchases FOR SELECT
USING (user_id = auth.uid() OR has_permission('shop:purchase:all'));

CREATE POLICY purchase_insert_policy ON public.purchases FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_permission('shop:purchase'));

CREATE POLICY purchase_update_policy ON public.purchases FOR UPDATE
USING (has_permission('shop:refund:all'));


-- GAME_SERVERS
CREATE POLICY server_select_policy ON public.game_servers FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY server_insert_policy ON public.game_servers FOR INSERT WITH CHECK (has_permission('server:manage:all'));

CREATE POLICY server_update_policy ON public.game_servers FOR UPDATE 
USING (has_permission('server:manage:all') OR (owner_id = auth.uid() AND has_permission('server:manage:self')));


-- SERVER_STAFF
CREATE POLICY staff_select_policy ON public.server_staff FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY staff_insert_policy ON public.server_staff FOR INSERT WITH CHECK (has_permission('server:staff:assign:all'));

CREATE POLICY staff_update_policy ON public.server_staff FOR UPDATE
USING (has_permission('server:staff:assign:all'))
WITH CHECK (has_permission('server:staff:assign:all'));

-- STREAM_SCHEDULES
CREATE POLICY schedule_select_policy ON public.stream_schedules FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY schedule_insert_policy ON public.stream_schedules FOR INSERT
WITH CHECK (has_permission('stream:manage:all') OR (streamer_id IN (SELECT id FROM public.streamers WHERE profile_id = auth.uid()) AND has_permission('stream:manage:self')));

CREATE POLICY schedule_update_policy ON public.stream_schedules FOR UPDATE
USING (has_permission('stream:manage:all') OR (streamer_id IN (SELECT id FROM public.streamers WHERE profile_id = auth.uid()) AND has_permission('stream:manage:self')));


-- SURVEYS
CREATE POLICY survey_select_policy ON public.surveys FOR SELECT USING (deleted_at IS NULL AND is_active = true);

CREATE POLICY survey_insert_policy ON public.surveys FOR INSERT 
WITH CHECK (has_permission('survey:manage:all') OR (creator_id = auth.uid() AND has_permission('survey:manage:self')));

CREATE POLICY survey_update_policy ON public.surveys FOR UPDATE 
USING (has_permission('survey:manage:all') OR (creator_id = auth.uid() AND has_permission('survey:manage:self')));


-- SURVEY_VOTES (Un voto por persona, solo si tiene el permiso)
CREATE POLICY vote_select_policy ON public.survey_votes FOR SELECT USING (true);

CREATE POLICY vote_insert_policy ON public.survey_votes FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (has_permission('survey:vote:self') OR has_permission('survey:vote:subs'))
);

CREATE POLICY vote_update_policy ON public.survey_votes FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND (has_permission('survey:vote:self') OR has_permission('survey:vote:subs'))
);

-- ROLES
CREATE POLICY roles_select_policy ON public.roles FOR SELECT USING (true);
CREATE POLICY roles_insert_policy ON public.roles FOR INSERT WITH CHECK (has_permission('perm:manage:system'));
CREATE POLICY roles_update_policy ON public.roles FOR UPDATE USING (has_permission('perm:manage:system'));


-- PERMISSIONS
CREATE POLICY permissions_select_policy ON public.permissions FOR SELECT USING (true);
CREATE POLICY permissions_insert_policy ON public.permissions FOR INSERT WITH CHECK (has_permission('perm:manage:system'));
CREATE POLICY permissions_update_policy ON public.permissions FOR UPDATE USING (has_permission('perm:manage:system'));


-- ROLE_PERMISSIONS (La unión entre ambos)
CREATE POLICY role_permissions_select_policy ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY role_permissions_insert_policy ON public.role_permissions FOR INSERT WITH CHECK (has_permission('perm:manage:assign'));
CREATE POLICY role_permissions_update_policy ON public.role_permissions FOR UPDATE USING (has_permission('perm:manage:assign'));


-- ARTICLE_CATEGORIES
CREATE POLICY article_categories_select_policy ON public.article_categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY article_categories_insert_policy ON public.article_categories FOR INSERT WITH CHECK (has_permission('admin:system:config'));
CREATE POLICY article_categories_update_policy ON public.article_categories FOR UPDATE USING (has_permission('admin:system:config'));


-- PRODUCT_TYPES
CREATE POLICY product_types_select_policy ON public.product_types FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY product_types_insert_policy ON public.product_types FOR INSERT WITH CHECK (has_permission('admin:system:config'));
CREATE POLICY product_types_update_policy ON public.product_types FOR UPDATE USING (has_permission('admin:system:config'));


-- STREAMERS
CREATE POLICY streamers_select_policy ON public.streamers FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY streamers_insert_policy ON public.streamers FOR INSERT WITH CHECK (has_permission('admin:users:manage')); -- Solo admin nombra streamers
CREATE POLICY streamers_update_policy ON public.streamers FOR UPDATE 
USING (has_permission('stream:manage:all') OR (profile_id = auth.uid() AND has_permission('stream:manage:self')));

-- STREAMER_SOCIALS
CREATE POLICY streamer_socials_select_policy ON public.streamer_socials FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY streamer_socials_insert_policy ON public.streamer_socials FOR INSERT 
WITH CHECK (
  has_permission('stream:manage:all') OR 
  EXISTS (SELECT 1 FROM public.streamers WHERE id = streamer_id AND profile_id = auth.uid() AND has_permission('stream:manage:self'))
);
CREATE POLICY streamer_socials_update_policy ON public.streamer_socials FOR UPDATE 
USING (
  has_permission('stream:manage:all') OR 
  EXISTS (SELECT 1 FROM public.streamers WHERE id = streamer_id AND profile_id = auth.uid() AND has_permission('stream:manage:self'))
);


-- SERVER_ROADMAPS
CREATE POLICY roadmaps_select_policy ON public.server_roadmaps FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY roadmaps_insert_policy ON public.server_roadmaps FOR INSERT 
WITH CHECK (
  has_permission('server:manage:all') OR 
  EXISTS (SELECT 1 FROM public.game_servers WHERE id = server_id AND owner_id = auth.uid() AND has_permission('server:manage:self'))
);
CREATE POLICY roadmaps_update_policy ON public.server_roadmaps FOR UPDATE 
USING (
  has_permission('server:manage:all') OR 
  EXISTS (SELECT 1 FROM public.game_servers WHERE id = server_id AND owner_id = auth.uid() AND has_permission('server:manage:self'))
);


-- SURVEY_OPTIONS
CREATE POLICY survey_options_select_policy ON public.survey_options FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY survey_options_insert_policy ON public.survey_options FOR INSERT 
WITH CHECK (
  has_permission('survey:manage:all') OR 
  EXISTS (SELECT 1 FROM public.surveys WHERE id = survey_id AND creator_id = auth.uid() AND has_permission('survey:manage:self'))
);

-- ARTICLE_FAVORITES
CREATE POLICY article_favorites_select_policy ON public.article_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY article_favorites_insert_policy ON public.article_favorites FOR INSERT WITH CHECK (auth.uid() = user_id AND has_permission('social:favorite:self'));
CREATE POLICY article_favorites_update_policy ON public.article_favorites FOR UPDATE USING (auth.uid() = user_id AND has_permission('social:favorite:self'));



-- 1. Habilitar RLS en la tabla
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que el sistema escriba logs (vía Triggers)
-- Como el trigger es 'SECURITY DEFINER', se salta la RLS al insertar,
-- pero definimos esto por seguridad para lectura/gestión.

-- 3. Lectura: Solo Admins y Super Admins pueden ver los logs
CREATE POLICY audit_log_select_policy
ON public.audit_logs
FOR SELECT
USING (
  public.has_permission('admin:audit:view')
);

-- 4. Inmutabilidad: Prohibir UPDATE y DELETE para TODOS
-- Al no crear políticas para UPDATE o DELETE, Postgres deniega estas acciones por defecto.
-- No hace falta código extra, el silencio de la RLS es el bloqueo más fuerte.