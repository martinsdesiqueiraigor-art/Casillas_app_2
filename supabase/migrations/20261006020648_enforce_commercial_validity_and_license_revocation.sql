-- CASILLAS 2.1 / EV2-03 + EV2-04. Local candidate; no remote application.
-- Existing RPC signatures, RLS, grants and unique index are preserved.
begin;

-- D3: terminal revocation applies to ordinary privileged UPDATEs too.
create function private.enforce_terminal_license_revocation()
returns trigger language plpgsql security invoker set search_path = ''
as $function$
begin
  if old.status = 'REVOKED' then
    if new.status is distinct from old.status then
      raise exception 'REVOKED e estado terminal da licenca';
    end if;
    if new.revoked_at is distinct from old.revoked_at then
      raise exception 'revoked_at e imutavel apos revogacao';
    end if;
  end if;
  return new;
end;
$function$;
revoke all on function private.enforce_terminal_license_revocation()
  from public, anon, authenticated, service_role;
create trigger licenses_enforce_terminal_revocation
before update of status, revoked_at on public.licenses
for each row execute function private.enforce_terminal_license_revocation();

-- D2: fail before changing legacy rows; their intended origin is unknown.
-- Constraint takes a table lock and revalidates, also covering concurrent writes.
do $migration$
declare v_inconsistent bigint;
begin
  select count(*) into v_inconsistent from public.entitlements
  where (source = 'LICENSE') is distinct from (license_id is not null);
  if v_inconsistent > 0 then
    raise exception using errcode = '23514',
      message = 'EV2 source/license_id inconsistentes: ' || v_inconsistent::text,
      hint = 'Revisar os dados com autoridade explicita; nenhuma origem foi inferida.';
  end if;
end;
$migration$;
alter table public.entitlements
  add constraint entitlements_source_license_consistency
  check ((source = 'LICENSE') = (license_id is not null));

create or replace function private.get_casillas_entitlement()
returns table (has_access boolean, source text, valid_until timestamptz)
language sql stable security definer set search_path = ''
as $function$
  select true, e.source, e.valid_until
  from public.entitlements e join public.products p on p.id = e.product_id
  where e.user_id = (select auth.uid()) and e.status = 'ACTIVE'
    and e.revoked_at is null and p.slug = 'casillas' and p.is_active = true
    and e.valid_from <= now() and (e.valid_until is null or now() < e.valid_until)
    and (e.source <> 'LICENSE' or exists (
      select 1 from public.licenses l where l.id = e.license_id
        and l.status = 'ACTIVE' and l.revoked_at is null
        and l.activated_by = e.user_id and l.product_id = e.product_id
    ))
  limit 1;
$function$;

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
     and e.valid_from <= now()
     and (e.valid_until is null or e.valid_until > now())
     and (e.source <> 'LICENSE' or exists (
       select 1 from public.licenses l
       where l.id = e.license_id and l.status = 'ACTIVE' and l.revoked_at is null
         and l.activated_by = e.user_id and l.product_id = e.product_id
     ))
     and p.slug = 'casillas'
     and p.is_active = true
   limit 1
   for update of e;

  if v_entitlement.id is not null then
    raise exception 'Usuário já possui acesso comercial ao Casillas';
  end if;

  -- Preserve the one-ACTIVE-row invariant and independent/future grants.
  -- Non-current reservations are NOT access. Reject before touching the code.
  if exists (
    select 1 from public.entitlements e
    join public.products p on p.id = e.product_id
    where e.user_id = v_user_id and e.status = 'ACTIVE' and p.slug = 'casillas'
  ) then
    raise exception 'Entitlement fora da vigencia ou sem licenca valida; codigo preservado';
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

create or replace function private.start_casillas_trial()
returns public.trials
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_product_id uuid;
  v_trial public.trials;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  select id
    into v_product_id
    from public.products
   where slug = 'casillas'
     and is_active = true;

  if v_product_id is null then
    raise exception 'Produto Casillas não encontrado ou inativo';
  end if;

  -- D1: any revoked license for this account/product blocks trial fallback.
  -- Existing trial records remain untouched; valid commercial rights use the getter.
  if exists (
    select 1 from public.licenses l
    where l.activated_by = auth.uid() and l.product_id = v_product_id
      and l.status = 'REVOKED'
  ) then
    raise exception 'Licenca revogada impede acesso por trial';
  end if;

  insert into public.trials (
    user_id,
    product_id,
    status,
    started_at,
    ends_at
  )
  values (
    auth.uid(),
    v_product_id,
    'ACTIVE',
    now(),
    now() + interval '30 days'
  )
  on conflict (user_id, product_id)
  do update set
    status = case
      when public.trials.ends_at > now()
        then public.trials.status
      else 'EXPIRED'
    end
  returning * into v_trial;

  if v_trial.started_at > now() then
    raise exception 'Periodo de teste ainda nao vigente';
  end if;
  return v_trial;
end;
$function$;
-- Explicit dependency: source LICENSE plus license_id. Other sources are independent.
-- FOR SHARE serializes dependent-entitlement writes with license revocation.
create function private.enforce_entitlement_license_dependency()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare v_license public.licenses;
begin
  if new.source = 'LICENSE' and new.status = 'ACTIVE' then
    select l.* into v_license from public.licenses l
      where l.id = new.license_id for share;
    if not found or v_license.status <> 'ACTIVE' or v_license.revoked_at is not null
       or v_license.activated_by is distinct from new.user_id
       or v_license.product_id is distinct from new.product_id then
      raise exception 'Entitlement LICENSE exige licenca ativa da mesma conta e produto';
    end if;
  end if;
  return new;
end;
$function$;
revoke all on function private.enforce_entitlement_license_dependency()
  from public, anon, authenticated, service_role;
create trigger entitlements_enforce_license_dependency
before insert or update on public.entitlements
for each row execute function private.enforce_entitlement_license_dependency();

create function private.revoke_license_entitlements()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare v_entitlement_ids jsonb;
begin
  with revoked as (
    update public.entitlements e
       set status = 'REVOKED', revoked_at = new.revoked_at
     where e.source = 'LICENSE' and e.license_id = new.id and e.status = 'ACTIVE'
     returning e.id
  )
  select coalesce(jsonb_agg(id), '[]'::jsonb) into v_entitlement_ids from revoked;
  insert into public.access_events(user_id, product_id, event_type, source, metadata)
  values (new.activated_by, new.product_id, 'LICENSE_REVOKED', 'SYSTEM',
    jsonb_build_object('license_id', new.id, 'revoked_at', new.revoked_at,
      'dependent_entitlement_ids', v_entitlement_ids, 'actor_user_id', auth.uid()));
  return new;
end;
$function$;
revoke all on function private.revoke_license_entitlements()
  from public, anon, authenticated, service_role;
create trigger licenses_revoke_dependent_entitlements
after update of status, revoked_at on public.licenses
for each row
when (new.status = 'REVOKED' and old.status is distinct from new.status)
execute function private.revoke_license_entitlements();

-- Reconcile stale pre-existing dependencies atomically; independent grants stay intact.
with reconciled as (
  update public.entitlements e set status = 'REVOKED', revoked_at = l.revoked_at
    from public.licenses l
   where e.source = 'LICENSE' and e.license_id = l.id
     and e.status = 'ACTIVE' and l.status = 'REVOKED'
   returning e.id, e.license_id
), grouped as (
  select license_id, jsonb_agg(id) as entitlement_ids
    from reconciled group by license_id
)
insert into public.access_events(user_id, product_id, event_type, source, metadata)
select l.activated_by, l.product_id, 'LICENSE_REVOKED', 'SYSTEM',
  jsonb_build_object('license_id', l.id, 'revoked_at', l.revoked_at,
    'dependent_entitlement_ids', g.entitlement_ids,
    'reason', 'EV2-04 dependency reconciliation')
from grouped g join public.licenses l on l.id = g.license_id;

comment on function private.get_casillas_entitlement() is
'Authoritative access in [valid_from, valid_until); NULL end is unbounded.
LICENSE requires an ACTIVE backing license for the same account/product.
Returns zero rows when no entitlement qualifies.';
comment on function private.revoke_license_entitlements() is
'Atomic cascade and audit on license revocation; only source LICENSE + matching license_id.
Independent grants and trial history are preserved. Trial fallback is blocked separately.';
comment on function private.start_casillas_trial() is
'Blocks trial fallback after any revoked license for the same account/product.
Trial history is retained; new licenses and independent valid entitlements use the commercial getter.';
commit;
