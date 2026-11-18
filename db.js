import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const online = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
let sb = null;
let user = null;

const DEFAULT_PROGRESS = { current_level: 1, daily_streak: 0, best_streak: 0, timed_highscore: 0, last_daily: null };

const key = name => `ws_${user ? user.id : 'gast'}_${name}`;
const load = (name, fallback) => { try { return JSON.parse(localStorage.getItem(key(name))) ?? fallback; } catch { return fallback; } };
const save = (name, val) => { try { localStorage.setItem(key(name), JSON.stringify(val)); } catch {} };

export const getUser = () => user;
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

export async function signUp(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.session) return 'Bitte bestätige die E-Mail, dann anmelden.';
  await afterLogin(data.user);
}

export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await afterLogin(data.user);
}

export async function signOut() {
  await sb.auth.signOut();
  user = null;
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
    const [g, p] = await Promise.all([
      sb.from('games').select('*').order('played_at', { ascending: false }), // neueste zuerst: API liefert max. 1000 Zeilen
      sb.from('progress').select('*').maybeSingle(),
    ]);
    if (g.error) throw g.error;
    if (p.error) throw p.error;
    save('games', mergeGames(load('games', []), g.data));
    const merged = mergeProgress(progress(), { ...DEFAULT_PROGRESS, ...(p.data ?? {}) });
    save('progress', merged);
    const up = await sb.from('progress').upsert({ ...merged, user_id: user.id, updated_at: new Date().toISOString() });
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
export const dailyState = date => load('daily_' + date, null);
export const setDailyState = (date, s) => save('daily_' + date, s);
