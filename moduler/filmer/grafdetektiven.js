/* Filmsnutt til Grafdetektiven: kioskens juksegraf. Krever ../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person } = F;
  const GY = 228;
  const iceCream = `<g transform="translate(2,-6)"><path d="M-6,0 L6,0 L0,16 Z" fill="#d9a35a"/><circle cx="0" cy="-4" r="7" fill="#f6b6c8"/></g>`;
  function kiosk(op = 1) {
    let s = `<g opacity="${op}"><rect class="fm-house" x="20" y="96" width="130" height="${GY - 96}"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${20 + i * 26},96 h26 v16 a13,13 0 0 1 -26,0 Z" fill="${i % 2 ? '#fff' : '#e46a6a'}" stroke="#c04a4a" stroke-width="1"/>`;
    s += text(85, 88, 'KIOSK', 'fm-title', 'middle', 'style="font-size:16px"');
    return s + `<rect class="fm-card" x="30" y="150" width="110" height="${GY - 150}"/></g>`;
  }
  /* Søylediagram. min = hvor aksen starter. */
  function chart(min, o = {}) {
    const x0 = 210, y0 = 200, H = 150, max = 110, sc = H / (max - min);
    const bar = (x, v, lab, cls) => { const h = Math.max(0, (v - min) * sc); return `<rect class="${cls}" x="${x}" y="${(y0 - h).toFixed(1)}" width="56" height="${h.toFixed(1)}" rx="3"/>` + text(x + 28, y0 - h - 6, String(v), 'fm-lbl') + text(x + 28, y0 + 18, lab, 'fm-small'); };
    let s = `<g opacity="${o.op != null ? o.op : 1}">` + line([x0, y0], [x0 + 170, y0], 'fm-axis') + line([x0, y0], [x0, y0 - H - 6], 'fm-axis');
    s += text(x0 - 6, y0 + 4, String(Math.round(min)), 'fm-small', 'end', o.mark ? 'style="fill:var(--bad);font-weight:700;font-size:15px"' : '');
    s += text(x0 - 6, y0 - H + 4, '110', 'fm-small', 'end');
    s += bar(x0 + 18, 102, 'i fjor', 'fm-bar') + bar(x0 + 96, 108, 'i år', 'fm-bar2');
    if (o.mark) s += `<circle cx="${x0 - 14}" cy="${y0}" r="16" fill="none" stroke="var(--bad)" stroke-width="2.5"/>`;
    return s + '</g>';
  }
  const seller = (o = {}) => person(85, 196, 70, Object.assign({ shirt: 2, skin: 1, hair: 0 }, o));
  const film = {
    title: 'Ble salget firedoblet?', real: 'Kiosk', size: [400, 250],
    end: { text: 'Prøv selv: flytt starten på aksen ↓', href: '#akse' },
    poster: 'Kiosken solgte litt mer is i år. Hvordan kan en graf få det til å se enormt ut?',
    scenes: [
      { dur: 3600, text: 'Kiosken solgte <b>102 is</b> i juni i fjor og <b>108 is</b> i juni i år. Eieren lager en plakat som skal vise økningen.',
        draw: p => kiosk() + seller({ armL: lerp(10, 110, seg(p, .3, .6)), hold: p > .5 ? iceCream : '' }) + chart(0, { op: seg(p, .5, .9) }) },
      { dur: 3600, text: 'Når aksen starter på 0, ser søylene nesten like høye ut. Økningen er bare <b>6 is</b>.',
        draw: p => kiosk(.5) + seller() + chart(0) + text(305, 30, '+6', 'fm-goodtxt', 'middle', `opacity="${seg(p, .4, .7)}"`) },
      { dur: 4600, text: 'Men eieren lar aksen starte på <b>100</b>. Nå ser det ut som om salget er <b>firedoblet</b>!',
        draw: p => kiosk(.5) + seller({ armL: 120 }) + chart(lerp(0, 100, seg(p, .1, .7))) +
          F.bubble(100, 112, 'Rekordvekst!', { opacity: seg(p, .65, .9) }) },
      { dur: 1200, text: 'Se på tallene, ikke på høyden til søylene.',
        draw: () => kiosk(.5) + seller({ armL: 120 }) + chart(100, { mark: true }),
        ask: { q: 'Hvor mange prosent økte salget egentlig?', opts: ['ca. 6 %', 'ca. 50 %', 'ca. 300 %'], ok: 0,
          why: '6 av 102 er omtrent 6 %. En liten økning, ikke en firedobling.',
          wrong: { 1: 'Det er bare 6 flere is av 102. 6 : 102 ≈ 0,06, altså omtrent 6 %.', 2: 'Det er det grafen får det til å se ut som, men aksen lurer deg. 6 : 102 ≈ 6 %.' } } },
      { dur: 3800, text: 'Detektivtips: se alltid etter <b>hvor aksen starter</b>. Starter den ikke på 0, kan små forskjeller se enorme ut.',
        draw: p => chart(100, { mark: true }) + person(120, GY, 110, { shirt: 1, skin: 3, hair: 1, armL: 70,
          hold: `<g transform="translate(6,-6)"><circle r="13" fill="none" stroke="var(--ink)" stroke-width="3"/><line x1="9" y1="9" x2="20" y2="20" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>` }) +
          F.bubble(120, 100, 'Aha! Aksen!', { opacity: seg(p, .3, .6) }) }
    ]
  };
  const el = document.querySelector('#film-graf');
  if (el) F.mount(el, film);
})();
