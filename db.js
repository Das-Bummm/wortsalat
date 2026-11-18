import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const online = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
let sb = null;
let user = null;
let profile = null; // { username, is_admin, banned }

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
// Supabase braucht eine E-Mail: Benutzernamen bekommen eine nie zustellbare Platzhalter-Adresse (.invalid ist reserviert)
const toEmail = name => (name.includes('@') ? name.trim() : `${name.trim().toLowerCase()}@wortsalat.invalid`);

const DEFAULT_PROGRESS = { current_level: 1, daily_streak: 0, best_streak: 0, timed_highscore: 0, last_daily: null };

const key = name => `ws_${user ? user.id : 'gast'}_${name}`;
const load = (name, fallback) => { try { return JSON.parse(localStorage.getItem(key(name))) ?? fallback; } catch { return fallback; } };
const save = (name, val) => { try { localStorage.setItem(key(name), JSON.stringify(val)); } catch {} };

export const getUser = () => user;
export const getProfile = () => profile;
export const games = () => load('games', []);
export const progress = () => ({ ...DEFAULT_PROGRESS, ...load('progress', {}) });

export async function init() {
  if (!online) return;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await sb.auth.getSession();
  // Auch bei jedem Start Gast-Daten übernehmen (z. B. Spiele, die offline vor dem Login-Check gespeichert wurden)
  if (data.session) await afterLogin(data.session.user);
  addEventListener('online', sync);
}

export async function signUp(username, password) {
  username = username.trim();
  if (!USERNAME_RE.test(username)) throw new Error('Benutzername: 3–20 Zeichen, nur Buchstaben, Zahlen und _.');
  const { data, error } = await sb.auth.signUp({ email: toEmail(username), password, options: { data: { username } } });
  if (error) throw new Error(/already registered/i.test(error.message) ? 'Dieser Benutzername ist schon vergeben.' : error.message);
  if (!data.session) return 'Konto angelegt. Bitte jetzt anmelden.';
  await afterLogin(data.user);
}

export async function signIn(name, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email: toEmail(name), password });
  if (error) throw error;
  await afterLogin(data.user);
}

export async function signOut() {
  await sb.auth.signOut();
  user = null;
  profile = null;
}

async function afterLogin(u) {
  // Gast-Spiele ins Konto übernehmen
  const guestQueue = load('queue', []), guestGames = load('games', []), guestProg = progress();
  user = u;
  save('queue', [...load('queue', []), ...guestQueue]);
  save('games', mergeGames(load('games', []), guestGames));
  save('progress', mergeProgress(progress(), guestProg));
  localStorage.removeItem('ws_gast_queue'); localStorage.removeItem('ws_gast_games'); localStorage.removeItem('ws_gast_progress');
  await sync();
}

const mergeGames = (a, b) => [...new Map([...a, ...b].map(g => [g.id, g])).values()];

function mergeProgress(a, b) {
  const newer = (a.last_daily ?? '') >= (b.last_daily ?? '') ? a : b;
  return {
    current_level: Math.max(a.current_level, b.current_level),
    best_streak: Math.max(a.best_streak, b.best_streak),
    timed_highscore: Math.max(a.timed_highscore, b.timed_highscore),
    daily_streak: newer.daily_streak,
    last_daily: newer.last_daily,
  };
}

export async function sync() {
  if (!sb || !user || !navigator.onLine) return;
  try {
    const queue = load('queue', []);
    if (queue.length) {
      const { error } = await sb.from('games').upsert(queue.map(q => ({ ...q, user_id: user.id })), { ignoreDuplicates: true });
      if (error) throw error;
      save('queue', load('queue', []).filter(g => !queue.some(q => q.id === g.id)));
    }
    // eq(user_id): Admins dürfen alle Zeilen lesen, hier zählen nur die eigenen
    const [g, p, pf] = await Promise.all([
      sb.from('games').select('*').eq('user_id', user.id).order('played_at', { ascending: false }), // neueste zuerst: API liefert max. 1000 Zeilen
      sb.from('progress').select('*').eq('user_id', user.id).maybeSingle(),
      sb.from('profiles').select('username, is_admin, banned').eq('id', user.id).maybeSingle(),
    ]);
    if (g.error) throw g.error;
    if (p.error) throw p.error;
    if (!pf.error) profile = pf.data;
    const server = { ...DEFAULT_PROGRESS, ...(p.data ?? {}) };
    // Hat ein Admin die Werte geändert, gilt der Server-Stand statt des Gerätestands
    const override = p.data?.admin_override;
    save('games', override ? mergeGames(g.data, load('queue', [])) : mergeGames(load('games', []), g.data));
    const merged = override ? mergeProgress(server, server) : mergeProgress(progress(), server);
    save('progress', merged);
    const up = await sb.from('progress').upsert({ ...merged, user_id: user.id, admin_override: false, updated_at: new Date().toISOString() });
    if (up.error) throw up.error;
  } catch (e) {
    console.warn('Sync fehlgeschlagen, wird später wiederholt', e);
  }
}

export function recordGame(row) {
  const g = { id: crypto.randomUUID(), played_at: new Date().toISOString(), score: 0, hints: 0, seconds: 0, level: null, ...row };
  save('games', [...games(), g]);
  if (online) save('queue', [...load('queue', []), g]);
  sync();
}

export function setProgress(patch) {
  save('progress', { ...progress(), ...patch });
  sync();
}

// Lokaler Spielstand des Tagesrätsels (nur dieses Gerät)
// daily5_: Tagesrätsel seit 420 Themen anders ausgewählt, alte Spielstände passen nicht mehr
export const dailyState = date => load('daily5_' + date, null);
export const setDailyState = (date, s) => save('daily5_' + date, s);

// ---------- Rangliste & Admin ----------
const rows = async q => { const { data, error } = await q; if (error) throw error; return data; };

export const leaderboard = () => rows(sb.from('leaderboard').select('*'));
export const adminOverview = () => rows(sb.from('admin_overview').select('*').order('created_at'));

export async function adminSaveUser(id, prof, prog) {
  await rows(sb.from('profiles').update(prof).eq('id', id));
  await rows(sb.from('progress').upsert({ user_id: id, ...prog, admin_override: true, updated_at: new Date().toISOString() }));
  if (id === user.id) { save('progress', { ...progress(), ...prog }); await sync(); }
}

export async function adminClearGames(id) {
  await rows(sb.from('games').delete().eq('user_id', id));
  await rows(sb.from('progress').upsert({ user_id: id, admin_override: true, updated_at: new Date().toISOString() }));
  if (id === user.id) { save('games', []); save('queue', []); }
}

export const adminDeleteUser = id => rows(sb.rpc('admin_delete_user', { target: id }));
