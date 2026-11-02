/* src/js/ui/title-screen.js
   Titelbild: Event anwenden, Würfel-Texturen, Anzeige aktualisieren, Start von Läufen. */
function applyTitleEvent(ev){
  const sc=$('#scr-title'),fx=$('#evfx'),be=$('#b-event');
  sc.dataset.ev=ev||'';fx.innerHTML='';fx.className='evfx';
  const evs=$('#evs');if(evs)evs.innerHTML=ev?evSceneHTML(ev):'';
  be.className='btn big vegas'+(ev?' ev-'+ev:'')+(isFresh()?' dis':'');
  if(!ev)return;
  const D=EV_DECO[ev],E=EVENTS[ev];
  be.innerHTML=`<span class="evi">${spr(D.ic[0])}</span><span class="evt"></span><span class="evi r">${spr(D.ic[1])}</span>`;be.querySelector('.evt').textContent=E.name;
  be.style.background=`linear-gradient(180deg,${E.col[0]},${E.col[1]})`;
  fx.classList.add(D.mode);
  for(let k=0;k<D.n;k++){
    const i=document.createElement('i'),z=14+Math.round(Math.random()*10);
    i.style.cssText=`left:${(Math.random()*100).toFixed(0)}%;top:${D.mode==='fly'?(Math.random()*70+5).toFixed(0)+'%':D.mode==='rise'?'100%':'0'};--d:${(9+Math.random()*9).toFixed(1)}s;--dl:${(-Math.random()*14).toFixed(1)}s;--sx:${D.mode==='fly'?(Math.random()*60-30).toFixed(0)+'px':(Math.random()*90-45).toFixed(0)+'px'};--z:${z}px`;
    i.innerHTML=spr(pick(D.fx));fx.appendChild(i);
  }
}


const CUBE_THEMES={
  '':{acc:['#3fd0b0','#f4b942','#8bd450','#ffe27a','#b9a7ff','#e8553d'],base:['#5d577f','#544e78','#645e8a','#4d4872','#58527c'],mortar:'#2a2548',hi:'#7a74a6',spk:'#6d6796'},
  obsidian:{acc:['#b890ff','#8a72e0','#ff5d73','#b890ff','#8a72e0','#ff5d73'],base:['#2c2c3c','#262634','#33334a','#222230','#2a2a3a'],mortar:'#101018',hi:'#4a4a66',spk:'#3a3a52'},
  eis:{acc:['#8fd0e8','#ffffff','#5aa0e8','#cfeaff','#8fd0e8','#ffffff'],base:['#6a90b8','#5f86ae','#7aa0c6','#5a7fa6','#6a8fb6'],mortar:'#2a4a6a',hi:'#a8d0f0',spk:'#9ac0e0'},
  glut:{acc:['#ff8a3d','#ffe27a','#ff5d73','#ff8a3d','#ffe27a','#ff5d73'],base:['#6a3a32','#5f332c','#744238','#582e28','#653730'],mortar:'#2a1210',hi:'#a8624a',spk:'#8a4a3a'},
  smaragd:{acc:['#8bd450','#ffe27a','#3fd0b0','#8bd450','#ffe27a','#3fd0b0'],base:['#3a6a4a','#335f42','#427754','#2f5640','#386548'],mortar:'#14301e',hi:'#6ab07a',spk:'#58a068'},
  gold:{acc:['#ffffff','#ffe27a','#ff8a3d','#ffffff','#ffe27a','#ff8a3d'],base:['#a8843a','#9a7832','#b8924a','#8a6a2a','#a07e38'],mortar:'#4a3410',hi:'#e8c870',spk:'#d4b05a'}
};
function faceTextures(){
  const TH=CUBE_THEMES[(save.cos&&save.cos.cube)||'']||CUBE_THEMES[''];
  const accents=TH.acc;
  const hash=(a,b,c)=>{let h=(a*374761393+b*668265263+c*2147483647)|0;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296;};
  accents.forEach((acc,f)=>{
    const N=32,cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d');if(!c)return;
    const px=(x,y,col)=>{c.fillStyle=col;c.fillRect(x,y,1,1);};
    const base=TH.base;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const r=Math.floor(y/5),off=(r%2)*4,bx=Math.floor((x+off)/9);
      let col=base[Math.floor(hash(bx,r,f)*base.length)];
      if(y%5===4||(x+off)%9===8)col=TH.mortar;
      else if(y%5===0)col=TH.hi;
      else if(hash(x,y,f+9)<.07)col=TH.spk;
      px(x,y,col);
    }
    // vertieftes Feld für die Figur
    for(let y=6;y<26;y++)for(let x=6;x<26;x++){const chk=((x>>2)+(y>>2))%2;px(x,y,chk?'#2c2752':'#252046');}
    for(let i=6;i<26;i++){px(i,6,'#16122c');px(6,i,'#16122c');px(i,25,'#4a4570');px(25,i,'#4a4570');}
    // Moos und Risse
    for(let k=0;k<26;k++){const x=Math.floor(hash(k,1,f+3)*32),y=Math.floor(hash(k,2,f+3)*32);if((x<6||x>25||y<6||y>25)&&hash(k,3,f)<.6)px(x,y,hash(k,4,f)<.5?'#5aa02c':'#3f8a1c');}
    for(let k=0;k<3;k++){let x=Math.floor(hash(k,5,f)*26)+3,y=Math.floor(hash(k,6,f)*4);for(let i=0;i<5;i++){if((x<6||x>25||y<6||y>25))px(x,y,'#1c1838');x+=hash(i,k,f)<.5?0:1;y++;}}
    // Nieten und Edelstein
    for(const [x,y] of [[1,1],[29,1],[1,29],[29,29]]){px(x,y,'#f4b942');px(x+1,y,'#b47a14');px(x,y+1,'#b47a14');px(x+1,y+1,'#8a5a0c');}
    px(15,2,'#ffffff');px(16,2,acc);px(15,3,acc);px(16,3,'#17152b');px(15,29,acc);px(16,29,'#ffffff');px(15,28,'#17152b');px(16,28,acc);
    document.documentElement.style.setProperty('--ft'+(f+1),`url(${cv.toDataURL()})`);
  });
}
function initTitleFx(){
  ['i_arrow','i_dice','i_sun','i_forge','i_scroll','i_book','i_help','i_gear'].forEach(ensureSpr);
  $('#torch-l').innerHTML=spr('i_torch');$('#torch-r').innerHTML=spr('i_torch');
  const cube=$('#cube'),sc=$('#tscene');let rx=-26,ry=24,vx=0,vy=.32,drag=null,tm=0;
  const base=.32;
  const draw=()=>{cube.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;};draw();
  const tick=()=>{
    if($('#scr-title').classList.contains('on')&&!document.hidden){
      if(!drag){ry+=vy;rx+=vx;vy+=(base-vy)*.02;vx+=(0-vx)*.04;rx+=(-26+Math.sin(performance.now()/2300)*14-rx)*.015;}
      draw();
    }
    requestAnimationFrame(tick);
  };
  if(reduceMotion){rx=-24;ry=30;draw();}else requestAnimationFrame(tick);
  sc.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,t:performance.now()};vx=0;try{sc.setPointerCapture(e.pointerId);}catch(_){}});
  sc.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;ry+=dx*.7;rx-=dy*.7;vy=dx*.7;vx=-dy*.7;rx=Math.max(-80,Math.min(80,rx));});
  const up=()=>{if(!drag)return;const quick=performance.now()-drag.t<220;drag=null;if(quick&&Math.abs(vy)<1&&Math.abs(vx)<1){vy=(Math.random()<.5?-1:1)*(14+Math.random()*8);vx=(Math.random()-.5)*10;sfx('flip');}};
  sc.addEventListener('pointerup',up);sc.addEventListener('pointercancel',up);
}
function fitTitle(){
  const sc=$('#scr-title'),w=$('#twrap');if(!sc||!w||!sc.classList.contains('on'))return;
  w.style.transform='none';
  const avail=sc.clientHeight-16,h=w.offsetHeight;
  if(h>avail&&avail>200)w.style.transform=`scale(${(avail/h).toFixed(3)})`;
}
window.addEventListener('resize',()=>{fitTitle();});
/* Allererster Start: nur Spielen und Einstellungen sind aktiv, der Rest ist grau, bis der erste Lauf vorbei ist */
const isFresh=()=>(save.runs||0)<1&&!save.run;
function updateStats(){
  const fr=isFresh();for(const id of ['b-daily','b-forge','b-q','b-dex','b-help','b-event','b-endless','b-week','b-time','b-login','b-mst','b-ach','b-stat','b-rush','b-souls'])$('#'+id).classList.toggle('dis',fr);tpApply();
  $('#b-cont').hidden=!save.run;$('#b-endless').hidden=false;$('#b-play').textContent=save.run?'Neues Spiel':'Spielen';
  const bd=save.bd[save.diff]||null;
  $('#gsb').innerHTML=spr('i_gs')+'<span>'+fmt(save.gs||0)+'</span>';$('#stats').textContent=(save.runs||0)>=1?'Rang '+mrRank().r+' · '+titleNow():'';
  rollQuests();dailyRoll();
  $('#b-daily').innerHTML='<span>Tageslauf</span><small></small>';$('#b-daily small').textContent=DAILY_RULES[ruleOf()].name;
  $('#q-dot').hidden=!loginPending();
  const ev=activeEvent();$('#b-event').hidden=!ev;if((document.documentElement.dataset.evk||'')!==ev){document.documentElement.dataset.evk=ev;applyTitleEvent(ev);}if(!G||!document.querySelector('#scr-game.on')){const kz=(typeof tpCur!=='undefined'&&tpCur==='d')?'hoelle':(MUSIC_EV[ev]||'gruft');AU.setKind(kz,ZMUS[kz],MOT[kz],PROGS[kz]);AU.sd=60/AU.zm.bpm/4;AU.trans=0;}
  applyUnlocks();
  setTimeout(fitTitle,60);
}
function startGame(endless,daily){
  show('scr-game');
  newRun(false,!!endless,daily||false);
}
/* Boss-Rush: alle 20 Bosse hintereinander, wenig Leben, nach jedem Boss 1 Herz und eine Verstärkung */
function startRush(){
  if(!endGate())return;
  show('scr-game');newRun(false,false,false);
  G.rush=true;G.maxhp=G.hp=Math.min(G.maxhp,4);G.undos=Math.min(G.undos,1);G.depth=5;startLevel();
}
