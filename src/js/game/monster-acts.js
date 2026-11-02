/* src/js/game/monster-acts.js
   Gegner-Angriffe, Zustände (Gift, Brand) und die Zug-Entscheidung. */
function markEx(cat,id){if(!save.ex)save.ex={};const c=save.ex[cat]||(save.ex[cat]={});if(!c[id]){c[id]=1;persist();}}
const hasEx=(cat,id)=>!!(save.ex&&save.ex[cat]&&save.ex[cat][id]);
function noteState(k){if(!save.st)save.st={};if(!save.st[k]){save.st[k]=1;persist();}}
function setBurn(){noteState('brand');if(G.hp<=0||G.burn>0)return;G.burn=3;floatText(G.pos,'Feuer!','red');sfx('crackle');}
function setPoison(){noteState('gift');if(G.hp<=0)return;G.psn=Math.max(G.psn||0,3);floatText(G.pos,'Vergiftet','green');sfx('squelch');}
function strike(m,T){
  sfx('mhit',ZKIND[T.z||0]);atk(m);mfx(G.pos,T);
  if(hurtPlayer(dmgOf(m,T),m)){
    if(T.venom||T.toxic)setPoison();if(T.ignite)setBurn();
    if(T.greed&&G.money>0){const n=Math.min(G.money,(T.boss?14:8)+rnd(8));G.money-=n;m.purse=(m.purse||0)+n;floatText(G.pos,'-'+n+' Münzen','gold');sfx('coins');}
    if(T.inkspray)setInk();
    if(T.rewind&&G.hp>0)rewindHero();
  }
  if(T.hitrun)m.rt=2;
  if(T.steal&&G.bombs>0){G.bombs--;floatText(G.pos,'Bombe weg','red');}
  if(T.drain&&m.hp<(m.mx||T.hp)){m.hp++;floatText(m.pos,'+1','green');}
  if(T.thief&&!m.carry&&!T.boss)stealFrom(m);
  if(T.push&&G.hp>0)pushPlayer(m);
  if(T.shock&&G.hp>0&&!G.anchor){G.paralyzed=1;sfx('zap');floatText(G.pos,'Betäubt','blue');}
  if(T.slow&&(m.ph||1)<2)m.cd=1;
  return 2;
}
function act(m,dW,dA,d8){
  const T=MT[m.type],P=G.pos;
  if(T.npc)return 0;
  if(m.dormant){
    m.dz=(m.dz||0)+1;
    if(m.dz<90&&G.mons.some(o=>o!==m&&!MT[o.type].boss&&!o.decoy))return 0;
    m.dormant=false;floatText(m.pos,'Erwacht!','red');sfx('boss');flash();shake();burst(m.pos,T.col,16);setMsg(T.name==='Der Urwürfel'?'Der Urwürfel erwacht! Er durchschaut Tarnung, friert nicht ein und erlaubt keine Gratis-Züge.':T.name+' erwacht! '+(T.bm?BM_TXT[T.bm]:'Jetzt gibt es kein Zurück.'));return 2;
  }
  m.n=(m.n||0)+1;
  if(m.poison>0){m.poison--;if(hitMonster(m,1,false))return 2;}
  if(m.stun>0){if(isUrw(m)){m.stun=0;if(!m.immuneMsg){m.immuneMsg=1;floatText(m.pos,'Immun','gold');}}else{m.stun--;return 0;}}
  if(m.lure){
    if(m.lure.n--<=0)m.lure=null;
    else{
      if(m.pos===m.lure.c)return 0;
      const d=m.lure.d,cur=d.get(m.pos);
      const c=cur===undefined?[]:NB[m.pos].filter(n=>n!==G.pos&&!monAt(n)&&(T.ghost||!G.walls.has(n))&&d.get(n)<cur);
      if(c.length){goTo(m,pick(c));return G.mons.includes(m)?1:2;}
      return 0;
    }
  }
  if(T.sleep&&!m.awake){
    const d0=dA.get(m.pos);
    if(d0!==undefined&&d0<=3){m.awake=true;floatText(m.pos,'!','red');sfx('wake');return 1;}
    return 0;
  }
  if(m.rt>0){
    m.rt--;
    const cur=dA.get(m.pos)||0,away=NB[m.pos].filter(n=>n!==P&&!monAt(n)&&(FLY(m)||!G.walls.has(n))&&(dA.get(n)||0)>cur&&!avoidT(m,n));
    if(away.length){goTo(m,pick(away));return G.mons.includes(m)?1:2;}
  }
  if(T.boss){const ph=m.hp/m.mx>.66?1:m.hp/m.mx>.33?2:3;if(ph>(m.ph||1)){m.ph=ph;phaseUp(m);return 2;}}
  if(T.slow&&(m.ph||1)<2&&m.cd>0){m.cd--;return 0;}
  if(T.flee||m.carry)return fleeAct(m,T,dW);
  const mx=m.mx||T.hp;
  if(T.regen&&m.hp<mx&&m.n%3===0){m.hp++;floatText(m.pos,'+1','green');}
  if(T.boss&&bossMech(m,dA))return 2;
  if(T.boss&&bossMove(m))return 2;
  if(T.summon&&m.n%Math.max(2,(T.sumN||4)-((m.ph||1)-1))===0&&summon(m,T.summon)){if(T.slow&&(m.ph||1)<2)m.cd=1;return 2;}
  if(T.heal&&m.n%3===0){
    let any=false;
    for(const o of G.mons)if(o!==m&&NB[m.pos].includes(o.pos)&&o.hp<(o.mx||MT[o.type].hp)){o.hp++;floatText(o.pos,'+1','green');any=true;}
    if(any){sfx('heart');return 1;}
  }
  if(T.steam){
    if(m.sa){
      m.sa=false;sfx('steam');boomFx(m.pos,T);
      const d2=dA.get(m.pos);if(d2!==undefined&&d2<=2)hurtPlayer(T.dmg,m);
      if(T.slow&&(m.ph||1)<2)m.cd=1;return 2;
    }
    if(m.n%4===3){m.sa=true;sfx('aim');floatText(m.pos,'!','red');return 1;}
  }
  const dd=dA.get(m.pos);
  if(T.burrow&&!T.boss&&m.n%5===0&&dd!==undefined&&dd>=2){
    G.mons=G.mons.filter(x=>x!==m);limboAdd({kind:'burrow',m,t:3});floatText(m.pos,'Gräbt sich ein','red');sfx('dust');burst(m.pos,'#c9a45a',8);return 1;
  }
  if(T.tele&&m.n%3===0&&dd!==undefined&&dd>3&&blink(m,dA))return 1;
  if(T.siren){
    if(m.aim){
      m.aim=false;m.sn=3;sfx('lure');atk(m);noteState('gesang');
      const dm=bfs(m.pos,G.walls);let moved=0;
      for(let k=0;k<2&&G.hp>0;k++){
        const cur=dm.get(G.pos);if(cur===undefined||cur<=1)break;
        const c=NB[G.pos].filter(n=>dm.get(n)<cur&&!monAt(n)&&!G.walls.has(n));
        if(!c.length)break;
        const old=G.pos;G.pos=c[0];moved++;floatText(G.pos,'Gelockt','blue');landing(G.pos,old,1,false);
      }
      if(!moved)floatText(P,'Widerstanden','blue');
      return 2;
    }
    if(m.sn>0)m.sn--;
    else if(dd!==undefined&&dd>=3&&dd<=7){m.aim=true;sfx('aim');floatText(m.pos,'♪','blue');return 1;}
  }
  if(T.kite&&!m.aim&&dd!==undefined&&dd<=2&&m.n%2===0){
    const away=NB[m.pos].filter(n=>n!==P&&!monAt(n)&&!G.walls.has(n)&&(dA.get(n)||0)>dd&&!avoidT(m,n));
    if(away.length){goTo(m,pick(away));return G.mons.includes(m)?1:2;}
  }
  if(T.shoot){
    if(lineClear(m.pos,P,T.rng||4)){
      if(m.aim){m.aim=false;sfx(T.gaze?'zap':'shoot',ZKIND[T.z||0]);atk(m);shotFx(m.pos,P,T);
        if(T.gaze){if(!G.anchor){G.paralyzed=Math.max(G.paralyzed,1);G.stone=1;noteState('stein');floatText(G.pos,'Versteinert','blue');}else floatText(G.pos,'Anker hält','blue');}
        else{if(hurtPlayer(dmgOf(m,T),m)){if(T.ignite)setBurn();if(T.inkspray)setInk();if(T.rewind)rewindHero();}}
        if(T.slow&&(m.ph||1)<2)m.cd=1;return 2;}
      m.aim=true;sfx('aim');floatText(m.pos,'!','red');return 1;
    }
    m.aim=false;
    if(T.turret)return 0;
    if(m.mcd>0){m.mcd--;return 0;}
    m.mcd=1;
    return stepToward(m,dW,dA,d8)?1:0;
  }
  if(T.lob){
    if(m.aim){
      m.aim=false;sfx('boom');const ar=m.ar||[m.tg];for(const c of ar)boomFx(c,T);
      if(ar.includes(P)){if(hurtPlayer(T.dmg,m)&&T.ignite)setBurn();if(T.inkspray)setInk();}
      if(T.mire)addField('cloud',[...areaOf(m.tg,1)],3,m.tg);
      return 2;
    }
    if(T.inkspray){const cs=dd!==undefined&&dd<=2?sprayOf(m.pos,P):null;if(cs){m.aim=true;m.tg=P;m.ar=cs;sfx('aim');pulse(entEls.get(m.id),'throw',320);floatText(m.pos,'!','red');return 1;}}
    else if(dd!==undefined&&dd>=2&&dd<=5){m.aim=true;m.tg=P;m.ar=[...sqOf(m,P)];sfx('aim');pulse(entEls.get(m.id),'throw',320);lobFx(m.pos,P);floatText(m.pos,'!','red');return 1;}
  }
  if(T.charge&&!NB[m.pos].includes(P)){
    const c=rayHit(m.pos,P,5);
    if(c>=0){m.pos=c;m.stun=1;return strike(m,T);}
  }
  if(T.venom&&NB[m.pos].includes(P)){
    if(m.face===P){m.face=-1;return strike(m,T);}
    m.face=P;sfx('aim');floatText(m.pos,'!','red');return 1;
  }
  if(T.hop&&!NB[m.pos].includes(P)&&!(T.diag&&diagOK(m.pos,P))){
    if(m.n%2===1)return 0;
    let mv=stepToward(m,dW,dA,d8);
    if(G.mons.includes(m)&&!NB[m.pos].includes(P))mv=stepToward(m,dW,dA,d8)||mv;
    if(!G.mons.includes(m))return 2;
    if(mv)sfx('hop');
    return mv?1:0;
  }
  const adj=()=>NB[m.pos].includes(P)||(T.diag&&diagOK(m.pos,P));
  if(adj()&&!T.venom)return strike(m,T);
  if(T.turret)return 0;
  let moved=false;
  if(T.rand&&Math.random()<.4)moved=wander(m);
  else moved=stepToward(m,dW,dA,d8);
  if(!G.mons.includes(m))return 2;
  if(moved&&T.fast){
    if(adj())return strike(m,T);
    stepToward(m,dW,dA,d8);
    if(!G.mons.includes(m))return 2;
  }
  if(T.slow&&(m.ph||1)<2)m.cd=1;
  return moved?1:0;
}
