-- ======================
-- PROFILES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_profiles ON public.profiles;
CREATE TRIGGER tr_fields_profiles
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_profiles ON public.profiles;
CREATE TRIGGER tr_log_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- USER GAME IDENTITIES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_identities ON public.user_game_identities;
CREATE TRIGGER tr_fields_identities
BEFORE INSERT OR UPDATE ON public.user_game_identities
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_identities ON public.user_game_identities;
CREATE TRIGGER tr_log_identities
AFTER INSERT OR UPDATE OR DELETE ON public.user_game_identities
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- WALLETS (sin audit log)
-- ======================
DROP TRIGGER IF EXISTS tr_fields_wallets ON public.wallets;
CREATE TRIGGER tr_fields_wallets
BEFORE INSERT OR UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();


-- ======================
-- ROLES & PERMISSIONS
-- ======================
DROP TRIGGER IF EXISTS tr_fields_roles ON public.roles;
CREATE TRIGGER tr_fields_roles
BEFORE INSERT OR UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_roles ON public.roles;
CREATE TRIGGER tr_log_roles
AFTER INSERT OR UPDATE OR DELETE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_permissions ON public.permissions;
CREATE TRIGGER tr_fields_permissions
BEFORE INSERT OR UPDATE ON public.permissions
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_permissions ON public.permissions;
CREATE TRIGGER tr_log_permissions
AFTER INSERT OR UPDATE OR DELETE ON public.permissions
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_role_perms ON public.role_permissions;
CREATE TRIGGER tr_fields_role_perms
BEFORE INSERT OR UPDATE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_role_perms ON public.role_permissions;
CREATE TRIGGER tr_log_role_perms
AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- USER ROLES & OVERRIDES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_user_roles ON public.user_roles;
CREATE TRIGGER tr_fields_user_roles
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_user_roles ON public.user_roles;
CREATE TRIGGER tr_log_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_overrides ON public.user_permission_overrides;
CREATE TRIGGER tr_fields_overrides
BEFORE INSERT OR UPDATE ON public.user_permission_overrides
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_overrides ON public.user_permission_overrides;
CREATE TRIGGER tr_log_overrides
AFTER INSERT OR UPDATE OR DELETE ON public.user_permission_overrides
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- STREAMERS
-- ======================
DROP TRIGGER IF EXISTS tr_fields_streamers ON public.streamers;
CREATE TRIGGER tr_fields_streamers
BEFORE INSERT OR UPDATE ON public.streamers
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_streamers ON public.streamers;
CREATE TRIGGER tr_log_streamers
AFTER INSERT OR UPDATE OR DELETE ON public.streamers
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- GAME SERVERS & STAFF
-- ======================
DROP TRIGGER IF EXISTS tr_fields_game_servers ON public.game_servers;
CREATE TRIGGER tr_fields_game_servers
BEFORE INSERT OR UPDATE ON public.game_servers
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_game_servers ON public.game_servers;
CREATE TRIGGER tr_log_game_servers
AFTER INSERT OR UPDATE OR DELETE ON public.game_servers
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_server_staff ON public.server_staff;
CREATE TRIGGER tr_fields_server_staff
BEFORE INSERT OR UPDATE ON public.server_staff
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_server_staff ON public.server_staff;
CREATE TRIGGER tr_log_server_staff
AFTER INSERT OR UPDATE OR DELETE ON public.server_staff
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- SHOP / PURCHASES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_shop_products ON public.shop_products;
CREATE TRIGGER tr_fields_shop_products
BEFORE INSERT OR UPDATE ON public.shop_products
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_shop_products ON public.shop_products;
CREATE TRIGGER tr_log_shop_products
AFTER INSERT OR UPDATE OR DELETE ON public.shop_products
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_purchases ON public.purchases;
CREATE TRIGGER tr_fields_purchases
BEFORE INSERT OR UPDATE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_purchases ON public.purchases;
CREATE TRIGGER tr_log_purchases
AFTER INSERT OR UPDATE OR DELETE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- CONTENT
-- ======================
DROP TRIGGER IF EXISTS tr_fields_articles ON public.articles;
CREATE TRIGGER tr_fields_articles
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_articles ON public.articles;
CREATE TRIGGER tr_log_articles
AFTER INSERT OR UPDATE OR DELETE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_comments ON public.article_comments;
CREATE TRIGGER tr_fields_comments
BEFORE INSERT OR UPDATE ON public.article_comments
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_comments ON public.article_comments;
CREATE TRIGGER tr_log_comments
AFTER INSERT OR UPDATE OR DELETE ON public.article_comments
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- SURVEYS
-- ======================
DROP TRIGGER IF EXISTS tr_fields_surveys ON public.surveys;
CREATE TRIGGER tr_fields_surveys
BEFORE INSERT OR UPDATE ON public.surveys
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_surveys ON public.surveys;
CREATE TRIGGER tr_log_surveys
AFTER INSERT OR UPDATE OR DELETE ON public.surveys
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


DROP TRIGGER IF EXISTS tr_fields_survey_options ON public.survey_options;
CREATE TRIGGER tr_fields_survey_options
BEFORE INSERT OR UPDATE ON public.survey_options
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

DROP TRIGGER IF EXISTS tr_log_survey_options ON public.survey_options;
CREATE TRIGGER tr_log_survey_options
AFTER INSERT OR UPDATE OR DELETE ON public.survey_options
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ======================
-- SOCIAL & FOLLOWS
-- ======================
DROP TRIGGER IF EXISTS tr_fields_follows ON public.profile_follows;
CREATE TRIGGER tr_fields_follows BEFORE INSERT OR UPDATE ON public.profile_follows FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_follows ON public.profile_follows;
CREATE TRIGGER tr_log_follows AFTER INSERT OR UPDATE OR DELETE ON public.profile_follows FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS tr_fields_streamer_socials ON public.streamer_socials;
CREATE TRIGGER tr_fields_streamer_socials BEFORE INSERT OR UPDATE ON public.streamer_socials FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_streamer_socials ON public.streamer_socials;
CREATE TRIGGER tr_log_streamer_socials AFTER INSERT OR UPDATE OR DELETE ON public.streamer_socials FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ======================
-- STREAM SCHEDULES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_schedules ON public.stream_schedules;
CREATE TRIGGER tr_fields_schedules BEFORE INSERT OR UPDATE ON public.stream_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_schedules ON public.stream_schedules;
CREATE TRIGGER tr_log_schedules AFTER INSERT OR UPDATE OR DELETE ON public.stream_schedules FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ======================
-- CATEGORIES & TYPES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_article_cats ON public.article_categories;
CREATE TRIGGER tr_fields_article_cats BEFORE INSERT OR UPDATE ON public.article_categories FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_article_cats ON public.article_categories;
CREATE TRIGGER tr_log_article_cats AFTER INSERT OR UPDATE OR DELETE ON public.article_categories FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS tr_fields_product_types ON public.product_types;
CREATE TRIGGER tr_fields_product_types BEFORE INSERT OR UPDATE ON public.product_types FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_product_types ON public.product_types;
CREATE TRIGGER tr_log_product_types AFTER INSERT OR UPDATE OR DELETE ON public.product_types FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ======================
-- SERVER ROADMAPS
-- ======================
DROP TRIGGER IF EXISTS tr_fields_roadmaps ON public.server_roadmaps;
CREATE TRIGGER tr_fields_roadmaps BEFORE INSERT OR UPDATE ON public.server_roadmaps FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_roadmaps ON public.server_roadmaps;
CREATE TRIGGER tr_log_roadmaps AFTER INSERT OR UPDATE OR DELETE ON public.server_roadmaps FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ======================
-- VOTES & FAVORITES
-- ======================
DROP TRIGGER IF EXISTS tr_fields_survey_votes ON public.survey_votes;
CREATE TRIGGER tr_fields_survey_votes BEFORE INSERT OR UPDATE ON public.survey_votes FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_survey_votes ON public.survey_votes;
CREATE TRIGGER tr_log_survey_votes AFTER INSERT OR UPDATE OR DELETE ON public.survey_votes FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS tr_fields_art_favs ON public.article_favorites;
CREATE TRIGGER tr_fields_art_favs BEFORE INSERT OR UPDATE ON public.article_favorites FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
DROP TRIGGER IF EXISTS tr_log_art_favs ON public.article_favorites;
CREATE TRIGGER tr_log_art_favs AFTER INSERT OR UPDATE OR DELETE ON public.article_favorites FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();
