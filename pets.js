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

const hund = `
<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><path d="M14 23 C 8 21, 6 14, 9 8" fill="none" stroke="#b9824c" stroke-width="4" stroke-linecap="round"/></g>
  <g class="leg back a"><rect x="17" y="28" width="5" height="13" rx="2.5" fill="#c8955e"/><rect x="17" y="37" width="5" height="4" rx="2" fill="#f6efe3"/></g>
  <g class="leg front b"><rect x="40" y="28" width="5" height="13" rx="2.5" fill="#c8955e"/><rect x="40" y="37" width="5" height="4" rx="2" fill="#f6efe3"/></g>
  <ellipse cx="30" cy="26" rx="18" ry="9" fill="#d9a46a"/>
  <ellipse cx="31" cy="30" rx="14" ry="4.5" fill="#f1dcc0"/>
  <g class="leg back b"><rect x="23" y="28" width="5" height="13" rx="2.5" fill="#d9a46a"/><rect x="23" y="37" width="5" height="4" rx="2" fill="#f6efe3"/></g>
  <g class="leg front a"><rect x="45" y="28" width="5" height="13" rx="2.5" fill="#d9a46a"/><rect x="45" y="37" width="5" height="4" rx="2" fill="#f6efe3"/></g>
  <g class="head">
    <circle cx="50" cy="16" r="8.5" fill="#d9a46a"/>
    <ellipse cx="56" cy="20" rx="5.5" ry="4" fill="#f1dcc0"/>
    <circle cx="60.6" cy="18.6" r="1.7" fill="#2b1d16"/>
    <path d="M56 23.5 Q58 25 60 23.5" fill="none" stroke="#7a4b2a" stroke-width=".8" stroke-linecap="round"/>
    <ellipse cx="57.5" cy="24.6" rx="1.3" ry="1.6" fill="#e9858f"/>
    <g class="eyes"><circle cx="52.5" cy="14.5" r="1.4" fill="#2b1d16"/><circle cx="52.9" cy="14.1" r=".45" fill="#fff"/></g>
    <path class="closed" d="M51 14.8 Q52.5 16 54 14.8" fill="none" stroke="#2b1d16" stroke-width=".8" stroke-linecap="round"/>
    <ellipse cx="45.5" cy="17" rx="3.6" ry="7.5" fill="#8a5a33" transform="rotate(12 45.5 17)"/>
  </g>
</svg>`;

const kuh = `
<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><path d="M12 22 C 8 24, 6 28, 7 33" fill="none" stroke="#5a5a5a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="7" cy="34.5" rx="2" ry="2.6" fill="#2e2e2e"/></g>
  <g class="leg back a"><rect x="16" y="28" width="6" height="13" rx="2.5" fill="#e4e4e4"/><rect x="16" y="37.5" width="6" height="3.5" rx="1.5" fill="#3a3a3a"/></g>
  <g class="leg front b"><rect x="40" y="28" width="6" height="13" rx="2.5" fill="#e4e4e4"/><rect x="40" y="37.5" width="6" height="3.5" rx="1.5" fill="#3a3a3a"/></g>
  <ellipse cx="30" cy="24.5" rx="19" ry="10" fill="#fdfdfd" stroke="#d6d6d6" stroke-width=".6"/>
  <path d="M19 18 C 24 15, 29 19, 27 23 C 25 27, 18 26, 17 22 Z" fill="#2e2e2e"/>
  <path d="M34 26 C 38 23, 44 25, 43 29 C 42 32, 36 33, 34 30 Z" fill="#2e2e2e"/>
  <ellipse cx="33" cy="33.5" rx="3.4" ry="2.2" fill="#f2a7b5"/>
  <g class="leg back b"><rect x="22" y="28" width="6" height="13" rx="2.5" fill="#fdfdfd"/><rect x="22" y="37.5" width="6" height="3.5" rx="1.5" fill="#3a3a3a"/></g>
  <g class="leg front a"><rect x="45" y="28" width="6" height="13" rx="2.5" fill="#fdfdfd"/><rect x="45" y="37.5" width="6" height="3.5" rx="1.5" fill="#3a3a3a"/></g>
  <g class="head">
    <path d="M46 9 C 44 6, 44 4, 45.5 2.5 L 47.5 8 Z" fill="#e8d9b0"/>
    <path d="M54 8.5 C 56 6, 56.5 4, 55.5 2.5 L 52.5 8 Z" fill="#e8d9b0"/>
    <ellipse cx="43.5" cy="12" rx="3.5" ry="2" fill="#2e2e2e" transform="rotate(-20 43.5 12)"/>
    <ellipse cx="51" cy="16" rx="7.5" ry="8.5" fill="#fdfdfd" stroke="#d6d6d6" stroke-width=".6"/>
    <path d="M51 8 C 56 8, 58 12, 57 16 C 55 15, 52 13, 51 8 Z" fill="#2e2e2e"/>
    <ellipse cx="52.5" cy="22.5" rx="6.5" ry="4.2" fill="#f2b8c3"/>
    <circle cx="50.5" cy="22.5" r=".9" fill="#a8606e"/><circle cx="55" cy="22.5" r=".9" fill="#a8606e"/>
    <g class="eyes"><circle cx="54" cy="14.5" r="1.4" fill="#1d1d1d"/><circle cx="54.4" cy="14.1" r=".45" fill="#fff"/></g>
    <path class="closed" d="M52.5 14.8 Q54 16 55.5 14.8" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round"/>
  </g>
</svg>`;

const hase = `
<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><circle cx="13" cy="25" r="4.5" fill="#fbfaf7"/></g>
  <g class="leg back a"><rect x="17" y="31" width="7" height="10" rx="3" fill="#a99d90"/><rect x="15" y="38" width="9" height="3" rx="1.5" fill="#efe9e1"/></g>
  <g class="leg front b"><rect x="35" y="31" width="4" height="10" rx="2" fill="#a99d90"/></g>
  <ellipse cx="27" cy="28" rx="14" ry="9.5" fill="#bdb2a6"/>
  <ellipse cx="29" cy="32" rx="10" ry="4" fill="#efe9e1"/>
  <g class="leg back b"><rect x="22" y="31" width="7" height="10" rx="3" fill="#bdb2a6"/><rect x="20" y="38" width="9" height="3" rx="1.5" fill="#efe9e1"/></g>
  <g class="leg front a"><rect x="39" y="31" width="4" height="10" rx="2" fill="#bdb2a6"/><rect x="39" y="38.5" width="4" height="2.5" rx="1.2" fill="#efe9e1"/></g>
  <g class="head">
    <ellipse cx="41.5" cy="7" rx="2.6" ry="8" fill="#a99d90" transform="rotate(-18 41.5 7)"/>
    <ellipse cx="46" cy="6" rx="2.8" ry="8.5" fill="#bdb2a6" transform="rotate(-6 46 6)"/>
    <ellipse cx="46" cy="6.5" rx="1.3" ry="6" fill="#f2c3c9" transform="rotate(-6 46 6.5)"/>
    <circle cx="46" cy="20" r="7.5" fill="#bdb2a6"/>
    <ellipse cx="50" cy="23" rx="3.5" ry="2.8" fill="#efe9e1"/>
    <path d="M51.7 20.6 L53.3 20.6 L52.5 21.7 Z" fill="#e48a98"/>
    <g class="eyes"><circle cx="49" cy="18" r="1.4" fill="#2a211c"/><circle cx="49.4" cy="17.6" r=".45" fill="#fff"/></g>
    <path class="closed" d="M47.5 18.3 Q49 19.5 50.5 18.3" fill="none" stroke="#2a211c" stroke-width=".8" stroke-linecap="round"/>
    <path d="M53 22 L58 21 M53 23 L58 24" stroke="#8e8378" stroke-width=".4"/>
  </g>
</svg>`;

// Carl: schwarze Katze, grüne Augen, Stummelschwanz, weißer Fleck an der hinteren Hüfte
const carl = `
<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><path d="M13.5 22.5 L9.5 19" fill="none" stroke="#5a5a62" stroke-width="6.7" stroke-linecap="round"/><path d="M13.5 22.5 L9.5 19" fill="none" stroke="#232326" stroke-width="5.5" stroke-linecap="round"/></g>
  <g class="leg back a"><rect x="17" y="28" width="5" height="13" rx="2.5" fill="#18181a" stroke="#5a5a62" stroke-width=".6"/></g>
  <g class="leg front b"><rect x="40" y="28" width="5" height="13" rx="2.5" fill="#18181a" stroke="#5a5a62" stroke-width=".6"/></g>
  <ellipse cx="30" cy="26" rx="18" ry="9" fill="#232326" stroke="#5a5a62" stroke-width=".6"/>
  <ellipse cx="20" cy="23.5" rx="4.2" ry="3.2" fill="#f4f1ea" transform="rotate(-15 20 23.5)"/>
  <g class="leg back b"><rect x="23" y="28" width="5" height="13" rx="2.5" fill="#232326" stroke="#5a5a62" stroke-width=".6"/></g>
  <g class="leg front a"><rect x="45" y="28" width="5" height="13" rx="2.5" fill="#232326" stroke="#5a5a62" stroke-width=".6"/></g>
  <g class="head">
    <path d="M43 13 L45 3 L50 11 Z" fill="#232326" stroke="#5a5a62" stroke-width=".6" stroke-linejoin="round"/>
    <path d="M51 10 L56 2 L57 12 Z" fill="#232326" stroke="#5a5a62" stroke-width=".6" stroke-linejoin="round"/>
    <path d="M45.2 10.5 L45.8 6 L48 10 Z" fill="#c9898f"/>
    <path d="M53 9.5 L55.5 5.5 L55.8 10.5 Z" fill="#c9898f"/>
    <circle cx="50" cy="17" r="8.5" fill="#232326" stroke="#5a5a62" stroke-width=".6"/>
    <g class="eyes"><ellipse cx="52.5" cy="16.5" rx="2" ry="1.7" fill="#6fd16a"/><ellipse cx="53" cy="16.5" rx=".5" ry="1.3" fill="#0d0d0d"/></g>
    <path class="closed" d="M50.8 16.8 Q52.5 18 54.2 16.8" fill="none" stroke="#6fd16a" stroke-width=".8" stroke-linecap="round"/>
    <path d="M56.8 19.6 L58.4 19.6 L57.6 20.6 Z" fill="#c9898f"/>
    <path d="M58 22 L63 21 M58 23 L63 24" stroke="#8a8a90" stroke-width=".5"/>
  </g>
</svg>`;

export const PETS = [
  { id: 'siam', name: 'Albert', art: 'Siamkatze', svg: siam },
  { id: 'carl', name: 'Carl', art: 'Schwarze Katze', svg: carl },
  { id: 'hund', name: 'Hund', svg: hund },
  { id: 'kuh', name: 'Kuh', svg: kuh },
  { id: 'hase', name: 'Hase', svg: hase },
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
