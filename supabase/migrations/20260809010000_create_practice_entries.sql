create table public.practice_entries (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('leetcode', 'hld', 'lld', 'behavioral')),
  title text not null check (char_length(title) between 1 and 500),
  detail text not null default '',
  difficulty text,
  tags text[] not null default '{}',
  problem_url text,
  approach text,
  code text,
  language text,
  created_at timestamptz not null default now()
);

create index practice_entries_user_created_at_idx
  on public.practice_entries (user_id, created_at desc);

alter table public.practice_entries enable row level security;

create policy "Users can read their own practice"
  on public.practice_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own practice"
  on public.practice_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own practice"
  on public.practice_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own practice"
  on public.practice_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.practice_entries from anon;
grant select, insert, update, delete on table public.practice_entries to authenticated;
