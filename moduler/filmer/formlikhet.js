/* Filmsnutt til Formlikhet: mål treet med skyggen. Krever ../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person, sun } = F;
  const GY = 222, S = 15; // 15 px per meter
  const ground = () => line([0, GY], [400, GY], 'fm-ground');
  const PX = 70, TX = 228;               // Lina og treet
  const PH = 1.8 * S, PS = 1.2 * S;      // høyde og skygge, Lina
  const TH = 12 * S, TS = 8 * S;         // høyde og skygge, treet
  function tree(op = 1) {
    return `<g opacity="${op}"><rect class="fm-trunk" x="${TX - 6}" y="${GY - TH * .55}" width="12" height="${TH * .55}"/>` +
      `<circle class="fm-leaf" cx="${TX}" cy="${GY - TH + 34}" r="34"/><circle class="fm-leaf" cx="${TX - 24}" cy="${GY - TH * .62}" r="27"/>` +
      `<circle class="fm-leaf" cx="${TX + 24}" cy="${GY - TH * .62}" r="27"/></g>`;
  }
  const lina = (x = PX, o = {}) => person(x, GY, PH, Object.assign({ shirt: 4, skin: 3, hair: 2 }, o));
  function shadows(k) {
    return `<polygon class="fm-shadow" points="${PX},${GY} ${PX + PS * k},${GY} ${PX + PS * k},${GY + 3} ${PX},${GY + 3}"/>` +
      `<polygon class="fm-shadow" points="${TX - 8},${GY} ${TX + TS * k},${GY} ${TX + TS * k},${GY + 5} ${TX - 8},${GY + 5}"/>`;
  }
  const film = {
    title: 'Hvor høyt er treet?', real: 'Hage og sol', size: [400, 250],
    end: { text: 'Prøv selv med pinnen og skyggen ↓', href: '#skygge' },
    poster: 'Lina vil vite hvor høyt treet i hagen er, uten å klatre opp.',
    scenes: [
      { dur: 3200, text: 'Lina vil vite hvor høyt treet i hagen er. Hun kan ikke klatre opp, men sola kan hjelpe henne.',
        draw: p => ground() + tree() + sun(lerp(40, 40, p), lerp(120, 34, seg(p, 0, .7))) +
          lina(lerp(-10, PX, seg(p, .2, .9)), { walk: p < .9 ? p * 16 : null }) },
      { dur: 3800, text: 'Lina er <b>1,8 m</b> høy, og skyggen hennes er <b>1,2 m</b>. Skyggen til treet er <b>8 m</b>.',
        draw: p => {
          const k = seg(p, 0, .6), o = `opacity="${seg(p, .5, .9)}"`;
          return ground() + shadows(k) + tree() + sun(40, 34) + lina() +
            text(PX - 8, GY - PH / 2, '1,8 m', 'fm-lbl', 'end', o) + text(PX + PS / 2 + 4, GY + 18, '1,2 m', 'fm-lbl', 'middle', o) +
            text(TX + TS / 2, GY + 20, '8 m', 'fm-lbl', 'middle', o);
        } },
      { dur: 4200, text: 'Solstrålene kommer inn med samme vinkel overalt. Derfor er de to trekantene <b>formlike</b>: samme form, ulik størrelse.',
        draw: p => {
          const a = seg(p, 0, .4), m = seg(p, .45, .95);
          const small = [[PX, GY], [PX, GY - PH], [PX + PS, GY]], big = [[TX, GY], [TX, GY - TH], [TX + TS, GY]];
          const mid = small.map((q, i) => [lerp(q[0], big[i][0], m), lerp(q[1], big[i][1], m)]);
          return ground() + shadows(1) + tree(.35) + sun(40, 34) + lina() +
            line([PX - 2 * PS, GY - 3 * PH], [PX + PS, GY], 'fm-ray', `opacity="${a}"`) + line([TX - .6 * TS, GY - 1.6 * TH], [TX + TS, GY], 'fm-ray', `opacity="${a}"`) +
            `<polygon class="fm-tri" points="${small.map(q => q.join(',')).join(' ')}" opacity="${a}"/>` +
            `<polygon class="fm-tri2" points="${big.map(q => q.join(',')).join(' ')}" opacity="${a}"/>` +
            (m > 0 && m < 1 ? `<polygon class="fm-tri" points="${mid.map(q => q.join(',')).join(' ')}" style="fill-opacity:.08;stroke-dasharray:5 4"/>` : '');
        } },
      { dur: 3800, text: 'For Lina er høyden <b>1,5 ganger</b> skyggen: 1,8 : 1,2 = 1,5. I en formlik trekant gjelder det samme forholdet.',
        draw: p => ground() + shadows(1) + tree(.35) + lina() +
          `<polygon class="fm-tri2" points="${TX},${GY} ${TX},${GY - TH} ${TX + TS},${GY}" />` +
          `<rect class="fm-card" x="16" y="20" width="160" height="92" rx="12" opacity="${seg(p, 0, .3)}"/>` +
          text(28, 46, 'høyde : skygge', 'fm-small', 'start', `opacity="${seg(p, 0, .3)}"`) +
          text(28, 72, '1,8 : 1,2 = 1,5', 'fm-lbl', 'start', `opacity="${seg(p, .2, .5)}"`) +
          text(28, 98, 'treet: 8 · 1,5 = ?', 'fm-lbl fm-acc', 'start', `opacity="${seg(p, .5, .8)}"`) +
          text(TX + TS / 2, GY + 20, '8 m', 'fm-lbl', 'middle') + text(TX - 8, GY - TH / 2, '?', 'fm-big', 'end') },
      { dur: 1200, text: 'Hvor høyt er treet?',
        draw: () => ground() + shadows(1) + tree(.35) + lina() + `<polygon class="fm-tri2" points="${TX},${GY} ${TX},${GY - TH} ${TX + TS},${GY}"/>` +
          text(TX + TS / 2, GY + 20, '8 m', 'fm-lbl', 'middle') + text(TX - 8, GY - TH / 2, '?', 'fm-big', 'end'),
        ask: { q: 'Treskyggen er 8 m, og høyden er 1,5 ganger skyggen. Hvor høyt er treet?', opts: ['5,3 m', '9,6 m', '12 m'], ok: 2,
          why: '8 · 1,5 = 12 m.',
          wrong: { 0: 'Da har du delt på 1,5. Treet er høyere enn skyggen sin, akkurat som Lina, så du må gange.', 1: 'Da har du ganget med 1,2, som er skyggen til Lina. Bruk forholdet høyde : skygge = 1,5.' } } },
      { dur: 3600, text: 'Treet er <b>12 m</b> høyt, omtrent som et hus med fire etasjer. Og Lina målte det uten å klatre!',
        draw: p => ground() + shadows(1) + tree() + sun(40, 34) + lina(PX, { armL: 160, armR: -150 }) +
          line([TX + 50, GY], [TX + 50, GY - TH * seg(p, 0, .6)], 'fm-dim', 'stroke-width="2.5"') +
          text(TX + 58, GY - TH / 2, '12 m', 'fm-big', 'start', `opacity="${seg(p, .4, .7)}" style="font-size:20px"`) +
          F.bubble(PX + 4, GY - PH - 22, 'Ja!', { opacity: seg(p, .5, .8) }) }
    ]
  };
  const el = document.querySelector('#film-formlikhet');
  if (el) F.mount(el, film);
})();
