/* src/js/game/class-abilities.js
   Klassen-Fähigkeiten: jede Klasse spielt sich anders. */
/* ================= Klassen-Fähigkeiten: jede Klasse spielt sich anders ================= */
const ELEMC={F:'#e8553d',E:'#5aa0e8',G:'#8bd450'};
function alchGain(m){
  if(!G.ing)G.ing=[];if(G.ing.length>=4)return;
  const T=MT[m.type];if(!T.boss&&m.type!=='slime'&&Math.random()>.7)return;
  const e=(T.ignite||T.dies==='ember'||T.sparks)?'F':(T.icy||T.dies==='frost')?'E':(T.toxic||T.venom||T.dies==='spore')?'G':pick(['F','E','G']);
  G.ing.push(e);floatText(m.pos,'Zutat','green');
}
async function brew(t,mix){
  const k=[...mix].sort().join(''),ar=[...areaOf(t,1)],hit=[];
  const hurt=(cells,dmg,stun)=>{for(const m of G.mons.slice())if(cells.includes(m.pos)){hit.push(m);if(stun)m.stun=Math.max(m.stun||0,stun);if(dmg)hitMonster(m,dmg,true);}};
  const NM={EE:'Frostbombe',EF:'Dampf',EG:'Lähmtrank',FF:'Feuerball',FG:'Sprengtrank',GG:'Gaswolke'};
  floatText(t,NM[k]||'Trank','gold');boomFx(t,null);burst(t,ELEMC[mix[0]],10);burst(t,ELEMC[mix[1]],10);
  if(k==='FF'){hurt([t],4);hurt(ar,2);addField('fire',ar.filter(x=>x!==G.pos),3,t);sfx('fireball');}
  else if(k==='EE'){hurt([...areaOf(t,2)],0,3);addField('ice',ar,3,t);sfx('ice');}
  else if(k==='GG'){hurt(ar,2);for(const m of hit)if(G.mons.includes(m))m.stun=Math.max(m.stun||0,1);sfx('spore');}
  else if(k==='EF'){hurt(ar,2,2);sfx('steam');}
  else if(k==='FG'){hurt([t],5);hurt(ar,2);sfx('boom');shake();}
  else{hurt(ar,1,4);sfx('zap');}
  return hit;
}
const ACT={
  jaeger:{n:'Falle',ico:'trap',d:'Gegner, die darauf treten, nehmen 2 Schaden und sind 2 Züge betäubt',cnt:()=>G.bombs,have:()=>G.bombs>0,no:'Keine Falle mehr. Läufst du über eine, nimmst du sie wieder auf.',range:AIM,
    valid:t=>!monAt(t)&&t!==G.exit&&!(G.traps||[]).includes(t)&&!G.spikes.has(t),pay(){G.bombs--;return null;},
    async run(t){G.traps=G.traps||[];G.traps.push(t);sfx('spike');floatText(t,'Falle','gold');burst(t,'#8b93ad',8);return [];}},
  dieb:{n:'Schattenschritt',ico:'p_mantel',d:'Springe bis zu 3 Felder weit und werde 2 Züge unsichtbar',cnt:()=>G.bombs,have:()=>G.bombs>0,no:'Kein Schattenschritt mehr in dieser Etage.',range:3,
    valid:t=>!monAt(t)&&!G.spikes.has(t),pay(){G.bombs--;return null;},
    async run(t){const from=G.pos;burst(from,'#8a5fa8',12);G.pos=t;G.cloak=Math.max(G.cloak,2);burst(t,'#8a5fa8',12);sfx('blink');floatText(t,'Schattenschritt','blue');landing(t,from,0,true);return [];}},
  alchemist:{n:'Trank',ico:'p_kristall',d:'Mischt die zwei ältesten Zutaten zu einem Trank mit eigener Wirkung',cnt:()=>(G.ing||[]).length,have:()=>(G.ing||[]).length>=2,no:'Du brauchst 2 Zutaten. Sie fallen von besiegten Gegnern.',range:AIM,
    valid:t=>true,pay(){return G.ing.splice(0,2);},async run(t,mix){return brew(t,mix);}},
  schatz:{n:'Münzwurf',ico:'s-coin',d:'Wirft 8 Münzen als Geschoss: 2 Schaden, mehr bei vollem Beutel',cnt:()=>G.money,have:()=>G.money>=8,no:'Du brauchst mindestens 8 Münzen.',range:AIM,
    valid:t=>!!monAt(t),pay(){G.money-=8;return null;},
    async run(t){const m=monAt(t),b=Math.min(3,Math.floor(G.money/40));burst(t,'#ffe27a',10);sfx('coin');if(m)hitMonster(m,2+b+(G.fang?2:0),true);else floatText(t,'Verpufft','dim');if(Math.random()<.5&&!G.items.has(t)&&!G.walls.has(t)&&!G.spikes.has(t))G.items.set(t,'coin');return m?[m]:[];}},
  waechter:{n:'Schildstoß',ico:'s-shield',d:'Schleudert einen Nachbarn 2 Felder zurück, betäubt ihn und gibt dir einen Block',cnt:()=>G.bashCd>0?G.bashCd:'bereit',have:()=>!(G.bashCd>0),no:'Der Schildstoß lädt noch auf.',range:1,
    valid:t=>!!monAt(t)&&NB[G.pos].includes(t),pay(){G.bashCd=3;return null;},
    async run(t){const m=monAt(t);if(!m)return [];const dead=hitMonster(m,1+(G.fang?2:0),true);if(!dead&&G.mons.includes(m)){floatText(m.pos,'Schildstoß','gold');knock(m,2);if(G.mons.includes(m))m.stun=Math.max(m.stun||0,2);}G.shield=Math.min(G.shield+1,G.shieldMax+3);sfx('block');return [m];}}
};
async function useBomb(){
  if(!G||G.busy||G.over||flipping)return;
  if(G.aiming){cancelAim();return;}
  const act=ACT[G.cls];
  if(!act&&G.noAmmo&&G.cls!=='zauberer')return;
  if(act){if(!act.have()){setMsg(act.no);sfx('bump');return;}}
  else if(G.cls==='zauberer'){if(G.mana<2){setMsg('Zu wenig Mana. Es lädt sich mit jedem zweiten Zug auf.');return;}}
  else if(G.bombs<1){setMsg('Kein Wurf-Item mehr.');return;}
  if(terrOf(G.pos)&&terrOf(G.pos).k==='water'){setMsg('Im Wasser kannst du nichts werfen. Schwimm erst ans Ufer.');toast('Zu nass zum Werfen');return;}
  const A=act?{name:act.n,desc:act.d}:G.cls==='zauberer'?{name:'Zauber',desc:'Blitz mit '+(G.dmg+2+(G.fang?2:0))+' Schaden'}:AMMO[kindOf(G.depth)];
  G.aiming=true;AU.unlock();sfx('click');
  setMsg(A.name+': Tippe ein markiertes Zielfeld (bis '+(act?act.range:AIM)+' Schritte). '+A.desc+'.');
  render();
}
function cancelAim(){if(G&&G.aiming){G.aiming=false;render();}}
async function castSpell(t){
  sfx('zap');boltFx(G.pos,t);burst(t,'#b890ff',10);
  const dmg=G.dmg+2+(G.fang?2:0),hit=[],m=monAt(t);
  if(m){hitMonster(m,dmg,true);hit.push(m);}
  else floatText(t,'Verpufft','dim');
  if(G.wide)for(const o of G.mons.slice())if(o!==m&&NB[t].includes(o.pos)){hitMonster(o,1,true);hit.push(o);}
  return hit;
}
async function throwAt(t){
  if(!G||G.busy||G.over||flipping||!G.aiming)return false;
  const wiz=G.cls==='zauberer',act=ACT[G.cls];
  if(G.noAmmo&&!wiz&&!act)return false;
  const A=wiz?{ico:'s-bolt',throw:castSpell}:act?{ico:act.ico,throw:null}:AMMO[kindOf(G.depth)];
  const d=bfs(G.pos,null).get(t),rng=act?act.range:AIM;
  if(act&&!act.valid(t)){sfx('bump');floatText(t,'Nicht hier','dim');return false;}
  if(d===undefined||d>rng||G.walls.has(t)||t===G.pos){sfx('bump');floatText(t,d>rng?'Zu weit':'Nicht hier','dim');return false;}
  let mix=null;
  G.aiming=false;G.busy=true;AU.unlock();G.last=snap();if(wiz)G.mana-=2;else if(act)mix=act.pay();else{G.bombs--;markEx('ammo',kindOf(G.depth));}
  sfx('aim');throwFx(G.pos,t,A.ico);render();
  try{
    await sleep(380);
    const hit=await (act?act.run(t,mix):A.throw(t));
    questEvent('throws',1);save.stats.throws++;if(hit&&hit.length>=3)award('bomber');if(save.stats.throws>=50)award('thrower');
    if(G.sandy)for(const m of hit||[])if(G.mons.includes(m))m.stun=Math.max(m.stun||0,1);
  }catch(e){console.error(e);}
  vibe(40);render();await sleep(200);
  if(G.hp<=0){die();return true;}
  await endTurn();return true;
}
let lookPos=-1;
async function lookDir(d){
  if(!G||G.busy||G.over||flipping)return;
  await flipView(rotView(view,d),d);
  lookPos=viewCoord(view,G.pos)?-1:G.pos;
  if(!DF().rotFree){G.busy=true;await endTurn();}
}
async function lookFace(k){
  if(!G||G.busy||G.over||flipping)return;
  const nv=FACES[k];if(sameN(nv,view)&&sameView(nv,view))return;
  await flipView(nv);
  lookPos=viewCoord(view,G.pos)?-1:G.pos;
  if(!DF().rotFree){G.busy=true;await endTurn();}
}
async function centerMe(){
  if(!G||G.over||flipping)return;
  lookPos=-1;
  if(viewCoord(view,G.pos))return;
  await flipView(findViewFor(G.pos,view));
}

function recordBest(){
  let ch=false;
  const bd=save.bd[G.diff||'normal']||(save.bd[G.diff||'normal']={score:0,depth:0});
  if(G.score>bd.score){bd.score=G.score;ch=true;}
  if(G.depth>bd.depth){bd.depth=G.depth;ch=true;}
  if(G.score>save.best){save.best=G.score;ch=true;}
  if(G.depth>save.bestDepth){save.bestDepth=G.depth;ch=true;}
  if(!save.cbd)save.cbd={};if(G.depth>(save.cbd[G.cls||'krieger']||0)){const old=save.cbd[G.cls||'krieger']||0;save.cbd[G.cls||'krieger']=G.depth;ch=true;for(const sk of SKD.sk[G.cls||'krieger']||[])if(sk.need>old&&sk.need<=G.depth)toast('Neuer Skin freigeschaltet: '+sk.name);}
  if(ch)persist();
}
function die(){
  if(G.phoenix&&!G.phx){
    G.phx=true;G.hp=Math.ceil(G.maxhp/2);G.shield=Math.max(G.shield,1);
    award('phoenix');sfx('win');flash();floatText(G.pos,'Phönix','gold');burst(G.pos,'#ff8a5c',20);setMsg('Die Phönixfeder verglüht. Du lebst.');
    render();release();return;
  }
  if(save.perk&&save.perk.sd&&!G.sdUsed){
    G.sdUsed=true;const dv=()=>Math.random()<1/3?6:1+Math.floor(Math.random()*5),a=dv(),b=dv();
    if(a===6&&b===6){G.hp=1;G.shield=Math.max(G.shield,1);sfx('win');flash();floatText(G.pos,'Saving Dice','gold');burst(G.pos,'#ffe27a',20);setMsg('Zwei Sechsen. Die Würfel retten dich.');render();release();return;}
    toast('Saving Dice: '+a+'/'+b+'. Kein Glück.');
  }
  G.over=true;G.busy=true;
  if(!G.daily)save.early=G.depth<5?(save.early||0)+1:0;
  const newBest=G.score>save.best;
  save.runs++;save.kills+=G.kills;save.run=null;recordBest();
  const gsGain=grantRun();if(G.daily)dailyProgress();persist();
  sfx('over');render();
  setTimeout(()=>{
    $('#over-new').innerHTML=newBest&&G.score>0?'<span class="newbest">Neuer Rekord</span>':'';
    const kt=G.lastHit&&MT[G.lastHit]?G.lastHit:null;
    $('#over-top').innerHTML=`<div class="go-hero">${spr(heroId(G.diff,G.cls,skinOf(G.cls)))}</div><div class="go-by"><span>${kt?'Besiegt von':'Gefallen in'}</span>${kt?`<div style="display:flex;align-items:center;gap:6px">${spr(kt)}<b>${MT[kt].name}</b></div>`:`<b>der Gruft</b>`}</div>`;
    $('#over-res').innerHTML=`<div class="tile hi"><b>${G.depth}</b><span>Etage</span></div><div class="tile"><b>${fmt(G.score)}</b><span>Punkte</span></div><div class="tile"><b>${G.kills}</b><span>Besiegt</span></div><div class="tile"><b>${G.turns}</b><span>Züge</span></div><div class="tile"><b>${nearTen(G.depth)}</b><span>Zone</span></div><div class="tile gs"><b>+${gsGain}</b><span>Gruftsteine</span></div>`;
    $('#over-goal').innerHTML=nextGoals().map(g=>`<div class="goalrow">${spr(g.ico)}<span>${g.t}</span></div>`).join('');
    overAdButton(gsGain);
    openModal('m-over');
  },900);
}
async function completeLevel(){
  G.busy=true;sfx('stairs');trackLevel();mrGain(4+Math.floor(G.depth/5)+(G.daily?0:0));tjFloorDone();
  const bonus=100+G.depth*25+G.hp*10;G.score+=bonus;
  floatText(G.pos,'+'+bonus,'gold');burst(G.pos,'#f4b942',16);
  if(G.rest&&G.hp<G.maxhp){G.hp=Math.min(G.maxhp,G.hp+G.rest*2);setMsg('Am Lagerfeuer erholt.');}
  render();recordBest();
  await sleep(750);
  if(!G.rush&&G.depth>=GOAL&&!G.endless){
    $('#m-win .newbest').textContent='Alle '+GOAL+' Etagen geschafft';
    if(!G.daily){save.won=true;if(typeof save.asc!=='object'||!save.asc)save.asc={};if((G.asc||0)>=ascOf(G.diff)&&ascOf(G.diff)<5){save.asc[G.diff]=ascOf(G.diff)+1;toast('Aufstiegsstufe '+save.asc[G.diff]+' freigeschaltet');}}
    if(!G.daily)masterNote(G.cls||'krieger',G.diff);
    G.won=true;save.run=null;save.endless=true;const gsGain=grantRun();persist();sfx('win');
    $('#win-res').innerHTML=`<span>Punkte</span><b>${fmt(G.score)}</b><span>Besiegt</span><b>${G.kills}</b><span>Züge</span><b>${G.turns}</b><span>Gruftsteine</span><b>+${gsGain}</b>`;
    if(!save.seenOutro&&!G.daily){save.seenOutro=true;persist();playOutro(()=>{show('scr-game');openModal('m-win');});return;}
    openModal('m-win');return;
  }
  if(G.rush){
    const n=G.depth/5;if(!save.rush)save.rush={best:0};
    if(n>save.rush.best){save.rush.best=n;addGS(25);toast('Boss-Rush: Boss '+n+' von 20 (+25 Gruftsteine)');}
    G.hp=Math.min(G.maxhp,G.hp+1);
    if(G.depth>=GOAL){
      $('#m-win .newbest').textContent='Boss-Rush geschafft';addGS(1000);G.won=true;save.run=null;persist();sfx('win');
      $('#win-res').innerHTML=`<span>Punkte</span><b>${fmt(G.score)}</b><span>Besiegt</span><b>${G.kills}</b><span>Züge</span><b>${G.turns}</b><span>Gruftsteine</span><b>+1000</b>`;
      openModal('m-win');return;
    }
  }
  showUpgrades();
}
function showUpgrades(){
  $('#up-title').textContent='Etage '+G.depth+' geschafft';
  const nz=Math.min(ZONES.length-1,Math.floor(G.depth/10));
  $('#up-sub').textContent=G.depth%10===0&&G.depth<GOAL?'Neue Zone, neue Verstärkungen. Wähle eine für den Abstieg.':'Wähle eine Verstärkung für den Abstieg.';
  const avail=UPS.filter(u=>u.can()&&u.tier<=nz&&(!u.rare||Math.random()<u.rare));
  const mkPool=()=>{const fresh=nz>0?shuffle(avail.filter(u=>u.tier===nz)):[];const pl=fresh.slice(0,1);pl.push(...shuffle(avail.filter(u=>!pl.includes(u))).slice(0,3-pl.length));return pl;};
  const pool=G.daily?withSeed(G.dday+':u'+G.depth,mkPool):mkPool();
  const box=$('#cards');box.innerHTML='';
  for(const u of pool){
    const n=G.ups[u.id]||0;
    const b=document.createElement('button');b.className='card';
    b.innerHTML=`${spr(u.ico)}<div><b>${u.name}</b><span>${u.desc}</span>${n?`<em>Du hast ${n}</em>`:''}</div>`;
    b.addEventListener('click',()=>{
      sfx('card');questEvent('picks',1);u.apply();G.ups[u.id]=n+1;closeModal('m-up');
      if(Object.values(G.ups).filter(v=>v>0).length>=10)award('collector');
      afterCard();
    });
    box.appendChild(b);
  }
  openModal('m-up');
}

