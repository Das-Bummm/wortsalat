// Welche Mitteilung bekommt ein Abo jetzt? Reine Logik, getestet in selftest.mjs.
export const MILESTONES = [3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000];

export const KINDS = [
  ['tag', '🧩 Neues Tagesrätsel', 'jeden Morgen um 8 Uhr'],
  ['serie', '🔥 Serie in Gefahr', 'um 19 Uhr, wenn du noch nicht gespielt hast'],
  ['letzte', '⏰ Letzte Chance', 'um 22 Uhr, kurz bevor deine Serie verfällt'],
  ['comeback', '👋 Comeback', 'nach 3, 7 und 14 Tagen Pause'],
  ['woche', '📊 Wochenrückblick', 'sonntags um 18 Uhr'],
];

const dayNum = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// t: Zeile aus push_targets; now: { date: 'YYYY-MM-DD', hour, sunday } in deutscher Zeit; lastGameDate: Datum des letzten Spiels
export function pick(t, now, theme, lastGameDate) {
  const on = k => t.prefs?.[k] !== false && t.last_sent?.[k] !== now.date;
  const playedToday = t.last_daily === now.date;
  const alive = !playedToday && t.last_daily && dayNum(now.date) - dayNum(t.last_daily) === 1 && t.streak > 0;
  const next = t.streak + 1;
  const goal = MILESTONES.includes(next) ? ` Heute erreichst du ${next} Tage!` : '';
  const pause = lastGameDate ? dayNum(now.date) - dayNum(lastGameDate) : null;
  const h = now.hour;

  if (alive && h >= 22 && on('letzte'))
    return ['letzte', '⏰ Letzte Chance!', `Noch ${plural(24 - h, 'Stunde', 'Stunden')}, dann ist deine ${t.streak}-Tage-Serie weg.`];
  if (alive && h >= 19 && h < 22 && on('serie'))
    return ['serie', `🔥 ${t.streak} Tage – nicht aufgeben!`, `Du hast heute noch nicht gespielt. Rette deine Serie mit dem Tagesrätsel.${goal}`];
  if (now.sunday && h >= 18 && t.week_games > 0 && on('woche'))
    return ['woche', '📊 Deine Woche', `${plural(t.week_games, 'Rätsel', 'Rätsel')}, ${plural(t.week_words, 'Wort', 'Wörter')} gefunden. Serie: ${playedToday || alive ? t.streak : 0} 🔥`];
  if (!alive && !playedToday && [3, 7, 14].includes(pause) && h >= 18 && on('comeback'))
    return ['comeback', '👋 Lange nicht gesehen', `Das Tagesrätsel „${theme}“ wartet. Starte heute eine neue Serie!`];
  if (!playedToday && h >= 8 && h < 18 && on('tag'))
    return ['tag', '🧩 Das neue Tagesrätsel ist da', `Thema heute: ${theme}.${alive ? ` Halte deine ${t.streak}-Tage-Serie!${goal}` : ''}`];
  return null;
}
