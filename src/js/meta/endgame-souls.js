/* src/js/meta/endgame-souls.js
   Endgame: Seelen, Seelenschmiede und Legenden. */
/* ================= Seelen und Legenden (Endgame) ================= */
const SOULUP=[
  {id:'sf',n:'Seelenfunke',d:'+2 % Gruftsteine pro Lauf je Stufe.',base:4,max:50},
  {id:'sh',n:'Seelenherz',d:'+1 maximales Leben je 5 Stufen (bis +5).',base:6,max:25},
  {id:'ss',n:'Seelenschild',d:'+1 Block pro Etage je 10 Stufen (bis +3).',base:8,max:30},
  {id:'sk',n:'Seelenklinge',d:'+1 Schaden ab Stufe 20, noch +1 ab Stufe 40.',base:10,max:40}
];
const soulLv=id=>(save.soulLv&&save.soulLv[id])||0;
const soulCost=(u,l)=>Math.ceil(u.base*Math.pow(1.2,l));
function openSouls(){
  if(!endGate())return;
  const box=$('#souls-list');box.innerHTML='';$('#souls-n').textContent=fmt(save.souls||0);
  for(const u of SOULUP){
    const l=soulLv(u.id),done=l>=u.max,c=soulCost(u,l),ok=!done&&(save.souls||0)>=c;
    const b=document.createElement('button');b.className='card'+(ok||done?'':' off');b.disabled=!ok;
    b.innerHTML=`<div class="cmain"><b>${u.n}<span class="lvp">Stufe ${l}/${u.max}</span></b><span>${u.d}</span></div>${done?'<div class="price max">Maximal</div>':`<div class="price">${c} Seelen</div>`}`;
    b.addEventListener('click',()=>{if(!ok)return;save.souls-=c;if(!save.soulLv)save.soulLv={};save.soulLv[u.id]=l+1;persist();sfx('card');openSouls();});
    box.appendChild(b);
  }
  openModal('m-souls');
}
const LEGEND=[
  {id:'l1',n:'Henkersblut',d:'Drachenzahn und Henkersbeil: +2 Schaden, mehr gegen Verwundete.',c:'2 maximale Leben weniger',apply(){G.fang=true;G.exec=true;G.maxhp=Math.max(2,G.maxhp-2);G.hp=Math.min(G.hp,G.maxhp);}},
  {id:'l2',n:'Sturmläufer',d:'Jeder dritte Schritt gratis, 30 % Ausweichen, 4 gratis Schritte pro Etage.',c:'Keine Blocks mehr',apply(){G.swift=2;G.dodge=3;G.tailwind+=2;G.shieldMax=0;G.shield=0;}},
  {id:'l3',n:'Dornenkrone',d:'Stachelpanzer, Blitzableiter und Kettenblitz.',c:'Herzen heilen nur halb so viel',apply(){G.thorns2=true;G.thorns=true;G.rod=true;G.volt=true;G.heartHalf=true;}},
  {id:'l4',n:'Seelenfresser',d:'Fressrausch, Blutdurst und Lebensfunke: Siege heilen.',c:'Gegner haben 1 Leben mehr',apply(){G.feast=true;G.leech=true;G.spark=true;G.legHp=(G.legHp||0)+1;}},
  {id:'l5',n:'Goldrausch',d:'Perlenkette, Beutegier und Goldrausch: Münzen heilen und zählen doppelt.',c:'Gegner haben 1 Leben mehr',apply(){G.pearl=true;G.loot=true;G.gold=3;G.legHp=(G.legHp||0)+1;}},
  {id:'l6',n:'Einsiedler',d:'Sandschleier, Windschatten und 2 gratis Schritte pro Etage.',c:'Keine Wurf-Items mehr',apply(){G.veil=true;G.shadow=true;G.tailwind+=1;G.noAmmo=true;G.bombs=0;}},
  {id:'l7',n:'Uhrmacherherz',d:'Alle 5 Züge setzen Gegner aus, 2 Zurück mehr pro Etage.',c:'1 Schaden weniger',apply(){G.gears=true;G.undoBonus+=2;G.undos+=2;G.dmg=Math.max(1,G.dmg-1);}}
];
function openLegend(cont){
  const box=$('#legend-list');box.innerHTML='';
  for(const L of shuffle(LEGEND.filter(x=>!(G.legs||[]).includes(x.id))).slice(0,3)){
    const b=document.createElement('button');b.className='card legc';
    b.innerHTML=`<div class="cmain"><b>${L.n}</b><span>${L.d}</span><em style="color:#ff8a8a;font-style:normal">Preis: ${L.c}</em></div>`;
    b.addEventListener('click',()=>{sfx('boss');L.apply();(G.legs=G.legs||[]).push(L.id);closeModal('m-legend');render();cont();});
    box.appendChild(b);
  }
  if(!box.children.length){cont();return;}
  sfx('boss');openModal('m-legend');
}
