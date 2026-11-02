/* src/js/game/monster-ai-boss.js
   Gegner-Bewegung, Fluchtverhalten und Boss-Mechaniken. */
function moveCands(m){
  const T=MT[m.type];
  if(!T.diag)return NB[m.pos].filter(n=>!avoidT(m,n));
  return NB[m.pos].concat([...ND[m.pos]].filter(([n,mids])=>T.ghost||mids.some(c=>!G.walls.has(c))).map(x=>x[0])).filter(n=>!avoidT(m,n));
}
function stepToward(m,dW,dA,d8){
  const T=MT[m.type];
  const d=T.ghost?dA:(T.diag?d8:dW);
  const cur=d.get(m.pos);if(cur===undefined)return false;
  let best=[],bd=cur;
  for(const n of moveCands(m)){
    if(n===G.pos||monAt(n))continue;
    if(!T.ghost&&G.walls.has(n))continue;
    if(G.spikes.has(n)&&!T.dumb&&!T.ghost)continue;
    if(avoidT(m,n))continue;
    const dn=d.get(n);if(dn===undefined)continue;
    if(dn<bd){bd=dn;best=[n];}else if(dn===bd&&best.length)best.push(n);
  }
  if(!best.length)return false;
  return goTo(m,pick(best));
}
function goTo(m,c){
  const T=MT[m.type],old=m.pos;
  m.last=old;m.pos=c;
  if(T.icy&&old!==G.exit&&old!==G.pos&&!G.walls.has(old)&&G.terrain&&!G.terrain.has(old)&&G.terrain.size<40)G.terrain.set(old,{k:'slick',d:-1});
  if(T.trail&&old!==G.exit&&!G.items.has(old)&&!G.spikes.has(old)&&old!==G.pos&&G.spikes.size<14)G.spikes.add(old);
  settle(m);
  return true;
}
function wander(m){
  const T=MT[m.type];
  const fr=moveCands(m).filter(n=>n!==G.pos&&!monAt(n)&&(T.ghost||!G.walls.has(n))&&(T.ghost||T.dumb||!G.spikes.has(n)));
  if(!fr.length)return false;
  return goTo(m,pick(fr));
}
function blink(m,dA){
  const c=SHELL.filter(i=>{const dd=dA.get(i);return dd!==undefined&&dd>=2&&dd<=3&&!G.walls.has(i)&&!monAt(i)&&!G.spikes.has(i)&&i!==G.exit&&i!==G.pos;});
  if(!c.length)return false;
  pulse(entEls.get(m.id),'blink',450);burst(m.pos,MT[m.type].col,6);m.pos=pick(c);settle(m);burst(m.pos,MT[m.type].col,8);sfx('blink');
  return true;
}
function summon(m,type){
  if(MT[m.type].boss&&G.mons.filter(o=>o.owner===m.id).length>=2)return false;
  const fr=NB[m.pos].filter(n=>n!==G.pos&&!monAt(n)&&!G.walls.has(n));
  if(!fr.length)return false;
  const c=pick(fr);
  {const nm=mkMon(type,c,{mcd:1,owner:m.id});G.mons.push(nm);settle(nm);}
  sfx('summon');pulse(entEls.get(m.id),'casting',500);burst(c,MT[type].col,8);floatText(m.pos,'!','red');
  return true;
}
const REVOKE={
  blade:()=>{G.dmg--;},spear:()=>{G.spear=false;},shield:()=>{G.shieldMax--;},thorns:()=>{if(!G.thorns2)G.thorns=false;},leech:()=>{G.leech=false;},chase:()=>{G.chase--;},time:()=>{G.undoBonus--;},
  crit:()=>{G.crit--;},armor:()=>{G.armor=false;},rest:()=>{G.rest--;},sling:()=>{G.sling=false;},boots:()=>{G.boots=false;},wide:()=>{G.wide=false;},
  stun:()=>{G.stun=false;},splash:()=>{G.splash=false;},regen:()=>{G.regen--;},dodge:()=>{G.dodge--;},gold:()=>{G.gold--;},pick:()=>{G.pickN--;},
  phoenix:()=>{G.phoenix=false;},swift:()=>{G.swift--;},frost:()=>{G.frost--;},poison:()=>{G.poison=false;},soul:()=>{G.soul=false;},thorns2:()=>{G.thorns2=false;if(!(G.ups.thorns>0))G.thorns=false;},
  exec:()=>{G.exec=false;},spark:()=>{G.spark=false;},fang:()=>{G.fang=false;},master:()=>{G.master=false;},
  veil:()=>{G.veil=false;},curse:()=>{G.curse=false;},oasis:()=>{G.oasis--;},maprel:()=>{G.maprel=false;},sandy:()=>{G.sandy=false;},assassin:()=>{G.assassin=false;},gears:()=>{G.gears=false;},rod:()=>{G.rod=false;},torch:()=>{G.torch=false;},spare:()=>{G.spare=false;},lens:()=>{G.lens=false;},chain:()=>{G.chain=false;},pearl:()=>{G.pearl=false;},ink:()=>{G.ink=false;},harpoon:()=>{G.harpoon=false;},feast:()=>{G.feast=false;},volt:()=>{G.volt=false;},anchor:()=>{G.anchor=false;},
  gale:()=>{G.gale=false;},gustshield:()=>{G.gustshield=false;},tailwind:()=>{G.tailwind--;},sack:()=>{G.sack--;},shadow:()=>{G.shadow=false;},fury:()=>{G.fury=false;},
  loot:()=>{G.loot=false;},haggle:()=>{G.haggle--;},income:()=>{G.income--;},net:()=>{G.net=false;},hunter:()=>{G.hunter=false;}
};
function stealFrom(m){
  const rel=UPS.filter(u=>REVOKE[u.id]&&(G.ups[u.id]||0)>0);
  const opts=[];
  if(rel.length)opts.push('relic','relic');
  if(G.bombs>0)opts.push('ammo');
  if(G.money>=20)opts.push('money');
  if(!opts.length)return;
  const k=pick(opts);
  if(k==='relic'){const u=pick(rel);REVOKE[u.id]();G.ups[u.id]--;m.carry={k,id:u.id,name:u.name};}
  else if(k==='ammo'){m.carry={k,n:G.bombs,name:G.bombs+' Wurf-Items'};G.bombs=0;}
  else{const n=Math.floor(G.money*.4);G.money-=n;m.carry={k,n,name:n+' Münzen'};}
  m.esc=30;sfx('steal');floatText(G.pos,'Geklaut!','red');setMsg('Der Dieb stiehlt: '+m.carry.name+'. Fang ihn, sonst ist es weg!');
}
function giveBack(c,pos){
  if(c.k==='relic'){const u=UPS.find(x=>x.id===c.id);if(u){u.apply();G.ups[c.id]=(G.ups[c.id]||0)+1;}}
  else if(c.k==='ammo')G.bombs+=c.n;
  else G.money+=c.n;
  floatText(pos,c.name,'gold');setMsg('Beute zurück: '+c.name+'.');
}
function fleeAct(m,T,dW){
  m.esc=(m.esc===undefined?36:m.esc)-1;
  if(m.esc<=0){
    G.mons=G.mons.filter(x=>x!==m);burst(m.pos,T.col,10);floatText(m.pos,m.carry?'Entkommen!':'Weg','red');
    if(m.carry)setMsg('Der Dieb ist mit '+m.carry.name+' entkommen.');
    return 2;
  }
  if(m.n%(G.net?2:3)===0)return 0;
  const cur=dW.get(m.pos);
  let best=[],bd=cur===undefined?-1:cur;
  for(const n of NB[m.pos]){
    if(n===G.pos||monAt(n)||G.walls.has(n)||G.spikes.has(n)||avoidT(m,n))continue;
    const dn=dW.get(n);if(dn===undefined)continue;
    if(dn>bd){bd=dn;best=[n];}else if(dn===bd&&best.length)best.push(n);
  }
  if(best.length){goTo(m,pick(best));return G.mons.includes(m)?1:2;}
  if(NB[m.pos].includes(G.pos))return strike(m,T);
  return 0;
}
function knock(m,steps){
  for(let i=0;i<steps;i++){
    if(!G.mons.includes(m))return;
    const T=MT[m.type],dd=bfs(G.pos,null),cur=dd.get(m.pos)||0;
    const c=NB[m.pos].filter(n=>n!==G.pos&&!monAt(n)&&(T.ghost||!G.walls.has(n))&&(dd.get(n)||0)>cur);
    if(!c.length){if(i<steps){floatText(m.pos,'Aufprall','red');hitMonster(m,2,false);}return;}
    m.pos=pick(c);settle(m);
  }
  if(G.mons.includes(m))m.stun=Math.max(m.stun||0,1);
}
function pushPlayer(m){
  if(G.anchor)return;
  const P=G.pos,dm=bfs(m.pos,null);
  const c=NB[P].filter(n=>n!==m.pos&&!monAt(n)&&!G.walls.has(n)&&viewCoord(view,n)&&(dm.get(n)||0)>(dm.get(P)||0));
  if(!c.length)return;
  G.pos=pick(c);sfx('push');floatText(G.pos,'Wumm','blue');pulse(entEls.get('hero'),'pushed',320);
  const it=G.items.get(G.pos);
  if(G.spikes.has(G.pos)&&!G.boots){sfx('spike');hurtPlayer(1,null);}
  if(it==='altar')setTimeout(()=>openAltar(G.pos),250);
  else if(typeof it==='string'&&/^rn\d$/.test(it))runeTouch(G.pos,it);
  else if(it){G.items.delete(G.pos);pickup(it,G.pos);}
}
function dmgOf(m,T){return T.dmg+(T.boss&&(m.ph||1)>=3?1:0);}
function phaseUp(m){
  const T=MT[m.type];
  floatText(m.pos,m.ph>=3?'RASEREI!':'WUT!','red');flash();shake();sfx('boss');
  setMsg(T.name+': '+(m.ph>=3?'Letzte Phase! ':'Zweite Phase! ')+(bossMoves(T)?'Neue Angriffe. ':'')+(m.ph>=3?'Mehr Schaden.':''));
  m.cd=0;m.bt=null;burst(m.pos,T.col,18);bossPhase(m);
}
function bossCells(m,pat,arg){
  const P=G.pos;let cs=new Set();
  if(pat==='ring'){cs=areaOf(m.pos,arg);cs.delete(m.pos);}
  else if(pat==='line'){
    const dd=bfs(P,null);let bd=-1,bv=1e9;
    DIRS.forEach((d,i)=>{const nx=tstep(m.pos,d);if(nx>=0&&(dd.get(nx)===undefined?99:dd.get(nx))<bv){bv=dd.get(nx);bd=i;}});
    let cur=m.pos;for(let k=0;k<arg&&bd>=0;k++){const nx=tstep(cur,DIRS[bd]);if(nx<0)break;cs.add(nx);cur=nx;}
  }else if(pat==='rain'){
    const dd=bfs(P,null);
    const cand=shuffle(SHELL.filter(i=>(dd.get(i)||99)<=4&&!G.walls.has(i)&&i!==G.exit&&i!==m.pos&&i!==P));
    cs.add(P);for(const c of cand.slice(0,arg-1))cs.add(c);
  }else cs=areaOf(m.pos,1);
  return cs;
}
function execBoss(m,t){
  const T=MT[m.type],dm=dmgOf(m,T),kz={z:T.z};
  shake();
  if(t.pat==='ring'||t.pat==='line'||t.pat==='rain'){
    sfx(t.fx==='fire'?'fireball':t.fx==='ice'?'shatter':t.fx==='bolt'?'zap':t.fx==='steam'?'steam':t.fx==='sand'?'dust':t.fx==='wind'?'gust':t.fx==='void'?'voidzap':t.fx==='bubble'?'bubble':t.fx==='spore'?'spore':t.fx==='coins'?'coins':'boom');
    let n=0;for(const c of t.cells){if(n++<10)boomFx(c,kz);}
    if(t.fx==='fire')addField('fire',t.cells,3,m.pos);
    if(t.cells.has(G.pos)){
      floatText(G.pos,t.name,'red');
      if(hurtPlayer(dm,m)&&(t.fx==='ice'||t.fx==='sand')&&!G.anchor){G.paralyzed=Math.max(G.paralyzed,1);floatText(G.pos,'Gelähmt','blue');}
    }
  }else if(t.pat==='pull'){
    sfx('voidzap');boomFx(m.pos,kz);
    const dm0=bfs(m.pos,null);
    for(let i=0;i<t.arg;i++){
      const cur=dm0.get(G.pos);if(cur===undefined||cur<=1)break;
      const c=NB[G.pos].filter(n=>!monAt(n)&&!G.walls.has(n)&&(dm0.get(n)||99)<cur);if(!c.length)break;
      G.pos=pick(c);
    }
    floatText(G.pos,t.name,'red');landing(G.pos,undefined,0,false);
    if(NB[m.pos].includes(G.pos)||reach1(m.pos,G.pos))hurtPlayer(dm,m);
  }else if(t.pat==='push'){
    sfx('gust');boomFx(m.pos,kz);for(let i=0;i<t.arg;i++)pushPlayer(m);hurtPlayer(1,m);
  }else if(t.pat==='stasis'){
    sfx('steam');boomFx(m.pos,kz);
    if(!G.anchor){G.paralyzed=Math.max(G.paralyzed,t.arg);floatText(G.pos,t.name,'blue');}else floatText(G.pos,'Anker hält','blue');
  }else if(t.pat==='wave'){
    for(let i=0;i<t.arg;i++)summon(m,T.summon);
  }else if(t.pat==='chaos'){
    sfx('voidzap');boomFx(m.pos,kz);
    const dd=bfs(G.pos,null);
    const cs=shuffle(SHELL.filter(i=>!G.walls.has(i)&&!monAt(i)&&i!==G.exit&&i!==m.pos));
    for(const o of G.mons.slice()){if(o===m)continue;const c=cs.pop();if(c!==undefined){o.pos=c;settle(o);}}
    const c=cs.pop();if(c!==undefined){G.pos=c;floatText(G.pos,t.name,'red');landing(G.pos,undefined,0,false);}
  }
}
function addTemp(cells,kind,ttl){
  const l=[];
  for(const c of cells)if(!G.walls.has(c)&&c!==G.exit&&c!==undefined&&!G.terrain.has(c)){G.terrain.set(c,{k:kind,d:-1,tmp:1});l.push(c);}
  if(l.length)(G.temps=G.temps||[]).push({cells:l,kind,ttl});
}
function tempTick(){
  if(!G.temps||!G.temps.length)return;
  for(const t of G.temps)t.ttl--;
  for(const t of G.temps)if(t.ttl<=0)for(const c of t.cells){const x=G.terrain.get(c);if(x&&x.tmp&&x.k===t.kind)G.terrain.delete(c);}
  G.temps=G.temps.filter(t=>t.ttl>0);
}
function reshuffleWalls(){
  const keep=new Set([G.pos,G.exit,...G.mons.map(x=>x.pos),...G.items.keys(),...G.spikes]);
  for(let a=0;a<8;a++){
    const nw=new Set(shuffle(SHELL.filter(i=>!keep.has(i))).slice(0,Math.max(8,G.walls.size)));
    const d=bfs(G.pos,nw);
    if(d.get(G.exit)!==undefined&&[...G.items.keys()].every(k=>d.get(k)!==undefined)){G.walls=nw;for(const c of nw)G.terrain.delete(c);return true;}
  }
  return false;
}
function bossTele(m,kind,cells,txt){
  const T=MT[m.type];m.bk={kind,cells:new Set(cells)};sfx('aim');floatText(m.pos,'!','red');setMsg(T.name+': '+txt);
}
function bossExec(m,k){
  const T=MT[m.type],dm=dmgOf(m,T);
  if(k.kind==='bolt'){
    boltFx(m.pos,G.pos);sfx('zap');shake();
    if(k.cells.has(G.pos)){
      if(NB[G.pos].some(n=>G.walls.has(n))){floatText(G.pos,'Abgeleitet','blue');}
      else{floatText(G.pos,'Blitzschlag','red');hurtPlayer(dm,m);}
    }
  }else if(k.kind==='rewind'){
    rewindHero();if(m.hp<(m.mx||T.hp)){m.hp=Math.min(m.mx,m.hp+2);floatText(m.pos,'+2','green');}
  }else if(k.kind==='clock'){
    let n=0;for(const c of k.cells)if(n++<8)boomFx(c,{z:T.z});
    sfx('steam');if(k.cells.has(G.pos)){floatText(G.pos,'Zeiger','red');hurtPlayer(dm,m);}
  }else if(k.kind==='lava'){
    sfx('fireball');shake();addTemp(k.cells,'lava',5);
    if(k.cells.has(G.pos)){const x=G.terrain.get(G.pos);if(x&&x.tmp){floatText(G.pos,'Lava','red');hurtPlayer(dm,m);}}
  }else if(k.kind==='shift'){
    sfx('voidzap');shake();if(reshuffleWalls())floatText(m.pos,'Die Welt kippt','red');
  }
}
function bossPhase(m){
  const T=MT[m.type],bm=T.bm;
  if(bm==='hoard'&&m.purse>0){const f=shuffle(freeAround(m.pos,true)).slice(0,4);for(const c of f)if(!G.items.has(c))G.items.set(c,'coin');m.purse=Math.max(0,m.purse-40);floatText(m.pos,'Münzen!','gold');}
  else if(bm==='devour'){const f=shuffle(freeAround(m.pos,true)).slice(0,3);for(const c of f)if(!G.items.has(c))G.items.set(c,'coin');}
  else if(bm==='decoys')spawnDecoys(m,2);
  else if(bm==='vines')growVines(m);
  else if(bm==='iceflood')addTemp([...areaOf(m.pos,2)].filter(x=>x!==m.pos),'slick',8);
}
function spawnDecoys(m,n){
  const f=shuffle(freeAround(m.pos,true)).slice(0,n);
  for(const c of f){const d=mkMon('decoy',c,{skin:m.type,mcd:1});G.mons.push(d);settle(d);burst(c,MT[m.type].col,8);}
  if(f.length){sfx('summon');floatText(m.pos,'Trugbilder','red');}
}
function growVines(m){
  const cs=shuffle([...areaOf(G.pos,2)].filter(x=>x!==G.pos&&x!==m.pos&&!monAt(x))).slice(0,6);
  addTemp(cs,'vines',12);sfx('squelch');floatText(G.pos,'Ranken wachsen','red');
}
function bossMech(m,dA){
  const T=MT[m.type],bm=T.bm;if(!bm)return false;
  const n=m.n,dd=dA.get(m.pos);
  if(m.bk){const k=m.bk;m.bk=null;bossExec(m,k);if(G.hp<=0)return true;}
  if(bm==='devour'){
    for(const c of areaOf(m.pos,2)){if(G.items.get(c)==='coin'){G.items.delete(c);m.hp=Math.min(m.mx||T.hp,m.hp+2);floatText(m.pos,'+2','green');sfx('coins');break;}}
  }else if(bm==='decoys'){if(n%8===0)spawnDecoys(m,2);}
  else if(bm==='burrowb'){
    if(n%6===0&&dd!==undefined&&dd>=2){G.mons=G.mons.filter(x=>x!==m);limboAdd({kind:'burrow',m,t:3});floatText(m.pos,'Gräbt sich ein','red');setMsg(T.name+': Er gräbt sich ein! Weich dem Beben aus.');sfx('dust');return true;}
  }else if(bm==='vines'){if(n%7===0)growVines(m);}
  else if(bm==='bolt'){if(n%4===3){bossTele(m,'bolt',[G.pos],'Blitz! Nur neben einer Wand bist du sicher.');}}
  else if(bm==='rewindb'){if(n%5===4){bossTele(m,'rewind',[],'Die Zeit dreht sich zurück!');}}
  else if(bm==='clock'){
    m.hand=((m.hand||0)+1)%6;const cs=[];let cur=m.pos;
    for(let k=0;k<5;k++){const nx=tstep(cur,DIRS[m.hand],new Set());if(nx<0)break;cs.push(nx);cur=nx;}
    bossTele(m,'clock',cs,'Der Zeiger schlägt zu!');
  }else if(bm==='shell'){if(m.vuln>0){m.vuln--;if(m.vuln===0){m.sh=3;floatText(m.pos,'Glasschild','blue');}}}
  else if(bm==='iceflood'){if(n%8===0)addTemp([...areaOf(m.pos,2)].filter(x=>x!==m.pos),'slick',8);}
  else if(bm==='tide'){if(n%6===0){addTemp(areaOf(m.pos,3),'water',4);sfx('bubble');floatText(m.pos,'Flut','blue');setMsg(T.name+': Die Flut steigt! Im Wasser kannst du nichts werfen.');}}
  else if(bm==='inkb'){if(n%5===0){G.ink=4;floatText(G.pos,'Tinte!','blue');sfx('bubble');setMsg(T.name+': Alles wird dunkel. Du siehst nur Nachbarn.');}}
  else if(bm==='lava'){if(n%7===4){const cs=[...areaOf(m.pos,3)].filter(x=>x!==m.pos&&!areaOf(m.pos,1).has(x));bossTele(m,'lava',cs,'Der Boden glüht! Lava steigt auf.');}}
  else if(bm==='gravity'){
    if(dd!==undefined&&dd>=2){
      const dm0=bfs(m.pos,null),cur=dm0.get(G.pos);
      if(cur!==undefined&&cur>1){const c=NB[G.pos].filter(x=>!monAt(x)&&!G.walls.has(x)&&(dm0.get(x)||99)<cur);if(c.length){const old=G.pos;G.pos=pick(c);floatText(G.pos,'Sog','blue');sfx('voidzap');landing(G.pos,old,1,false);}}
    }
  }else if(bm==='worldshift'){if(n%6===5){bossTele(m,'shift',[],'Die Welt kippt!');}}
  return false;
}
function bossMove(m){
  const T=MT[m.type],mv=bossMoves(T);
  if(!mv||((m.ph||1)<2&&T.bm!=='dieroll'))return false;
  if(m.bt){const t=m.bt;m.bt=null;execBoss(m,t);return true;}
  m.bn=(m.bn||0)+1;
  if(m.bn%3!==0)return false;
  const def=T.bm==='dieroll'?pick(DIEMOVES):(m.ph>=3&&Math.random()<.55)?mv[1]:mv[0];
  if(T.bm==='dieroll')floatText(m.pos,'⚄ '+(1+rnd(6)),'gold');
  m.bt={name:def[0],pat:def[1],arg:def[2],fx:def[3],cells:bossCells(m,def[1],def[2])};
  sfx('aim');floatText(m.pos,'!','red');setMsg(T.name+': '+def[0]+'!');
  return true;
}
