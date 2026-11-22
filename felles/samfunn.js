/* Felles verktøy for samfunnsfagmodulene. Krever verksted.js (V) og natur.js (N).
   S.scenario(el, {start, nodes})   dilemma med valg og konsekvenser.
       nodes: {id: {who?, ava?, text, choices:[{t, go?, tone:'good'|'mid'|'bad', cons}] }}  (ingen choices = slutt)
   S.order(el, {items:[{t, k}], intro?, good, label?})   dra hendelser i riktig rekkefølge (k = årstall eller rang)
   S.flip(el, [{front, back}])        kort som vendes ved trykk
   S.film(sel, film)                  monterer en filmsnutt hvis film.js er lastet
   S.bg.skole(), S.bg.stue(), S.bg.klasse(), S.bg.by(), S.phone(x,y,w,h,innhold)  bakgrunner til filmer */
(function(){
'use strict';
const V=window.V,N=window.N,S={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

S.scenario=function(el,{start,nodes,title}){
  el.classList.add('scen');
  let trail=[];
  function show(id){
    const n=nodes[id];
    let h=(title?`<span class="tag" style="font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--accent)">${title}</span>`:'');
    if(trail.length)h+=`<div class="trail">Dine valg: ${trail.map(esc).join(' → ')}</div>`;
    h+=`<div class="who"><div class="ava" aria-hidden="true">${n.ava||'🧑'}</div><div class="say">${n.who?`<b>${n.who}:</b> `:''}${n.text}</div></div>`;
    if(n.choices&&n.choices.length){
      h+=`<p class="note" style="margin:0">Hva gjør du?</p><div class="opts col">${n.choices.map((c,i)=>`<button type="button" class="opt" data-i="${i}">${c.t}</button>`).join('')}</div>`;
    }
    h+=`<div data-r="cons" aria-live="polite"></div><div class="row"><button type="button" class="btn" data-r="again"${trail.length?'':' hidden'}>Start på nytt</button></div>`;
    el.innerHTML=h;
    el.querySelector('[data-r="again"]').addEventListener('click',()=>{trail=[];show(start);});
    el.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
      const c=n.choices[+b.dataset.i];trail.push(c.t.replace(/<[^>]+>/g,''));
      el.querySelectorAll('.opt').forEach(x=>{x.disabled=true;});b.classList.add(c.tone==='bad'?'is-no':'is-ok');
      const box=el.querySelector('[data-r="cons"]');
      box.innerHTML=`<div class="cons ${c.tone||'mid'}">${c.cons}</div>`+(c.go?`<div class="row" style="margin-top:8px"><button type="button" class="btn primary" data-r="go">Gå videre →</button></div>`:'');
      el.querySelector('[data-r="again"]').hidden=false;
      if(c.go)box.querySelector('[data-r="go"]').addEventListener('click',()=>show(c.go));
    }));
  }
  show(start);
};

S.order=function(el,{items,intro,good,label}){
  el.classList.add('sorder');
  const sorted=items.slice().sort((a,b)=>a.k-b.k);
  const html=(intro?`<p class="note">${intro}</p>`:'')+sorted.map((_,i)=>`<div class="ln"><span class="n">${i+1}.</span>[]</div>`).join('');
  N.fill(el,{html,tokens:items.map(x=>x.t),check:v=>{
    const bad=v.map((t,i)=>t===sorted[i].t?-1:i).filter(i=>i>=0);
    if(!bad.length)return{ok:true,msg:(good||'Riktig rekkefølge!')+(label?'<ul class="tl" style="margin-top:8px">'+sorted.map(x=>`<li><span class="yr">${label(x.k)}</span>${x.t}</li>`).join('')+'</ul>':'')};
    return{ok:false,bad,msg:`${bad.length} ${bad.length===1?'står':'står'} på feil plass (markert med rødt). Hva skjedde først?`};
  }});
};

S.flip=function(el,cards){
  el.classList.add('flip');
  el.innerHTML=cards.map((c,i)=>`<button type="button" data-i="${i}" aria-pressed="false">${c.front}</button>`).join('');
  el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    const c=cards[+b.dataset.i],on=b.classList.toggle('on');b.setAttribute('aria-pressed',on);b.innerHTML=on?c.back:c.front;}));
};

S.film=function(sel,film){const el=typeof sel==='string'?document.querySelector(sel):sel;if(el&&window.Film)window.Film.mount(el,film);};

/* ---------- Bakgrunner til filmer (400 × 250) ---------- */
const G=236;
S.GY=G;
S.bg={
  skole:()=>`<rect x="0" y="0" width="400" height="${G}" fill="var(--paper)"/><rect class="fm-house" x="210" y="70" width="180" height="${G-70}"/>`+
    [0,1,2].map(i=>`<rect class="fm-card" x="${226+i*56}" y="90" width="36" height="30" rx="3"/>`).join('')+
    `<rect class="fm-card" x="282" y="${G-50}" width="40" height="50"/><text class="fm-small" x="300" y="62" text-anchor="middle">SKOLE</text>`+
    `<line class="fm-ground" x1="0" y1="${G}" x2="400" y2="${G}"/><path d="M30 ${G} v-70 M30 ${G-70} q-24 -4 -26 -26 q4 -26 26 -30 q24 4 26 30 q-2 22 -26 26" class="fm-plant" style="fill:var(--good-soft);stroke:var(--good);stroke-width:1.5"/>`,
  stue:()=>`<rect x="0" y="0" width="400" height="${G}" fill="var(--paper)"/><rect class="fm-card" x="296" y="30" width="84" height="70" rx="4"/><line class="fm-ground" x1="338" y1="30" x2="338" y2="100"/>`+
    `<rect x="40" y="${G-56}" width="170" height="40" rx="10" fill="var(--c3-soft)" stroke="var(--c3)" stroke-width="1.5"/><rect x="40" y="${G-80}" width="170" height="30" rx="10" fill="var(--c3-soft)" stroke="var(--c3)" stroke-width="1.5"/>`+
    `<line class="fm-ground" x1="0" y1="${G}" x2="400" y2="${G}"/>`,
  klasse:()=>`<rect x="0" y="0" width="400" height="${G}" fill="var(--paper)"/><rect x="110" y="26" width="200" height="96" rx="4" fill="#2f5b46" stroke="#1e3b2d" stroke-width="3"/>`+
    `<line class="fm-ground" x1="0" y1="${G}" x2="400" y2="${G}"/>`,
  by:()=>`<rect x="0" y="0" width="400" height="${G}" fill="var(--paper)"/>`+[[10,90,70],[90,60,60],[160,110,80],[250,70,60],[320,100,70]].map(([x,h,w])=>`<rect class="fm-house" x="${x}" y="${G-h-40}" width="${w}" height="${h}"/>`).join('')+
    `<line class="fm-ground" x1="0" y1="${G}" x2="400" y2="${G}"/>`,
  tom:()=>`<rect x="0" y="0" width="400" height="${G}" fill="var(--paper)"/><line class="fm-ground" x1="0" y1="${G}" x2="400" y2="${G}"/>`
};
S.phone=(x,y,w,h,inner='')=>`<g transform="translate(${x},${y})"><rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="var(--ink)"/><rect x="4" y="8" width="${w-8}" height="${h-16}" rx="4" fill="var(--surface)"/>${inner}</g>`;
/* Tekstlinjer som brytes (SVG har ikke automatisk linjeskift) */
S.lines=(x,y,str,max=26,cls='fm-small',lh=15,anchor='start')=>{const w=String(str).split(' '),out=[];let cur='';w.forEach(t=>{if((cur+' '+t).trim().length>max){out.push(cur.trim());cur=t;}else cur+=' '+t;});if(cur.trim())out.push(cur.trim());
  return out.map((l,i)=>`<text class="${cls}" x="${x}" y="${y+i*lh}" text-anchor="${anchor}">${l}</text>`).join('');};

window.S=S;
})();
