import { THEMES } from './puzzles.js';

export function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const shuffle = (arr, r) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export const neighbors = (i, size) => {
  const r = Math.floor(i / size), c = i % size, out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = r + dr, nc = c + dc;
    if ((dr || dc) && nr >= 0 && nc >= 0 && nr < size && nc < size) out.push(nr * size + nc);
  }
  return out;
};

// 4×4 hat nur 16 Felder: mit Wörtern ab 4 Buchstaben passen dort 5 Wörter, sonst mindestens 6
export const minWords = size => (size === 4 ? 5 : 6);
const MIN_LEN = 4, MAX_LEN = 12;
const MAX_WORDS = { 4: 7, 5: 9, 6: 11, 7: 13, 8: 16 };

// Legt ein Wort als Pfad; Zellen dürfen mit anderen Wörtern geteilt werden, wenn der Buchstabe passt.
function placePath(word, grid, size, r) {
  let budget = 4000; // shortcut: begrenzte Suche statt vollständigem Backtracking, reicht bis 8x8
  const path = [];
  const fits = (cell, k) => grid[cell] === null || grid[cell] === word[k];
  // Geteilte Buchstaben bevorzugen: spart Platz für mehr Wörter, Buchstaben werden mehrfach benutzt
  const order = (cells, k) => shuffle(cells, r).map(c => [c, grid[c] === word[k] ? 0 : 1]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const dfs = (cell, k) => {
    if (--budget < 0 || !fits(cell, k) || path.includes(cell)) return false;
    path.push(cell);
    if (k === word.length - 1) return true;
    for (const n of order(neighbors(cell, size), k + 1)) if (dfs(n, k + 1)) return true;
    path.pop();
    return false;
  };
  for (const start of order([...grid.keys()], 0)) if (dfs(start, 0)) return path;
  return null;
}

// grid[i] = Buchstabe oder null (Lücke). Jede Buchstabenzelle gehört zu mindestens einem Wort;
// wie oft sie benutzt wird, ergibt sich aus den Pfaden aller Wörter.
export function makePuzzle(themeIndex, size, seed) {
  const want = MAX_WORDS[size] ?? 9;
  // Klappt ein Thema nicht, das nächste nehmen (bei 4×4 passen nur etwa 60 der 84 Themen)
  for (let attempt = 0; attempt < THEMES.length * 40; attempt++) {
    const theme = THEMES[(themeIndex + Math.floor(attempt / 40)) % THEMES.length];
    const r = rng(seed + attempt * 7919);
    const grid = new Array(size * size).fill(null);
    const words = [];
    const all = shuffle(theme.words.filter(w => w.length >= MIN_LEN && w.length <= MAX_LEN), r);
    // Ein langes Wort zuerst legen, damit fast jedes Rätsel eins hat; bei kleinen Feldern danach kurze zuerst, sonst passen zu wenige rein
    const long = all.find(w => w.length >= (size === 4 ? 7 : 8));
    const rest = all.filter(w => w !== long);
    if (size <= 5) rest.sort((a, b) => a.length - b.length);
    for (const w of long ? [long, ...rest] : rest) {
      if (words.length >= want) break;
      const path = placePath(w, grid, size, r);
      if (!path) continue;
      path.forEach((cell, k) => (grid[cell] = w[k]));
      words.push({ word: w, path });
    }
    const covered = grid.filter(Boolean).length;
    if (words.length >= minWords(size) && covered >= size * size * 0.75) return { title: theme.title, size, grid, words };
  }
  throw new Error('Kein Rätsel möglich: ' + THEMES[themeIndex % THEMES.length].title + ' ' + size);
}

export const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD lokal

export function dailyPuzzle(date = today()) {
  const h = hash(date);
  return makePuzzle(h % THEMES.length, 4, h);
}

// Feste Übungsrunde für den ersten Start (Seed 1 ergibt 5 Obstsorten inkl. KIWI, siehe selftest)
export const tutorialPuzzle = () => makePuzzle(THEMES.findIndex(t => t.title === 'Obst'), 4, 1);

export const levelSize = lvl => (lvl <= 10 ? 5 : lvl <= 25 ? 6 : lvl <= 45 ? 7 : 8);

export function levelPuzzle(lvl) {
  const h = hash('level' + lvl);
  return makePuzzle(h % THEMES.length, levelSize(lvl), h);
}

export function randomPuzzle(size, avoidTitle) {
  for (let i = 0; i < 5; i++) { // anderes Thema als avoidTitle bevorzugen
    const p = randomPuzzle0(size);
    if (p.title !== avoidTitle || i === 4) return p;
  }
}
function randomPuzzle0(size) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  return makePuzzle(seed % THEMES.length, size, seed);
}
