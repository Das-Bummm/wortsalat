import assert from 'node:assert/strict';
import { THEMES } from './puzzles.js';
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
console.log('ok');
