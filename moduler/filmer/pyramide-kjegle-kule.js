/* Filmsnutt til Pyramide, kjegle og kule: iskremkjeksen. Krever ../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person, cylinder } = F;
  const GY = 218;
  const ground = () => line([0, GY], [400, GY], 'fm-ground');
  /* Kjegle med spissen opp. fill = andel av høyden fylt nedenfra */
  function cone(cx, by, rx, hp, fill = 0, cls = 'fm-barrel') {
    const ry = rx * .3;
    let s = '';
    if (fill > 0) {
      const ly = by - hp * fill, w = rx * (1 - fill);
      s += `<path class="fm-cw body" d="M${cx - rx},${by} A${rx},${ry} 0 0 0 ${cx + rx},${by} L${cx + w},${ly} L${cx - w},${ly} Z"/>`;
      if (w > 1) s += `<ellipse class="fm-cw top" cx="${cx}" cy="${ly}" rx="${w}" ry="${w * .3}"/>`;
    }
    s += `<path class="${cls} body" style="fill-opacity:.08" d="M${cx - rx},${by} A${rx},${ry} 0 0 0 ${cx + rx},${by} L${cx},${by - hp} Z"/>`;
    s += `<path class="fm-hid" d="M${cx - rx},${by} A${rx},${ry} 0 0 1 ${cx + rx},${by}"/>`;
    return s;
  }
  function cyl(cx, by, rx, hp, fill) {
    let s = cylinder(cx, by, rx, hp, 'fm-barrel', { top: false });
    if (fill > 0) s += cylinder(cx, by, rx - 1, hp * fill, 'fm-cw');
    for (let i = 1; i < 3; i++) s += line([cx + rx - 8, by - hp * i / 3], [cx + rx + 4, by - hp * i / 3], 'fm-dim');
    return s + `<ellipse class="fm-barrel top" cx="${cx}" cy="${by - hp}" rx="${rx}" ry="${rx * .3}"/>`;
  }
  const iceCream = `<g transform="translate(4,-8)"><path d="M-8,0 L8,0 L0,22 Z" fill="#d9a35a" stroke="#a8742f" stroke-width="1.2"/><circle cx="0" cy="-5" r="9" fill="#f6b6c8"/></g>`;
  const CX1 = 150, CX2 = 280, BY = 210, RX = 48, HP = 150;

  const film = {
    title: 'Hvor mye is får plass i kjeksen?', real: 'Iskrem', size: [400, 250],
    end: { text: 'Prøv selv: hell pyramiden over i prismet ↓', href: '#tredjedel' },
    poster: 'Ali kjøper is i kjeks. Hvor mye is rommer kjeksen egentlig?',
    scenes: [
      { dur: 3000, text: 'Ali kjøper is i kjeks. Kjeksen er formet som en <b>kjegle</b>. Hvor mye is får plass inni den?',
        draw: p => ground() + person(lerp(-20, 170, seg(p, 0, .7)), GY, 120, { walk: p < .7 ? p * 16 : null, shirt: 3, skin: 2, hair: 2, armL: 75, hold: iceCream }) +
          F.bubble(lerp(-20, 170, seg(p, 0, .7)) + 20, 82, 'Mmm!', { opacity: seg(p, .75, .95) }) },
      { dur: 3200, text: 'Vi ser på en kjegle og en sylinder med samme radius, <b>r = 3 cm</b>, og samme høyde, <b>h = 10 cm</b>.',
        draw: p => `<g opacity="${seg(p, 0, .4)}">${cone(CX1, BY, RX, HP)}</g><g opacity="${seg(p, .2, .6)}">${cyl(CX2, BY, RX, HP, 0)}</g>` +
          text(CX1, BY + 26, 'kjegle', 'fm-small') + text(CX2, BY + 26, 'sylinder', 'fm-small') +
          `<g opacity="${seg(p, .5, .9)}">${line([CX2, BY - HP], [CX2 + RX, BY - HP], 'fm-rad')}${text(CX2 + RX / 2, BY - HP - RX * .3 - 6, 'r = 3', 'fm-lbl')}${line([CX2 + RX + 14, BY - HP], [CX2 + RX + 14, BY], 'fm-dim')}${text(CX2 + RX + 20, BY - HP / 2, 'h = 10', 'fm-lbl', 'start')}</g>` },
      { dur: 1200, text: 'Vi fyller kjeglen med vann og heller den over i sylinderen.',
        draw: () => cone(CX1, BY, RX, HP, 1) + cyl(CX2, BY, RX, HP, 0) + text(CX1, BY + 26, 'kjegle', 'fm-small') + text(CX2, BY + 26, 'sylinder', 'fm-small'),
        ask: { q: 'Hvor mange fulle kjegler trengs for å fylle sylinderen?', opts: ['2', '3', '4'], ok: 1,
          why: 'Det trengs akkurat 3. Kjeglen rommer en tredjedel av sylinderen. Se selv!',
          wrong: { 0: 'Ikke helt. Kjeglen blir smal mot toppen, så den rommer mindre enn halvparten. Prøv igjen.', 2: 'Nesten! Kjeglen rommer litt mer enn en firedel. Prøv igjen.' } } },
      { dur: 6600, text: 'Én, to, tre! Etter <b>tre</b> kjegler er sylinderen full.',
        draw: p => {
          const k = Math.min(2, Math.floor(p * 3)), q = clampSeg(p * 3 - k);
          const coneFill = q < .15 ? 1 : 1 - seg(q, .15, .85), cylFill = (k + seg(q, .15, .85)) / 3;
          const pour = q > .15 && q < .85;
          return cone(CX1, BY, RX, HP, p >= .999 ? 0 : coneFill) + cyl(CX2, BY, RX, HP, cylFill) +
            (pour ? `<path class="fm-rain" fill="none" style="stroke-width:5" d="M${CX1 + 8},${BY - HP + 10} Q${(CX1 + CX2) / 2},${BY - HP - 40} ${CX2 - 10},${BY - HP + 4}"/>` : '') +
            text(CX2, 40, String(Math.min(3, k + (q > .85 ? 1 : 0))) + ' av 3', 'fm-big');
        } },
      { dur: 4200, text: 'Derfor er volumet av en kjegle <b>V = G · h : 3</b>. Kjeksen rommer π · 3² · 10 : 3 ≈ <b>94 cm³</b>, nesten en desiliter is.',
        say: 'Derfor er volumet av en kjegle G ganger h delt på 3. Kjeksen rommer pi ganger 3 i andre ganger 10, delt på 3. Det er omtrent 94 kubikkcentimeter, nesten en desiliter is.',
        draw: p => cone(90, BY, RX, HP, 1) +
          text(170, 70, 'V = G · h : 3', 'fm-lbl', 'start', `opacity="${seg(p, 0, .3)}"`) +
          text(170, 100, '= π · 3² · 10 : 3', 'fm-lbl', 'start', `opacity="${seg(p, .25, .55)}"`) +
          text(170, 130, '≈ 94 cm³', 'fm-lbl fm-acc', 'start', `opacity="${seg(p, .5, .8)}"`) +
          text(170, 160, '≈ 1 dL is', 'fm-title', 'start', `opacity="${seg(p, .7, 1)}"`) },
      { dur: 2400, text: 'Det samme gjelder pyramider: en pyramide rommer en tredjedel av prismet med samme grunnflate og høyde.',
        draw: p => ground() + person(110, GY, 120, { shirt: 3, skin: 2, hair: 2, armL: 75, hold: iceCream }) +
          F.bubble(130, 82, '1/3 av sylinderen!', { opacity: seg(p, .2, .5) }) +
          `<rect class="fm-card" x="220" y="70" width="160" height="90" rx="12" opacity="${seg(p, .3, .6)}"/>` +
          text(300, 108, 'V = G · h : 3', 'fm-big', 'middle', `opacity="${seg(p, .3, .6)}" style="font-size:20px"`) +
          text(300, 138, 'kjegle og pyramide', 'fm-small', 'middle', `opacity="${seg(p, .4, .7)}"`) }
    ]
  };
  function clampSeg(v) { return Math.max(0, Math.min(1, v)); }
  const el = document.querySelector('#film-pyramide');
  if (el) F.mount(el, film);
})();
