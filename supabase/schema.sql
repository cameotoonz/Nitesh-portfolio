-- Run this once in the Supabase SQL Editor, using the project owner role.
-- No credentials or public sign-up flow are included in this repository.
begin;

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists(select 1 from public.portfolio_admins where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.portfolio_profile (
  id boolean primary key default true check (id = true),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 120),
  description text not null default '' check (length(description) <= 500),
  category text not null check (category in ('long', 'short')),
  thumbnail text not null,
  video_url text not null,
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_public_order on public.projects (published, position);
alter table public.portfolio_profile enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Anyone can read profile" on public.portfolio_profile;
create policy "Anyone can read profile" on public.portfolio_profile for select using (true);
drop policy if exists "Only owner can change profile" on public.portfolio_profile;
create policy "Only owner can change profile" on public.portfolio_profile for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
drop policy if exists "Visitors see only published projects" on public.projects;
create policy "Visitors see only published projects" on public.projects for select using (published = true or public.is_portfolio_admin());
drop policy if exists "Only owner can manage projects" on public.projects;
create policy "Only owner can manage projects" on public.projects for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
grant select on public.projects, public.portfolio_profile to anon;
grant select, insert, update, delete on public.projects, public.portfolio_profile to authenticated;

create or replace function public.set_portfolio_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_portfolio_updated_at();
drop trigger if exists profile_updated_at on public.portfolio_profile;
create trigger profile_updated_at before update on public.portfolio_profile for each row execute function public.set_portfolio_updated_at();

-- One transaction for the whole order; an unauthorized caller cannot reorder.
create or replace function public.reorder_projects(project_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_portfolio_admin() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if cardinality(project_ids) != (select count(*) from public.projects)
     or cardinality(project_ids) != (select count(distinct unnest_id) from unnest(project_ids) as unnest_id)
     or exists (select 1 from unnest(project_ids) as x where not exists(select 1 from public.projects p where p.id = x))
  then raise exception 'Project list changed. Refresh the studio and try again.'; end if;
  update public.projects p set position = s.ordinality::integer - 1
  from unnest(project_ids) with ordinality as s(id, ordinality) where p.id = s.id;
end;
$$;
revoke all on function public.reorder_projects(uuid[]) from public;
grant execute on function public.reorder_projects(uuid[]) to authenticated;

-- Public media is appropriate for published portfolio work. Draft database rows
-- are private, but uploaded file URLs are not confidential. Do not upload secrets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-assets', 'portfolio-assets', true, 1073741824,
  array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime','video/x-m4v'])
on conflict (id) do update set public = true,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owner uploads portfolio assets" on storage.objects;
create policy "Owner uploads portfolio assets" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());
drop policy if exists "Owner updates portfolio assets" on storage.objects;
create policy "Owner updates portfolio assets" on storage.objects for update to authenticated using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin()) with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());
drop policy if exists "Owner reads portfolio assets" on storage.objects;
create policy "Owner reads portfolio assets" on storage.objects for select to authenticated using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());
drop policy if exists "Owner deletes portfolio assets" on storage.objects;
create policy "Owner deletes portfolio assets" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

-- Realtime is optional: the frontend also refetches on focus and every minute.
do $$ begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'projects') then
      alter publication supabase_realtime add table public.projects;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portfolio_profile') then
      alter publication supabase_realtime add table public.portfolio_profile;
    end if;
  end if;
end $$;
commit;
