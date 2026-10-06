-- EV2-03/04 behavioral regression. Fixtures are LOCAL-only and rolled back.
begin;
select plan(54);
select tests.create_supabase_user(identifier)
from (values ('ev2-before'),('ev2-start'),('ev2-inside'),('ev2-end'),('ev2-after'),
 ('ev2-noend'),('ev2-future-noend'),('ev2-revoke'),('ev2-atomic'),
 ('ev2-license-future'),('ev2-license-expired'),('ev2-existing-trial'),
 ('ev2-orphan'),('ev2-grant'),('ev2-promotion'),('ev2-admin'),('ev2-normal-trial')) f(identifier);

create function pg_temp.ev2_hash(text) returns text language sql immutable
as $$ select encode(extensions.digest(convert_to($1, 'UTF8'), 'sha256'), 'hex') $$;

insert into public.entitlements(user_id, product_id, source, valid_from, valid_until)
select tests.get_supabase_uid(f.identifier), p.id, 'GRANT', f.start_at, f.end_at
from (values
 ('ev2-before', now()+interval '1 hour', now()+interval '2 hours'),
 ('ev2-start', now(), now()+interval '1 hour'),
 ('ev2-inside', now()-interval '1 hour', now()+interval '1 hour'),
 ('ev2-end', now()-interval '1 hour', now()),
 ('ev2-after', now()-interval '2 hours', now()-interval '1 hour'),
 ('ev2-noend', now()-interval '1 hour', null::timestamptz),
 ('ev2-future-noend', now()+interval '1 hour', null::timestamptz)
) f(identifier,start_at,end_at)
cross join public.products p where p.slug='casillas';

select tests.authenticate_as('ev2-before');
select is((select count(*) from public.get_casillas_entitlement()), 0::bigint, 'A: before valid_from denies entitlement access');
reset role;

select tests.authenticate_as('ev2-start');
select is((select count(*) from public.get_casillas_entitlement()), 1::bigint, 'B: valid_from boundary is inclusive');
reset role;

select tests.authenticate_as('ev2-inside');
select is((select count(*) from public.get_casillas_entitlement()), 1::bigint, 'C: inside the interval grants access');
reset role;

select tests.authenticate_as('ev2-end');
select is((select count(*) from public.get_casillas_entitlement()), 0::bigint, 'D: valid_until boundary is exclusive');
reset role;

select tests.authenticate_as('ev2-after');
select is((select count(*) from public.get_casillas_entitlement()), 0::bigint, 'E: after valid_until denies access');
reset role;

select tests.authenticate_as('ev2-noend');
select is((select count(*) from public.get_casillas_entitlement()), 1::bigint, 'F: NULL valid_until is unbounded after the start');
reset role;

select tests.authenticate_as('ev2-future-noend');
select is((select count(*) from public.get_casillas_entitlement()), 0::bigint, 'F: NULL end does not bypass a future start');
reset role;


-- Licenses are synthetic transaction fixtures, never generated real codes.
insert into public.licenses(product_id,license_code_hash)
select p.id, pg_temp.ev2_hash(f.code)
from (values ('EV2LOCALREVOKE'),('EV2LOCALATOMIC'),('EV2LOCALFUTURE'),
 ('EV2LOCALEXPIRED'),('EV2LOCALTRIAL')) f(code)
cross join public.products p where p.slug='casillas';

select tests.authenticate_as('ev2-revoke');
select lives_ok($$select * from public.activate_casillas_license('EV2LOCALREVOKE')$$,
 'Activation without a reservation succeeds');
select is((select count(*) from public.get_casillas_entitlement()),1::bigint,
 'Activated license grants authoritative access');
reset role;

update public.licenses set status='REVOKED', revoked_at=now()
where license_code_hash=pg_temp.ev2_hash('EV2LOCALREVOKE');

select tests.authenticate_as('ev2-revoke');
select is((select count(*) from public.get_casillas_entitlement()),0::bigint,
 'G: revoked backing license no longer grants access');
select throws_ok($$select * from public.start_casillas_trial()$$,'P0001',
 'Licenca revogada impede acesso por trial',
 'J: access fallback cannot automatically create a trial after revocation');
reset role;
select is((select count(*) from public.trials where user_id=tests.get_supabase_uid('ev2-revoke')),
 0::bigint,'J: revocation and fallback created no trial');
select ok(exists(select 1 from public.entitlements e join public.licenses l on l.id=e.license_id
 where e.user_id=tests.get_supabase_uid('ev2-revoke') and e.status='REVOKED'
 and e.revoked_at=l.revoked_at),'Dependent entitlement has the same revocation timestamp');
select is((select count(*) from public.access_events where event_type='LICENSE_REVOKED'
 and user_id=tests.get_supabase_uid('ev2-revoke')),1::bigint,'Revocation is audited once');
select ok(exists(select 1 from public.access_events a join public.entitlements e
 on a.metadata->'dependent_entitlement_ids' @> jsonb_build_array(e.id)
 where a.event_type='LICENSE_REVOKED' and e.user_id=tests.get_supabase_uid('ev2-revoke')
 and a.metadata->>'license_id'=e.license_id::text),'Audit links license and dependent entitlement IDs');
update public.licenses set status='REVOKED' where license_code_hash=pg_temp.ev2_hash('EV2LOCALREVOKE');
select is((select count(*) from public.access_events where event_type='LICENSE_REVOKED'
 and user_id=tests.get_supabase_uid('ev2-revoke')),1::bigint,'Repeated revocation does not duplicate audit');
select throws_ok($$update public.entitlements set status='ACTIVE', revoked_at=null
 where user_id=tests.get_supabase_uid('ev2-revoke')$$,'P0001',
 'Entitlement LICENSE exige licenca ativa da mesma conta e produto',
 'A dependent entitlement cannot be reactivated behind a revoked license');
select throws_ok($$insert into public.entitlements(user_id,product_id,source)
 select tests.get_supabase_uid('ev2-orphan'),id,'LICENSE' from public.products where slug='casillas'$$,
 'P0001','Entitlement LICENSE exige licenca ativa da mesma conta e produto',
 'Orphan LICENSE entitlement cannot grant access');
delete from public.entitlements where user_id=tests.get_supabase_uid('ev2-orphan');

-- Independent rights stay byte-for-byte intact when a license is revoked.
insert into public.licenses(product_id,license_code_hash,status,activated_by,activated_at)
select p.id,pg_temp.ev2_hash(f.code),'ACTIVE',tests.get_supabase_uid(f.identifier),now()
from (values ('ev2-grant','EV2LOCALGRANT'),('ev2-promotion','EV2LOCALPROMO'),
 ('ev2-admin','EV2LOCALADMIN')) f(identifier,code)
cross join public.products p where p.slug='casillas';
insert into public.entitlements(user_id,product_id,source,valid_from)
select tests.get_supabase_uid(f.identifier),p.id,f.source,now()
from (values ('ev2-grant','GRANT'),('ev2-promotion','PROMOTION'),('ev2-admin','ADMIN')) f(identifier,source)
cross join public.products p where p.slug='casillas';
create temporary table ev2_independent_before as select id,to_jsonb(e) as snapshot
from public.entitlements e where user_id in
 (tests.get_supabase_uid('ev2-grant'),tests.get_supabase_uid('ev2-promotion'),tests.get_supabase_uid('ev2-admin'));
update public.licenses set status='REVOKED',revoked_at=now() where license_code_hash in
 (pg_temp.ev2_hash('EV2LOCALGRANT'),pg_temp.ev2_hash('EV2LOCALPROMO'),pg_temp.ev2_hash('EV2LOCALADMIN'));
select is((select count(*) from public.entitlements e join ev2_independent_before b on b.id=e.id
 where to_jsonb(e)=b.snapshot),3::bigint,'H: GRANT, PROMOTION and ADMIN entitlements are intact');

select tests.authenticate_as('ev2-grant');
select is((select count(*) from public.get_casillas_entitlement()),1::bigint,'H: independent GRANT still grants access');
reset role;

select tests.authenticate_as('ev2-promotion');
select is((select count(*) from public.get_casillas_entitlement()),1::bigint,'H: independent PROMOTION still grants access');
reset role;

select tests.authenticate_as('ev2-admin');
select is((select count(*) from public.get_casillas_entitlement()),1::bigint,'H: independent ADMIN still grants access');
reset role;


-- Fault injection: dependent-write failure must roll back the whole revocation.
select tests.authenticate_as('ev2-atomic');
select lives_ok($$select * from public.activate_casillas_license('EV2LOCALATOMIC')$$,
 'Atomicity fixture activation succeeds');
reset role;
create function pg_temp.ev2_fail_revocation() returns trigger language plpgsql as $$
begin
 if new.user_id=tests.get_supabase_uid('ev2-atomic') and new.status='REVOKED' then
   raise exception 'EV2_TEST_REVOCATION_FAILURE';
 end if;
 return new;
end;
$$;
create trigger ev2_test_fail_revocation before update on public.entitlements
for each row execute function pg_temp.ev2_fail_revocation();
select throws_ok($$update public.licenses set status='REVOKED',revoked_at=now()
 where license_code_hash=pg_temp.ev2_hash('EV2LOCALATOMIC')$$,'P0001','EV2_TEST_REVOCATION_FAILURE',
 'I: failure in dependent update aborts license revocation');
select is((select status from public.licenses where license_code_hash=pg_temp.ev2_hash('EV2LOCALATOMIC')),
 'ACTIVE','I: license remains ACTIVE after failed revocation');
select is((select status from public.entitlements where user_id=tests.get_supabase_uid('ev2-atomic')),
 'ACTIVE','I: entitlement remains coherent after rollback');
select is((select count(*) from public.access_events where event_type='LICENSE_REVOKED'
 and user_id=tests.get_supabase_uid('ev2-atomic')),0::bigint,'I: failed revocation leaves no audit event');
drop trigger ev2_test_fail_revocation on public.entitlements;

-- Future and expired reservations never consume a code or get silently revoked.
insert into public.entitlements(user_id,product_id,source,valid_from,valid_until)
select tests.get_supabase_uid(f.identifier),p.id,'GRANT',f.start_at,f.end_at
from (values ('ev2-license-future',now()+interval '1 hour',null::timestamptz),
 ('ev2-license-expired',now()-interval '2 hours',now()-interval '1 hour')) f(identifier,start_at,end_at)
cross join public.products p where p.slug='casillas';

select tests.authenticate_as('ev2-license-future');
select is((select count(*) from public.get_casillas_entitlement()),0::bigint,'K: ev2-license-future is not current access');
select is((select count(*) from public.activate_casillas_license('EV2LOCALFUTURE')),0::bigint,
 'K: ev2-license-future reservation rejects activation before code consumption');
reset role;
select ok(exists(select 1 from public.licenses where license_code_hash=pg_temp.ev2_hash('EV2LOCALFUTURE')
 and status='AVAILABLE' and activated_by is null and activated_at is null),
 'K: EV2LOCALFUTURE remains untouched');
select ok(exists(select 1 from public.entitlements where user_id=tests.get_supabase_uid('ev2-license-future')
 and source='GRANT' and status='ACTIVE' and revoked_at is null),
 'K: independent reservation is preserved');
select is((select count(*) from public.access_events where event_type='LICENSE_ACTIVATED'
 and user_id=tests.get_supabase_uid('ev2-license-future')),0::bigint,'K: rejected activation leaves no activation event');

select tests.authenticate_as('ev2-license-expired');
select is((select count(*) from public.get_casillas_entitlement()),0::bigint,'K: ev2-license-expired is not current access');
select is((select count(*) from public.activate_casillas_license('EV2LOCALEXPIRED')),0::bigint,
 'K: ev2-license-expired reservation rejects activation before code consumption');
reset role;
select ok(exists(select 1 from public.licenses where license_code_hash=pg_temp.ev2_hash('EV2LOCALEXPIRED')
 and status='AVAILABLE' and activated_by is null and activated_at is null),
 'K: EV2LOCALEXPIRED remains untouched');
select ok(exists(select 1 from public.entitlements where user_id=tests.get_supabase_uid('ev2-license-expired')
 and source='GRANT' and status='ACTIVE' and revoked_at is null),
 'K: independent reservation is preserved');
select is((select count(*) from public.access_events where event_type='LICENSE_ACTIVATED'
 and user_id=tests.get_supabase_uid('ev2-license-expired')),0::bigint,'K: rejected activation leaves no activation event');


-- A pre-existing trial is retained as history, but cannot restore access.
insert into public.trials(user_id,product_id,status,started_at,ends_at)
select tests.get_supabase_uid('ev2-existing-trial'),id,'ACTIVE',now()-interval '1 day',now()+interval '29 days'
from public.products where slug='casillas';
create temporary table ev2_trial_before as select id,to_jsonb(t) as snapshot
from public.trials t where user_id=tests.get_supabase_uid('ev2-existing-trial');
select tests.authenticate_as('ev2-existing-trial');
select lives_ok($$select * from public.activate_casillas_license('EV2LOCALTRIAL')$$,
 'License can be activated while an independent trial exists');
reset role;
update public.licenses set status='REVOKED',revoked_at=now()
where license_code_hash=pg_temp.ev2_hash('EV2LOCALTRIAL');
select tests.authenticate_as('ev2-existing-trial');
select throws_ok($$select * from public.start_casillas_trial()$$,'P0001',
 'Licenca revogada impede acesso por trial','D1: old valid trial cannot restore access after revocation');
reset role;
select ok(exists(select 1 from public.trials t join ev2_trial_before b on b.id=t.id
 where to_jsonb(t)=b.snapshot),'D1: trial history, status and dates are unchanged');
select tests.authenticate_as('ev2-normal-trial');
select is((public.start_casillas_trial()).status,'ACTIVE',
 'D1: normal trial still works without license revocation');
reset role;

-- Existing ACTIVE access still blocks activation without consuming another code.
select tests.authenticate_as('ev2-noend');
select is((select count(*) from public.activate_casillas_license('EV2LOCALFUTURE')),0::bigint,
 'Current commercial access remains a real conflict');
reset role;
select is((select status from public.licenses where license_code_hash=pg_temp.ev2_hash('EV2LOCALFUTURE')),
 'AVAILABLE','Real active conflict also preserves the code');

-- Ordinary users cannot mutate commercial state or invoke trigger functions.
select tests.authenticate_as('ev2-revoke');
select throws_ok($$update public.licenses set status='ACTIVE'$$,'42501',null::text,
 'Authenticated role cannot revoke/reactivate licenses directly');
select throws_ok($$update public.entitlements set status='ACTIVE'$$,'42501',null::text,
 'Authenticated role cannot write entitlements directly');
reset role;
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.proname in ('revoke_license_entitlements','enforce_entitlement_license_dependency','enforce_terminal_license_revocation')
 and has_function_privilege('authenticated',p.oid,'EXECUTE')),
 'Trigger functions are not executable by authenticated');

-- Temporal revocation covers both future and expired LICENSE dependencies.
insert into public.licenses(product_id,license_code_hash,status,activated_by,activated_at)
select p.id,pg_temp.ev2_hash(f.code),'ACTIVE',tests.get_supabase_uid(f.identifier),now()
from (values ('ev2-license-future','EV2BOUNDARYFUTURE'),
 ('ev2-license-expired','EV2BOUNDARYEXPIRED')) f(identifier,code)
cross join public.products p where p.slug='casillas';
update public.entitlements e set source='LICENSE',license_id=l.id
from public.licenses l
where e.user_id=l.activated_by and l.license_code_hash in
 (pg_temp.ev2_hash('EV2BOUNDARYFUTURE'),pg_temp.ev2_hash('EV2BOUNDARYEXPIRED'));
update public.licenses set status='REVOKED',revoked_at=now() where license_code_hash in
 (pg_temp.ev2_hash('EV2BOUNDARYFUTURE'),pg_temp.ev2_hash('EV2BOUNDARYEXPIRED'));
select is((select count(*) from public.entitlements
 where user_id in (tests.get_supabase_uid('ev2-license-future'),tests.get_supabase_uid('ev2-license-expired'))
 and source='LICENSE' and status='REVOKED'),2::bigint,
 'G: future and expired dependent entitlements are also revoked');

-- Trial cannot return future evaluation access, and its stored dates remain intact.
insert into public.trials(user_id,product_id,status,started_at,ends_at)
select tests.get_supabase_uid('ev2-before'),id,'ACTIVE',now()+interval '1 day',now()+interval '31 days'
from public.products where slug='casillas';
select tests.authenticate_as('ev2-before');
select throws_ok($$select * from public.start_casillas_trial()$$,'P0001',
 'Periodo de teste ainda nao vigente','Future trial does not grant access through the RPC');
reset role;
select is((select started_at from public.trials where user_id=tests.get_supabase_uid('ev2-before')),
 now()+interval '1 day','Future trial dates are not reset');


-- D3: ordinary service_role writes cannot undo revocation or rewrite its time.
-- Use fixture hash inline: service_role does not need access to test-private helpers.
set local role service_role;
select throws_ok($$update public.licenses set status='ACTIVE',revoked_at=null
 where license_code_hash=encode(extensions.digest(convert_to('EV2LOCALREVOKE','UTF8'),'sha256'),'hex')$$,
 'P0001','REVOKED e estado terminal da licenca','D3: service_role cannot change REVOKED to ACTIVE');
select throws_ok($$update public.licenses set status='AVAILABLE',revoked_at=null,activated_by=null,activated_at=null
 where license_code_hash=encode(extensions.digest(convert_to('EV2LOCALREVOKE','UTF8'),'sha256'),'hex')$$,
 'P0001','REVOKED e estado terminal da licenca','D3: service_role cannot change REVOKED to AVAILABLE');
select throws_ok($$update public.licenses set revoked_at=revoked_at+interval '1 second'
 where license_code_hash=encode(extensions.digest(convert_to('EV2LOCALREVOKE','UTF8'),'sha256'),'hex')$$,
 'P0001','revoked_at e imutavel apos revogacao','D3: service_role cannot rewrite revoked_at');
reset role;

-- D2: test both CHECK branches, including historical non-active rows.
select throws_ok($$insert into public.entitlements(user_id,product_id,source,status,revoked_at)
 select tests.get_supabase_uid('ev2-orphan'),id,'LICENSE','REVOKED',now()
 from public.products where slug='casillas'$$,'23514',
 'new row for relation "entitlements" violates check constraint "entitlements_source_license_consistency"',
 'D2: LICENSE requires license_id even when revoked');
select throws_ok($$insert into public.entitlements(user_id,product_id,source,license_id)
 select tests.get_supabase_uid('ev2-orphan'),product_id,'GRANT',id
 from public.licenses where license_code_hash=pg_temp.ev2_hash('EV2LOCALREVOKE')$$,'23514',
 'new row for relation "entitlements" violates check constraint "entitlements_source_license_consistency"',
 'D2: independent source cannot carry license_id');

select * from finish();
rollback;
