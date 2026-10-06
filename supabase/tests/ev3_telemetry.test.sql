begin;
create extension if not exists pgtap with schema extensions;
select plan(22);
select has_table('public','chat_interactions','interações existem');
select has_table('public','guide_feedback','feedback existe');
select ok((select relrowsecurity from pg_class where oid='public.chat_interactions'::regclass),'RLS interação');
select ok((select relrowsecurity from pg_class where oid='public.guide_feedback'::regclass),'RLS feedback');
select is((select count(*)::int from pg_policies where schemaname='public' and tablename in ('chat_interactions','guide_feedback')),4,'4 policies insert/select');
select ok(not has_table_privilege('anon','public.chat_interactions','SELECT,INSERT,UPDATE,DELETE'),'anon sem interação');
select ok(not has_table_privilege('anon','public.guide_feedback','SELECT,INSERT,UPDATE,DELETE'),'anon sem feedback');
select ok(not has_table_privilege('authenticated','public.chat_interactions','UPDATE,DELETE'),'sem update/delete interação');
select ok(not has_table_privilege('authenticated','public.guide_feedback','UPDATE,DELETE'),'sem update/delete feedback');
select ok(not has_column_privilege('authenticated','public.chat_interactions','created_at','INSERT'),'timestamp servidor protegido');
insert into auth.users(id,email) values
 ('a0000000-0000-4000-8000-000000000001','ev3-a@example.invalid'),
 ('b0000000-0000-4000-8000-000000000002','ev3-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select lives_ok($$insert into public.chat_interactions(id,user_id,client_created_at,slots,outcome,resolved_cycle_id,result_count,schema_version)
 values ('c0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001',now(),'{"controlador":"fanuc"}','resolved','fanuc_torno_g76',1,1)$$,'A insere próprio');
select throws_ok($$insert into public.chat_interactions(id,user_id,client_created_at,slots,outcome,result_count,schema_version)
 values ('c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002',now(),'{}','no_match',0,1)$$,'42501',null,'A não forja B');
select is((select count(*)::int from public.chat_interactions),1,'A lê própria');
select lives_ok($$insert into public.guide_feedback(id,user_id,interaction_id,cycle_id,helpful,client_created_at,schema_version)
 values ('d0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','fanuc_torno_g76',true,now(),1)$$,'A feedback próprio');
select throws_ok($$insert into public.guide_feedback(id,user_id,interaction_id,cycle_id,helpful,client_created_at,schema_version)
 values ('d0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','fanuc_torno_g76',true,now(),1)$$,'23505',null,'unicidade lógica');
select throws_ok($$insert into public.chat_interactions(id,user_id,client_created_at,slots,outcome,resolved_cycle_id,result_count,schema_version)
 values ('c0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001',now(),'{}','resolved','fanuc_torno_g76',1,1)$$,'23505',null,'retry UUID não duplica');
select set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000002',true);
select is((select count(*)::int from public.chat_interactions),0,'B não lê A');
select is((select count(*)::int from public.guide_feedback),0,'B não lê feedback A');
select throws_ok($$insert into public.guide_feedback(id,user_id,interaction_id,cycle_id,helpful,client_created_at,schema_version)
 values ('d0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','fanuc_torno_g76',true,now(),1)$$,'23503',null,'FK composta bloqueia B → interação A');
select lives_ok($$insert into public.chat_interactions(id,user_id,client_created_at,slots,outcome,result_count,schema_version)
 values ('c0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000002',now(),'{}','no_match',0,1)$$,'interação sem feedback');
select set_config('request.jwt.claim.sub','a0000000-0000-4000-8000-000000000001',true);
select is((select count(*)::int from public.chat_interactions),1,'A não lê interação B');
select throws_ok($$insert into public.chat_interactions(id,user_id,client_created_at,slots,outcome,result_count,schema_version)
 values ('c0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001',now(),'{"pergunta":"raw"}','no_match',0,1)$$,'23514',null,'slots não armazenam pergunta bruta');
select * from finish();
rollback;
