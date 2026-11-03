/* src/js/game/turns-player.js
   Zugablauf, Spieleraktionen, Laufen und Zielen. */
let pending=null,walking=false,walkCancel=false;
function flush(){if(!pending||!G||G.busy||G.over||flipping)return;const f=pending;pending=null;f();}
function release(){G.busy=false;setTimeout(flush,0);}
const isUrw=m=>MT[m.type]&&MT[m.type].name==='Der Urwürfel';
const finalFight=()=>!!(G&&G.boss&&G.mons.some(isUrw));
async function monsterPhase(){
  if(G.cloak>0&&finalFight()&&!G.ffMsg){G.ffMsg=1;floatText(G.pos,'Durchschaut','red');setMsg('Der Urwürfel sieht dich trotz Tarnung.');}
  if(G.cloak>0&&!finalFight()){G.cloak--;floatText(G.pos,'Unbemerkt','blue');render();await sleep(60);return;}
  const P=G.pos;
  const dW=bfs(P,G.walls),dA=bfs(P,null);
  const d8=G.mons.some(m=>MT[m.type].diag)?bfs8(P,G.walls):null;
  const order=G.mons.slice().sort((a,b)=>(dA.get(a.pos)||99)-(dA.get(b.pos)||99));
  let any=false;
  for(const m of order){
    if(!G.mons.includes(m))continue;
    if(G.veil&&(dA.get(m.pos)||99)>2&&!MT[m.type].boss)continue;
    const r=act(m,dW,dA,d8);
    if(r){any=true;render();await sleep(r===2?120:45);}
    if(G.hp<=0)break;
  }
  if(any)await sleep(90);
}
async function endTurn(){
  try{await endTurnInner();}catch(e){console.error(e);try{render();}catch(e2){}if(G&&!G.over&&G.hp>0)release();}
}
async function endTurnInner(){
  while(oasis)await new Promise(r=>setTimeout(r,60));
  G.turns++;goalTick();airTick();if(G.bashCd>0)G.bashCd--;
  (G.hist=G.hist||[]).push(G.pos);if(G.hist.length>4)G.hist.shift();
  if(G.ink>0)G.ink--;
  limboTick();tempTick();save.stats.turns++;tipCheck();
  if(G.regen&&G.hp<G.maxhp&&G.turns%[0,10,7,5][G.regen]===0){G.hp++;floatText(G.pos,'+1','green');}
  if(G.psn>0&&G.hp>0){G.psn--;floatText(G.pos,'Gift','green');sfx('squelch');hurtPlayer(1,null);}
  if(G.burn>0&&G.hp>0){G.burn--;floatText(G.pos,'Brand','red');sfx('crackle');hurtPlayer(1,null);}
  tickFields();
  terrainTick();
  if(G.cls==='zauberer'&&G.mana<G.manaMax&&G.turns%2===0)G.mana++;
  if(G.hp>0&&!viewCoord(view,G.pos)&&lookPos!==G.pos){render();await flipView(findViewFor(G.pos,view));}
  if(G.hp<=0){render();die();return;}
  if(G.gears&&G.turns%5===0){floatText(G.pos,'Getriebe','blue');render();release();return;}
  await monsterPhase();
  if(G.hp>0&&!viewCoord(view,G.pos)&&lookPos!==G.pos){render();await flipView(findViewFor(G.pos,view));}
  render();
  if(G.hp<=0){die();return;}
  release();
}
function lungeFx(el,from,to,cls='lunge'){
  const a=viewCoord(view,from),b=viewCoord(view,to);if(!el||!a||!b)return;
  el.style.setProperty('--lx',Math.sign(b.col-a.col)*38+'%');el.style.setProperty('--ly',Math.sign(b.row-a.row)*38+'%');
  pulse(el,cls,cls==='lunge'?260:320);
}
function faceHero(t){
  const el=entEls.get('hero');const a=viewCoord(view,G.pos),b=viewCoord(view,t);
  if(!el||!a||!b||a.col===b.col)return;
  const fx=b.col>a.col?1:-1;el._fx=fx;el.style.setProperty('--fx',fx);
}
function snap(){
  const o={pos:G.pos,mons:G.mons.map(m=>({...m})),items:new Map(G.items),spikes:new Set(G.spikes),walls:new Set(G.walls),fields:(G.fields||[]).map(f=>({...f,cells:[...f.cells]})),picks:G.picks,hasKey:G.hasKey,shield:G.shield,freeKills:G.freeKills};
  for(const k of SAVEKEYS){
    if(k==='depth'||k==='won'||k==='endless'||k==='diff')continue;
    o[k]=G[k]===undefined?undefined:JSON.parse(JSON.stringify(G[k]));
  }
  return o;
}
async function undoMove(){
  if(!G||G.over||G.busy||flipping||!G.last||G.undos<1)return;
  const o=G.last;G.last=null;G.undos--;
  Object.assign(G,o);
  sfx('undo');
  if(!viewCoord(view,G.pos))view=findViewFor(G.pos,view);
  setViewNow(view);floatText(G.pos,'Zurück','blue');
}
async function playerAct(t,pref){
  try{return await playerActInner(t,pref);}catch(e){console.error(e);if(G){G.busy=false;G.path=null;try{render();}catch(e2){}}return false;}
}
async function playerActInner(t,pref){
  if(!G||G.over)return false;
  if(G.busy||flipping){pending=()=>playerAct(t,pref);return false;}
  if(G.aiming){G.aiming=false;}
  if(G.paralyzed>0){G.paralyzed--;if(G.paralyzed<=0)G.stone=0;floatText(G.pos,'Festgehalten','blue');return waitTurn();}
  const P=G.pos;
  const m=monAt(t);
  const adj=reach1(P,t);
  const rng=!adj&&!!m&&reachOf()>=2&&lineN(P,t,reachOf());
  if(!adj&&!rng)return false;
  if(m&&MT[m.type].npc){openOasisShop();return false;}
  if(m&&G.noMelee){sfx('bump');floatText(t,'Kein Nahkampf','dim');setMsg('Zauberer kämpfen nur mit Zaubern. Tippe unten auf „Zauber“ und dann auf ein Ziel.');return false;}
  if(!m&&G.walls.has(t)){
    if(G.picks>0){
      G.busy=true;AU.unlock();G.last=snap();G.picks--;G.walls.delete(t);
      sfx('boom');floatText(t,'Zerschlagen','gold');burst(t,'#8b93ad',12);
      render();await sleep(90);await endTurn();return true;
    }
    sfx('bump');
    const el=cellEls.find(c=>+c.dataset.i===t);if(el)pulse(el,'bump',200);
    return false;
  }
  G.busy=true;AU.unlock();G.last=snap();
  faceHero(t);
  let free=false;
  if(m){
    const T=MT[m.type];
    sfx('hit');slash(t);lungeFx(entEls.get('hero'),P,t);
    let dmg=G.dmg+(G.fang?2:0);
    if(G.rage>0){dmg+=2;G.rage--;}
    if(G.hunter&&(T.flee||T.thief||m.carry))dmg*=2;
    if(G.fury&&G.hp*2<=G.maxhp)dmg+=1;
    if(m.cursed){dmg+=1;m.cursed=false;}
    if(G.assassin&&(m.stun>0||(T.sleep&&!m.awake)))dmg*=2;
    if(G.lucky>0){G.lucky--;dmg*=2;floatText(t,'Glück','gold');}
    if(G.exec&&m.hp*2<=(m.mx||T.hp))dmg++;
    if(G.crit&&Math.random()*100<G.crit*15){dmg*=2;floatText(t,'Krit','gold');}
    const killed=hitMonster(m,dmg,true);
    if(!killed){if(G.stun&&!T.boss)m.stun=1;if(G.poison)m.poison=2;if(G.gale&&!T.boss)knock(m,1);if(G.curse)m.cursed=true;if(rng&&G.harpoon)pull(m,1);}
    if(G.volt)for(const o of G.mons.slice())if(o!==m&&NB[m.pos].includes(o.pos))hitMonster(o,1,false);
    if(T.thorny&&adj&&!killed)hurtPlayer(1,null);
    if(killed&&G.freeKills>0&&!finalFight()){G.freeKills--;free=true;setMsg('Nachgesetzt. Dieser Zug war gratis.');}
    render();await sleep(killed?95:70);
  }else{
    G.pos=t;sfx('step');
    if(!viewCoord(view,t)){render();await flipView(findViewFor(t,view,pref),pref);}
    onEnter(t,P);
    if(G.hp>0&&!viewCoord(view,G.pos)&&lookPos!==G.pos){render();await flipView(findViewFor(G.pos,view));}
    render();await sleep(45);
    if(G.hp<=0){die();return true;}
    if(G.pos===G.exit){
      if(G.inOasis){leaveOasis();return true;}
      if(!G.keyNeeded||G.hasKey){completeLevel();return true;}
      if(G.lockpicks>0&&!G.boss){G.lockpicks--;floatText(t,'Dietrich','gold');completeLevel();return true;}
      setMsg('Die Treppe ist versiegelt. Finde den Schlüssel.');
    }
    G.steps++;
    if(finalFight()){/* der Urwuerfel erlaubt keine Gratis-Zuege */}
    else if(G.freeSteps>0){G.freeSteps--;free=true;}
    else if(G.swift&&G.steps%(5-G.swift)===0){free=true;floatText(G.pos,'Flink','blue');}
  }
  if(G.hp<=0){die();return true;}
  if(free){render();release();return true;}
  await endTurn();
  return true;
}
async function waitTurn(){
  if(!G||G.over)return;
  if(G.busy||flipping){pending=()=>waitTurn();return;}
  G.busy=true;AU.unlock();G.last=snap();sfx('wait');floatText(G.pos,'…','dim');
  if(G.cls==='waechter'){G.shield=Math.min(G.shield+1,G.shieldMax+2);floatText(G.pos,'Bollwerk','blue');sfx('block');}
  if(G.burn>0){G.burn=0;floatText(G.pos,'Gelöscht','blue');}
  await sleep(60);await endTurn();
}
function pathTo(target){
  const P=G.pos;
  const blocked=new Set([...G.walls,...G.mons.map(m=>m.pos)]);
  const noSpike=new Set([...blocked,...G.spikes,...(G.terrain?[...G.terrain.keys()]:[])]);
  for(const bl of [noSpike,blocked]){
    const prev=new Map([[P,-1]]);const q=[P];
    for(let h=0;h<q.length;h++){
      const c=q[h];if(c===target)break;
      for(const n of NB[c]){if(prev.has(n)||bl.has(n))continue;prev.set(n,c);q.push(n);}
      for(const [n,mids] of ND[c]){if(prev.has(n)||bl.has(n)||!mids.some(k=>!G.walls.has(k)))continue;prev.set(n,c);q.push(n);}
    }
    if(prev.has(target)){const path=[];let c=target;while(c!==P){path.push(c);c=prev.get(c);}return path.reverse();}
  }
  return null;
}
async function autoWalk(target){
  if(!G||G.over)return;
  if(G.busy||flipping)return;
  const path=pathTo(target);
  if(!path||!path.length){setMsg('Dorthin führt kein freier Weg.');sfx('bump');return;}
  walking=true;walkCancel=false;G.path=new Set(path);render();
  try{
    for(const step of path){
      if(walkCancel||!G||G.over)break;
      const hp0=G.hp,d0=G.depth;
      const ok=await playerAct(step);
      if(G&&G.path)G.path.delete(step);
      if(!ok||!G||G.over||G.busy||G.depth!==d0||G.hp<hp0)break;
      const dA=bfs(G.pos,null);
      if(G.mons.some(m=>(dA.get(m.pos)===undefined?99:dA.get(m.pos))<=2||m.aim||m.sa))break;
      await sleep(70);
    }
  }catch(e){console.error(e);if(G)G.busy=false;}
  finally{if(G){G.path=null;try{render();}catch(e){}}walking=false;walkCancel=false;}
}
function quickCast(i){
  if(G.busy||flipping)return;
  if(G.mana<2){setMsg('Zu wenig Mana. Es lädt sich mit jedem zweiten Zug auf.');sfx('bump');floatText(i,'Kein Mana','dim');return;}
  if(terrOf(G.pos)&&terrOf(G.pos).k==='water'){setMsg('Im Wasser kannst du nichts werfen. Schwimm erst ans Ufer.');sfx('bump');return;}
  const d=bfs(G.pos,null).get(i);
  if(d===undefined||d>AIM){setMsg('Zu weit weg für einen Angriff.');sfx('bump');floatText(i,'Zu weit','dim');return;}
  G.aiming=true;throwAt(i);
}
function tapCell(i){
  if(!G||G.over)return;
  {const vc=viewCoord(view,i);if(vc&&JUICE_OK())pulse(cellEls[vc.row*5+vc.col],'tapr',320);}
  if(walking){walkCancel=true;return;}
  const P=G.pos;
  if(i===P)return;
  const m=monAt(i);
  if(m&&G.cls==='zauberer'&&!MT[m.type].npc){quickCast(i);return;}
  const adj=reach1(P,i);
  if(adj){playerAct(i);return;}
  if(m){
    if(reachOf()>=2&&lineN(P,i,reachOf())){playerAct(i);return;}
    setMsg('Zu weit weg für einen Angriff.');sfx('bump');floatText(i,'Zu weit','dim');return;
  }
  if(G.walls.has(i)){sfx('bump');const el=cellEls.find(c=>+c.dataset.i===i);if(el)pulse(el,'bump',200);return;}
  autoWalk(i);
}
