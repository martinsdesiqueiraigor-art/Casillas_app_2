-- Casillas 2.0
-- Versiona o wrapper publico de ativacao ja existente no ambiente remoto.
-- A implementacao privada permanece na migration 20260928160324.

create or replace function public.activate_casillas_license(p_license_code text)
returns table (license_id uuid, entitlement_id uuid, product_slug text, activated_at timestamptz)
language sql
set search_path = ''
as $function$
  select * from private.activate_casillas_license(p_license_code);
$function$;

revoke all on function public.activate_casillas_license(text)
  from public, anon;

grant execute on function public.activate_casillas_license(text)
to authenticated, service_role;
