/* src/js/render/effects.js
   Effekte: Zahlen, Partikel, Schlag und Wackeln. */
/* ================= Effekte ================= */
function cellPct(i){const vc=viewCoord(view,i);return vc?{x:(vc.col+.5)*20,y:(vc.row+.5)*20}:null;}
function floatText(i,text,cls){
  const p=cellPct(i);if(!p)return;
  const el=document.createElement('div');el.className='ft '+cls;el.textContent=text;el.style.left=p.x+'%';el.style.top=p.y+'%';
  fxLayer.appendChild(el);setTimeout(()=>el.remove(),950);
}
function burst(i,color,n){
  const p=cellPct(i);if(!p)return;
  for(let k=0;k<n;k++){
    const el=document.createElement('i');el.className='pt';
    const a=Math.random()*Math.PI*2,r=18+Math.random()*34;
    el.style.cssText=`left:${p.x}%;top:${p.y}%;--c:${color};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px`;
    fxLayer.appendChild(el);setTimeout(()=>el.remove(),600);
  }
}
function slash(i){
  const p=cellPct(i);if(!p)return;
  const el=document.createElement('div');el.className='slash';el.style.left=p.x+'%';el.style.top=p.y+'%';el.innerHTML='<i></i>';
  fxLayer.appendChild(el);setTimeout(()=>el.remove(),300);
}
function shotFx(a,b,T){
  const pa=cellPct(a),pb=cellPct(b);if(!pa||!pb)return;
  const dx=pb.x-pa.x,dy=pb.y-pa.y,kd=ZKIND[T?T.z||0:0];
  if(kd==='gruft'){
    const el=document.createElement('div');el.className='arrow';
    el.style.cssText=`left:${pa.x}%;top:${pa.y}%;width:${Math.hypot(dx,dy)}%;transform:rotate(${Math.atan2(dy,dx)}rad)`;
    fxLayer.appendChild(el);setTimeout(()=>el.remove(),300);return;
  }
  flyFx(pa,pb,'proj k-'+kd,0,300,Math.atan2(dy,dx));
}
function flyFx(pa,pb,cls,arc,ms,rot){
  const W=fxLayer.offsetWidth||300;
  const el=document.createElement('div');el.className=cls;el.style.left=pa.x+'%';el.style.top=pa.y+'%';
  fxLayer.appendChild(el);
  const dx=(pb.x-pa.x)*W/100,dy=(pb.y-pa.y)*W/100,r=rot===undefined?'':' rotate('+rot+'rad)';
  if(el.animate)el.animate([{transform:'translate(0,0)'+r},{transform:`translate(${dx/2}px,${dy/2-arc*W/100}px)`+r,offset:.5},{transform:`translate(${dx}px,${dy}px)`+r}],{duration:ms,easing:'linear'});
  setTimeout(()=>el.remove(),ms);
  return el;
}
function throwFx(a,b,ico){
  const pa=cellPct(a),pb=cellPct(b);if(!pa||!pb)return;
  const el=flyFx(pa,pb,'proj ico',16,380);
  if(el){ensureSpr(ico);el.style.backgroundImage='var(--sp-'+ico+')';el.style.backgroundSize=ico==='bomb'?'200% 100%':'100% 100%';}
}
function boltFx(a,b){
  const pa=cellPct(a),pb=cellPct(b);if(!pa||!pb)return;
  const dx=pb.x-pa.x,dy=pb.y-pa.y;
  const el=document.createElement('div');el.className='bolt';
  el.style.cssText=`left:${pa.x}%;top:${pa.y}%;width:${Math.hypot(dx,dy)}%;transform:rotate(${Math.atan2(dy,dx)}rad)`;
  fxLayer.appendChild(el);setTimeout(()=>el.remove(),320);
}
function gustFx(a,b){
  const pa=cellPct(a),pb=cellPct(b);if(!pa||!pb)return;
  const dx=pb.x-pa.x,dy=pb.y-pa.y;
  for(let k=0;k<3;k++){const el=document.createElement('div');el.className='gustl';
    el.style.cssText=`left:${pa.x}%;top:${pa.y+(k-1)*4}%;width:${Math.hypot(dx,dy)*1.3}%;transform:rotate(${Math.atan2(dy,dx)}rad);animation-delay:${k*.06}s`;
    fxLayer.appendChild(el);setTimeout(()=>el.remove(),520);}
}
function lobFx(a,b){
  const pa=cellPct(a),pb=cellPct(b);if(!pa||!pb)return;
  flyFx(pa,pb,'proj lob',16,420);
}
const BOOMCOL={wueste:['#f4e0a0','rgba(201,164,90,.7)'],uhrwerk:['#fff3b0','rgba(201,138,75,.75)'],tiefsee:['#cfeaff','rgba(74,160,200,.7)'],wind:['#ffffff','rgba(170,210,240,.7)'],gold:['#fff3b0','rgba(244,185,66,.75)'],moor:['#d8ff8a','rgba(90,170,60,.7)'],eis:['#dff4ff','rgba(90,170,230,.7)'],glut:['#ffd36a','rgba(232,85,61,.7)'],leere:['#e0c8ff','rgba(120,70,220,.75)']};
function boomFx(i,T){
  const p=cellPct(i);if(!p)return;
  const el=document.createElement('div');el.className='boom';el.style.left=p.x+'%';el.style.top=p.y+'%';
  const kd=ZKIND[T?T.z||0:0];
  if(BOOMCOL[kd]){const c=BOOMCOL[kd];el.classList.add('zb');el.style.setProperty('--b1',c[0]);el.style.setProperty('--b2',c[1]);}
  fxLayer.appendChild(el);setTimeout(()=>el.remove(),500);
}
function mfx(i,T){
  const p=cellPct(i);if(!p)return;
  const kd=ZKIND[T.z||0];
  const el=document.createElement('div');el.className='mfx k-'+kd;el.style.left=p.x+'%';el.style.top=p.y+'%';el.style.setProperty('--c',kd==='gruft'?'#e8553d':T.col);
  const n=kd==='gruft'?3:6;
  for(let k=0;k<n;k++){
    const c=document.createElement('i');const a=k/n*Math.PI*2+Math.random()*.5,r=24+Math.random()*16;
    c.style.cssText=`--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px;--rot:${Math.round(Math.random()*360)}deg`;
    el.appendChild(c);
  }
  fxLayer.appendChild(el);setTimeout(()=>el.remove(),600);
}
function shake(){
  if(!save.settings.shake||reduceMotion)return;
  const s=$('#stage');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');
}
function flash(){const f=$('#flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
function hurtFx(id){pulse(entEls.get(id),'hurt',290);}
function atk(m){
  const T=MT[m.type];
  lungeFx(entEls.get(m.id),m.pos,G.pos,T.charge?'dash':T.shoot?'recoil':T.lob?'throw':'at-'+(T.body||'human'));
}
function pickFx(i,it){const p=cellPct(i);if(!p)return;const el=document.createElement('div');el.className='pk';el.style.left=p.x+'%';el.style.top=p.y+'%';el.innerHTML=spr(itemSpr(it));fxLayer.appendChild(el);setTimeout(()=>el.remove(),650);}
function banner(t,s){
  $('#bn-t').textContent=t;$('#bn-s').textContent=s||'';
  const b=$('#banner');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
}

