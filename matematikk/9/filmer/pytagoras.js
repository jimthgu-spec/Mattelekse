/* Filmsnutt til Pytagoras: stigen mot vinduet. Krever ../../felles/film.js. */
(function () {
  'use strict';
  if (!window.Film) return;
  const F = window.Film, { seg, lerp, text, line, person } = F;
  const GY = 218, WALL = 300, S = 40; // 40 px per meter
  const ground = () => line([0, GY], [400, GY], 'fm-ground');
  function house() {
    return `<rect class="fm-house" x="${WALL}" y="20" width="110" height="${GY - 20}"/>` +
      `<rect class="fm-card" x="${WALL + 18}" y="38" width="44" height="34" rx="3"/>` +
      line([WALL + 40, 38], [WALL + 40, 72], 'fm-dim') + line([WALL + 18, 55], [WALL + 62, 55], 'fm-dim') +
      `<rect class="fm-shirt2" x="${WALL + 14}" y="72" width="52" height="5" rx="2"/>`;
  }
  /* Stige fra fot (fx, GY) til topp (WALL, ty) */
  function ladder(x1, y1, x2, y2, o = {}) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * 7, ny = dx / L * 7;
    let s = `<g opacity="${o.op != null ? o.op : 1}">`;
    s += line([x1 - nx, y1 - ny], [x2 - nx, y2 - ny], 'fm-wood') + line([x1 + nx, y1 + ny], [x2 + nx, y2 + ny], 'fm-wood');
    const n = Math.round(L / 20);
    for (let i = 1; i < n; i++) { const t = i / n; s += line([x1 + dx * t - nx, y1 + dy * t - ny], [x1 + dx * t + nx, y1 + dy * t + ny], 'fm-rung'); }
    return s + '</g>';
  }
  const leaned = d => { const h = Math.sqrt(Math.max(0, 25 - d * d)); return [WALL - d * S, GY, WALL, GY - h * S]; };

  const film = {
    title: 'Rekker stigen opp til vinduet?', real: 'Hus og stige', size: [400, 250],
    end: { text: 'Prøv selv: finn den manglende siden ↓', href: '#finn' },
    poster: 'Sara skal male vinduskarmen. Hvor langt fra veggen må hun sette stigen?',
    scenes: [
      { dur: 3400, text: 'Sara skal male vinduskarmen. Karmen sitter <b>4 m</b> over bakken, og stigen hennes er <b>5 m</b> lang.',
        draw: p => {
          const x = lerp(-30, 120, seg(p, 0, .8));
          return house() + ground() + person(x, GY, 70, { walk: p * 14, shirt: 2, skin: 1, hair: 3, armL: 60, armR: 60 }) +
            ladder(x - 70, GY - 50, x + 60, GY - 50) +
            text(WALL + 40, 98, '4 m opp', 'fm-small', 'middle', `opacity="${seg(p, .5, .9)}"`);
        } },
      { dur: 3600, text: 'Hun lener stigen mot veggen. Jo lenger ut foten står, jo lavere når toppen.',
        draw: p => {
          const d = lerp(.6, 3, seg(p, .1, .9)), [fx, fy, tx, ty] = leaned(d);
          return house() + ground() + ladder(fx, fy, tx, ty) + person(90, GY, 70, { shirt: 2, skin: 1, hair: 3, armL: 40 }) +
            line([WALL - 4, 74], [WALL + 70, 74], 'fm-hid') + text((fx + tx) / 2 - 18, (fy + ty) / 2, '5 m', 'fm-lbl', 'end');
        } },
      { dur: 3600, text: 'Veggen, bakken og stigen danner en <b>rettvinklet trekant</b>. Stigen er hypotenusen <b>c</b>, den lengste siden.',
        draw: p => {
          const [fx, fy, tx, ty] = leaned(3), o = seg(p, 0, .5);
          return house() + ground() + ladder(fx, fy, tx, ty, { op: .45 }) +
            `<polygon class="fm-tri" points="${fx},${fy} ${tx},${fy} ${tx},${ty}" opacity="${o}"/>` +
            `<path class="fm-dim" d="M${WALL - 14},${GY} V${GY - 14} H${WALL}" opacity="${o}"/>` +
            text((fx + tx) / 2 - 14, (fy + ty) / 2, 'c = 5', 'fm-lbl', 'end', `opacity="${seg(p, .3, .6)}"`) +
            text(WALL + 8, (GY + ty) / 2, 'a = 4', 'fm-lbl', 'start', `opacity="${seg(p, .45, .75)}"`) +
            text((fx + tx) / 2, GY + 20, 'b = ?', 'fm-big', 'middle', `opacity="${seg(p, .6, .9)}" style="font-size:18px"`);
        } },
      { dur: 3800, text: 'Pytagoras: <b>c² = a² + b²</b>. Her er c = 5 og a = 4, så <b>25 = 16 + b²</b>.',
        say: 'Pytagoras sier at c i andre er lik a i andre pluss b i andre. Her er c lik 5 og a lik 4, så 25 er lik 16 pluss b i andre.',
        draw: p => {
          const [fx, fy, tx, ty] = leaned(3);
          return `<polygon class="fm-tri" points="${fx},${fy} ${tx},${fy} ${tx},${ty}"/>` + ground() +
            text(20, 60, 'c² = a² + b²', 'fm-lbl', 'start', `opacity="${seg(p, 0, .3)}"`) +
            text(20, 88, '5² = 4² + b²', 'fm-lbl', 'start', `opacity="${seg(p, .3, .6)}"`) +
            text(20, 116, '25 = 16 + b²', 'fm-lbl fm-acc', 'start', `opacity="${seg(p, .6, .9)}"`) +
            text((fx + tx) / 2 - 14, (fy + ty) / 2, 'c = 5', 'fm-lbl', 'end') + text(WALL + 8, (GY + ty) / 2, 'a = 4', 'fm-lbl', 'start') +
            text((fx + tx) / 2, GY + 20, 'b = ?', 'fm-lbl', 'middle');
        } },
      { dur: 1200, text: 'Nå kan du finne b.',
        draw: () => { const [fx, fy, tx, ty] = leaned(3); return `<polygon class="fm-tri" points="${fx},${fy} ${tx},${fy} ${tx},${ty}"/>` + ground() + text(60, 90, '25 = 16 + b²', 'fm-lbl fm-acc', 'start') + text((fx + tx) / 2, GY + 20, 'b = ?', 'fm-big', 'middle', 'style="font-size:18px"'); },
        ask: { q: 'Hvor langt fra veggen må foten av stigen stå?', opts: ['1 m', '3 m', '9 m'], ok: 1,
          why: 'b² = 25 − 16 = 9, og b = √9 = 3 m.',
          wrong: { 0: 'Da har du regnet 5 − 4. Pytagoras bruker kvadratene: 25 − 16 = 9, og så kvadratroten.', 2: '9 er b², ikke b. Ta kvadratroten: √9 = 3 m.' } } },
      { dur: 4600, text: 'Foten står <b>3 m</b> fra veggen, og stigen rekker akkurat opp til karmen. Sara kan begynne å male!',
        draw: p => {
          const [fx, fy, tx, ty] = leaned(3), k = seg(p, .1, .85);
          const px = lerp(fx + 14, tx - 12, k), py = lerp(fy, ty + 56, k);
          return house() + ground() + ladder(fx, fy, tx, ty) +
            line([fx, GY + 8], [WALL, GY + 8], 'fm-dim') + text((fx + WALL) / 2, GY + 24, '3 m', 'fm-lbl', 'middle') +
            person(px, py, 62, { shirt: 2, skin: 1, hair: 3, armL: lerp(60, 160, k), armR: 150, walk: k > .98 ? null : k * 20 });
        } }
    ]
  };
  const el = document.querySelector('#film-pytagoras');
  if (el) F.mount(el, film);
})();
