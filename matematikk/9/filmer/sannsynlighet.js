/* Filmsnutt til Sannsynlighet: venter på sekseren i ludo. Krever ../../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person } = F;
  const GY = 236;
  /* 60 kast (fast rekkefølge, så filmen blir lik hver gang): 10 seksere */
  const THROWS = '112351236253152336614635634521413124366264323445561412365515'.split('').map(Number);
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(x, y, s, n, o = {}) {
    const hi = n === 6 && o.hi;
    let r = `<g transform="translate(${x},${y}) rotate(${o.rot || 0})" opacity="${o.op != null ? o.op : 1}"><rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${s * .2}" fill="${hi ? 'var(--accent)' : 'var(--surface)'}" stroke="var(--ink)" stroke-width="${Math.max(1, s * .05)}"/>`;
    PIPS[n].forEach(([a, b]) => { r += `<circle cx="${a * s * .26}" cy="${b * s * .26}" r="${s * .09}" fill="${hi ? '#fff' : 'var(--ink)'}"/>`; });
    return r + '</g>';
  }
  function table(op = 1) {
    let s = `<g opacity="${op}"><rect class="fm-card" x="120" y="150" width="160" height="14" rx="4"/>`;
    s += line([140, 164], [140, GY], 'fm-axis') + line([260, 164], [260, GY], 'fm-axis');
    const cols = ['#e46a6a', '#5aa0e0', '#f5c542', '#5cbf7a'];
    cols.forEach((c, i) => { s += `<rect x="${150 + i * 26}" y="140" width="22" height="10" rx="3" fill="${c}"/>`; });
    return s + '</g>';
  }
  const ida = (o = {}) => person(92, GY, 96, Object.assign({ shirt: 1, skin: 0, hair: 1 }, o));
  const omar = (o = {}) => person(308, GY, 100, Object.assign({ shirt: 3, skin: 2, hair: 2, flip: true }, o));
  const film = {
    title: 'Er terningen jukset?', real: 'Ludo', size: [400, 250],
    end: { text: 'Prøv selv: trekk kuler fra posen ↓', href: '#pose' },
    poster: 'Ida har kastet fem ganger uten å få sekser. Er terningen jukset?',
    scenes: [
      { dur: 4400, text: 'Ida og Omar spiller ludo. Man må få en <b>sekser</b> for å komme ut. Ida har kastet fem ganger uten sekser. Er terningen jukset?',
        draw: p => {
          const k = Math.min(4, Math.floor(p * 5)), q = p * 5 - k;
          return table() + ida({ armL: lerp(40, 100, Math.sin(q * Math.PI)) }) + omar() +
            die(200, lerp(90, 128, seg(q, 0, .5)), 22, THROWS[k], { rot: q * 360 }) +
            text(200, 40, 'Kast ' + (k + 1) + ': ' + THROWS[k], 'fm-lbl') +
            F.bubble(300, 118, 'Jukseterning?', { opacity: seg(p, .85, 1) });
        } },
      { dur: 1200, text: 'En terning har seks sider.',
        draw: () => table() + ida() + omar() + [1, 2, 3, 4, 5, 6].map((n, i) => die(95 + i * 42, 70, 30, n, { hi: true })).join(''),
        ask: { q: 'Hva er sannsynligheten for å få sekser på ett kast?', opts: ['1/2', '1/6', '6/6'], ok: 1,
          why: 'Terningen har 6 like sannsynlige sider, og bare én av dem er en sekser: 1/6.',
          wrong: { 0: 'Det er enten sekser eller ikke, men de to utfallene er ikke like sannsynlige. Det er 1 sekser av 6 sider.', 2: '6/6 = 1 betyr helt sikkert. Bare 1 av de 6 sidene er en sekser.' } } },
      { dur: 6200, text: 'Vi kaster <b>60</b> ganger. Hver sekser lyser opp. Omtrent hvert sjette kast blir en sekser, men de kommer ikke jevnt.',
        say: 'Vi kaster 60 ganger. Hver sekser lyser opp. Omtrent hvert sjette kast blir en sekser, men de kommer ikke jevnt.',
        draw: p => {
          const n = Math.round(60 * seg(p, 0, .9)); let s = '', sixes = 0;
          for (let i = 0; i < n; i++) { if (THROWS[i] === 6) sixes++; s += die(26 + (i % 12) * 31.5, 30 + Math.floor(i / 12) * 34, 24, THROWS[i], { hi: true }); }
          return s + text(200, 218, 'seksere: ' + sixes + ' av ' + n, 'fm-title');
        } },
      { dur: 4200, text: 'På 60 kast venter vi 60 · 1/6 = <b>10 seksere</b>, og det fikk vi. Hver side kom omtrent 10 ganger.',
        say: 'På 60 kast venter vi 60 ganger en sjettedel, altså 10 seksere. Og det fikk vi. Hver side kom omtrent 10 ganger.',
        draw: p => {
          const c = [0, 0, 0, 0, 0, 0, 0]; THROWS.forEach(v => c[v]++);
          let s = line([40, 200], [330, 200], 'fm-axis');
          for (let f = 1; f <= 6; f++) {
            const h = c[f] * 11 * seg(p, (f - 1) * .08, (f - 1) * .08 + .4);
            s += `<rect class="${f === 6 ? 'fm-bar2' : 'fm-bar'}" x="${8 + f * 46}" y="${(200 - h).toFixed(1)}" width="34" height="${h.toFixed(1)}" rx="3"/>` +
              die(25 + f * 46, 220, 18, f) + (h > 0 ? text(25 + f * 46, 194 - h, String(c[f]), 'fm-lbl') : '');
          }
          return s + line([40, 200 - 110], [330, 200 - 110], 'fm-bad', `stroke-dasharray="6 4" opacity="${seg(p, .6, .9)}"`) +
            text(396, 94, 'forventet 10', 'fm-small', 'end', `opacity="${seg(p, .6, .9)}"`);
        } },
      { dur: 4200, text: 'Sjansen for å <b>ikke</b> få sekser fem ganger på rad er (5/6)⁵ ≈ 0,40. Det skjer 4 av 10 ganger. Terningen er nok ikke jukset!',
        say: 'Sjansen for å ikke få sekser fem ganger på rad er fem sjettedeler, opphøyd i fem. Det er omtrent 0,4. Det skjer altså 4 av 10 ganger, så terningen er nok ikke jukset!',
        draw: p => table() + ida({ armL: 150, armR: -140 }) + omar({ armL: 60 }) +
          `<rect class="fm-card" x="110" y="30" width="180" height="70" rx="12" opacity="${seg(p, 0, .3)}"/>` +
          text(200, 58, '(5/6)⁵ ≈ 0,40', 'fm-lbl', 'middle', `opacity="${seg(p, .1, .4)}"`) +
          text(200, 86, '4 av 10 ganger', 'fm-lbl fm-acc', 'middle', `opacity="${seg(p, .4, .7)}"`) +
          die(200, 128, 22, 6, { hi: true, op: seg(p, .7, 1), rot: 20 }) }
    ]
  };
  const el = document.querySelector('#film-sannsynlighet');
  if (el) F.mount(el, film);
})();
