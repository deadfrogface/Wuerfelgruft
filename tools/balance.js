#!/usr/bin/env node
/* Balance-Bot: spielt ganze Läufe fair (kein Dauer-Leben, nutzt Klassenfähigkeiten, Verstärkungen und Händler)
   und zeigt je Klasse/Schwierigkeit, wie tief er kommt, woran er stirbt und wie viel Schaden jede Etage macht.
   Start: python3 tools/build_test.py && node tools/balance.js --runs=6 --maxdepth=40 --diff=normal --classes=krieger,zauberer
   Optionen: --runs (je Klasse und Stufe), --maxdepth, --diff (Liste), --classes (Liste), --par (parallele Seiten), --cap (Aktionen je Etage bis "hängt") */
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return [k,v===undefined?true:v];}));
const CLASSES=(A.classes||'krieger,zauberer,jaeger,schatz,dieb,waechter,alchemist').split(',');
const DIFFS=(A.diff||'normal').split(',');
const RUNS=+(A.runs||4),MAXD=+(A.maxdepth||40),PAR=+(A.par||3),CAP=+(A.cap||320);

/* Wird im Browser ausgeführt. Der Bot spielt klassenspezifisch: Schattenschritt als Flucht und für Gratis-Treffer, Fallen vor
   anrückenden Gegnern, Warten für Blöcke beim Wächter, Mana-Management ohne Nahkampf beim Zauberer, Tränke und Münzwürfe auf Distanz. */
async function botRun(cfg){
  const w=window.__wg;window.__fast=true;
  const y0=()=>new Promise(r=>setTimeout(r,0));
  const S=w.save;S.settings.lite=true;S.settings.tips=false;S.settings.sfx=false;S.settings.music=false;
  S.bestDepth=100;S.mr={xp:1e7,got:{}};S.run=null;S.cls=cfg.cls;S.diff=cfg.diff;S.mut='';S.meta=S.meta||{};
  document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'));
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id==='scr-game'));
  w.newRun();
  const res={cls:cfg.cls,asked:cfg.cls,diff:cfg.diff,depth:1,over:false,won:false,capped:false,stuck:false,cause:'',turns:0,score:0,actions:0,dmg:{},abil:0,kills:0};
  res.cls=w.G.cls;
  const MT=w.MT,NB=w.NB;
  let lvlActs=0,lastPos=-1,same=0,lastDepth=0,prevHp=null,prevDepth=0,waits=0,recent=[],commit=0,commitDirect=0,detour=null,detourN=0,dbgDest=null;
  const GOODP=/^p_|^chest$|^heart$|^coin$/;
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const awakeMons=()=>w.G.mons.filter(m=>!MT[m.type].npc&&!MT[m.type].decoy&&!m.dormant&&!(MT[m.type].sleep&&!m.awake));
  function nearest(P,list){const d=w.bfs(P,null);let best=null,bd=1e9;for(const m of list){const x=d.get(m.pos);if(x!==undefined&&x<bd){bd=x;best=m;}}return best?{m:best,d:bd}:null;}
  async function idle(n){for(let k=0;k<(n||400)&&w.G&&w.G.busy&&!w.G.over;k++)await y0();}
  async function modal(ids){
    const id=ids[ids.length-1],G=w.G;
    if(id==='m-up'){const cards=[...document.querySelectorAll('#cards .card')];
      const pool=cards.map(c=>({c,s:(()=>{const t=c.textContent;let s=1;if(/Leben|Herz/.test(t))s+=3;if(/Schaden|stärker|Klinge|Speer|Krit/.test(t))s+=3;if(/Rüstung|Schild|Block|Ausweich/.test(t))s+=2;if(/gratis|Schritt|Flink/i.test(t))s+=1;return s+Math.random()*1.5;})()}));
      pool.sort((a,b)=>b.s-a.s);pool[0]&&pool[0].c.click();await y0();return;}
    if(id==='m-shop'){
      const sh=document.querySelector('#shop-conv .card');if(sh){sh.click();await y0();return;}
      const wares=[...document.querySelectorAll('#shop-wares .card:not(.off)')];
      const want=wares.find(c=>/Heiltrank/.test(c.textContent)&&G.hp<=G.maxhp*.6)||wares.find(c=>/Stähl|Herz/.test(c.textContent)&&G.maxhp<22)||wares.find(c=>!/Heiltrank/.test(c.textContent)&&Math.random()<.6);
      if(want&&(res._shop=(res._shop||0)+1)<6){want.click();await y0();return;}
      res._shop=0;const go=document.querySelector('#shop-go');if(go&&!go.disabled)go.click();else w.leaveShop();await y0();return;}
    if(id==='m-altar'){const b=[...document.querySelectorAll('#altar-list .card:not(.off)')];
      const pick=b.find(x=>/Münzen/.test(x.textContent))||(G.hp>=4?b.find(x=>/Herz/.test(x.textContent)):null)||b.find(x=>/Kampf/.test(x.textContent))||b[0];pick&&pick.click();await y0();return;}
    if(id==='m-oasis'){try{w.leaveOasis();}catch(e){}document.querySelector('#m-oasis').classList.remove('on');await y0();return;}
    if(id==='m-legend'){const b=document.querySelector('#m-legend .card');b&&b.click();await y0();return;}
    if(id==='m-win'){res.won=true;return 'stop';}
    document.querySelector('#'+id).classList.remove('on');await y0();
  }
  /* Fähigkeit oder Wurf auf ein Ziel einsetzen. Gibt true zurück, wenn ein Zug verbraucht wurde. */
  async function useAt(target){
    const G=w.G;const before=JSON.stringify([G.bombs,G.mana,G.money,(G.ing||[]).length,G.bashCd,G.pos]);
    await w.useBomb();if(!w.G.aiming)return false;
    const ok=await w.throwAt(target);w.G.aiming=false;await idle();
    const after=JSON.stringify([w.G.bombs,w.G.mana,w.G.money,(w.G.ing||[]).length,w.G.bashCd,w.G.pos]);
    if(before!==after){res.abil++;return true;}
    return !!ok;
  }
  function goal(){
    const G=w.G,P=G.pos;
    if(G.boss&&!G.hasKey){const b=G.mons.find(m=>MT[m.type].boss);return b?{mon:b}:{pos:G.exit};}
    if(G.keyNeeded&&!G.hasKey){
      const g=G.goal;
      if(g==='clear'){const n=nearest(P,G.mons.filter(m=>!MT[m.type].npc));if(n)return {mon:n.m};}
      else if(g==='elite'){const e=G.mons.find(m=>m.elite)||(nearest(P,G.mons.filter(m=>!MT[m.type].npc))||{}).m;if(e)return {mon:e};}
      else if(g==='survive'){return {wait:true};}
      else{
        const items=[...G.items].filter(([,k])=>k==='key'||k==='sw'||k==='altar'||/^rn\d$/.test(k));
        if(items.length){const d=w.bfs(P,null);
          if(g==='runes'){items.sort((a,b)=>String(a[1]).localeCompare(String(b[1])));return {pos:items[0][0]};}
          items.sort((a,b)=>(d.get(a[0])||99)-(d.get(b[0])||99));return {pos:items[0][0]};}
      }
      return {pos:G.exit};
    }
    return {pos:G.exit};
  }
  /* Nachbarfeld wählen: bevorzugt sicher (nicht im Gefahrenfeld), dann näher am Ziel */
  function stepTo(dest,avoidTraps){
    const G=w.G,P=G.pos,dz=w.dangerSet(),dm=w.bfs(dest,G.walls);
    const cur=dm.get(P);
    let cand=[...NB[P]].filter(n=>!G.walls.has(n)&&!w.monAt(n)&&!G.spikes.has(n)).map(n=>({n,v:dm.get(n),dz:dz.has(n),tr:avoidTraps&&(G.traps||[]).includes(n)})).filter(c=>c.v!==undefined);
    const closer=cand.filter(c=>cur===undefined||c.v<cur);if(closer.length)cand=closer;
    cand.sort((a,b)=>(a.dz-b.dz)||(a.tr-b.tr)||(a.v-b.v));
    return cand.length?cand[0].n:null;
  }
  function fleeStep(){
    const G=w.G,P=G.pos,dz=w.dangerSet(),mons=awakeMons();
    let best=null,bs=-1e9;
    for(const n of NB[P]){if(G.walls.has(n)||w.monAt(n)||G.spikes.has(n))continue;const nr=nearest(n,mons);const sc=(nr?nr.d:9)*3-(dz.has(n)?5:0);if(sc>bs){bs=sc;best=n;}}
    return best;
  }
  const mon0=()=>w.G.mons.filter(m=>!MT[m.type].npc);
  for(let it=0;it<60000;it++){
    const G=w.G;if(!G){res.stuck=true;break;}
    if(G.over){res.over=true;res.cause=G.lastHit||'unbekannt';break;}
    res.depth=Math.max(res.depth,G.depth);
    if(prevHp!==null&&G.depth===prevDepth&&G.hp<prevHp)res.dmg[G.depth]=(res.dmg[G.depth]||0)+(prevHp-G.hp);
    prevHp=G.hp;prevDepth=G.depth;
    if(G.depth>MAXD_){res.capped=true;break;}
    if(G.depth!==lastDepth){lastDepth=G.depth;lvlActs=0;waits=0;detour=null;recent=[];}
    const open=[...document.querySelectorAll('.modal.on')].map(m=>m.id);
    if(open.length){const r=await modal(open);if(r==='stop')break;lvlActs++;if(lvlActs>CAP_*3){res.stuck=true;break;}continue;}
    if(G.busy){await y0();lvlActs++;if(lvlActs>CAP_*20){res.stuck=true;break;}continue;}
    lvlActs++;res.actions++;
    if(lvlActs>CAP_){res.stuck=true;res.cause='haengt Etage '+G.depth;res.dbg={goal:G.goal,key:G.keyNeeded,has:G.hasKey,pos:G.pos,exit:G.exit,hp:G.hp,mons:G.mons.map(m=>m.type+':'+m.pos),boss:!!G.boss,tr:res.tr};break;}
    const P=G.pos,cls=G.cls,ac=w.ACT[cls];
    recent.push(P);if(recent.length>12)recent.shift();
    if(commit<=0&&recent.filter(x=>x===P).length>=3){commit=6;commitDirect=8;}
    if(commitDirect>0)commitDirect--;
    const dz=commit>0?new Set():w.dangerSet();if(commit>0)commit--;
    const mons=awakeMons(),adj=mons.filter(m=>w.reach1(P,m.pos)),near=nearest(P,mons),gl=goal();
    const noMelee=!!G.noMelee,hpLow=G.hp<=Math.max(1,G.maxhp*.4);
    const target=gl.mon?gl.mon.pos:gl.pos;
    const attackable=adj.filter(m=>!(m.hp>0&&MT[m.type].npc));
    let acted=false;
    /* ---------- Klassen-Taktik ---------- */
    if(cls==='dieb'&&ac){
      if(G.cloak>0&&attackable.length){attackable.sort((a,b)=>a.hp-b.hp);await w.playerAct(attackable[0].pos);await idle();continue;}
      if(G.cloak<=0&&ac.have()&&(attackable.length>0||(near&&near.d<=2)||dz.has(P))&&target!=null){
        const d=w.bfs(P,null),dm=w.bfs(target,G.walls);let best=null,bs=1e9;
        for(const [c,x] of d){if(x<1||x>3||!ac.valid(c)||G.walls.has(c))continue;const dd=dm.get(c);if(dd===undefined)continue;const sc=dd+(dz.has(c)?4:0);if(sc<bs){bs=sc;best=c;}}
        if(best!=null&&best!==P&&await useAt(best)){continue;}
      }
    }
    else if(cls==='zauberer'){
      const tg=near&&near.d<=4?near.m:null;
      if(G.mana>=2&&tg){if(await useAt(tg.pos))continue;}
      if(G.mana<2&&(attackable.length||(near&&near.d<=2))){const f=fleeStep();if(f!=null){await w.playerAct(f);await idle();continue;}await w.waitTurn();continue;}
      if(G.mana<2&&near&&near.d<=4&&waits<6){waits++;await w.waitTurn();continue;}
    }
    else if(cls==='jaeger'&&ac){
      const stunned=attackable.filter(m=>m.stun>0);
      if(stunned.length){await w.playerAct(stunned[0].pos);await idle();continue;}
      if(ac.have()&&near&&near.d>=2&&near.d<=4&&!attackable.length){
        const dm=w.bfs(P,null);let nxt=null,bv=1e9;
        for(const n of NB[near.m.pos]){if(!ac.valid(n))continue;const v=dm.get(n);if(v!==undefined&&v<(near.d)&&v<bv){bv=v;nxt=n;}}
        if(nxt!=null&&await useAt(nxt))continue;
      }
      if(!attackable.length&&near&&near.d<=3&&(G.traps||[]).length&&waits<5){waits++;await w.waitTurn();continue;}
    }
    else if(cls==='waechter'&&ac){
      if(attackable.length&&ac.have()){attackable.sort((a,b)=>b.hp-a.hp);if(await useAt(attackable[0].pos))continue;}
      if(!attackable.length&&near&&near.d<=3&&G.shield<G.shieldMax+2&&waits<6&&!dz.has(P)){waits++;await w.waitTurn();continue;}
    }
    else if(cls==='alchemist'&&ac){
      if(ac.have()&&near&&near.d<=3&&(mons.length>=2||hpLow||MT[near.m.type].boss||G.depth%5===0)){if(await useAt(near.m.pos))continue;}
    }
    else if(cls==='schatz'&&ac){
      if(ac.have()&&near&&near.d>=1&&near.d<=4&&G.money>=16){if(await useAt(near.m.pos))continue;}
    }
    else if(cls==='krieger'){
      if(G.bombs>0&&!G.noAmmo&&near&&near.d>=2&&near.d<=4&&(mons.length>=2||MT[near.m.type].boss||hpLow)){if(await useAt(near.m.pos))continue;}
    }
    /* ---------- Gefahr meiden ---------- */
    if(dz.has(P)&&!(attackable.length&&Math.random()<.3)){const s=stepTo(target!=null?target:P,cls==='jaeger');if(s!=null){await w.playerAct(s);await idle();continue;}}
    /* ---------- Standard: kämpfen, einsammeln, Ziel ---------- */
    let tgt=null;
    if(attackable.length&&!noMelee){attackable.sort((a,b)=>a.hp-b.hp);tgt=attackable[0].pos;}
    else if(attackable.length&&noMelee){const f=fleeStep();if(f!=null)tgt=f;}
    else{
      if(gl.wait){await w.waitTurn();continue;}
      let dest=target;dbgDest=target;
      if(detour!=null&&(!G.items.has(detour)||detourN++>14))detour=null;
      if(detour==null&&(!near||near.d>3)){
        const d=w.bfs(P,null);let bi=null,bd=hpLow?9:5;
        for(const [c,k] of G.items){if(!GOODP.test(String(k)))continue;if(k==='heart'&&G.hp>=G.maxhp)continue;const x=d.get(c);if(x!==undefined&&x<bd&&!G.spikes.has(c)){bd=x;bi=c;}}
        if(bi!=null){detour=bi;detourN=0;}
      }
      if(detour!=null&&(!near||near.d>1)){dest=detour;dbgDest='D'+detour;}
      let path=null;
      if(commitDirect>0&&dest!==P){const dm=w.bfs(dest,G.walls);let bn=null,bv=1e9;for(const n of NB[P]){const v=dm.get(n);if(v!==undefined&&v<bv){bv=v;bn=n;}}if(bn!=null){path=[bn];dbgDest='X'+dest;}}
      else if(lvlActs>90&&!gl.mon){const s=stepTo(dest,false);if(s!=null)path=[s];}
      else if(gl.mon&&dest===gl.mon.pos){
        const dp=w.bfs(P,null);const nbs=[...NB[dest]].filter(c=>!G.walls.has(c)&&!w.monAt(c));nbs.sort((a,b)=>(dp.get(a)||99)-(dp.get(b)||99));
        for(const c of nbs){path=c===P?[]:w.pathTo(c);if(path)break;}
        if(path&&!path.length&&w.reach1(P,dest)&&!noMelee)tgt=dest;
      }
      else path=w.pathTo(dest);
      if(!path||!path.length){const dm=w.bfs(dest,G.walls);let bestN=null,bv=1e9;for(const n of NB[P]){const v=dm.get(n);if(v!==undefined&&v<bv){bv=v;bestN=n;}}if(bestN!=null&&dest!==P)path=[bestN];}
      if(tgt==null){
        let step=path&&path.length?path[0]:null;
        if(step!=null&&dz.has(step)){const alt=stepTo(dest,cls==='jaeger');if(alt!=null&&!dz.has(alt))step=alt;else if(near&&near.d<=2&&waits<4){waits++;await w.waitTurn();continue;}}
        if(step==null){const dm=w.bfs(dest,G.walls);let bn=null,bv=1e9;for(const n of NB[P]){const v=dm.get(n);if(v!==undefined&&v<bv){bv=v;bn=n;}}if(bn!=null&&dest!==P)step=bn;}
        if(step==null){const c=[...NB[P]].filter(n=>!G.walls.has(n)&&!G.spikes.has(n));step=c.length?rnd(c):null;}
        tgt=step;
      }
    }
    if(P===lastPos){same++;}else{same=0;lastPos=P;}
    if(same>6){const c=[...NB[P]].filter(n=>!G.walls.has(n)&&!w.monAt(n));if(c.length&&Math.random()<.7)tgt=rnd(c);else{await w.waitTurn();same=0;continue;}}
    if(tgt==null){await w.waitTurn();continue;}
    waits=0;(res.tr=res.tr||[]).push(P+'>'+tgt+(G.cloak>0?'c':'')+'|d'+(dbgDest)+(dz.has(P)?'z':'')+(adj.length?'a':'')+(near?'n'+near.d:''));if(res.tr.length>14)res.tr.shift();
    await w.playerAct(tgt);await idle();
  }
  const G=w.G;if(G){res.turns=G.turns;res.score=G.score;res.kills=G.kills;if(!res.cause&&G.lastHit)res.cause=G.lastHit;res.maxhp=G.maxhp;}
  return res;
}

(async()=>{
  const file='file://'+path.join(__dirname,process.env.WG_OUT||'.out','test.html');
  const jobs=[];for(const d of DIFFS)for(const c of CLASSES)for(let i=0;i<RUNS;i++)jobs.push({cls:c,diff:d});
  const browser=await chromium.launch();const out=[];let next=0;const errs=new Set();
  async function worker(){
    const pg=await browser.newPage({viewport:{width:420,height:860}});
    pg.on('pageerror',e=>errs.add(e.message.slice(0,120)));
    while(next<jobs.length){
      const j=jobs[next++];
      await pg.goto(file);await pg.waitForTimeout(250);
      await pg.evaluate(([m,c])=>{window.MAXD_=m;window.CAP_=c;},[MAXD,CAP]);
      const src=botRun.toString().replace(/MAXD_/g,'window.MAXD_').replace(/CAP_/g,'window.CAP_');
      try{const r=await pg.evaluate(`(${src})(${JSON.stringify(j)})`);out.push(r);
        process.stderr.write(`${r.cls}/${r.diff}: Etage ${r.depth}${r.won?' (Sieg)':r.capped?' (Ende)':r.stuck?' (haengt) '+JSON.stringify(r.dbg||''):' †'+r.cause}\n`);}
      catch(e){out.push({cls:j.cls,diff:j.diff,error:String(e).slice(0,120)});process.stderr.write('Fehler '+j.cls+': '+String(e).slice(0,100)+'\n');}
    }
    await pg.close();
  }
  await Promise.all(Array.from({length:PAR},worker));
  await browser.close();
  /* Auswertung */
  const lines=['# Balance-Bericht','',`Läufe je Klasse und Stufe: ${RUNS}, Etagen-Grenze: ${MAXD}, Bot fair (kein Dauer-Leben).`,''];
  const med=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
  lines.push('| Klasse | Stufe | Läufe | Etage Ø | Median | Max | Tod vor 10 | Bis Grenze | Häufigster Killer |','|---|---|---|---|---|---|---|---|---|');
  for(const d of DIFFS)for(const c of CLASSES){
    const rs=out.filter(r=>r.cls===c&&r.diff===d&&!r.error);if(!rs.length)continue;
    const dp=rs.map(r=>r.depth);const killers={};rs.forEach(r=>{if(r.over&&r.cause)killers[r.cause]=(killers[r.cause]||0)+1;});
    const top=Object.entries(killers).sort((a,b)=>b[1]-a[1])[0];
    lines.push(`| ${c} | ${d} | ${rs.length} | ${(dp.reduce((a,b)=>a+b,0)/dp.length).toFixed(1)} | ${med(dp)} | ${Math.max(...dp)} | ${rs.filter(r=>r.over&&r.depth<10).length} | ${rs.filter(r=>r.capped||r.won).length} | ${top?top[0]+' ('+top[1]+')':'–'} |`);
  }
  const stuck=out.filter(r=>r.stuck).length,err=out.filter(r=>r.error).length;
  lines.push('',`Hängende Läufe: ${stuck}, Fehler: ${err}.`);
  /* Schaden je Etagen-Gruppe */
  const bins={};for(const r of out){if(!r.dmg)continue;for(const [d,v] of Object.entries(r.dmg)){const b=Math.floor((+d-1)/5)*5+1;(bins[b]=bins[b]||[]).push(v);}}
  lines.push('','Schaden pro Etage (Ø, alle Läufe):','| Etagen | Ø Schaden | Proben |','|---|---|---|');
  for(const b of Object.keys(bins).map(Number).sort((a,b)=>a-b)){const v=bins[b];lines.push(`| ${b}-${b+4} | ${(v.reduce((x,y)=>x+y,0)/v.length).toFixed(2)} | ${v.length} |`);}
  if(errs.size)lines.push('','Seitenfehler: '+[...errs].join('; '));
  const md=lines.join('\n');fs.writeFileSync(path.join(__dirname,'.out','balance.md'),md);fs.writeFileSync(path.join(__dirname,'.out','balance.json'),JSON.stringify(out));
  console.log(md);
})();
