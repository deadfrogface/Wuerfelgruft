/* src/js/ui/title-pages-scenes.js
   Titelseiten (Seitenkarte) und ihre Pixel-Szenen: Abgrund, Arena und Bibliothek. */
/* ================= Titelbild als Würfel: Wischen zwischen fünf Seiten ================= */
const TP={c:[0,0],l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]};
const TP_NAME={l:'Lager',r:'Aufgaben',u:'Wissen',d:'Abgrund'};
const TP_BACK={l:'r',r:'l',u:'d',d:'u'};
let tpCur='c';

/* ---------- Abgrund: der Schlund (105x215) ---------- */
let HELL_URL=null;
function buildHell(){
  if(HELL_URL)return HELL_URL;
  const W=105,H=215,cv=PX.Cv(W,H),Hs=PX.hash,mul=PX.mul,mix=PX.mix;
  const rock=(x,y,f)=>{const n=Hs(x>>1,y>>1),m=Hs(x+31,y*3);return mul(n<.3?'#2c2432':n<.7?'#362c3c':'#40364a',f*(m>.94?1.3:1));};
  cv.r(0,0,W,H,(x,y)=>rock(x,y,1));
  /* Risse im Fels mit Glut */
  for(let i=0;i<9;i++){let x=(i*13+5)%W,y=(i*29)%60;for(let k=0;k<14;k++){cv.p(x,y,'#7a1c10');x+=Hs(i,k)>.5?1:-1;y+=1+((Hs(k,i)*2)|0);}}
  const cx=52,cy0=98,N=11;
  /* Terrassen: von oben in den Abgrund gesehen */
  for(let k=0;k<N;k++){
    const t=k/(N-1),rx=47-k*4.1,ry=36-k*3.1,cy=cy0+k*3.9,heat=Math.pow(t,1.4);
    cv.ell(cx,cy,rx,ry,(x,y,dx,dy)=>{
      const r=dx*dx+dy*dy,wall=dy<-.25&&r<.8,rim=r>.82;
      let base=rim?rock(x,y,1.35-t*.5):wall?rock(x,(y>>2)*4,.8-t*.5):rock(x,y,.95-t*.5);
      if(wall&&y%4===0)base=mul(base,.7);
      return mix(base,'#d0300c',Math.min(.8,heat*.8+(wall?.06:0)));});
    for(let a=Math.PI;a<=Math.PI*2;a+=.03)cv.p(cx+rx*Math.cos(a),cy+ry*Math.sin(a),k<3?'#07040a':mul('#2a0606',1-t*.5));
  }
  /* Lava ganz unten */
  const lcy=cy0+(N-1)*3.9;
  cv.ell(cx,lcy,rx2(),5.2,(x,y,dx,dy)=>{const g=1-Math.sqrt(dx*dx+dy*dy);const q=g*5+PX.B4[y&3][x&3]-.4;const R=['#8a1a08','#c8300c','#ff6a1a','#ffa030','#ffe27a','#fff6c0'];return R[Math.max(0,Math.min(5,Math.floor(q)))];});
  function rx2(){return 47-(N-1)*4.1+3;}
  /* Wendelweg an der Innenwand */
  for(let i=0;i<34;i++){const t=i/34,k=t*(N-2.2),an=.45-t*Math.PI*1.25,rx=47-k*4.1-1.5,ry=36-k*3.1-1,cy=cy0+k*3.9;
    const x=cx+rx*Math.cos(an),y=cy+ry*Math.sin(an);cv.r(Math.round(x)-2,Math.round(y),5,2,mix('#9a8aa8','#d0300c',t*.6));cv.r(Math.round(x)-2,Math.round(y)+2,5,1,'#1a0a10');}
  /* Felszacken am Rand */
  for(let i=0;i<20;i++){const an=Math.PI*(.92+i*.08*1.25)+(i>10?0:0),bx=cx+49*Math.cos(an),by=cy0+38*Math.sin(an),len=6+((Hs(i,3)*9)|0),ox=Math.cos(an)*3,oy=Math.sin(an)*5;
    cv.poly([[bx-3,by+2],[bx+3,by+2],[bx+ox*len/6*1.2,by+oy*len/6-len*.6]],(x,y)=>x<bx?rock(x,y,.7):rock(x,y,.45));}
  pxSkull(cv,10,66);pxSkull(cv,90,72);
  /* Ketten */
  for(const x0 of [26,79]){for(let y=0;y<56;y+=4){cv.r(x0,y,2,3,'#6a6a7a');cv.r(x0,y,1,3,'#9a9aaa');cv.r(x0+(y%8?-1:1),y+2,2,2,'#4a4a58');}}
  /* Feuerschalen am Rand */
  for(const bx of [9,96]){cv.poly([[bx-6,98],[bx+6,98],[bx+4,106],[bx-4,106]],(x)=>x<bx?'#5a4a5a':'#3a2e3a');cv.r(bx-7,96,14,3,'#6a5a6a');cv.r(bx-7,96,14,1,'#9a8a9a');cv.r(bx-2,106,4,6,'#3a2e3a');cv.r(bx-5,112,10,2,'#5a4a5a');}
  /* Licht: Dunkelheit, nur Glut leuchtet */
  cv.light([{x:cx,y:lcy-4,r:92,i:1.7,c:[255,100,30],sq:.85},{x:9,y:92,r:34,i:1.1,c:[255,150,60]},{x:96,y:92,r:34,i:1.1,c:[255,150,60]},{x:cx,y:170,r:60,i:.5,c:[255,90,30]}],.375);
  HELL_URL=PX.url(cv);return HELL_URL;
}

/* ---------- Props (28x28) ---------- */
function pxProp(name){
  const cv=PX.Cv(28,28),Hs=PX.hash;
  if(name==='board'){
    cv.box(1,2,26,19,'#6a4220','#a8743a','#2a1608');
    cv.r(3,4,22,15,(x,y)=>Hs(x,y)>.82?'#9a6a34':'#b8844a');
    cv.r(4,5,7,6,'#f4efe0');cv.r(4,5,7,1,'#fff');cv.r(5,7,5,1,'#9a8a6a');cv.r(5,9,3,1,'#9a8a6a');cv.p(7,5,'#e8302d');
    cv.r(13,6,9,5,'#e9dcb4');cv.r(14,8,7,1,'#9a8a6a');cv.r(14,10,5,1,'#9a8a6a');cv.p(17,6,'#2f5a9a');
    cv.r(6,13,9,5,'#f4efe0');cv.r(7,15,7,1,'#9a8a6a');cv.p(10,13,'#e8302d');
    cv.r(17,13,6,5,'#d8e8f8');cv.r(18,15,4,1,'#8a9aaa');cv.p(20,13,'#3a8a4a');
    cv.r(6,21,3,6,'#5a3818');cv.r(19,21,3,6,'#5a3818');cv.r(6,21,1,6,'#8a5a2c');cv.r(19,21,1,6,'#8a5a2c');
  }else if(name==='banner'){
    cv.r(3,1,22,2,'#d6a63a');cv.r(3,1,22,1,'#f4d86a');cv.r(1,0,2,4,'#a07a1a');cv.r(25,0,2,4,'#a07a1a');
    cv.poly([[5,3],[23,3],[23,22],[14,27],[5,22]],(x,y)=>x<8?'#d8403a':x>19?'#8a1814':'#b8231c');
    cv.line(5,3,5,22,'#e8c24a');cv.line(23,3,23,22,'#e8c24a');cv.line(5,22,14,27,'#e8c24a');cv.line(23,22,14,27,'#e8c24a');
    const star=['....#....','....#....','...###...','#########','.#######.','..#####..','..##.##..','.##...##.','.#.....#.'];
    star.forEach((r,j)=>[...r].forEach((c,i)=>{if(c==='#')cv.p(10+i,8+j,j<4?'#fff0a0':'#f4c24a');}));
  }else if(name==='glass'){
    cv.box(4,1,20,4,'#8a5a2c','#b8844a','#4a2c12');cv.box(4,23,20,4,'#8a5a2c','#b8844a','#4a2c12');
    cv.r(5,5,2,18,'#6a4220');cv.r(21,5,2,18,'#6a4220');cv.r(5,5,1,18,'#a8743a');
    cv.poly([[8,5],[20,5],[15,13],[13,13]],(x,y)=>x<12?'#cfeaff':'#9cc4e4');
    cv.poly([[13,15],[15,15],[20,23],[8,23]],(x,y)=>x<12?'#cfeaff':'#9cc4e4');
    cv.poly([[9,6],[19,6],[15,11],[13,11]],'#f4c24a');cv.r(14,12,1,5,'#f4c24a');cv.poly([[10,23],[18,23],[15,18],[13,18]],'#e8a82a');
    cv.p(10,7,'#fff');cv.p(10,8,'#fff');
  }else if(name==='gift'){
    cv.ell(14,10,12,7,'#8a5a2c');cv.r(2,10,24,13,'#8a5a2c');cv.r(2,10,24,1,'#b8844a');cv.r(2,22,24,1,'#4a2c12');cv.r(25,10,1,13,'#4a2c12');
    cv.r(2,13,24,2,'#d6a63a');cv.r(2,13,24,1,'#f4d86a');cv.r(6,5,2,17,'#d6a63a');cv.r(20,5,2,17,'#d6a63a');
    cv.r(12,11,4,6,'#f4d24a');cv.r(13,13,2,2,'#2a1608');
    for(const [x,y] of [[4,2],[23,3],[14,0]]){cv.p(x,y,'#fff4a0');cv.p(x-1,y,'#f4c24a');cv.p(x+1,y,'#f4c24a');cv.p(x,y-1,'#f4c24a');cv.p(x,y+1,'#f4c24a');}
  }else if(name==='books'){
    const bk=(x,y,w,c)=>{cv.box(x,y,w,6,c,PX.mul(c,1.3),PX.mul(c,.65));cv.r(x+1,y+2,w-2,1,'#f4d98a');};
    bk(3,20,22,'#2f5a9a');bk(5,14,20,'#a82430');bk(2,8,21,'#3a8a4a');
    cv.r(23,15,3,5,'#f4efe0');cv.r(24,9,3,5,'#f4efe0');cv.p(13,5,'#f4c24a');cv.p(12,6,'#f4c24a');cv.p(14,6,'#f4c24a');cv.p(13,7,'#f4c24a');
  }else if(name==='crown'){
    cv.ell(14,24,12,3,'#7a2a4a');cv.r(2,23,24,1,'#a84a6a');
    cv.poly([[3,22],[2,8],[8,14],[14,4],[20,14],[26,8],[25,22]],(x,y)=>x<10?'#f4d24a':x>18?'#c8962a':'#e8b83a');
    cv.r(3,18,22,4,'#c8962a');cv.r(3,18,22,1,'#fff0a0');
    cv.r(13,3,3,3,'#e8302d');cv.r(2,7,2,2,'#5ac8ff');cv.r(24,7,2,2,'#5aff9a');cv.r(7,19,2,2,'#e8302d');cv.r(13,19,2,2,'#5ac8ff');cv.r(19,19,2,2,'#5aff9a');
  }else if(name==='trophy'){
    cv.poly([[7,2],[21,2],[20,13],[16,17],[12,17],[8,13]],(x,y)=>x<11?'#fff0a0':x>17?'#c8962a':'#f4d24a');
    cv.r(2,4,5,2,'#d6a63a');cv.r(2,4,2,7,'#d6a63a');cv.r(3,10,5,2,'#d6a63a');cv.r(21,4,5,2,'#d6a63a');cv.r(24,4,2,7,'#d6a63a');cv.r(20,10,5,2,'#d6a63a');
    cv.r(12,17,4,5,'#c8962a');cv.box(7,22,14,4,'#6a4220','#a8743a','#2a1608');
    cv.r(12,5,4,1,'#fff');cv.r(13,6,2,4,'#fff0a0');
  }else if(name==='globe'){
    cv.ell(14,11,10,10,(x,y,dx,dy)=>{const n=Hs(Math.floor(x/3),Math.floor(y/3));const land=n>.55&&Math.abs(dx)<.8;const b=land?'#4a9a4a':'#2f6aa0';return dx<-.3?PX.mul(b,1.25):dx>.45?PX.mul(b,.7):b;});
    cv.ell(14,11,10,2,(x,y)=>null);cv.line(3,13,25,13,'#d6a63a');cv.line(4,10,24,10,'#d6a63a');
    cv.r(13,21,3,3,'#6a4220');cv.box(8,24,13,3,'#8a5a2c','#b8844a','#4a2c12');
  }else if(name==='anvil'){
    cv.poly([[2,6],[22,6],[26,9],[20,12],[18,16],[20,20],[8,20],[10,16],[8,12],[2,10]],(x,y)=>y<9?'#aab0c8':y<15?'#7a809a':'#5a6078');
    cv.r(2,6,20,1,'#d8def0');cv.box(6,20,16,6,'#4a4e66','#7a809a','#2a2e44');
    cv.p(24,3,'#ffb04a');cv.p(22,1,'#ffe27a');cv.p(26,5,'#ff8a2a');cv.p(20,3,'#ffd24a');
  }else if(name==='tome'){
    cv.poly([[2,5],[13,7],[13,24],[2,22]],(x,y)=>'#f4efe0');cv.poly([[15,7],[26,5],[26,22],[15,24]],(x,y)=>'#e9dcb4');
    cv.r(13,6,2,18,'#6a4220');cv.line(2,5,2,22,'#4a2c12');cv.line(26,5,26,22,'#4a2c12');cv.line(2,22,13,24,'#4a2c12');cv.line(15,24,26,22,'#4a2c12');
    for(let k=0;k<5;k++){cv.r(4,8+k*3,8,1,'#9a8a6a');cv.r(16,8+k*3,8,1,'#9a8a6a');}
    cv.p(20,3,'#f4c24a');cv.p(19,4,'#f4c24a');cv.p(21,4,'#f4c24a');cv.p(20,5,'#f4c24a');cv.p(20,2,'#fff0a0');
  }
  cv.outline('#14090a');return PX.url(cv);
}
/* ---------- Arena (105x215) ---------- */
let ARENA_URL=null,LIB_URL=null;
function buildArena(){
  if(ARENA_URL)return ARENA_URL;
  const W=105,H=215,cv=PX.Cv(W,H),Hs=PX.hash,mul=PX.mul;
  const wall=(x,y)=>{const ly=y%7,row=Math.floor(y/7),off=(row%2)*6,lx=(x+off)%12,col=Math.floor((x+off)/12);if(ly===6||lx===11)return '#1c1014';const hv=Hs(col,row),b=hv<.3?'#5a4038':hv<.65?'#68483c':'#74544a';if(ly===0)return mul(b,1.22);if(ly===5)return mul(b,.8);return b;};
  cv.r(0,0,W,112,wall);
  /* Boden: Sand mit Platten */
  cv.r(0,112,W,H-112,(x,y)=>{const t=(y-112),ly=t%11,row=Math.floor(t/11),off=(row%2)*10,lx=(x+off)%20;if(ly===10||lx===19)return '#8a6a3a';const hv=Hs(Math.floor((x+off)/20),row);return hv<.5?'#d8b878':'#cfae6c';});
  cv.r(0,112,W,3,'#4a3028');cv.r(0,112,W,1,'#8a6a5a');
  /* Bogen links und rechts */
  const arch=(x0)=>{cv.ell(x0+12,70,12,16,'#120a0e');cv.r(x0,70,24,42,'#120a0e');cv.ell(x0+12,70,14,18,(x,y)=>null);for(let a=0;a<=Math.PI;a+=.05){cv.p(x0+12-Math.cos(a)*13,70-Math.sin(a)*17,'#8a6a5a');cv.p(x0+12-Math.cos(a)*14,70-Math.sin(a)*18,'#3a2420');}cv.r(x0-1,70,1,42,'#8a6a5a');cv.r(x0+24,70,1,42,'#3a2420');};
  arch(4);arch(77);
  /* Banner */
  const ban=(x,c1,c2)=>{cv.r(x-1,0,12,2,'#d6a63a');cv.poly([[x,2],[x+10,2],[x+10,40],[x+5,46],[x,40]],(px,py)=>px<x+3?c1:px>x+7?mul(c2,.7):c2);cv.line(x,2,x,40,'#e8c24a');cv.line(x+10,2,x+10,40,'#e8c24a');cv.r(x+3,12,4,4,'#f4d24a');cv.r(x+4,16,2,6,'#f4d24a');cv.r(x+2,20,6,2,'#f4d24a');};
  ban(36,'#c8302d','#a82424');ban(60,'#c8302d','#a82424');ban(48,'#2f5a9a','#244a82');
  /* Ring im Sand */
  for(let a=0;a<Math.PI*2;a+=.02){cv.p(52+Math.cos(a)*40,168+Math.sin(a)*14,'#a8844a');cv.p(52+Math.cos(a)*30,168+Math.sin(a)*10,'#b8944e');}
  pxTorch(cv,8,88);pxTorch(cv,97,88);
  cv.light([{x:8,y:94,r:44,i:1,c:[255,190,100]},{x:97,y:94,r:44,i:1,c:[255,190,100]},{x:52,y:150,r:60,i:.5,c:[255,200,120],sq:.7}],.875);
  ARENA_URL=PX.url(cv);return ARENA_URL;
}
function buildLib(){
  if(LIB_URL)return LIB_URL;
  const W=105,H=215,cv=PX.Cv(W,H),Hs=PX.hash,mul=PX.mul;
  const cols=['#8a2a30','#2a4a8a','#3a7a40','#9a6a1c','#6a2a8a','#2a7a7a','#a8482a','#4a4a6a'];
  cv.r(0,0,W,H,'#241408');
  for(let r=0;r<8;r++){
    const y=r*27;let x=1;
    cv.r(0,y+23,W,4,(xx,yy)=>yy===y+23?'#b07a40':yy===y+26?'#2a1608':'#7a5028');
    while(x<W){
      const w=2+((Hs(x,r)*3)|0),hh=15+((Hs(r,x)*7)|0),c=cols[(Hs(x*3,r*5)*cols.length)|0],top=y+23-hh;
      cv.r(x,top,w,hh,(px,py)=>px===x?mul(c,1.3):px===x+w-1?mul(c,.62):c);
      cv.r(x,top+2,w,1,'#e8c24a');if(hh>19)cv.r(x,top+hh-4,w,1,'#e8c24a');
      if(Hs(x,r+9)>.9){cv.r(x+w,top+3,1,hh-3,'#1a0e06');}
      x+=w;
      if(Hs(x*7,r)>.93){x+=3+((Hs(x,r)*4)|0);}   /* Luecke */
    }
  }
  cv.light([{x:22,y:24,r:56,i:1.2,c:[255,200,110]},{x:80,y:24,r:56,i:1.2,c:[255,200,110]},{x:52,y:130,r:70,i:.35,c:[255,190,100],sq:.8}],.875);
  /* Laternen */
  for(const lx of [22,80]){cv.r(lx,0,1,12,'#14090a');cv.box(lx-4,12,9,12,'#6a4a1a','#c8962a','#2a1608');cv.r(lx-3,14,7,8,'#ffd890');cv.r(lx-1,14,3,8,'#fff4c0');cv.r(lx-4,10,9,2,'#2a1608');}
  LIB_URL=PX.url(cv);return LIB_URL;
}

function pxLockUrl(){const cv=PX.Cv(10,12);cv.ell(5,4.5,3.4,3.6,'#c8c4d8');cv.ell(5,5,1.8,2.2,[0,0,0]);for(let y=0;y<12;y++)for(let x=0;x<10;x++){if(cv.has(x,y)&&x>3&&x<7&&y>2&&y<7){const k=(y*10+x)*4;cv.d[k+3]=0;}}cv.box(1,5,8,7,'#d6a63a','#f4d86a','#8a5a14');cv.r(4,7,2,3,'#2a1608');cv.outline('#14090a');return PX.url(cv);}
function buildScenes(){
  document.documentElement.style.setProperty('--lockimg',`url(${pxLockUrl()})`);
  buildLodge();
  const fl=(x,y,w,big)=>`<div class="fl" style="left:${(x/105*100).toFixed(2)}%;top:${(y/215*100).toFixed(2)}%;width:${(w/105*100).toFixed(2)}%"><img src="${LODGE_ASSETS[(big?'fb':'fl')+'0']}" alt=""><img class="b" src="${LODGE_ASSETS[(big?'fb':'fl')+'1']}" alt=""></div>`;
  $('#scn-r').innerHTML=`<div class="sbox"><img src="${buildArena()}" alt="">${fl(5.5,81,5)+fl(94.5,81,5)}<div class="samb"></div></div>`;
  $('#scn-u').innerHTML=`<div class="sbox"><img src="${buildLib()}" alt=""><div class="samb"></div></div>`;
  const eyes=[[5,58],[98,60],[19,50],[81,54],[4,112],[99,114],[10,140],[93,142],[36,52],[68,48]];
  $('#scn-d').innerHTML=`<div class="sbox hbox"><img src="${buildHell()}" alt="">${fl(1,81,16,1)+fl(88,81,16,1)+fl(43,124,7)+fl(55,125,7)+fl(49,121,7)}<div class="hamb"></div>${eyes.map((e,i)=>`<i class="eye" style="left:${e[0]}%;top:${(e[1]/215*100).toFixed(1)}%;animation-delay:${(-i*1.7).toFixed(1)}s;animation-duration:${5+i%4}s"></i>`).join('')}</div>`+Array.from({length:12},(_,i)=>`<div class="embers"><i style="left:${6+i*8}%;animation-delay:${(i*0.6)%5}s;animation-duration:${3.4+i%4}s"></i></div>`).join('');
  const M={'b-q':'board','b-week':'banner','b-time':'glass','b-login':'gift','b-dex':'books','b-mst':'crown','b-ach':'trophy','b-stat':'globe','b-forge':'anvil','b-help':'tome'};
  for(const id in M){const im=$('#'+id+' .pimg');if(im)im.src=pxProp(M[id]);}
}
const PIT_SVG=(()=>{
  const N=9;let h='<svg viewBox="0 0 100 70"><defs><radialGradient id="pc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0a0"/><stop offset=".2" stop-color="#ffa030"/><stop offset=".5" stop-color="#e02a0a"/><stop offset="1" stop-color="#3a0404"/></radialGradient><radialGradient id="pg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff5a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".6" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#ff3a10" stop-opacity=".25"/></linearGradient></defs>';
  h+='<ellipse cx="50" cy="40" rx="62" ry="40" fill="url(#pg)"/>';
  for(let k=0;k<N;k++){
    const t=k/N,rx=49-k*4.9,ry=29-k*2.9,cy=30+k*4.3;
    const lit=Math.round(86-t*70),red=Math.round(t*70);
    const col=`rgb(${Math.min(255,lit+red)},${Math.max(10,Math.round(lit-14-t*12))},${Math.max(18,Math.round(lit+8-t*30))})`;
    h+=`<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}" stroke="#0a0610" stroke-width="${(1.6-t).toFixed(2)}"/>`;
    h+=`<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#pw)" opacity="${(.25+t*.5).toFixed(2)}"/>`;
    let j='';for(let i=0;i<14;i++){const an=Math.PI*(1.05+i*.07);j+=`M${(50+rx*Math.cos(an)).toFixed(1)} ${(cy+ry*Math.sin(an)).toFixed(1)}v3.2`;}
    h+=`<path d="${j}" stroke="#000" stroke-opacity=".35" stroke-width=".5" fill="none"/>`;
    h+=`<g class="ring ${k%2?'b':''}"><ellipse cx="50" cy="${cy+.8}" rx="${rx-1.6}" ry="${ry-1}" fill="none" stroke="${k<3?'#8a7cb8':'#a05a4a'}" stroke-opacity="${(.5-t*.25).toFixed(2)}" stroke-width=".6" stroke-dasharray="${(2+k*.2).toFixed(1)} 2.6"/></g>`;
  }
  let st='';for(let i=0;i<22;i++){const t=i/22,an=Math.PI*(.12+t*1.7),k=t*(N-1.5);const rx=49-k*4.9-2,ry=29-k*2.9-1.2,cy=30+k*4.3;st+=`<rect x="${(50+rx*Math.cos(an)-1.8).toFixed(1)}" y="${(cy+ry*Math.sin(an)).toFixed(1)}" width="3.6" height="1.5" fill="#b8aedc" opacity="${(.85-t*.5).toFixed(2)}"/>`;}
  h+=`<g>${st}</g>`;
  h+='<ellipse class="core" cx="50" cy="66" rx="20" ry="7" fill="url(#pg)"/><ellipse class="core" cx="50" cy="67" rx="11" ry="4.4" fill="url(#pc)"/>';
  h+='<g fill="#d8d2c0" stroke="#201a14" stroke-width=".5"><circle cx="9" cy="33" r="3"/><rect x="7.4" y="35" width="3.2" height="2" rx=".6"/><circle cx="91" cy="35" r="3"/><rect x="89.4" y="37" width="3.2" height="2" rx=".6"/></g><g fill="#0a0610"><circle cx="8" cy="32.4" r=".8"/><circle cx="10.2" cy="32.4" r=".8"/><circle cx="90" cy="34.4" r=".8"/><circle cx="92.2" cy="34.4" r=".8"/></g>';
  return h+'</svg>';
})();
buildScenes();
function renderHell(){
  const best=save.bestDepth||0,so=save.souls||0,rushOk=endOpen();
  $('#hell-info').innerHTML=`<div class="hell-box"><div class="tiles"><div class="tile hi"><b>${best}</b><span>Tiefster Rekord</span></div><div class="tile"><b>${Math.max(0,best-100)}</b><span>Etagen im Abgrund</span></div><div class="tile"><b>${fmt(so)}</b><span>Seelen</span></div></div></div>`;
  $('#pit').innerHTML='';
  $('#b-rush').classList.toggle('dis',!rushOk);
  $('#b-endless').classList.toggle('dis',!save.endless);$('#b-endless').hidden=false;
}
