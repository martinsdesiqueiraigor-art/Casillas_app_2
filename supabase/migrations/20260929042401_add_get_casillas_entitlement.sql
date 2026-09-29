-- ============================================================
-- CASILLAS 2.0
-- Migration retroativa — get_casillas_entitlement
--
-- MOTIVO:
-- A função get_casillas_entitlement existia apenas em produção
-- (criada diretamente pelo dashboard do Supabase) e NÃO estava
-- versionada no repositório. Isso caracterizava schema drift.
--
-- Esta migration recupera o código exato que está em produção,
-- garantindo que:
--   1. Um "supabase db reset" reconstrói a função
--   2. Ambientes novos (staging, dev) ficam consistentes
--   3. Auditoria externa consegue avaliar a função
--
-- Código idêntico ao de produção. Nenhuma mudança de comportamento.
--
-- Duas funções:
--   private.get_casillas_entitlement()  — lógica (SECURITY DEFINER)
--   public.get_casillas_entitlement()   — wrapper (SECURITY INVOKER)
-- ============================================================

-- ============================================================
-- FUNÇÃO PRIVADA (lógica)
-- ============================================================

create or replace function private.get_casillas_entitlement()
returns table (
    has_access boolean,
    source text,
    valid_until timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
    select
        true as has_access,
        e.source,
        e.valid_until
    from public.entitlements e
    join public.products p
      on p.id = e.product_id
    where e.user_id = (select auth.uid())
      and e.status = 'ACTIVE'
      and e.revoked_at is null
      and p.slug = 'casillas'
      and p.is_active = true
      and (e.valid_until is null or e.valid_until > now())
    limit 1;
$function$;

revoke all on function private.get_casillas_entitlement()
    from public, anon, authenticated;

grant execute on function private.get_casillas_entitlement()
    to authenticated;

-- ============================================================
-- FUNÇÃO PÚBLICA (wrapper)
-- ============================================================

create or replace function public.get_casillas_entitlement()
returns table (
    has_access boolean,
    source text,
    valid_until timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $function$
    select * from private.get_casillas_entitlement();
$function$;

revoke all on function public.get_casillas_entitlement()
    from public, anon;

grant execute on function public.get_casillas_entitlement()
    to authenticated, service_role;

-- ============================================================
-- DOCUMENTAÇÃO
-- ============================================================

comment on function public.get_casillas_entitlement() is
'Retorna o entitlement ativo do usuário autenticado para o produto Casillas.
Função pública (wrapper) que delega para private.get_casillas_entitlement().
Retorna has_access=false quando não há entitlement ativo.';

comment on function private.get_casillas_entitlement() is
'Lógica interna do entitlement. SECURITY DEFINER para ler auth.uid() e as
tabelas de entitlements/produtos independentemente das policies do caller.
Filtra por status ACTIVE, revoked_at NULL, produto ativo e validade.';
