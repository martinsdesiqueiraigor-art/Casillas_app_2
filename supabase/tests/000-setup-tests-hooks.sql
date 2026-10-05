-- CASILLAS 2.1 / BL-01: test-only, offline subset of Basejump helpers 0.0.6.

-- Upstream commit: 828d744f8f7ca12750d27af1d9e011a8e29c1345

-- Source: https://github.com/usebasejump/supabase-test-helpers/blob/828d744f8f7ca12750d27af1d9e011a8e29c1345/supabase_test_helpers--0.0.6.sql

-- Source blob: aeb85131a294bf29a851b36bb6790f86f01c0d43

-- Four upstream definitions preserved; trailing whitespace removed for git diff --check.

-- Setup DDL persists across pg_prove connections; all fixtures/auth are rolled back.

-- Only tests schema privileges are granted; tests is not an exposed API schema.

/*
Copyright 2023 usebasejump.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

create extension if not exists pgtap with schema extensions;

create extension if not exists "uuid-ossp" with schema extensions;

create schema if not exists tests;

CREATE OR REPLACE FUNCTION tests.create_supabase_user(identifier text, email text default null, phone text default null, metadata jsonb default null)
RETURNS uuid
    SECURITY DEFINER
    SET search_path = auth, pg_temp
AS $$
DECLARE
    user_id uuid;
BEGIN

    -- create the user
    user_id := extensions.uuid_generate_v4();
    INSERT INTO auth.users (id, email, phone, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    VALUES (user_id, coalesce(email, concat(user_id, '@test.com')), phone, jsonb_build_object('test_identifier', identifier) || coalesce(metadata, '{}'::jsonb), '{}'::jsonb, now(), now())
    RETURNING id INTO user_id;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.get_supabase_user(identifier text)
RETURNS json
SECURITY DEFINER
SET search_path = auth, pg_temp
AS $$
    DECLARE
        supabase_user json;
    BEGIN
        SELECT json_build_object(
        'id', id,
        'email', email,
        'phone', phone,
        'raw_user_meta_data', raw_user_meta_data,
        'raw_app_meta_data', raw_app_meta_data
        ) into supabase_user
        FROM auth.users
        WHERE raw_user_meta_data ->> 'test_identifier' = identifier limit 1;

        if supabase_user is null OR supabase_user -> 'id' IS NULL then
            RAISE EXCEPTION 'User with identifier % not found', identifier;
        end if;
        RETURN supabase_user;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.get_supabase_uid(identifier text)
    RETURNS uuid
    SECURITY DEFINER
    SET search_path = auth, pg_temp
AS $$
DECLARE
    supabase_user uuid;
BEGIN
    SELECT id into supabase_user FROM auth.users WHERE raw_user_meta_data ->> 'test_identifier' = identifier limit 1;
    if supabase_user is null then
        RAISE EXCEPTION 'User with identifier % not found', identifier;
    end if;
    RETURN supabase_user;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tests.authenticate_as (identifier text)
    RETURNS void
    AS $$
        DECLARE
                user_data json;
                original_auth_data text;
        BEGIN
            -- store the request.jwt.claims in a variable in case we need it
            original_auth_data := current_setting('request.jwt.claims', true);
            user_data := tests.get_supabase_user(identifier);

            if user_data is null OR user_data ->> 'id' IS NULL then
                RAISE EXCEPTION 'User with identifier % not found', identifier;
            end if;


            perform set_config('role', 'authenticated', true);
            perform set_config('request.jwt.claims', json_build_object(
                'sub', user_data ->> 'id',
                'email', user_data ->> 'email',
                'phone', user_data ->> 'phone',
                'user_metadata', user_data -> 'raw_user_meta_data',
                'app_metadata', user_data -> 'raw_app_meta_data'
            )::text, true);

        EXCEPTION
            -- revert back to original auth data
            WHEN OTHERS THEN
                set local role authenticated;
                set local "request.jwt.claims" to original_auth_data;
                RAISE;
        END
    $$ LANGUAGE plpgsql;

revoke all on function tests.create_supabase_user(text, text, text, jsonb),
    tests.get_supabase_user(text), tests.get_supabase_uid(text),
    tests.authenticate_as(text) from public;
grant usage on schema tests to authenticated;
grant execute on function tests.create_supabase_user(text, text, text, jsonb),
    tests.get_supabase_user(text), tests.get_supabase_uid(text),
    tests.authenticate_as(text) to authenticated;

begin;
select plan(12);

select has_schema('tests', 'Test helper schema exists');
select ok(exists(select 1 from pg_extension where extname = 'pgtap'),
    'pgTAP is installed');
select has_function('extensions', 'uuid_generate_v4', array[]::text[],
    'UUID dependency exists');
select has_function('tests', 'create_supabase_user',
    array['text', 'text', 'text', 'jsonb'],
    'User fixture helper exists with its original signature');
select has_function('tests', 'get_supabase_user', array['text'],
    'User lookup helper exists');
select has_function('tests', 'get_supabase_uid', array['text'],
    'User UUID helper exists');
select has_function('tests', 'authenticate_as', array['text'],
    'Authentication helper exists');

select tests.create_supabase_user('bl01-harness-smoke');
select is(tests.get_supabase_uid('bl01-harness-smoke'),
    (select id from auth.users
     where raw_user_meta_data ->> 'test_identifier' = 'bl01-harness-smoke'),
    'Fixture UUID resolves to the created auth user');
select is((tests.get_supabase_user('bl01-harness-smoke') ->> 'id')::uuid,
    tests.get_supabase_uid('bl01-harness-smoke'),
    'User lookup and UUID lookup agree');

select tests.authenticate_as('bl01-harness-smoke');
select is(current_user::text, 'authenticated',
    'Authentication switches to the authenticated role');
select is(auth.uid(), tests.get_supabase_uid('bl01-harness-smoke'),
    'auth.uid reads the simulated JWT subject under authenticated role');
select is(auth.jwt() ->> 'sub', tests.get_supabase_uid('bl01-harness-smoke')::text,
    'auth.jwt reads the simulated claims');

select * from finish();
rollback;
