/* Filmsnutt til Sammensatte enheter: sykkelturen til skolen. Krever ../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person } = F;
  const RY = 170, X0 = 50, X1 = 350; // veien går fra hjemme (X0) til skolen (X1)
  function cyclist(x, t, o = {}) {
    const wr = 11, y = RY - 2, a = t * .02;
    const spoke = (cx) => { let s = ''; for (let i = 0; i < 3; i++) { const g = a + i * 2.09; s += line([cx, y - wr], [cx + Math.cos(g) * wr, y - wr + Math.sin(g) * wr], 'fm-dim', 'stroke-width="1"'); } return s; };
    return `<g>${spoke(x - 16)}${spoke(x + 16)}<circle class="fm-axis" cx="${x - 16}" cy="${y - wr}" r="${wr}"/><circle class="fm-axis" cx="${x + 16}" cy="${y - wr}" r="${wr}"/>` +
      `<path class="fm-axis" style="stroke-width:2.2" d="M${x - 16},${y - wr} L${x - 2},${y - 30} L${x + 12},${y - 30} L${x + 16},${y - wr} M${x - 2},${y - 30} L${x},${y - wr} L${x - 16},${y - wr} M${x + 12},${y - 30} L${x + 10},${y - 38}"/></g>` +
      person(x - 4, y - 3, 46, Object.assign({ shirt: 3, skin: 1, hair: 0, sit: true, armL: 70, armR: 70 }, o));
  }
  function road(op = 1) {
    return `<g opacity="${op}"><rect class="fm-card" x="${X0 - 6}" y="${RY}" width="${X1 - X0 + 12}" height="12" rx="6"/>` +
      `<rect class="fm-house" x="${X0 - 36}" y="${RY - 46}" width="40" height="40"/><path class="fm-roof" d="M${X0 - 42},${RY - 44} L${X0 - 16},${RY - 66} L${X0 + 10},${RY - 44} Z"/>` +
      text(X0 - 16, RY + 34, 'hjemme', 'fm-small') +
      `<rect class="fm-house" x="${X1 - 4}" y="${RY - 70}" width="52" height="64"/><path class="fm-roof" d="M${X1 - 10},${RY - 68} L${X1 + 22},${RY - 88} L${X1 + 54},${RY - 68} Z"/>` +
      text(X1 + 22, RY + 34, 'skolen', 'fm-small') + '</g>';
  }
  function clock(min, x = 200, y = 54) {
    const a = min / 60 * 2 * Math.PI;
    return `<circle class="fm-card" cx="${x}" cy="${y}" r="26"/>` + line([x, y], [x + Math.sin(a) * 20, y - Math.cos(a) * 20], 'fm-rad') +
      `<circle class="fm-ink" cx="${x}" cy="${y}" r="2.5"/>` + text(x + 36, y + 6, Math.round(min) + ' min', 'fm-lbl', 'start');
  }
  const film = {
    title: 'Hvor fort sykler Jonas?', real: 'Skolevei', size: [400, 250],
    end: { text: 'Prøv selv: velg fart og tid ↓', href: '#fart' },
    poster: 'Jonas sykler 6 km til skolen på 20 minutter. Hvor fort er det i km/h?',
    scenes: [
      { dur: 4600, text: 'Jonas sykler <b>6 km</b> til skolen. Det tar <b>20 minutter</b>. Hvor fort sykler han, målt i km/h?',
        draw: (p, t) => { const k = seg(p, .05, .95); return road() + clock(20 * k) + line([X0, RY + 22], [X1, RY + 22], 'fm-dim', 'opacity=".5"') + text((X0 + X1) / 2, RY + 50, '6 km', 'fm-lbl') + cyclist(lerp(X0, X1, k), t); } },
      { dur: 4200, text: '<b>km/h</b> betyr kilometer per time. En time er 60 minutter, altså <b>3 ganger</b> så lang som 20 minutter.',
        draw: p => {
          let s = '';
          for (let i = 0; i < 3; i++) { const o = seg(p, i * .25, i * .25 + .3); s += `<g opacity="${o}"><rect class="fm-bar" x="${40 + i * 110}" y="110" width="104" height="30" rx="8"/>${text(92 + i * 110, 131, '20 min', 'fm-lbl', 'middle', 'style="fill:#fff"')}</g>`; }
          return s + line([40, 160], [366, 160], 'fm-dim') + text(203, 184, '60 min = 1 time', 'fm-title', 'middle', `opacity="${seg(p, .75, 1)}"`);
        } },
      { dur: 1200, text: 'Hvor langt kommer han på en hel time?',
        draw: (p, t) => road() + cyclist(X0 + 40, t) + text(200, 60, '20 min → 6 km', 'fm-lbl') + text(200, 90, '60 min → ?', 'fm-big', 'middle', 'style="font-size:20px"'),
        ask: { q: 'Hvor langt kommer Jonas på en hel time i samme fart?', opts: ['6 km', '18 km', '120 km'], ok: 1,
          why: '3 · 6 = 18 km. Farten er 18 km/h.',
          wrong: { 0: '6 km er det han sykler på 20 minutter. En time er tre ganger så lang.', 2: 'Da har du ganget 6 med 20. Del heller timen i biter på 20 minutter: 3 biter.' } } },
      { dur: 4200, text: 'Fart = strekning : tid. 20 minutter er en tredjedels time, så farten er 6 : ⅓ = <b>18 km/h</b>.',
        say: 'Fart er strekning delt på tid. 20 minutter er en tredjedels time, så farten blir 6 delt på en tredjedel, som er 18 kilometer i timen.',
        draw: p => `<rect class="fm-card" x="60" y="40" width="280" height="150" rx="14"/>` +
          text(200, 82, 'fart = strekning : tid', 'fm-lbl', 'middle', `opacity="${seg(p, 0, .3)}"`) +
          text(200, 118, '= 6 km : ⅓ h', 'fm-lbl', 'middle', `opacity="${seg(p, .3, .6)}"`) +
          text(200, 162, '= 18 km/h', 'fm-big', 'middle', `opacity="${seg(p, .6, .9)}"`) },
      { dur: 4400, text: 'Går Jonas i stedet, i 5 km/h, tar turen 6 : 5 = 1,2 timer. Det er <b>72 minutter</b>!',
        say: 'Går Jonas i stedet, i 5 kilometer i timen, tar turen 6 delt på 5, som er 1,2 timer. Det er 72 minutter!',
        draw: (p, t) => {
          const k = seg(p, 0, 1);
          return road() + cyclist(lerp(X0, X1, Math.min(1, k * 3.6)), t) + person(lerp(X0, X1, k * .28), RY - 2, 50, { walk: t * .012, shirt: 2, skin: 0, hair: 1 }) +
            text(X1 - 10, 40, '🚲 20 min', 'fm-lbl', 'end') + text(X1 - 10, 64, '🚶 72 min', 'fm-lbl', 'end');
        } }
    ]
  };
  const el = document.querySelector('#film-enheter');
  if (el) F.mount(el, film);
})();
