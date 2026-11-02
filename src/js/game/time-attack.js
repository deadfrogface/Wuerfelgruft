/* src/js/game/time-attack.js
   Zeitjagd: Timer pro Etage. */
/* ================= Zeitjagd: Timer pro Etage ================= */
const timeFor=d=>Math.max(35,75-3*Math.floor(d/10))+(d%5===0?30:0);
const fmtT=sec=>{sec=Math.max(0,Math.ceil(sec));return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');};
const fmtMs=ms=>{const t=Math.round(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
function startTimed(){
  if(!endGate())return;
  show('scr-game');newRun(false,false,false);
  G.timed=true;G.tTotal=0;G.speedGS=0;G.tlMax=timeFor(G.depth);G.tl=G.tlMax;tjShow();
}
function tjShow(){
  let el=$('#tjt');
  if(!el){el=document.createElement('div');el.id='tjt';el.className='tjt';el.innerHTML='<span id="tjt-t"></span><i><b id="tjt-b"></b></i>';$('#scr-game').appendChild(el);}
  el.hidden=!(G&&G.timed);
}
setInterval(()=>{
  if(!G||!G.timed||G.over||anyModal()||!$('#scr-game').classList.contains('on'))return;
  G.tl-=.25;G.tTotal=(G.tTotal||0)+.25;
  const t=$('#tjt-t'),b=$('#tjt-b'),el=$('#tjt');
  if(t){t.textContent=fmtT(G.tl);b.style.width=Math.max(0,G.tl/G.tlMax*100)+'%';el.classList.toggle('low',G.tl<=10);}
  if(G.tl<=0){
    G.tlMax=Math.max(12,Math.round(timeFor(G.depth)/2));G.tl=G.tlMax;
    floatText(G.pos,'Zeit!','red');sfx('hit');setMsg('Die Zeit ist abgelaufen. Das kostet ein Herz.');
    hurtPlayer(1,null);render();if(G.hp<=0)die();
  }
},250);
function tjFloorDone(){
  if(!G||!G.timed)return;
  const left=Math.max(0,G.tl),frac=left/G.tlMax;
  const bonus=Math.round(left*10);G.score+=bonus;if(bonus>0)floatText(G.pos,'Zeit +'+bonus,'gold');
  if(frac>=.5)G.speedGS+=2;
  if([10,25,50,100].includes(G.depth)){
    if(!save.tj)save.tj={};const ms=Math.round(G.tTotal*1000);
    if(!save.tj[G.depth]||ms<save.tj[G.depth]){const first=!save.tj[G.depth];save.tj[G.depth]=ms;toast((first?'Zeit Etage ':'Neue Bestzeit Etage ')+G.depth+': '+fmtMs(ms));addGS(first?30:10);}
  }
}
