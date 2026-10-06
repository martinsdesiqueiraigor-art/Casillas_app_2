-- EV2-06: behavioral tests; all fixtures are synthetic LOCAL and rolled back.
begin;
select plan(40);
select has_function('public', 'activate_casillas_license_v2', array['text'], 'Structured RPC exists');
select tests.create_supabase_user(identifier)
from (values ('rate-short'),('rate-other'),('rate-input'),('rate-day'),('rate-valid'),
 ('rate-legacy'),('rate-conflict'),('rate-future'),('rate-expired')) f(identifier);
insert into public.products(slug,name) values ('rate-test-product','Synthetic product');

-- Exact deterministic time edges: the helper is private, immutable and never exposed.
select is(private.activation_retry_at(array_fill(now()-interval '5 minutes',array[5]),now()),
 null::timestamptz,'Exactly five minutes old is outside the short window');
select is(private.activation_retry_at(array_fill(now(),array[5]),now()),
 now()+interval '5 minutes','Five admitted attempts fill the short window');
select is(private.activation_retry_at(array_fill(now()-interval '24 hours',array[20]),now()),
 null::timestamptz,'Exactly 24 hours old is outside the daily window');
select is(private.activation_retry_at(array_fill(now()-interval '1 hour',array[20]),now()),
 now()+interval '23 hours','Daily limit uses a moving 24 hour window');

select tests.authenticate_as('rate-short');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','First invalid code admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Second invalid code admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Third invalid code admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Fourth invalid code admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Fifth invalid code admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','RATE_LIMITED','Sixth blocked');
reset role;
select is((select cardinality(attempts) from private.activation_attempt_windows where user_id=tests.get_supabase_uid('rate-short')),5,'Blocked call does not append an admitted attempt');

select tests.authenticate_as('rate-other');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Another account has independent quota');
reset role;
select is(private.admit_activation_attempt(tests.get_supabase_uid('rate-short'),
 (select id from public.products where slug='rate-test-product')),0,'Legitimate product quotas are isolated internally');
select is((select cardinality(attempts) from private.activation_attempt_windows
 where user_id=tests.get_supabase_uid('rate-short') and product_id=(select id from public.products where slug='casillas')),5,'Other product never resets Casillas quota');
update private.activation_attempt_windows set attempts=array_fill(clock_timestamp()-interval '5 minutes 1 second',array[5])
 where user_id=tests.get_supabase_uid('rate-short') and product_id=(select id from public.products where slug='casillas');
select tests.authenticate_as('rate-short');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Short window expiration admits another attempt');
reset role;

insert into private.activation_attempt_windows(user_id,product_id,attempts)
select tests.get_supabase_uid('rate-day'),id,array_fill(clock_timestamp()-interval '1 hour',array[19])
 from public.products where slug='casillas';
select tests.authenticate_as('rate-day');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','ACTIVATION_DENIED','Twentieth attempt in 24h admitted');
select is(public.activate_casillas_license_v2('NOTAREALCODE')->>'result','RATE_LIMITED','Twenty first attempt blocked');
reset role;

select tests.authenticate_as('rate-input');
select is(public.activate_casillas_license_v2(null)->>'result','INVALID_REQUEST','NULL is controlled');
select is(public.activate_casillas_license_v2('')->>'result','INVALID_REQUEST','Empty input is controlled');
select is(public.activate_casillas_license_v2('INVALID!')->>'result','INVALID_REQUEST','Non ASCII-alphanumeric rejected');
select is(public.activate_casillas_license_v2(repeat('A',129))->>'result','INVALID_REQUEST','129 raw UTF8 bytes rejected');
select is(public.activate_casillas_license_v2(repeat('é',65))->>'result','INVALID_REQUEST','UTF8 byte bound is not a character bound');
reset role;
select is((select cardinality(attempts) from private.activation_attempt_windows where user_id=tests.get_supabase_uid('rate-input')),5,'Invalid input consumes each admitted attempt');

insert into public.licenses(product_id,license_code_hash)
select id,encode(extensions.digest('RATEVALIDCODE','sha256'),'hex') from public.products where slug='casillas';
select tests.authenticate_as('rate-valid');
select is(public.activate_casillas_license_v2(' rate-valid-code ')->>'result','SUCCESS','Normalized valid activation succeeds');
select is((select count(*) from public.get_casillas_entitlement()),1::bigint,'Successful activation still creates authoritative access');
reset role;

select tests.authenticate_as('rate-legacy');
select is((select count(*) from public.activate_casillas_license('INVALIDCODE')),0::bigint,'Public legacy failure returns no success rows');
select is((select count(*) from private.activate_casillas_license('INVALIDCODE')),0::bigint,'Private legacy failure also returns no success rows');
select is(public.activate_casillas_license_v2('INVALIDCODE')->>'result','ACTIVATION_DENIED','Structured route shares commercial failure class');
reset role;
select is((select cardinality(attempts) from private.activation_attempt_windows where user_id=tests.get_supabase_uid('rate-legacy')),3,'Legacy and structured failures persist in the same quota');

insert into public.entitlements(user_id,product_id,source,valid_from,valid_until)
select tests.get_supabase_uid(f.identifier),p.id,'GRANT',f.start_at,f.end_at
 from (values ('rate-conflict',now()-interval '1 hour',null::timestamptz),
 ('rate-future',now()+interval '1 hour',null::timestamptz),
 ('rate-expired',now()-interval '2 hours',now()-interval '1 hour')) f(identifier,start_at,end_at)
 cross join public.products p where p.slug='casillas';
select tests.authenticate_as('rate-conflict');
select is(public.activate_casillas_license_v2('RATEVALIDCODE')->>'result','ACTIVATION_DENIED','Independent active right is a generic refusal');
reset role;
select tests.authenticate_as('rate-future');
select is(public.activate_casillas_license_v2('RATEVALIDCODE')->>'result','ACTIVATION_DENIED','Future reservation refuses without a commercial oracle');
reset role;
select tests.authenticate_as('rate-expired');
select is(public.activate_casillas_license_v2('RATEVALIDCODE')->>'result','ACTIVATION_DENIED','Expired reservation refuses without a commercial oracle');
reset role;

select ok(not has_table_privilege('authenticated','private.activation_attempt_windows','SELECT,INSERT,UPDATE,DELETE'),
 'Authenticated cannot read or modify quota');
select ok(not has_function_privilege('authenticated','private.admit_activation_attempt(uuid,uuid)','EXECUTE'),
 'Admission helper cannot be invoked by clients');
select ok(not has_function_privilege('anon','public.activate_casillas_license_v2(text)','EXECUTE'),
 'Anonymous cannot activate');
select ok(not has_function_privilege('authenticated','private.activation_retry_at(timestamp with time zone[],timestamp with time zone)','EXECUTE'),
 'Clock helper is not exposed');
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where p.proname in ('admit_activation_attempt','activation_retry_at','activate_casillas_license_v2')
 and n.nspname='private' and p.proconfig is distinct from array['search_path=""']::text[]),
 'Private functions use an empty search_path');
select is((select count(*) from public.trials where user_id in
 (tests.get_supabase_uid('rate-conflict'),tests.get_supabase_uid('rate-future'),tests.get_supabase_uid('rate-expired'))),
 0::bigint,'Refusals create no trial');
select is((select count(*) from public.entitlements where source='GRANT' and status='ACTIVE'
 and user_id in (tests.get_supabase_uid('rate-conflict'),tests.get_supabase_uid('rate-future'),tests.get_supabase_uid('rate-expired'))),
 3::bigint,'Independent rights and reservations are untouched');
select * from finish();
rollback;
