-- Items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  location text not null,
  type text check (type in ('lost', 'found')) not null,
  image_url text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.items enable row level security;

-- Anyone can read items
create policy "Public read items"
  on public.items for select
  using (true);

-- Authenticated users can insert their own items
create policy "Users insert own items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update/delete their own items
create policy "Users update own items"
  on public.items for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users delete own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.items;
