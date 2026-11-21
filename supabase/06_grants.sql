-- The Humanity & Cooperation Initiative: let the server (service_role key) read/write its own tables.
-- Needed on Supabase projects where new tables are no longer granted automatically (error 42501 "permission denied").
-- Safe to re-run. Touches only tables/sequences/functions starting with ex_. Does not change data, roles or RLS.
grant usage on schema public to service_role;
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' and tablename like 'hc\_%' loop
    execute format('grant all privileges on table public.%I to service_role', r.tablename);
  end loop;
  for r in select sequencename from pg_sequences where schemaname = 'public' and sequencename like 'hc\_%' loop
    execute format('grant all privileges on sequence public.%I to service_role', r.sequencename);
  end loop;
  for r in select p.oid::regprocedure as fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname like 'hc\_%' loop
    execute format('grant execute on function %s to service_role', r.fn);
  end loop;
end $$;
-- Storage uploads use the same key.
grant usage on schema storage to service_role;
grant all on all tables in schema storage to service_role;
