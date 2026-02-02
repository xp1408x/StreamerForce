CREATE OR REPLACE VIEW public.view_audit_summary AS
SELECT 
    a.created_at as fecha,
    actor.username as administrador,
    a.action as accion,
    a.table_name as tabla,
    target.username as afectado,
    a.old_data,
    a.new_data
FROM public.audit_logs a
LEFT JOIN public.profiles actor ON a.actor_id = actor.id
LEFT JOIN public.profiles target ON a.target_user_id = target.id
ORDER BY a.created_at DESC;