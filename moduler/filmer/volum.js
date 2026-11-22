/* Filmsnutter til Volumverkstedet. Krever ../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, box, backEdges, poly, line, cylinder, nf } = F;
  const $ = s => document.querySelector(s);
  const panel = (rows, x = 300, y0 = 52, dy = 24) =>
    rows.map((r, i) => r ? text(x, y0 + i * dy, r[0], r[1] || 'fm-lbl', 'start', r[2] ? `opacity="${r[2]}"` : '') : '').join('');
  const carton = (x, y, w, h, cls = 'fm-icon') => {
    const t = h * .28;
    return `<path class="${cls}" d="M${x},${y + h} V${y + t} L${x + w * .5},${y} L${x + w},${y + t} V${y + h} Z"/>` +
      `<rect class="fm-icon-w" x="${x + 1.5}" y="${y + h * .55}" width="${w - 3}" height="${h * .3}"/>`;
  };
  const can = (x, y, s = 1) =>
    `<g transform="translate(${x},${y}) scale(${s})"><path class="fm-icon" d="M4,8 H20 L18,26 H6 Z"/><path class="fm-pipe" style="stroke-width:2.2" d="M19,12 L28,4"/>` +
    `<path class="fm-icon" style="fill:none" d="M7,8 C7,0 17,0 17,8"/><rect class="fm-icon-w" x="7" y="15" width="10" height="9"/></g>`;
  const fish = (x, y, k = 1, flip = false) =>
    `<g transform="translate(${x},${y}) scale(${flip ? -k : k},${k})"><ellipse class="fm-fish" cx="0" cy="0" rx="9" ry="5"/><path class="fm-fish" d="M7,0 L15,-6 L15,6 Z"/><circle cx="-4" cy="-1" r="1.3" fill="#fff"/></g>`;

  /* ---------- Film 1: Akvariet (rett prisme) ---------- */
  const A = { l: 60, h: 40, d: 30 }, sA = 2.95, PA = F.proj(sA, 52, 214);
  function aquarium(o) {
    const P = o.P || PA;
    let s = backEdges(P, 0, 0, 0, A.l, A.h, A.d);
    if (o.g) s += poly([P(0, 0, 0), P(A.l, 0, 0), P(A.l, 0, A.d), P(0, 0, A.d)], 'fm-gtop', `opacity="${o.g}"`) +
      text(...P(A.l / 2, 0, A.d / 2), 'G', 'fm-big', 'middle', `dy="8" opacity="${o.g}"`);
    if (o.level > 0) {
      s += box(P, 0, 0, 0, A.l, o.level, A.d, 'fm-water');
      if (o.layers) for (let j = 5; j < o.level; j += 5) s += line(P(0, j, 0), P(A.l, j, 0), 'fm-grid', 'stroke-opacity=".35"') + line(P(A.l, j, 0), P(A.l, j, A.d), 'fm-grid', 'stroke-opacity=".35"');
    }
    if (o.fish) { const f = o.fish; s += fish(...P(16 + 26 * f, 12, 12), 1.1, f > .5) + fish(...P(44 - 20 * f, 25, 20), .85, f < .5); }
    s += box(P, 0, 0, 0, A.l, A.h, A.d, 'fm-glass', o.glass != null ? { opacity: o.glass } : {});
    if (!o.P) s += line([30, 215], [272, 215], 'fm-ground');
    if (o.dims) {
      const op = `opacity="${o.dims}"`;
      s += text(...P(A.l / 2, 0, 0), '60 cm', 'fm-lbl', 'middle', `dy="22" ${op}`) +
        text(...P(0, A.h / 2, 0), '40 cm', 'fm-lbl', 'end', `dx="-8" dy="5" ${op}`) +
        text(...P(A.l, 0, A.d / 2), '30 cm', 'fm-lbl', 'start', `dx="8" dy="12" ${op}`);
    }
    return s;
  }
  const film1 = {
    title: 'Hvor mye vann trenger akvariet?', real: 'Akvarium', size: [400, 250], end: { text: 'Prøv selv med glidebryterne ↓', href: '#prisme' },
    poster: 'Emma skal fylle et nytt akvarium. Hvor mange liter vann må hun bære?',
    scenes: [
      { dur: 2200, text: 'Emma har fått et akvarium. Hvor mange liter vann må hun bære for å fylle det?',
        draw: p => aquarium({ glass: seg(p, 0, .6) }) + text(330, 120, '? L', 'fm-big', 'middle', `opacity="${seg(p, .5, 1)}"`) },
      { dur: 2400, text: 'Akvariet er et rett prisme. Det er <b>60 cm</b> langt, <b>30 cm</b> bredt og <b>40 cm</b> høyt.',
        draw: p => aquarium({ dims: seg(p, 0, .7) }) },
      { dur: 3000, text: 'Først grunnflaten, bunnen av akvariet: <b>G = l · b = 60 · 30 = 1800 cm²</b>.',
        draw: p => aquarium({ dims: 1, g: seg(p, 0, .4) }) +
          panel([['G = l · b', 'fm-lbl', seg(p, .2, .5)], ['= 60 · 30', 'fm-lbl', seg(p, .4, .7)], ['= 1800 cm²', 'fm-lbl fm-acc', seg(p, .6, .9)]], 282) },
      { dur: 5200, text: 'Hver centimeter med vann er et lag på 1800 cm³. Akvariet er 40 cm høyt, så det blir 40 lag: <b>V = G · h = 1800 · 40 = 72 000 cm³</b>.',
        draw: p => {
          const lv = 40 * seg(p, .05, .85), n = Math.round(lv);
          return aquarium({ dims: 1, level: lv, layers: true, g: 1 - seg(p, 0, .15) }) +
            panel([['h = ' + n + ' cm'], ['V = 1800 · ' + n], ['= ' + nf(1800 * n, 0) + ' cm³', n === 40 ? 'fm-lbl fm-acc' : 'fm-lbl']], 280, 60, 28);
        } },
      { dur: 1200, text: 'Nå vet vi volumet i cm³. Men vann måler vi i liter.',
        draw: () => aquarium({ dims: 1, level: 40 }) + panel([['72 000 cm³'], ['= ? L', 'fm-big']], 282, 90, 34),
        ask: { q: 'Hvor mange liter er 72 000 cm³?', opts: ['7,2 L', '72 L', '720 L'], ok: 1,
          why: '1 L = 1000 cm³, så 72 000 : 1000 = 72 L.',
          wrong: { 0: 'Da har du delt på 10 000. Det går 1000 cm³ på én liter, så del på 1000.', 2: 'Da har du delt på 100. Det går 1000 cm³ på én liter, så del på 1000.' } } },
      { dur: 5000, text: 'En melkekartong rommer 1 liter. Emma må helle i <b>72 kartonger</b>, eller rundt 7 bøtter på 10 liter.',
        draw: p => {
          const n = Math.round(72 * seg(p, .1, .9)); let s = text(200, 34, '72 000 : 1000 = 72 L', 'fm-title');
          for (let i = 0; i < n; i++) s += carton(22 + (i % 12) * 30, 54 + Math.floor(i / 12) * 30, 20, 26);
          return s + text(200, 242, n + ' kartonger', 'fm-lbl');
        } },
      { dur: 3000, text: '1 liter vann veier 1 kg. Et fullt akvarium veier altså over <b>72 kg</b>, like mye som en voksen. Det må stå på et solid bord!',
        draw: p => aquarium({ level: 40, fish: seg(p, 0, 1), P: F.proj(2.9, 30, 200) }) +
          text(320, 110, '72 L', 'fm-big', 'middle') + text(320, 140, '≈ 72 kg', 'fm-title', 'middle', `opacity="${seg(p, .3, .7)}"`) +
          `<rect class="fm-card" x="20" y="200" width="${lerp(0, 240, seg(p, 0, .4))}" height="10" rx="3"/>` },
      { dur: 2000, text: 'Husk: <b>V = G · h</b>. Og del på 1000 for å gjøre cm³ om til liter.',
        draw: p => `<rect class="fm-card" x="70" y="50" width="260" height="150" rx="14" opacity="${seg(p, 0, .4)}"/>` +
          text(200, 110, 'V = G · h', 'fm-big', 'middle', `style="font-size:34px" opacity="${seg(p, .1, .5)}"`) +
          text(200, 160, 'cm³ : 1000 = L', 'fm-title', 'middle', `opacity="${seg(p, .4, .8)}"`) }
    ]
  };

  /* ---------- Film 2: Regntønna (sylinder) ---------- */
  const CX = 205, BY = 218, RX = 42, HP = 112, TOP = BY - HP;
  function rain(t, k = 1) {
    let s = '';
    for (let i = 0; i < 26; i++) {
      const x = (i * 53 + 17) % 400, y = ((i * 97 + t * .28) % 250) - 15;
      if (y < 205) s += `<line class="fm-rain" x1="${x}" y1="${y.toFixed(1)}" x2="${x - 3}" y2="${(y + 11).toFixed(1)}" opacity="${k}"/>`;
    }
    return s;
  }
  function yard(o) {
    let s = '';
    if (o.rain) s += rain(o.t, o.rain);
    s += `<rect class="fm-house" x="20" y="96" width="100" height="122"/><path class="fm-roof" d="M8,100 L70,44 L132,100 Z"/>` +
      `<rect class="fm-card" x="56" y="168" width="26" height="50"/>`;
    s += `<path class="fm-pipe" d="M128,100 H${CX - RX + 12} V${TOP - 2}"/>`;
    const lv = o.level || 0;
    s += cylinder(CX, BY, RX, HP, 'fm-barrel', { top: false });
    if (lv > 0) s += cylinder(CX, BY, RX - 1, HP * lv, 'fm-cw');
    s += `<ellipse class="fm-barrel top" cx="${CX}" cy="${TOP}" rx="${RX}" ry="${RX * .3}"/>`;
    if (o.drops) for (let i = 0; i < 3; i++) {
      const y = TOP + ((o.t * .12 + i * 12) % 30);
      s += `<circle class="fm-icon-w" cx="${CX - RX + 12}" cy="${y.toFixed(1)}" r="2.5"/>`;
    }
    s += line([4, BY + 1], [396, BY + 1], 'fm-ground');
    s += `<path class="fm-plant" d="M300,218 C300,200 292,192 284,190 M300,206 C303,196 312,192 318,192 M340,218 C340,204 334,198 328,196 M340,208 C344,200 352,198 356,199"/>`;
    if (o.d) s += line([CX - RX, TOP], [CX + RX, TOP], 'fm-rad', `opacity="${o.d}"`) + text(CX + 12, TOP - RX * .3 - 8, 'd = 60 cm', 'fm-lbl', 'middle', `opacity="${o.d}"`);
    if (o.h) s += line([CX + RX + 10, TOP], [CX + RX + 10, BY], 'fm-dim', `opacity="${o.h}"`) + text(CX + RX + 16, (TOP + BY) / 2 + 5, 'h = 80 cm', 'fm-lbl', 'start', `opacity="${o.h}"`);
    if (o.g) s += `<ellipse class="fm-gtop" cx="${CX}" cy="${TOP}" rx="${RX}" ry="${RX * .3}" opacity="${o.g}"/>`;
    if (o.r) s += line([CX, TOP], [CX + RX * o.r, TOP], 'fm-rad') + `<circle class="fm-ink" cx="${CX}" cy="${TOP}" r="3"/>` +
      text(CX + RX / 2 + 4, TOP - 16, 'r = 30', 'fm-lbl', 'middle', `opacity="${o.r}"`);
    return s;
  }
  const film2 = {
    title: 'Hvor mye regnvann rommer tønna?', real: 'Hage', size: [400, 250], end: { text: 'Prøv selv med glidebryterne ↓', href: '#sylinder' },
    poster: 'Jonas samler regnvann i en tønne. Hvor mange kanner vann kan han vanne med?',
    scenes: [
      { dur: 3200, text: 'Jonas samler regnvann fra taket i en tønne, og bruker det til grønnsakene i hagen. Hvor mange liter rommer tønna?',
        draw: (p, t) => yard({ rain: 1, drops: true, t, level: .12 * seg(p, 0, 1) }) },
      { dur: 2600, text: 'Tønna er en sylinder. Den er <b>60 cm</b> i diameter og <b>80 cm</b> høy.',
        draw: p => yard({ level: .12, d: seg(p, 0, .5), h: seg(p, .4, .9) }) },
      { dur: 1200, text: 'For å finne grunnflaten trenger vi radien.',
        draw: () => yard({ level: .12, d: 1, h: 1 }),
        ask: { q: 'Hva er radien r i tønna?', opts: ['60 cm', '30 cm', '120 cm'], ok: 1,
          why: 'Radien går fra midten og ut til kanten. Den er halvparten av diameteren: 60 : 2 = 30 cm.',
          wrong: { 0: '60 cm er diameteren, som går tvers over hele sirkelen. Radien går bare fra midten og ut.', 2: 'Radien er halvparten av diameteren, ikke det dobbelte.' } } },
      { dur: 3600, text: 'Grunnflaten er en sirkel: <b>G = π · r² ≈ 3,14 · 30 · 30 ≈ 2826 cm²</b>.',
        say: 'Grunnflaten er en sirkel. G er lik pi ganger r i andre. Det er omtrent 3,14 ganger 30 ganger 30, som blir omtrent 2826 kvadratcentimeter.',
        draw: p => yard({ level: .12, h: 1, g: seg(p, 0, .3), r: seg(p, .1, .4) }) +
          panel([['G = π · r²', 'fm-lbl', seg(p, .2, .45)], ['≈ 3,14 · 30²', 'fm-lbl', seg(p, .4, .65)], ['≈ 2826 cm²', 'fm-lbl', seg(p, .6, .85)]], 282, 40, 24) },
      { dur: 5200, text: 'Hver centimeter med vann er et lag på 2826 cm³. Med 80 lag blir <b>V = G · h ≈ 2826 · 80 = 226 080 cm³</b>.',
        draw: (p, t) => {
          const lv = .12 + .88 * seg(p, .05, .85), n = Math.round(80 * lv);
          return yard({ level: lv, drops: true, t, h: 1 }) +
            panel([['h = ' + n + ' cm'], ['V ≈ 2826 · ' + n], ['≈ ' + nf(2826 * n, 0) + ' cm³', n === 80 ? 'fm-lbl fm-acc' : 'fm-lbl']], 270, 40, 24);
        } },
      { dur: 4600, text: 'Del på 1000: 226 080 cm³ er omtrent <b>226 liter</b>. Vannkanna tar 10 liter, så en full tønne gir <b>22 kanner</b> til grønnsakene.',
        draw: p => {
          const n = Math.round(22 * seg(p, .15, .9)); let s = text(200, 36, '226 080 : 1000 ≈ 226 L', 'fm-title');
          for (let i = 0; i < n; i++) s += can(34 + (i % 11) * 31, 70 + Math.floor(i / 11) * 48, 1);
          return s + text(200, 200, n + ' kanner à 10 L', 'fm-lbl');
        } },
      { dur: 3400, text: 'Pass på! Bruker du diameteren 60 i stedet for radien 30, blir svaret <b>4 ganger</b> for stort: omtrent 904 liter.',
        say: 'Pass på! Bruker du diameteren 60 i stedet for radien 30, blir svaret fire ganger for stort. Da får du omtrent 904 liter.',
        draw: p => {
          const k = seg(p, .25, .7);
          return `<circle class="fm-gtop" cx="110" cy="128" r="${30 * 1.4}"/>` + line([110, 128], [152, 128], 'fm-rad') + text(110, 196, 'r = 30 ✓', 'fm-lbl') +
            text(110, 216, '≈ 226 L', 'fm-small') +
            `<circle cx="285" cy="128" r="${lerp(42, 84, k)}" fill="none" class="fm-bad" stroke-dasharray="6 5" opacity="${seg(p, .1, .3)}"/>` +
            line([285, 128], [285 + lerp(42, 84, k), 128], 'fm-bad', `opacity="${seg(p, .1, .3)}"`) +
            text(285, 236, 'r = 60 ✗  ≈ 904 L', 'fm-badtxt', 'middle', `opacity="${seg(p, .5, .8)}"`);
        } }
    ]
  };

  /* ---------- Film 3: Hvorfor er 1 liter = 1000 cm³? ---------- */
  const PC = F.proj(13.5, 52, 222);
  function cube(n, o = {}) {
    const P = PC; let s = backEdges(P, 0, 0, 0, 10, 10, 10);
    const L = Math.floor(n / 100), rem = n % 100, R = Math.floor(rem / 10), k = rem % 10;
    if (L > 0) s += box(P, 0, 0, 0, 10, L, 10, 'fm-cube', { grid: true });
    if (rem > 0) {
      if (k > 0) s += box(P, 0, L, R, k, 1, 1, 'fm-cube', { grid: true });
      if (R > 0) s += box(P, 0, L, 0, 10, 1, R, 'fm-cube', { grid: true });
    }
    s += box(P, 0, 0, 0, 10, 10, 10, 'fm-shell', o.shell != null ? { opacity: o.shell } : {});
    if (o.dims) {
      const op = `opacity="${o.dims}"`;
      s += text(...P(5, 0, 0), '10 cm', 'fm-lbl', 'middle', `dy="22" ${op}`) + text(...P(0, 5, 0), '10 cm', 'fm-lbl', 'end', `dx="-8" dy="5" ${op}`) +
        text(...P(10, 0, 5), '10 cm', 'fm-lbl', 'start', `dx="8" dy="12" ${op}`);
    }
    return s;
  }
  const film3 = {
    title: 'Hvorfor er 1 liter = 1000 cm³?', real: 'Melkekartong', size: [400, 250], end: { text: 'Prøv selv i enhetstrappa ↓', href: '#liter' },
    poster: 'Hvorfor deler vi på akkurat 1000 for å få liter? Se hvordan en liter er bygget opp.',
    scenes: [
      { dur: 3000, text: 'En melkekartong rommer 1 liter. Det er like mye som en terning som er 10 cm lang, 10 cm bred og 10 cm høy.',
        draw: p => `<g opacity="${1 - seg(p, .35, .75)}">${carton(110, 40, 90, 170)}${text(155, 150, '1 L', 'fm-big')}</g>` +
          `<g opacity="${seg(p, .4, .85)}">${cube(0, { dims: 1 })}${text(330, 120, '1 L', 'fm-big')}${text(330, 146, '= 1 dm³', 'fm-lbl')}</g>` },
      { dur: 3000, text: 'Vi fyller den med små terninger på 1 cm³. En rad langs kanten har <b>10</b> terninger.',
        draw: p => { const n = Math.round(10 * seg(p, 0, .85)); return cube(n, { dims: 1 }) + panel([[n + ' terninger'], ['= ' + n + ' cm³', 'fm-lbl', n === 10 ? 1 : .4]], 286, 100, 26); } },
      { dur: 3600, text: '10 rader ved siden av hverandre gir ett lag med <b>10 · 10 = 100</b> terninger.',
        draw: p => { const r = Math.max(1, Math.round(10 * seg(p, 0, .85))); return cube(10 * r) + panel([[r + ' rader'], ['= ' + r + ' · 10'], ['= ' + 10 * r + ' cm³']], 286, 90, 26); } },
      { dur: 4600, text: '10 lag oppå hverandre gir <b>10 · 10 · 10 = 1000</b> terninger. Derfor er <b>1 L = 1 dm³ = 1000 cm³</b>.',
        draw: p => { const l = Math.max(1, Math.round(10 * seg(p, 0, .8))); return cube(100 * l) + panel([[l + ' lag'], ['= ' + l + ' · 100'], ['= ' + nf(100 * l, 0) + ' cm³', l === 10 ? 'fm-lbl fm-acc' : 'fm-lbl']], 286, 90, 28); } },
      { dur: 1200, text: 'Nå kan du gjøre om selv.',
        draw: () => cube(1000) + panel([['1 L = 1000 cm³'], ['Brusboks:'], ['330 cm³', 'fm-big']], 272, 80, 30),
        ask: { q: 'En brusboks rommer 330 cm³. Hvor mange liter er det?', opts: ['3,3 L', '0,33 L', '33 L'], ok: 1,
          why: '330 : 1000 = 0,33 L. En brusboks er altså litt mindre enn en halv liter.',
          wrong: { 0: 'Da har du delt på 100. Det går 1000 cm³ på én liter, så del på 1000.', 2: 'Da har du delt på 10. Det går 1000 cm³ på én liter, så del på 1000.' } } },
      { dur: 3600, text: 'Fra liter til cm³ ganger du med 1000. Fra cm³ til liter deler du på 1000. Og <b>1 m³ = 1000 L</b>, omtrent fem fulle badekar.',
        say: 'Fra liter til kubikkcentimeter ganger du med 1000. Fra kubikkcentimeter til liter deler du på 1000. Og én kubikkmeter er 1000 liter, omtrent fem fulle badekar.',
        draw: p => {
          const step = (x, lab, sub, o) => `<g opacity="${o}"><rect class="fm-card" x="${x - 48}" y="96" width="96" height="58" rx="12"/>${text(x, 126, lab, 'fm-lbl')}${text(x, 144, sub, 'fm-small')}</g>`;
          const a1 = seg(p, .2, .45), a2 = seg(p, .5, .75);
          return step(60, 'm³', 'kubikkmeter', seg(p, 0, .2)) + step(200, 'L = dm³', 'liter', seg(p, 0, .2)) + step(340, 'cm³', '= mL', seg(p, 0, .2)) +
            text(130, 84, '· 1000 →', 'fm-lbl', 'middle', `opacity="${a1}"`) + text(270, 84, '· 1000 →', 'fm-lbl', 'middle', `opacity="${a1}"`) +
            text(130, 184, '← : 1000', 'fm-lbl', 'middle', `opacity="${a2}"`) + text(270, 184, '← : 1000', 'fm-lbl', 'middle', `opacity="${a2}"`) +
            text(200, 226, 'Mindre enhet: gang. Større enhet: del.', 'fm-small', 'middle', `opacity="${seg(p, .7, 1)}"`);
        } }
    ]
  };

  const slots = [['#film-prisme', film1], ['#film-sylinder', film2], ['#film-liter', film3]];
  slots.forEach(([sel, film]) => { const el = $(sel); if (el) F.mount(el, Object.assign({ audio: 'filmer/lyd/' }, film)); });
})();
