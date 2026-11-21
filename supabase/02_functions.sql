-- THE HUMANITY & COOPERATION INITIATIVE: functions
create or replace function hc_has_perm(p text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from hc_user_roles r join hc_role_permissions a on a.role = r.role where r.user_id = auth.uid() and (a.permission = p or a.permission = '*')) $$;
create or replace function hc_is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from hc_user_roles where user_id = auth.uid()) $$;

create or replace function hc_rate_hit(p_key text, p_window int, p_max int) returns boolean language plpgsql security definer set search_path = public as $$
declare r hc_rate_limits%rowtype;
begin
  insert into hc_rate_limits(key, window_start, hits) values (p_key, now(), 1)
    on conflict (key) do update set
      hits = case when hc_rate_limits.window_start < now() - make_interval(secs => p_window) then 1 else hc_rate_limits.hits + 1 end,
      window_start = case when hc_rate_limits.window_start < now() - make_interval(secs => p_window) then now() else hc_rate_limits.window_start end
    returning * into r;
  return r.hits <= p_max;
end $$;


create or replace function hc_track_view(p_article uuid, p_path text) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_article is not null then insert into hc_article_views(article_id, day, views) values (p_article, current_date, 1) on conflict (article_id, day) do update set views = hc_article_views.views + 1; end if;
  insert into hc_page_views(day, path, views) values (current_date, left(p_path, 200), 1) on conflict (day, path) do update set views = hc_page_views.views + 1;
end $$;
create or replace function hc_download(p_resource uuid) returns void language sql security definer set search_path = public as $$ update hc_resources set downloads = downloads + 1 where id = p_resource $$;
revoke all on function hc_rate_hit(text,int,int), hc_track_view(uuid,text), hc_download(uuid) from public, anon, authenticated;
grant execute on function hc_rate_hit(text,int,int), hc_track_view(uuid,text), hc_download(uuid) to service_role;
insert into storage.buckets (id, name, public) values ('hc-media', 'hc-media', true) on conflict (id) do nothing;
