/* src/js/ui/title-pager.js
   Titel-Pager: Seiten wechseln, Wischen und Knopf-Belegung. */
function tpApply(){
  const [cx,cy]=TP[tpCur];
  for(const p of Object.keys(TP)){
    const el=$('#tp-'+p);if(!el)continue;const [x,y]=TP[p];
    el.style.transform=`translate(${(x-cx)*100}%,${(y-cy)*100}%)`;
    el.classList.toggle('cur',p===tpCur);
  }
  const nav=$('#tnav');if(!nav)return;nav.innerHTML='';
  for(const id of ['b-week','b-time'])$('#'+id).classList.toggle('lock',!endOpen());
  if(isFresh())return;
  const ICO={l:'chest',r:'i_scroll',u:'i_book',d:'p_glutkern',c:'i_dice'};const lockD=!endOpen();
  const CH={l:'‹',r:'›',u:'⌃',d:'⌄'};
  const mk=(cls,to,chev,ico,name)=>{
    const b=document.createElement('button');b.className='tn '+cls;b.setAttribute('aria-label',name);
    const ic=spr(ico),ch=`<b>${chev}</b>`;
    b.innerHTML=(cls==='r'||cls==='d'||cls==='back'&&chev==='›')?ic+ch:ch+ic;
    if(cls==='d')b.innerHTML=ic+ch;if(cls==='u')b.innerHTML=ch+ic;
    b.addEventListener('click',()=>tpGo(to));nav.appendChild(b);
  };
  ensureSpr('chest');ensureSpr('p_glutkern');
  if(tpCur==='c'){if(unlOk('l'))mk('l','l',CH.l,ICO.l,'Gruftlager');if(unlOk('r'))mk('r','r',CH.r,ICO.r,'Aufgaben');if(unlOk('u'))mk('u','u',CH.u,ICO.u,'Wissen');if(endOpen()||(save.bestDepth||0)>=30)mk('d','d',CH.d,ICO.d,'Abgrund');for(const k of ['l','r','u']){const bn=nav.querySelector('.tn.'+k);if(bn&&!(save.visUnl&&save.visUnl[k]))bn.classList.add('new');}if(lockD){const bd=nav.querySelector('.tn.d');if(bd)bd.classList.add('lock');}}
  else mk('back','c',{l:'›',r:'‹',u:'⌄',d:'⌃'}[tpCur],ICO.c,'Zurück zum Titel');
}
function tpGo(p){
  if(!TP[p])return;if(isFresh()&&p!=='c')return;if(UNL[p]&&!unlGate(p))return;
  if(UNL[p]){if(!save.visUnl)save.visUnl={};if(!save.visUnl[p]){save.visUnl[p]=1;persist();}}if(p==='d'&&!endGate())return;
  tpCur=p;sfx('flip');if(!(G&&document.querySelector('#scr-game.on'))){const kz=p==='d'?'hoelle':(MUSIC_EV[activeEvent()]||'gruft');AU.setKind(kz,ZMUS[kz],MOT[kz],PROGS[kz]);AU.sd=60/AU.zm.bpm/4;AU.trans=0;}
  if(p==='l')openCamp();
  if(p==='d')renderHell();
  tpApply();
  setTimeout(fitTitle,60);
}
/* Wischen: die Richtung ist die Richtung, in die du gehst (links wischen = Lager) */
(function(){
  const sc=$('#scr-title');let st=null;
  /* Der Inhalt folgt dem Finger: nach rechts wischen = linke Seite (Lager), nach unten = obere Seite (Wissen) */
  const nav=(dx,dy)=>{
    const horiz=Math.abs(dx)>Math.abs(dy)*1.05;
    const dir=horiz?(dx>0?'l':'r'):(dy>0?'u':'d');
    if(tpCur==='c')tpGo(dir);else if(TP_BACK[tpCur]===dir)tpGo('c');
  };
  sc.addEventListener('pointerdown',e=>{if(e.target.closest('.cslot,input,select'))return;st={x:e.clientX,y:e.clientY,t:Date.now(),done:false};});
  sc.addEventListener('pointermove',e=>{
    if(!st||st.done)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<44)return;
    st.done=true;if(anyModal())return;nav(dx,dy);
  });
  sc.addEventListener('pointerup',e=>{
    if(!st)return;const s0=st;st=null;if(s0.done||anyModal())return;
    const dx=e.clientX-s0.x,dy=e.clientY-s0.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))>=26&&Date.now()-s0.t<450)nav(dx,dy);
  });
  sc.addEventListener('pointercancel',()=>{st=null;});
  window.addEventListener('keydown',e=>{if(!sc.classList.contains('on')||anyModal())return;const m={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[e.key];if(!m)return;if(tpCur==='c')tpGo(m);else if(TP_BACK[tpCur]===m)tpGo('c');});
})();
$('#b-week').addEventListener('click',()=>{AU.unlock();if(!endGate())return;sfx('click');startGame(false,'week');});
$('#b-time').addEventListener('click',()=>{AU.unlock();if(!endGate())return;sfx('click');openClass(()=>startTimed());});
$('#b-login').addEventListener('click',()=>{sfx('click');openLogin();});
$('#b-mst').addEventListener('click',()=>{sfx('click');openDex('mst');});
$('#b-ach').addEventListener('click',()=>{sfx('click');openDex('ach');});
$('#b-stat').addEventListener('click',()=>{sfx('click');openDex('stat');});
$('#b-rush').addEventListener('click',()=>{AU.unlock();sfx('click');if(endGate())openClass(()=>startRush());});
$('#b-souls').addEventListener('click',()=>{if(!endGate())return;sfx('click');openSouls();});

