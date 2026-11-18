import assert from 'node:assert/strict';
import { THEMES } from './puzzles.js';
import { makePuzzle, neighbors, dailyPuzzle, levelPuzzle, MIN_WORDS } from './game.js';

const stats = {};
for (let t = 0; t < THEMES.length; t++) for (const size of [5, 6, 7, 8]) {
  for (const seed of [1, 2, 3]) {
    const p = makePuzzle(t, size, t * 31 + size * 7 + seed);
    assert.equal(p.grid.length, size * size);
    assert.ok(p.words.length >= MIN_WORDS, `${p.title} ${size}: nur ${p.words.length} Wörter`);
    const uses = new Array(size * size).fill(0);
    for (const { word, path } of p.words) {
      assert.equal(path.map(i => p.grid[i]).join(''), word);
      assert.equal(new Set(path).size, path.length, 'Zelle doppelt im selben Wort');
      path.forEach((c, k) => { uses[c]++; if (k) assert.ok(neighbors(path[k - 1], size).includes(c)); });
    }
    // Jede Buchstabenzelle wird gebraucht, Lücken sind leer → Feld löst sich komplett auf
    p.grid.forEach((ch, i) => assert.equal(ch === null, uses[i] === 0));
    const s = (stats[size] ??= { n: 0, words: 0, holes: 0, shared: 0 });
    s.n++; s.words += p.words.length; s.holes += uses.filter(u => !u).length; s.shared += uses.filter(u => u > 1).length;
  }
}
assert.deepEqual(dailyPuzzle('2026-11-18'), dailyPuzzle('2026-11-18'));
for (let l = 1; l <= 80; l++) assert.ok(levelPuzzle(l).words.length >= MIN_WORDS);
for (const [size, s] of Object.entries(stats))
  console.log(`${size}×${size}: Ø ${(s.words / s.n).toFixed(1)} Wörter, Ø ${(s.shared / s.n).toFixed(1)} geteilte Felder, Ø ${(s.holes / s.n).toFixed(1)} Lücken`);
console.log('ok');
