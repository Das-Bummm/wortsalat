-- Wortsalat: Benutzername selbst ändern, Passwort-Anfragen an den Admin. Einmal im SQL Editor ausführen.

-- Spieler ändern ihren eigenen Namen (der Trigger on_username_change passt die Login-Adresse an)
create or replace function change_username(new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if new_name !~ '^[A-Za-z0-9_]{3,20}$' then raise exception 'Benutzername: 3–20 Zeichen, nur Buchstaben, Zahlen und _.'; end if;
  if exists (select 1 from profiles where lower(username) = lower(new_name) and id <> auth.uid()) then
    raise exception 'Dieser Benutzername ist schon vergeben.';
  end if;
  update profiles set username = new_name where id = auth.uid();
end $$;
revoke execute on function change_username(text) from public, anon;
grant execute on function change_username(text) to authenticated;

-- Passwort vergessen: Anfrage an den Admin (eine offene Anfrage pro Konto)
create table if not exists pw_requests (
  user_id uuid primary key references auth.users on delete cascade,
  note text not null default '' check (length(note) <= 300),
  created_at timestamptz not null default now()
);
alter table pw_requests enable row level security;
drop policy if exists "Admin liest Anfragen" on pw_requests;
drop policy if exists "Admin löscht Anfragen" on pw_requests;
create policy "Admin liest Anfragen" on pw_requests for select to authenticated using (is_admin());
create policy "Admin löscht Anfragen" on pw_requests for delete to authenticated using (is_admin());
grant select, delete on pw_requests to authenticated;

-- Verrät nicht, ob es den Namen gibt
create or replace function request_password_reset(name text, note text) returns void
language sql security definer set search_path = public as $$
  insert into pw_requests (user_id, note)
  select id, left(coalesce(note, ''), 300) from profiles where lower(username) = lower(trim(name))
  on conflict (user_id) do update set note = excluded.note, created_at = now();
$$;
revoke execute on function request_password_reset(text, text) from public;
grant execute on function request_password_reset(text, text) to anon, authenticated;

-- Admin setzt ein neues Passwort und erledigt damit die Anfrage
create or replace function admin_set_password(target uuid, pw text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_admin() then raise exception 'Nur für Admins'; end if;
  if length(pw) < 6 then raise exception 'Passwort: mindestens 6 Zeichen'; end if;
  update auth.users set encrypted_password = crypt(pw, gen_salt('bf')), updated_at = now() where id = target;
  delete from pw_requests where user_id = target;
end $$;
revoke execute on function admin_set_password(uuid, text) from public, anon;
grant execute on function admin_set_password(uuid, text) to authenticated;

-- Rangliste: bei Zeit-Rekord die Rastergröße der besten Runde mit anzeigen (neue Spalte timed_size am Ende)
create or replace view leaderboard as
select p.id, p.username,
  coalesce(pr.current_level, 1) as level,
  case when pr.last_daily >= current_date - 1 then pr.daily_streak else 0 end as streak,
  coalesce(pr.best_streak, 0) as best_streak,
  coalesce(pr.timed_highscore, 0) as timed_highscore,
  coalesce(g.games, 0)::int as games,
  coalesce(g.words, 0)::int as words,
  (select z.size from games z where z.user_id = p.id and z.mode = 'zeit' order by z.score desc, z.played_at limit 1) as timed_size
from profiles p
left join progress pr on pr.user_id = p.id
left join (select user_id, count(*) as games, sum(words_found) as words from games group by user_id) g on g.user_id = p.id
where not p.banned;
revoke all on leaderboard from anon;
grant select on leaderboard to authenticated;
