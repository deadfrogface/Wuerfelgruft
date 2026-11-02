/* src/js/ui/input.js
   Eingaben im Spiel: Tippen, Wischen und Tasten. */
/* ================= Eingaben ================= */
const stage=$('#stage');let ptr=null;
stage.addEventListener('pointerdown',e=>{ptr={x:e.clientX,y:e.clientY};AU.unlock();});
document.addEventListener('pointerdown',()=>{try{AU.unlock();}catch(_){}},true);
stage.addEventListener('pointercancel',()=>{ptr=null;});
stage.addEventListener('pointerup',e=>{
  if(!ptr)return;
  const dx=e.clientX-ptr.x,dy=e.clientY-ptr.y;ptr=null;
  if(!G||G.over||anyModal())return;
  if(walking){walkCancel=true;return;}
  if(Math.hypot(dx,dy)>30){
    if(Math.abs(dx)>Math.abs(dy))lookDir(dx<0?'right':'left');
    else lookDir(dy<0?'down':'up');
    return;
  }
  if(G.aiming){const cell=e.target.closest('.cell');if(cell)throwAt(+cell.dataset.i);else cancelAim();return;}
  const edge=e.target.closest('.edge');
  if(edge&&edge.classList.contains('show')){playerAct(+edge.dataset.t,edge.dataset.d);return;}
  const cell=e.target.closest('.cell');
  if(cell)tapCell(+cell.dataset.i);
});
$('#net').addEventListener('click',e=>{const f=e.target.closest('.nf');if(f){AU.unlock();lookFace(f.dataset.f);}});
$('#b-wait').addEventListener('click',()=>{waitTurn();});
$('#b-bomb').addEventListener('click',()=>{useBomb();});
$('#b-undo').addEventListener('click',()=>{undoMove();});
$('#b-me').addEventListener('click',()=>{sfx('click');centerMe();});
$('#b-pause').addEventListener('click',()=>{AU.unlock();sfx('click');if(G)$('#pause-tiles').innerHTML=`<div class="tile hi"><b>${G.depth}</b><span>Etage</span></div><div class="tile"><b>${fmt(G.score)}</b><span>Punkte</span></div><div class="tile"><b>${G.money}</b><span>Münzen</span></div>`;openModal('m-pause');});

window.addEventListener('keydown',e=>{
  if(!$('#scr-game').classList.contains('on')||anyModal()||!G)return;
  const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  const d=map[e.key];
  if(d){
    e.preventDefault();
    if(e.shiftKey){lookDir(d);return;}
    const [dc,dr]=EDGE_DEFS[d];
    const t=stepTarget(view,G.pos,dc,dr);
    if(t>=0)playerAct(t,d);
    return;
  }
  if(e.key===' '){e.preventDefault();waitTurn();}
  else if(e.key==='b'||e.key==='B')useBomb();
  else if(e.key==='Escape'){if(G.aiming)cancelAim();else openModal('m-pause');}
});

$('#b-play').addEventListener('click',()=>{AU.unlock();sfx('click');if(isFresh()&&!save.seenIntro)playIntro();else if(isFresh())startFirstRun();else openDiff(()=>startGame());});
$('#d-cancel').addEventListener('click',()=>{sfx('click');closeModal('m-diff');if($('#scr-intro').classList.contains('on'))show('scr-title');});
$('#b-forge').addEventListener('click',()=>{AU.unlock();sfx('click');openForge();});
$('#f-camp').addEventListener('click',()=>{sfx('click');closeModal('m-forge');openCamp();});
$('#camp-close').addEventListener('click',()=>{sfx('click');closeModal('m-camp');updateStats();});
$('#campp-close').addEventListener('click',()=>{sfx('click');closeModal('m-campp');});
$('#f-souls').addEventListener('click',()=>{sfx('click');closeModal('m-forge');openSouls();});
$('#souls-close').addEventListener('click',()=>{sfx('click');closeModal('m-souls');updateStats();});
$('#f-vault').addEventListener('click',()=>{sfx('click');closeModal('m-forge');openVault();});
$('#vault-close').addEventListener('click',()=>{sfx('click');closeModal('m-vault');updateStats();});
$('#f-close').addEventListener('click',()=>{sfx('click');closeModal('m-forge');});
$('#b-q').addEventListener('click',()=>{AU.unlock();sfx('click');openQuests();});
$('#q-close').addEventListener('click',()=>{sfx('click');closeModal('m-quests');updateStats();});
$('#login-go').addEventListener('click',claimLogin);
$('#b-daily').addEventListener('click',()=>{AU.unlock();sfx('click');startGame(false,true);});
$('#b-dex').addEventListener('click',()=>{AU.unlock();sfx('click');openDex('dex');});
$('#x-close').addEventListener('click',()=>{sfx('click');closeModal('m-dex');});
$('#b-help').addEventListener('click',()=>{AU.unlock();sfx('click');buildHelpZone();openModal('m-help');});
$('#b-set').addEventListener('click',()=>{AU.unlock();sfx('click');syncSwitches();openModal('m-set');});
$('#scr-intro').addEventListener('click',e=>{if(e.target.id==='i-skip')return;introNext();});
$('#i-skip').addEventListener('click',endIntro);
$('#h-close').addEventListener('click',()=>{sfx('click');closeModal('m-help');});
$('#relics').addEventListener('click',()=>{
  if(!G)return;
  const li=(ico,t,d)=>`<li><span class="ph">${spr(ico)}</span><span><b>${t}</b>${d?': '+d:''}</span></li>`;
  let h='';
  for(const u of UPS){const n=G.ups[u.id]||0;if(n)h+=li(u.ico,u.name+(n>1?' ×'+n:''),u.desc);}
  if(G.dmg>1)h+=li('s-blade','Schaden '+G.dmg,'Grundschaden pro Angriff.');
  $('#relic-list').innerHTML=h||'<li>Noch keine Verstärkungen.</li>';
  sfx('click');openModal('m-relics');
});
$('#r-close').addEventListener('click',()=>{sfx('click');closeModal('m-relics');});
$('#s-close').addEventListener('click',()=>{sfx('click');closeModal('m-set');});
$('#s-reset').addEventListener('click',()=>{save.bd={};save.best=0;save.bestDepth=0;save.runs=0;save.kills=0;persist();updateStats();sfx('click');});
$$('.rg').forEach(r=>{
  r.addEventListener('input',()=>{save.settings[r.dataset.k]=+r.value;persist();applySettings();});
  r.addEventListener('change',()=>{sfx('click');});
});
$$('.sw').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.k;save.settings[k]=!save.settings[k];persist();syncSwitches();applySettings();
  if(save.settings.sfx)sfx('click');
}));
$('#p-resume').addEventListener('click',()=>{sfx('click');closeModal('m-pause');});
$('#p-mons').addEventListener('click',()=>{sfx('click');if(G)openZoneMons();});
$('#altar-close').addEventListener('click',()=>{sfx('click');closeModal('m-altar');});
$('#zmon-close').addEventListener('click',()=>{sfx('click');closeModal('m-zmon');});
$('#p-help').addEventListener('click',()=>{sfx('click');buildHelpZone();openModal('m-help');});
$('#p-set').addEventListener('click',()=>{sfx('click');syncSwitches();openModal('m-set');});
$('#p-title').addEventListener('click',()=>{sfx('click');closeModal('m-pause');G=null;AU.setIntensity(0);updateStats();show('scr-title');});
$('#p-quit').addEventListener('click',()=>{
  sfx('click');closeModal('m-pause');
  if(G&&!G.over){G.over=true;save.runs++;save.kills+=G.kills;recordBest();const gg=grantRun();if(G.daily)dailyProgress();if(gg)toast('+'+gg+' Gruftsteine');}
  save.run=null;persist();
  G=null;AU.setIntensity(0);updateStats();show('scr-title');
});
$('#b-endless').addEventListener('click',()=>{AU.unlock();sfx('click');if(!save.endless&&!endGate())return;openDiff(()=>startGame(true));});
$('#b-cont').addEventListener('click',()=>{AU.unlock();sfx('click');show('scr-game');newRun(true);});
$('#o-again').addEventListener('click',()=>{sfx('click');closeModal('m-over');newRun();});
$('#o-title').addEventListener('click',()=>{sfx('click');closeModal('m-over');G=null;AU.setIntensity(0);updateStats();show('scr-title');});
$('#shop-go').addEventListener('click',leaveShop);
$('#w-go').addEventListener('click',()=>{sfx('click');closeModal('m-win');G.endless=true;showUpgrades();});
$('#w-title').addEventListener('click',()=>{sfx('click');closeModal('m-win');G=null;AU.setIntensity(0);updateStats();show('scr-title');});

