/* src/js/ui/theme-zone-bg.js
   Zonen-Look, Hintergründe, Laufzustand speichern und Zurück-Taste. */
/* ================= Theme, Staub, Zurück-Taste ================= */
const TINTS=['#2b2650','#1f3a4d','#3d2a55','#4d2b30','#2a4a3f','#3a2f66','#4a3a22','#22364d','#4d2a45','#2d2d4d'];
const TRANS=[0,2,-2,3,-1,5,0,-3,2,0];
const MUSIC_EV={vegas:'ev_vegas',halloween:'ev_halloween',xmas:'ev_xmas',easter:'ev_easter',valentine:'ev_valentine',italy:'ev_italy',hungary:'ev_hungary',birthday:'ev_birthday'};
let bgZone='';
function buildZoneBg(kd){
  const bg=$('#zbg');bg.innerHTML='';
  const R=(a,b)=>a+Math.random()*(b-a);
  const add=(cls,n,fn)=>{for(let k=0;k<n;k++){const e=document.createElement('i');e.className=cls;fn(e,k);bg.appendChild(e);}};
    if(kd==='oase'){
    add('sun',1,()=>{});
    add('cl',3,(e,k)=>{e.style.cssText=`top:${R(2,34).toFixed(0)}%;--w:${R(120,220).toFixed(0)}px;--d:${R(60,100).toFixed(0)}s;--dl:${(-R(0,60)).toFixed(0)}s;opacity:${R(.35,.6).toFixed(2)}`;});
    add('sg',6,e=>{e.style.cssText=`top:${R(60,100).toFixed(0)}%;--w:${R(60,160).toFixed(0)}px;--d:${R(2,4).toFixed(1)}s;--dl:${(-R(0,3)).toFixed(1)}s`;});
  }else if(kd==='wueste'){
    add('sun',1,()=>{});
    add('sg',18,e=>{e.style.cssText=`top:${R(0,100).toFixed(0)}%;--w:${R(60,220).toFixed(0)}px;--d:${R(1.4,3.4).toFixed(1)}s;--dl:${(-R(0,3)).toFixed(1)}s`;});
    add('dn',4,(e,k)=>{e.style.cssText=`left:${k*28-10}%;--w:${R(50,80).toFixed(0)}%`;});
  }else if(kd==='uhrwerk'){
    add('gr',6,(e,k)=>{e.style.cssText=`left:${R(-10,85).toFixed(0)}%;top:${R(0,85).toFixed(0)}%;--s:${R(70,170).toFixed(0)}px;--d:${R(30,70).toFixed(0)}s;--dir:${k%2?'reverse':'normal'}`;});
    add('sm',9,e=>{e.style.cssText=`left:${R(0,95).toFixed(0)}%;--s:${R(40,90).toFixed(0)}px;--d:${R(6,11).toFixed(1)}s;--dl:${(-R(0,10)).toFixed(1)}s`;});
  }else if(kd==='tiefsee'){
    add('cs',1,()=>{});
    add('fs',5,e=>{e.style.cssText=`top:${R(8,75).toFixed(0)}%;--s:${R(22,50).toFixed(0)}px;--d:${R(14,30).toFixed(0)}s;--dl:${(-R(0,20)).toFixed(0)}s`;});
    add('bb',22,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--s:${R(5,14).toFixed(0)}px;--d:${R(5,11).toFixed(1)}s;--dl:${(-R(0,10)).toFixed(1)}s;--sx:${R(-20,20).toFixed(0)}px`;});
    add('wd',9,(e,k)=>{e.style.cssText=`left:${k*11.5}%;--h:${R(60,150).toFixed(0)}px;--d:${R(3,6).toFixed(1)}s;--dl:${(-R(0,5)).toFixed(1)}s`;});
  }else if(kd==='wind'){
    add('cl',6,(e,k)=>{e.style.cssText=`top:${R(2,70).toFixed(0)}%;--w:${R(120,260).toFixed(0)}px;--d:${R(40,80).toFixed(0)}s;--dl:${(-R(0,60)).toFixed(0)}s;opacity:${R(.25,.55).toFixed(2)}`;});
    add('wl',16,e=>{e.style.cssText=`top:${R(0,100).toFixed(0)}%;--w:${R(60,200).toFixed(0)}px;--d:${R(1.2,3.2).toFixed(1)}s;--dl:${(-R(0,3)).toFixed(1)}s`;});
    add('lf',10,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--d:${R(5,9).toFixed(1)}s;--dl:${(-R(0,9)).toFixed(1)}s;--sx:${R(80,200).toFixed(0)}px;--c:${['#e8f0ff','#cfe6ff','#a8d8f0'][Math.floor(R(0,3))]}`;});
  }else if(kd==='gold'){
    add('rays',1,()=>{});
    add('gc',12,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--d:${R(6,11).toFixed(1)}s;--dl:${(-R(0,11)).toFixed(1)}s;--sx:${R(-40,40).toFixed(0)}px`;});
    for(let k=0;k<2;k++)add('stg',1,e=>{e.style.cssText=`--d:${k?3.4:2.4}s;--dl:${k?-1:0}s;box-shadow:`+Array.from({length:16},()=>`${R(0,100).toFixed(0)}vw ${R(0,100).toFixed(0)}vh 0 ${R(0,1.4).toFixed(1)}px rgba(255,243,176,.95)`).join(',');});
  }else if(kd==='moor'){
    add('vn',8,(e,k)=>{e.style.cssText=`left:${k*13.5-1}%;height:${R(12,34).toFixed(0)}%;--sd:${R(3,6).toFixed(1)}s;--dl:${(-R(0,5)).toFixed(1)}s`;});
    add('lf',14,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--d:${R(7,13).toFixed(1)}s;--dl:${(-R(0,12)).toFixed(1)}s;--sx:${R(-60,60).toFixed(0)}px;--c:${['#7ac043','#b5c93a','#d9c02f','#4f9a3a'][Math.floor(R(0,4))]}`;});
    add('ff',10,e=>{e.style.cssText=`left:${R(5,95).toFixed(0)}%;top:${R(25,92).toFixed(0)}%;--d:${R(3,6).toFixed(1)}s;--dl:${(-R(0,5)).toFixed(1)}s`;});
  }else if(kd==='eis'){
    add('au',1,()=>{});
    add('sf',22,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--s:${R(2,5).toFixed(0)}px;--d:${R(6,12).toFixed(1)}s;--dl:${(-R(0,12)).toFixed(1)}s;--sx:${R(-50,50).toFixed(0)}px`;});
    add('cr',7,(e,k)=>{e.style.cssText=`left:${k*15-3}%;--w:${R(40,80).toFixed(0)}px;--h:${R(60,150).toFixed(0)}px;--dl:${(-R(0,3)).toFixed(1)}s`;});
  }else if(kd==='glut'){
    add('hz',1,()=>{});add('lv',1,()=>{});
    add('fe',20,e=>{e.style.cssText=`left:${R(0,100).toFixed(0)}%;--s:${R(2,5).toFixed(0)}px;--d:${R(4,9).toFixed(1)}s;--dl:${(-R(0,9)).toFixed(1)}s;--sx:${R(-40,40).toFixed(0)}px;--c:${['#ff8a3d','#ffd36a','#e8553d'][Math.floor(R(0,3))]}`;});
  }else if(kd==='leere'){
    add('sw',1,()=>{});
    for(let k=0;k<2;k++)add('stg',1,e=>{e.style.cssText=`--d:${k?4.2:3.1}s;--dl:${k?-1.5:0}s;box-shadow:`+Array.from({length:18},()=>`${R(0,100).toFixed(0)}vw ${R(0,100).toFixed(0)}vh 0 ${R(0,1.2).toFixed(1)}px rgba(232,224,255,.95)`).join(',');});
    add('ob',6,e=>{e.style.cssText=`left:${R(5,90).toFixed(0)}%;top:${R(30,95).toFixed(0)}%;--s:${R(24,60).toFixed(0)}px;--d:${R(6,12).toFixed(1)}s;--dl:${(-R(0,6)).toFixed(1)}s;--sx:${R(-40,40).toFixed(0)}px`;});
  }
}
const curKind=()=>G.inOasis?'oase':kindOf(G.depth);
function applyZone(){
  const kd=curKind();ensureZone(kd);
  const root=document.documentElement;
  for(const name of ZNAMES)if(ZURL[kd][name])root.style.setProperty('--sp-'+name,ZURL[kd][name]);
  $('#scr-game').dataset.kind=kd;
  if(kd!==bgZone){bgZone=kd;buildZoneBg(kd);}
}
const ZTINT={oase:'#f4d27a',wueste:'#8a6a2a',uhrwerk:'#6a4a2a',tiefsee:'#1a4a6a',wind:'#3a6a8a',gold:'#7a5a14',moor:'#2d5a2a',eis:'#2a4a7a',glut:'#7a2a1a',leere:'#3a2670'};
function applyTheme(){
  applyZone();
  const d=(G.depth-1+zoneOf(G.depth)*3)%10;
  document.documentElement.style.setProperty('--tint',G.boss?'#5a1f2a':(ZTINT[curKind()]||TINTS[d]));
  const ev=activeEvent(),kz=ev&&!G.boss&&MUSIC_EV[ev]?MUSIC_EV[ev]:curKind();
  AU.setKind(kz,ZMUS[kz]||ZMUS.gruft,MOT[kz]||MOT.gruft,PROGS[kz]||PROGS.gruft);
  AU.pvar=(G.depth*5+Math.floor(G.depth/10))%4;
  AU.trans=G.boss?-5:TRANS[(G.depth-1)%10]*(kz==='oase'?0:1);
  AU.sd=60/((G.boss?AU.zm.bpm+12:AU.zm.bpm)+((G.depth%4)-1.5)*3)/4;
}
const SAVEKEYS=['seen','limbo','temps','ink','cls','noAmmo','noMelee','noHpUp','mana','manaMax','plate','goldMul','psn','burn','stone','depth','score','kills','turns','hp','maxhp','dmg','bombs','ups','shieldMax','thorns','leech','spear','chase','killCount','undoBonus','won','endless','diff','daily','rule','dday','bossKills','gsPaid','money','rage','cloak','freeSteps','lucky','veil','curse','oasis','maprel','sandy','assassin','gears','rod','torch','spare','lens','chain','pearl','ink','harpoon','feast','volt','anchor','paralyzed','shell','gale','gustshield','tailwind','sack','shadow','fury','dice','loot','haggle','income','net','hunter','lockpicks','crit','armor','rest','sling','boots','wide','stun','splash','regen','dodge','gold','pickN','goal','sw','swNeed','goals','rn','sv','weekly','rule2','rush','traps','ing','bashCd','flood','air','airMax','timed','tl','tlMax','tTotal','speedGS','heartHalf','legHp','legAt','legs','phoenix','phx','swift','frost','poison','soul','thorns2','exec','spark','fang','master','steps','coins'];
function saveRun(){
  const r={};SAVEKEYS.forEach(k=>{r[k]=G[k];});
  r.shop=shop?serializeShop():null;
  save.run=r;persist();
}
function buildDust(){
  const em=$('#dust');
  for(let k=0;k<14;k++){
    const e=document.createElement('i');e.className='ember';
    e.style.left=(Math.random()*100)+'%';
    e.style.setProperty('--d',(10+Math.random()*10).toFixed(1)+'s');
    e.style.setProperty('--dl',(-Math.random()*14).toFixed(1)+'s');
    e.style.setProperty('--sx',((Math.random()*60-30)).toFixed(0)+'px');
    em.appendChild(e);
  }
}
function onBack(){
  const open=$$('.modal.on');
  if(open.length){const id=open[open.length-1].id;if(id==='m-pause'||id==='m-help'||id==='m-set')closeModal(id);return;}
  if($('#scr-game').classList.contains('on')&&G&&!G.over){openModal('m-pause');return;}
  if($('#scr-intro').classList.contains('on')){endIntro();return;}
  try{const A=window.Capacitor.Plugins.App;if(A&&A.exitApp)A.exitApp();}catch(e){}
}
try{
  const Cap=window.Capacitor;
  if(Cap&&Cap.Plugins){
    const A=Cap.Plugins.App;if(A&&A.addListener)A.addListener('backButton',onBack);
    const SB=Cap.Plugins.StatusBar;
    if(SB){if(SB.setBackgroundColor)SB.setBackgroundColor({color:'#17152b'});if(SB.setStyle)SB.setStyle({style:'DARK'});}
  }
}catch(e){}
window.addEventListener('keydown',e=>{if(e.key==='u'||e.key==='U')undoMove();});

