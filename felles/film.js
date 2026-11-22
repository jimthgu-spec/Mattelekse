/* Filmsnutter: en liten animasjonsspiller for verksted-modulene.
   Bruk:
     Film.mount(element, {
       title: 'Akvariet', size: [400, 250], end: {text: 'Prøv selv', href: '#prisme'},
       scenes: [
         {dur: 3000, text: 'Teksten som vises og leses opp.', say: 'valgfri egen opplesing',
          draw: p => '<svg-innhold>'},          // p går fra 0 til 1 i løpet av dur
         {dur: 2000, text: '…', draw: p => '…',
          ask: {q: 'Spørsmål?', opts: ['a', 'b', 'c'], ok: 1, why: 'Forklaring', wrong: {0: 'Forklaring til feil svar'}}}
       ]
     });
   Pedagogikk (Mayer: multimedia-læring): korte scener eleven styrer selv (segmentering),
   tale + figur (modalitet), stopp med «hva tror du?» (aktiv prosessering og hentepraksis),
   og en tydelig slutt som peker tilbake til oppgaven. */
(function () {
  'use strict';
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const synth = window.speechSynthesis || null;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('film:' + k); return v == null ? d : v === '1'; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('film:' + k, v ? '1' : '0'); } catch (e) {} }
  };

  /* ---------- Hjelpere for tegning ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  /* seg(p, a, b): hvor langt (0..1, myk) vi er kommet i delintervallet a..b av scenen */
  const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const f1 = v => (Math.round(v * 10) / 10).toString();
  const nf = (n, d = 2) => Number(n).toLocaleString('nb-NO', { maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* Skrå projeksjon: x mot høyre, y opp, z innover i bildet */
  function proj(s, ox, oy, ax = .45, ay = .3) {
    return (x, y, z) => [ox + s * x + s * z * ax, oy - s * y - s * z * ay];
  }
  const pts = ps => ps.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  const poly = (ps, cls, extra = '') => `<polygon class="${cls}" points="${pts(ps)}" ${extra}/>`;
  const line = (a, b, cls, extra = '') => `<line class="${cls}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" ${extra}/>`;
  const text = (x, y, s, cls = 'fm-lbl', anchor = 'middle', extra = '') =>
    `<text class="${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" ${extra}>${s}</text>`;
  /* Boks med synlig front, høyreside og topp. grid=true tegner enhetsruter (1 · 1). */
  function box(P, x, y, z, w, h, d, cls, o = {}) {
    let s = '';
    const op = o.opacity != null ? ` opacity="${f1(o.opacity * 100) / 100}"` : '';
    s += poly([P(x, y, z), P(x + w, y, z), P(x + w, y + h, z), P(x, y + h, z)], cls + ' fr', op);
    s += poly([P(x + w, y, z), P(x + w, y, z + d), P(x + w, y + h, z + d), P(x + w, y + h, z)], cls + ' sd', op);
    s += poly([P(x, y + h, z), P(x + w, y + h, z), P(x + w, y + h, z + d), P(x, y + h, z + d)], cls + ' tp', op);
    if (o.grid) {
      const g = o.gridCls || 'fm-grid', st = o.step || 1;
      for (let i = st; i < w - 1e-9; i += st) s += line(P(x + i, y, z), P(x + i, y + h, z), g) + line(P(x + i, y + h, z), P(x + i, y + h, z + d), g);
      for (let j = st; j < h - 1e-9; j += st) s += line(P(x, y + j, z), P(x + w, y + j, z), g) + line(P(x + w, y + j, z), P(x + w, y + j, z + d), g);
      for (let k = st; k < d - 1e-9; k += st) s += line(P(x, y + h, z + k), P(x + w, y + h, z + k), g) + line(P(x + w, y, z + k), P(x + w, y + h, z + k), g);
    }
    return s;
  }
  /* Bakkanter (stiplet) for en gjennomsiktig boks */
  function backEdges(P, x, y, z, w, h, d, cls = 'fm-hid') {
    return line(P(x, y, z + d), P(x + w, y, z + d), cls) + line(P(x, y, z + d), P(x, y, z), cls) + line(P(x, y, z + d), P(x, y + h, z + d), cls);
  }
  /* Sylinder sett litt ovenfra. cx = midten, by = bunnen, rx = radius i px, hp = høyde i px */
  function cylinder(cx, by, rx, hp, cls, o = {}) {
    const ry = rx * (o.tilt || .3), ty = by - hp;
    let s = `<path class="${cls} body" d="M${f1(cx - rx)},${f1(ty)} L${f1(cx - rx)},${f1(by)} A${f1(rx)},${f1(ry)} 0 0 0 ${f1(cx + rx)},${f1(by)} L${f1(cx + rx)},${f1(ty)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(cx - rx)},${f1(ty)} Z"/>`;
    if (o.top !== false) s += `<ellipse class="${cls} top" cx="${f1(cx)}" cy="${f1(ty)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`;
    return s;
  }

  /* ---------- Menneskefigurer ----------
     person(x, y, h, o): x = midten, y = der føttene står, h = høyde i px.
     o.flip: snur figuren mot venstre. o.walk: fase (radianer) for gange. o.armL/o.armR: vinkel i grader
     fra rett ned (positiv = fremover). o.legL/o.legR: beinvinkel. o.shirt: 1–4 (farge). o.skin: 0–3. o.hair: 0–3.
     o.sit: sitter (bøyde bein). o.hold: tegnet i hånden (svg-streng, plassert ved fremste hånd). */
  const SKIN = ['#f3cfa6', '#d9a066', '#a86b3c', '#6e4325'], HAIR = ['#3b2a20', '#c8902e', '#1d1d1d', '#8a3b1e'];
  function person(x, y, h, o = {}) {
    const u = h / 10, rad = d => d * Math.PI / 180;
    const ph = o.walk != null ? o.walk : null;
    const legL = o.legL != null ? o.legL : (ph != null ? 28 * Math.sin(ph) : 7);
    const legR = o.legR != null ? o.legR : (ph != null ? -28 * Math.sin(ph) : -7);
    const armL = o.armL != null ? o.armL : (ph != null ? -24 * Math.sin(ph) : 8);
    const armR = o.armR != null ? o.armR : (ph != null ? 24 * Math.sin(ph) : -8);
    const bob = ph != null ? Math.abs(Math.sin(ph)) * u * .25 : 0;
    const hipY = -4.1 * u + bob, shY = -7.5 * u + bob, headY = -8.85 * u + bob, hr = 1.1 * u;
    const limb = (x0, y0, ang, len, w, cls, knee) => {
      if (knee) { // sittende: lår fremover, legg ned
        const kx = x0 + len * .55, ky = y0;
        return `<path class="${cls}" d="M${f1(x0)},${f1(y0)} L${f1(kx)},${f1(ky)} L${f1(kx + len * .05)},${f1(ky + len * .5)}" stroke-width="${f1(w)}"/>`;
      }
      const ex = x0 + Math.sin(rad(ang)) * len, ey = y0 + Math.cos(rad(ang)) * len;
      return `<line class="${cls}" x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(ex)}" y2="${f1(ey)}" stroke-width="${f1(w)}"/>`;
    };
    const shirt = 'fm-shirt' + (o.shirt || 1);
    let s = `<g transform="translate(${f1(x)},${f1(y)})${o.flip ? ' scale(-1,1)' : ''}">`;
    s += limb(0, hipY, legR, 4.1 * u, 1.15 * u, 'fm-legs', o.sit) + limb(0, hipY, legL, 4.1 * u, 1.15 * u, 'fm-legs', o.sit);
    s += limb(0, shY + .4 * u, armR, 3.5 * u, .85 * u, shirt + ' fm-limb');
    s += `<rect class="${shirt}" x="${f1(-1.15 * u)}" y="${f1(shY)}" width="${f1(2.3 * u)}" height="${f1(hipY - shY + .5 * u)}" rx="${f1(.9 * u)}"/>`;
    s += `<circle cx="0" cy="${f1(headY)}" r="${f1(hr)}" fill="${SKIN[(o.skin || 0) % 4]}"/>`;
    s += `<path d="M${f1(-hr)},${f1(headY)} A${f1(hr)},${f1(hr)} 0 0 1 ${f1(hr)},${f1(headY)} L${f1(hr * .6)},${f1(headY - hr * .35)} L${f1(-hr * .9)},${f1(headY + hr * .2)} Z" fill="${HAIR[(o.hair || 0) % 4]}"/>`;
    s += `<circle cx="${f1(hr * .45)}" cy="${f1(headY - hr * .05)}" r="${f1(Math.max(.9, hr * .11))}" fill="#1d1d1d"/>`;
    const ax = Math.sin(rad(armL)) * 3.5 * u, ay = shY + .4 * u + Math.cos(rad(armL)) * 3.5 * u;
    s += limb(0, shY + .4 * u, armL, 3.5 * u, .85 * u, shirt + ' fm-limb');
    if (o.hold) s += `<g transform="translate(${f1(ax)},${f1(ay)})">${o.hold}</g>`;
    return s + '</g>';
  }
  /* Snakkeboble over (x, y) */
  function bubble(x, y, str, o = {}) {
    const w = o.w || Math.max(40, str.length * 7.4 + 18), h = 26, bx = clamp(x - w / 2, 4, (o.W || 400) - w - 4);
    return `<g opacity="${o.opacity != null ? o.opacity : 1}"><rect class="fm-card" x="${f1(bx)}" y="${f1(y - h - 8)}" width="${f1(w)}" height="${h}" rx="12"/>` +
      `<path class="fm-card" d="M${f1(x - 6)},${f1(y - 9)} L${f1(x)},${f1(y)} L${f1(x + 6)},${f1(y - 9)}" style="stroke-linejoin:round"/>` +
      `<text class="fm-bubble" x="${f1(bx + w / 2)}" y="${f1(y - 16)}" text-anchor="middle">${str}</text></g>`;
  }
  const sun = (x, y, r = 16, rot = 0) => {
    let s = `<g transform="translate(${x},${y}) rotate(${f1(rot)})">`;
    for (let i = 0; i < 8; i++) s += `<line class="fm-sunray" x1="0" y1="${-r - 4}" x2="0" y2="${-r - 11}" transform="rotate(${i * 45})"/>`;
    return s + `<circle class="fm-sun" r="${r}"/></g>`;
  };

  /* ---------- Tale ---------- */
  let voice = null, voiceChecked = false, voices = [];
  const listeners = [];
  /* iOS/macOS lister også «morostemmer» (Eloquence: Eddy, Flo, Reed …) som høres hakkete ut.
     Vi rangerer stemmene og velger den mest naturlige. Eleven kan også velge selv. */
  const ROBOT = /\b(eddy|flo|grandma|grandpa|bestemor|bestefar|reed|rocko|sandy|shelley|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|eloquence)\b/i;
  function score(v) {
    const n = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
    let s = 0;
    if (ROBOT.test(n)) s -= 100;
    if (/premium/.test(n)) s += 40;
    if (/enhanced|forbedret|neural|natural|online/.test(n)) s += 30;
    if (/siri/.test(n)) s += 25;
    if (/nora|pernille|iselin|finn|google/.test(n)) s += 10;
    if (/compact|kompakt/.test(n)) s -= 5;
    if (/^nb/i.test(v.lang)) s += 2;
    return s;
  }
  const isNo = v => /^(nb|no|nn)([-_]|$)/i.test(v.lang) || /norsk|norwegian|bokm/i.test(v.name);
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices() || [];
    if (!vs.length) return;
    voiceChecked = true;
    voices = vs.filter(isNo).sort((a, b) => score(b) - score(a));
    let saved = null;
    try { saved = localStorage.getItem('film:stemme'); } catch (e) {}
    voice = (saved && voices.find(v => v.voiceURI === saved)) || voices.find(v => score(v) > -50) || voices[0] || null;
    listeners.forEach(f => f());
  }
  function setVoice(uri) {
    const v = voices.find(x => x.voiceURI === uri);
    if (!v) return;
    voice = v;
    try { localStorage.setItem('film:stemme', uri); } catch (e) {}
    listeners.forEach(f => f());
  }
  if (synth) { pickVoice(); try { synth.addEventListener('voiceschanged', pickVoice); } catch (e) { synth.onvoiceschanged = pickVoice; } }
  const canSpeak = () => !!synth && (!voiceChecked || !!voice);
  /* Gjør matematikk-tekst om til noe talesyntesen leser riktig */
  function speechText(s) {
    return String(s).replace(/<[^>]+>/g, '')
      .replace(/(\d)[\s  ](?=\d{3}\b)/g, '$1')
      .replace(/cm³/g, ' kubikkcentimeter').replace(/dm³/g, ' kubikkdesimeter').replace(/m³/g, ' kubikkmeter')
      .replace(/cm²/g, ' kvadratcentimeter').replace(/dm²/g, ' kvadratdesimeter').replace(/m²/g, ' kvadratmeter')
      .replace(/\b([a-z])²/g, '$1 i andre').replace(/√\s?/g, 'kvadratroten av ').replace(/(\d)²/g, '$1 i andre')
      .replace(/(\d)\s?km\/h/g, '$1 kilometer i timen').replace(/km\/h/g, 'kilometer i timen').replace(/(\d)\s?km\b/g, '$1 kilometer')
      .replace(/(\d)\s?min\b/g, '$1 minutter').replace(/(\d)\s?%/g, '$1 prosent').replace(/\b1\/6\b/g, 'en sjettedel').replace(/\b1\/2\b/g, 'en halv').replace(/\b6\/6\b/g, 'seks sjettedeler')
      .replace(/⅓/g, 'en tredjedel').replace(/(\d)\s?m\b(?![²³])/g, '$1 meter').replace(/(\d)\s?kr\b/g, '$1 kroner').replace(/\bØ\s?/g, 'diameter ')
      .replace(/(\d)\s?L\b/g, '$1 liter').replace(/(\d)\s?cm\b/g, '$1 centimeter').replace(/(\d)\s?kg\b/g, '$1 kilo')
      .replace(/\bG\s?=/g, 'G er lik').replace(/\bV\s?=/g, 'V er lik')
      .replace(/·/g, ' ganger ').replace(/(\d)\s*:\s*(?=\d)/g, '$1 delt på ').replace(/≈/g, ' omtrent ').replace(/=/g, ' er ')
      .replace(/π/g, 'pi').replace(/\s[−-]\s/g, ' minus ').replace(/→/g, ', ').replace(/\s+/g, ' ').trim();
  }

  /* ---------- Spilleren ---------- */
  const players = [];
  function mount(host, film) {
    const W = (film.size || [400, 250])[0], H = (film.size || [400, 250])[1];
    const scenes = film.scenes;
    let idx = 0, t = 0, playing = false, last = 0, raf = 0, spoken = true, speakTimer = 0, started = false, state = 'idle';
    let sound = store.get('lyd', true) && canSpeak(), captions = store.get('tekst', true);
    const answered = {};

    host.classList.add('film');
    host.innerHTML = `
      <div class="film-head"><span class="film-badge" aria-hidden="true">▶</span><span class="film-title">${esc(film.title)}</span>${film.real ? `<span class="film-real">${esc(film.real)}</span>` : ''}</div>
      <div class="film-stage">
        <svg class="film-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Filmsnutt: ' + film.title)}"><g class="film-g"></g></svg>
        <button class="film-big" type="button"><span class="film-big-ico" aria-hidden="true">▶</span><span class="film-big-txt">Spill av</span></button>
      </div>
      <div class="film-ask" hidden></div>
      <p class="film-cap" aria-live="polite"></p>
      <div class="film-bar">
        <button class="film-btn film-play" type="button" aria-label="Spill av">▶</button>
        <button class="film-btn film-prev" type="button" aria-label="Forrige scene">⏮</button>
        <div class="film-segs" role="group" aria-label="Scener"></div>
        <button class="film-btn film-next" type="button" aria-label="Neste scene">⏭</button>
        <button class="film-btn film-snd" type="button" aria-pressed="false"></button>
        <button class="film-btn film-cc" type="button" aria-pressed="false" aria-label="Tekst">T</button>
        <button class="film-btn film-set" type="button" aria-expanded="false" aria-label="Velg stemme" title="Velg stemme" hidden>⚙</button>
      </div>
      <div class="film-voice" hidden>
        <label>Stemme <select class="field"></select></label>
        <button class="btn film-try" type="button">Hør</button>
        <p class="note">Hakkete stemme? På iPhone: Innstillinger → Tilgjengelighet → Opplest innhold → Stemmer → Norsk → Nora → last ned «Forbedret». Last så siden på nytt.</p>
      </div>`;
    const $ = s => host.querySelector(s);
    const g = $('.film-g'), big = $('.film-big'), cap = $('.film-cap'), askEl = $('.film-ask'), segs = $('.film-segs');
    const playBtn = $('.film-play'), sndBtn = $('.film-snd'), ccBtn = $('.film-cc');
    const segEls = scenes.map((sc, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'film-seg'; b.setAttribute('aria-label', 'Scene ' + (i + 1) + (sc.ask ? ' (spørsmål)' : ''));
      b.innerHTML = '<i></i>' + (sc.ask ? '<span aria-hidden="true">?</span>' : '');
      b.addEventListener('click', () => { goto(i); play(); });
      segs.appendChild(b); return b;
    });

    function readMs(sc) {
      const words = String(sc.text).replace(/<[^>]+>/g, '').split(/\s+/).length;
      return 900 + words * 330;
    }
    function render() {
      const sc = scenes[idx];
      const p = reduce ? 1 : clamp(t / sc.dur);
      g.innerHTML = sc.draw(p, t);
      segEls.forEach((b, i) => {
        b.classList.toggle('on', i === idx);
        b.querySelector('i').style.width = (i < idx ? 100 : i > idx ? 0 : Math.round(clamp(t / Math.max(sc.dur, 1)) * 100)) + '%';
      });
    }
    function showCaption() {
      cap.innerHTML = scenes[idx].text;
      cap.hidden = !captions;
    }
    function stopSpeech() {
      clearTimeout(speakTimer);
      if (synth) try { synth.cancel(); } catch (e) {}
    }
    function speak(str, done) {
      stopSpeech();
      if (!sound || !synth) { if (done) done(); return; }
      const said = speechText(str);
      let fin = false;
      const end = () => { if (fin) return; fin = true; clearTimeout(speakTimer); if (done) done(); };
      try {
        const u = new SpeechSynthesisUtterance(said);
        u.lang = voice ? voice.lang : 'nb-NO';
        if (voice) u.voice = voice;
        u.rate = 1; u.pitch = 1;
        u.onend = end; u.onerror = end;
        synth.speak(u);
        /* Reserve i tilfelle nettleseren ikke sier fra når den er ferdig */
        speakTimer = setTimeout(end, 2500 + said.length * 95);
      } catch (e) { end(); }
    }
    function narrate() {
      const sc = scenes[idx];
      spoken = !sound;
      if (sound) { const my = idx; speak(sc.say || sc.text, () => { if (idx === my) spoken = true; }); }
    }
    function goto(i) {
      stopSpeech();
      idx = clamp(i, 0, scenes.length - 1); t = 0; state = playing ? 'play' : 'pause';
      askEl.hidden = true; askEl.innerHTML = '';
      host.classList.remove('asking', 'ended');
      showCaption(); render();
      if (playing) narrate(); else spoken = !sound;
    }
    function setPlayIcon() {
      playBtn.textContent = playing ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Spill av');
      host.classList.toggle('playing', playing);
    }
    function play() {
      if (state === 'ask') return;
      players.forEach(pl => { if (pl !== api) pl.pause(); });
      if (state === 'ended') { started = true; playing = true; goto(0); }
      if (!started) { started = true; playing = true; goto(idx); }
      else if (!playing) { playing = true; state = 'play'; if (!spoken) narrate(); }
      big.hidden = true; setPlayIcon();
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (!playing) return;
      playing = false; if (state === 'play') state = 'pause';
      stopSpeech(); if (sound) spoken = false;
      cancelAnimationFrame(raf); setPlayIcon();
    }
    function tick(now) {
      if (!playing) return;
      const dt = Math.min(100, now - last); last = now; t += dt;
      const sc = scenes[idx];
      render();
      const animDone = t >= sc.dur;
      const textDone = sound ? spoken : t >= Math.max(sc.dur, readMs(sc));
      if (animDone && textDone) {
        if (sc.ask && !answered[idx]) { showAsk(); return; }
        if (idx < scenes.length - 1) { goto(idx + 1); }
        else { finish(); return; }
      }
      raf = requestAnimationFrame(tick);
    }
    function showAsk() {
      const a = scenes[idx].ask;
      playing = false; state = 'ask'; setPlayIcon(); host.classList.add('asking');
      askEl.hidden = false;
      askEl.innerHTML = `<p class="film-q"><span class="film-tag">Hva tror du?</span>${a.q}</p>
        <div class="film-opts">${a.opts.map((o, i) => `<button class="opt film-opt" type="button" data-i="${i}">${o}</button>`).join('')}</div>
        <div class="fb film-fb" aria-live="polite"></div>`;
      speak(a.q);
      askEl.querySelectorAll('.film-opt').forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.i, fb = askEl.querySelector('.film-fb');
        if (i === a.ok) {
          b.classList.add('is-ok');
          askEl.querySelectorAll('.film-opt').forEach(x => { x.disabled = true; });
          fb.className = 'fb film-fb good'; fb.innerHTML = a.why;
          speak('Riktig! ' + a.why);
          const go = document.createElement('button');
          go.type = 'button'; go.className = 'btn primary film-go'; go.textContent = 'Fortsett ▶';
          go.addEventListener('click', () => { answered[idx] = true; state = 'pause'; host.classList.remove('asking'); askEl.hidden = true; nextFromAsk(); });
          askEl.appendChild(go); go.focus({ preventScroll: true });
        } else {
          b.classList.add('is-no'); b.disabled = true;
          const w = (a.wrong && a.wrong[i]) || 'Ikke helt. Prøv et annet svar.';
          fb.className = 'fb film-fb bad'; fb.innerHTML = w; speak(w);
        }
      }));
    }
    function nextFromAsk() {
      playing = true;
      if (idx < scenes.length - 1) goto(idx + 1); else { finish(); return; }
      setPlayIcon(); last = performance.now(); raf = requestAnimationFrame(tick);
    }
    function finish() {
      playing = false; state = 'ended'; setPlayIcon(); host.classList.add('ended');
      t = scenes[idx].dur; render();
      big.hidden = false;
      $('.film-big-txt').textContent = 'Se igjen'; $('.film-big-ico').textContent = '↻';
      if (film.end) {
        askEl.hidden = false;
        askEl.innerHTML = `<a class="btn primary film-end" href="${esc(film.end.href)}">${film.end.text}</a>`;
        const a = askEl.querySelector('a');
        a.addEventListener('click', ev => {
          const target = document.querySelector(film.end.href);
          if (target) { ev.preventDefault(); target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
        });
      }
    }
    function setSound(on) {
      if (on && !canSpeak()) on = false;
      sound = on; store.set('lyd', on);
      sndBtn.textContent = on ? '🔊' : '🔇';
      sndBtn.setAttribute('aria-pressed', String(on));
      sndBtn.setAttribute('aria-label', on ? 'Opplesing på' : 'Opplesing av');
      sndBtn.title = canSpeak() ? (on ? 'Opplesing på' : 'Opplesing av') : 'Fant ingen norsk stemme på denne enheten';
      if (!on) { stopSpeech(); spoken = true; }
      else if (playing) narrate();
    }
    function setCaptions(on) {
      captions = on; store.set('tekst', on); cap.hidden = !on;
      ccBtn.setAttribute('aria-pressed', String(on)); ccBtn.classList.toggle('off', !on);
      ccBtn.title = on ? 'Skjul tekst' : 'Vis tekst';
    }

    big.addEventListener('click', play);
    playBtn.addEventListener('click', () => (playing ? pause() : play()));
    $('.film-prev').addEventListener('click', () => { goto(t > 1500 || idx === 0 ? idx : idx - 1); if (started) play(); });
    $('.film-next').addEventListener('click', () => { if (idx < scenes.length - 1) { goto(idx + 1); play(); } });
    sndBtn.addEventListener('click', () => setSound(!sound));
    ccBtn.addEventListener('click', () => setCaptions(!captions));
    $('.film-stage').addEventListener('click', ev => { if (ev.target.closest('.film-big')) return; if (started && state !== 'ask') (playing ? pause() : play()); });

    const setBtn = $('.film-set'), vBox = $('.film-voice'), vSel = $('.film-voice select');
    function fillVoices() {
      setBtn.hidden = !synth || voices.length < 1;
      vSel.innerHTML = voices.map(v => `<option value="${esc(v.voiceURI)}"${v === voice ? ' selected' : ''}>${esc(v.name)}</option>`).join('');
      if (!sound && canSpeak() && store.get('lyd', true)) setSound(true);
    }
    listeners.push(fillVoices);
    setBtn.addEventListener('click', () => { vBox.hidden = !vBox.hidden; setBtn.setAttribute('aria-expanded', String(!vBox.hidden)); });
    vSel.addEventListener('change', () => { setVoice(vSel.value); if (!sound) setSound(true); speak('Hei! Slik høres denne stemmen ut.'); });
    $('.film-try').addEventListener('click', () => { if (!sound) setSound(true); speak('Hei! Slik høres denne stemmen ut. Volumet er grunnflaten ganger høyden.'); });
    fillVoices();
    setSound(sound); setCaptions(captions);
    /* Plakat: første scene ferdig tegnet */
    t = scenes[0].dur; render(); t = 0; showCaption(); spoken = !sound;
    if (film.poster) cap.innerHTML = film.poster;
    const api = { pause, play, goto, host, film };
    players.push(api);
    return api;
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) players.forEach(p => p.pause()); });
  window.addEventListener('pagehide', () => { if (synth) try { synth.cancel(); } catch (e) {} });

  window.Film = { players, person, bubble, sun, mount, ease, seg, lerp, clamp, nf, proj, poly, line, text, box, backEdges, cylinder, speechText };
})();
