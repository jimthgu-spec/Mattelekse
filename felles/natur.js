/* Felles verktøy for naturfagmodulene. Krever verksted.js (window.V) og natur.css.
   N.mc(prompt, riktig, [feil...], hints, løsning, {feilsvar: forklaring})   flervalgsoppgave til V.practice
   N.sorter(el, {groups:[{id,name}], items:[{t, g, why?}], good})          dra eller trykk ting i riktig kurv
   N.fill(el, {html, tokens:[...], check(verdier)->{ok, msg, bad:[indekser]}})  fyll ord inn i bokser (likninger, rekkefølger)
   N.graph(svg, {x:{min,max,step,label}, y:{min,max,step,label}, series:[{pts:[[x,y]], cls, line, dots}], marks, empty})
   N.slider(el, {id, label, min, max, step, value, fmt, on})               glidebryter med verdi
   Alt fungerer med mus, berøring og tastatur (Tab + Enter). */
(function(){
'use strict';
const V=window.V, N={};
const fx=v=>(Math.round(v*10)/10).toString();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

N.mc=function(prompt,right,wrongs,hints,sol,why){
  const choices=V.shuffle([right,...wrongs]);
  return {prompt,choices,ok:choices.indexOf(right),hints:hints||[],sol,diag:i=>(why&&why[choices[i]])||null};
};

/* Dra og slipp med trykk-alternativ. drop(token, mål) kalles når et ord slippes på et mål. */
function draggable(tok,{onTap,onDrop,targetSel}){
  tok.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onTap();}});
  tok.addEventListener('pointerdown',e=>{
    if(tok.classList.contains('used'))return;
    e.preventDefault();const sx=e.clientX,sy=e.clientY;let ghost=null;
    const move=ev=>{
      if(!ghost&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>6){ghost=tok.cloneNode(true);ghost.classList.add('drag');document.body.appendChild(ghost);}
      if(ghost){ghost.style.left=(ev.clientX-ghost.offsetWidth/2)+'px';ghost.style.top=(ev.clientY-ghost.offsetHeight/2)+'px';}
    };
    const up=ev=>{
      document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
      if(ghost){ghost.remove();const t=document.elementFromPoint(ev.clientX,ev.clientY);const tg=t&&t.closest&&t.closest(targetSel);if(tg)onDrop(tg);}
      else onTap();
    };
    document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
  });
}

N.sorter=function(el,{groups,items,good,intro}){
  let place={},sel=null;
  el.classList.add('nsort');
  el.innerHTML=(intro?`<p class="note">${intro}</p>`:'')+
    `<div class="pool" data-r="pool" aria-label="Ting som skal sorteres"></div>`+
    `<div class="bins">${groups.map(g=>`<div class="bin" data-g="${g.id}" tabindex="0" role="button" aria-label="${esc(g.name)}"><div class="binh">${g.name}</div><div class="binb"></div></div>`).join('')}</div>`+
    `<div class="row"><button class="btn primary" type="button" data-r="check">Sjekk</button><button class="btn" type="button" data-r="reset">Start på nytt</button></div><div class="fb" data-r="fb" aria-live="polite"></div>`;
  const q=s=>el.querySelector(`[data-r="${s}"]`);
  const order=V.shuffle(items.map((_,i)=>i));
  function render(){
    q('pool').innerHTML='';el.querySelectorAll('.binb').forEach(b=>b.innerHTML='');
    order.forEach(i=>{
      const it=items[i],t=document.createElement('span');
      t.className='token'+(sel===i?' sel':'');t.dataset.i=i;t.tabIndex=0;t.setAttribute('role','button');t.innerHTML=it.t;
      const box=place[i]?el.querySelector(`.bin[data-g="${place[i]}"] .binb`):q('pool');box.appendChild(t);
      draggable(t,{targetSel:'.bin,.pool',
        onTap:()=>{sel=sel===i?null:i;render();},
        onDrop:tg=>{if(tg.classList.contains('pool'))delete place[i];else place[i]=tg.dataset.g;sel=null;render();}});
    });
    el.querySelector('.pool').classList.toggle('empty',Object.keys(place).length===items.length);
  }
  el.querySelectorAll('.bin').forEach(b=>{
    const go=()=>{if(sel!=null){place[sel]=b.dataset.g;sel=null;render();}};
    b.addEventListener('click',e=>{if(e.target.closest('.token'))return;go();});
    b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
  });
  q('reset').addEventListener('click',()=>{place={};sel=null;render();q('fb').className='fb';q('fb').innerHTML='';});
  q('check').addEventListener('click',()=>{
    const fb=q('fb');
    if(Object.keys(place).length<items.length){fb.className='fb hint';fb.textContent='Sorter alle først.';return;}
    const wrong=items.map((it,i)=>i).filter(i=>place[i]!==items[i].g);
    el.querySelectorAll('.bin .token').forEach(t=>t.classList.toggle('bad',wrong.includes(+t.dataset.i)));
    if(!wrong.length){fb.className='fb good';fb.innerHTML=good||'Alt er riktig!';return;}
    const w=items[wrong[0]];
    fb.className='fb bad';fb.innerHTML=`${wrong.length} ${wrong.length===1?'ting ligger':'ting ligger'} feil (markert med rødt).`+(w.why?` Tips om <b>${w.t}</b>: ${w.why}`:'')+' Flytt dem og sjekk igjen.';
  });
  render();
};

N.fill=function(el,{html,tokens,check,good}){
  el.classList.add('nfill');
  el.innerHTML=`<div class="eq">${html.replace(/\[\]/g,()=>'<span class="slot" tabindex="0" role="button"></span>')}</div><div class="tokens"></div>`+
    `<div class="row"><button class="btn primary" type="button" data-r="check">Sjekk</button><button class="btn" type="button" data-r="reset">Tøm</button></div><div class="fb" data-r="fb" aria-live="polite"></div>`;
  const slots=[...el.querySelectorAll('.slot')],vals=slots.map(()=>null),fb=el.querySelector('[data-r="fb"]');let sel=null;
  slots.forEach((s,i)=>s.dataset.s=i);
  const tb=el.querySelector('.tokens');
  V.shuffle(tokens).forEach(w=>{const t=document.createElement('span');t.className='token';t.dataset.w=w;t.tabIndex=0;t.setAttribute('role','button');t.innerHTML=w;tb.appendChild(t);
    draggable(t,{targetSel:'.slot',onTap:()=>{sel=sel===w?null:w;paint();},onDrop:s=>put(w,+s.dataset.s)});});
  function put(w,i){const j=vals.indexOf(w);if(j>=0)vals[j]=null;vals[i]=w;sel=null;paint();}
  function paint(){
    slots.forEach((s,i)=>{s.innerHTML=vals[i]||'';s.classList.toggle('filled',!!vals[i]);s.classList.remove('bad');});
    tb.querySelectorAll('.token').forEach(t=>{t.classList.toggle('used',vals.includes(t.dataset.w));t.classList.toggle('sel',sel===t.dataset.w);});
  }
  slots.forEach((s,i)=>{const go=()=>{if(sel)put(sel,i);else if(vals[i]){vals[i]=null;paint();}};
    s.addEventListener('click',go);s.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});});
  el.querySelector('[data-r="reset"]').addEventListener('click',()=>{vals.fill(null);sel=null;paint();fb.className='fb';fb.innerHTML='';});
  el.querySelector('[data-r="check"]').addEventListener('click',()=>{
    if(vals.some(v=>!v)){fb.className='fb hint';fb.textContent='Fyll alle boksene først.';return;}
    const r=check(vals.slice());
    if(r.ok){fb.className='fb good';fb.innerHTML=r.msg||good||'Riktig!';return;}
    (r.bad||[]).forEach(i=>slots[i].classList.add('bad'));fb.className='fb bad';fb.innerHTML=r.msg||'Ikke helt. Prøv igjen.';
  });
  paint();
};

N.graph=function(svg,{x,y,series=[],marks='',empty,W=380,H=230}){
  const L=46,R=14,T=14,B=40;
  const X=v=>L+(v-x.min)/(x.max-x.min)*(W-L-R),Y=v=>H-B-(v-y.min)/(y.max-y.min)*(H-B-T);
  let s='';
  for(let v=y.min;v<=y.max+1e-9;v+=y.step)s+=`<line class="gl2" x1="${L}" y1="${fx(Y(v))}" x2="${W-R}" y2="${fx(Y(v))}"/><text class="lbl small" x="${L-6}" y="${fx(Y(v)+4)}" text-anchor="end">${V.nf(v,2)}</text>`;
  for(let v=x.min;v<=x.max+1e-9;v+=x.step)s+=`<text class="lbl small" x="${fx(X(v))}" y="${H-B+16}" text-anchor="middle">${x.fmt?x.fmt(v):V.nf(v,2)}</text>`;
  s+=`<line class="ax" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/><line class="ax" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/>`;
  s+=`<text class="lbl small" x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle">${x.label}</text>`;
  s+=`<text class="lbl small" x="12" y="${(T+H-B)/2}" text-anchor="middle" transform="rotate(-90 12 ${(T+H-B)/2})">${y.label}</text>`;
  let any=false;
  series.forEach(se=>{const p=se.pts.filter(q=>isFinite(q[0])&&isFinite(q[1]));if(!p.length)return;any=true;
    if(se.line!==false&&p.length>1)s+=`<polyline class="${se.lineCls||'ptline'}" points="${p.map(q=>fx(X(q[0]))+','+fx(Y(Math.max(y.min,Math.min(y.max,q[1]))))).join(' ')}"/>`;
    if(se.dots!==false)p.forEach(q=>s+=`<circle class="${se.cls||'pt'}" cx="${fx(X(q[0]))}" cy="${fx(Y(q[1]))}" r="5"/>`);});
  if(typeof marks==='function')s+=marks(X,Y);
  if(!any&&empty)s+=`<text class="lbl small" x="${(L+W)/2}" y="${(T+H-B)/2}" text-anchor="middle">${empty}</text>`;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=s;
  return {X,Y};
};

N.slider=function(el,{id,label,min,max,step,value,fmt,on}){
  const d=document.createElement('div');d.className='slider';
  d.innerHTML=`<label for="${id}">${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output for="${id}"></output>`;
  el.appendChild(d);
  const inp=d.querySelector('input'),out=d.querySelector('output');
  const upd=()=>{out.textContent=fmt?fmt(+inp.value):inp.value;if(on)on(+inp.value);};
  inp.addEventListener('input',upd);upd();
  return {get value(){return +inp.value;},set value(v){inp.value=v;upd();},input:inp};
};

window.N=N;
})();
