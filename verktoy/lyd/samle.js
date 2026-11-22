/* Samler alt filmene leser opp, og skriver <mappe>/manifest.json.
   Bruk: node verktoy/lyd/samle.js   (fra roten av repoet)
   Lydfilene lages deretter av verktoy/lyd/lag_lyd.py (kjøres av GitHub Actions). */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const noop = () => {};
global.window = global;
global.matchMedia = () => ({ matches: false });
global.localStorage = { getItem: () => null, setItem: noop };
global.document = { addEventListener: noop, querySelector: () => ({}) };
global.addEventListener = noop;
require(path.join(root, 'felles', 'film.js'));
const F = window.Film;
const out = {}; // mappe -> {hash: tekst}
F.mount = (el, film) => {
  const dir = film.audio;
  if (!dir) return;
  const m = out[dir] = out[dir] || {};
  const add = s => { if (s) m[F.audioKey(s)] = F.speechText(s); };
  add(F.SAMPLE);
  add('Ikke helt. Prøv et annet svar.');
  film.scenes.forEach(sc => {
    add(sc.say || sc.text);
    if (sc.ask) {
      add(sc.ask.q); add('Riktig! ' + sc.ask.why);
      Object.values(sc.ask.wrong || {}).forEach(add);
    }
  });
};
const filmDir = path.join(root, 'moduler', 'filmer');
fs.readdirSync(filmDir).filter(f => f.endsWith('.js')).forEach(f => {
  require(path.join(filmDir, f));
  /* filmene ligger i moduler/, så 'filmer/lyd/' er moduler/filmer/lyd/ */
  Object.entries(out).forEach(([dir, lyd]) => {
    const abs = path.join(root, 'moduler', dir);
    fs.mkdirSync(abs, { recursive: true });
    const file = path.join(abs, 'manifest.json');
    let old = {};
    try { old = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
    /* «tekster» er det som skal leses inn. «lyd» lister bare filer som faktisk finnes (fylles av lag_lyd.py). */
    const lydOk = {};
    Object.keys(lyd).forEach(k => { if ((old.lyd || {})[k] && fs.existsSync(path.join(abs, k + '.mp3'))) lydOk[k] = 1; });
    fs.writeFileSync(file, JSON.stringify({ stemme: old.stemme || 'Innspilt stemme', motor: old.motor || '', lyd: lydOk, tekster: lyd }, null, 1) + '\n');
    console.log(file, Object.keys(lyd).length, 'tekster,', Object.keys(lydOk).length, 'med lyd');
  });
});
