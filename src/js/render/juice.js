/* src/js/render/juice.js
   Feinschliff: Treffer-Stopp, Stoßringe, Flug zur Anzeige und Punkte-Zähler. */
const JUICE_OK=()=>!(save.settings&&save.settings.lite);
function hitStop(ms){const b=$('#board');if(!b||!JUICE_OK())return;b.classList.add('freeze');setTimeout(()=>b.classList.remove('freeze'),ms);}
function shockRing(i,col){const p=cellPct(i);if(!p||!JUICE_OK())return;const e=document.createElement('i');e.className='sring';e.style.cssText=`left:${p.x}%;top:${p.y}%;--c:${col||'#fff'}`;fxLayer.appendChild(e);setTimeout(()=>e.remove(),440);}
function puff(i){const p=cellPct(i);if(!p||!JUICE_OK())return;for(let k=0;k<2;k++){const e=document.createElement('i');e.className='puff';e.style.cssText=`left:${p.x+(k?3:-3)}%;top:${p.y+6}%;--px:${k?9:-9}px`;fxLayer.appendChild(e);setTimeout(()=>e.remove(),420);}}
function flyTo(i,id,target){
  if(!JUICE_OK()||!target)return;const p=cellPct(i),bd=$('#board');if(!p||!bd)return;
  const br=bd.getBoundingClientRect(),tr=target.getBoundingClientRect();
  const x0=br.left+p.x/100*br.width,y0=br.top+p.y/100*br.height,x1=tr.left+tr.width/2,y1=tr.top+tr.height/2;
  const e=document.createElement('div');e.className='flyspr';e.innerHTML=spr(id);document.body.appendChild(e);
  const a=e.animate([{transform:`translate(${x0-20}px,${y0-20}px) scale(1.3)`,opacity:1},{transform:`translate(${(x0+x1)/2-20}px,${Math.min(y0,y1)-46}px) scale(1.05)`,offset:.4,opacity:1},{transform:`translate(${x1-20}px,${y1-20}px) scale(.5)`,opacity:.85}],{duration:540,easing:'ease-in'});
  a.onfinish=()=>{e.remove();pulse(target,'pop',300);};a.oncancel=()=>e.remove();
}
let scoreShown=0,scoreRaf=0;
function tweenScore(){
  const el=$('#score');if(!G)return;const to=G.score;
  if(!JUICE_OK()||to<scoreShown||Math.abs(to-scoreShown)<2){cancelAnimationFrame(scoreRaf);scoreShown=to;el.textContent=fmt(to)+' Punkte';return;}
  cancelAnimationFrame(scoreRaf);const from=scoreShown,t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/380);scoreShown=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.textContent=fmt(scoreShown)+' Punkte';if(k<1)scoreRaf=requestAnimationFrame(step);};
  scoreRaf=requestAnimationFrame(step);
}
