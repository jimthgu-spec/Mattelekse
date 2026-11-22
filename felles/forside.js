/* Forsiden og fagsidene i Leksehjelp. Leser window.KATALOG (katalog.js).
   Forside.fagvalg(rot)                 forsiden: ett kort per fag + dagens repetisjon på tvers av fag
   Forside.fagside(rot, fagId, base)    fagsiden: modulene gruppert etter trinn og tema
   base = sti fra siden til rotmappa, for eksempel '../'. */
(function(){
'use strict';
const K=window.KATALOG, DAYS=[0,1,2,4,8], DAY=864e5;
function progress(id){
  if(!id)return null;let s=null;
  try{s=JSON.parse(localStorage.getItem(id.includes('-v1')?id:'verksted:'+id)||'null');}catch(e){}
  if(!s||!s.boxes)return null;
  const b=Object.values(s.boxes),frac=b.length?b.reduce((a,x)=>a+x,0)/(4*b.length):0,times=s.times||{};
  const due=Object.keys(s.boxes).some(k=>s.boxes[k]>0&&times[k]&&Date.now()-times[k]>DAYS[s.boxes[k]]*DAY);
  return {frac,due,seen:s.seen||0};
}
const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;};
function today(box,list,base){
  const due=list.filter(m=>!m.kommer&&(progress(m.id)||{}).due);
  if(!due.length)return;
  box.innerHTML='<b>Dagens repetisjon:</b> ';
  due.forEach((m,i)=>{const a=el('a',null,m.tittel);a.href=base+m.fil+'#ov';a.style.color='var(--accent)';box.appendChild(a);if(i<due.length-1)box.appendChild(document.createTextNode(', '));});
  box.appendChild(document.createTextNode('. Noen minutter med oppgaver fra før gjør at det sitter lenger.'));
}
function card(m,base,tagText){
  const li=el('li'),a=el(m.kommer?'div':'a','card'+(m.kommer?' soon':''));
  if(!m.kommer)a.href=base+m.fil;
  a.appendChild(el('h3',null,m.tittel));a.appendChild(el('p',null,m.tekst));
  const meta=el('div','meta');meta.appendChild(el('span','tag',m.kommer?'Kommer':tagText));
  const pr=!m.kommer&&progress(m.id);
  a.appendChild(meta);
  if(pr){
    if(pr.due)meta.appendChild(el('span','tag due','Klar for repetisjon'));
    else if(pr.frac>=.99)meta.appendChild(el('span','tag done','Sitter!'));
    const bar=el('div','bar'),i=el('i');i.style.width=Math.round(pr.frac*100)+'%';bar.appendChild(i);a.appendChild(bar);
  }
  li.appendChild(a);return li;
}
window.Forside={
  progress,
  fagvalg(root){
    today(document.getElementById('today'),K.moduler,'');
    const ul=el('ul','list');root.appendChild(ul);
    K.fag.forEach(f=>{
      const mods=K.moduler.filter(m=>m.fag===f.id&&!m.kommer);
      const prs=mods.map(m=>progress(m.id)).filter(Boolean);
      const li=el('li'),a=el('a','card fagcard');a.href=f.id+'/index.html';
      const ic=el('div','fagicon');ic.innerHTML=f.ikon;ic.style.setProperty('--k',f.farge);a.appendChild(ic);
      const d=el('div');d.appendChild(el('h3',null,f.navn));d.appendChild(el('p',null,f.tekst));
      const meta=el('div','meta');
      meta.appendChild(el('span','tag',mods.length+(mods.length===1?' modul · ':' moduler · ')+[...f.trinn].sort((a,b)=>a-b).map(t=>t+'.').join(', ').replace(/, ([^,]*)$/,' og $1')+' trinn'));
      if(prs.some(p=>p.due))meta.appendChild(el('span','tag due','Klar for repetisjon'));
      if(prs.length)meta.appendChild(el('span','tag done','Startet på '+prs.length));
      d.appendChild(meta);a.appendChild(d);li.appendChild(a);ul.appendChild(li);
    });
  },
  fagside(root,fagId,base){
    const f=K.fag.find(x=>x.id===fagId),mods=K.moduler.filter(m=>m.fag===fagId);
    today(document.getElementById('today'),mods,base);
    const trinn=[...new Set(mods.map(m=>m.trinn))];
    if(trinn.length>1){const nav=el('nav','trinnvalg');nav.setAttribute('aria-label','Velg trinn');
      trinn.forEach(t=>{const a=el('a',null,t+'. trinn');a.href='#trinn'+t;nav.appendChild(a);});root.appendChild(nav);}
    trinn.forEach(t=>{
      const tm=mods.filter(m=>m.trinn===t);
      if(trinn.length>1){const h=el('h2','group',t+'. trinn');h.id='trinn'+t;h.style.fontSize='1.3rem';h.style.color='var(--ink)';root.appendChild(h);}
      for(const tema of [...new Set(tm.map(m=>m.tema))]){
        if(tema!=='Kommer'||trinn.length===1)root.appendChild(el('h2','group',tema));
        const ul=el('ul','list');root.appendChild(ul);
        let list=tm.filter(m=>m.tema===tema);
        if(fagId==='matematikk')list=list.slice().sort((x,y)=>Math.min(...x.mal)-Math.min(...y.mal));
        list.forEach(m=>ul.appendChild(card(m,base,
          m.kommer?'':(typeof (m.mal||[])[0]==='number'?'Mål '+[...m.mal].sort((x,y)=>x-y).join(' og '):(m.mal||[]).join(' · ')))));
      }
    });
  }
};
})();
