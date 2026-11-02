/* src/js/dev/dev-menu.js
   Entwicklermenü, nur in der DEV-Version. */
/* Wie ein normaler Lauf bis zur Start-Etage: pro Etage eine zufällige Verstärkung (Stufenregel wie in showUpgrades), Zonenwürfel, Münzen */
function devAutoPicks(depth){
  for(let d=1;d<depth;d++){
    const nz=Math.min(ZONES.length-1,Math.floor(d/10));
    const avail=UPS.filter(u=>u.can()&&u.tier<=nz&&(!u.rare||Math.random()<u.rare));
    const fresh=nz>0?avail.filter(u=>u.tier===nz):[];
    const u=pick(fresh.length&&Math.random()<.4?fresh:avail.length?avail:UPS.filter(x=>x.can()));
    if(u){u.apply();G.ups[u.id]=(G.ups[u.id]||0)+1;}
    if(d%10===0){const kd=kindOf(d);if(!G.dice.includes(kd))G.dice.push(kd);}
    G.bombs+=G.sack;G.money+=G.income*10+12;
  }
  G.hp=G.maxhp;G.shield=G.shieldMax;
}
function devOpen(){
  let m=$('#m-dev');
  if(!m){
    m=document.createElement('div');m.className='modal';m.id='m-dev';
    m.innerHTML='<div class="panel help"><h2>DEV</h2><div id="dev-body"></div><div class="stack" style="margin-top:14px"><button class="btn big" id="dev-close">Schließen</button></div></div>';
    $('#app').appendChild(m);
    $('#dev-close').addEventListener('click',()=>{closeModal('m-dev');updateStats();});
  }
  const sel=(id,opts,cur)=>`<select id="${id}" style="width:100%;padding:8px;border-radius:8px;background:var(--ink3);color:var(--text);margin:4px 0">${opts.map(o=>`<option value="${o[0]}"${o[0]===cur?' selected':''}>${o[1]}</option>`).join('')}</select>`;
  const evs=[['','Kein Event (echtes Datum)'],['none','Nur ohne Event'],...Object.keys(EVENTS).map(k=>[k,EVENTS[k].name])];
  const goals=[['','Zufall'],...['key','switch','altar','runes','clear','elite','survive'].map(k=>[k,k])];
  const b=(id,t,cls='ghost')=>`<button class="btn ${cls}" id="${id}" style="margin:4px 0">${t}</button>`;
  $('#dev-body').innerHTML=`<p>Gruftsteine: <b style="color:var(--gold)">${fmt(save.gs||0)}</b> · Läufe: ${save.runs||0} · Rekord: ${save.bestDepth||0}</p>
   <h3>Währung und Fortschritt</h3>
   ${b('dv-gs1','+1.000 Gruftsteine')}${b('dv-gs2','+1.000.000 Gruftsteine')}
   ${b('dv-max','Alles auf Max (Schmiede, Klassen, Skins, Aufstieg, Sammlung, Erfolge)','gold')}
   ${b('dv-new','Neuer Spieler (Speicher löschen, Erststart-Ablauf)')}
   <h3>Events</h3>
   ${sel('dv-ev',evs,window.__evForce||'')}
   ${b('dv-evgo','Event-Minispiel/Vegas öffnen')}
   ${b('dv-evskin','Alle Event-Skins freischalten')}
   <h3>Lauf</h3>
   ${sel('dv-cls',CLSK.map(k=>[k,CLASSES[k].name]),save.cls||'krieger')}
   <label>Start-Etage <input id="dv-depth" type="number" min="1" max="200" value="${DEVBUILD&&window.__devDepth||1}" style="width:80px;padding:6px;border-radius:8px;background:var(--ink3);color:var(--text)"></label>
   ${sel('dv-goal',goals,window.__goalForce||'')}
   <div class="row-set"><div>Verstärkungen wie im Lauf<small>Pro übersprungener Etage eine zufällige Verstärkung, dazu Zonenwürfel und Münzen.</small></div><button class="sw on" role="switch" id="dv-auto"></button></div>
   <div class="row-set"><div>Etagen fluten (Schwimm-Etagen)</div><button class="sw" role="switch" id="dv-flood"></button></div>
   <div class="row-set"><div>Unverwundbar</div><button class="sw" role="switch" id="dv-god"></button></div>
   ${b('dv-run','Lauf mit diesen Einstellungen starten','gold')}
   ${b('dv-login','Login-Bonus und Tageslauf zurücksetzen')}`;
  const on=(id,fn)=>{const e=$('#'+id);if(e)e.addEventListener('click',()=>{sfx('click');fn();});};
  const god=$('#dv-god');god.classList.toggle('on',!!window.__god);god.setAttribute('aria-checked',!!window.__god);
  on('dv-auto',()=>{$('#dv-auto').classList.toggle('on');});
  {const f=$('#dv-flood');f.classList.toggle('on',!!window.__floodForce);}
  on('dv-flood',()=>{window.__floodForce=!window.__floodForce;$('#dv-flood').classList.toggle('on',!!window.__floodForce);});
  on('dv-god',()=>{window.__god=!window.__god;$('#dv-god').classList.toggle('on',!!window.__god);});
  on('dv-gs1',()=>{addGS(1000);devOpen();});on('dv-gs2',()=>{addGS(1000000);devOpen();});
  on('dv-max',()=>{
    for(const m of META)save.meta[m.id]=m.cost.length;
    save.bestDepth=Math.max(save.bestDepth||0,100);save.best=Math.max(save.best||0,999999);save.won=true;save.endless=true;
    if(!save.cbd)save.cbd={};for(const c of CLSK)save.cbd[c]=100;
    if(typeof save.asc!=='object'||!save.asc)save.asc={};for(const d of DIFFK)save.asc[d]=5;
    for(const k of Object.keys(MT))if(!MT[k].npc&&!MT[k].decoy)save.dex[k]={s:1,k:5};
    for(const a of ACH)if(!save.ach[a.id])save.ach[a.id]=Date.now();
    if(!save.evs)save.evs={};for(const k of Object.keys(EVSK))save.evs[k]=true;
    save.mr={xp:9999999,got:{}};save.gs=Math.max(save.gs||0,999999);persist();toast('Alles auf Max');devOpen();
  });
  on('dv-new',()=>{if(!confirm('Speicher wirklich löschen?'))return;try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();});
  on('dv-evskin',()=>{if(!save.evs)save.evs={};for(const k of Object.keys(EVSK))save.evs[k]=true;persist();toast('Event-Skins frei');});
  const evSel=$('#dv-ev');evSel.addEventListener('change',()=>{window.__evForce=evSel.value;document.documentElement.dataset.evk='_';updateStats();});
  on('dv-evgo',()=>{const e=activeEvent();closeModal('m-dev');if(!e)return toast('Kein Event aktiv');if(e==='vegas')openVegas();else openMini(e);});
  $('#dv-cls').addEventListener('change',()=>{save.cls=$('#dv-cls').value;persist();});
  const gl=$('#dv-goal');gl.addEventListener('change',()=>{window.__goalForce=gl.value;});
  on('dv-run',()=>{
    window.__devDepth=Math.max(1,+$('#dv-depth').value||1);window.__devAuto=$('#dv-auto').classList.contains('on');
    closeModal('m-dev');G=null;startGame();G.depth=window.__devDepth;if(window.__god)G.god=true;
    if(G.depth>1&&window.__devAuto)devAutoPicks(G.depth);
    if(G.depth>1)startLevel();
  });
  on('dv-login',()=>{save.login={last:'',streak:0,claimed:''};save.daily={day:'',best:0,done:false,streak:0,last:''};save.adDay='';persist();toast('Zurückgesetzt');updateStats();});
  openModal('m-dev');
}
if(DEVBUILD){
  const db=document.createElement('button');db.textContent='DEV';db.id='b-dev';
  db.style.cssText='position:fixed;left:8px;top:calc(8px + var(--sa-top));z-index:400;padding:6px 12px;border-radius:99px;background:#c8302d;color:#fff;font-weight:800;border:2px solid #fff;font-size:.8rem;opacity:.9';
  db.addEventListener('click',devOpen);document.body.appendChild(db);
}

