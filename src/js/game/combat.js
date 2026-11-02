/* src/js/game/combat.js
   Kampf: Schaden, Treffer und Tod von Gegnern. */
/* ================= Regeln ================= */
function hurtPlayer(n,src){
  if(n>0)hitStop(70);
  if(DEVBUILD&&G.god){floatText(G.pos,'Gott','blue');return false;}
  if(G.shell>0){G.shell--;floatText(G.pos,'Verfehlt','blue');sfx('block');return false;}
  if(G.dodge&&Math.random()*100<G.dodge*10){floatText(G.pos,'Ausgewichen','blue');sfx('block');return false;}
  if(G.shadow&&src&&(MT[src.type].shoot||MT[src.type].lob)&&Math.random()<.35){floatText(G.pos,'Verweht','blue');sfx('block');return false;}
  if(src&&src.type&&!MT[src.type].boss&&!MT[src.type].npc)n+=deepDmg();
  if(G.armor&&n>=2)n--;
  if(G.plate&&n<=1&&Math.random()<.4){floatText(G.pos,'Abgeprallt','blue');sfx('block');return false;}
  if(G.shield>0){G.shield--;floatText(G.pos,'Block','blue');sfx('block');return false;}
  G.hp=Math.max(0,G.hp-n);G.lvlLoss=(G.lvlLoss||0)+n;if(src&&src.type)G.lastHit=src.type;
  sfx('hurt');flash();shake();vibe(60);hurtFx('hero');
  floatText(G.pos,'-'+n,'red');burst(G.pos,'#e8553d',8);
  if(G.thorns&&src&&G.mons.includes(src))hitMonster(src,G.thorns2?2:1,false);
  if(G.gustshield&&src&&G.mons.includes(src)&&!MT[src.type].boss)knock(src,1);
  if(G.rod)for(const o of G.mons.slice())if(NB[G.pos].includes(o.pos))hitMonster(o,1,false);
  if(G.ink&&Math.random()<.5)G.cloak=Math.max(G.cloak,1);
  return true;
}
function comboKill(){
  G.combo=(G.lastKillTurn!=null&&G.turns-G.lastKillTurn<=1)?(G.combo||1)+1:1;G.lastKillTurn=G.turns;
  if(G.combo>=3){const b=G.combo*5;G.score+=b;floatText(G.pos,'Kombo x'+G.combo+'  +'+b,'gold big');sfx('key');if(G.combo>=5)shake();}
}
function limboAdd(e){(G.limbo=G.limbo||[]).push(e);}
function freeAround(c,diag){
  const L=[...NB[c]];if(diag)for(const x of ND[c].keys())L.push(x);
  return L.filter(x=>!monAt(x)&&x!==G.pos&&!G.walls.has(x)&&x!==G.exit);
}
function limboTick(){
  if(!G.limbo||!G.limbo.length)return;
  const keep=[];
  for(const e of G.limbo){
    e.t--;
    if(e.kind==='rise'){
      if(e.t>0){keep.push(e);continue;}
      const c=[e.pos,...freeAround(e.pos)].find(x=>x===e.pos?(!monAt(x)&&x!==G.pos&&!G.walls.has(x)):true);
      if(c!==undefined){const nm=mkMon(e.type,c,{risen:1,mcd:1});nm.hp=Math.max(1,Math.ceil(nm.hp/2));nm.mx=nm.hp;G.mons.push(nm);settle(nm);floatText(c,'Erhebt sich','red');sfx('wake');burst(c,MT[e.type].col,10);}
    }else if(e.kind==='burrow'){
      if(e.t===1){
        const cs=freeAround(G.pos,true);e.cell=cs.length?pick(cs):G.pos;
        floatText(e.cell,'Boden bebt','red');sfx('dust');keep.push(e);continue;
      }
      if(e.t>0){keep.push(e);continue;}
      const m=e.m,T=MT[m.type];let c=e.cell;
      if(c===G.pos){hurtPlayer(dmgOf(m,T),m);}
      if(c===undefined||c===G.pos||monAt(c)||G.walls.has(c)){const f=freeAround(G.pos,true);c=f.length?pick(f):undefined;}
      if(c!==undefined){m.pos=c;m.stun=1;G.mons.push(m);settle(m);burst(c,'#c9a45a',12);sfx('dust');floatText(c,'Auftauchen','red');
        if(T.boss&&(NB[c].includes(G.pos)||reach1(c,G.pos)))hurtPlayer(dmgOf(m,T),m);}
    }
  }
  G.limbo=keep;
}
function setInk(){G.ink=3;floatText(G.pos,'Tinte!','blue');sfx('bubble');}
function rewindHero(){
  const h=G.hist||[],t=h[h.length-3];
  if(t===undefined||t===G.pos||monAt(t)||G.walls.has(t))return;
  G.pos=t;floatText(t,'Zurückgespult','blue');sfx('undo');landing(t,undefined,1,false);
}
function onSurvive(m,T,byPlayer){
  if(!byPlayer||!G.mons.includes(m))return;
  if(T.sparks){const cs=NB[m.pos].filter(n=>n!==G.pos&&!G.walls.has(n));if(cs.length){addField('fire',cs,2,m.pos);floatText(m.pos,'Funken','red');sfx('crackle');}}
  if(T.phase){
    const dd=bfs(G.pos,G.walls);
    const cand=shuffle([...dd].filter(([x,k])=>k>=2&&k<=4&&!monAt(x)&&!G.walls.has(x)&&!G.spikes.has(x)&&x!==G.exit).map(x=>x[0]));
    if(cand.length){burst(m.pos,'#b890ff',8);m.pos=cand[0];sfx('blink');floatText(m.pos,'Leerenschritt','blue');settle(m);}
  }
}
function deathFx(m,T){
  const c=m.pos,adjM=G.mons.filter(o=>NB[c].includes(o.pos)||ND[c].has(o.pos));
  const heroNear=NB[c].includes(G.pos)||ND[c].has(G.pos);
  const d=T.dies;
  if(d==='bones'){if(Math.random()<.3&&!G.items.has(c)&&!G.walls.has(c)){G.items.set(c,'heart');floatText(c,'Herz','green');}}
  else if(d==='coins'){const fr=shuffle(NB[c].filter(n=>!G.items.has(n)&&!G.walls.has(n)&&n!==G.pos&&!G.spikes.has(n))).slice(0,2);for(const n of fr)G.items.set(n,'coin');if(fr.length){sfx('coins');floatText(c,'Münzen','gold');}}
  else if(d==='sand'){if(!G.terrain.has(c)&&!G.walls.has(c)&&c!==G.exit){G.terrain.set(c,{k:'quick',d:-1});floatText(c,'Treibsand','red');}}
  else if(d==='spore'){addField('cloud',[...areaOf(c,1)].filter(x=>x!==G.pos),3,c);floatText(c,'Sporen','green');sfx('spore');}
  else if(d==='gale'){sfx('gust');floatText(c,'Windstoß','blue');for(const o of adjM)if(!MT[o.type].boss)knock(o,2);if(heroNear)pushPlayer({pos:c});}
  else if(d==='gear'){G.freeSteps+=2;floatText(G.pos,'+2 Schritte','blue');sfx('key');}
  else if(d==='frost'){sfx('ice');for(const o of adjM)if(!MT[o.type].boss)o.stun=Math.max(o.stun||0,2);floatText(c,'Frost','blue');addField('ice',areaOf(c,1),2,c);}
  else if(d==='wave'){sfx('bubble');floatText(c,'Welle','blue');for(const o of adjM)if(!MT[o.type].boss)knock(o,1);if(G.burn>0){G.burn=0;floatText(G.pos,'Gelöscht','blue');}}
  else if(d==='ember'){addField('fire',[...areaOf(c,1)].filter(x=>x!==G.pos),3,c);floatText(c,'Flammen','red');sfx('crackle');}
  else if(d==='void'){
    if(heroNear&&!G.anchor){
      const dd=bfs(G.pos,G.walls);
      const cand=shuffle([...dd].filter(([x,k])=>k>=2&&k<=4&&!monAt(x)&&!G.walls.has(x)&&!G.spikes.has(x)&&x!==c).map(x=>x[0]));
      if(cand.length){const old=G.pos;G.pos=cand[0];sfx('blink');floatText(G.pos,'Leerensog','blue');landing(G.pos,old,1,false);}
    }
  }
}
function hitMonster(m,dmg,byPlayer){
  const T=MT[m.type];
  if(T.npc)return false;
  if(m.dormant){floatText(m.pos,'Erstarrt','blue');sfx('block');return false;}
  if(T.bm==='ward'&&G.mons.some(o=>o.owner===m.id)){dmg=Math.max(1,Math.ceil(dmg/2));floatText(m.pos,'Schild','blue');}
  if(T.bm==='shell'&&!(m.vuln>0)){m.sh=(m.sh===undefined?3:m.sh)-1;floatText(m.pos,'Glas','blue');sfx('block');if(m.sh<=0){m.vuln=3;m.sh=3;floatText(m.pos,'Zerbrochen!','red');sfx('shatter');}return false;}
  if(T.armor&&!(byPlayer&&G.torch))dmg=Math.max(1,dmg-T.armor);
  m.hp-=dmg;
  floatText(m.pos,'-'+dmg,dmg>=3?'gold big':'gold');
  hurtFx(m.id);
  if(T.bm==='gustback'&&byPlayer&&m.hp>0&&NB[m.pos].includes(G.pos))pushPlayer(m);
  if(T.boss||dmg>=3)shake();
  if(m.hp>0){burst(m.pos,'#ffffff',4);onSurvive(m,T,byPlayer);return false;}
  if(T.bm==='rebirth'&&!m.reborn){m.reborn=1;m.hp=Math.ceil(m.mx*.5);floatText(m.pos,'Aus der Asche!','red');sfx('boss');flash();addField('fire',[...areaOf(m.pos,1)].filter(x=>x!==G.pos&&x!==m.pos),3,m.pos);return false;}
  G.mons=G.mons.filter(x=>x!==m);shockRing(m.pos,T.col||'#ffffff');hitStop(T.boss?120:55);
  if(T.boss)G.mons=G.mons.filter(o=>!o.decoy);
  if(T.rise&&!m.risen&&!T.boss)limboAdd({kind:'rise',type:m.type,pos:m.pos,t:3});
  if(m.purse){G.money+=m.purse;floatText(m.pos,'+'+m.purse,'gold');}
  const pts=Math.round(T.pts*(G.soul?1.5:1));
  trackKill(m);G.kills++;if(G.cls==='alchemist')alchGain(m);G.score+=pts;G.money+=Math.max(1,Math.round(T.pts/25*(G.loot?1.5:1)*DF().money*(1+.1*metaMul('greed'))));G.killCount++;
  burst(m.pos,T.col,14);sfx('kill',ZKIND[T.z||0]);if(T.z>0)mfx(m.pos,T);
  if(T.boss){G.hasKey=true;setMsg('Der Boss fällt. Die Treppe ist offen.');sfx('key');shake();}
  if(m.elite&&!G.hasKey)goalOpen('Der Anführer fällt. Die Treppe ist offen.');
  goalCheck();
  floatText(m.pos,'+'+pts,'gold');
  comboKill();
  if(G.leech&&G.killCount%3===0&&G.hp<G.maxhp){G.hp++;floatText(G.pos,'+1','green');}
  if(byPlayer&&G.spark&&Math.random()<.3&&G.hp<G.maxhp){G.hp++;floatText(G.pos,'+1','green');}
  if(T.loot){const n=Math.round(T.loot*(G.loot?1.5:1));G.money+=n;floatText(m.pos,'+'+n,'gold');sfx('coin');}
  if(m.carry)giveBack(m.carry,m.pos);
  if(byPlayer&&G.chain)G.freeSteps++;
  if(byPlayer&&G.feast&&G.killCount%2===0&&G.hp<G.maxhp){G.hp++;floatText(G.pos,'+1','green');}
  if(byPlayer&&G.splash)for(const o of G.mons.slice())if(NB[m.pos].includes(o.pos))hitMonster(o,1,false);
  if(T.dies)deathFx(m,T);
  if(T.split){
    const fr=shuffle(NB[m.pos].filter(n=>n!==G.pos&&!monAt(n)&&!G.walls.has(n)));
    for(const c of fr.slice(0,2)){const nm=mkMon(T.split,c,{mcd:1,stun:1});G.mons.push(nm);settle(nm);}
    if(fr.length){burst(m.pos,T.col,8);sfx('split');}
  }
  if(T.boom){
    sfx('boom');boomFx(m.pos,T);
    if(reach1(m.pos,G.pos)||m.pos===G.pos)hurtPlayer(1,null);
  }
  return true;
}
/* ===== Feinschliff: Treffer-Stopp, Stoßring, Flug zur Anzeige, Staub, Zähler ===== */
