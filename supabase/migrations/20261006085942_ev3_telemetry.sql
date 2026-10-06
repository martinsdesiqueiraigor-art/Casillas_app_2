-- EV3: telemetria técnica separada de access_events. Aplicação somente local nesta missão.
create table public.chat_interactions (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 client_created_at timestamptz not null,
 slots jsonb not null,
 outcome text not null check (outcome in ('resolved','no_match','ambiguous')),
 resolved_cycle_id text,
 result_count integer not null check (result_count >= 0),
 schema_version integer not null default 1 check (schema_version = 1),
 constraint chat_interactions_owner_key unique (id,user_id),
 constraint chat_interactions_slots_check check (
  jsonb_typeof(slots)='object' and slots - array['controlador','maquina','operacao','codigo']::text[] = '{}'::jsonb
 ),
 constraint chat_interactions_result_consistency_check check (
  (outcome='resolved' and resolved_cycle_id is not null and result_count=1)
  or (outcome='no_match' and resolved_cycle_id is null and result_count=0)
  or (outcome='ambiguous' and resolved_cycle_id is null and result_count>1)
 )
);
create table public.guide_feedback (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 interaction_id uuid not null,
 cycle_id text not null check (length(cycle_id)>0),
 helpful boolean not null,
 created_at timestamptz not null default now(),
 client_created_at timestamptz not null,
 schema_version integer not null default 1 check (schema_version = 1),
 constraint guide_feedback_interaction_owner_fk foreign key (interaction_id,user_id)
  references public.chat_interactions(id,user_id) on delete cascade,
 constraint guide_feedback_effective_key unique (user_id,interaction_id,cycle_id)
);
create index chat_interactions_user_created_idx on public.chat_interactions(user_id,created_at);
alter table public.chat_interactions enable row level security;
alter table public.guide_feedback enable row level security;
revoke all on public.chat_interactions,public.guide_feedback from public,anon,authenticated;
grant select on public.chat_interactions,public.guide_feedback to authenticated;
grant insert (id,user_id,client_created_at,slots,outcome,resolved_cycle_id,result_count,schema_version)
 on public.chat_interactions to authenticated;
grant insert (id,user_id,interaction_id,cycle_id,helpful,client_created_at,schema_version)
 on public.guide_feedback to authenticated;
create policy chat_interactions_select_own on public.chat_interactions for select to authenticated using ((select auth.uid())=user_id);
create policy chat_interactions_insert_own on public.chat_interactions for insert to authenticated with check ((select auth.uid())=user_id);
create policy guide_feedback_select_own on public.guide_feedback for select to authenticated using ((select auth.uid())=user_id);
create policy guide_feedback_insert_own on public.guide_feedback for insert to authenticated with check ((select auth.uid())=user_id);
