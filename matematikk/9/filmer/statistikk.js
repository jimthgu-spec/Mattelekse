/* Filmsnutt til Statistikk: skjermtid, gjennomsnitt og median. Krever ../../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, text, line, person } = F;
  const GY = 236, BASE = 176, U = 8.5; // søylene står på BASE, 8,5 px per time
  const DATA = [2, 3, 3, 3, 4, 4, 16], NAMES = ['Ada', 'Ben', 'Cis', 'Didi', 'Eli', 'Fia', 'Mads'];
  const X = i => 38 + i * 54;
  function kids(o = {}) {
    let s = '';
    DATA.forEach((v, i) => {
      s += person(X(i), GY, 50, { shirt: 1 + (i % 4), skin: (i * 3) % 4, hair: i % 4, armL: o.wave === i ? 160 : 8 });
      if (o.names) s += text(X(i), GY - 56, NAMES[i], 'fm-small');
    });
    return s;
  }
  function bars(k = 1, o = {}) {
    let s = line([12, BASE], [390, BASE], 'fm-axis');
    DATA.forEach((v, i) => {
      const h = v * U * Math.min(1, Math.max(0, k * 7 - i));
      const cls = o.hi === i ? 'fm-bar2' : 'fm-bar';
      s += `<rect class="${cls}" x="${X(i) - 15}" y="${(BASE - h).toFixed(1)}" width="30" height="${h.toFixed(1)}" rx="3" opacity="${o.dim != null && o.dim !== i && o.hi !== i ? .35 : 1}"/>`;
      if (h > 0) s += text(X(i), BASE - h - 5, String(v), 'fm-lbl');
    });
    return s;
  }
  const meanLine = (op = 1) => line([12, BASE - 5 * U], [390, BASE - 5 * U], 'fm-bad', `stroke-dasharray="6 4" opacity="${op}"`) +
    text(14, BASE - 5 * U - 6, 'gjennomsnitt 5', 'fm-badtxt', 'start', `opacity="${op}"`);
  const medLine = (op = 1) => line([12, BASE - 3 * U], [390, BASE - 3 * U], 'fm-dim', `stroke-dasharray="2 3" stroke-width="2" opacity="${op}"`) +
    text(14, BASE - 3 * U - 5, 'median 3', 'fm-goodtxt', 'start', `opacity="${op}"`);

  const film = {
    title: 'Hva er en typisk helg?', real: 'Skjermtid', size: [400, 250],
    end: { text: 'Prøv selv: legg til prikker ↓', href: '#sentral' },
    poster: 'Sju venner teller timer med skjerm i helgen. Hva er typisk?',
    scenes: [
      { dur: 4000, text: 'Sju venner teller hvor mange timer de brukte på skjerm i helgen. De fleste brukte 2 til 4 timer, men Mads spilte i <b>16 timer</b>.',
        draw: p => kids({ wave: p > .7 ? 6 : -1 }) + bars(seg(p, .1, .85)) },
      { dur: 4200, text: 'Gjennomsnittet: 2 + 3 + 3 + 3 + 4 + 4 + 16 = 35, og 35 : 7 = <b>5 timer</b>.',
        say: 'Gjennomsnittet: Vi legger sammen alle tallene og får 35. 35 delt på 7 er 5 timer.',
        draw: p => kids() + bars(1) + meanLine(seg(p, .5, .8)) +
          text(200, 30, '35 : 7 = 5', 'fm-title', 'middle', `opacity="${seg(p, .2, .5)}"`) },
      { dur: 1200, text: 'Se på den stiplede linja.',
        draw: () => kids() + bars(1) + meanLine(),
        ask: { q: 'Hvor mange av de sju brukte mer enn gjennomsnittet på 5 timer?', opts: ['1', '3', '6'], ok: 0,
          why: 'Bare én! Mads med 16 timer drar gjennomsnittet langt opp.',
          wrong: { 1: 'Tell søylene som går over den stiplede linja.', 2: 'Tell søylene som går over den stiplede linja. De fleste ligger under.' } } },
      { dur: 4400, text: '<b>Medianen</b> er tallet i midten når tallene står i rekkefølge: 2, 3, 3, <b>3</b>, 4, 4, 16. Medianen er <b>3 timer</b>.',
        say: 'Medianen er tallet i midten når tallene står i rekkefølge. Den midterste er 3 timer.',
        draw: p => kids() + bars(1, { hi: p > .4 ? 3 : -1, dim: p > .4 ? 3 : null }) + meanLine(.35) + medLine(seg(p, .55, .85)) +
          `<path class="fm-goodtxt" style="fill:none;stroke:var(--good);stroke-width:2" d="M${X(3)},${BASE + 6} l-6,8 h12 Z" opacity="${seg(p, .3, .5)}"/>` },
      { dur: 3800, text: 'Én ekstrem verdi kan dra gjennomsnittet langt opp. Da sier <b>medianen</b> mer om hva som er typisk.',
        draw: p => kids({ wave: 3 }) + bars(1, { hi: 3 }) + meanLine() + medLine() +
          F.bubble(X(3), BASE - 3 * U - 22, 'Typisk!', { opacity: seg(p, .3, .6) }) }
    ]
  };
  const el = document.querySelector('#film-statistikk');
  if (el) F.mount(el, film);
})();
