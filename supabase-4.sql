-- Wortsalat: Mitteilungen (Push). Einmal im SQL Editor ausführen.

create table if not exists push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  p256dh text not null,
  auth text not null,
  prefs jsonb not null default '{}',      -- { tag: true, serie: false, ... }
  last_sent jsonb not null default '{}',  -- { tag: '2026-11-19', ... } gegen doppelte Mitteilungen
  created_at timestamptz not null default now()
);
alter table push_subs enable row level security;
drop policy if exists "eigene Mitteilungs-Abos" on push_subs;
create policy "eigene Mitteilungs-Abos" on push_subs for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on push_subs to authenticated;

-- Der Versand (GitHub Action) ruft diese Funktionen mit einem geheimen Schlüssel auf.
-- Hier steht nur dessen SHA-256-Prüfsumme, der Schlüssel selbst liegt als GitHub-Secret PUSH_KEY.
create or replace function push_key_ok(key text) returns boolean language sql immutable as $$
  select encode(sha256(convert_to(key, 'UTF8')), 'hex') = 'b93bcbf063ab8b28fcd4d02a362fd18951ac5fdd3683a67270d888cdcdef6dda'
$$;

create or replace function push_targets(key text)
returns table (endpoint text, p256dh text, auth text, prefs jsonb, last_sent jsonb,
               streak int, last_daily date, last_game timestamptz, week_games int, week_words int)
language sql stable security definer set search_path = public as $$
  select s.endpoint, s.p256dh, s.auth, s.prefs, s.last_sent,
    coalesce(pr.daily_streak, 0), pr.last_daily,
    (select max(g.played_at) from games g where g.user_id = s.user_id),
    (select count(*)::int from games g where g.user_id = s.user_id and g.played_at > now() - interval '7 days'),
    (select coalesce(sum(g.words_found), 0)::int from games g where g.user_id = s.user_id and g.played_at > now() - interval '7 days')
  from push_subs s
  left join progress pr on pr.user_id = s.user_id
  left join profiles p on p.id = s.user_id
  where push_key_ok(key) and not coalesce(p.banned, false)
$$;

create or replace function push_done(key text, ep text, kind text, day date, gone boolean) returns void
language sql security definer set search_path = public as $$
  delete from push_subs where push_key_ok(key) and gone and endpoint = ep;
  update push_subs set last_sent = last_sent || jsonb_build_object(kind, day)
    where push_key_ok(key) and not gone and endpoint = ep;
$$;

revoke execute on function push_targets(text) from public;
revoke execute on function push_done(text, text, text, date, boolean) from public;
grant execute on function push_targets(text) to anon;
grant execute on function push_done(text, text, text, date, boolean) to anon;
