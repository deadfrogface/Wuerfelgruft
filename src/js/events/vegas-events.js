/* src/js/events/vegas-events.js
   Events nach Datum und die Vegas-Nacht. */
/* ================= Events & Vegas-Nacht ================= */
const EVENTS={
  halloween:{name:'Halloween',from:[10,24],to:[10,31],item:'e_kuerbis',mul:1,goal:10,col:['#ff9a4d','#c0561a'],rule:'Selten liegt ein Kürbis auf einer Etage. Er heilt 2 Leben.',aim:'Sammle 10 Kürbisse.'},
  xmas:{name:'Weihnachten',from:[12,18],to:[12,26],item:'e_geschenk',mul:1,goal:8,col:['#ff6a6a','#a01818'],rule:'Selten liegt ein Geschenk auf einer Etage, mit Münzen und manchmal einem Schild.',aim:'Sammle 8 Geschenke.'},
  vegas:{name:'Vegas-Nacht',from:[12,27],to:[1,2],col:['#ff7a8a','#c8302d']},
  easter:{name:'Ostern',easter:true,item:'e_ei',mul:1.8,goal:12,col:['#d8b8ff','#8a5fa8'],rule:'Auf manchen Etagen ist ein Ei versteckt. Es gibt 12 Münzen.',aim:'Sammle 12 Eier.'},
  valentine:{name:'Valentinstag',from:[2,10],to:[2,14],item:'e_rose',mul:1,goal:10,col:['#ff8aa8','#c8302d'],rule:'Herzen heilen 1 mehr. Selten liegt eine Rose auf einer Etage, sie heilt 2 Leben.',aim:'Sammle 10 Rosen.'},
  hungary:{name:'Ungarn-Fest',from:[2,15],to:[2,21],item:'e_paprika',mul:1,goal:8,col:['#e8553d','#a82a20'],rule:'Selten liegt Paprika auf einer Etage. Sie brennt: Gegner in der Nähe nehmen 2 Schaden.',aim:'Sammle 8 Paprika.'},
  italy:{name:'Italien-Fest',from:[8,9],to:[8,15],item:'e_pizza',mul:1.2,goal:6,col:['#4fb85a','#2f8a44'],rule:'Selten liegt eine Pizza auf einer Etage (heilt 2 Leben), manchmal ein Espresso (4 gratis Schritte).',aim:'Iss 6 Pizzen.'},
  birthday:{name:'Geburtstag',from:[3,15],to:[3,15],item:'e_kuchen',mul:2.5,goal:3,col:['#ffe27a','#f4b942'],rule:'Münzen zählen doppelt. Auf manchen Etagen liegt ein Stück Kuchen, es heilt 3 Leben.',aim:'Iss 3 Stück Kuchen.'}
};
const EV_RATE={leicht:.01,normal:.1,schwer:.1,hardcore:.11,'1hp':.16};
const evChance=E=>(EV_RATE[(G&&G.diff)||'normal']||.1)*(E.mul||1);
const easterSun=y=>{const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da);};
function eventActive(id){
  if(window.__evForce)return window.__evForce===id;
  const E=EVENTS[id],now=new Date();
  if(E.easter){const es=easterSun(now.getFullYear()),s0=new Date(es.getFullYear(),es.getMonth(),es.getDate()-9),e0=new Date(es.getFullYear(),es.getMonth(),es.getDate()+1,23,59,59);return now>=s0&&now<=e0;}
  for(const y of [now.getFullYear()-1,now.getFullYear()]){
    const s0=new Date(y,E.from[0]-1,E.from[1]),e0=new Date(y+(E.to[0]<E.from[0]?1:0),E.to[0]-1,E.to[1],23,59,59);
    if(now>=s0&&now<=e0)return true;
  }
  return false;
}
const activeEvent=()=>Object.keys(EVENTS).find(eventActive)||'';
const evOn=id=>!!G&&!G.daily&&activeEvent()===id;
function evCount(id){
  const E=EVENTS[id];if(!save.evp)save.evp={};if(!save.evs)save.evs={};
  save.evp[id]=(save.evp[id]||0)+1;
  if(save.evp[id]>=E.goal&&!save.evs[id]){save.evs[id]=true;toast('Event-Skin freigeschaltet: '+EVSK[id][save.cls||'krieger'].n);sfx('win');}
  persist();
}
function evPickup(it,t){
  const id=Object.keys(EVENTS).find(k=>EVENTS[k].item===it);
  if(id)evCount(id);
  if(it==='e_rose'){const h=Math.min(2,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Rose','green');}
  else if(it==='e_kuerbis'){const h=Math.min(2,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Kürbis','green');}
  else if(it==='e_geschenk'){const n=20+rnd(25);G.money+=n;G.score+=n;sfx('coin');floatText(t,'+'+n,'gold');if(rnd(4)===0){G.shield++;floatText(G.pos,'Schild','blue');}}
  else if(it==='e_ei'){G.money+=12;G.score+=20;sfx('coin');floatText(t,'+12','gold');}
  else if(it==='e_pizza'){const h=Math.min(2,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Mmh','green');}
  else if(it==='e_espresso'){G.freeSteps+=4;sfx('key');floatText(t,'Espresso','blue');}
  else if(it==='e_paprika'){sfx('boom');floatText(t,'Paprika!','red');const dd=bfs(G.pos,null);for(const m of G.mons.slice())if((dd.get(m.pos)||99)<=2&&!MT[m.type].boss){burst(m.pos,'#e8302d',10);hitMonster(m,2,false);}}
  else if(it==='e_kuchen'){const h=Math.min(3,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Lecker','green');}
}
