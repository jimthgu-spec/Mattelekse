/* Filmsnutt til Hva skjer hvis: stor eller liten pizza. Krever ../../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person } = F;
  const GY = 228;
  function pizza(cx, cy, r, op = 1) {
    let s = `<g opacity="${op}"><circle class="fm-pizza" cx="${cx}" cy="${cy}" r="${r}"/>`;
    const n = r > 50 ? 9 : 4;
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996, d = r * .62 * Math.sqrt((i + .5) / n);
      s += `<circle class="fm-salami" cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" r="${(r * .13).toFixed(1)}"/>`;
    }
    return s + '</g>';
  }
  function menu(op = 1) {
    return `<g opacity="${op}"><rect class="fm-card" x="200" y="18" width="186" height="74" rx="10"/>` +
      text(293, 40, 'MENY', 'fm-small') + text(214, 62, 'Liten Ø 20 cm', 'fm-small', 'start') + text(374, 62, '90 kr', 'fm-lbl', 'end') +
      text(214, 82, 'Stor Ø 40 cm', 'fm-small', 'start') + text(374, 82, '250 kr', 'fm-lbl', 'end') + '</g>';
  }
  const kids = (o = {}) => person(42, GY, 84, Object.assign({ shirt: 1, skin: 0, hair: 1 }, o.a || {})) +
    person(98, GY, 80, Object.assign({ shirt: 2, skin: 3, hair: 2, flip: true }, o.b || {}));
  const SMALL = [[262, 120], [338, 120], [262, 196], [338, 196]];
  const film = {
    title: 'Er den store pizzaen et dårlig kjøp?', real: 'Pizza', size: [400, 250],
    end: { text: 'Prøv selv: forstørr med k ↓', href: '#skaler' },
    poster: 'Den store pizzaen er dobbelt så bred, men koster nesten tre ganger så mye. Lurt eller dyrt?',
    scenes: [
      { dur: 3600, text: 'Emil og Noor skal kjøpe pizza. Den store er <b>dobbelt så bred</b> som den lille, men koster nesten <b>tre ganger</b> så mye. Er det et dårlig kjøp?',
        draw: p => kids({ a: { armL: lerp(10, 120, seg(p, .3, .6)) } }) + menu(seg(p, 0, .3)) +
          F.bubble(98, 128, 'Så dyr!', { opacity: seg(p, .6, .85) }) },
      { dur: 2800, text: 'Diameteren er 20 cm og 40 cm. Lengden er altså doblet: <b>k = 2</b>.',
        draw: p => pizza(110, 128, 38, seg(p, 0, .3)) + pizza(280, 128, 76, seg(p, .2, .5)) +
          line([72, 186], [148, 186], 'fm-dim') + text(110, 204, '20 cm', 'fm-lbl') +
          line([204, 222], [356, 222], 'fm-dim') + text(280, 240, '40 cm', 'fm-lbl') },
      { dur: 1200, text: 'Hvor mye mer pizza er det i den store?',
        draw: () => pizza(110, 128, 38) + pizza(280, 128, 76) + text(110, 204, '20 cm', 'fm-lbl') + text(280, 240, '40 cm', 'fm-lbl'),
        ask: { q: 'Hvor mange små pizzaer gir like mye pizza som én stor?', opts: ['2', '4', '8'], ok: 1,
          why: 'Diameteren er 2 ganger så stor. Arealet vokser i to retninger, så det blir 2 · 2 = 4 ganger så stort.',
          wrong: { 0: 'Bare lengden er doblet. Arealet vokser både på langs og på tvers: 2 · 2.', 2: '2 · 2 · 2 = 8 gjelder volum, som vokser i tre retninger. En pizza er flat, så arealet blir 2 · 2.' } } },
      { dur: 4400, text: 'Den store pizzaen har like mye pizza som <b>fire</b> små. Arealet blir <b>k² = 2² = 4</b> ganger så stort.',
        draw: p => {
          let s = pizza(110, 140, 76);
          SMALL.forEach((q, i) => { const k = seg(p, i * .15, i * .15 + .35); s += pizza(lerp(110, q[0], k), lerp(140, q[1], k), 36, k > 0 ? 1 : 0); });
          return s + text(110, 40, '1 stor', 'fm-lbl') + text(300, 40, '= 4 små', 'fm-lbl fm-acc', 'middle', `opacity="${seg(p, .7, 1)}"`);
        } },
      { dur: 4200, text: 'Fire små koster 4 · 90 = <b>360 kr</b>. Den store koster <b>250 kr</b>. Den store pizzaen er altså det beste kjøpet!',
        draw: p => pizza(80, 110, 56) + text(80, 196, '250 kr', 'fm-goodtxt') +
          SMALL.map(q => pizza(q[0] - 20, q[1] - 24, 26)).join('') + text(280, 220, '4 · 90 = 360 kr', 'fm-badtxt', 'middle', `opacity="${seg(p, .2, .5)}"`) +
          `<g opacity="${seg(p, .55, .85)}"><circle class="fm-good" cx="138" cy="60" r="16"/>${text(138, 66, '✓', 'fm-title', 'middle', 'style="fill:#fff;font-size:18px"')}</g>` },
      { dur: 3400, text: 'Husk: dobler du lengdene, blir arealet <b>4</b> ganger og volumet <b>8</b> ganger så stort.',
        draw: p => kids({ a: { armL: 150 }, b: { armL: 150 } }) +
          `<g opacity="${seg(p, 0, .3)}">${line([170, 120], [230, 120], 'fm-rad')}${text(200, 150, 'lengde ×2', 'fm-small')}</g>` +
          `<g opacity="${seg(p, .25, .55)}"><rect class="fm-g" x="250" y="96" width="44" height="44"/>${text(272, 160, 'areal ×4', 'fm-small')}</g>` +
          `<g opacity="${seg(p, .5, .8)}">${F.box(F.proj(22, 318, 140), 0, 0, 0, 2, 2, 2, 'fm-cube', { grid: true })}${text(350, 160, 'volum ×8', 'fm-small')}</g>` }
    ]
  };
  const el = document.querySelector('#film-hvis');
  if (el) F.mount(el, film);
})();
