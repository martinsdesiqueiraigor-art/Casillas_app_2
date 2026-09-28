create or replace function private.activate_casillas_license(p_license_code text)
returns table (
  license_id uuid,
  entitlement_id uuid,
  product_slug text,
  activated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_code text;
  v_hash text;
  v_license public.licenses;
  v_entitlement public.entitlements;
  v_product_slug text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  v_code := upper(regexp_replace(trim(coalesce(p_license_code, '')), '[[:space:]-]+', '', 'g'));

  if v_code = '' then
    raise exception 'Código de licença inválido';
  end if;

  v_hash := encode(
    extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'),
    'hex'
  );

  select e.*
    into v_entitlement
    from public.entitlements e
    join public.products p
      on p.id = e.product_id
   where e.user_id = v_user_id
     and e.status = 'ACTIVE'
     and e.revoked_at is null
     and (e.valid_until is null or e.valid_until > now())
     and p.slug = 'casillas'
     and p.is_active = true
   limit 1
   for update of e;

  if v_entitlement.id is not null then
    raise exception 'Usuário já possui acesso comercial ao Casillas';
  end if;

  select l.*
    into v_license
    from public.licenses l
    join public.products p
      on p.id = l.product_id
   where l.license_code_hash = v_hash
     and l.status = 'AVAILABLE'
     and p.slug = 'casillas'
     and p.is_active = true
   for update of l;

  if v_license.id is null then
    raise exception 'Código de licença inválido';
  end if;

  select p.slug
    into v_product_slug
    from public.products p
   where p.id = v_license.product_id;

  update public.licenses
     set status = 'ACTIVE',
         activated_by = v_user_id,
         activated_at = now(),
         updated_at = now()
   where id = v_license.id
   returning * into v_license;

  insert into public.entitlements (
    user_id,
    product_id,
    license_id,
    source,
    valid_until,
    revoked_at,
    status,
    valid_from
  )
  values (
    v_user_id,
    v_license.product_id,
    v_license.id,
    'LICENSE',
    null,
    null,
    'ACTIVE',
    now()
  )
  returning * into v_entitlement;

  insert into public.access_events (
    user_id,
    product_id,
    event_type,
    source,
    metadata
  )
  values (
    v_user_id,
    v_license.product_id,
    'LICENSE_ACTIVATED',
    'USER',
    jsonb_build_object('license_id', v_license.id)
  );

  return query
  select
    v_license.id,
    v_entitlement.id,
    v_product_slug,
    v_license.activated_at;
end;
$function$;

revoke all on function private.activate_casillas_license(text)
  from public, anon, authenticated;
grant execute on function private.activate_casillas_license(text)
  to authenticated;
