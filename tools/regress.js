const {chromium}=require('playwright');
/* Regressionstest: Bot spielt zehn Etagen (1 bis 100), prüft Fehler, ungültige Zustände und Spielabstürze. Start: python3 tools/build_test.py && node tools/regress.js */
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:420,height:860}});
const errs=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE/.test(m.text()))errs.push('CONSOLE '+m.text())});
await pg.goto('file://'+require('path').join(__dirname,'.out','test.html'));await pg.waitForTimeout(300);
await pg.evaluate(()=>{document.querySelector('#scr-game').classList.add('on');});
const res=await pg.evaluate(async()=>{
  const w=window.__wg;const out={levels:0,actions:0,bad:[],kinds:{},deaths:0};
  const depths=[1,10,23,34,45,56,67,78,89,100];
  for(const d of depths){
    w.save.diff=['normal','hardcore','1hp','leicht','schwer'][d%5];w.newRun();const G=w.G;G.depth=d;
    for(const k of ['crit','armor','rest','sling','boots','wide','stun','splash','dodge','gold','pickN','phoenix','swift','frost','poison','soul','thorns2','exec','spark','fang','master','regen']) {if(d>20){G[k]=typeof G[k]==='boolean'?true:(k==='pickN'?2:1);}}
    if(d>20){G.spear=true;G.thorns=true;}
    for(let rep=0;rep<1;rep++){
      w.startLevel();out.levels++;
      for(let a=0;a<160;a++){
        const G=w.G;if(G.over){out.deaths++;break;}
        G.hp=G.maxhp=(w.save.diff==='1hp'?1:999);
        for(let k=0;k<200&&G.busy;k++)await new Promise(r=>setTimeout(r,0));
        if(w.G.depth!==d)break;
        const P=G.pos;
        const adjM=G.mons.filter(m=>w.reach1(P,m.pos));
        let tgt;
        if(adjM.length&&Math.random()<.8)tgt=adjM[0].pos;
        else{
          const goal=(G.keyNeeded&&!G.hasKey&&!G.boss)?[...G.items].find(([,k])=>k==='key'||k==='sw'||k==='altar'||k==='rn1')?.[0]??G.exit:(G.boss&&!G.hasKey?(G.mons[0]?G.mons[0].pos:G.exit):G.exit);
          const path=w.pathTo(goal);
          tgt=path&&path.length&&Math.random()<.85?path[0]:null;
          if(tgt==null){const c=[...w.NB[P],...[...w.ND[P]].map(x=>x[0])].filter(n=>!G.walls.has(n));tgt=c[Math.floor(Math.random()*c.length)];}
        }
        if(Math.random()<.12&&G.bombs>0){await w.useBomb();const mm=G.mons[0];if(mm)await w.throwAt(mm.pos);else G.aiming=false;}const r=await w.playerAct(tgt);if(Math.random()<.1&&G.undos>0&&!w.G.over){await w.undoMove();}
        out.actions++;
        for(let k=0;k<300&&w.G.busy&&!w.G.over;k++)await new Promise(r=>setTimeout(r,0));
        const g=w.G;
        const seen=new Set([g.pos]);
        for(const m of g.mons){
          out.kinds[m.type]=(out.kinds[m.type]||0)+1;
          const T=w.MT[m.type];
          if(!w.SHELL.includes(m.pos))out.bad.push('off-shell '+m.type);
          if(seen.has(m.pos))out.bad.push('overlap '+m.type+' d'+d);seen.add(m.pos);
          if(!T.ghost&&g.walls.has(m.pos))out.bad.push('in wall '+m.type);
          if(!(m.hp>0))out.bad.push('hp '+m.type+m.hp);
        }
        if(!Number.isFinite(g.hp)||!w.SHELL.includes(g.pos))out.bad.push('player state');
        if(w.G.depth!==d||document.querySelector('#m-up.on')||document.querySelector('#m-win.on')){
          // Etage geschafft
          document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'));break;}
      }
    }
  }
  out.kinds=Object.keys(out.kinds).length;
  return out;
});
console.log(JSON.stringify(res));
console.log(errs.slice(0,10).join('\n')||'no errors');
await b.close();})();
