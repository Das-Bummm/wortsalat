-- Teil 2: Benutzernamen, Rangliste, Admin. Einmal im Supabase SQL-Editor ausführen (nach supabase.sql).

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  is_admin boolean not null default false,
  banned boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_username_lower on profiles (lower(username));
alter table profiles enable row level security;

-- Admin-Änderungen sollen beim nächsten Sync nicht von den Gerätedaten überschrieben werden
alter table progress add column if not exists admin_override boolean not null default false;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- Profil wird beim Registrieren automatisch angelegt (Benutzername kommt aus den Anmeldedaten)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'spieler_' || left(replace(new.id::text, '-', ''), 8)));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Bestehende Konten bekommen ein Profil; das zuerst registrierte Konto wird Admin
insert into profiles (id, username)
select id, 'spieler_' || left(replace(id::text, '-', ''), 8) from auth.users
on conflict (id) do nothing;
update profiles set is_admin = true, username = 'admin'
where id = (select id from auth.users order by created_at limit 1);

-- Rechte
grant select, update, delete on profiles to authenticated;
grant delete on games to authenticated;
grant insert, update on progress to authenticated;

create policy "Profile lesen" on profiles for select to authenticated using (true);
create policy "Admin ändert Profile" on profiles for update to authenticated using (is_admin());
create policy "Admin löscht Profile" on profiles for delete to authenticated using (is_admin());

create policy "Admin liest Spiele" on games for select to authenticated using (is_admin());
create policy "Admin löscht Spiele" on games for delete to authenticated using (is_admin());
create policy "Admin liest Fortschritt" on progress for select to authenticated using (is_admin());
create policy "Admin legt Fortschritt an" on progress for insert to authenticated with check (is_admin());
create policy "Admin ändert Fortschritt" on progress for update to authenticated using (is_admin());

-- Gesperrte Konten können nichts mehr speichern
create policy "Gesperrt: keine Spiele" on games as restrictive for insert to authenticated
  with check (not exists (select 1 from profiles where id = auth.uid() and banned));
create policy "Gesperrt: kein Fortschritt (neu)" on progress as restrictive for insert to authenticated
  with check (is_admin() or not exists (select 1 from profiles where id = auth.uid() and banned));
create policy "Gesperrt: kein Fortschritt (ändern)" on progress as restrictive for update to authenticated
  using (is_admin() or not exists (select 1 from profiles where id = auth.uid() and banned));

-- Rangliste: nur Summen, für alle angemeldeten Spieler lesbar (gesperrte ausgeblendet)
create or replace view leaderboard as
select p.id, p.username,
  coalesce(pr.current_level, 1) as level,
  case when pr.last_daily >= current_date - 1 then pr.daily_streak else 0 end as streak,
  coalesce(pr.best_streak, 0) as best_streak,
  coalesce(pr.timed_highscore, 0) as timed_highscore,
  coalesce(g.games, 0)::int as games,
  coalesce(g.words, 0)::int as words
from profiles p
left join progress pr on pr.user_id = p.id
left join (select user_id, count(*) as games, sum(words_found) as words from games group by user_id) g on g.user_id = p.id
where not p.banned;
revoke all on leaderboard from anon;
grant select on leaderboard to authenticated;

-- Admin-Übersicht: alle Konten mit allen Werten, liefert nur für Admins Zeilen
create or replace view admin_overview as
select p.id, p.username, p.is_admin, p.banned, p.created_at, u.email, u.last_sign_in_at,
  coalesce(pr.current_level, 1) as current_level,
  coalesce(pr.daily_streak, 0) as daily_streak,
  coalesce(pr.best_streak, 0) as best_streak,
  coalesce(pr.timed_highscore, 0) as timed_highscore,
  pr.last_daily,
  coalesce(g.games, 0)::int as games,
  coalesce(g.words, 0)::int as words
from profiles p
join auth.users u on u.id = p.id
left join progress pr on pr.user_id = p.id
left join (select user_id, count(*) as games, sum(words_found) as words from games group by user_id) g on g.user_id = p.id
where is_admin();
revoke all on admin_overview from anon;
grant select on admin_overview to authenticated;

-- Admin löscht ein Konto komplett (inkl. Login, Spiele, Fortschritt)
create or replace function admin_delete_user(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Nur für Admins'; end if;
  if target = auth.uid() then raise exception 'Eigenes Konto kann nicht gelöscht werden'; end if;
  delete from auth.users where id = target;
end $$;
revoke execute on function admin_delete_user(uuid) from public, anon;
grant execute on function admin_delete_user(uuid) to authenticated;
