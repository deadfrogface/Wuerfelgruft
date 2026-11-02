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

/* Wird im Browser ausgeführt. */
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
  const cnt=(a,f)=>a.filter(f).length;
  let lastKey='',lvlActs=0,lastPos=-1,same=0,lastDepth=0,prevHp=null,prevDepth=0;
  const GOODP=/^p_|^chest$|^heart$|^coin$/;
  const UPSCORE=u=>{const t=(u.name+' '+u.desc).toLowerCase();let s=1;
    if(/leben|herz/.test(t))s+=3;if(/schaden|stärker|klinge|speer/.test(t))s+=3;if(/rüstung|schild|block/.test(t))s+=2;if(/gratis|schritt|flink/.test(t))s+=1;
    if(/münzen|gold/.test(t))s+=.5;return s+Math.random()*1.5;};
  function nearest(P,list,maxd){const d=w.bfs(P,null);let best=null,bd=1e9;for(const m of list){const x=d.get(m.pos);if(x!==undefined&&x<bd&&(!maxd||x<=maxd)){bd=x;best=m;}}return best?{m:best,d:bd}:null;}
  async function modal(ids){
    const id=ids[ids.length-1],G=w.G;
    if(id==='m-up'){const cards=[...document.querySelectorAll('#cards .card')];
      const pool=cards.map((c,i)=>({c,s:(()=>{const t=c.textContent;const n=(t.match(/^(.*?)[A-ZÄÖÜ]/)||[''])[0];let s=1;if(/Leben|Herz/.test(t))s+=3;if(/Schaden|stärker|Klinge|Speer|Krit/.test(t))s+=3;if(/Rüstung|Schild|Block|Ausweich/.test(t))s+=2;if(/gratis|Schritt|Flink/i.test(t))s+=1;return s+Math.random()*1.5;})()}));
      pool.sort((a,b)=>b.s-a.s);(pool[0]||{c:null}).c&&pool[0].c.click();await y0();return;}
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
  async function useAbility(){
    const G=w.G,P=G.pos,cls=G.cls,ac=w.ACT[cls];
    const mons=G.mons.filter(m=>!MT[m.type].npc&&!m.dormant);if(!mons.length)return false;
    const nr=nearest(P,mons);if(!nr)return false;
    const hpLow=G.hp<=G.maxhp*.4;
    let target=null;
    if(cls==='zauberer'){if(G.mana<2||nr.d>4)return false;target=nr.m.pos;}
    else if(cls==='jaeger'){if(!ac.have()||nr.d<2||nr.d>4)return false;
      const dm=w.bfs(nr.m.pos,null);const cand=[...NB[nr.m.pos]].filter(c=>ac.valid(c)&&dm.has(c)).sort((a,b)=>(w.bfs(P,null).get(a)||99)-(w.bfs(P,null).get(b)||99));
      if(!cand.length)return false;target=cand[0];}
    else if(cls==='dieb'){if(!ac.have()||!hpLow||nr.d>2)return false;
      const d=w.bfs(P,null);let best=null,bs=-1;for(const [c,x] of d){if(x<1||x>3||!ac.valid(c)||G.walls.has(c))continue;const nd=nearest(c,mons);const sc=nd?nd.d:9;if(sc>bs){bs=sc;best=c;}}
      if(best==null)return false;target=best;}
    else if(cls==='alchemist'){if(!ac.have()||nr.d>3)return false;target=nr.m.pos;}
    else if(cls==='schatz'){if(!ac.have()||nr.d<2||nr.d>4||Math.random()<.4)return false;target=nr.m.pos;}
    else if(cls==='waechter'){if(!ac.have()||nr.d>1)return false;target=nr.m.pos;}
    else{ /* Krieger: Wurf-Item */ if(G.bombs<1||G.noAmmo||nr.d<2||nr.d>4||Math.random()<.5)return false;target=nr.m.pos;}
    const before=JSON.stringify([G.bombs,G.mana,G.money,(G.ing||[]).length,G.bashCd]);
    await w.useBomb();if(!w.G.aiming){return false;}
    const ok=await w.throwAt(target);w.G.aiming=false;
    for(let k=0;k<400&&w.G.busy&&!w.G.over;k++)await y0();
    const after=JSON.stringify([w.G.bombs,w.G.mana,w.G.money,(w.G.ing||[]).length,w.G.bashCd]);
    if(before!==after){res.abil++;return true;}
    return ok;
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
        if(items.length){items.sort((a,b)=>String(a[1]).localeCompare(String(b[1])));
          const d=w.bfs(P,null);if(g==='runes'){return {pos:items[0][0]};}
          items.sort((a,b)=>(d.get(a[0])||99)-(d.get(b[0])||99));return {pos:items[0][0]};}
      }
      return {pos:G.exit};
    }
    return {pos:G.exit};
  }
  const mon0=()=>w.G.mons.filter(m=>!MT[m.type].npc);
  for(let it=0;it<60000;it++){
    const G=w.G;if(!G){res.stuck=true;break;}
    if(G.over){res.over=true;res.cause=G.lastHit||'unbekannt';break;}
    res.depth=Math.max(res.depth,G.depth);
    if(prevHp!==null&&G.depth===prevDepth&&G.hp<prevHp)res.dmg[G.depth]=(res.dmg[G.depth]||0)+(prevHp-G.hp);
    prevHp=G.hp;prevDepth=G.depth;
    if(G.depth>MAXD_){res.capped=true;break;}
    if(G.depth!==lastDepth){lastDepth=G.depth;lvlActs=0;}
    const open=[...document.querySelectorAll('.modal.on')].map(m=>m.id);
    if(open.length){const r=await modal(open);if(r==='stop')break;lvlActs++;if(lvlActs>CAP_*3){res.stuck=true;break;}continue;}
    if(G.busy){await y0();lvlActs++;if(lvlActs>CAP_*20){res.stuck=true;break;}continue;}
    lvlActs++;res.actions++;
    if(lvlActs>CAP_){res.stuck=true;res.cause='haengt Etage '+G.depth;res.dbg={goal:G.goal,key:G.keyNeeded,has:G.hasKey,pos:G.pos,exit:G.exit,hp:G.hp,mons:G.mons.map(m=>m.type+':'+m.pos+(m.dormant?'d':'')+(m.stun?'s':'')),items:[...G.items].map(([c,k])=>c+':'+k).slice(0,12),sw:G.sw,swNeed:G.swNeed,rn:G.rn,aim:G.aiming,boss:!!G.boss,cloak:G.cloak,same,sv:G.sv};break;}
    const P=G.pos;
    /* Fähigkeit */
    if(Math.random()<.7&&await useAbility()){continue;}
    const adj=mon0().filter(m=>w.reach1(P,m.pos)&&!m.dormant&&!(MT[m.type].sleep&&!m.awake&&Math.random()<.5));
    let tgt=null;
    const gl=goal();
    if(adj.length){adj.sort((a,b)=>a.hp-b.hp);tgt=adj[0].pos;}
    else{
      if(gl.wait){await w.waitTurn();continue;}
      let dest=gl.mon?gl.mon.pos:gl.pos;
      /* Gutes in der Nähe einsammeln, wenn kein Gegner nah ist */
      const near=nearest(P,mon0().filter(m=>!m.dormant));
      if(!near||near.d>3){
        const d=w.bfs(P,null);let bi=null,bd=5;
        for(const [c,k] of G.items){if(!(GOODP.test(String(k))))continue;if(k==='heart'&&G.hp>=G.maxhp)continue;const x=d.get(c);if(x!==undefined&&x<bd&&!G.spikes.has(c)){bd=x;bi=c;}}
        if(bi!=null)dest=bi;
      }
      let path=null;
      if(lvlActs>90&&!(gl.mon)){ /* Notfall: ohne Rücksicht auf Stacheln und Gelände direkt hin, Gegner im Weg werden angegriffen */
        const dm=w.bfs(dest,G.walls);let bestN=null,bv=1e9;
        for(const n of NB[P]){const v=dm.get(n);if(v!==undefined&&v<bv){bv=v;bestN=n;}}
        if(bestN!=null)path=[bestN];
      }
      else if(gl.mon&&dest===gl.mon.pos){const dm=w.bfs(dest,null);const nbs=[...NB[dest]].filter(c=>!G.walls.has(c)&&!w.monAt(c));nbs.sort((a,b)=>(w.bfs(P,null).get(a)||99)-(w.bfs(P,null).get(b)||99));for(const c of nbs){path=c===P?[]:w.pathTo(c);if(path)break;}if(path&&!path.length&&w.reach1(P,dest))tgt=dest;}
      else path=w.pathTo(dest);
      if(!path||!path.length){const dm=w.bfs(dest,G.walls);let bestN=null,bv=1e9;for(const n of NB[P]){const v=dm.get(n);if(v!==undefined&&v<bv){bv=v;bestN=n;}}if(bestN!=null&&dest!==P)path=[bestN];}
      if(tgt==null){
        if(path&&path.length)tgt=path[0];
        else{const c=[...NB[P]].filter(n=>!G.walls.has(n)&&!G.spikes.has(n));tgt=c.length?c[Math.floor(Math.random()*c.length)]:null;}
      }
    }
    if(P===lastPos){same++;}else{same=0;lastPos=P;}
    if(same>6){const c=[...NB[P]].filter(n=>!G.walls.has(n)&&!w.monAt(n));if(c.length&&Math.random()<.7)tgt=c[Math.floor(Math.random()*c.length)];else{await w.waitTurn();same=0;continue;}}
    if(tgt==null){await w.waitTurn();continue;}
    await w.playerAct(tgt);
    for(let k=0;k<400&&w.G&&w.G.busy&&!w.G.over;k++)await y0();
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
