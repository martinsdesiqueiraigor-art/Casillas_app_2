-- LOCAL transactional EV2-02 facade tests; no real commercial accounts.
begin;
select plan(23);
select tests.create_supabase_user(identifier) from (values
 ('lease-license'),('lease-grant'),('lease-normal-trial'),('lease-revoked'),
 ('lease-independent'),('lease-expired'),('lease-other')) u(identifier);
create function pg_temp.access_for(who text) returns jsonb language plpgsql as $$
begin
 perform set_config('request.jwt.claim.sub',tests.get_supabase_uid(who)::text,true);
 return public.get_casillas_access_v2();
end $$;
select ok(to_regprocedure('public.get_casillas_access_v2()') is not null,'V2 access facade exists');
insert into public.licenses(product_id,license_code_hash,status,activated_by,activated_at)
select p.id,'LEASELOCAL'||u.who,'ACTIVE',tests.get_supabase_uid(u.who),now()-interval '20 days'
from public.products p cross join (values ('lease-license'),('lease-revoked'),('lease-independent')) u(who) where p.slug='casillas';
insert into public.entitlements(user_id,product_id,source,license_id,valid_from,valid_until)
select l.activated_by,l.product_id,'LICENSE',l.id,now()-interval '20 days',now()+interval '2 days'
from public.licenses l where l.license_code_hash='LEASELOCALlease-license';
insert into public.entitlements(user_id,product_id,source)
select tests.get_supabase_uid(u.who),p.id,u.source from public.products p
cross join (values ('lease-grant','GRANT'),('lease-independent','ADMIN')) u(who,source) where p.slug='casillas';
insert into public.trials(user_id,product_id,started_at,ends_at)
select tests.get_supabase_uid(u.who),p.id,now()-interval '20 days',u.ends_at from public.products p
cross join (values ('lease-normal-trial',now()+interval '3 days'),('lease-revoked',now()+interval '3 days'),
 ('lease-independent',now()+interval '3 days'),('lease-expired',now()-interval '1 day')) u(who,ends_at) where p.slug='casillas';
update public.licenses set status='REVOKED',revoked_at=now()
where license_code_hash in ('LEASELOCALlease-revoked','LEASELOCALlease-independent');
select is((pg_temp.access_for('lease-license')->>'validated_at')::timestamptz,statement_timestamp(),'validated_at is current PostgreSQL statement time');
select is(pg_temp.access_for('lease-license')->>'source','LICENSE','canonical license grants access');
select is((pg_temp.access_for('lease-license')->>'valid_until')::timestamptz,now()+interval '2 days','commercial end preserved');
select isnt((pg_temp.access_for('lease-license')->>'validated_at')::timestamptz,now()-interval '20 days','license activation time is not validation anchor');
select is((pg_temp.access_for('lease-normal-trial')->>'validated_at')::timestamptz,statement_timestamp(),'trial validation uses current statement time');
select is(pg_temp.access_for('lease-normal-trial')->>'source','TRIAL','canonical trial grants access');
select is((pg_temp.access_for('lease-normal-trial')->>'valid_until')::timestamptz,now()+interval '3 days','trial end becomes valid_until');
select isnt((pg_temp.access_for('lease-normal-trial')->>'validated_at')::timestamptz,now()-interval '20 days','trial start is not validation anchor');
select is(pg_temp.access_for('lease-revoked')->>'state','REVOKED','D1 revocation blocks old trial');
select is((pg_temp.access_for('lease-revoked')->>'has_access')::boolean,false,'no lease for revoked license');
select is((select ends_at from public.trials where user_id=tests.get_supabase_uid('lease-revoked')),now()+interval '3 days','revoked trial history not extended');
select is(pg_temp.access_for('lease-independent')->>'source','ADMIN','independent right survives revoked license');
select is(pg_temp.access_for('lease-grant')->>'valid_until',null::text,'unbounded right retains NULL end');
select is(pg_temp.access_for('lease-expired')->>'state','EXPIRED','expired trial denied');
select is(pg_temp.access_for('lease-grant')->>'user_id',tests.get_supabase_uid('lease-grant')::text,'server binds user identity');
select is(pg_temp.access_for('lease-grant')->>'product','casillas','server selects canonical product');
create temporary table lease_anchor as select pg_temp.access_for('lease-grant') as value;
select cmp_ok((pg_temp.access_for('lease-grant')->>'validated_at')::timestamptz,'>',(select (value->>'validated_at')::timestamptz from lease_anchor),'second validation has fresh anchor without sleep');
select ok(not has_function_privilege('anon','public.get_casillas_access_v2()','EXECUTE'),'anon cannot execute public facade');
select ok(not has_function_privilege('service_role','private.get_casillas_access_v2()','EXECUTE'),'private facade no service role grant');
select is((select proconfig[1] from pg_proc where oid='private.get_casillas_access_v2()'::regprocedure),'search_path=""','private search_path empty');
select is(pg_temp.access_for('lease-other')->>'user_id',tests.get_supabase_uid('lease-other')::text,'other user receives own state');
select is((select count(*) from public.trials where user_id=tests.get_supabase_uid('lease-revoked')),1::bigint,'no new trial after revocation');
select * from finish();
rollback;
