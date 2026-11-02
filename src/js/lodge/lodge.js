/* src/js/lodge/lodge.js
   Gruftlager als zweistöckiges Pixel-Haus mit laufendem Helden. */
/* ---------- Gruftlager: zwei Etagen als Pixel-Art (105x220) ---------- */
const LW=105,LH_=220;
const SLOTPOS={w1:[19,126,15],w2:[62,126,15],w3:[41,126,15],w4:[19,15,15],w5:[54,15,14],t1:[19,32,15],t2:[54,32,14],t3:[19,145,15],t4:[62,145,15],f1:[22,178,15],f2:[40,180,15],f3:[58,178,15],f4:[46,68,15],f5:[64,68,15]};
function pxRoomShell(cv,y0,pal){
  const X0=0,X1=105,bx0=17,bx1=88,top=y0+12,fb=y0+60,fr=y0+108;
  const H=PX.hash;
  /* Rueckwand: Ziegel 8x4 + Fuge */
  cv.r(bx0,top,bx1-bx0,fb-top,(x,y)=>{
    const ly=(y-top)%5,row=Math.floor((y-top)/5),off=(row%2)*4,lx=(x-bx0+off)%9,col=Math.floor((x-bx0+off)/9);
    if(ly===4||lx===8)return pal.mortar;
    const hv=H(col,row),base=hv<.25?pal.b1:hv<.6?pal.b2:hv<.85?pal.b3:pal.b4;
    if(ly===0)return PX.mul(base,1.22);if(ly===3)return PX.mul(base,.82);if(lx===0)return PX.mul(base,1.1);if(lx===7)return PX.mul(base,.88);
    return (H(x,y)>.93)?PX.mul(base,1.12):base;});
  /* Seitenwaende (Perspektive) */
  const side=(left)=>{
    const pts=left?[[0,y0],[bx0,top],[bx0,fb],[0,fr]]:[[X1,y0],[bx1,top],[bx1,fb],[X1,fr]];
    cv.poly(pts,(x,y)=>{
      const t=left?x/bx0:(X1-x)/(X1-bx1);        /* 0 vorn .. 1 hinten */
      const tp=y0+12*Math.min(1,t),bt=fr-48*Math.min(1,t),v=(y-tp)/Math.max(1,bt-tp),rows=9,rv=v*rows,row=Math.floor(rv);
      const px=(bt-tp)/rows,ly=(rv-row)*px;
      const J=[[3,9,15],[0,6,12]][((row%2)+2)%2],xi=left?x:X1-1-x;
      const mortar=ly<1.2||J.includes(Math.floor(xi));
      const f=(.52+.3*Math.min(1,t));
      if(mortar)return PX.mul(pal.mortar,f*.9);
      const base=H(row+50,Math.floor(xi/6))<.5?pal.b1:pal.b3;
      return PX.mul(base,f*(ly<2.2?1.18:1));});
  };
  side(true);side(false);
  /* Decke */
  cv.poly([[0,y0],[X1,y0],[bx1,top],[bx0,top]],(x,y)=>(y-y0)%4===0?PX.mul(pal.ceil,1.25):pal.ceil);
  /* Balken an der Decke */
  cv.poly([[0,y0],[X1,y0],[X1,y0+4],[0,y0+4]],'#3a2410');cv.r(0,y0+3,X1,1,'#6a4524');cv.r(0,y0+4,X1,1,'#150a04');
  cv.r(bx0-1,top,bx1-bx0+2,3,'#3a2410');cv.r(bx0-1,top,bx1-bx0+2,1,'#6a4524');cv.r(bx0-1,top+3,bx1-bx0+2,1,'#150a04');
  /* Boden: Dielen mit Perspektive */
  cv.poly([[bx0,fb],[bx1,fb],[X1,fr],[0,fr]],(x,y)=>{
    const t=(y-fb)/(fr-fb),xl=bx0-bx0*t,xr=bx1+(X1-bx1)*t,N=8,pw=(xr-xl)/N,pi=Math.floor((x-xl)/pw),fx=(x-xl)-pi*pw;
    const dy=y-fb;const seam=[0,7,16,27,40,55];let on=false;for(const sv of seam){if(dy===sv+Math.floor(H(pi,3)*5))on=true;}
    const hv=H(pi,Math.floor(dy/12)),base=hv<.3?pal.f1:hv<.65?pal.f2:pal.f3;
    if(fx<1)return PX.mul(base,.6);if(on)return PX.mul(base,.62);
    if(fx<2)return PX.mul(base,1.12);
    return (H(x,y)>.94)?PX.mul(base,.88):base;});
  /* Sockelleiste */
  cv.r(bx0,fb-3,bx1-bx0,3,'#2a1d46');cv.r(bx0,fb-3,bx1-bx0,1,'#4a3a76');
}
function pxTorch(cv,x,y){
  cv.r(x-1,y+2,3,2,'#7a5a2a');cv.r(x-1,y+3,3,1,'#3a2410');
  cv.r(x,y+4,1,7,'#5a3818');cv.r(x-1,y+4,1,7,'#7a5028');cv.r(x+1,y+4,1,7,'#2a1608');
  cv.r(x-2,y+10,5,2,'#3a3a4a');cv.r(x-2,y+10,5,1,'#6a6a7a');
  cv.r(x-2,y+1,5,1,'#4a4a5a');
}
function pxBed(cv,x,y){
  /* Bett von der Seite: Kopfteil links hoch, Fussteil niedrig */
  cv.r(x,y+2,4,24,'#4a2c12');cv.r(x,y+2,4,1,'#8a5a2c');cv.r(x+1,y+3,1,22,'#7a4e26');cv.r(x-1,y+1,6,2,'#6a4220');
  cv.r(x+34,y+12,3,14,'#4a2c12');cv.r(x+34,y+12,3,1,'#8a5a2c');
  cv.r(x+4,y+14,31,12,'#6a4220');cv.r(x+4,y+14,31,1,'#a8743a');cv.r(x+4,y+25,31,1,'#2a1608');
  cv.r(x+4,y+9,31,6,'#e9dcb4');cv.r(x+4,y+9,31,1,'#fffbe8');cv.r(x+4,y+14,31,1,'#b8a878');
  cv.r(x+5,y+5,9,6,'#f4efe0');cv.r(x+5,y+5,9,1,'#ffffff');cv.r(x+5,y+10,9,1,'#c8bea0');cv.r(x+13,y+6,1,4,'#d8d0b8');
  cv.r(x+15,y+9,19,8,'#a82430');cv.r(x+15,y+9,19,1,'#d84a54');cv.r(x+15,y+16,19,1,'#6a1018');
  for(let i=0;i<5;i++)cv.r(x+18+i*4,y+10,1,6,'#8a1a24');
  cv.r(x+15,y+13,19,1,'#e8c24a');
  cv.r(x+4,y+26,3,2,'#2a1608');cv.r(x+32,y+26,3,2,'#2a1608');
}
function pxWindow(cv,x,y,w,h){
  cv.ell(x+w/2,y+w/2,w/2+1.5,w/2+1.5,'#2a1a0c');cv.r(x-1,y+w/2,w+2,h-w/2+1,'#2a1a0c');
  const sky=(xx,yy)=>PX.hash(xx,yy)>.93?'#e8f0ff':(yy-y<h*.5?'#15244a':'#1c2f5c');
  cv.ell(x+w/2,y+w/2,w/2,w/2,sky);cv.r(x,y+w/2,w,h-w/2,sky);
  cv.ell(x+w*.68,y+w*.45,2.6,2.6,'#f4efd0');cv.ell(x+w*.68-1,y+w*.45-1,1,1,'#fff8e0');cv.ell(x+w*.68+1,y+w*.45+1,.6,.6,'#d8d4b0');
  cv.r(x+Math.floor(w/2),y,1,h,'#2a1a0c');cv.r(x,y+Math.floor(h*.55),w,1,'#2a1a0c');
  cv.r(x-2,y+h,w+4,2,'#6a4524');cv.r(x-2,y+h,w+4,1,'#a8743a');
}
function pxShelf(cv,x0,x1,y){
  cv.r(x0,y,x1-x0,2,'#8a5a2c');cv.r(x0,y,x1-x0,1,'#b07a40');cv.r(x0,y+2,x1-x0,1,'#2a1608');
  for(const bx of [x0+2,x1-4]){cv.r(bx,y+3,2,4,'#4a2c12');cv.r(bx,y+3,1,4,'#7a4e26');}
}
function pxBooks(cv,x,y,n){
  const cols=['#a82430','#2f5a9a','#3a8a4a','#c8962a','#7a3a9a','#2a7a8a'];let cx=x;
  for(let i=0;i<n;i++){const hh=5+(PX.hash(i,7)*3|0),c=cols[i%cols.length];cv.r(cx,y-hh,2,hh,c);cv.r(cx,y-hh,1,hh,PX.mul(c,1.3));cv.r(cx+1,y-hh,1,hh,PX.mul(c,.7));cv.r(cx,y-hh+1,2,1,'#f4d98a');cx+=2;}
}
function pxTable(cv,x,y,w,h){
  cv.r(x,y,w,2,'#a8743a');cv.r(x,y,w,1,'#d09858');cv.r(x,y+2,w,1,'#3a2410');
  cv.r(x+1,y+3,2,h-3,'#5a3818');cv.r(x+w-3,y+3,2,h-3,'#5a3818');cv.r(x+1,y+3,1,h-3,'#7a5028');cv.r(x+w-3,y+3,1,h-3,'#7a5028');
  cv.r(x+2,y+h-4,w-4,1,'#4a2c12');
  cv.r(x+2,y+3,w-4,3,'#a82430');cv.r(x+2,y+3,w-4,1,'#d84a54');
}
function pxFireplace(cv,x,y,w,h){
  const st=(xx,yy)=>{const r=Math.floor((yy-y)/4),o=(r%2)*3,l=(xx-x+o)%7;if((yy-y)%4===3||l===6)return '#15122a';const hv=PX.hash(Math.floor((xx-x+o)/7),r);return hv<.5?'#5a547a':'#4a4468';};
  cv.r(x-3,y-4,w+6,4,'#7a6a8a');cv.r(x-3,y-4,w+6,1,'#a498b8');cv.r(x-3,y,w+6,1,'#2a2440');
  cv.r(x,y+1,w,h-1,st);
  const ax=x+3,aw=w-6;cv.ell(x+w/2,y+9,aw/2,9,'#0a0508');cv.r(ax,y+9,aw,h-10,'#0a0508');
  cv.r(ax,y+h-3,aw,3,'#3a2410');cv.r(ax+1,y+h-4,aw-2,1,'#7a5028');
  cv.r(ax+2,y+h-5,aw-4,2,'#5a3818');
  cv.r(x-1,y+h,w+2,2,'#2a2440');
}
function pxBarrel(cv,x,y){
  cv.ell(x+5,y+8,5,8,(xx,yy,dx)=>dx<-.3?'#8a5a2c':dx>.4?'#4a2c12':'#6a4220');
  cv.r(x,y+3,10,1,'#c8a24a');cv.r(x,y+11,10,1,'#c8a24a');cv.r(x+1,y+7,8,1,'#2a1608');
}
function pxSpiral(cv,cx,top,bot){
  /* Wendeltreppe: Mittelsaeule mit versetzten Stufen */
  cv.r(cx-1,top-2,3,bot-top+4,'#5a3818');cv.r(cx-1,top-2,1,bot-top+4,'#a8743a');cv.r(cx+1,top-2,1,bot-top+4,'#2a1608');
  const n=12,step=(bot-top)/n;
  for(let i=0;i<=n;i++){
    const y=Math.round(bot-i*step),dir=i%2?1:-1,x0=dir<0?cx-13:cx,w=13;
    cv.r(x0,y,w,2,'#b07a40');cv.r(x0,y,w,1,'#d8a860');
    cv.r(x0,y+2,w,3,'#6a4220');cv.r(x0,y+4,w,1,'#2a1608');
    /* Stufenkante + Schatten an der Wand */
    for(let k=0;k<w;k+=3)cv.p(x0+k,y+1,'#8a5a2c');
  }
}
function pxRug(cv,cx,cy,rx,ry,main,trim){
  cv.ell(cx,cy,rx,ry,(x,y,dx,dy)=>{const r=Math.sqrt(dx*dx+dy*dy);if(r>.92)return '#e8c24a';if(r>.84)return '#5a0e1c';if(r>.72)return PX.hash(x,y)>.5?trim:'#8a1a2a';return (Math.floor((x+y)/2)%2)&&r>.35?main:PX.mul(main,.88);});
  cv.ell(cx,cy,rx*.18,ry*.18,'#e8c24a');
}
function pxCobweb(cv,x,y){const c='#c8c4e0';for(let i=0;i<14;i++){cv.p(x+i,y,c);cv.p(x,y+i,c);}for(let i=0;i<10;i++){cv.p(x+i,y+i,c);}for(let k=4;k<=12;k+=4)for(let i=0;i<k;i++){cv.p(x+Math.round(k*Math.cos(i/k*Math.PI/2)),y+Math.round(k*Math.sin(i/k*Math.PI/2)),c);}}
function pxSkull(cv,x,y){cv.r(x,y,6,5,'#e8e0c8');cv.r(x+1,y+5,4,2,'#d8d0b8');cv.r(x+1,y+2,1,2,'#1a1020');cv.r(x+4,y+2,1,2,'#1a1020');cv.r(x+3,y+4,1,1,'#1a1020');cv.r(x,y,6,1,'#fffbe8');cv.outline('#1a1020');}
function pxWard(){
  const cv=PX.Cv(18,44);
  cv.box(1,3,16,38,'#8a5a2c','#b8844a','#4a2c12');
  cv.r(0,1,18,3,'#6a4220');cv.r(0,1,18,1,'#b8844a');cv.r(0,3,18,1,'#2a1608');
  cv.r(2,5,6,34,'#7a4e26');cv.r(10,5,6,34,'#7a4e26');cv.r(2,5,6,1,'#a8743a');cv.r(10,5,6,1,'#a8743a');cv.r(7,5,1,34,'#2a1608');cv.r(10,5,1,34,'#2a1608');
  for(const x of [3,11]){cv.r(x,8,4,10,'#8a5a2c');cv.r(x,8,4,1,'#b8844a');cv.r(x,22,4,13,'#8a5a2c');cv.r(x,22,4,1,'#b8844a');}
  cv.r(6,20,1,3,'#f4d24a');cv.r(11,20,1,3,'#f4d24a');
  cv.r(2,41,3,2,'#2a1608');cv.r(13,41,3,2,'#2a1608');
  cv.outline('#12080a');return PX.url(cv);
}
function pxChest(){
  const cv=PX.Cv(24,18);
  cv.ell(12,6,11,5,'#8a5a2c');cv.r(1,6,22,10,'#8a5a2c');
  cv.r(1,6,22,1,'#b8844a');cv.r(1,15,22,1,'#4a2c12');cv.r(22,6,1,10,'#4a2c12');
  cv.r(1,8,22,2,'#d6a63a');cv.r(1,8,22,1,'#f4d86a');
  cv.r(4,2,2,13,'#d6a63a');cv.r(18,2,2,13,'#d6a63a');cv.r(4,2,1,13,'#f4d86a');cv.r(18,2,1,13,'#f4d86a');
  cv.r(10,7,4,5,'#f4d24a');cv.r(10,7,4,1,'#fff4a0');cv.r(11,9,2,2,'#2a1608');
  cv.outline('#12080a');return PX.url(cv);
}
function pxFlame(frame,big){
  const rows=big?[
    ['.......oo.......','......oooo......','.....ooooo...o..','....oooyooo.oo..','...ooooyyooooo..','..oooyyyyyooooo.','..ooyyyywyyyooo.','..oyyywwwyyyyoo.','.ooyywwwwwyyyoo.','.ooyywwwwwwyyoo.','.oyyywwwwwyyyyo.','.oyyyyywwyyyyyo.','..oyyyyyyyyyyo..','...ooyyyyyyoo...']
   ,['..o.....oo.....','..oo...oooo.....','..ooo..ooooo....','...oooooyooo....','..oooooyyoooo...','..ooooyyyyooooo.','..oooyyywyyyoo..','.ooyyywwwyyyyoo.','.ooyywwwwwyyyoo.','.oyyywwwwwwyyyo.','.oyyywwwwwyyyyo.','..oyyyywwyyyyo..','..oyyyyyyyyyyo..','...ooyyyyyyoo...']]
  :[
    ['..o..','.oo..','.ooo.','oyoo.','oyyo.','oywyo','.oyo.','..o..'],
    ['..o..','..oo.','.ooo.','.oyoo','oyyyo','oywyo','.oyo.','..o..']];
  const R=rows[frame%2],h=R.length,w=R[0].length,cv=PX.Cv(w,h);
  const C={o:'#ff6a1a',y:'#ffc84a',w:'#fff4c0'};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=R[y][x];if(C[ch])cv.p(x,y,C[ch]);}
  return PX.url(cv);
}

function pxPumpkin(cv,x,y){cv.ell(x,y,5,4,(px,py,dx)=>Math.abs(dx)<.15?'#d86a14':dx<-.4?'#ffa030':dx>.5?'#a8480c':'#f0801c');cv.r(x-1,y-6,2,3,'#3a8a3a');cv.r(x-2,y-2,1,2,'#2a1008');cv.r(x+1,y-2,1,2,'#2a1008');cv.r(x-2,y+1,5,1,'#2a1008');cv.outline('#3a1604');}
function pxEgg(cv,x,y,c){cv.ell(x,y,2.5,3.2,(px,py,dx,dy)=>dy>.1&&dy<.45?PX.mul(c,.72):c);cv.p(x-1,y-2,'#fff');cv.outline(PX.mul(c,.4));}
function pxChips(cv,x,y){[['#d9302d',5],['#f4efe0',4],['#2f5a9a',3]].forEach(([c,n],k)=>{for(let i=0;i<n;i++){cv.r(x+k*7,y-i*2,6,2,i%2?PX.mul(c,.8):c);cv.r(x+k*7,y-i*2,6,1,PX.mul(c,1.25));}});}
function lodgeEventDeco(cv,ev){
  const E=EVPX;
  switch(ev){
    case 'halloween':E.bunting(cv,['#ff8a2a','#3a2d63','#ff8a2a','#1a1020'],6,3);pxPumpkin(cv,76,206);pxPumpkin(cv,31,171);pxPumpkin(cv,60,99);pxCobweb(cv,17,126);break;
    case 'xmas':E.lights(cv,['#ff5d73','#ffe27a','#5aa0e8','#8bd450'],0,116,4);
      [[0,'#d9302d'],[1,'#2f9a4a'],[2,'#d9302d']].forEach(([i,c])=>{const x=44+i*7;cv.r(x,142,4,6,c);cv.r(x-1,142,6,2,'#f4efe0');});
      {const bx=70,by=106;[[5,by-10,10],[8,by-18,12],[11,by-2,14]].forEach(([w,ty],k)=>cv.poly([[bx,ty-8+k*0],[bx-w,ty+4],[bx+w,ty+4]],'#1f6a3a'));cv.r(bx-1,by,3,4,'#5a3a1b');[[-3,-14,'#ff5d73'],[3,-8,'#ffe27a'],[-5,-3,'#5aa0e8'],[4,0,'#ff5d73']].forEach(([dx,dy,c])=>cv.r(bx+dx,by+dy,2,2,c));cv.r(bx-1,by-27,3,3,'#ffe27a');}
      break;
    case 'easter':E.bunting(cv,['#ffb3d1','#ffe27a','#b5e8ff','#c8f0a8','#d8b8ff'],6,3);[[30,206,'#ffb3d1'],[64,212,'#b5e8ff'],[80,196,'#ffe27a'],[56,102,'#d8b8ff'],[72,92,'#ffb3d1'],[20,116+60,'#c8f0a8']].forEach(([x,y,c])=>pxEgg(cv,x,y,c));break;
    case 'valentine':{const y0=6,sag=3;E.rope(cv,y0,sag,'#e8c0cc');for(let i=0;i<9;i++){const x=Math.round(6+i*11.5);E.heart(cv,x,E.ropeY(x,y0,sag)+5,['#ff5d73','#ff9ac0','#e8302d'][i%3]);}
      [[40,203],[52,208],[62,203]].forEach(([x,y],i)=>E.heart(cv,x,y,['#ff5d73','#ff9ac0','#e8302d'][i]));E.heart(cv,50,100,'#ff5d73');break;}
    case 'italy':E.bunting(cv,['#2f9a4a','#f4efe0','#d9302d'],6,3);E.bunting(cv,['#2f9a4a','#f4efe0','#d9302d'],115,3);break;
    case 'hungary':E.pepper(cv,24,14,24);E.pepper(cv,84,14,24);E.bunting(cv,['#d9302d','#f4efe0','#2f9a4a'],115,3);break;
    case 'vegas':E.lights(cv,['#ffe27a','#ff5d73'],0,6,3);E.lights(cv,['#ffe27a','#ff5d73'],1,115,3);pxChips(cv,64,212);pxChips(cv,10,100);break;
    case 'birthday':E.bunting(cv,['#ff5d73','#ffe27a','#5aa0e8','#8bd450','#c9a7ff'],6,3);[[96,50,'#ff5d73'],[88,46,'#ffe27a'],[101,58,'#5aa0e8'],[8,128,'#8bd450'],[14,136,'#ff9ac0']].forEach(([x,y,c])=>E.balloon(cv,x,y,c));break;
  }
}
let LODGE_URL=null,LODGE_ASSETS=null,LODGE_EV='\0';
function buildLodge(){
  const evk=(typeof activeEvent==='function'&&activeEvent())||'';
  if(LODGE_URL&&LODGE_EV===evk)return;LODGE_EV=evk;
  const cv=PX.Cv(LW,LH_);
  const palU={mortar:'#262042',b1:'#4a4378',b2:'#544c88',b3:'#40396c',b4:'#5c5496',ceil:'#1c1736',f1:'#7a4e26',f2:'#6a4220',f3:'#8a5a2c'};
  const palL={mortar:'#2a1e36',b1:'#524468',b2:'#5e4e74',b3:'#483c5c',b4:'#66567c',ceil:'#1a1430',f1:'#6a4220',f2:'#5a3818',f3:'#7a4e26'};
  pxRoomShell(cv,0,palU);pxRoomShell(cv,112,palL);
  /* Zwischendecke */
  cv.r(0,106,105,7,(x,y)=>y===106?'#6a4524':y===107?'#a8743a':y===112?'#150a04':y===111?'#2a1608':((x+(y>>1)*5)%17===0?'#3a2410':'#4a2c12'));
  /* oben */
  pxWindow(cv,38,14,14,26);
  pxShelf(cv,18,70,48);pxBooks(cv,38,47,6);pxBooks(cv,60,47,3);
  pxBed(cv,4,78);
  pxTorch(cv,6,38);pxTorch(cv,98,38);
  pxCobweb(cv,17,16);
  pxRug(cv,62,100,18,4,'#2a4a7a','#3a5a9a');
  /* Treppenloch + Gelaender oben rechts */
  cv.r(80,106,25,6,'#0a0508');cv.r(80,106,25,1,'#6a4524');
  for(let x=82;x<105;x+=4){cv.r(x,96,1,11,'#6a4220');cv.r(x,96,1,1,'#a8743a');}cv.r(81,96,24,2,'#8a5a2c');cv.r(81,96,24,1,'#b8844a');
  /* unten */
  pxFireplace(cv,40,142,24,30);
  pxTable(cv,17,160,19,12);pxTable(cv,62,160,19,12);
  pxBooks(cv,22,160,3);
  pxBarrel(cv,2,156);
  pxTorch(cv,6,150);
  pxRug(cv,46,203,28,9,'#8a1a2a','#a82a3a');
  pxSpiral(cv,93,118,212);
  pxSkull(cv,78,200);
  lodgeEventDeco(cv,evk);
  /* Licht */
  const W=[255,190,110],M=[150,180,255];
  cv.light([
    {x:6,y:36,r:30,i:1.0,c:W},{x:98,y:36,r:30,i:1.0,c:W},{x:6,y:148,r:30,i:.9,c:W},
    {x:52,y:165,r:46,i:1.25,c:[255,150,70]},{x:44,y:70,r:26,i:.55,c:M,sq:.6},{x:46,y:30,r:20,i:.35,c:M},
    {x:52,y:18,r:60,i:.25,c:W}
  ],.875);
  LODGE_URL=PX.url(cv);
  if(LODGE_ASSETS)return;
  LODGE_ASSETS={ward:pxWard(),chest:pxChest(),fl0:pxFlame(0),fl1:pxFlame(1),fb0:pxFlame(0,1),fb1:pxFlame(1,1)};
}

function pxLute(){const cv=PX.Cv(14,14);cv.ell(5,9,4.5,4,(x,y,dx)=>dx<-.2?'#c8782a':'#8a4a1a');cv.ell(5,9,1.3,1.3,'#1a0e06');cv.line(8,6,13,1,'#5a3416');cv.line(9,6,13,2,'#8a5a2c');cv.r(12,0,2,2,'#2a1608');cv.outline('#12080a');return PX.url(cv);}

const WARD_SVG=`<svg viewBox="0 0 30 60"><rect x="1" y="2" width="28" height="56" rx="2" fill="#7a4e26" stroke="#2a1608" stroke-width="2"/><rect x="4" y="5" width="10.5" height="50" fill="#8a5a2c" stroke="#3a2210" stroke-width="1"/><rect x="15.5" y="5" width="10.5" height="50" fill="#8a5a2c" stroke="#3a2210" stroke-width="1"/><circle cx="12" cy="31" r="1.6" fill="#ffe27a"/><circle cx="18" cy="31" r="1.6" fill="#ffe27a"/><path d="M6 8h6M17.5 8h6" stroke="#b07a40" stroke-width="1.2"/><path d="M5 57l-1 3M25 57l1 3" stroke="#2a1608" stroke-width="2"/></svg>`;
const CHEST_SVG=`<svg viewBox="0 0 40 30"><path d="M3 12Q3 3 20 3Q37 3 37 12Z" fill="#8a5a2c" stroke="#2a1608" stroke-width="2"/><rect x="3" y="12" width="34" height="15" fill="#7a4e26" stroke="#2a1608" stroke-width="2"/><rect x="3" y="12" width="34" height="3" fill="#f4b942"/><rect x="16" y="9" width="8" height="10" rx="1.5" fill="#ffe27a" stroke="#8a5a0c" stroke-width="1.2"/><circle cx="20" cy="14" r="1.4" fill="#2a1608"/><path d="M8 3v24M32 3v24" stroke="#f4b942" stroke-width="2" opacity=".85"/></svg>`;
function renderCamp(){
  if(!save.camp)save.camp={slots:{},own:{}};
  const C=save.camp;buildLodge();
  const hid=heroId('normal',save.cls||'krieger',skinOf(save.cls||'krieger'));
  const pc=(x,y,w)=>`left:${(x/LW*100).toFixed(2)}%;top:${(y/LH_*100).toFixed(2)}%;width:${(w/LW*100).toFixed(2)}%`;
  let h=`<div class="lodge"><img class="lbg" src="${LODGE_URL}" alt="">`;
  const fl=(x,y,w,big)=>`<div class="fl" style="${pc(x,y,w)}"><img src="${LODGE_ASSETS[(big?'fb':'fl')+'0']}" alt=""><img class="b" src="${LODGE_ASSETS[(big?'fb':'fl')+'1']}" alt=""></div>`;
  h+=fl(3.5,31,5)+fl(95.5,31,5)+fl(3.5,143,5)+fl(44,159,16,1);
  h+='<div class="amb"></div>';
  for(const [id,type,label] of CAMP_SLOTS){
    const it=campFind(C.slots[id]),P=SLOTPOS[id]||[40,40,14];
    h+=`<button class="rs ${type}${it?' has '+it.kind:''}" data-s="${id}" aria-label="${label}" style="${pc(P[0],P[1],P[2])}">${it?spr(it.ico):'<span>+</span>'}</button>`;
  }
  h+=`<button class="obj ward" id="obj-ward" aria-label="Kleiderschrank" style="${pc(70,17,18)}"><img src="${LODGE_ASSETS.ward}" alt=""></button><button class="obj chest" id="obj-chest" aria-label="Kammer der Schätze" style="${pc(5,196,22)}"><img src="${LODGE_ASSETS.chest}" alt=""></button>`;
  h+=`<div class="hero" id="lhero"><div class="lute"><img src="${pxLute()}" alt=""></div><div class="hsp">${spr(hid)}</div><i class="zz z1">z</i><i class="zz z2">Z</i><i class="zz z3">z</i><i class="nt n1">♪</i><i class="nt n2">♫</i></div></div>`;
  for(const sel of ['#camp-body','#camp-inline']){const box=$(sel);if(box)box.innerHTML=h;}
  $$('#camp-body .rs,#camp-inline .rs').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();sfx('click');openCampPick(b.dataset.s);}));
  $$('.obj.ward').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();sfx('click');openDex('look');}));
  $$('.obj.chest').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();sfx('click');openVault();}));
  $$('.lodge .hero').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();sfx('flip');LH.poke();}));
  LH.place();
}
/* Der Held lebt im Lager: läuft herum, steigt die Wendeltreppe, schläft, spielt Laute */
const LH={x:46,y:208,floor:0,mode:'idle',t:1,goal:null,dir:1,route:[],iv:0,walking:0,
  FL:[[22,72,198,214],[16,78,97,106]],
  stairs(up){const P=[];for(let i=0;i<=12;i++){P.push([i%2?99.5:86.5,Math.round(212-i*7.83)]);}if(!up)P.reverse();return P;},
  place(){this.upd();if(!this.iv)this.iv=setInterval(()=>this.tick(),60);},
  els(){return document.querySelectorAll('.lodge .hero');},
  upd(){
    const sty=this.mode==='sleep'?'translate(-50%,-60%) rotate(-90deg)':`translate(-50%,-100%) scaleX(${this.dir})`;
    this.els().forEach(e=>{e.style.left=(this.x/LW*100)+'%';e.style.top=(this.y/LH_*100)+'%';e.style.zIndex=Math.round(this.y);e.dataset.m=this.mode;e.dataset.w=this.walking?1:0;e.querySelector('.hsp').style.transform=sty;});
  },
  poke(){this.t=0;this.mode='idle';this.goal=null;this.route=[];this.walking=0;},
  pick(){
    const r=Math.random(),f=this.floor;
    if(r<.3)return this.go(f,rr(this.FL[f][0],this.FL[f][1]),rr(this.FL[f][2],this.FL[f][3]),'idle',rr(1,2.5));
    if(r<.55)return this.go(1,31,98,'sleep',rr(7,11));
    if(r<.8)return this.go(0,36,210,'lute',rr(7,10));
    if(r<.9)return this.go(0,50,190,'fire',rr(4,6));
    return this.go(1,50,98,'look',rr(2,3));
  },
  go(fl,x,y,mode,dur){
    this.route=[];
    if(fl!==this.floor){
      if(fl===1){for(const q of this.stairs(true))this.route.push([q[0],q[1],'s']);this.route.push([88,104,1]);}
      else{this.route.push([88,104,'s']);for(const q of this.stairs(false))this.route.push([q[0],q[1],'s']);this.route.push([70,210,0]);}
    }
    this.route.push([x,y,fl]);this.goal={mode,dur};this.mode='walk';
  },
  tick(){
    const el=$('#tp-l');if(!el||!el.classList.contains('cur')){if(!document.querySelector('#m-camp.on'))return;}
    const dt=.06;
    if(this.mode==='walk'){
      const w=this.route[0];
      if(!w){this.mode=this.goal.mode;this.t=this.goal.dur;this.walking=0;this.upd();return;}
      const dx=w[0]-this.x,dy=w[1]-this.y,d=Math.hypot(dx,dy),st=w[2]==='s';
      const step=Math.min(d,(st?20:26)*dt);this.walking=1;
      if(Math.abs(dx)>.3)this.dir=dx>0?1:-1;
      if(d<.7){if(typeof w[2]==='number')this.floor=w[2];this.route.shift();}
      else{this.x+=dx/d*step;this.y+=dy/d*step;}
      this.upd();return;
    }
    this.walking=0;this.t-=dt;
    if(this.mode==='lute')this.dir=1;
    if(this.mode==='fire')this.dir=-1;
    if(this.t<=0)this.pick();
    this.upd();
  }
};
function rr(a,b){return a+Math.random()*(b-a);}
function openCamp(){
  renderCamp();
  if(!($('#scr-title').classList.contains('on')&&tpCur==='l'))openModal('m-camp');
}
function openCampPick(slot){
  const [,type,label]=CAMP_SLOTS.find(x=>x[0]===slot),C=save.camp;
  const box=$('#camp-pick');box.innerHTML='';
  const cur=C.slots[slot]||'';
  const add=(name,ico,tag,fn,on)=>{const b=document.createElement('button');b.className='card vcard'+(on?' sel':'');b.innerHTML=`${ico?spr(ico):''}<div class="cmain"><b>${name}</b></div><div class="price${on?' on':''}">${tag}</div>`;b.addEventListener('click',()=>{fn();});box.appendChild(b);};
  $('#camp-pick-t').textContent=label;
  add('Leer lassen','', cur?'Wählen':'Aktiv',()=>{delete C.slots[slot];persist();closeModal('m-campp');openCamp();},!cur);
  for(const it of campItems(type)){
    const own=it.kind!=='prop'||C.own[it.id];
    add(it.n,it.ico,own?(cur===it.id?'Aktiv':'Aufstellen'):spr('i_gs')+'<b>'+it.price+'</b>',()=>{
      if(!own){if((save.gs||0)<it.price){sfx('block');return;}save.gs-=it.price;C.own[it.id]=1;sfx('win');}
      C.slots[slot]=it.id;persist();sfx('card');closeModal('m-campp');openCamp();updateStats();
    },cur===it.id);
  }
  openModal('m-campp');
}
