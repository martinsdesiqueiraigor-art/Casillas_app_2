-- EV2-06 V1. Expected failures return normally so admitted attempts COMMIT.
-- No historical migration, commercial policy, trial or EV2-03/04 trigger is changed.
begin;

create table private.activation_attempt_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  attempts timestamptz[] not null default '{}'::timestamptz[],
  primary key (user_id, product_id),
  check (cardinality(attempts) <= 20 and array_position(attempts, null) is null)
);
alter table private.activation_attempt_windows enable row level security;
revoke all on table private.activation_attempt_windows from public, anon, authenticated, service_role;

-- Windows are (server_time - duration, server_time]; exact expiration releases quota.
-- Pure private calculation permits deterministic boundary tests without client clock control.
create function private.activation_retry_at(p_attempts timestamptz[], p_at timestamptz)
returns timestamptz language sql immutable security invoker set search_path = ''
as $function$
  select greatest(
    case when count(*) filter (where t > p_at - interval '5 minutes') >= 5
      then min(t) filter (where t > p_at - interval '5 minutes') + interval '5 minutes' end,
    case when count(*) filter (where t > p_at - interval '24 hours') >= 20
      then min(t) filter (where t > p_at - interval '24 hours') + interval '24 hours' end
  ) from unnest(p_attempts) t;
$function$;
revoke all on function private.activation_retry_at(timestamptz[],timestamptz)
  from public, anon, authenticated, service_role;

-- Owner-only helper; account and canonical product are supplied by the authority below.
-- Zero = admitted. Positive seconds = refused; refused calls do not append timestamps.
create function private.admit_activation_attempt(p_user_id uuid, p_product_id uuid)
returns integer language plpgsql volatile security invoker set search_path = ''
as $function$
declare
  v_attempts timestamptz[];
  v_at timestamptz;
  v_retry_at timestamptz;
begin
  insert into private.activation_attempt_windows(user_id,product_id)
    values (p_user_id,p_product_id) on conflict do nothing;
  select w.attempts into strict v_attempts
    from private.activation_attempt_windows w
    where w.user_id=p_user_id and w.product_id=p_product_id for update;
  -- Capture time AFTER obtaining the per-account/product transaction lock.
  v_at := clock_timestamp();
  select coalesce(array_agg(t order by t),'{}'::timestamptz[]) into v_attempts
    from unnest(v_attempts) t where t > v_at - interval '24 hours';
  v_retry_at := private.activation_retry_at(v_attempts,v_at);
  if v_retry_at is not null then
    return greatest(1,ceil(extract(epoch from v_retry_at-v_at))::integer);
  end if;
  update private.activation_attempt_windows
    set attempts=array_append(v_attempts,v_at)
    where user_id=p_user_id and product_id=p_product_id;
  return 0;
end;
$function$;
revoke all on function private.admit_activation_attempt(uuid,uuid)
  from public, anon, authenticated, service_role;

create function private.activate_casillas_license_v2(p_license_code text)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_retry integer;
  v_code text;
  v_hash text;
  v_license public.licenses;
  v_entitlement public.entitlements;
  v_constraint text;
  v_headers jsonb := coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('result','ACTIVATION_DENIED');
  end if;

  -- Do not execute a commercial lookup under a client-requested rollback or singular
  -- table representation: either can cause PostgREST to undo the RPC transaction.
  -- Such transport requests are rejected before admission, input work or key lookup.
  if coalesce(v_headers->>'prefer','') ~* '(^|,)[[:space:]]*tx[[:space:]]*=[[:space:]]*rollback'
     or coalesce(v_headers->>'prefer','') ~* '(^|,)[[:space:]]*max-affected[[:space:]]*='
     or coalesce(v_headers->>'accept','') ~* 'application/vnd[.]pgrst[.]object' then
    return jsonb_build_object('result','INVALID_REQUEST');
  end if;

  select p.id into v_product_id from public.products p
    where p.slug='casillas' and p.is_active=true;
  if v_product_id is null then
    -- Missing canonical product is infrastructure/configuration, not an invalid key.
    raise exception 'Canonical Casillas product missing or inactive';
  end if;
  v_retry := private.admit_activation_attempt(v_user_id,v_product_id);
  if v_retry > 0 then
    return jsonb_build_object('result','RATE_LIMITED','retry_after_seconds',v_retry);
  end if;

  -- Admission persists for every normal refusal below. Never store the supplied code.
  if p_license_code is null or octet_length(p_license_code) > 128 then
    return jsonb_build_object('result','INVALID_REQUEST');
  end if;
  v_code := upper(regexp_replace(trim(p_license_code),'[[:space:]-]+','','g'));
  if char_length(v_code) not between 1 and 64 or v_code collate "C" !~ '^[A-Z0-9]+$' then
    return jsonb_build_object('result','INVALID_REQUEST');
  end if;

  -- Keep EV2-03/04 reservation/integrity rules. Refusal does not consume a license.
  if exists (select 1 from public.entitlements e
    where e.user_id=v_user_id and e.product_id=v_product_id and e.status='ACTIVE') then
    return jsonb_build_object('result','ACTIVATION_DENIED');
  end if;
  v_hash := encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'),'hex');
  select l.* into v_license from public.licenses l
    where l.license_code_hash=v_hash and l.product_id=v_product_id
      and l.status='AVAILABLE' for update;
  if v_license.id is null then
    return jsonb_build_object('result','ACTIVATION_DENIED');
  end if;

  -- Commercial writes are a subtransaction: only the known unique reservation race
  -- is a normal refusal. Admission is outside it; any other integrity error escapes.
  begin
    update public.licenses set status='ACTIVE',activated_by=v_user_id,
      activated_at=now(),updated_at=now() where id=v_license.id returning * into v_license;
    insert into public.entitlements(user_id,product_id,license_id,source,valid_until,revoked_at,status,valid_from)
      values (v_user_id,v_product_id,v_license.id,'LICENSE',null,null,'ACTIVE',now())
      returning * into v_entitlement;
    insert into public.access_events(user_id,product_id,event_type,source,metadata)
      values (v_user_id,v_product_id,'LICENSE_ACTIVATED','USER',
        jsonb_build_object('license_id',v_license.id));
  exception when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint <> 'entitlements_one_active_per_user_product' then
      raise;
    end if;
    return jsonb_build_object('result','ACTIVATION_DENIED');
  end;
  return jsonb_build_object('result','SUCCESS','license_id',v_license.id,
    'entitlement_id',v_entitlement.id,'product_slug','casillas','activated_at',v_license.activated_at);
end;
$function$;
revoke all on function private.activate_casillas_license_v2(text)
  from public, anon, authenticated, service_role;
-- Needed only for the public SECURITY INVOKER wrapper; not a limiter-free helper.
grant execute on function private.activate_casillas_license_v2(text) to authenticated;

create function public.activate_casillas_license_v2(p_license_code text)
returns jsonb language sql volatile security invoker set search_path = ''
as $function$ select private.activate_casillas_license_v2(p_license_code) $function$;
revoke all on function public.activate_casillas_license_v2(text)
  from public, anon, authenticated, service_role;
grant execute on function public.activate_casillas_license_v2(text) to authenticated;

-- Same legacy signature and success format. Zero rows on any normal refusal.
-- No unguarded activation core/alias is retained.
create or replace function private.activate_casillas_license(p_license_code text)
returns table (license_id uuid, entitlement_id uuid, product_slug text, activated_at timestamptz)
language plpgsql volatile security definer set search_path = ''
as $function$
declare v_result jsonb;
begin
  v_result := private.activate_casillas_license_v2(p_license_code);
  if v_result->>'result'='SUCCESS' then
    return query select (v_result->>'license_id')::uuid,
      (v_result->>'entitlement_id')::uuid,v_result->>'product_slug',
      (v_result->>'activated_at')::timestamptz;
  end if;
end;
$function$;

comment on table private.activation_attempt_windows is
'EV2-06: up to 20 admitted timestamps per account/product; 5/5min and 20/24h sliding limits.
No codes, hashes, IPs or commercial refusal details stored. Old timestamps pruned on admission.';
comment on function public.activate_casillas_license_v2(text) is
'Authenticated Casillas-only activation: SUCCESS, INVALID_REQUEST, ACTIVATION_DENIED or RATE_LIMITED.
Normal refusals preserve admitted quota; success must still be followed by entitlement revalidation.
Transport rollback/singular representation requests never reach admission or commercial lookup.';
commit;
