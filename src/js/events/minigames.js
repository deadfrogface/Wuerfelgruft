/* src/js/events/minigames.js
   Minispiele der Events. */
/* ================= Event-Minispiele ================= */
const MINI_TXT={
  halloween:{t:'Geisterjagd',d:'Geister tauchen aus den Gräbern auf. Tippe sie an, bevor sie verschwinden. Lass die Kürbisse in Ruhe, die kosten Punkte.'},
  xmas:{t:'Geschenke-Memory',d:'Finde alle Paare gleicher Geschenke. Du hast nur wenige Züge.'},
  easter:{t:'Eiersuche',d:'Tippe die Büsche an. Eine Zahl zeigt, wie viele Eier in den Nachbarfeldern liegen. Du darfst nur wenige Büsche ohne Ei aufdecken.'},
  valentine:{t:'Amors Pfeil',d:'Stoppe den Pfeil im grünen Bereich. Mit jeder Runde wird er schneller und die Zone kleiner.'},
  italy:{t:'Pizza-Belag',d:'Merke dir die Reihenfolge der Zutaten und tippe sie nach. Mit jeder Zutat wird die Reihe länger.'},
  hungary:{t:'Csárdás-Rhythmus',d:'Noten fallen in drei Bahnen. Tippe die Bahn, wenn die Note die Linie berührt.'},
  birthday:{t:'Kerzen löschen',d:'Ein Tipp schaltet eine Kerze und ihre Nachbarn um. Lösche alle Kerzen mit wenigen Zügen.'}
};
const MINI_R={
  halloween:['Fange 12 Geister in 25 Sekunden.','Fange 18 Geister in 25 Sekunden.','Fange 24 Geister in 25 Sekunden.'],
  xmas:['6 Paare, 14 Züge.','8 Paare, 18 Züge.','10 Paare, 22 Züge.'],
  easter:['4 Eier im 5×5-Feld.','6 Eier im 6×6-Feld.','8 Eier im 7×7-Feld.'],
  valentine:['4 von 6 Schüssen treffen.','4 von 6 Schüssen treffen, kleinere Zone.','5 von 6 Schüssen treffen, winzige Zone.'],
  italy:['Reihe von 5 Zutaten.','Reihe von 7 Zutaten.','Reihe von 9 Zutaten.'],
  hungary:['20 Noten, 60 % treffen.','28 Noten, 70 % treffen.','36 Noten, 80 % treffen.'],
  birthday:['3×3 Kerzen.','4×4 Kerzen.','5×5 Kerzen.']
};
let miniT=[],miniRaf=0;
function miniClear(){miniT.forEach(t=>{clearTimeout(t);clearInterval(t);});miniT=[];cancelAnimationFrame(miniRaf);}
const mTO=(f,ms)=>{const t=setTimeout(f,ms);miniT.push(t);return t;};
const mIV=(f,ms)=>{const t=setInterval(f,ms);miniT.push(t);return t;};
function openMini(id){
  miniClear();
  const cls=save.cls||'krieger',p=(save.evp&&save.evp[id])||0,done=!!(save.evs&&save.evs[id]);
  $('#ev-title').textContent=MINI_TXT[id].t;
  $('#ev-body').innerHTML=`<div style="text-align:center"><div style="transform:scale(1.6);margin:26px 0 22px;display:inline-block">${spr(heroId(save.diff,cls,done?id:''))}</div></div><p>${MINI_TXT[id].d}</p><p>${done?'Skin freigeschaltet: <b>'+EVSK[id][cls].n+'</b>':'Gewinne alle drei Runden für den Skin <b>'+EVSK[id][cls].n+'</b>.'}</p><div class="cards">`+[1,2,3].map(r=>`<button class="card" data-r="${r}" ${r>p+1&&!done?'disabled':''}><div><b>Runde ${r}${(done||r<=p)?' ✓':''}</b><span>${MINI_R[id][r-1]}</span></div></button>`).join('')+'</div>';
  $$('#ev-body .card').forEach(b=>b.addEventListener('click',()=>{sfx('card');miniRun(id,+b.dataset.r);}));
  openModal('m-event');
}
function miniRun(id,r){
  miniClear();
  $('#ev-title').textContent=MINI_TXT[id].t;
  $('#ev-body').innerHTML=`<p><b>Runde ${r}</b> · <span id="mg-info"></span></p><div id="mg"></div>`;
  let ended=false;
  MINI[id](r,$('#mg'),$('#mg-info'),win=>{if(ended)return;ended=true;miniEnd(id,r,win);});
}
function miniEnd(id,r,win){
  miniClear();
  const cls=save.cls||'krieger';let extra='';
  if(win){
    if(!save.evp)save.evp={};if(!save.evs)save.evs={};
    if(r>(save.evp[id]||0))save.evp[id]=r;
    if(r===3&&!save.evs[id]){save.evs[id]=true;extra='<p>Event-Skin freigeschaltet: <b>'+EVSK[id][cls].n+'</b></p>';sfx('win');}
    else sfx('coin');
    persist();
  }else sfx('hurt');
  $('#ev-body').innerHTML=`<h3 style="text-align:center">${win?'Geschafft!':'Leider nicht.'}</h3>${extra}<div class="stack">${win&&r<3?'<button class="btn" id="mi-next">Nächste Runde</button>':''}<button class="btn ${win&&r<3?'ghost':''}" id="mi-again">Nochmal</button><button class="btn ghost" id="mi-back">Zurück</button></div>`;
  if($('#mi-next'))$('#mi-next').addEventListener('click',()=>{sfx('click');miniRun(id,r+1);});
  $('#mi-again').addEventListener('click',()=>{sfx('click');miniRun(id,r);});
  $('#mi-back').addEventListener('click',()=>{sfx('click');openMini(id);});
}
const MINI={
  halloween(r,el,info,end){
    const goal=[12,18,24][r-1],vis=[1000,820,660][r-1],gap=[850,680,540][r-1];let sc=0,left=25;
    el.innerHTML='<div class="mg g3">'+Array.from({length:9},()=>'<button class="mc"></button>').join('')+'</div>';
    const cells=[...el.querySelectorAll('.mc')];
    const upd=()=>{info.textContent=`Punkte: ${sc} von ${goal} · Zeit: ${left}`;};upd();
    cells.forEach(c=>c.addEventListener('pointerdown',()=>{
      if(c._k==='g'){sc++;sfx('coin');}else if(c._k==='p'){sc=Math.max(0,sc-3);sfx('hurt');}else return;
      c._k=null;c.innerHTML='';upd();}));
    mIV(()=>{left--;upd();if(left<=0)end(sc>=goal);},1000);
    mIV(()=>{const free=cells.filter(c=>!c._k);if(!free.length)return;const c=pick(free),g=Math.random()>.28;c._k=g?'g':'p';c.innerHTML=spr(g?'ghost':'e_kuerbis');mTO(()=>{c._k=null;c.innerHTML='';},vis);},gap);
  },
  xmas(r,el,info,end){
    const pairs=[6,8,10][r-1],limit=[14,18,22][r-1],cols=r===3?5:4;
    const ico=shuffle(['e_geschenk','e_kuerbis','e_ei','e_pizza','e_paprika','e_kuchen','e_rose','e_espresso','s-coin','s-heart']).slice(0,pairs);
    const deck=shuffle([...ico,...ico]);el._deck=deck;let open=[],moves=0,found=0,lock=false;
    el.innerHTML=`<div class="mg" style="grid-template-columns:repeat(${cols},1fr)">`+deck.map(()=>'<button class="mc"></button>').join('')+'</div>';
    const cells=[...el.querySelectorAll('.mc')];
    const upd=()=>{info.textContent=`Züge: ${moves} von ${limit}`;};upd();
    cells.forEach((c,i)=>c.addEventListener('click',()=>{
      if(lock||c.classList.contains('on')||c.classList.contains('ok'))return;
      sfx('click');c.classList.add('on');c.innerHTML=spr(deck[i]);open.push(i);
      if(open.length===2){
        moves++;upd();lock=true;const [a,b]=open;
        if(deck[a]===deck[b]){cells[a].classList.add('ok');cells[b].classList.add('ok');open=[];lock=false;found++;sfx('coin');if(found===pairs)mTO(()=>end(true),500);else if(moves>=limit)mTO(()=>end(false),500);}
        else mTO(()=>{for(const k of [a,b]){cells[k].classList.remove('on');cells[k].innerHTML='';}open=[];lock=false;if(moves>=limit)end(false);},650);
      }
    }));
  },
  easter(r,el,info,end){
    const n=[5,6,7][r-1],eggs=[4,6,8][r-1],limit=[14,16,20][r-1];
    const egg=new Set();while(egg.size<eggs)egg.add(rnd(n*n));
    const near=i=>{let c=0;const x=i%n,y=Math.floor(i/n);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&X<n&&Y>=0&&Y<n&&egg.has(Y*n+X))c++;}return c;};
    el.innerHTML=`<div class="mg" style="grid-template-columns:repeat(${n},1fr)">`+Array.from({length:n*n},()=>'<button class="mc sm"></button>').join('')+'</div>';
    el._egg=egg;const cells=[...el.querySelectorAll('.mc')];let found=0,miss=0;
    const upd=()=>{info.textContent=`Eier: ${found} von ${eggs} · Fehlversuche: ${miss} von ${limit}`;};upd();
    cells.forEach((c,i)=>{c.innerHTML='<span class="bush"></span>';c.addEventListener('click',()=>{
      if(c.classList.contains('ok'))return;c.classList.add('ok');
      if(egg.has(i)){c.innerHTML=spr('e_ei');found++;sfx('coin');if(found===eggs)mTO(()=>end(true),500);}
      else{const k=near(i);c.innerHTML=`<b class="nm n${k}">${k||'·'}</b>`;miss++;sfx('click');if(miss>limit)mTO(()=>end(false),400);}
      upd();});});
  },
  valentine(r,el,info,end){
    const need=[4,4,5][r-1],w=[.26,.18,.12][r-1],spd=[.9,1.25,1.7][r-1],shots=6;let hit=0,used=0,cen=.5,t0=performance.now(),dead=false;
    el.innerHTML=`<div class="bar"><i class="zone"></i><i class="mark"></i></div><button class="btn big" id="mg-shot">Schuss</button>`;
    const zone=el.querySelector('.zone'),mark=el.querySelector('.mark');
    const place=()=>{cen=.12+Math.random()*.76;zone.style.left=(cen-w/2)*100+'%';zone.style.width=w*100+'%';};place();
    const pos=()=>{const t=((performance.now()-t0)/1000*spd)%2;return t<1?t:2-t;};
    const upd=()=>{info.textContent=`Treffer: ${hit} von ${need} · Schüsse: ${used} von ${shots}`;};upd();
    const loop=()=>{mark.style.left=pos()*100+'%';if(!dead)miniRaf=requestAnimationFrame(loop);};loop();
    el.querySelector('#mg-shot').addEventListener('pointerdown',()=>{
      if(dead)return;const p=pos();used++;
      if(Math.abs(p-cen)<=w/2){hit++;sfx('coin');zone.classList.add('hit');}else{sfx('hurt');zone.classList.add('miss');}
      setTimeout(()=>zone.classList.remove('hit','miss'),250);upd();
      if(hit>=need){dead=true;mTO(()=>end(true),400);}else if(used>=shots||used-hit>shots-need){dead=true;mTO(()=>end(false),400);}else place();});
  },
  italy(r,el,info,end){
    const len=[5,7,9][r-1],ms=[650,540,440][r-1];
    const tops=['t_salami','t_basil','t_pilz','t_olive','t_kaese','t_tomate'];
    el.innerHTML='<div class="mg g3">'+tops.map((t,i)=>`<button class="mc" data-i="${i}">${spr(t)}</button>`).join('')+'</div>';
    const cells=[...el.querySelectorAll('.mc')];const seq=[];el._seq=seq;let inp=0,busy=true;
    const flash=(i)=>{cells[i].classList.add('on');sfx('click');mTO(()=>cells[i].classList.remove('on'),ms*.6);};
    const show=()=>{busy=true;info.textContent=`Zutaten: ${seq.length} von ${len} · Merken`;seq.forEach((s,k)=>mTO(()=>flash(s),600+k*ms));mTO(()=>{busy=false;inp=0;info.textContent=`Zutaten: ${seq.length} von ${len} · Du bist dran`;},600+seq.length*ms);};
    const next=()=>{seq.push(rnd(6));show();};
    cells.forEach((c,i)=>c.addEventListener('pointerdown',()=>{
      if(busy)return;flash(i);
      if(seq[inp]!==i){busy=true;sfx('hurt');mTO(()=>end(false),500);return;}
      inp++;if(inp===seq.length){busy=true;if(seq.length===len)mTO(()=>end(true),500);else mTO(next,700);}}));
    mTO(next,500);
  },
  hungary(r,el,info,end){
    const N=[20,28,36][r-1],beat=[620,540,470][r-1],need=Math.ceil(N*[.6,.7,.8][r-1]),T=1500,H=240,win=170;
    const notes=Array.from({length:N},(_,i)=>({t:1800+i*beat,l:rnd(3),done:0}));
    el.innerHTML=`<div class="lanes" style="height:${H}px">`+[0,1,2].map(()=>'<div class="lane"></div>').join('')+'<i class="hitline"></i></div><div class="mg g3">'+[0,1,2].map(i=>`<button class="mc ln" data-l="${i}">♪</button>`).join('')+'</div>';
    const lanes=[...el.querySelectorAll('.lane')],t0=performance.now();let hits=0,done=0,dead=false;
    const upd=()=>{info.textContent=`Treffer: ${hits} von ${need} · Noten: ${done} von ${N}`;};upd();
    for(const nt of notes){nt.el=document.createElement('i');nt.el.className='note';lanes[nt.l].appendChild(nt.el);}
    const loop=()=>{const now=performance.now()-t0;
      for(const nt of notes){if(nt.done)continue;const y=(now-(nt.t-T))/T*(H-14);nt.el.style.top=Math.max(-20,y)+'px';nt.el.style.opacity=y<-14?0:1;
        if(now-nt.t>win){nt.done=2;nt.el.remove();done++;upd();}}
      if(done>=N&&!dead){dead=true;end(hits>=need);return;}
      if(!dead)miniRaf=requestAnimationFrame(loop);};loop();
    el.querySelectorAll('.ln').forEach(b=>b.addEventListener('pointerdown',()=>{
      const l=+b.dataset.l,now=performance.now()-t0;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),90);
      const c=notes.filter(nt=>!nt.done&&nt.l===l&&Math.abs(nt.t-now)<=win).sort((a,b)=>Math.abs(a.t-now)-Math.abs(b.t-now))[0];
      if(c){c.done=1;c.el.remove();hits++;done++;sfx('coin');upd();}else sfx('block');}));
  },
  birthday(r,el,info,end){
    const n=[3,4,5][r-1],pres=[4,6,8][r-1],limit=pres+[5,6,7][r-1];
    let st=Array(n*n).fill(0);const tog=(s,i)=>{const x=i%n,y=Math.floor(i/n);for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&X<n&&Y>=0&&Y<n)s[Y*n+X]^=1;}};
    const idx=shuffle([...Array(n*n).keys()]).slice(0,pres);for(const i of idx)tog(st,i);
    if(st.every(v=>!v))tog(st,0);
    el.innerHTML=`<div class="mg" style="grid-template-columns:repeat(${n},1fr)">`+st.map(()=>'<button class="mc"></button>').join('')+'</div>';
    el._st=st;el._n=n;const cells=[...el.querySelectorAll('.mc')];let moves=0;
    const paint=()=>{cells.forEach((c,i)=>{c.classList.add('cnd');c.innerHTML=spr('e_kuchen');c.classList.toggle('lit',!!st[i]);});info.textContent=`Kerzen: ${st.filter(Boolean).length} · Züge: ${moves} von ${limit}`;};paint();
    cells.forEach((c,i)=>c.addEventListener('click',()=>{tog(st,i);moves++;sfx('click');paint();
      if(st.every(v=>!v)){mTO(()=>end(true),400);}else if(moves>=limit)mTO(()=>end(false),400);}));
  }
};
$('#ev-ok').addEventListener('click',()=>{sfx('click');miniClear();closeModal('m-event');updateStats();});
const VG_BANK=400,VG_STAKES=[10,25,50,100,250],VG_TABLES={bj:'Blackjack',dice:'Gezinkte Würfel',rou:'Roulette'};
const VG_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
let vgStake=10,vgSt=null;
function vgInit(){
  if(!save.vg)save.vg={banks:{bj:VG_BANK,dice:VG_BANK,rou:VG_BANK},cleared:{},welcome:false,won:false};
  if(!save.perk)save.perk={};if(!save.evs)save.evs={};
  return save.vg;
}
function vgBack(){vgSt=null;openVegas();}
function vgSettle(t,delta){
  const v=save.vg;save.gs=(save.gs||0)+delta;
  if(delta>0)v.banks[t]=Math.max(0,v.banks[t]-delta);else v.banks[t]=Math.min(VG_BANK,v.banks[t]-delta);
  if(v.banks[t]<=0&&!v.cleared[t]){v.cleared[t]=true;toast('Tisch abgeräumt: '+VG_TABLES[t]);sfx('win');}
  persist();
}
function vgChips(t,need){
  const gs=save.gs||0;
  return '<div class="vg-chips">'+VG_STAKES.map(n=>`<button data-n="${n}" class="${vgStake===n?'on':''}" ${gs<n*need?'disabled':''}>${n}</button>`).join('')+'</div>';
}
function vgBindChips(t,need){
  $$('#vg-body .vg-chips button').forEach(b=>b.addEventListener('click',()=>{sfx('click');vgStake=+b.dataset.n;vgRender(t);}));
  const gs=save.gs||0;if(gs<vgStake*need){const ok=[...VG_STAKES].reverse().find(n=>gs>=n*need);if(ok){vgStake=ok;}}
}
const cardTxt=c=>{const r=1+(c%13),su='♠♥♦♣'[Math.floor(c/13)];return {t:({1:'A',11:'J',12:'Q',13:'K'}[r]||r)+su,red:su==='♥'||su==='♦'};};
const cardVal=c=>{const r=1+(c%13);return r===1?11:Math.min(10,r);};
function handVal(h){let v=h.reduce((a,c)=>a+cardVal(c),0),a=h.filter(c=>c%13===0).length;while(v>21&&a>0){v-=10;a--;}return v;}
const cardEl=(c,hide)=>{if(hide)return '<span class="cd back">?</span>';const x=cardTxt(c);return `<span class="cd${x.red?' red':''}">${x.t}</span>`;};
const VG_WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
let vgBusy=false;
const pcEl=(c,o={})=>{const x=cardTxt(c),rk=x.t.slice(0,-1),su=x.t.slice(-1);return `<span class="pc${o.down?' down':''}${o.nw?' nw':''}" style="--dl:${o.dl||0}s"><span class="in"><span class="f${x.red?' red':''}"><b>${rk}</b><i>${su}</i></span><span class="bk"></span></span></span>`;};
function vgWheelSVG(rot){
  const R=100,r1=74,n=37,st=360/n;let p='';
  const pt=(a,r)=>{const t=(a-90)*Math.PI/180;return [(R+r*Math.cos(t)).toFixed(1),(R+r*Math.sin(t)).toFixed(1)];};
  VG_WHEEL.forEach((num,i)=>{
    const a0=i*st-st/2,a1=i*st+st/2,A=pt(a0,R-4),B=pt(a1,R-4),C=pt(a1,r1),D=pt(a0,r1),col=num===0?'#2f8a44':VG_RED.has(num)?'#c8302d':'#1c1a2e';
    p+=`<path d="M${A} A${R-4} ${R-4} 0 0 1 ${B} L${C} A${r1} ${r1} 0 0 0 ${D} Z" fill="${col}" stroke="#e8c070" stroke-width=".7"/>`;
    const T=pt(i*st,R-14);p+=`<text x="${T[0]}" y="${T[1]}" fill="#f4efe0" font-size="8" font-weight="800" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i*st} ${T[0]} ${T[1]})">${num}</text>`;
  });
  return `<div class="vg-wheel"><div class="vg-pointer"></div><svg id="vg-wh" viewBox="0 0 200 200" style="transform:rotate(${rot||0}deg)"><circle cx="100" cy="100" r="98" fill="#6a3b1a" stroke="#c98a4b" stroke-width="3"/>${p}<circle cx="100" cy="100" r="${r1-2}" fill="#2a1a10" stroke="#e8c070" stroke-width="2"/><circle cx="100" cy="100" r="16" fill="#e8c070"/><path d="M100 84v32M84 100h32" stroke="#6a3b1a" stroke-width="4"/></svg><div class="vg-orb" id="vg-orb"><i></i></div></div>`;
}
function vgRender(t){
  const v=save.vg,gs=save.gs||0,bank=v.banks[t];
  let h=`<div class="vg-neon">${VG_TABLES[t]}</div><p>Gruftsteine: <b style="color:var(--gold)">${gs}</b> · Bank: <b>${bank}</b> von ${VG_BANK}</p><div class="vg-bar"><i style="width:${bank/VG_BANK*100}%"></i></div>`;
  if(t==='bj'){
    const S=vgSt,live=S&&!S.over;
    const hand=(cards,who,hideSecond)=>cards.map((c,i)=>{
      const seen=who==='p'?S.sp:S.sd,nw=i>=seen,k=i-seen;
      const dl=S.first?(who==='p'?i*.36:i*.36+.18):k*.32;
      return pcEl(c,{down:hideSecond&&i===1,nw,dl});
    }).join('');
    if(S){
      h+=`<div class="vg-felt"><div class="vg-deck"></div><div class="vg-lab">Croupier${S.over?' · '+handVal(S.d):''}</div><div class="vg-hand">${hand(S.d,'d',live)}</div><div class="vg-res" style="--rd:${S.rd||0}s">${S.msg||''}</div><div class="vg-hand">${hand(S.p,'p',false)}</div><div class="vg-lab">Du · ${handVal(S.p)}</div></div>`;
    }else h+='<div class="vg-felt"><div class="vg-deck"></div><p style="color:#cfe8d8;margin:30px 0 60px;text-align:center">Schlage den Croupier: nah an 21, ohne drüber. Blackjack zahlt 3:2.</p></div>';
    if(!live)h+='<p>Einsatz</p>'+vgChips(t,1)+`<button class="btn" id="vg-go" ${gs<vgStake?'disabled':''}>Austeilen</button>`;
    else h+=`<div class="stack"><button class="btn" id="vg-hit">Noch eine Karte</button><button class="btn ghost" id="vg-stand">Passen</button></div>`;
  }else if(t==='dice'){
    const S=vgSt;
    h+=`<div class="vg-felt vg-craps"><div class="vg-lab">Du</div><div class="vg-hand vg-dice" id="vg-dp">${S?S.p.map(n=>dieHTML(n,'#ffe27a')).join('')+`<b>${S.p[0]+S.p[1]}</b>`:dieHTML(1,'#ffe27a','ghost')+dieHTML(1,'#ffe27a','ghost')}</div><div class="vg-res" style="--rd:.2s">${S?S.msg:''}</div><div class="vg-lab">Knöchel-Karl</div><div class="vg-hand vg-dice" id="vg-db">${S?S.b.map(n=>dieHTML(n,'#e9dfc8')).join('')+`<b>${S.b[0]+S.b[1]}</b>`:dieHTML(1,'#e9dfc8','ghost')+dieHTML(1,'#e9dfc8','ghost')}</div></div>`;
    if(!S)h+='<p>Du und Knöchel-Karl würfelt zwei Würfel, die höhere Summe gewinnt. Du kannst zinken: besser, aber Karl erwischt dich manchmal und du zahlst das Doppelte.</p>';
    h+='<p>Einsatz</p>'+vgChips(t,2)+`<div class="stack"><button class="btn" id="vg-fair" ${gs<vgStake?'disabled':''}>Ehrlich würfeln</button><button class="btn gold" id="vg-cheat" ${gs<vgStake*2?'disabled':''}>Zinken</button></div>`;
  }else{
    const S=vgSt||{pick:'red',num:7};
    h+=`<div class="vg-felt vg-rou">${vgWheelSVG(S.rot)}<div class="vg-ball" id="vg-bn" style="color:${S.res===undefined?'transparent':S.res===0?'#8bd450':VG_RED.has(S.res)?'#ff5d73':'#e9dfc8'}">${S.res===undefined?'–':S.res}</div><div class="vg-res" id="vg-rs">${S.res!==undefined?S.msg:''}</div></div>`;
    if(S.res===undefined)h+='<p>Setze auf Rot, Schwarz (zahlt 1:1) oder eine Zahl (zahlt 35:1). Die Null gehört dem Haus.</p>';
    h+='<p>Einsatz</p>'+vgChips(t,1)+`<div class="vg-chips"><button data-p="red" class="rd ${S.pick==='red'?'on':''}">Auf Rot</button><button data-p="black" class="bk ${S.pick==='black'?'on':''}">Auf Schwarz</button><button data-p="num" class="${S.pick==='num'?'on':''}">Auf Zahl ${S.num}</button></div>${S.pick==='num'?'<div class="vg-chips"><button id="vg-m">−</button><button id="vg-p">+</button></div>':''}<button class="btn" id="vg-go" ${gs<vgStake?'disabled':''}>Drehen</button>`;
  }
  h+='<div class="stack" style="margin-top:10px"><button class="btn ghost" id="vg-hub">Zurück zum Saal</button></div>';
  $('#vg-body').innerHTML=h;
  if(t==='bj'&&vgSt){const S=vgSt;S.sp=S.p.length;S.sd=S.d.length;S.first=false;
    $$('#vg-body .pc.nw').forEach(el=>{const d=parseFloat(el.style.getPropertyValue('--dl'))||0;setTimeout(()=>sfx('card'),d*1000+80);});}
  vgBindChips(t,t==='dice'?2:1);
  $('#vg-hub').addEventListener('click',()=>{if(vgBusy)return;sfx('click');vgBack();});
  const go=id=>$('#'+id);
  if(t==='bj'){
    const S=vgSt;
    if(!S||S.over)go('vg-go')&&go('vg-go').addEventListener('click',()=>{
      if(vgBusy)return;sfx('card');const dr=()=>Math.floor(Math.random()*52);
      vgSt={p:[dr(),dr()],d:[dr(),dr()],stake:vgStake,over:false,msg:'',sp:0,sd:0,first:true};
      const pb=handVal(vgSt.p)===21,db=handVal(vgSt.d)===21;
      if(pb||db){vgSt.over=true;vgSt.rd=1.2;if(pb&&!db){const w=Math.floor(vgStake*1.5);vgSt.msg='Blackjack! +'+w;vgSettle('bj',w);}else if(db&&!pb){vgSt.msg='Der Croupier hat Blackjack. −'+vgStake;vgSettle('bj',-vgStake);}else vgSt.msg='Beide Blackjack. Unentschieden.';}
      vgRender('bj');
    });
    else{
      const fin=async()=>{
        if(vgBusy)return;vgBusy=true;
        const S=vgSt,pv=handVal(S.p);
        const hole=$('#vg-body .pc.down');if(hole){hole.classList.remove('down');sfx('card');await sleep(650);}
        S.over=true;let extra=0;
        if(pv>21){S.msg='Drüber. −'+S.stake;vgSettle('bj',-S.stake);}
        else{while(handVal(S.d)<17){S.d.push(Math.floor(Math.random()*52));extra++;}const dv=handVal(S.d);
          if(dv>21||pv>dv){S.msg='Gewonnen! +'+S.stake;vgSettle('bj',S.stake);}else if(pv<dv){S.msg='Verloren. −'+S.stake;vgSettle('bj',-S.stake);}else S.msg='Unentschieden.';}
        S.rd=extra*.32+.5;
        vgBusy=false;vgRender('bj');
        if(S.msg[0]==='G')setTimeout(()=>sfx('coin'),S.rd*1000);else if(S.msg[0]==='V'||S.msg[0]==='D')setTimeout(()=>sfx('hit'),S.rd*1000);
      };
      go('vg-hit').addEventListener('click',()=>{if(vgBusy)return;sfx('card');vgSt.p.push(Math.floor(Math.random()*52));if(handVal(vgSt.p)>=21)fin();else vgRender('bj');});
      go('vg-stand').addEventListener('click',()=>{sfx('click');fin();});
    }
  }else if(t==='dice'){
    const roll=async cheat=>{
      if(vgBusy)return;vgBusy=true;sfx('key');
      const mine=()=>cheat?(Math.random()<.3?6:1+Math.floor(Math.random()*5)):1+Math.floor(Math.random()*6);
      const p=[mine(),mine()],b=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
      const S={p,b,msg:''};
      if(cheat&&Math.random()<.06){S.msg='Karl hat dich erwischt! −'+vgStake*2;vgSettle('dice',-vgStake*2);}
      else{const a=p[0]+p[1],c=b[0]+b[1];if(a>c){S.msg='Gewonnen! +'+vgStake;vgSettle('dice',vgStake);}else if(a<c){S.msg='Verloren. −'+vgStake;vgSettle('dice',-vgStake);}else S.msg='Unentschieden.';}
      const rn=()=>1+Math.floor(Math.random()*6);
      for(let k=0;k<11;k++){
        const A=$('#vg-dp'),B=$('#vg-db');if(!A||!B)break;
        A.innerHTML=dieHTML(rn(),'#ffe27a','tumble')+dieHTML(rn(),'#ffe27a','tumble');B.innerHTML=dieHTML(rn(),'#e9dfc8','tumble')+dieHTML(rn(),'#e9dfc8','tumble');
        if(k%3===0)sfx('click');await sleep(85);
      }
      vgSt=S;vgBusy=false;vgRender('dice');
      setTimeout(()=>sfx(S.msg[0]==='G'?'coin':'hit'),250);
    };
    go('vg-fair').addEventListener('click',()=>roll(false));go('vg-cheat').addEventListener('click',()=>roll(true));
  }else{
    const S=vgSt||(vgSt={pick:'red',num:7});
    $$('#vg-body .vg-chips button[data-p]').forEach(b=>b.addEventListener('click',()=>{if(vgBusy)return;sfx('click');S.pick=b.dataset.p;S.res=undefined;vgRender('rou');}));
    if(go('vg-m'))go('vg-m').addEventListener('click',()=>{if(vgBusy)return;sfx('click');S.num=(S.num+36)%37;vgRender('rou');});
    if(go('vg-p'))go('vg-p').addEventListener('click',()=>{if(vgBusy)return;sfx('click');S.num=(S.num+1)%37;vgRender('rou');});
    go('vg-go').addEventListener('click',async()=>{
      if(vgBusy)return;vgBusy=true;sfx('key');
      const r=Math.floor(Math.random()*37),i=VG_WHEEL.indexOf(r),st=360/37;
      const win=S.pick==='num'?r===S.num:r!==0&&(S.pick==='red')===VG_RED.has(r);
      const pay=S.pick==='num'?vgStake*35:vgStake;
      S.res=r;S.msg=win?'Gewonnen! +'+pay:'Verloren. −'+vgStake;
      if(win)vgSettle('rou',pay);else vgSettle('rou',-vgStake);
      const old=S.rot||0,fin=360*(Math.floor(old/360)+6)-i*st;
      const wh=$('#vg-wh'),orb=$('#vg-orb');$('#vg-bn').style.color='transparent';
      $$('#vg-body button').forEach(b=>b.disabled=true);
      const dur=4200;
      if(wh&&wh.animate){
        wh.animate([{transform:`rotate(${old}deg)`},{transform:`rotate(${fin}deg)`}],{duration:dur,easing:'cubic-bezier(.12,.6,.18,1)',fill:'forwards'});
        orb.animate([{transform:'rotate(0deg)'},{transform:'rotate(-2520deg)'}],{duration:dur,easing:'cubic-bezier(.2,.5,.2,1)',fill:'forwards'});
        orb.firstElementChild.animate([{transform:'translateY(0)'},{transform:'translateY(0)',offset:.72},{transform:'translateY(26px)'}],{duration:dur,easing:'ease-in',fill:'forwards'});
        for(let k=0;k<14;k++)setTimeout(()=>sfx('click'),300+k*k*16+k*70);
        await sleep(dur+150);
      }
      S.rot=fin;vgBusy=false;vgRender('rou');
      sfx(win?'coin':'hit');
    });
  }
  if(!save.vg.won&&Object.keys(VG_TABLES).every(k=>save.vg.cleared[k]))vgAce();
}
function vgAce(){
  const v=save.vg;v.won=true;save.perk.sd=true;save.evs.vegas=true;save.trophy=Object.assign(save.trophy||{},{ace:true});persist();
  sfx('win');
  $('#vg-body').innerHTML=`<div style="text-align:center"><div style="transform:scale(3);margin:36px 0 28px;display:inline-block">${spr('ace')}</div><h3>Ace</h3><p>Du hast alle drei Tische abgeräumt. Das Haus verneigt sich.</p><p><b style="color:var(--gold)">Saving Dice:</b> Wenn du stirbst, würfelst du mit zwei gezinkten Würfeln. Zeigen beide eine 6, überlebst du einmal pro Lauf mit 1 Leben.</p><p>Neuer Skin: <b>Croupier</b> (in der Sammlung unter Aussehen).</p><button class="btn" id="vg-ok">Weiter</button></div>`;
  $('#vg-ok').addEventListener('click',()=>{sfx('click');vgBack();});
}
function openVegas(){
  const v=vgInit();const gs=save.gs||0;
  if(!v.welcome){v.welcome=true;addGS(100);toast('Willkommensbonus: 100 Gruftsteine');}
  let h=`<div class="vg-neon">VEGAS</div><p>Setze deine Gruftsteine. Räume alle drei Tische ab, um die Trophäe <b>Ace</b> zu verdienen.</p><p>Gruftsteine: <b style="color:var(--gold)">${save.gs||0}</b>${v.won?' · Trophäe: <b>Ace</b>':''}</p><div class="cards">`;
  for(const k of Object.keys(VG_TABLES)){
    const done=v.cleared[k];
    h+=`<button class="card vgc" data-t="${k}"><span class="vg-ico ${k}">${k==='bj'?'♠<i>♥</i>':k==='dice'?'⚃':'<i></i>'}</span><div><b>${VG_TABLES[k]}${done?' ✓':''}</b><span>Bank: ${v.banks[k]} von ${VG_BANK}</span></div></button>`;
  }
  h+='</div>';
  $('#vg-body').innerHTML=h;
  $$('#vg-body .card').forEach(b=>b.addEventListener('click',()=>{sfx('card');vgSt=null;vgRender(b.dataset.t);}));
  openModal('m-vegas');
}
$('#vg-close').addEventListener('click',()=>{sfx('click');closeModal('m-vegas');updateStats();});
$('#b-event').addEventListener('click',()=>{AU.unlock();sfx('click');const e=activeEvent();if(e==='vegas')openVegas();else if(e)openMini(e);});
const GEN_ACE=(()=>{
  const g=Array.from({length:16},()=>Array(16).fill(null));
  const card=(x0,y0,w,h)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)g[y][x]=(y===y0||y===y0+h-1||x===x0||x===x0+w-1)?'#17152b':'#f4efe0';};
  const draw=(x0,y0,rows,col)=>rows.forEach((r,j)=>[...r].forEach((c,i)=>{if(c==='x')g[y0+j][x0+i]=col;}));
  card(1,4,8,11);draw(2,8,['..x..','.xxx.','xxxxx','xxxxx','..x..'],'#17152b');
  card(7,1,8,11);draw(8,4,['.x.x.','xxxxx','xxxxx','.xxx.','..x..'],'#e8302d');
  return g;
})();
GEN.ace={grid:GEN_ACE};

const EV_DECO={halloween:{ic:['e_kuerbis','i_bat'],fx:['i_bat','e_kuerbis'],mode:'fly',n:7},xmas:{ic:['e_geschenk','e_geschenk'],fx:['i_flake'],mode:'fall',n:22},vegas:{ic:['i_chip','i_chip'],fx:['i_chip','s-coin'],mode:'fall',n:12},
  easter:{ic:['e_ei','e_ei'],fx:['e_ei'],mode:'fall',n:10},valentine:{ic:['e_rose','e_rose'],fx:['s-heart'],mode:'rise',n:14},hungary:{ic:['e_paprika','e_paprika'],fx:['e_paprika','i_conf'],mode:'fall',n:12},
  italy:{ic:['e_pizza','e_espresso'],fx:['e_pizza','i_conf'],mode:'fall',n:10},birthday:{ic:['e_kuchen','e_kuchen'],fx:['i_conf'],mode:'fall',n:20}};
