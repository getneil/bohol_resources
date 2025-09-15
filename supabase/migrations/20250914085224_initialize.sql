-- Initialize schema (no embedding_vector yet)

-- Useful extension for UUID generation
create extension if not exists pgcrypto;

-- Enum: skill level
do $$
begin
  if not exists (select 1 from pg_type where typname = 'skill_level') then
    create type public.skill_level as enum ('beginner', 'intermediate', 'expert');
  end if;
end$$;

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

-- user_profiles
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  suffix text,
  title text,            -- e.g., Dr., Engr., Atty.
  phone_number text,
  birth_date date,
  photo_url text,        -- high-res photo URL
  thumb_url text,        -- thumbnail URL
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true
);

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- professionals (no embedding column yet)
create table if not exists public.professionals (
  user_profile_id uuid primary key references public.user_profiles (id) on delete cascade,
  profile_summary text,
  tags text[],
  value_profile text,    -- concatenation of education/work/skills; intended to be maintained via trigger later
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professionals_tags_gin_idx
  on public.professionals using gin (tags);

create trigger professionals_set_updated_at
before update on public.professionals
for each row execute function public.set_updated_at();

-- education
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_profile_id) on delete cascade,
  school text,
  degree text,           -- can be courses, short courses, etc.
  year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists education_professional_id_idx
  on public.education (professional_id);

create trigger education_set_updated_at
before update on public.education
for each row execute function public.set_updated_at();

-- work_history
create table if not exists public.work_history (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_profile_id) on delete cascade,
  role text,
  organization text,
  summary text,
  year_start int,
  year_end int,          -- nullable if still active
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_history_professional_id_idx
  on public.work_history (professional_id);

create trigger work_history_set_updated_at
before update on public.work_history
for each row execute function public.set_updated_at();

-- skills
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_profile_id) on delete cascade,
  skill text,
  level public.skill_level,
  created_at timestamptz not null default now()
);

create index if not exists skills_professional_id_idx
  on public.skills (professional_id);

-- links
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_profile_id) on delete cascade,
  url text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_professional_id_idx
  on public.links (professional_id);

create trigger links_set_updated_at
before update on public.links
for each row execute function public.set_updated_at();

-- =============================================
-- Aggregate-related data into professionals.value_profile
-- =============================================

-- Function to rebuild value_profile for a given professional
create or replace function public.refresh_professional_value_profile(p_professional_id uuid)
returns void
language plpgsql
as $$
declare
  v_value_profile text;
begin
  -- Build the concatenated summary from related tables
  select (
    'Education: ' || coalesce(
      (
        select string_agg(distinct
                 trim(both ' ' from coalesce(e.degree, '') ||
                   case when e.degree is not null and e.school is not null then ' - ' else '' end ||
                   coalesce(e.school, ''))
               , '; ')
        from public.education e
        where e.professional_id = p_professional_id
          and (e.degree is not null or e.school is not null)
      ), ''
    ) ||
    ' | Work: ' || coalesce(
      (
        select string_agg(distinct
                 trim(both ' ' from coalesce(w.role, '') ||
                   case when w.role is not null and w.organization is not null then ' at ' else '' end ||
                   coalesce(w.organization, ''))
               , '; ')
        from public.work_history w
        where w.professional_id = p_professional_id
          and (w.role is not null or w.organization is not null)
      ), ''
    ) ||
    ' | Skills: ' || coalesce(
      (
        select string_agg(distinct s.skill, ', ')
        from public.skills s
        where s.professional_id = p_professional_id
          and s.skill is not null
      ), ''
    )
    ||
    ' | Links: ' || coalesce(
      (
        select string_agg(distinct l.summary, '; ')
        from public.links l
        where l.professional_id = p_professional_id
          and l.summary is not null and length(trim(l.summary)) > 0
      ), ''
    )
  ) into v_value_profile;

  -- Update professionals.value_profile
  update public.professionals p
     set value_profile = v_value_profile,
         updated_at = now()
   where p.user_profile_id = p_professional_id;
end;
$$;

-- Generic trigger to call the refresh function on row changes
create or replace function public.tg_refresh_value_profile()
returns trigger
language plpgsql
as $$
declare
  v_professional_id uuid;
begin
  v_professional_id := coalesce(new.professional_id, old.professional_id);
  if v_professional_id is not null then
    perform public.refresh_professional_value_profile(v_professional_id);
  end if;
  return null; -- AFTER triggers that only perform side effects
end;
$$;

-- Attach triggers to child tables
create trigger education_refresh_value_profile
after insert or update or delete on public.education
for each row execute function public.tg_refresh_value_profile();

create trigger work_history_refresh_value_profile
after insert or update or delete on public.work_history
for each row execute function public.tg_refresh_value_profile();

create trigger skills_refresh_value_profile
after insert or update or delete on public.skills
for each row execute function public.tg_refresh_value_profile();

create trigger links_refresh_value_profile
after insert or update or delete on public.links
for each row execute function public.tg_refresh_value_profile();