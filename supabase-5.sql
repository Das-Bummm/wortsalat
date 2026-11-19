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
