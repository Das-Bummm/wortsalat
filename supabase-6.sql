-- Wortsalat: Filter gegen anstößige Benutzernamen. Einmal im SQL Editor ausführen.
-- Dieselbe Wortliste steht in badwords.js. Bestehende Namen bleiben unberührt, geprüft wird bei Registrierung und Namensänderung.

create or replace function username_norm(t text) returns text language sql immutable as $$
  select regexp_replace(translate(replace(lower(t), '_', ''), '0134578', 'oieastb'), '(.)\1+', '\1', 'g')
$$;

create or replace function username_bad(t text) returns boolean language sql immutable as $$
  select exists (
    select 1 from unnest(array['fick', 'fotze', 'hure', 'nutte', 'schlampe', 'wichser', 'wixer', 'arschloch', 'arschgeige', 'scheiss', 'pimmel', 'titten', 'muschi', 'missgeburt', 'spast', 'behindert', 'schwuchtel', 'kanake', 'neger', 'nigger', 'nigga', 'hitler', 'nazi', 'siegheil', 'heilhitler', 'kinderf', 'vergewalt', 'paedo', 'pedophil', 'fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'faggot', 'retard', 'penis', 'vagina', 'porno', 'porn']) w
    where position(username_norm(w) in username_norm(t)) > 0
  )
$$;

create or replace function check_username() returns trigger language plpgsql as $$
begin
  if username_bad(new.username) then raise exception 'Dieser Benutzername ist nicht erlaubt.'; end if;
  return new;
end $$;

drop trigger if exists profiles_username_filter on profiles;
create trigger profiles_username_filter before insert or update of username on profiles
  for each row execute function check_username();

-- Kontrolle: muss true, false ergeben
select username_bad('Fi_ck3r') as soll_true, username_bad('Wortfan_2026') as soll_false;
