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

const FILL = 'EEEEEENNNNIIIISSSRRRAAAATTTDDHHUULLCGMOBWFKZPVÜÄÖ';

export const neighbors = (i, size) => {
  const r = Math.floor(i / size), c = i % size, out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const nr = r + dr, nc = c + dc;
    if ((dr || dc) && nr >= 0 && nc >= 0 && nr < size && nc < size) out.push(nr * size + nc);
  }
  return out;
};

// Legt ein Wort als zusammenhängenden Pfad in freie Zellen; null wenn nicht möglich.
function placePath(word, grid, size, r) {
  let budget = 4000; // shortcut: begrenzte Suche statt vollständigem Backtracking, reicht bis 8x8
  const path = [];
  const dfs = (cell, k) => {
    if (--budget < 0 || grid[cell] !== null || path.includes(cell)) return false;
    path.push(cell);
    if (k === word.length - 1) return true;
    for (const n of shuffle(neighbors(cell, size), r)) if (dfs(n, k + 1)) return true;
    path.pop();
    return false;
  };
  for (const start of shuffle([...grid.keys()], r)) if (dfs(start, 0)) return path;
  return null;
}

export function makePuzzle(themeIndex, size, seed) {
  const theme = THEMES[themeIndex % THEMES.length];
  const target = size * size;
  for (let attempt = 0; attempt < 50; attempt++) {
    const r = rng(seed + attempt * 7919);
    const grid = new Array(size * size).fill(null);
    const words = [];
    let used = 0;
    const pool = shuffle(theme.words.filter(w => w.length >= 3 && w.length <= Math.max(size + 2, 6)), r);
    for (const w of pool) {
      if (used + w.length > target) continue;
      const path = placePath(w, grid, size, r);
      if (!path) continue;
      path.forEach((cell, k) => (grid[cell] = w[k]));
      words.push({ word: w, path });
      used += w.length;
    }
    if (words.length >= 3 && used >= size * size * 0.5) {
      for (let i = 0; i < grid.length; i++) if (grid[i] === null) grid[i] = FILL[Math.floor(r() * FILL.length)];
      return { title: theme.title, size, grid, words };
    }
  }
  throw new Error('Kein Rätsel möglich: ' + theme.title + ' ' + size);
}

export const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD lokal

export function dailyPuzzle(date = today()) {
  const h = hash(date);
  return makePuzzle(h % THEMES.length, 5, h);
}

export const levelSize = lvl => (lvl <= 5 ? 4 : lvl <= 15 ? 5 : lvl <= 30 ? 6 : lvl <= 50 ? 7 : 8);

export function levelPuzzle(lvl) {
  const h = hash('level' + lvl);
  return makePuzzle(h % THEMES.length, levelSize(lvl), h);
}

export function randomPuzzle(size) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  return makePuzzle(seed % THEMES.length, size, seed);
}
