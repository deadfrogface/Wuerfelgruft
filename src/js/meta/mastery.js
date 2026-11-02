/* src/js/meta/mastery.js
   Meisterrang (1 bis 30) und Meisterschaft: Abzeichen, Sterne, Titel. */
/* ================= Meisterschaftsrang (Konto-Stufe, 1 bis 30) ================= */
const MR_MAX=30;
const mrNeed=r=>Math.round(110*r*(1+r*.18));          /* Erfahrung von Rang r auf r+1 */
const MR_REW={2:['gs',40],3:['gs',60],4:['gs',80],5:['title','Archivar'],6:['gs',120],7:['gs',140],8:['gs',160],9:['gs',200],10:['gs',300],
  12:['gs',250],14:['gs',300],15:['gs',400],17:['gs',350],20:['gs',600],22:['gs',500],25:['gs',800],27:['gs',700],30:['gs',1500]};
function mrRank(){let x=(save.mr&&save.mr.xp)||0,r=1;while(r<MR_MAX&&x>=mrNeed(r)){x-=mrNeed(r);r++;}return {r,x,need:r>=MR_MAX?0:mrNeed(r)};}
function mrGain(n){
  if(!n||n<=0)return;if(!save.mr)save.mr={xp:0,got:{}};
  const before=mrRank().r;save.mr.xp+=Math.round(n);const after=mrRank().r;
  for(let r=before+1;r<=after;r++){
    const R=MR_REW[r];save.mr.got[r]=1;
    let t='Meisterschaftsrang '+r+'!';if(R&&R[0]==='gs'){addGS(R[1]);t+=' +'+R[1]+' Gruftsteine';}else if(R&&R[0]==='title')t+=' Titel: '+R[1];
    setTimeout(()=>{toast(t);sfx('win');},300+(r-before)*1800);
  }
  if(after>before)persist();
}
/* ================= Meisterschaft: Abzeichen, Gegner-Sterne, Titel ================= */
const STAR_AT=[10,50,200],STAR_GS=[5,15,40];
const starsOf=id=>{const k=(save.dex[id]&&save.dex[id].k)||0;return STAR_AT.filter(n=>k>=n).length;};
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const masterCount=()=>Object.keys(save.mast||{}).length;
const dexMons=()=>Object.keys(MT).filter(k=>!MT[k].npc&&!MT[k].decoy&&MT[k].z!==undefined);
const TITLES=[
  {id:'t0',n:'Neuling',ok:()=>true},
  {id:'t1',n:'Gruftgänger',ok:()=>(save.runs||0)>=5},
  {id:'t2',n:'Würfelwandler',ok:()=>(save.bestDepth||0)>=30},
  {id:'t3',n:'Tiefenschreiter',ok:()=>(save.bestDepth||0)>=60},
  {id:'t4',n:'Bezwinger',ok:()=>!!save.won},
  {id:'t5',n:'Gegnerkenner',ok:()=>dexMons().every(k=>starsOf(k)>=1)},
  {id:'t6',n:'Meister',ok:()=>masterCount()>=5},
  {id:'t7',n:'Gegnermeister',ok:()=>dexMons().every(k=>starsOf(k)>=3)},
  {id:'t8',n:'Großmeister',ok:()=>masterCount()>=CLSK.length*DIFFK.length},
  {id:'t9',n:'Archivar',ok:()=>mrRank().r>=5}
];
const titleNow=()=>{const sel=save.titleSel&&TITLES.find(t=>t.id===save.titleSel&&t.ok());if(sel)return sel.n;let b=TITLES[0];for(const t of TITLES)if(t.ok())b=t;return b.n;};
function masterNote(cls,diff){
  if(!save.mast)save.mast={};const k=cls+'|'+diff;if(save.mast[k])return;
  save.mast[k]=1;mrGain(300);addGS(150);toast('Meisterabzeichen: '+CLASSES[cls].name+' · '+DIFFS[diff].name+' (+150 Gruftsteine)');sfx('win');
  if(masterCount()>=CLSK.length*DIFFK.length){if(!save.evs)save.evs={};save.evs.grandmaster=true;setTimeout(()=>toast('Großmeister! Neuer Skin: Lorbeer'),2200);}
  persist();
}
function starNote(id,oldK,newK){
  for(let i=0;i<3;i++)if(oldK<STAR_AT[i]&&newK>=STAR_AT[i]){
    mrGain(40);addGS(STAR_GS[i]);toast(MT[id].name+': Stern '+(i+1)+' (+'+STAR_GS[i]+' Gruftsteine)');
    if(i===2&&dexMons().every(k=>starsOf(k)>=3))setTimeout(()=>toast('Alle Gegner gemeistert!'),2000);
  }
}
function trackKill(m){
  const T=MT[m.type],d=save.dex[m.type]||(save.dex[m.type]={s:1,k:0}),ok0=d.k;d.k++;mrGain(T.boss?40:1);if(!T.npc&&!T.decoy)starNote(m.type,ok0,d.k);
  if(T.boss){save.stats.bosses++;award('boss1');if(save.stats.bosses>=10)award('boss10');}
  if(T.flee)award('goblin');
  questEvent('kills',1);if(T.boss){questEvent('bosses',1);if(G)G.bossKills=(G.bossKills||0)+1;}
  if(m.carry)award('thief');
}
function trackLevel(){
  const d=G.depth;
  questEvent('depth',d,true);if(!(G.lvlLoss>0))questEvent('untouched',1);if(d%10===0)questEvent('zones',1);if(G.daily)dailyProgress();
  if(d%10===0&&d<=100)award('zone'+(d/10));
  if(d>=5&&!(G.lvlLoss>0))award('untouched');
  if(G.money>=1000)award('rich');
  if(G.diff==='hardcore'&&d>=30)award('hc30');
  if(G.diff==='1hp'&&d>=10)award('hp10');
  if(d>=100)award('win');
  if(d>100)award('endless');
}
function dexLine(id){
  const T=MT[id],z=T.z||0;
  const fl=T.boss?z*10+(T.bi===1?10:5):z*10+(T.d||1);
  const how=(OLD_DESC[id]||traitText(T)||'läuft auf dich zu und schlägt zu.');
  return `Zu finden: ${ZONES[z]}${T.boss?' (Boss, Etage '+fl+')':', ab Etage '+fl}. Er ${how.replace(/^./,c=>c.toLowerCase())} ${T.hp} Leben, ${T.dmg} Schaden.`;
}
function openZoneMons(){
  const z=Math.min(zoneOf(G.depth),ROSTER.length-1);
  const ids=[...ROSTER[z],...BOSSES[z]].filter(id=>MT[id]&&!MT[id].npc&&save.dex[id]&&save.dex[id].s>0);
  const left=ROSTER[z].length+BOSSES[z].length-ids.length;
  $('#zmon-sub').textContent=ZONES[z]+(left>0?' · '+left+' noch unbekannt':'');
  $('#zmon-body').innerHTML=ids.length?ids.map(id=>{const T=MT[id];return `<div class="zm"><span class="ph">${spr(id)}</span><div><b>${T.name}</b>${T.boss?' <em>Boss</em>':''}<div>${dexLine(id)}</div></div></div>`;}).join(''):'<p>Du bist hier noch keinem Gegner begegnet.</p>';
  openModal('m-zmon');
}
function openDex(tab){
  tab=tab||'dex';
  const seg=$('#dex-tabs');seg.innerHTML='';
  for(const [k,n] of [['dex','Gegner'],['ach','Erfolge'],['look','Aussehen'],['mst','Meister'],['stat','Statistik']]){
    const b=document.createElement('button');b.textContent=n;b.className=tab===k?'on':'';
    b.addEventListener('click',()=>{sfx('click');openDex(k);});seg.appendChild(b);
  }
  let h='';
  if(tab==='dex'){
    let seen=0,tot=0,body='';
    for(let z=0;z<ZONES.length;z++){
      body+=`<h3>${ZONES[z]}</h3><div class="dexg">`;
      for(const id of [...ROSTER[z],...BOSSES[z]]){
        tot++;const d=save.dex[id],ok=!!(d&&d.s>0);if(ok)seen++;
        body+=`<div class="dx${ok?'':' lock'}" data-id="${id}"><span class="ph">${spr(id)}</span><b>${ok?MT[id].name:'???'}</b><small>${ok?'<span class="stars">'+starStr(starsOf(id))+'</span> '+d.k:'unbekannt'}</small></div>`;
      }
      body+='</div>';
    }
    h=`<div class="prog"><div class="qb"><i style="width:${Math.round(seen/tot*100)}%"></i></div><small>Entdeckt: <b>${seen} von ${tot}</b></small></div><p>Tippe auf einen Gegner für Details.</p><div id="dex-info" hidden></div>`+body;
  }else if(tab==='ach'){
    const n=ACH.filter(a=>save.ach[a.id]).length;
    h=`<div class="prog"><div class="qb"><i style="width:${Math.round(n/ACH.length*100)}%"></i></div><small>Erfolge: <b>${n} von ${ACH.length}</b></small></div><ul class="ach">`+ACH.map(a=>{const u=!!save.ach[a.id];return `<li class="${u?'got':'lock'}"><span class="ac">${u?'✓':''}</span><span class="at"><b>${a.name}</b><small>${a.desc}</small></span><em class="rw">${spr('i_gs')}+${achGS(a.id)}</em></li>`;}).join('')+'</ul>';
  }else if(tab==='mst'){
    const n=masterCount(),tot=CLSK.length*DIFFK.length;
    let rows='<div class="mgrid"><span></span>'+DIFFK.map(d=>`<b style="color:${DIFFS[d].col}">${DIFFS[d].name}</b>`).join('');
    for(const c of CLSK){rows+=`<b class="mc">${CLASSES[c].name}</b>`+DIFFK.map(d=>`<i class="mb${(save.mast||{})[c+'|'+d]?' on':''}">${(save.mast||{})[c+'|'+d]?'✓':''}</i>`).join('');}
    rows+='</div>';
    const ms=dexMons(),got=ms.filter(k=>starsOf(k)>=3).length,one=ms.filter(k=>starsOf(k)>=1).length;
    const mk=mrRank();
    h=`<h3>Meisterschaftsrang ${mk.r}${mk.r>=MR_MAX?' (Maximum)':''}</h3><div class="prog"><div class="qb"><i style="width:${mk.need?Math.round(mk.x/mk.need*100):100}%"></i></div><small>${mk.need?fmt(mk.x)+' von '+fmt(mk.need)+' Erfahrung bis Rang '+(mk.r+1):'Höchster Rang erreicht'}. Erfahrung gibt es für Gegner, Etagen, Bosse, Aufgaben, Erfolge, Abzeichen und Sterne.</small></div><div class="prog"><div class="qb"><i style="width:${Math.round(n/tot*100)}%"></i></div><small>Meisterabzeichen: <b>${n} von ${tot}</b></small></div><p>Schaffe alle Etagen mit jeder Klasse auf jeder Schwierigkeit. Jedes Abzeichen gibt 150 Gruftsteine, alle zusammen den Skin Lorbeer.</p>${rows}<h3>Gegner-Sterne</h3><p>Stern 1 bei 10, Stern 2 bei 50, Stern 3 bei 200 besiegten Gegnern einer Art. <b>${one}</b> von ${ms.length} mit mindestens einem Stern, <b>${got}</b> mit drei.</p><h3>Titel</h3><div class="vg-chips" id="ttl">${TITLES.map(t=>`<button data-t="${t.id}" class="${titleNow()===t.n?'on':''}" ${t.ok()?'':'disabled'}>${t.ok()?t.n:'???'}</button>`).join('')}</div>${save.seenOutro?'<button class="btn ghost" id="ttl-out" style="margin-top:12px">Abspann ansehen</button>':''}`;
  }else if(tab==='look'){
    h='<p>Wähle das Aussehen deiner Helden. Skins schaltest du frei, indem du mit der Klasse tief genug kommst.</p>';
    for(const c of CLSK){
      if(!clsOpen(c))continue;
      h+=`<h3>${CLASSES[c].name}</h3><div class="dexg lk">`;
      for(const sk of skinsOf(c)){
        const ok=skinOpen(c,sk),cur=(skinOf(c)||'')===sk.id;
        h+=`<div class="dx${ok?'':' lock'}${cur?' sel':''}" data-c="${c}" data-s="${sk.id}"><span class="ph">${ok?spr(heroId(save.diff,c,sk.id)):'<i class="px s1"></i>'}</span><b>${ok?sk.name:'???'}</b><small>${ok?(cur?'Aktiv':''):'Etage '+sk.need}</small></div>`;
      }
      h+='</div>';
    }
  }else{
    const st=save.stats,dexSeen=Object.values(save.dex).filter(d=>d.s>0).length;
    const rows=[['Läufe',fmt(save.runs)],['Gegner besiegt',fmt(save.kills)],['Bosse besiegt',fmt(st.bosses)],['Züge gespielt',fmt(st.turns)],['Wurf-Items geworfen',fmt(st.throws)],['Würfelwürfe',fmt(st.rolls)],['Gegner entdeckt',dexSeen+' von '+Object.keys(MT).length],...(save.trophy&&save.trophy.ace?[['Trophäe','Ace']]:[]),['Erfolge',ACH.filter(a=>save.ach[a.id]).length+' von '+ACH.length]];
    const big=rows.slice(0,6),small=rows.slice(6);
    h='<div class="tiles">'+big.map((r,i)=>`<div class="tile${i===0?' hi':''}"><b>${r[1]}</b><span>${r[0]}</span></div>`).join('')+'</div><div class="res">'+small.map(r=>`<span>${r[0]}</span><b>${r[1]}</b>`).join('')+'</div><h3>Bestwerte</h3><div class="res">'+DIFFK.map(k=>{const b=save.bd[k];return `<span class="dn d-${k}">${DIFFS[k].name}</span><b>${b&&(b.score||b.depth)?fmt(b.score)+' P., Etage '+b.depth:'–'}</b>`;}).join('')+'</div>';
  }
  $('#dex-body').innerHTML=h;
  if(tab==='mst'){const bo=$('#ttl-out');if(bo)bo.addEventListener('click',()=>{sfx('click');closeModal('m-dex');playOutro(()=>show('scr-title'));});}
  if(tab==='mst')$$('#ttl button').forEach(b=>b.addEventListener('click',()=>{sfx('click');save.titleSel=b.dataset.t;persist();openDex('mst');}));
  if(tab==='look')$$('#dex-body .dx').forEach(el=>el.addEventListener('click',()=>{
    const c=el.dataset.c,sk=skinsOf(c).find(x=>x.id===el.dataset.s);if(!sk||!skinOpen(c,sk)){sfx('block');return;}
    sfx('card');if(!save.skin)save.skin={};save.skin[c]=sk.id;persist();openDex('look');
  }));
  if(tab==='dex')$$('#dex-body .dx').forEach(el=>el.addEventListener('click',()=>{
    sfx('click');const id=el.dataset.id,T=MT[id],d=save.dex[id],box=$('#dex-info');
    $$('#dex-body .dx').forEach(x=>x.classList.toggle('sel',x===el));
    box.hidden=false;
    if(!d||!d.s){box.innerHTML='<b>???</b> Diesen Gegner hast du noch nicht getroffen. Besiege oder entdecke ihn, um mehr zu erfahren.';return;}
    box.innerHTML='<b>'+T.name+'</b> '+dexLine(id);
  }));
  openModal('m-dex');
}

