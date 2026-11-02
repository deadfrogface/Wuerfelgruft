/* src/js/game/lines-reach.js
   Linien, Reichweiten und Sichtfelder. */
/* ================= Linien & Reichweiten ================= */
function lineWalk(from,fn,max=4){
  const [x,y,z]=xyz(from);
  for(const d of DIRS){
    for(let k=1;k<=max;k++){
      const a=x+d[0]*k,b=y+d[1]*k,c=z+d[2]*k;
      if(!isShell(a,b,c))break;
      const i=idx(a,b,c);
      if(G.walls.has(i))break;
      if(monAt(i))break;
      if(fn(i)===true)return true;
    }
  }
  return false;
}
const lineClear=(from,to,max=4)=>lineWalk(from,i=>i===to,max);
const reachOf=()=>{const b=G.sling?3:G.spear?2:1;if(G.harpoon)return 4;return b>=2&&G.lens?b+1:b;};
function lineN(P,t,n){
  const [x,y,z]=xyz(P);
  for(const d of DIRS){
    for(let k=1;k<=n;k++){
      const a=x+d[0]*k,b=y+d[1]*k,c=z+d[2]*k;
      if(!isShell(a,b,c))break;
      const i=idx(a,b,c);
      if(i===t)return k>=2;
      if(G.walls.has(i)||monAt(i))break;
    }
  }
  return false;
}
/* Wurf-Fläche: 2x2-Viereck am Ziel, zur Seite des Werfers hin; Tintenstrahl: 2 Felder geradeaus */
function sqOf(m,t){
  const dm=bfs(m.pos,null);let best=null,bd=1e9;
  for(const d of ND[t].keys()){if(G.walls.has(d))continue;const k=dm.get(d);if(k!==undefined&&k<bd){bd=k;best=d;}}
  const s=new Set([t]);if(best===null)return s;
  s.add(best);for(const n of NB[t])if(NB[best].includes(n)&&!G.walls.has(n))s.add(n);
  return s;
}
function sprayOf(from,P){
  const [x,y,z]=xyz(from);
  for(const d of DIRS){const cs=[];
    for(let k=1;k<=2;k++){
      const a=x+d[0]*k,b=y+d[1]*k,c=z+d[2]*k;
      if(!isShell(a,b,c))break;const i=idx(a,b,c);
      if(G.walls.has(i)||monAt(i))break;cs.push(i);
    }
    if(cs.includes(P))return cs;}
  return null;
}
function rayHit(from,P,max){
  const [x,y,z]=xyz(from);
  for(const d of DIRS){
    let prev=from;
    for(let k=1;k<=max;k++){
      const a=x+d[0]*k,b=y+d[1]*k,c=z+d[2]*k;
      if(!isShell(a,b,c))break;
      const i=idx(a,b,c);
      if(i===P)return k>=2?prev:-1;
      if(G.walls.has(i)||monAt(i))break;
      prev=i;
    }
  }
  return -1;
}
function diagOK(from,t){const m=ND[from]&&ND[from].get(t);return !!m&&m.some(c=>!G.walls.has(c));}
const reach1=(P,t)=>NB[P].includes(t)||diagOK(P,t);

