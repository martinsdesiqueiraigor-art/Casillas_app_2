-- CASILLAS 2.1 / BL-02: prerequisite reconciliation approved for LOCAL validation.
-- Version 20261001023218 encodes logical ordering before the ACL hardening,
-- not the unknown historical installation date of these remote objects.
-- Source: C:\Backups\Casillas\2026-10-01-g3-rls\01-rls_auto_enable-def.sql
-- SHA-256: 11C789A01A2BF5A975F4795EB919A71B6C0ABFC47FF5C9EAE17013AFC32438DF
-- Trigger metadata: 03-ensure_rls-trigger.txt and 05-dependencias.txt.
-- Run as postgres, matching the captured owner of the function and trigger.
-- Creation only: existing objects fail instead of being silently replaced.
-- Function body preserved: exceptions log failure without rethrowing.
-- Trigger DDL reconstructed from metadata; historical OIDs are not portable.
-- The following migration retains responsibility for the EXECUTE ACL hardening.
CREATE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE EVENT TRIGGER ensure_rls
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
EXECUTE FUNCTION public.rls_auto_enable();
