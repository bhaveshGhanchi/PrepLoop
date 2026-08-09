alter table public.practice_entries
  add column if not exists difficulty text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists problem_url text;
