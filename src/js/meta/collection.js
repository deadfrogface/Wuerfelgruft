/* src/js/meta/collection.js
   Sammlung: Erfolge, Bestiarium und Statistik. */
/* ================= Sammlung: Erfolge, Bestiarium, Statistik ================= */
const ACH=[];
for(let i=1;i<=10;i++)ACH.push({id:'zone'+i,name:'Zone '+i+' bezwungen',desc:'Schaffe Etage '+(i*10)+' ('+ZONES[i-1]+').'});
ACH.push(
 {id:'boss1',name:'Bossbezwinger',desc:'Besiege deinen ersten Boss.'},
 {id:'boss10',name:'Bossjäger',desc:'Besiege 10 Bosse.'},
 {id:'goblin',name:'Goblinfänger',desc:'Erwische einen fliehenden Goblin oder Leprechaun.'},
 {id:'thief',name:'Diebesfänger',desc:'Töte einen Dieb, der deine Beute trägt.'},
 {id:'lucky',name:'Glückspilz',desc:'Gewinne eine Ware mit den Würfeln.'},
 {id:'gambler',name:'Spieler',desc:'Würfle 10-mal im Händler.'},
 {id:'dice10',name:'Würfelsammler',desc:'Besitze alle 10 Zonenwürfel.'},
 {id:'rich',name:'Reich',desc:'Besitze 1000 Münzen.'},
 {id:'collector',name:'Sammler',desc:'Habe 10 verschiedene Verstärkungen in einem Lauf.'},
 {id:'phoenix',name:'Wiedergeboren',desc:'Lass dich von der Phönixfeder wiederbeleben.'},
 {id:'bomber',name:'Volltreffer',desc:'Triff mit einem Wurf-Item mindestens 3 Gegner.'},
 {id:'thrower',name:'Werfer',desc:'Wirf 50 Wurf-Items.'},
 {id:'untouched',name:'Unberührbar',desc:'Schaffe ab Etage 5 eine Etage ohne Schaden.'},
 {id:'hc30',name:'Hardcore-Held',desc:'Erreiche Etage 30 auf Hardcore.'},
 {id:'hp10',name:'Ein Leben genügt',desc:'Schaffe Etage 10 auf 1 HP.'},
 {id:'zoo',name:'Zoologe',desc:'Entdecke alle Gegner einer Zone.'},
 {id:'zooall',name:'Bestiarium komplett',desc:'Entdecke alle Gegner des Spiels.'},
 {id:'win',name:'Bezwinger der Gruft',desc:'Schaffe Etage 100.'},
 {id:'endless',name:'Endlos',desc:'Erreiche Etage 101 im Endlosmodus.'}
);
const ACHN={};ACH.forEach(a=>{ACHN[a.id]=a.name;});
function toast(t){
  const el=document.createElement('div');el.className='toast';el.textContent=t;
  const host=$('#app')||document.body;host.appendChild(el);setTimeout(()=>el.remove(),3400);
}
function achGS(id){return ACHGS[id]||10;}
function award(id){
  if(!ACHN[id]||save.ach[id])return;mrGain(40);
  save.ach[id]=Date.now();const g=achGS(id);addGS(g);persist();toast('Erfolg: '+ACHN[id]+' (+'+g+' Gruftsteine)');sfx('win');
}
let upsWrapped=false;
function wrapUps(){
  if(upsWrapped)return;upsWrapped=true;
  for(const u of UPS){const c=u.can;u.can=()=>c()&&!(G&&CLS_BLOCK[G.cls]&&CLS_BLOCK[G.cls].includes(u.id));const ap=u.apply;u.apply=function(){const r=ap.apply(this,arguments);markEx('ups',u.id);return r;};}
}
function noteSeen(type){
  if(MT[type]&&(MT[type].npc||MT[type].decoy))return;
  const d=save.dex[type]||(save.dex[type]={s:0,k:0});
  if(d.s===0){
    d.s=1;
    const T=MT[type];
    if(T&&T.z!==undefined){
      const ids=[...ROSTER[T.z],...BOSSES[T.z]];
      if(ids.every(i=>save.dex[i]&&save.dex[i].s>0))award('zoo');
      if(ROSTER.every((r,z)=>[...r,...BOSSES[z]].every(i=>save.dex[i]&&save.dex[i].s>0)))award('zooall');
    }
  }else d.s++;
}
