/* src/js/ui/settings-classes.js
   Fehlerprotokoll, Einstellungen, Schwierigkeits- und Klassenwahl. */
const ERRKEY='wuerfelgruft-errors';
function logError(msg,where){
  try{const l=JSON.parse(localStorage.getItem(ERRKEY)||'[]');l.push({t:new Date().toISOString(),m:String(msg).slice(0,300),w:String(where||'').slice(0,200),d:G?G.depth:0});
    localStorage.setItem(ERRKEY,JSON.stringify(l.slice(-12)));}catch(e){}
}
window.addEventListener('error',e=>logError(e.message,(e.filename||'')+':'+e.lineno));
window.addEventListener('unhandledrejection',e=>logError(e.reason&&e.reason.message||e.reason,'promise'));
async function copyErrors(){
  let l=[];try{l=JSON.parse(localStorage.getItem(ERRKEY)||'[]');}catch(e){}
  if(!l.length){toast('Keine Fehler gespeichert');return;}
  const txt='Würfelgruft Fehlerprotokoll\n'+l.map(x=>x.t+' Etage '+x.d+' '+x.m+' @'+x.w).join('\n');
  try{await navigator.clipboard.writeText(txt);toast('Fehlerprotokoll kopiert');}catch(e){prompt('Fehlerprotokoll:',txt);}
}
function setupLang(){
  const b=$('#s-lang');if(!b)return;
  b.textContent=LANG==='en'?'English':'Deutsch';
  if(capPlug('AdMob')||capPlug('NativePurchases')){$('#set-support').hidden=false;setTimeout(monetSync,1500);}
  $('#s-sup').addEventListener('click',()=>{sfx('click');openSupport();});
  $('#sup-close').addEventListener('click',()=>{sfx('click');closeModal('m-support');});
  $('#sup-restore').addEventListener('click',async()=>{sfx('click');await monetSync();toast('Käufe abgeglichen.');openSupport();});
  const eb=$('#s-err');if(eb)eb.addEventListener('click',()=>{sfx('click');copyErrors();});
  b.addEventListener('click',()=>{sfx('click');save.settings.lang=LANG==='en'?'de':'en';flushSave();location.reload();});
}
function applySettings(){
  const r=document.documentElement,st=save.settings;
  r.style.setProperty('--bright',(st.bright/100).toFixed(2));
  r.style.setProperty('--ts',(st.ts/100).toFixed(2));
  r.classList.toggle('rm',!!st.rm);r.classList.toggle('cb',!!st.cb);r.classList.toggle('lite',!!st.lite);r.classList.toggle('dim',st.bright!==100);
  AU.apply();if(G)renderHUD();
}
function openDiff(cb){
  const box=$('#diff-cards');box.innerHTML='';
  for(const k of DIFFK){
    const D=DIFFS[k],b=document.createElement('button');b.className='card diff d-'+k+(save.diff===k?' cur':'');
    const best=save.bd[k];
    const I=DIFF_INFO[k];
    b.innerHTML=`<div class="cl">${spr(heroId(k,save.cls,skinOf(save.cls)))}</div><div class="cr"><div class="ct"><b>${D.name}</b><span class="hpp">${Array.from({length:Math.min(D.hp,8)},()=>spr(k==='1hp'?'s-heart':'s-heart','pip')).join('')}</span></div><span class="cline">${I.line}</span><div class="cchips">${I.tags.map(t=>`<i class="dchip ${t[0]}">${t[1]}</i>`).join('')}</div><em>${ascOf(k)?'Aufstieg bis Stufe '+ascOf(k)+' · ':''}${best&&(best.score||best.depth)?'Bestwert '+fmt(best.score)+' Punkte, Etage '+best.depth:'Noch nicht gespielt'}</em></div>`;
    b.addEventListener('click',()=>{sfx('card');save.diff=k;persist();closeModal('m-diff');updateStats();openClass(()=>cb(k));});
    box.appendChild(b);
  }
  const mods=$('#diff-mods');mods.innerHTML='';
  const mk=(label,desc,fn)=>{const b=document.createElement('button');b.className='btn ghost';b.style.marginTop='10px';b.innerHTML=label;b.addEventListener('click',()=>{sfx('click');fn();persist();openDiff(cb);});const d=document.createElement('p');d.className='dim';d.style.margin='4px 2px 0';d.textContent=desc;mods.appendChild(b);mods.appendChild(d);};
  const amax=Math.max(0,...DIFFK.map(ascOf));
  if(amax>0){const a=Math.min(save.ascSel||0,amax);mk('Aufstieg: '+(a?'Stufe '+a:'Aus'),a?ASC_TXT[a]:'Härtere Läufe, mehr Gruftsteine. Jeder Sieg schaltet auf seiner Schwierigkeit die nächste Stufe frei.',()=>{save.ascSel=(a+1)>amax?0:a+1;});}
  if(save.won){const m=save.mut||'';mk('Mutator: '+(m?MUTS[m].name:'Keiner'),m?MUTS[m].desc+' Mehr Gruftsteine.':'Eine Regeländerung für diesen Lauf, mit Bonus an Gruftsteinen.',()=>{const i=MUTK.indexOf(m);save.mut=i+1>=MUTK.length?'':MUTK[i+1];});}
  diffBack=null;openModal('m-diff');
}
let diffBack=null;
const CLASSES={
  krieger:{name:'Krieger',ico:'s-blade',need:0,role:'Ausgewogen, ohne Schwäche',ab:'Kein Sonderknopf. Er kämpft im Nahkampf: einfach auf Gegner zulaufen.',it:'Wirft die Wurf-Items der Zone (Bombe, Sand, Frost, Strudel, Fass ...). Jede Zone hat ein eigenes mit Fläche und Wirkung.',tags:[['','Keine Besonderheit']],desc:'Ausgewogen. Keine Besonderheit, keine Schwäche.'},
  zauberer:{name:'Zauberer',ico:'s-bolt',need:10,role:'Zaubert aus der Ferne',ab:'Mana-Blitz: Gegner antippen, 3 Schaden für 2 Mana. Mana lädt sich alle 2 Züge auf.',it:'Keine Wurf-Items. Ein gefundenes Wurf-Item gibt 2 Mana.',tags:[['pro','Zauber: Antippen = 3 Schaden'],['pro','Mana lädt sich auf'],['con','Kein Nahkampf'],['con','3 Leben, nicht erweiterbar'],['con','Keine Wurf-Items']],desc:'Zaubert statt zu kämpfen: Antippen eines Gegners wirkt einen Zauber (3 Schaden, kostet 2 Mana, Mana lädt sich mit den Zügen auf). Kein Nahkampf, nur 3 Leben, die nicht wachsen können, keine Wurf-Items.',
    apply(D0){G.noAmmo=true;G.bombs=0;G.noMelee=true;G.noHpUp=true;G.mana=6;G.manaMax=6;if(!D0.fixed){G.maxhp=Math.max(2,Math.ceil(D0.hp*.6));G.hp=G.maxhp;}}},
  schatz:{name:'Schatzjäger',ico:'s-coin',need:20,role:'Geld ist Macht',ab:'Münzwurf: Wirft 10 Münzen auf einen Gegner, 2 Schaden (+1 je 50 Münzen im Beutel, bis +2).',it:'Keine Wurf-Items. Ein gefundenes Wurf-Item gibt Münzen.',tags:[['pro','Münzwurf: Geld als Geschoss'],['pro','+50 % Münzen, 40 Startgeld'],['pro','Mehr Münzen, mehr Schaden'],['con','Keine Wurf-Items']],desc:'Der Beutesack ist seine Waffe: Er wirft Münzen auf Gegner (10 Münzen, 2 Schaden, mehr bei vollem Beutel). Er sammelt mehr Beute, muss aber mit ihr haushalten.',
    apply(){G.noAmmo=true;G.bombs=0;G.loot=true;G.money+=40;G.tailwind+=1;G.goldMul=1.5;}},
  waechter:{name:'Wächter',ico:'s-shield',need:30,role:'Bollwerk',ab:'Schildstoß alle 4 Züge: schleudert einen Nachbarn 2 Felder zurück und betäubt ihn. Warten gibt +1 Block.',it:'Keine Wurf-Items. Ein gefundenes Wurf-Item gibt Münzen.',tags:[['pro','Warten baut Blocks auf'],['pro','Schildstoß: zurückschleudern und betäuben'],['pro','Treffer −1, +1 Schaden'],['con','Keine Wurf-Items'],['con','Keine Reichweiten-Buffs']],desc:'Der Wächter hält die Linie: Warten lädt Blocks auf, der Schildstoß wirft einen Gegner zurück und betäubt ihn. Er ist langsam, aber schwer zu knacken.',
    apply(){G.noAmmo=true;G.bombs=0;G.plate=true;G.armor=true;G.shieldMax+=1;G.dmg+=1;G.undoBonus=0;G.undos=Math.min(G.undos,1);}},
  jaeger:{name:'Jäger',ico:'s-spear',need:0,mr:5,role:'Fallensteller',ab:'Falle (3 pro Etage): Gegner darauf nehmen 2 Schaden und sind 2 Züge betäubt. Eigene Fallen nimmst du beim Drüberlaufen wieder auf.',it:'Keine normalen Wurf-Items. Ein gefundenes Wurf-Item gibt eine weitere Falle.',tags:[['pro','Legt Fallen (3 pro Etage)'],['pro','Betäubte Gegner: doppelter Schaden'],['pro','Speer von Anfang an'],['con','1 Leben weniger'],['con','Keine normalen Wurf-Items']],desc:'Der Jäger kämpft nicht Mann gegen Mann, sondern stellt Fallen. Wer hineintritt, nimmt 2 Schaden und ist 2 Züge betäubt, und betäubte Gegner nehmen von ihm doppelten Schaden. Fallen kannst du wieder aufnehmen.',
    apply(D0){G.spear=true;G.assassin=true;G.bombs=3;if(!D0.fixed){G.maxhp=Math.max(2,G.maxhp-1);G.hp=G.maxhp;}}},
  dieb:{name:'Dieb',ico:'p_mantel',need:0,mr:10,role:'Schleicher',ab:'Schattenschritt (3 pro Etage): springt bis 3 Felder weit und macht 2 Züge unsichtbar.',it:'Keine normalen Wurf-Items. Ein gefundenes Wurf-Item gibt einen weiteren Schattenschritt.',tags:[['pro','Schattenschritt: 3 Felder springen, 2 Züge unsichtbar'],['pro','Gegner bemerken dich erst aus der Nähe'],['pro','Betäubte Gegner: doppelter Schaden'],['con','2 Leben weniger']],desc:'Der Dieb kämpft aus dem Schatten: Er springt per Schattenschritt (3 pro Etage) durch den Raum, bleibt unsichtbar und vermeidet Kämpfe. Wer ihn sieht, ist schon zu nah.',
    apply(D0){G.veil=true;G.assassin=true;G.loot=true;G.money+=20;G.bombs=3;if(!D0.fixed){G.maxhp=Math.max(2,G.maxhp-2);G.hp=G.maxhp;}}},
  alchemist:{name:'Alchemist',ico:'p_kristall',need:0,mr:16,role:'Tränkemischer',ab:'Trank: mischt 2 Zutaten (Feuer, Eis, Gift) zu einem von 6 Tränken. Zutaten fallen von Besiegten.',it:'Keine Wurf-Items. Ein gefundenes Wurf-Item gibt eine Zutat.',tags:[['pro','Zutaten von besiegten Gegnern'],['pro','6 verschiedene Tränke aus Feuer, Eis und Gift'],['con','1 Leben weniger'],['con','Keine Wurf-Items']],desc:'Der Alchemist sammelt Zutaten (Feuer, Eis, Gift) von Besiegten. Je zwei ergeben einen Trank: Feuerball, Frostbombe, Gaswolke, Dampf, Sprengtrank oder Lähmtrank. Wer klug mischt, räumt ganze Gruppen.',
    apply(D0){G.noAmmo=true;G.bombs=0;G.ing=['F','E'];if(!D0.fixed){G.maxhp=Math.max(2,G.maxhp-1);G.hp=G.maxhp;}}}
};
const CLSK=Object.keys(CLASSES);
const clsOpen=k=>(save.bestDepth||0)>=CLASSES[k].need&&(!CLASSES[k].mr||mrRank().r>=CLASSES[k].mr);
/* Klassen-Vorschau: Fähigkeit, Wurf-Items und Freischaltung */
const mrTotal=R=>{let x=0;for(let r=1;r<R;r++)x+=mrNeed(r);return x;};
function clsReqText(k){const C=CLASSES[k];if(!C.mr&&!C.need)return 'Von Anfang an.';return C.mr?'Meisterschaftsrang '+C.mr+' (du: Rang '+mrRank().r+')':'Erreiche Etage '+C.need+' (Rekord: '+(save.bestDepth||0)+')';}
function clsReqBar(k){
  const C=CLASSES[k];if(clsOpen(k)||(!C.mr&&!C.need))return '';
  let p;if(C.mr){const have=(save.mr&&save.mr.xp)||0,need=mrTotal(C.mr);p=Math.min(100,Math.round(have/need*100));return `<div class="qb"><i style="width:${p}%"></i></div><small>${fmt(have)} von ${fmt(need)} Erfahrung bis Rang ${C.mr}</small>`;}
  p=Math.min(100,Math.round((save.bestDepth||0)/C.need*100));return `<div class="qb"><i style="width:${p}%"></i></div><small>Beste Etage ${save.bestDepth||0} von ${C.need}</small>`;
}
function openClsInfo(k,pickCb){
  const C=CLASSES[k],ok=clsOpen(k);
  $('#ci-t').textContent=C.name;
  $('#ci-body').innerHTML=`<div style="text-align:center"><div style="transform:scale(2.6);display:inline-block;margin:26px 0 22px">${spr(heroId(save.diff,k,skinOf(k)))}</div><p><b style="color:var(--gold)">${C.role}</b></p></div><p>${C.desc}</p>
   <h3>Knopf unten</h3><p>${C.ab}</p><h3>Wurf-Items</h3><p>${C.it}</p>
   <h3>Stärken und Schwächen</h3><div class="cchips">${C.tags.map(t=>`<i class="dchip ${t[0]}">${t[1]}</i>`).join('')}</div>
   <h3>Freischaltung</h3><p>${ok?'<b style="color:var(--gold)">Freigeschaltet.</b> ':''}${clsReqText(k)}</p>${clsReqBar(k)}`;
  const pk=$('#ci-pick');pk.hidden=!ok||!pickCb;pk._cb=pickCb;
  openModal('m-clsinfo');
}
function openClsOverview(){
  $('#ci-t').textContent='Alle Klassen';
  $('#ci-body').innerHTML='<p>Jede Klasse außer dem Krieger hat einen eigenen Knopf mit einer Fähigkeit. Wurf-Items der Zonen wirft nur der Krieger. Bei den anderen werden gefundene Wurf-Items in etwas Passendes verwandelt.</p>'+CLSK.map(k=>{
    const C=CLASSES[k],ok=clsOpen(k);
    return `<div class="goalrow" style="align-items:flex-start;opacity:${ok?1:.75}">${spr(heroId(save.diff,k,skinOf(k)))}<span><b>${C.name}</b> · ${ok?'frei':'gesperrt'}<br>${C.ab}<br><small>Wurf-Items: ${C.it}</small><br><small>Freischaltung: ${clsReqText(k)}</small></span></div>`;}).join('');
  $('#ci-pick').hidden=true;openModal('m-clsinfo');
}
function openClass(cb){
  const open=CLSK.filter(clsOpen);
  if(open.length<2){save.cls='krieger';cb();return;}
  const box=$('#class-cards');box.innerHTML='';
  for(const k of CLSK){
    const C=CLASSES[k],ok=clsOpen(k),b=document.createElement('button');b.className='card diff cls'+(save.cls===k?' cur':'')+(ok?'':' locked');
    b.innerHTML=`<div class="cl">${spr(heroId(save.diff,k,skinOf(k)))}</div><div class="cr"><div class="ct"><b>${C.name}</b></div>${ok?`<span class="cline">${C.role}</span><div class="cchips">${C.tags.map(t=>`<i class="dchip ${t[0]}">${t[1]}</i>`).join('')}</div>`:`<span class="cline">${C.mr?'Gesperrt: Meisterschaftsrang '+C.mr+' (aktuell '+mrRank().r+').':'Gesperrt: erreiche Etage '+C.need+' (aktuell '+(save.bestDepth||0)+').'}</span>`}</div>`;
    const inf=document.createElement('span');inf.className='cinfo';inf.textContent='i';inf.setAttribute('role','button');inf.setAttribute('aria-label','Vorschau');b.appendChild(inf);
    inf.addEventListener('click',e=>{e.stopPropagation();sfx('click');openClsInfo(k,()=>{save.cls=k;persist();closeModal('m-clsinfo');closeModal('m-class');cb();});});
    b.addEventListener('click',()=>{if(!ok){sfx('click');openClsInfo(k);return;}sfx('card');save.cls=k;persist();closeModal('m-class');cb();});
    box.appendChild(b);
  }
  openModal('m-class');
}
$('#ci-close').addEventListener('click',()=>{sfx('click');closeModal('m-clsinfo');});
$('#ci-pick').addEventListener('click',()=>{sfx('card');const f=$('#ci-pick')._cb;if(f)f();});
$('#c-over').addEventListener('click',()=>{sfx('click');openClsOverview();});
$('#c-cancel').addEventListener('click',()=>{sfx('click');closeModal('m-class');});

