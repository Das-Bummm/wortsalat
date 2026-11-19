// Läuft stündlich als GitHub Action (.github/workflows/push.yml) und verschickt fällige Mitteilungen.
import webpush from 'web-push';
import { SUPABASE_URL, SUPABASE_ANON_KEY, VAPID_PUBLIC } from '../config.js';
import { dailyPuzzle } from '../game.js';
import { pick } from './rules.mjs';

const { PUSH_KEY, VAPID_PRIVATE } = process.env;
if (!PUSH_KEY || !VAPID_PRIVATE) throw new Error('Secrets PUSH_KEY und VAPID_PRIVATE fehlen');
webpush.setVapidDetails('https://das-bummm.github.io/wortsalat/', VAPID_PUBLIC, VAPID_PRIVATE);

const berlin = d => Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short', hourCycle: 'h23',
}).formatToParts(d).map(p => [p.type, p.value]));
const b = berlin(new Date());
const now = { date: `${b.year}-${b.month}-${b.day}`, hour: +b.hour, sunday: b.weekday === 'Sun' };
const dateOf = ts => { if (!ts) return null; const x = berlin(new Date(ts)); return `${x.year}-${x.month}-${x.day}`; };
const theme = dailyPuzzle(now.date).title;

const rpc = async (fn, args) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
};

const targets = await rpc('push_targets', { key: PUSH_KEY });
let sent = 0;
for (const t of targets) {
  const msg = pick(t, now, theme, dateOf(t.last_game));
  if (!msg) continue;
  const [kind, title, body] = msg;
  let gone = false;
  try {
    await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
      JSON.stringify({ title, body, tag: kind, start: kind === 'woche' ? null : 'tag' }), { TTL: 3 * 3600 });
    sent++;
  } catch (e) {
    gone = e.statusCode === 404 || e.statusCode === 410; // Abo abgelaufen oder abgemeldet
    console.warn('Senden fehlgeschlagen', e.statusCode ?? e.message);
    if (!gone) continue;
  }
  await rpc('push_done', { key: PUSH_KEY, ep: t.endpoint, kind, day: now.date, gone });
}
console.log(`${now.date} ${now.hour} Uhr: ${targets.length} Abos, ${sent} Mitteilungen`);
