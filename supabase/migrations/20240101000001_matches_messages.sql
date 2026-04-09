-- ─────────────────────────────────────────
-- matches table
-- created when a found item matches a lost item
-- ─────────────────────────────────────────
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  lost_item_id  uuid references public.items(id) on delete cascade not null,
  found_item_id uuid references public.items(id) on delete cascade not null,
  match_score   int not null default 0,          -- 0-100
  created_at    timestamptz default now() not null,
  unique (lost_item_id, found_item_id)
);

alter table public.matches enable row level security;

-- anyone can read matches (we filter in app by user)
create policy "Read own matches"
  on public.matches for select
  to authenticated
  using (
    exists (
      select 1 from public.items
      where id = matches.lost_item_id and user_id = auth.uid()
    ) or
    exists (
      select 1 from public.items
      where id = matches.found_item_id and user_id = auth.uid()
    )
  );

create policy "Service insert matches"
  on public.matches for insert
  with check (true);

-- ─────────────────────────────────────────
-- messages table
-- notification thread between lost-owner and found-owner
-- ─────────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid references public.matches(id) on delete cascade not null,
  sender_id  uuid references auth.users(id) on delete cascade not null,
  content    text not null,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

-- only participants of the match can read/write messages
create policy "Participants read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.items li on li.id = m.lost_item_id
      join public.items fi on fi.id = m.found_item_id
      where m.id = messages.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

create policy "Participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.matches m
      join public.items li on li.id = m.lost_item_id
      join public.items fi on fi.id = m.found_item_id
      where m.id = messages.match_id
        and (li.user_id = auth.uid() or fi.user_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────
-- user_profiles view (for display names)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text
);

alter table public.profiles enable row level security;

create policy "Public read profiles"
  on public.profiles for select using (true);

create policy "Users upsert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- realtime
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;
