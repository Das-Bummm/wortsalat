import assert from 'node:assert/strict';
import { THEMES } from './puzzles.js';
import { makePuzzle, neighbors, dailyPuzzle, levelPuzzle } from './game.js';

let n = 0;
for (let t = 0; t < THEMES.length; t++) for (const size of [4, 5, 6, 7, 8]) {
  const p = makePuzzle(t, size, t * 31 + size);
  assert.equal(p.grid.length, size * size);
  assert.ok(p.grid.every(c => typeof c === 'string' && c.length === 1));
  const cells = new Set();
  for (const { word, path } of p.words) {
    assert.equal(path.map(i => p.grid[i]).join(''), word);
    path.forEach((c, k) => { assert.ok(!cells.has(c)); cells.add(c); if (k) assert.ok(neighbors(path[k - 1], size).includes(c)); });
  }
  n++;
}
assert.deepEqual(dailyPuzzle('2026-11-18'), dailyPuzzle('2026-11-18'));
for (let l = 1; l <= 80; l++) levelPuzzle(l);
console.log(`ok: ${THEMES.length} Themen, ${n} Rätsel geprüft`);
