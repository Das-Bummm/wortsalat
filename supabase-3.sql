-- Teil 3: Anmeldung nur noch mit Benutzernamen. Einmal im Supabase SQL-Editor ausführen.

-- Login-Adresse = Benutzername + Platzhalter-Domain; ändert sich der Benutzername, zieht die Login-Adresse mit
create or replace function sync_login_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare mail text := lower(new.username) || '@wortsalat.invalid';
begin
  update auth.users set email = mail where id = new.id;
  update auth.identities set identity_data = identity_data || jsonb_build_object('email', mail)
  where user_id = new.id and provider = 'email';
  return new;
end $$;
drop trigger if exists on_username_change on profiles;
create trigger on_username_change after update of username on profiles
  for each row when (old.username is distinct from new.username) execute function sync_login_email();

-- Das Admin-Konto (bisher mit E-Mail) meldet sich ab jetzt mit dem Benutzernamen „admin“ an
update auth.users set email = 'admin@wortsalat.invalid'
where id = (select id from profiles where username = 'admin');
update auth.identities set identity_data = identity_data || jsonb_build_object('email', 'admin@wortsalat.invalid')
where provider = 'email' and user_id = (select id from profiles where username = 'admin');

-- Kontrolle: sollte eine Zeile „admin | admin@wortsalat.invalid“ zeigen
select p.username, u.email from profiles p join auth.users u on u.id = p.id where p.is_admin;
