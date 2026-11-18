// Haustiere, die über Startbildschirm und Spielfeld laufen. Rein dekorativ: fangen keine Klicks ab.

const siam = `
<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><path d="M15 25 C 7 24, 4 16, 8 8" fill="none" stroke="#5b4033" stroke-width="4" stroke-linecap="round"/></g>
  <g class="leg back a"><rect x="17" y="28" width="5" height="13" rx="2.5" fill="#e9dcc6"/><rect x="17" y="37" width="5" height="4" rx="2" fill="#5b4033"/></g>
  <g class="leg front b"><rect x="40" y="28" width="5" height="13" rx="2.5" fill="#e9dcc6"/><rect x="40" y="37" width="5" height="4" rx="2" fill="#5b4033"/></g>
  <ellipse cx="30" cy="26" rx="18" ry="9" fill="#f3e9d8"/>
  <ellipse cx="30" cy="30" rx="15" ry="4.5" fill="#e6d7bf"/>
  <g class="leg back b"><rect x="23" y="28" width="5" height="13" rx="2.5" fill="#f3e9d8"/><rect x="23" y="37" width="5" height="4" rx="2" fill="#5b4033"/></g>
  <g class="leg front a"><rect x="45" y="28" width="5" height="13" rx="2.5" fill="#f3e9d8"/><rect x="45" y="37" width="5" height="4" rx="2" fill="#5b4033"/></g>
  <g class="head">
    <path d="M43 13 L45 3 L50 11 Z" fill="#5b4033"/>
    <path d="M51 10 L56 2 L57 12 Z" fill="#5b4033"/>
    <circle cx="50" cy="17" r="8.5" fill="#f3e9d8"/>
    <ellipse cx="53" cy="20" rx="5.5" ry="5" fill="#5b4033" opacity=".85"/>
    <g class="eyes"><ellipse cx="52.5" cy="16.5" rx="1.8" ry="1.5" fill="#5aa6e8"/><circle cx="53" cy="16.5" r=".7" fill="#1d2a33"/></g>
    <path class="closed" d="M50.8 16.8 Q52.5 18 54.2 16.8" fill="none" stroke="#1d2a33" stroke-width=".8" stroke-linecap="round"/>
    <circle cx="57.6" cy="20" r="1" fill="#2b1d16"/>
    <path d="M58 22 L63 21 M58 23 L63 24" stroke="#d9cbb4" stroke-width=".5"/>
  </g>
</svg>`;

export const PETS = [
  { id: 'siam', name: 'Siamkatze', svg: siam },
  { id: 'hund', name: 'Hund', soon: true },
  { id: 'kuh', name: 'Kuh', soon: true },
  { id: 'hase', name: 'Hase', soon: true },
];

const SIZE = 64, SPEED = 38; // px pro Sekunde
let el = null, raf = 0, last = 0;
const st = { x: 40, y: 0, tx: 0, ty: 0, mode: 'sit', until: 0, dir: 1 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function pickTarget(now) {
  const w = innerWidth, h = innerHeight;
  st.tx = 8 + Math.random() * Math.max(1, w - SIZE - 16);
  // meist unten am Rand laufen, ab und zu quer über den Bildschirm
  st.ty = Math.random() < 0.6 ? h - SIZE - 12 : h * 0.12 + Math.random() * (h * 0.75 - SIZE);
  st.mode = 'walk';
  st.until = now;
}

function setMode(mode) {
  el.classList.toggle('walking', mode === 'walk');
  el.classList.toggle('sleeping', mode === 'sleep');
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (st.mode === 'walk') {
    const dx = st.tx - st.x, dy = st.ty - st.y, d = Math.hypot(dx, dy);
    if (d < 2) {
      st.mode = Math.random() < 0.25 ? 'sleep' : 'sit';
      st.until = now + (st.mode === 'sleep' ? 8000 + Math.random() * 6000 : 2000 + Math.random() * 4000);
    } else {
      st.x += (dx / d) * SPEED * dt;
      st.y += (dy / d) * SPEED * dt;
      if (Math.abs(dx) > 1) st.dir = dx > 0 ? 1 : -1;
    }
  } else if (now > st.until && !reduced) pickTarget(now);
  setMode(st.mode);
  el.style.transform = `translate(${st.x}px, ${st.y}px) scaleX(${st.dir})`;
  raf = requestAnimationFrame(frame);
}

export function showPet(id) {
  cancelAnimationFrame(raf);
  el?.remove();
  el = null;
  const pet = PETS.find(p => p.id === id && !p.soon);
  if (!pet) return;
  el = document.createElement('div');
  el.className = 'pet';
  el.innerHTML = pet.svg + '<span class="zzz">z</span>';
  document.body.append(el);
  st.x = 16; st.y = innerHeight - SIZE - 12; st.mode = 'sit'; st.until = performance.now() + 1500;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

// Im Hintergrund nicht weiterrechnen
document.addEventListener('visibilitychange', () => {
  if (!el) return;
  if (document.hidden) cancelAnimationFrame(raf);
  else { last = performance.now(); raf = requestAnimationFrame(frame); }
});
