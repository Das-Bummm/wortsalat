import assert from 'node:assert/strict';
import { THEMES } from './puzzles.js';
import { pick } from './push/rules.mjs';
import { BAD_WORDS, badUsername } from './badwords.js';
import { readFileSync } from 'node:fs';
import { makePuzzle, neighbors, dailyPuzzle, levelPuzzle, tutorialPuzzle, minWords } from './game.js';

const stats = {};
for (let t = 0; t < THEMES.length; t++) for (const size of [4, 5, 6, 7, 8]) {
  for (const seed of [1, 2, 3]) {
    const p = makePuzzle(t, size, t * 31 + size * 7 + seed);
    assert.equal(p.grid.length, size * size);
    assert.ok(p.words.length >= minWords(size), `${p.title} ${size}: nur ${p.words.length} Wörter`);
    assert.ok(p.words.every(w => w.word.length >= 4 && w.word.length <= 12), 'Wortlänge außerhalb 4–12');
    const uses = new Array(size * size).fill(0);
    for (const { word, path } of p.words) {
      assert.equal(path.map(i => p.grid[i]).join(''), word);
      assert.equal(new Set(path).size, path.length, 'Zelle doppelt im selben Wort');
      path.forEach((c, k) => { uses[c]++; if (k) assert.ok(neighbors(path[k - 1], size).includes(c)); });
    }
    // Jede Buchstabenzelle wird gebraucht, Lücken sind leer → Feld löst sich komplett auf
    p.grid.forEach((ch, i) => assert.equal(ch === null, uses[i] === 0));
    const s = (stats[size] ??= { n: 0, words: 0, holes: 0, shared: 0, longest: 0 });
    s.n++; s.words += p.words.length; s.longest += Math.max(...p.words.map(w => w.word.length)); s.holes += uses.filter(u => !u).length; s.shared += uses.filter(u => u > 1).length;
  }
}
assert.deepEqual(dailyPuzzle('2026-11-18'), dailyPuzzle('2026-11-18'));
const tut = tutorialPuzzle();
assert.equal(tut.title, 'Obst');
assert.ok(tut.words.some(w => w.word === 'KIWI'));
for (let l = 1; l <= 80; l++) { const p = levelPuzzle(l); assert.ok(p.words.length >= minWords(p.size)); }
for (const [size, s] of Object.entries(stats))
  console.log(`${size}×${size}: Ø ${(s.words / s.n).toFixed(1)} Wörter, Ø ${(s.shared / s.n).toFixed(1)} geteilte Felder, Ø ${(s.holes / s.n).toFixed(1)} Lücken, Ø längstes Wort ${(s.longest / s.n).toFixed(1)}`);

// Mitteilungen: welche zu welcher Uhrzeit
{
  const at = (hour, extra = {}) => ({ date: '2026-11-19', hour, sunday: false, ...extra });
  const t = { streak: 6, last_daily: '2026-11-18', prefs: {}, last_sent: {}, week_games: 4, week_words: 30 };
  const kind = (row, now, last = '2026-11-18') => pick(row, now, 'Obst', last)?.[0] ?? null;
  assert.equal(kind(t, at(7)), null);
  assert.equal(kind(t, at(8)), 'tag');
  assert.match(pick(t, at(8), 'Obst')[2], /Heute erreichst du 7 Tage/);
  assert.equal(kind({ ...t, last_sent: { tag: '2026-11-19' } }, at(9)), null);
  assert.equal(kind(t, at(19)), 'serie');
  assert.equal(kind(t, at(22)), 'letzte');
  assert.match(pick(t, at(23), 'Obst')[2], /Noch 1 Stunde,/);
  assert.equal(kind({ ...t, prefs: { letzte: false } }, at(22)), null);
  assert.equal(kind({ ...t, last_daily: '2026-11-19' }, at(19)), null); // heute schon gespielt
  assert.equal(kind({ ...t, last_daily: '2026-11-19' }, at(18, { sunday: true })), 'woche');
  assert.equal(kind({ ...t, last_daily: '2026-11-10' }, at(19), '2026-11-16'), 'comeback'); // 3 Tage Pause
  assert.equal(kind({ ...t, last_daily: '2026-11-10' }, at(19), '2026-11-15'), null);
}
// Namensfilter: App-Liste und Datenbank-Liste gleich, Treffer und Nicht-Treffer
{
  const sqlWords = readFileSync(new URL('./supabase-6.sql', import.meta.url), 'utf8').match(/array\[([^\]]*)\]/)[1].match(/'([^']+)'/g).map(w => w.slice(1, -1));
  assert.deepEqual(sqlWords, BAD_WORDS);
  for (const n of ['Fi_ck3r', 'HITLER88', 'sh1t_happens', 'Scheisse', 'Arschloch1', 'n4zi']) assert.ok(badUsername(n), n);
  for (const n of ['Wortfan_2026', 'admin', 'Torpedo', 'Kiwi', 'Albert', 'Carl', 'Spielerin', 'Marsch', 'Schnecke']) assert.ok(!badUsername(n), n);
}
console.log('ok');
