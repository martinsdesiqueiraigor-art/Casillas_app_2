-- EV2-02 facade: reuse canonical commercial getter and canonical online trial flow.
-- Existing RPC signatures and EV2-03/04/06 implementations are untouched.
begin;
create function private.get_casillas_access_v2()
returns jsonb language plpgsql volatile security definer set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_at timestamptz := statement_timestamp();
  v_product uuid;
  v_entitlement record;
  v_trial public.trials;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'Authenticated session required' using errcode='28000';
  end if;
  select id into strict v_product from public.products where slug='casillas' and is_active;
  v_result := jsonb_build_object('contract_version',2,'user_id',v_user,
    'product','casillas','validated_at',v_at,'has_access',false,
    'source',null,'valid_until',null,'state','NO_ACCESS');
  select * into v_entitlement from private.get_casillas_entitlement();
  if v_entitlement.has_access is true then
    return v_result || jsonb_build_object('has_access',true,'state','VALID',
      'source',v_entitlement.source,'valid_until',v_entitlement.valid_until);
  end if;
  -- Same D1 predicate as the canonical trial authority. Never call it after revocation.
  if exists(select 1 from public.licenses
    where activated_by=v_user and product_id=v_product and status='REVOKED') then
    return v_result || jsonb_build_object('state','REVOKED');
  end if;
  -- Avoid a technical exception for the known future trial case, without changing history.
  if exists(select 1 from public.trials where user_id=v_user and product_id=v_product
    and started_at>v_at) then return v_result; end if;
  -- Preserves the existing ONLINE first-trial behavior, using its original authority.
  v_trial := private.start_casillas_trial();
  if v_trial.status='ACTIVE' and v_trial.started_at<=v_at and v_at<v_trial.ends_at then
    return v_result || jsonb_build_object('has_access',true,'state','VALID',
      'source','TRIAL','valid_until',v_trial.ends_at);
  end if;
  return v_result || jsonb_build_object('state',
    case when v_at>=v_trial.ends_at then 'EXPIRED' else 'NO_ACCESS' end);
end;
$function$;
revoke all on function private.get_casillas_access_v2() from public,anon,authenticated,service_role;
grant execute on function private.get_casillas_access_v2() to authenticated;
create function public.get_casillas_access_v2()
returns jsonb language sql volatile security invoker set search_path = ''
as $function$ select private.get_casillas_access_v2() $function$;
revoke all on function public.get_casillas_access_v2() from public,anon,authenticated,service_role;
grant execute on function public.get_casillas_access_v2() to authenticated;
comment on function public.get_casillas_access_v2() is
'EV2-02 access facade. Current PostgreSQL statement_timestamp anchors the offline lease.
Reuses canonical entitlement/trial authorities; online first trial may be created normally.
Negative access invalidates prior leases; this RPC never grants a lease offline.';
commit;
