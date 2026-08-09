alter table public.practice_entries
  add column if not exists approach text,
  add column if not exists code text,
  add column if not exists language text;
