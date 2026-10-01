-- Restringe EXECUTE de public.rls_auto_enable() ao owner (postgres).
-- Motivo: Security Advisor do Supabase reportou WARN para anon e authenticated.
-- A função é chamada apenas internamente pelo event trigger ensure_rls;
-- portanto, nenhum role de cliente precisa de EXECUTE.
--
-- Validado no Supabase local: rls_auto_enable() e ensure_rls foram
-- recriados temporariamente no banco local (a partir do snapshot remoto)
-- para o teste; após validação, foram removidos. O local permanece no
-- estado das migrations do Casillas. O REVOKE não interfere no event
-- trigger ensure_rls, que continua habilitando RLS automaticamente em
-- CREATE TABLE.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM service_role;
