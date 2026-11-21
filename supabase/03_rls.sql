-- THE HUMANITY & COOPERATION INITIATIVE: Row Level Security. The app reads and writes through the server (service role);
-- these policies protect every table if the public anon key is ever used directly. Re-runnable.
do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies where (schemaname = 'public' and tablename like 'hc\_%') or (schemaname = 'storage' and policyname like 'hc\_media\_%') loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop; end $$;
do $$ declare r record; begin
  for r in select tablename from pg_tables where schemaname = 'public' and tablename like 'hc\_%' loop execute format('alter table %I enable row level security', r.tablename); end loop; end $$;

-- Public read: published content only
create policy hc_pub_categories on hc_categories for select using (is_active);
create policy hc_pub_topics on hc_topics for select using (is_published);
create policy hc_pub_tags on hc_tags for select using (true);
create policy hc_pub_authors on hc_authors for select using (is_active);
create policy hc_pub_articles on hc_articles for select using (status = 'published' and is_visible and (publish_at is null or publish_at <= now()));
create policy hc_pub_art_tags on hc_article_tag_relations for select using (true);
create policy hc_pub_speakers on hc_speakers for select using (is_active);
create policy hc_pub_webinars on hc_webinars for select using (is_published);
create policy hc_pub_webinar_mat on hc_webinar_materials for select using (exists (select 1 from hc_webinars w where w.id = webinar_id and w.is_published));
create policy hc_pub_res_cats on hc_resource_categories for select using (true);
create policy hc_pub_resources on hc_resources for select using (is_published);
create policy hc_pub_stories on hc_stories for select using (status = 'published');
create policy hc_pub_research on hc_research_items for select using (is_published);
create policy hc_pub_programmes on hc_programmes for select using (is_published);
create policy hc_pub_modules on hc_programme_modules for select using (is_published);
create policy hc_pub_circles on hc_circles for select using (is_published and status = 'approved');
create policy hc_pub_circle_content on hc_circle_content for select using (is_published);
create policy hc_pub_forms on hc_forms for select using (is_active);
create policy hc_pub_areas on hc_challenge_areas for select using (true);
create policy hc_pub_challenges on hc_challenge_submissions for select using (status = 'published');
create policy hc_pub_sponsors on hc_sponsors for select using (is_active and show_publicly);
create policy hc_pub_support on hc_support_options for select using (is_active);
create policy hc_pub_nav on hc_navigation_items for select using (is_visible);
create policy hc_pub_pages on hc_pages for select using (is_published);
create policy hc_pub_seo on hc_seo_entries for select using (true);
create policy hc_pub_settings on hc_site_settings for select using (key not like 'private\_%');
-- Public may add (never read) through forms
create policy hc_ins_form_sub on hc_form_submissions for insert with check (status = 'new');
create policy hc_ins_subscriber on hc_newsletter_subscribers for insert with check (status = 'pending');
create policy hc_ins_webinar_reg on hc_webinar_registrations for insert with check (status = 'registered');
create policy hc_ins_challenge on hc_challenge_submissions for insert with check (status = 'submitted');
create policy hc_ins_facilitator on hc_facilitators for insert with check (status = 'applied');
-- Signed-in users: own rows
create policy hc_own_profile on hc_profiles for select using (id = auth.uid());
create policy hc_own_profile_upd on hc_profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy hc_own_roles on hc_user_roles for select using (user_id = auth.uid());
create policy hc_own_challenges on hc_challenge_submissions for select using (user_id = auth.uid());
-- Admin access by permission (enforced in the database as well as in the server)
create policy hc_adm_roles_write on hc_user_roles for all using (hc_has_perm('users.manage')) with check (hc_has_perm('users.manage'));
create policy hc_adm_roles on hc_roles for all using (hc_is_admin()) with check (hc_has_perm('users.manage'));
create policy hc_adm_role_perms on hc_role_permissions for all using (hc_is_admin()) with check (hc_has_perm('users.manage'));
do $$ declare r record; begin
  for r in select * from (values
    ('categories','articles.write'),('topics','articles.write'),('tags','articles.write'),('authors','authors.write'),('articles','articles.write'),('article_tag_relations','articles.write'),('editorial_reviews','articles.write'),
    ('speakers','webinars.write'),('webinars','webinars.write'),('webinar_materials','webinars.write'),('webinar_registrations','webinars.write'),
    ('resource_categories','resources.write'),('resources','resources.write'),('stories','stories.write'),('research_items','research.write'),
    ('programmes','programmes.write'),('programme_modules','programmes.write'),('circles','circles.write'),('circle_content','circles.write'),('facilitators','facilitators.write'),
    ('forms','forms.manage'),('form_submissions','forms.read'),('challenge_areas','challenge.write'),('challenge_submissions','challenge.write'),
    ('newsletter_subscribers','newsletter.write'),('newsletter_campaigns','newsletter.write'),('sponsors','sponsors.write'),('support_options','sponsors.write'),
    ('site_settings','site.write'),('navigation_items','site.write'),('pages','site.write'),('seo_entries','site.write'),('media','media.write'),('profiles','users.manage'),
    ('notifications','notifications.read'),('audit_logs','audit.read'),('page_views','analytics.read'),('article_views','analytics.read')) as v(t, perm) loop
    execute format('create policy hc_adm_%1$s on hc_%1$s for all using (hc_has_perm(%2$L)) with check (hc_has_perm(%2$L))', r.t, r.perm);
  end loop; end $$;
create policy hc_media_read on storage.objects for select using (bucket_id = 'hc-media');
create policy hc_media_write on storage.objects for insert with check (bucket_id = 'hc-media' and hc_is_admin());
create policy hc_media_modify on storage.objects for update using (bucket_id = 'hc-media' and hc_is_admin());
create policy hc_media_delete on storage.objects for delete using (bucket_id = 'hc-media' and hc_is_admin());
