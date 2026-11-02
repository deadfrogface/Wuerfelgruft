/* src/js/world/cube-geometry.js
   Würfel-Geometrie: Felder, Nachbarn, Flächen und Blickwechsel. */
/* ================= Würfel-Geometrie =================
   Der Würfel besteht aus einer Schale von 5x5x5 Feldern (98 Felder).
   Nachbarn = Schalenfelder, die entlang einer Achse direkt angrenzen.
   Läuft man über eine Kante, landet man automatisch auf der Nachbarseite. */
const idx=(x,y,z)=>x+5*y+25*z;
const xyz=i=>[i%5,Math.floor(i/5)%5,Math.floor(i/25)];
const inR=(x,y,z)=>x>=0&&x<5&&y>=0&&y<5&&z>=0&&z<5;
const isShell=(x,y,z)=>inR(x,y,z)&&(x%4===0||y%4===0||z%4===0);
const SHELL=[],NB={};
for(let i=0;i<125;i++){const [x,y,z]=xyz(i);if(isShell(x,y,z))SHELL.push(i);}
const DIRS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
for(const i of SHELL){const [x,y,z]=xyz(i);NB[i]=[];for(const d of DIRS){const a=x+d[0],b=y+d[1],c=z+d[2];if(isShell(a,b,c))NB[i].push(idx(a,b,c));}}
const ND={};
for(const i of SHELL){
  const [x,y,z]=xyz(i);const m=new Map();
  for(let a=0;a<6;a++)for(let b=a+1;b<6;b++){
    const d1=DIRS[a],d2=DIRS[b];
    if(d1[0]*d2[0]+d1[1]*d2[1]+d1[2]*d2[2]!==0)continue;
    const t=[x+d1[0]+d2[0],y+d1[1]+d2[1],z+d1[2]+d2[2]];
    if(!isShell(t[0],t[1],t[2]))continue;
    const ti=idx(t[0],t[1],t[2]);if(NB[i].includes(ti))continue;
    const mids=[[x+d1[0],y+d1[1],z+d1[2]],[x+d2[0],y+d2[1],z+d2[2]]].filter(q=>isShell(q[0],q[1],q[2])).map(q=>idx(q[0],q[1],q[2]));
    if(mids.length)m.set(ti,mids);
  }
  ND[i]=m;
}
const faceCount=i=>{const [x,y,z]=xyz(i);return (x%4===0?1:0)+(y%4===0?1:0)+(z%4===0?1:0);};
const facesOf=i=>{const [x,y,z]=xyz(i);const s=new Set();if(x===0)s.add('-x');if(x===4)s.add('+x');if(y===0)s.add('-y');if(y===4)s.add('+y');if(z===0)s.add('-z');if(z===4)s.add('+z');return s;};

const vneg=a=>[-a[0],-a[1],-a[2]];
const vdot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/* Ansicht: n = Normale der Seite, r = Richtung "rechts", u = Richtung "oben" */
const FACES={
  F:{n:[0,0,1],r:[1,0,0],u:[0,1,0]},
  R:{n:[1,0,0],r:[0,0,-1],u:[0,1,0]},
  B:{n:[0,0,-1],r:[-1,0,0],u:[0,1,0]},
  L:{n:[-1,0,0],r:[0,0,1],u:[0,1,0]},
  U:{n:[0,1,0],r:[1,0,0],u:[0,0,-1]},
  D:{n:[0,-1,0],r:[1,0,0],u:[0,0,1]}
};
const rotView=(v,d)=>{
  const {n,r,u}=v;
  switch(d){
    case 'right':return {n:r,r:vneg(n),u};
    case 'left':return {n:vneg(r),r:n,u};
    case 'up':return {n:u,r,u:vneg(n)};
    default:return {n:vneg(u),r,u:n};
  }
};
const viewCoord=(v,i)=>{const [x,y,z]=xyz(i);const d=[x-2,y-2,z-2];if(vdot(d,v.n)!==2)return null;return {col:2+vdot(d,v.r),row:2-vdot(d,v.u)};};
const cellAt=(v,col,row)=>{const p=[0,1,2].map(k=>2+2*v.n[k]+(col-2)*v.r[k]+(2-row)*v.u[k]);return idx(p[0],p[1],p[2]);};
const sameN=(a,b)=>a.n[0]===b.n[0]&&a.n[1]===b.n[1]&&a.n[2]===b.n[2];
const sameView=(a,b)=>sameN(a,b)&&a.r.every((q,k)=>q===b.r[k])&&a.u.every((q,k)=>q===b.u[k]);
function findViewFor(i,cur,pref){
  const order=['right','left','up','down'];
  if(pref){order.splice(order.indexOf(pref),1);order.unshift(pref);}
  let frontier=[cur];
  for(let depth=0;depth<3;depth++){
    for(const v of frontier)if(viewCoord(v,i))return v;
    const nxt=[];
    for(const v of frontier)for(const d of order)nxt.push(rotView(v,d));
    frontier=nxt;
  }
  return FACES.F;
}
function stepTarget(v,from,dc,dr){
  const vc=viewCoord(v,from);if(!vc)return -1;
  const nc=vc.col+dc,nr=vc.row+dr;
  let t;
  if(nc>=0&&nc<5&&nr>=0&&nr<5)t=cellAt(v,nc,nr);
  else{const [x,y,z]=xyz(from);t=idx(x-v.n[0],y-v.n[1],z-v.n[2]);}
  return NB[from].includes(t)?t:-1;
}
function bfs8(src,walls){
  const d=new Map([[src,0]]);const q=[src];
  for(let h=0;h<q.length;h++){
    const c=q[h];
    for(const n of NB[c]){if(d.has(n)||(walls&&walls.has(n)))continue;d.set(n,d.get(c)+1);q.push(n);}
    for(const [n,mids] of ND[c]){if(d.has(n)||(walls&&(walls.has(n)||!mids.some(k=>!walls.has(k)))))continue;d.set(n,d.get(c)+1);q.push(n);}
  }
  return d;
}
function bfs(src,blocked){
  const d=new Map();d.set(src,0);const q=[src];
  for(let h=0;h<q.length;h++){
    const c=q[h];
    for(const n of NB[c]){if(d.has(n)||(blocked&&blocked.has(n)))continue;d.set(n,d.get(c)+1);q.push(n);}
  }
  return d;
}

