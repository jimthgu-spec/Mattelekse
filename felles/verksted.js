/* Felles verktøy for alle verksted-moduler.
   Bruk: <script src="../felles/verksted.js"></script>, så window.V.
   - V.predict(el, {...})       «Gjett først»-kort med umiddelbar tilbakemelding
   - V.walk(ol, knapp, steg, ferdigtekst)  Gjennomgått eksempel, ett steg om gangen
   - V.check(input, knapp, fb, {...})      Delvis utfylt eksempel (eleven fyller inn)
   - V.practice(el, {...})      Blandet øving med hint, feilsøkende tilbakemelding og spredt repetisjon
   Fremgang lagres i localStorage under «verksted:<id>», slik at forsiden kan vise den. */
(function(){
'use strict';
const V={};
const $=V.$=s=>document.querySelector(s);
V.$$=s=>Array.from(document.querySelectorAll(s));
V.nf=(n,d=2)=>Number(n).toLocaleString('nb-NO',{maximumFractionDigits:d});
V.reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
V.parseNum=function(str){
  if(str==null)return NaN;
  const s=String(str).trim().replace(/[\s  ]/g,'').replace(',', '.').replace('−','-');
  if(!/^-?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;
  return parseFloat(s);
};
V.R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
V.pick=a=>a[Math.floor(Math.random()*a.length)];
V.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
V.near=(a,b,rel=.01)=>Math.abs(a-b)<=rel*Math.abs(b)+1e-9;
V.m=s=>`<span class="mono">${s}</span>`;
V.fx=v=>(+v).toFixed(1);

/* Skjul «JavaScript virker ikke»-boksen, og vis feil hvis noe krasjer */
V.ready=function(){const b=$('#nojs');if(b)b.hidden=true;};
window.addEventListener('error',function(e){const b=$('#nojs');if(b){b.hidden=false;b.innerHTML='<b>Noe gikk galt i nettleseren.</b> Feilmelding: '+String(e.message||e).replace(/</g,'&lt;');}});

/* ---------- Gjett først ---------- */
V.predict=function(el,{q,opts,ok,expl,tag='Gjett først',retry}){
  el.classList.add('predict');
  el.innerHTML=`<span class="tag">${tag}</span><p>${q}</p><div class="opts">${opts.map((o,i)=>`<button type="button" class="opt" data-i="${i}">${o}</button>`).join('')}</div><div class="fb" aria-live="polite"></div>`;
  const fb=el.querySelector('.fb');
  el.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('.opt').forEach(x=>x.classList.remove('is-ok','is-no'));
    if(+b.dataset.i===ok){b.classList.add('is-ok');fb.className='fb good';fb.innerHTML='Riktig! '+expl;}
    else{b.classList.add('is-no');fb.className='fb bad';fb.innerHTML=(typeof retry==='function'?retry(+b.dataset.i):retry)||'Ikke helt. Test det i figuren, og prøv igjen.';}
  }));
};

/* ---------- Gjennomgått eksempel ---------- */
V.walk=function(ol,btn,steps,doneText){
  let i=0;
  btn.addEventListener('click',()=>{
    if(i>=steps.length)return;
    const [mth,why]=steps[i];const li=document.createElement('li');li.className='new';
    li.innerHTML=`<span class="n">${i+1}</span><span class="m">${mth}<span class="why">${why}</span></span>`;
    ol.appendChild(li);i++;
    if(i>=steps.length){btn.textContent=doneText||'Ferdig.';btn.disabled=true;}
  });
};

/* ---------- Delvis utfylt eksempel: ett felt ---------- */
V.check=function(input,btn,fb,{ans,rel=1e-9,abs=0,good,diag,next}){
  const run=()=>{
    const v=V.parseNum(input.value);
    if(isNaN(v)){fb.className='fb hint';fb.textContent='Skriv inn et tall.';return;}
    if(Math.abs(v-ans)<=Math.max(rel*Math.abs(ans),abs)+1e-9){fb.className='fb good';fb.innerHTML=good;input.disabled=true;btn.disabled=true;if(next)next();}
    else{const d=diag&&diag(v);fb.className='fb bad';fb.innerHTML=d||'Ikke helt. Prøv igjen.';}
  };
  btn.addEventListener('click',run);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
};

/* ---------- Lagring ---------- */
V.load=function(id,blank){
  try{const s=JSON.parse(localStorage.getItem('verksted:'+id)||'null');if(s&&s.boxes)return{...blank,...s,boxes:{...blank.boxes,...s.boxes},times:{...(blank.times||{}),...(s.times||{})}};}catch(e){}
  return blank;
};
V.save=function(id,data){try{localStorage.setItem('verksted:'+id,JSON.stringify(data));}catch(e){}};

/* ---------- Øving ----------
   skills: { id: { name, gens:[funksjon, ...] } }
   En generator returnerer enten
     tall:  { prompt, fig, ans, unit, rel, abs, hints:[...], sol, diag(v)->tekst|null }
     valg:  { prompt, fig, choices:[...], ok:indeks, hints, sol, diag(i)->tekst|null }   */
const LEVEL=['Ny','I gang','På vei','Nesten','Sitter!'];
const DAYS=[0,1,2,4,8];        // dager før en ferdighet bør repeteres, per boks
const DAY=864e5;
V.practice=function(root,{id,title,skills}){
  root.innerHTML=`
  <div class="welcome" hidden></div>
  <div class="practice">
    <div class="task">
      <div class="tmeta"><span class="chip" data-r="skill"></span><span class="note" data-r="count"></span></div>
      <div class="tbody" data-r="body"><div class="tfig" data-r="fig"></div><p class="tprompt" data-r="prompt"></p></div>
      <form class="answer" data-r="form" autocomplete="off">
        <label class="sr" for="${id}-ans">Ditt svar</label>
        <input class="field" id="${id}-ans" data-r="ans" inputmode="decimal" autocomplete="off" placeholder="Svar">
        <span class="unit" data-r="unit"></span>
        <button class="btn primary" type="submit" data-r="check">Sjekk</button>
      </form>
      <div class="opts" data-r="choices" hidden></div>
      <div class="row">
        <button class="btn" type="button" data-r="hint">Gi meg et hint</button>
        <button class="btn" type="button" data-r="show" hidden>Vis løsning</button>
        <button class="btn ghost" type="button" data-r="next">Ny oppgave</button>
      </div>
      <div data-r="hints" style="display:flex;flex-direction:column;gap:8px"></div>
      <div class="fb" data-r="fb" aria-live="polite"></div>
    </div>
    <aside class="side">
      <div class="panel"><h3>Mestring</h3><div data-r="mastery"></div></div>
      <div class="panel stats">
        <div><span class="num" data-r="streak">0</span><span>på rad</span></div>
        <div><span class="num" data-r="total">0</span><span>riktige totalt</span></div>
      </div>
      <button class="btn ghost" type="button" data-r="reset">Nullstill fremgang</button>
    </aside>
  </div>`;
  const q=n=>root.querySelector(`[data-r="${n}"]`);
  const blank=()=>({title,boxes:Object.fromEntries(Object.keys(skills).map(k=>[k,0])),times:{},correct:0,seen:0,last:0});
  let store=V.load(id,blank());store.title=title;
  const returning=store.seen>0;
  const save=()=>{store.last=Date.now();V.save(id,store);};
  const due=k=>store.boxes[k]>0&&store.times[k]&&(Date.now()-store.times[k])>DAYS[store.boxes[k]]*DAY;
  let task=null,lastSkill=null,streak=0,n=0;

  function renderMastery(){
    q('mastery').innerHTML=Object.entries(skills).map(([k,s])=>{const bx=store.boxes[k];
      return`<div class="mrow"><div class="top"><span>${s.name}</span><span class="lvl">${due(k)?'Repeter':LEVEL[bx]}</span></div><div class="bar"><i style="width:${bx/4*100}%"></i></div></div>`;}).join('');
    q('streak').textContent=streak;q('total').textContent=store.correct;
  }
  function chooseSkill(){
    const ids=Object.keys(skills).filter(k=>k!==lastSkill||Object.keys(skills).length===1);
    const w=ids.map(k=>5-store.boxes[k]+(due(k)?3:0));let r=Math.random()*w.reduce((a,b)=>a+b,0);
    for(let i=0;i<ids.length;i++){r-=w[i];if(r<=0)return ids[i];}
    return ids[ids.length-1];
  }
  function finish(){
    task.done=true;q('ans').disabled=true;q('check').disabled=true;q('hint').disabled=true;q('show').hidden=true;
    q('choices').querySelectorAll('.opt').forEach(b=>b.disabled=true);
    const nx=q('next');nx.textContent='Neste oppgave';nx.classList.remove('ghost');nx.classList.add('primary');nx.focus({preventScroll:true});
    store.seen++;save();renderMastery();
  }
  function right(){
    const first=task.tries===0,clean=first&&task.hints===0;
    if(clean){store.boxes[task.skill]=Math.min(4,store.boxes[task.skill]+1);}
    store.times[task.skill]=Date.now();
    store.correct++;streak++;
    const praise=clean?V.pick(['Riktig!','Helt rett!','Sterkt!','Riktig, godt jobbet!']):'Riktig! Bra at du ikke ga deg.';
    const fb=q('fb');fb.className='fb good';fb.innerHTML=`<b>${praise}</b><div class="sol">${task.sol}</div>`;
    finish();
  }
  function wrong(d){
    task.tries++;streak=0;
    if(!task.lowered){store.boxes[task.skill]=Math.max(0,store.boxes[task.skill]-1);task.lowered=true;save();}
    const fb=q('fb');fb.className='fb bad';
    fb.innerHTML=(d||'Ikke helt.')+' Prøv igjen'+(task.hints<task.hintText.length?', eller ta et hint.':'.');
    if(task.tries>=2)q('show').hidden=false;
    renderMastery();
  }
  q('form').addEventListener('submit',e=>{
    e.preventDefault();if(!task||task.done||task.choices)return;
    const v=V.parseNum(q('ans').value);
    if(isNaN(v)){const fb=q('fb');fb.className='fb hint';fb.textContent='Skriv svaret som et tall, for eksempel 12,5.';return;}
    const ok=Math.abs(v-task.ans)<=Math.max((task.rel??1e-6)*Math.abs(task.ans),task.abs||0)+1e-9;
    ok?right():wrong(task.diag&&task.diag(v));
  });
  q('hint').addEventListener('click',()=>{
    if(!task||task.done)return;
    const list=task.hintText;if(task.hints>=list.length)return;
    const d=document.createElement('div');d.className='fb hint';d.innerHTML=`<b>Hint ${task.hints+1}:</b> ${list[task.hints]}`;
    q('hints').appendChild(d);task.hints++;
    const h=q('hint');
    if(task.hints>=list.length){h.disabled=true;h.textContent='Ingen flere hint';} else h.textContent='Ett hint til';
  });
  q('show').addEventListener('click',()=>{
    if(!task||task.done)return;
    const fb=q('fb');fb.className='fb hint';fb.innerHTML=`<b>Slik løser du den:</b><div class="sol">${task.sol}</div>Les gjennom stegene. En lignende oppgave kommer tilbake senere.`;
    finish();
  });
  q('next').addEventListener('click',()=>{newTask();if(!task.choices)q('ans').focus({preventScroll:true});});
  let armed=false;
  q('reset').addEventListener('click',e=>{
    const b=e.currentTarget;
    if(!armed){armed=true;b.textContent='Sikker? Trykk igjen';setTimeout(()=>{armed=false;b.textContent='Nullstill fremgang';},4000);return;}
    store=blank();streak=0;save();armed=false;b.textContent='Nullstill fremgang';renderMastery();newTask();
  });
  if(returning){
    const dues=Object.keys(skills).filter(due);
    const weak=Object.entries(store.boxes).filter(([k])=>skills[k]).sort((a,b)=>a[1]-b[1])[0][0];
    const w=root.querySelector('.welcome');w.hidden=false;
    w.innerHTML=`<b>Velkommen tilbake!</b> Start med noen oppgaver før du ser på teorien. Å hente fram det du har lært, gjør at det sitter bedre. `+
      (dues.length?`Klar for repetisjon: <b>${dues.map(k=>skills[k].name).join(', ')}</b>.`:`Mest å hente på: <b>${skills[weak].name}</b>.`);
  }
  function newTask(){
    const sk=chooseSkill();lastSkill=sk;
    const t=V.pick(skills[sk].gens)();
    task={skill:sk,...t,hintText:t.hints||[],hints:0,tries:0,done:false,lowered:false};
    n++;
    q('skill').textContent=skills[sk].name;q('count').textContent='Oppgave '+n;
    q('prompt').innerHTML=task.prompt;q('fig').innerHTML=task.fig||'';
    q('body').classList.toggle('nofig',!task.fig);q('fig').hidden=!task.fig;
    const isChoice=!!task.choices;
    q('form').hidden=isChoice;
    const ch=q('choices');ch.hidden=!isChoice;ch.innerHTML='';
    if(isChoice){
      task.choices.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='opt';b.innerHTML=c;
        b.addEventListener('click',()=>{if(task.done)return;
          ch.querySelectorAll('.opt').forEach(x=>x.classList.remove('is-no'));
          if(i===task.ok){b.classList.add('is-ok');right();}else{b.classList.add('is-no');wrong(task.diag&&task.diag(i));}});
        ch.appendChild(b);});
    }
    q('unit').innerHTML=task.unit||'';
    const a=q('ans');a.value='';a.disabled=false;q('check').disabled=false;
    q('hints').innerHTML='';q('fb').innerHTML='';q('fb').className='fb';
    const h=q('hint');h.disabled=!task.hintText.length;h.textContent='Gi meg et hint';q('show').hidden=true;
    const nx=q('next');nx.textContent='Ny oppgave';nx.classList.add('ghost');nx.classList.remove('primary');
  }
  renderMastery();newTask();
};

window.V=V;
})();
