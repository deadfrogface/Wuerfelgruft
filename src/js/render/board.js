/* src/js/render/board.js
   Spielfeld zeichnen: Zellen, Gegner, Held und Anzeige. */
/* ================= Rendern ================= */
function buildGrid(){
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){
    const el=document.createElement('div');
    el.className='cell '+((r+c)%2?'b':'a');
    grid.appendChild(el);cellEls.push(el);
  }
  for(const d of ['up','down','left','right']){
    const b=document.createElement('button');b.className='edge '+d;b.dataset.d=d;b.setAttribute('aria-label','Über die Kante');
    frame.appendChild(b);edgeEls[d]=b;
    const ch=document.createElement('div');ch.className='fchip '+d;frame.appendChild(ch);chipEls[d]=ch;
  }
}
const NETPOS={U:[1,0],L:[0,1],F:[1,1],R:[2,1],B:[3,1],D:[1,2]};
const netFaces=[];
function buildNet(){
  const net=$('#net');
  for(const k of Object.keys(NETPOS)){
    const f=document.createElement('div');f.className='nf';f.dataset.f=k;
    f.style.gridColumn=NETPOS[k][0]+1;f.style.gridRow=NETPOS[k][1]+1;
    f.dataset.l=(LANG==='en'?{F:'F',B:'B',L:'L',R:'R',U:'T',D:'D'}:{F:'V',B:'H',L:'L',R:'R',U:'O',D:'U'})[k];
    const cells=[];
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){const i=document.createElement('i');f.appendChild(i);cells.push(cellAt(FACES[k],c,r));}
    net.appendChild(f);netFaces.push({k,el:f,cells,tiles:Array.from(f.children)});
  }
}
function dangerSet(){
  const s=new Set();
  for(const m of G.mons){
    const T=MT[m.type];
    if(T.shoot)lineWalk(m.pos,i=>{s.add(i);return false;},T.rng||4);
    if(T.lob&&m.aim&&m.tg!==undefined){for(const c of m.ar||[m.tg])s.add(c);}
    if(T.steam&&m.sa){for(const [c,d] of bfs(m.pos,null))if(d<=2)s.add(c);}
    if(m.bt)for(const c of m.bt.cells)s.add(c);
    if(m.bk)for(const c of m.bk.cells)s.add(c);
    if(T.venom&&m.face>=0)s.add(m.face);
  }
  for(const e of G.limbo||[])if(e.kind==='burrow'&&e.cell!==undefined)s.add(e.cell);
  for(const f of G.fields||[])if(f.kind==='fire'||f.kind==='cloud')for(const c of f.cells)s.add(c);
  return s;
}
const itemSpr=it=>it==='bomb'?AMMO[kindOf(G.depth)].ico:(typeof it==='string'&&/^rn\d$/.test(it))?((+it.slice(2))<=(G.rn||0)?'rl':'rn')+it.slice(2):it;
function renderBoard(){
  const danger=dangerSet();
  const locked=G.keyNeeded&&!G.hasKey;
  const fmap=new Map();for(const f of G.fields||[])for(const c of f.cells)fmap.set(c,f.kind);
  let aimSet=null;if(G.aiming){const dd=bfs(G.pos,null);aimSet=new Set();for(const [c,d] of dd)if(d<=AIM&&!G.walls.has(c)&&c!==G.pos)aimSet.add(c);}
  for(let k=0;k<25;k++){
    const col=k%5,row=Math.floor(k/5);
    const i=cellAt(view,col,row),el=cellEls[k];
    el.dataset.i=i;
    let html='';
    if(G.walls.has(i))html=spr('wall');
    else{
      const tr=terrOf(i);
      if(tr){const d=tdir(tr);let rot=-90;if(d>=0){const dv=DIRS[d];rot=Math.round(Math.atan2(-vdot(dv,view.u),vdot(dv,view.r))*180/Math.PI);}
        if(tr.k==='chute')ensureSpr('portal_gold');else if(tr.k==='rift')ensureSpr('portal_void');else ensureSpr('tr_'+tr.k);
        html+=`<i class="tr tr-${tr.k}" style="--rot:${rot}deg"></i>`;}
      if(G.spikes.has(i))html+=spr('spike');
      if(G.traps&&G.traps.includes(i))html+=spr('trap');
      if(i===G.exit)html+=spr('stairs')+(locked?spr('lock','lock'):'');
      const it=G.items.get(i);
      if(it)html+=spr(itemSpr(it),'item');
      if(fmap.has(i)){ensureSpr('fl_'+fmap.get(i));html+=`<i class="fld ${fmap.get(i)}"></i>`;}
    }
    if(el._h!==html){el.innerHTML=html;el._h=html;}
    const fv=(i*7+(i>>3))%4;
    if(el._fv!==fv){if(el._fv!==undefined)el.classList.remove('fl'+el._fv);el.classList.add('fl'+fv);el._fv=fv;}
    el.classList.toggle('danger',danger.has(i));
    el.classList.toggle('aimok',!!(aimSet&&aimSet.has(i)));
    el.classList.toggle('path',!!(G.path&&G.path.has(i)));
  }
}
function pulse(el,cls,ms){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),ms);}
function mkEnt(e){
  const el=document.createElement('div');
  const T=MT[e.type]||{};
  const AN=[['fast','twitch'],['charge','rock'],['tele','flicker'],['boom','glow'],['lob','juggle'],['summon','chant'],['heal','sway'],['thorny','bristle'],['diag','skitter'],['split','jiggle'],['rand','wobble'],['ghost','float'],['trail','crawl'],['turret','pulse'],['drain','pulse'],['shoot','pulse']];
  AN.push(['shock','glow'],['steam','pulse'],['sleep','breath'],['push','rock'],['slow','breath'],['armor','breath'],['regen','pulse'],['summon','chant']);
  const BF={human:'breath',blob:'jiggle',golem:'breath',beast:'wobble',wing:'float',wisp:'float',bug:'skitter',worm:'crawl',head:'pulse',plant:'sway'};
  const an=AN.find(a=>T[a[0]])||(e.type==='hero'?null:['',BF[T.body]||'breath']);
  el.className='ent '+e.type+(e.type==='hero'?' d-'+(G.diff||'normal'):' k-'+ZKIND[T.z||0]+(an?' an-'+an[1]:'')+(T.boss?' isboss':''));
  el.style.setProperty('--bd',(-Math.random()*1.6).toFixed(2)+'s');
  el.innerHTML=`<div class="fl"><div class="body">${spr(e.type==='hero'?heroId(G.diff,G.cls,skinOf(G.cls)):(e.skin||e.type))}</div></div><i class="bd"></i><b class="pips"></b>`;
  entLayer.appendChild(el);entEls.set(e.id,el);return el;
}
function renderEnts(){
  const pv=viewCoord(view,G.pos);
  const all=[{id:'hero',type:'hero',pos:G.pos},...G.mons];
  const seen=new Set();
  for(const e of all){
    seen.add(e.id);
    let el=entEls.get(e.id);const fresh=!el;
    if(!el)el=mkEnt(e);
    const vc=viewCoord(view,e.pos);
    if(!vc){el.classList.add('off');}
    else{
      const wasOff=fresh||el.classList.contains('off');
      const moved=!wasOff&&el._pos!==undefined&&el._pos!==e.pos;
      if(wasOff)el.style.transition='none';
      el.style.left=(vc.col*20)+'%';el.style.top=(vc.row*20)+'%';
      if(wasOff){void el.offsetWidth;el.style.transition='';}
      el.classList.remove('off');
      let fx=el._fx||1;
      if(e.type==='hero'){if(el._col!==undefined&&vc.col!==el._col)fx=vc.col>el._col?1:-1;}
      else if(pv&&pv.col!==vc.col)fx=pv.col>vc.col?1:-1;
      if(fx!==el._fx){el._fx=fx;el.style.setProperty('--fx',fx);}
      el._col=vc.col;
      if(moved){pulse(el,e.type==='hero'?'hop':'mv-'+(MT[e.type].body||'human'),230);if(e.type==='hero')puff(e.pos);}
    }
    el._pos=e.pos;
    if(e.type==='hero'){const au=(save.cos&&save.cos.aura)||'';if(el.dataset.aura!==au){el.dataset.aura=au;const A=VAULT.find(v=>v.id==='a_'+au);el.style.setProperty('--gl',A?A.gl:'0,0,0');el.style.setProperty('--ga',A?'.5':'0');}el.classList.toggle('shielded',G.shield>0);el.classList.toggle('stone',G.paralyzed>0&&!!G.stone);const wt=terrOf(e.pos);el.classList.toggle('swim',!!wt&&wt.k==='water');}
    else if(false){}
    else{
      el.classList.toggle('dormant',!!e.dormant);
      el.classList.toggle('elite',!!e.elite);
      el.classList.toggle('warded',MT[e.type].bm==='ward'&&G.mons.some(o=>o.owner===e.id));
      el.classList.toggle('inkhid',G.ink>0&&!(NB[G.pos].includes(e.pos)||ND[G.pos].has(e.pos)));
      el.classList.toggle('ready',!!MT[e.type].slow&&e.cd===0);
      el.classList.toggle('aim',!!(e.aim||e.sa||e.bt));
      el.classList.toggle('ph2',(e.ph||1)===2);el.classList.toggle('ph3',(e.ph||1)>=3);
      el.classList.toggle('asleep',!!(MT[e.type].sleep&&!e.awake));
      el.classList.toggle('carry',!!e.carry);
      const mx=e.mx||MT[e.type].hp;
      const pips=el.querySelector('.pips');
      const h=mx>1&&!MT[e.type].npc?e.hp:0;
      if(pips._h!==h){pips.innerHTML='<i></i>'.repeat(h);pips._h=h;}
    }
  }
  for(const [id,el] of Array.from(entEls)){
    if(!seen.has(id)){entEls.delete(id);el.classList.add('dying');setTimeout(()=>el.remove(),340);}
  }
}
function appearBoard(){
  const vc=viewCoord(view,G.pos);if(!vc)return;
  cellEls.forEach((el,k)=>{const d=Math.abs(k%5-vc.col)+Math.abs(Math.floor(k/5)-vc.row);el.style.setProperty('--ad',(d*32)+'ms');el.classList.add('appear');});
  setTimeout(()=>cellEls.forEach(el=>el.classList.remove('appear')),800);
}
function spawnEnts(){
  entEls.forEach(el=>{el.classList.add('spawn');el.style.setProperty('--sd',(200+Math.random()*350).toFixed(0)+'ms');setTimeout(()=>el.classList.remove('spawn'),1000);});
}
const EDGE_DEFS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function renderEdges(){
  const vc=G.over?null:viewCoord(view,G.pos);
  $('#b-me').classList.toggle('show',!G.over&&!vc);
  for(const d of Object.keys(EDGE_DEFS)){
    const el=edgeEls[d];let show=false;
    if(vc){
      const [dc,dr]=EDGE_DEFS[d];
      const nc=vc.col+dc,nr=vc.row+dr;
      if(nc<0||nc>4||nr<0||nr>4){
        const t=stepTarget(view,G.pos,dc,dr);
        const m=t>=0?monAt(t):null;
        if(t>=0&&(!G.walls.has(t)||m)){
          show=true;el.dataset.t=t;
          el.classList.toggle('mon',!!m);
          el.style.setProperty('--c',vc.col);el.style.setProperty('--r',vc.row);
          let occ='';
          if(m)occ=spr('s-'+m.type,'mini');
          else if(G.items.has(t))occ=spr(itemSpr(G.items.get(t)),'mini');
          else if(t===G.exit)occ=spr('s-stairs','mini');
          else if(G.spikes.has(t))occ=spr('s-spike','mini');
          const html=`<svg class="chev" viewBox="0 0 24 24"><use href="#s-chev"/></svg>${occ}`;
          if(el._h!==html){el.innerHTML=html;el._h=html;}
        }
      }
    }
    el.classList.toggle('show',show);
  }
}
const FNAME={F:'Vorne',B:'Hinten',L:'Links',R:'Rechts',U:'Oben',D:'Unten'};
const faceKeyOf=v=>Object.keys(FACES).find(k=>sameN(FACES[k],v));
function markSeen(){
  const S=G.seen||(G.seen=[]);
  const vk=faceKeyOf(view);if(vk&&!S.includes(vk))S.push(vk);
  for(const f of netFaces)if(f.cells.includes(G.pos)&&!S.includes(f.k))S.push(f.k);
}
const FLET=()=>LANG==='en'?{F:'F',B:'B',L:'L',R:'R',U:'T',D:'D'}:{F:'V',B:'H',L:'L',R:'R',U:'O',D:'U'};
function updateChips(){
  const F=FLET();
  for(const d of ['up','down','left','right']){
    const el=chipEls[d];if(!el)continue;
    const k=faceKeyOf(rotView(view,d)),L=F[k];
    const t=d==='right'?L+' ›':d==='left'?'‹ '+L:d==='up'?'˄ '+L:'˅ '+L;
    if(el._t!==t){el.textContent=t;el._t=t;}
  }
}
function showTurnCap(dir,nv){
  const k=faceKeyOf(nv);if(!k||reduceMotion)return;
  const arrow={right:'‹',left:'›',down:'˄',up:'˅'}[dir]||'';
  const el=document.createElement('div');el.className='turncap';el.textContent=(arrow?arrow+' ':'')+FNAME[k];
  frame.appendChild(el);setTimeout(()=>el.remove(),900);
}
function renderNet(){
  markSeen();updateChips();
  const st=new Map();
  for(const i of SHELL){
    if(G.walls.has(i))st.set(i,'w');
    else if(G.spikes.has(i))st.set(i,'s');
    else if(G.terrain&&G.terrain.has(i))st.set(i,'t');
  }
  st.set(G.exit,'x');
  for(const [i,k] of G.items)st.set(i,k==='key'?'k':k==='sw'?'w':k==='altar'?'a':k==='heart'?'h':k==='coin'?'c':k==='bomb'?'b':k==='chest'?'q':'f');
  st.set(G.pos,'p');
  const S=G.seen||[];
  for(const f of netFaces){
    f.el.classList.toggle('on',f.k&&sameN(FACES[f.k],view));
    const known=S.includes(f.k);f.el.classList.toggle('unk',!known);
    for(let k=0;k<25;k++){
      const cls=known||f.cells[k]===G.pos?(st.get(f.cells[k])||''):'';
      const t=f.tiles[k];
      if(t._c!==cls){t.className=cls;t._c=cls;}
    }
  }
}
function renderBossBar(){
  const bb=$('#bossbar');if(!bb)return;
  const b=G&&G.mons.find(x=>MT[x.type].boss);
  bb.hidden=!b;if(!b)return;
  $('#bb-fill').style.width=Math.max(0,b.hp/b.mx*100)+'%';
  bb.className='ph'+(b.ph||1);
}
function renderHUD(){
  renderBossBar();
  let h='';
  if(save.settings.num||G.maxhp>10)h=`<span class="hnum">${spr('s-heart')}<b>${G.hp}/${G.maxhp}</b></span>`;
  else for(let i=0;i<G.maxhp;i++)h+=spr('s-heart',i<G.hp?'':'empty');
  const hearts=$('#hearts');if(hearts._h!==h){hearts.innerHTML=h;hearts._h=h;}
  if(hearts._hp!==undefined&&G.hp<hearts._hp)pulse(hearts,'hbump',340);hearts._hp=G.hp;
  let c='';
  if(G.diff&&G.diff!=='normal')c+=`<span class="chip dtag d-${G.diff}">${DIFFS[G.diff].name}</span>`;
  if(G.flood)c+=`<span class="chip air${G.air<=3?' low':''}">${spr('air')}${G.air}</span>`;
  if(G.hasKey)c+=`<span class="chip">${spr('s-key')}</span>`;
  else if(G.goal==='switch')c+=`<span class="chip">${spr('sw')}${G.sw||0}/${G.swNeed}</span>`;
  else if(G.rush)c+=`<span class="chip">Rush ${G.depth/5}/20</span>`;
  else if(G.goal==='altar')c+=`<span class="chip">${spr('altar')}</span>`;
  else if(G.goal==='runes')c+=`<span class="chip">${spr('rl1')}${G.rn||0}/${G.swNeed}</span>`;
  else if(G.goal==='clear')c+=`<span class="chip">${spr('cl')}${G.mons.filter(realMon).length}</span>`;
  else if(G.goal==='elite')c+=`<span class="chip">${spr('el')}</span>`;
  else if(G.goal==='survive')c+=`<span class="chip">${spr('sv')}${Math.max(0,G.swNeed-(G.sv||0))}</span>`;
  c+=`<span class="chip coin">${spr('s-coin')}${G.money}</span>`;
  if(G.rage>0)c+=`<span class="chip">${spr('p_glutkern')}${G.rage}</span>`;
  if(G.freeSteps>0)c+=`<span class="chip">${spr('p_pilz')}${G.freeSteps}</span>`;
  if(G.cloak>0)c+=`<span class="chip">${spr('p_mantel')}${G.cloak}</span>`;
  if(G.cls==='alchemist')c+=`<span class="chip">${(G.ing||[]).map(x=>`<i class="ing ${x}"></i>`).join('')||'–'}</span>`;
  if(G.shield>0)c+=`<span class="chip">${spr('s-shield')}${G.shield}</span>`;
  if(G.psn>0)c+=`<span class="chip st-poison">Gift ${G.psn}</span>`;
  if(G.burn>0)c+=`<span class="chip st-burn">Brand ${G.burn}</span>`;
  const chips=$('#chips');if(chips._h!==c){chips.innerHTML=c;chips._h=c;}
  if(chips._m!==undefined&&G.money!==chips._m)pulse(chips.querySelector('.coin'),'pop',300);chips._m=G.money;
  {const fk=faceKeyOf(view);$('#depth').textContent='Etage '+G.depth+(fk?' · '+FNAME[fk]:'');}
  tweenScore();
  const A=AMMO[kindOf(G.depth)];
  const wz=G.cls==='zauberer',ac=ACT[G.cls],AI=ac?ac.ico:wz?'s-bolt':A.ico;
  $('#bombn').textContent=G.aiming?'Ziel wählen':ac?ac.n+' '+ac.cnt():wz?'Zauber '+G.mana+'/'+G.manaMax:A.name+' '+G.bombs;
  $('#b-bomb').classList.toggle('on',!!G.aiming);
  $('#b-bomb').hidden=!!G.noAmmo&&!wz&&!ac;
  const bi=$('#b-bomb .ph');if(bi&&bi._k!==AI){bi.innerHTML=spr(AI);bi._k=AI;}
  $('#b-bomb').disabled=ac?!ac.have():wz?G.mana<2:G.bombs<1;
  $('#b-undo').disabled=!(G.last&&G.undos>0);$('#undon').textContent='Zurück '+G.undos;
  let r='';
  for(const u of UPS){const n=G.ups[u.id]||0;if(n)r+=`<span class="relic" title="${u.name}">${spr(u.ico)}${n>1?'×'+n:''}</span>`;}
  if(G.dmg>1)r+=`<span class="relic" title="Schaden">${spr('s-blade')}${G.dmg}</span>`;
  const rel=$('#relics');if(rel._h!==r){rel.innerHTML=r;rel._h=r;}
}
function render(){
  if(!G)return;
  board.classList.toggle('ink',G.ink>0);
  if(DF().fixed){G.maxhp=1;if(G.hp>1)G.hp=1;}
  renderBoard();renderEnts();renderEdges();renderNet();renderHUD();
  const dA=bfs(G.pos,null);
  let md=99;for(const m of G.mons){const d=dA.get(m.pos);if(d!==undefined&&d<md)md=d;}
  AU.setIntensity(G.over?0:(G.hp<=2||md<=3)?2:1);
}
let tipEl=null,tipTimer=0;
function tip(id,text){
  if(!save.tips)save.tips={};if(save.tips[id]||!save.settings.tips)return false;
  if(anyModal())return false;
  save.tips[id]=1;persist();
  if(tipEl)tipEl.remove();
  const el=document.createElement('div');el.className='tip';el.innerHTML=text+'<small>Tippen zum Schließen</small>';
  el.addEventListener('click',()=>{el.remove();if(tipEl===el)tipEl=null;});
  ($('#app')||document.body).appendChild(el);tipEl=el;
  clearTimeout(tipTimer);tipTimer=setTimeout(()=>{if(tipEl===el){el.remove();tipEl=null;}},9000);
  return true;
}
function tipCheck(){
  if(G&&!G.daily&&G.turns>=2&&G.turns<=9){
    const ev=activeEvent();
    if(ev&&MINI_TXT[ev]&&tip('ev_'+ev,'<b>'+EVENTS[ev].name+'</b>: Auf dem Titelbildschirm wartet das Minispiel „'+MINI_TXT[ev].t+'“. Gewinne alle drei Runden für einen Skin.'))return;
    if(G.mut&&tip('mut_'+G.mut,'<b>Mutator '+MUTS[G.mut].name+'</b>: '+MUTS[G.mut].desc))return;
    if(G.asc&&tip('asc'+G.asc,'<b>Aufstiegsstufe '+G.asc+'</b>: '+ASC_TXT[G.asc]))return;
  }
  if(G&&!G.daily&&G.turns>=1&&G.turns<=14&&!G.hasKey){
    if(G.goal==='switch'&&tip('goal_sw','<b>Schalter-Etage</b>: Hier gibt es keinen Schlüssel. Drücke alle Schalter, indem du darüber läufst. Sie liegen auf verschiedenen Würfelseiten, die Zahl oben zeigt deinen Fortschritt.'))return;
    if(G.flood&&tip('flood','<b>Überflutete Etage</b>: Im Wasser gleitest du nach jedem Schritt ein Feld weiter. Deine Luft sinkt mit jedem Zug im Wasser, an Land füllt sie sich wieder. Luftblasen füllen sie sofort auf. Ohne Luft verlierst du jeden Zug ein Herz.'))return;
    if(G.goal==='runes'&&tip('goal_rn','<b>Runen-Etage</b>: Berühre die Runen der Reihe nach: 1, dann 2, dann 3. Sie liegen auf verschiedenen Seiten. Die falsche Rune löscht alle wieder, ohne dir zu schaden.'))return;
    if(G.goal==='clear'&&tip('goal_cl','<b>Räumung</b>: Hier gibt es keinen Schlüssel. Besiege alle Gegner, dann öffnet sich die Treppe. Die Zahl oben zeigt, wie viele noch übrig sind.'))return;
    if(G.goal==='elite'&&tip('goal_el','<b>Anführer</b>: Ein Gegner mit goldenem Ring ist zäher als die anderen. Besiege ihn, dann öffnet sich die Treppe. Die anderen musst du nicht erledigen.'))return;
    if(G.goal==='survive'&&tip('goal_sv','<b>Durchhalten</b>: Die Treppe öffnet sich, wenn die Zahl oben auf 0 sinkt. Jeder Zug zählt, auch Warten. Alle paar Züge kommt ein neuer Gegner.'))return;
    if(G.goal==='altar'&&tip('goal_alt','<b>Opferaltar</b>: Hier gibt es keinen Schlüssel. Such den Altar auf einer der Seiten und lauf darauf. Dort zahlst du ein Opfer: ein Herz, Münzen oder ein Kampf.'))return;
  }
  if(!G||G.daily||G.depth>12)return;
  const adj=G.mons.some(m=>!MT[m.type].npc&&(NB[G.pos].includes(m.pos)||ND[G.pos].has(m.pos)));
  if(G.turns===1&&tip('goal','Ziel: Schlüssel finden, dann die Treppe nehmen. Der Schlüssel liegt irgendwo auf dem Würfel – auch auf anderen Seiten.'))return;
  if(adj&&tip('atk','Ein Gegner ist neben dir. Läufst du auf ihn zu, greifst du an. Danach sind die Gegner dran.'))return;
  if(G.turns===4&&tip('rot','Würfel drehen: Tippe auf eine Seite im Netz unten, um dort hinzusehen. Das kostet einen Zug (auf Leicht nicht).'))return;
  if(G.cls==='zauberer'&&G.turns>=2&&tip('spell','Zauberer: Tippe auf einen Gegner, um einen Zauber zu wirken (2 Mana). Mana lädt sich alle zwei Züge auf. Leere Felder zielst du über „Zauber“ unten an.'))return;
  if(G.bombs>0&&!G.noAmmo&&G.turns>=6&&tip('throw','Du hast ein Wurf-Item. Tippe unten darauf und dann auf ein Zielfeld in Reichweite.'))return;
  if(G.hasKey&&G.depth<=3&&tip('stairs','Der Schlüssel ist da, die Treppe ist jetzt offen. Lauf hin, um die Etage zu beenden.'))return;
  if(G.spikes.size&&G.turns>=3&&G.depth<=3&&tip('spike','Stacheln verletzen dich, wenn du darauf trittst. Geh drumherum oder lock Gegner hinein.'))return;
  if(G.money>0&&G.depth<=3&&tip('coin','Münzen gibst du beim Händler aus, der nach jeder zehnten Etage wartet.'))return;
  if(G.turns>=2&&G.undos>0&&G.last&&G.depth<=3&&tip('undo','Falsch gezogen? Mit „Zurück“ nimmst du deinen letzten Zug zurück.'))return;
  if(G.hp<G.maxhp&&tip('hp','Verlierst du alle Herzen, endet der Lauf. Herzen liegen auf dem Boden, nach Bossen gibt es mehr.'))return;
}
function setMsg(t){$('#msg').textContent=t;}

function setViewNow(nv){
  view=nv;
  entEls.forEach(el=>{el._col=undefined;});
  board.classList.add('notrans');
  render();
  void board.offsetWidth;
  board.classList.remove('notrans');
}
async function flipView(nv,dir){
  if(sameView(nv,view))return;
  if(sameN(nv,view)){setViewNow(nv);return;}
  if(!dir)dir=['right','left','up','down'].find(d=>sameN(rotView(view,d),nv))||'right';
  flipping=true;sfx('flip');
  const axis=(dir==='left'||dir==='right')?'rotateY':'rotateX';
  const out=(dir==='right'||dir==='up')?-90:90;
  const dur=reduceMotion?1:150;
  if(!reduceMotion)frame.classList.add('turning');
  try{
    await board.animate([{transform:`translateZ(0) ${axis}(0deg) scale(1)`,opacity:1},{transform:`translateZ(-60px) ${axis}(${out}deg) scale(.9)`,opacity:.05}],{duration:dur,easing:'cubic-bezier(.5,0,.9,.6)',fill:'forwards'}).finished;
    setViewNow(nv);showTurnCap(dir,nv);
    await board.animate([{transform:`translateZ(-60px) ${axis}(${-out}deg) scale(.9)`,opacity:.05},{transform:`translateZ(0) ${axis}(0deg) scale(1)`,opacity:1}],{duration:dur*1.25,easing:'cubic-bezier(.1,.7,.3,1.15)',fill:'forwards'}).finished;
  }catch(e){setViewNow(nv);}
  if(board.getAnimations)board.getAnimations().forEach(a=>a.cancel());
  frame.classList.remove('turning');
  flipping=false;flush();
}

