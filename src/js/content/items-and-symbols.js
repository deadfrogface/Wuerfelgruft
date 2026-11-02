/* src/js/content/items-and-symbols.js
   Wurf-Items, Fundstücke und ihre Symbole je Zone. */
/* ================= Symbole der neuen Verstärkungen ================= */
function mkIcon(fn){
  const g=Array.from({length:16},()=>Array(16).fill(null));
  const P=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=c;};
  const D={
    p:P,
    r:(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j,c);},
    c:(cx,cy,r,c)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++)if((x-cx)**2+(y-cy)**2<=r*r+.3)P(x,y,c);},
    o:(cx,cy,r,c)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=(x-cx)**2+(y-cy)**2;if(d<=r*r+.3&&d>(r-1.2)**2)P(x,y,c);}},
    l:(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)P(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);}
  };
  fn(D);
  const o=g.map(r=>r.slice());
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!g[y][x])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&X<16&&Y>=0&&Y<16&&g[Y][X]){o[y][x]='#17152b';break;}}
  return o;
}
const ICONS={
  crit:d=>{d.l(7,1,7,14,'#ffe27a');d.l(1,7,14,7,'#ffe27a');d.l(3,3,12,12,'#f4b942');d.l(12,3,3,12,'#f4b942');d.c(7.5,7.5,3,'#e8553d');d.c(7.5,7.5,1.3,'#ffe27a');},
  armor:d=>{d.r(3,3,10,9,'#8b93ad');d.r(1,3,3,4,'#8b93ad');d.r(12,3,3,4,'#8b93ad');d.r(6,2,4,2,'#17152b');d.r(3,9,10,3,'#6f6993');for(let y=4;y<11;y+=2)for(let x=4+(y%4?0:1);x<12;x+=2)d.p(x,y,'#dfe6f2');},
  rest:d=>{d.l(2,13,13,10,'#8a5a2a');d.l(2,10,13,13,'#a8743a');d.c(7.5,7,3.5,'#e8553d');d.c(7.5,8,2.4,'#ff8a5c');d.c(7.5,9,1.4,'#ffe27a');d.p(7,3,'#e8553d');d.p(7,4,'#ff8a5c');},
  sling:d=>{d.l(7,13,7,8,'#8a5a2a');d.l(7,8,3,2,'#a8743a');d.l(7,8,12,2,'#a8743a');d.l(3,2,12,2,'#e9dfc8');d.c(7.5,3,1.6,'#8b93ad');},
  boots:d=>{d.r(5,2,5,8,'#a8743a');d.r(5,9,9,4,'#8a5a2a');d.r(4,12,11,2,'#5a3a1a');d.r(5,2,5,2,'#e9dfc8');d.p(7,6,'#f4b942');d.p(7,8,'#f4b942');},
  wide:d=>{d.c(7.5,8.5,4,'#4a4566');d.p(6,7,'#dfe6f2');d.l(8,4,10,2,'#c98a4b');d.p(11,1,'#ffe27a');d.o(7.5,8.5,6.5,'#ff8a5c');},
  stun:d=>{d.c(7.5,9,4.5,'#ffe27a');d.c(6,8,1,'#17152b');d.c(9,8,1,'#17152b');d.l(5,11,10,11,'#b47a14');d.p(3,3,'#fff3b0');d.p(7,2,'#fff3b0');d.p(11,3,'#fff3b0');d.p(2,2,'#fff3b0');d.p(12,2,'#fff3b0');},
  splash:d=>{d.c(7.5,7.5,3,'#ff8a5c');d.c(7.5,7.5,1.5,'#ffe27a');for(let a=0;a<8;a++){const t=a*Math.PI/4;d.l(7.5+Math.cos(t)*4,7.5+Math.sin(t)*4,7.5+Math.cos(t)*6.5,7.5+Math.sin(t)*6.5,'#e8553d');}},
  regen:d=>{d.r(6,2,4,12,'#8bd450');d.r(2,6,12,4,'#8bd450');d.r(7,3,2,10,'#c5f285');d.r(3,7,10,2,'#c5f285');},
  dodge:d=>{d.l(2,4,11,4,'#8fd0e8');d.l(11,4,13,6,'#8fd0e8');d.l(3,8,13,8,'#cfeaff');d.l(13,8,14,10,'#cfeaff');d.l(2,12,10,12,'#8fd0e8');d.l(10,12,12,10,'#8fd0e8');},
  gold:d=>{for(const [x,y] of [[4,10],[10,10],[7,6]]){d.c(x+1.5,y+1.5,3,'#f4b942');d.c(x+1.5,y+1.5,1.6,'#ffe27a');}},
  pick:d=>{d.l(3,13,11,5,'#a8743a');d.l(4,13,12,5,'#a8743a');d.l(4,4,12,4,'#8b93ad');d.l(3,5,3,6,'#8b93ad');d.l(12,5,13,8,'#8b93ad');d.l(5,3,11,3,'#dfe6f2');},
  phoenix:d=>{d.c(7.5,5,3,'#ff8a5c');d.l(7,8,4,14,'#e8553d');d.l(8,8,11,14,'#e8553d');d.l(7.5,6,7.5,14,'#ffe27a');d.p(6,4,'#ffe27a');d.p(9,4,'#ffe27a');d.p(7,2,'#ffe27a');},
  swift:d=>{d.l(2,3,7,8,'#5aa0e8');d.l(7,8,2,13,'#5aa0e8');d.l(3,3,8,8,'#5aa0e8');d.l(8,8,3,13,'#5aa0e8');d.l(8,3,13,8,'#8fd0e8');d.l(13,8,8,13,'#8fd0e8');d.l(9,3,14,8,'#8fd0e8');d.l(14,8,9,13,'#8fd0e8');},
  frost:d=>{for(const [a,b,c,e] of [[7.5,1,7.5,14],[2,4.5,13,10.5],[2,10.5,13,4.5]])d.l(a,b,c,e,'#cfeaff');d.c(7.5,7.5,1.6,'#ffffff');d.p(5,2,'#8fd0e8');d.p(10,2,'#8fd0e8');d.p(5,13,'#8fd0e8');d.p(10,13,'#8fd0e8');},
  poison:d=>{d.r(6,2,4,3,'#e9dfc8');d.c(7.5,9,5,'#5aa02c');d.c(7.5,9,3.5,'#8bd450');d.p(6,8,'#c5f285');d.p(9,10,'#c5f285');d.p(8,7,'#17152b');},
  soul:d=>{d.c(7.5,7,5,'#b9a7ff');d.r(3,8,10,5,'#b9a7ff');d.p(4,13,null);d.c(5.5,6,1.2,'#17152b');d.c(9.5,6,1.2,'#17152b');d.r(6,9,3,2,'#17152b');d.p(3,13,'#8a72e0');d.p(7,13,'#8a72e0');d.p(11,13,'#8a72e0');},
  thorns2:d=>{d.c(7.5,7.5,4,'#a93a28');d.c(7.5,7.5,2,'#e8553d');for(let a=0;a<8;a++){const t=a*Math.PI/4;d.l(7.5+Math.cos(t)*4,7.5+Math.sin(t)*4,7.5+Math.cos(t)*7,7.5+Math.sin(t)*7,'#dfe6f2');}},
  exec:d=>{d.l(4,14,10,4,'#a8743a');d.l(5,14,11,4,'#a8743a');d.c(10,5,3.6,'#8b93ad');d.r(9,3,6,5,'#8b93ad');d.l(12,3,12,8,'#dfe6f2');d.l(13,4,13,7,'#dfe6f2');},
  spark:d=>{d.c(5.5,6.5,2.4,'#ff5d73');d.c(9.5,6.5,2.4,'#ff5d73');for(let i=0;i<5;i++)d.r(3+i,8+i,10-i*2,1,'#ff5d73');d.p(6,5,'#ffd0d8');d.l(12,1,12,4,'#fff3b0');d.l(10.5,2.5,13.5,2.5,'#fff3b0');},
  titan:d=>{d.c(5,6,3.4,'#f4b942');d.c(10.5,6,3.4,'#f4b942');for(let i=0;i<7;i++)d.r(1+i,8+i,14-i*2,1,'#f4b942');d.c(5,5.5,1.4,'#ffe27a');d.c(10.5,5.5,1.4,'#ffe27a');},
  fang:d=>{d.l(4,3,11,3,'#f4efe0');for(let i=0;i<9;i++)d.r(4+Math.floor(i*.4),3+i,8-Math.floor(i*.9),1,'#f4efe0');d.l(5,4,6,9,'#dfe6f2');d.p(8,3,'#c9ba98');},
  master:d=>{d.c(7.5,9,4.5,'#2c2847');d.p(5,7,'#8b93ad');d.l(8,5,10,2,'#c98a4b');d.p(11,1,'#ffe27a');d.p(13,2,'#ffe27a');d.p(11,3,'#ffe27a');d.l(1,12,3,12,'#f4b942');d.l(2,11,2,13,'#f4b942');},
  aegis:d=>{d.r(2,2,12,3,'#f4b942');d.r(3,4,10,6,'#5aa0e8');d.r(4,9,8,3,'#5aa0e8');d.r(6,11,4,2,'#5aa0e8');d.r(2,2,2,8,'#f4b942');d.r(12,2,2,8,'#f4b942');d.l(7.5,4,7.5,11,'#f4b942');d.l(4,7,11,7,'#f4b942');}
};
for(const k of Object.keys(ICONS))GEN['u-'+k]={grid:mkIcon(ICONS[k])};


/* ===== Zonen-Fundstücke und Wurf-Items ===== */
Object.assign(ICONS,{
  ammo_moor:d=>{d.c(7.5,9.5,4.6,'#5aa02c');d.c(6,8,1.3,'#8bd450');d.r(6,3,4,3,'#c98a4b');d.r(5,5,6,1,'#a8743a');d.p(9,11,'#c5f285');d.p(5,11,'#3a6a1c');d.p(10,8,'#3a6a1c');},
  ammo_eis:d=>{d.c(7.5,8,5,'#8fd0e8');d.c(7.5,8,3.2,'#cfeaff');d.c(6,6,1.4,'#ffffff');d.l(7.5,1,7.5,3,'#ffffff');d.l(7.5,13,7.5,15,'#ffffff');d.l(1,8,3,8,'#ffffff');d.l(13,8,15,8,'#ffffff');},
  ammo_glut:d=>{d.r(4,5,8,9,'#8a4a2a');d.r(4,7,8,1,'#2c1618');d.r(4,11,8,1,'#2c1618');d.r(5,5,6,1,'#a8743a');d.c(7.5,3,2.2,'#ff8a3d');d.c(7.5,3.5,1.1,'#ffe27a');d.p(7,1,'#e8553d');},
  ammo_leere:d=>{d.c(7.5,8,5,'#2a1a4a');d.o(7.5,8,5.6,'#b890ff');d.c(7.5,8,1.8,'#ff5d73');d.p(5,5,'#cdbfff');},
  p_beere:d=>{d.c(5,10,2.6,'#b8334a');d.c(10,10,2.6,'#b8334a');d.c(7.5,6.5,2.6,'#e8553d');d.p(4,9,'#ff9aa8');d.p(9,9,'#ff9aa8');d.p(7,5,'#ff9aa8');d.l(7.5,3,7.5,1,'#3a8a2a');d.l(7.5,2,11,1,'#5aa02c');},
  p_pilz:d=>{d.c(7.5,6.5,4.6,'#3fd0b0');d.r(3,7,10,3,'#2a9a82');d.r(6,9,4,5,'#e9dfc8');d.p(5,4,'#8ff5da');d.p(9,5,'#8ff5da');d.p(7,3,'#ffffff');d.o(7.5,6.5,6.4,'rgba(143,245,218,0.0)');},
  p_kristall:d=>{for(let y=1;y<=14;y++){const w=y<=7?y:15-y;d.r(8-Math.ceil(w/1.4),y,Math.ceil(w/1.4)*2,1,y<8?'#bfe8ff':'#8fd0e8');}d.l(7,3,7,7,'#ffffff');d.p(6,5,'#ffffff');},
  p_schneeherz:d=>{d.c(5.2,6,3.2,'#8fd0e8');d.c(10.2,6,3.2,'#8fd0e8');for(let i=0;i<7;i++)d.r(2+i,8+i,12-i*2,1,'#8fd0e8');d.c(5,5.5,1.2,'#ffffff');d.p(11,3,'#ffffff');d.p(12,2,'#ffffff');},
  p_glutkern:d=>{d.c(7.5,8,5,'#c0401a');d.c(7.5,8,3.4,'#ff8a3d');d.c(7.5,8,1.8,'#ffe27a');d.l(2,3,4,5,'#ff6a3d');d.l(13,3,11,5,'#ff6a3d');d.l(7.5,1,7.5,3,'#ff6a3d');},
  p_feder:d=>{d.l(3,14,12,2,'#4a3f3a');for(let i=0;i<9;i++){d.l(4+i,13-i*1.2,8+i*.6,13-i*1.2,'#6a5a58');}d.l(3,14,12,2,'#c0401a');d.p(11,3,'#ffb347');d.p(12,5,'#ff6a3d');},
  p_splitter:d=>{d.l(7.5,1,7.5,14,'#e0c8ff');d.l(2,7.5,13,7.5,'#e0c8ff');d.c(7.5,7.5,2.4,'#b890ff');d.c(7.5,7.5,1.1,'#ffffff');d.l(4,4,11,11,'#8a6ae0');d.l(11,4,4,11,'#8a6ae0');},
  p_mantel:d=>{for(let y=2;y<=14;y++){const w=Math.round(2+y*.45);d.r(8-w,y,w*2,1,y<6?'#6a4a9a':'#4a2a7a');}d.r(6,2,4,2,'#b890ff');d.p(7,4,'#ffe27a');d.p(8,4,'#ffe27a');d.l(4,14,12,14,'#2a1a4a');}
});
for(const k of ['ammo_moor','ammo_eis','ammo_glut','ammo_leere','p_beere','p_pilz','p_kristall','p_schneeherz','p_glutkern','p_feder','p_splitter','p_mantel'])GEN[k]={grid:mkIcon(ICONS[k])};


/* ===== Goldzone: Items und Symbole ===== */
Object.assign(ICONS,{
  ammo_gold:d=>{d.c(7.5,9.5,4.6,'#a8743a');d.c(6,8,1.2,'#c98a4b');d.r(6,3,4,3,'#c98a4b');d.r(5,5,6,1,'#f4b942');d.c(7.5,10,2.2,'#f4b942');d.c(7.5,10,1,'#ffe27a');},
  p_barren:d=>{d.r(2,9,12,4,'#f4b942');d.r(4,6,8,3,'#ffe27a');d.r(2,9,12,1,'#ffe27a');d.p(5,7,'#ffffff');d.p(4,10,'#ffffff');d.r(2,12,12,1,'#b47a14');d.p(12,3,'#fff3b0');d.l(12,2,12,4,'#fff3b0');d.l(11,3,13,3,'#fff3b0');},
  p_kleeblatt:d=>{d.c(5.5,5.5,2.6,'#5aa02c');d.c(10,5.5,2.6,'#5aa02c');d.c(5.5,10,2.6,'#5aa02c');d.c(10,10,2.6,'#5aa02c');d.c(7.8,7.8,1.6,'#8bd450');d.l(8,10,10,14,'#3a6a1c');d.p(4,4,'#c5f285');d.p(9,4,'#c5f285');},
  'st-gift':d=>{d.c(7.5,10,4.6,'#6aa83a');d.c(7.5,10,3.2,'#8bd450');d.r(7,3,2,3,'#8bd450');d.r(6,5,4,2,'#8bd450');d.p(5,9,'#c5f285');d.p(5,10,'#c5f285');d.p(10,12,'#5aa02c');d.p(12,4,'#8bd450');d.p(3,5,'#8bd450');},
  'st-brand':d=>{d.c(7.5,10,4.6,'#e8553d');d.r(6,4,4,4,'#e8553d');d.p(7,2,'#e8553d');d.p(8,3,'#e8553d');d.c(7.5,10.5,3.2,'#ff8a5c');d.c(7.5,11,1.8,'#ffe27a');d.p(11,5,'#ff8a5c');d.p(4,6,'#ff8a5c');},
  'st-stein':d=>{d.r(4,3,8,11,'#8b93ad');d.r(4,3,8,2,'#dfe6f2');d.r(4,12,8,2,'#6f6993');d.l(5,7,7,7,'#17152b');d.l(9,7,11,7,'#17152b');d.l(8,9,6,13,'#4a4566');d.l(8,9,10,11,'#4a4566');},
  'st-gesang':d=>{d.c(5,11,2.6,'#8fd0e8');d.r(7,3,2,9,'#8fd0e8');d.l(8,3,12,5,'#8fd0e8');d.l(12,5,12,7,'#8fd0e8');d.p(2,5,'#cfeaff');d.p(3,3,'#cfeaff');d.p(13,10,'#cfeaff');d.p(14,12,'#cfeaff');},
  'st-oase':d=>{d.r(3,13,10,2,'#e8c870');d.l(8,13,8,6,'#8a5a2a');d.l(9,13,9,6,'#8a5a2a');d.l(8,6,3,8,'#58b84a');d.l(9,6,14,8,'#58b84a');d.l(8,6,4,3,'#58b84a');d.l(9,6,13,3,'#58b84a');d.l(8,5,8,2,'#58b84a');d.p(7,7,'#a8743a');d.p(10,7,'#a8743a');},
  chest:d=>{d.r(2,7,12,7,'#8a5a2a');d.r(2,4,12,4,'#a8743a');d.r(2,4,12,1,'#c98a4b');d.r(7,4,2,10,'#f4b942');d.r(7,8,2,3,'#ffe27a');d.p(7,9,'#17152b');d.r(2,13,12,1,'#5a3a1a');d.p(4,5,'#e8c080');},
  'u-loot':d=>{d.c(5,10,3,'#f4b942');d.c(5,10,1.6,'#ffe27a');d.c(10,8,3,'#f4b942');d.c(10,8,1.6,'#ffe27a');d.c(7.5,4,2.4,'#ffe27a');d.l(13,2,13,5,'#ffffff');d.l(11.5,3.5,14.5,3.5,'#ffffff');},
  'u-haggle':d=>{d.l(7.5,2,7.5,13,'#c9ba98');d.l(2,5,13,5,'#c9ba98');d.l(2,5,2,9,'#8b93ad');d.l(13,5,13,9,'#8b93ad');d.r(1,9,4,2,'#f4b942');d.r(11,9,4,2,'#f4b942');d.r(5,13,6,2,'#8a5a2a');},
  'u-income':d=>{d.c(7.5,9,5,'#a8743a');d.r(5,3,6,3,'#c98a4b');d.r(4,5,8,1,'#f4b942');d.c(7.5,10,2.4,'#f4b942');d.c(7.5,10,1.2,'#ffe27a');d.p(11,2,'#ffe27a');d.p(12,3,'#ffe27a');},
  'u-net':d=>{for(let i=2;i<=13;i+=3){d.l(i,2,i,13,'#c9ba98');d.l(2,i,13,i,'#c9ba98');}d.l(2,2,13,13,'#8b93ad');d.l(13,2,2,13,'#8b93ad');d.c(7.5,7.5,1.6,'#e8553d');},
  'u-hunter':d=>{d.c(7.5,7.5,5.5,'#17152b');d.o(7.5,7.5,5.4,'#e8553d');d.o(7.5,7.5,2.6,'#e8553d');d.l(7.5,0,7.5,3,'#e8553d');d.l(7.5,12,7.5,15,'#e8553d');d.l(0,7.5,3,7.5,'#e8553d');d.l(12,7.5,15,7.5,'#e8553d');d.p(7,7,'#ffe27a');},
  'u-lockpick':d=>{d.c(4.5,4.5,2.8,'#f4b942');d.c(4.5,4.5,1.2,'#17152b');d.l(6,6,13,13,'#f4b942');d.l(11,11,11,14,'#f4b942');d.l(13,13,13,15,'#f4b942');d.l(8,4,13,2,'#c9ba98');d.l(13,2,14,3,'#c9ba98');}
});
for(const k of ['st-gift','st-brand','st-stein','st-gesang','st-oase','ammo_gold','p_barren','p_kleeblatt','chest','u-loot','u-haggle','u-income','u-net','u-hunter','u-lockpick'])GEN[k]={grid:mkIcon(ICONS[k])};


/* ===== Windzone: Items und Symbole ===== */
Object.assign(ICONS,{
  ammo_wind:d=>{d.o(7.5,7.5,6.2,'#cfe6ff');d.o(7.5,7.5,4,'#8ad0f0');d.o(7.5,7.5,1.8,'#ffffff');d.c(7.5,7.5,.8,'#ffffff');d.l(1,4,5,4,'#e8f0ff');d.l(11,12,15,12,'#e8f0ff');},
  'u-gale':d=>{d.l(3,13,11,5,'#dfe6f2');d.l(4,13,12,5,'#dfe6f2');d.l(2,14,4,12,'#c98a4b');d.l(8,2,14,2,'#8ad0f0');d.l(10,4,14,4,'#8ad0f0');d.l(12,6,15,6,'#cfe6ff');},
  'u-gustshield':d=>{d.r(3,2,10,8,'#5a7a9a');d.r(4,10,8,2,'#5a7a9a');d.r(6,12,4,2,'#5a7a9a');d.o(7.5,6,2.6,'#e8f0ff');d.l(7.5,3.5,10,3.5,'#e8f0ff');d.l(1,7,2,7,'#8ad0f0');d.l(13,7,15,7,'#8ad0f0');},
  'u-tailwind':d=>{d.l(2,3,6,7,'#cfe6ff');d.l(6,7,2,11,'#cfe6ff');d.l(3,3,7,7,'#cfe6ff');d.l(7,7,3,11,'#cfe6ff');d.l(8,3,12,7,'#8ad0f0');d.l(12,7,8,11,'#8ad0f0');d.l(9,3,13,7,'#8ad0f0');d.l(13,7,9,11,'#8ad0f0');d.l(1,13,14,13,'#e8f0ff');},
  'u-sack':d=>{d.c(7.5,9.5,4.6,'#8ab4e0');d.c(6,8,1.2,'#cfe6ff');d.r(6,3,4,3,'#e8f0ff');d.r(5,5,6,1,'#8ad0f0');d.o(7.5,10,2.2,'#ffffff');},
  'u-shadow':d=>{d.c(5,9,3,'#cfe6ff');d.c(9.5,8,4,'#e8f0ff');d.c(12,10.5,2.6,'#cfe6ff');d.r(3,10,11,3,'#cfe6ff');d.l(1,5,4,5,'#8ad0f0');d.l(10,3,14,3,'#8ad0f0');},
  'u-fury':d=>{d.c(5,4,2.6,'#6a7a9a');d.c(9,3.5,3,'#8a9ab8');d.c(12,5,2.2,'#6a7a9a');d.l(8,7,5,10,'#ffe27a');d.l(5,10,9,10,'#ffe27a');d.l(9,10,6,14,'#ffe27a');d.l(7,8,5,10,'#ffffff');},
  p_windfeder:d=>{d.l(3,14,12,2,'#8ab4e0');for(let i=0;i<9;i++)d.l(4+i,13-i*1.2,9+i*.5,13-i*1.2,'#e8f0ff');d.l(3,14,12,2,'#5a7a9a');d.p(2,5,'#cfe6ff');d.p(3,5,'#cfe6ff');},
  p_wirbel:d=>{const rows=[[2,13],[3,11],[4,10],[5,8],[6,7],[7,6]];rows.forEach((r,i)=>{d.r(r[0],2+i*2,r[1]-r[0]+1-(i>3?i-3:0),1,i%2?'#8ad0f0':'#e8f0ff');});d.l(7,13,8,15,'#cfe6ff');d.p(12,3,'#ffffff');d.p(2,13,'#ffffff');}
});
for(const k of ['ammo_wind','u-gale','u-gustshield','u-tailwind','u-sack','u-shadow','u-fury','p_windfeder','p_wirbel'])GEN[k]={grid:mkIcon(ICONS[k])};


/* ===== Wüste, Uhrwerk, Tiefsee: Items und Symbole ===== */
const gearTeeth=(d,cx,cy,r,c)=>{for(let a=0;a<8;a++){const t=a*Math.PI/4;d.c(cx+Math.cos(t)*(r+1.4),cy+Math.sin(t)*(r+1.4),1.1,c);}};
Object.assign(ICONS,{
  ammo_wueste:d=>{d.c(7.5,9.5,4.6,'#c9a45a');d.c(6,8,1.2,'#e8c870');d.r(6,3,4,3,'#a8743a');d.r(5,5,6,1,'#e8553d');d.p(5,11,'#8a6a2a');d.p(9,12,'#8a6a2a');d.p(10,8,'#e8c870');d.p(12,3,'#e8c870');d.p(3,4,'#e8c870');},
  ammo_uhrwerk:d=>{d.r(4,4,8,10,'#8b93ad');d.r(6,2,4,2,'#c98a4b');d.r(4,4,8,2,'#c98a4b');d.l(8,6,6,9,'#ffe27a');d.l(6,9,9,9,'#ffe27a');d.l(9,9,7,13,'#ffe27a');},
  ammo_tiefsee:d=>{d.o(7.5,7.5,6,'#4aa0c8');d.o(7.5,7.5,4,'#8fd0e8');d.o(7.5,7.5,2,'#cfeaff');d.p(7,7,'#ffffff');d.p(2,3,'#cfeaff');d.p(13,12,'#cfeaff');},
  p_skarab:d=>{d.c(7.5,8.5,4.2,'#2a9a9a');d.c(7.5,8.5,2.4,'#3fd0b0');d.c(7.5,3.8,1.8,'#17152b');d.l(7.5,5,7.5,13,'#f4b942');d.l(3,6,1,4,'#17152b');d.l(12,6,14,4,'#17152b');d.l(3,10,1,12,'#17152b');d.l(12,10,14,12,'#17152b');d.p(6,3,'#f4b942');d.p(9,3,'#f4b942');},
  p_ankh:d=>{d.o(7.5,4.5,3.2,'#f4b942');d.r(6.5,7,2,7,'#f4b942');d.r(3.5,8.5,8,2,'#f4b942');d.p(7,3,'#ffe27a');d.p(8,4,'#b47a14');},
  p_zahnrad:d=>{gearTeeth(d,7.5,7.5,4.6,'#c98a4b');d.c(7.5,7.5,4.6,'#c98a4b');d.c(7.5,7.5,2,'#17152b');d.p(5,5,'#e8c080');d.p(10,6,'#8a5a2a');},
  p_oel:d=>{d.r(3,7,8,6,'#8b93ad');d.r(3,7,8,1,'#dfe6f2');d.l(11,8,14,5,'#8b93ad');d.l(14,5,14,7,'#8b93ad');d.r(5,4,4,3,'#6f6993');d.p(14,9,'#3a2a1a');d.p(14,10,'#3a2a1a');d.p(14,11,'#5a4a2a');},
  p_perle:d=>{d.c(7.5,8,5,'#f4efe0');d.c(7.5,8,3.4,'#ffffff');d.p(5,6,'#ffffff');d.p(6,5,'#ffffff');d.p(10,11,'#cfc3a5');d.o(7.5,8,5.4,'#8fd0e8');},
  p_muschel:d=>{for(let i=-4;i<=4;i++)d.l(7.5,13,7.5+i*1.6,3+Math.abs(i)*.5,i%2?'#ff9ae8':'#ffd0f0');d.r(5,12,6,2,'#c9ba98');d.p(7,13,'#8a6a5a');},
  'u-veil':d=>{d.l(1,4,14,4,'#e8c870');d.l(1,7,14,7,'#f4efe0');d.l(1,10,14,10,'#e8c870');d.l(1,13,14,13,'#f4efe0');d.p(4,3,'#e8c870');d.p(10,6,'#f4efe0');d.p(6,9,'#e8c870');d.p(12,12,'#f4efe0');d.c(12,2.5,1.6,'#ffe27a');},
  'u-curse':d=>{d.o(7.5,7.5,5.4,'#f4b942');d.c(7.5,7.5,2.6,'#17152b');d.c(7.5,7.5,1.2,'#e8553d');d.l(2,7.5,5,7.5,'#f4b942');d.l(10,7.5,13,7.5,'#f4b942');d.l(7.5,13,7.5,15,'#f4b942');d.l(7.5,13,10,15,'#f4b942');},
  'u-oasis':d=>{d.l(5,13,6,6,'#a8743a');d.l(6,6,2,4,'#3a8a2a');d.l(6,6,10,3,'#3a8a2a');d.l(6,6,11,7,'#5aa02c');d.l(6,6,4,2,'#5aa02c');d.r(2,13,12,2,'#5aa0e8');d.r(4,12,8,1,'#8fd0e8');},
  'u-maprel':d=>{d.r(2,2,12,12,'#e9dfc8');d.r(2,2,12,1,'#c9ba98');d.r(2,13,12,1,'#c9ba98');d.l(4,4,7,8,'#c98a4b');d.p(8,9,'#c98a4b');d.l(10,10,12,12,'#e8553d');d.l(12,10,10,12,'#e8553d');},
  'u-sandy':d=>{d.l(3,2,12,2,'#c9ba98');d.l(3,13,12,13,'#c9ba98');d.l(4,3,7.5,7.5,'#c9a45a');d.l(11,3,7.5,7.5,'#c9a45a');d.l(7.5,8,4,12,'#e8c870');d.l(7.5,8,11,12,'#e8c870');d.r(5,11,5,2,'#e8c870');d.p(7,6,'#e8c870');},
  'u-assassin':d=>{d.l(3,13,11,5,'#dfe6f2');d.l(4,13,12,5,'#dfe6f2');d.l(11,3,13,5,'#dfe6f2');d.l(2,10,6,14,'#8a5a2a');d.l(3,12,5,12,'#17152b');d.p(13,2,'#e8553d');},
  'u-gears':()=>{},
  'u-rod':d=>{d.l(7.5,5,7.5,14,'#8b93ad');d.r(5,13,5,2,'#6f6993');d.l(7,1,5,4,'#ffe27a');d.l(5,4,9,4,'#ffe27a');d.l(9,4,6,8,'#ffe27a');},
  'u-torch':d=>{d.r(2,10,8,3,'#8b93ad');d.r(9,9,4,5,'#6f6993');d.c(12.5,5,2.6,'#5aa0e8');d.c(12.5,5,1.4,'#cfeaff');d.l(12.5,2,12.5,3,'#5aa0e8');d.l(10,5,8,5,'#5aa0e8');},
  'u-spare':d=>{d.l(3,13,11,5,'#8b93ad');d.l(4,13,12,5,'#8b93ad');d.o(11.5,4.5,3.2,'#dfe6f2');d.r(10.5,0.5,2,3,'#17152b');d.c(3.5,12.5,1.6,'#6f6993');},
  'u-lens':d=>{d.o(6.5,6.5,4.6,'#dfe6f2');d.c(6.5,6.5,3.4,'#8fd0e8');d.p(5,5,'#ffffff');d.p(4,6,'#ffffff');d.l(10,10,14,14,'#a8743a');d.l(9,10,13,14,'#a8743a');},
  'u-chain':d=>{d.o(4.5,4.5,3,'#8b93ad');d.o(8,8,3,'#dfe6f2');d.o(11.5,11.5,3,'#8b93ad');},
  'u-pearl':d=>{for(let i=0;i<7;i++){const t=Math.PI*(i/6);d.c(7.5-Math.cos(t)*5.5,3+Math.sin(t)*7,1.7,i===3?'#fff3b0':'#f4efe0');}d.p(7,13,'#8fd0e8');},
  'u-ink':d=>{d.c(7.5,9,4.2,'#6a3a8a');d.l(7.5,2,5,6,'#6a3a8a');d.l(7.5,2,10,6,'#6a3a8a');d.c(5.5,9,1,'#ffffff');d.c(9.5,9,1,'#ffffff');d.l(3,13,2,15,'#6a3a8a');d.l(7.5,13,7.5,15,'#6a3a8a');d.l(12,13,13,15,'#6a3a8a');},
  'u-harpoon':d=>{d.l(2,14,11,5,'#a8743a');d.l(3,14,12,5,'#a8743a');d.l(12,4,14,2,'#dfe6f2');d.l(11,3,14,6,'#dfe6f2');d.l(10,6,13,3,'#dfe6f2');d.l(10,3,13,3,'#dfe6f2');d.l(13,3,13,6,'#dfe6f2');d.l(1,12,3,14,'#8fd0e8');},
  'u-feast':d=>{d.c(7,8,4.6,'#4aa0c8');d.r(11,6,4,4,'#4aa0c8');d.l(12,5,14,3,'#4aa0c8');d.l(12,10,14,12,'#4aa0c8');d.c(4.5,7,1,'#17152b');d.l(2,9,4,10,'#f4efe0');d.l(5,9,7,10,'#f4efe0');d.p(3,8,'#e8553d');},
  'u-volt':d=>{d.l(8,1,4,8,'#ffe27a');d.l(4,8,9,8,'#ffe27a');d.l(9,8,5,15,'#ffe27a');d.l(9,2,6,7,'#ffffff');d.o(7.5,8,6.2,'#5aa0e8');},
  'u-anchor':d=>{d.o(7.5,3,1.8,'#dfe6f2');d.l(7.5,5,7.5,13,'#dfe6f2');d.l(4,8,11,8,'#dfe6f2');d.l(2,10,4,13,'#dfe6f2');d.l(13,10,11,13,'#dfe6f2');d.l(2,10,7.5,14,'#8b93ad');d.l(13,10,7.5,14,'#8b93ad');}
});
ICONS['u-gears']=d=>{gearTeeth(d,5,5,2.6,'#c98a4b');d.c(5,5,2.6,'#c98a4b');d.c(5,5,1,'#17152b');gearTeeth(d,10.5,10.5,3,'#8b93ad');d.c(10.5,10.5,3,'#8b93ad');d.c(10.5,10.5,1.2,'#17152b');};
for(const k of ['ammo_wueste','ammo_uhrwerk','ammo_tiefsee','p_skarab','p_ankh','p_zahnrad','p_oel','p_perle','p_muschel','u-veil','u-curse','u-oasis','u-maprel','u-sandy','u-assassin','u-gears','u-rod','u-torch','u-spare','u-lens','u-chain','u-pearl','u-ink','u-harpoon','u-feast','u-volt','u-anchor'])GEN[k]={grid:mkIcon(ICONS[k])};

/* Zonen-Look des Würfels: Boden, Wände, Stacheln, Treppe, Fundstücke */
const ZNAMES=['floor0','floor1','floor2','floor3','wall','spike','stairs','lock','coin','key','bomb'];
const ZURL={oase:{},gruft:{},gold:{},wind:{},wueste:{},uhrwerk:{},tiefsee:{},moor:{},eis:{},glut:{},leere:{}};
const OASIS_WALL=['FFFFFFFFFFFFFFFF','FFFaAFFFFFFAaFFF','FFaaAAFFFFAAaaFF','FaaAaaAFFAaaAaaF','FFAaaAaaAaaAaaFF','FFFAaaAkkAaaAFFF','FFaAFAaakaaAFAaF','FFFFFFAkdkAFFFFF','FFFFFFFkdkFFFFFF','FFFFFFFkdkFFFFFF','FFFFFFFkddkFFFFF','FFFFFFFkdkFFFFFF','FFFFFFkdkkFFFFFF','FFFFFFkddkFFFFFF','FFFFFkddkkFFFFFF','FFFFFFkkkFFFFFFF'];
const ZPAL={
 oase:{G:'#e8d08a',F:'#e0c47a',H:'#b89a50',I:'#ecd690',s:'#d9bd70',S:'#c9a85a',k:'#5a4020',a:'#58b84a',A:'#2f7a2f',y:'#f4b942',Y:'#b47a14',z:'#fff3b0',B:'#e8c870',d:'#7a5230',q:'#f6e4a8',j:'#c9a85a'},
 gold:{G:'#5a4220',F:'#4a361c',H:'#2a1c0e',I:'#5c4220',s:'#e8b84a',S:'#b47a14',k:'#2a1a08',a:'#ffe27a',A:'#e8b84a',y:'#f4b942',Y:'#b47a14',z:'#fff3b0',B:'#ffe27a',d:'#3a2208',q:'#8a6a2a',j:'#b8883a'},
 wind:{G:'#8aa0b8',F:'#6a82a0',H:'#46607e',I:'#5e7694',s:'#e8f0f8',S:'#b0c4d8',k:'#2a3a52',a:'#e8f0f8',A:'#a0b4c8',y:'#e8f0ff',Y:'#8aa4c8',z:'#ffffff',B:'#cfe0f0',d:'#3a5070',q:'#cfe6ff',j:'#e8f0ff'},
 wueste:{G:'#c9a45a',F:'#a8854a',H:'#7a5a2a',I:'#b8944f',s:'#e8c880',S:'#c9a45a',k:'#3a2810',a:'#4a9a4a',A:'#2f6a2f',y:'#f4b942',Y:'#b47a14',z:'#fff3b0',B:'#e8c870',d:'#6a4a1a',q:'#e8c880',j:'#8a6a2a'},
 uhrwerk:{G:'#6a5a4a',F:'#4a3a2e',H:'#2a2018',I:'#5a4a3a',s:'#c98a4b',S:'#8a5a2a',k:'#1a120a',a:'#dfe6f2',A:'#8b93ad',y:'#e8c070',Y:'#a8743a',z:'#fff3b0',B:'#c98a4b',d:'#2a2018',q:'#c98a4b',j:'#8b93ad'},
 tiefsee:{G:'#245a78',F:'#1e4a6a',H:'#0e2a44',I:'#2a5a7a',s:'#ff7a8a',S:'#c04a6a',k:'#0a1a30',a:'#ff9ae8',A:'#a84a98',y:'#f4efe0',Y:'#8fd0e8',z:'#ffffff',B:'#cfeaff',d:'#0e2a44',q:'#3a8aaa',j:'#4a8aaa'},
 moor:{G:'#587a3a',F:'#3c5a2c',H:'#22381f',I:'#6a9040',s:'#8a9a5a',S:'#5a6a3a',k:'#14230f',a:'#5aa04a',A:'#2e6a2a',y:'#c9d86a',Y:'#8a9a2a',z:'#f0ffb0',B:'#b8c078',d:'#26361c',q:'#58b04a',j:'#c9c93a'},
 eis:{G:'#7a9ac8',F:'#4e6ea0',H:'#2a4072',I:'#6088ba',s:'#b8d8f0',S:'#7aa4d0',k:'#10244a',a:'#e8fbff',A:'#8ab4e0',y:'#bfe8ff',Y:'#5a9ad0',z:'#ffffff',B:'#d8ecff',d:'#26407a',q:'#ffffff',j:'#cfeaff'},
 glut:{G:'#7a3e34',F:'#522a2a',H:'#2c1618',I:'#74342c',s:'#6a4640',S:'#44282c',k:'#1a0c0e',a:'#ffb347',A:'#e8553d',y:'#ff9a3a',Y:'#c0401a',z:'#ffe27a',B:'#a86a50',d:'#2c1618',q:'#ff8a5c',j:'#ffd36a'},
 leere:{G:'#4a3a7a',F:'#2c2250',H:'#150f2c',I:'#40346e',s:'#5a4a90',S:'#352a66',k:'#0a0716',a:'#d0b8ff',A:'#8a6ae0',y:'#b890ff',Y:'#6a4ab0',z:'#f0e0ff',B:'#8a7ac0',d:'#1a1238',q:'#cdbfff',j:'#ff9ae8'}};
function zdeco(name,A,kd){
  if(kd==='oase'&&name==='wall')return OASIS_WALL;
  const z=ZKIND.indexOf(kd);
  const hash=(x,y,m)=>((x*7+y*13+z*5)%m+m)%m;
  return A.map((row,y)=>{
    let o='';
    for(let x=0;x<16;x++){
      const c=row[x];let r=c;
      if(name.startsWith('floor')&&c==='F'&&hash(x+name.length,y,19)===0)r='q';
      if(name.startsWith('floor')&&c==='F'&&kd!=='moor'&&hash(x,y*3,23)===1)r='j';
      if(name==='wall'){
        if(kd==='moor'&&(c==='S'||c==='s')&&(hash(x,y,9)===0||(y<4&&x%5===2)))r='q';
        if(kd==='gold'&&(c==='s')&&hash(x,y,6)===0)r='z';
        if(kd==='wueste'&&(c==='s'||c==='S')&&hash(x,y,7)===0)r='W';
        if(kd==='uhrwerk'&&(c==='s')&&hash(x,y,5)===0)r='z';
        if(kd==='tiefsee'&&(c==='S')&&hash(x,y,6)===0)r='q';
        if(kd==='wind'&&(c==='S')&&hash(x,y,4)===0)r='W';
        if(kd==='eis'&&(c==='s')&&hash(x,y,5)===0)r='W';
        if(kd==='glut'&&c==='k'&&y>0&&y<15&&x>0&&x<15&&hash(x,y,3)===0)r='o';
        if(kd==='leere'&&(c==='s'||c==='S')&&hash(x,y,11)===0)r='j';
      }
      o+=r;
    }
    return o;
  });
}
