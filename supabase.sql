-- Einmal im Supabase SQL-Editor ausführen.
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  mode text not null,            -- tag | frei | zeit | level
  size int not null,
  level int,
  words_found int not null,
  words_total int not null,
  score int not null default 0,
  hints int not null default 0,
  seconds int not null default 0,
  won boolean not null default false,
  played_at timestamptz not null default now()
);

create table if not exists progress (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  current_level int not null default 1,
  daily_streak int not null default 0,
  best_streak int not null default 0,
  timed_highscore int not null default 0,
  last_daily date,
  updated_at timestamptz not null default now()
);

alter table games enable row level security;
alter table progress enable row level security;

create policy "eigene Spiele lesen" on games for select using (auth.uid() = user_id);
create policy "eigene Spiele anlegen" on games for insert with check (auth.uid() = user_id);
create policy "eigenen Fortschritt lesen" on progress for select using (auth.uid() = user_id);
create policy "eigenen Fortschritt anlegen" on progress for insert with check (auth.uid() = user_id);
create policy "eigenen Fortschritt ändern" on progress for update using (auth.uid() = user_id);

-- Neuere Supabase-Projekte geben neuen Tabellen keine Rechte mehr automatisch.
grant select, insert on games to authenticated;
grant select, insert, update on progress to authenticated;
