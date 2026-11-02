/* src/js/game/oasis-chests.js
   Oase mit wanderndem Händler und Truhen. */
let oasis=null;
function openOasisShop(){
  const pr=b=>Math.max(8,Math.round(b*depthPrice()*DF().price));
  const A=AMMO[kindOf(G.depth)];
  oasis={free:[],wares:[]};
  if(!G.noAmmo)oasis.wares.push({ico:A.ico,t:A.name+' ×2',d:A.desc+'.',p:pr(22),fn(){G.bombs+=2;}});
  if(G.cls==='zauberer')oasis.wares.push({ico:'p_kristall',t:'Manatrank',d:'Füllt 4 Mana auf.',p:pr(26),fn(){G.mana=Math.min(G.manaMax,G.mana+4);}});
  oasis.wares.push({ico:'potion',t:'Heiltrank',d:'Heilt 4 Leben.',p:pr(30),fn(){G.hp=Math.min(G.maxhp,G.hp+4);}});
  oasis.wares.push({ico:'s-shield',t:'Schild',d:'Blockt den nächsten Treffer.',p:pr(35),fn(){G.shield++;}});
  sfx('coin');renderOasis();openModal('m-oasis');
}
function renderOasis(){
  $('#oa-sub').innerHTML=`<span class="mhead">${spr('wanderer')}<span><span class="mm">${spr('i_coin')}<b>${G.money}</b></span><small>Der Händler wandert durch die Gruft und rastet hier.</small></span></span>`;
  const box=$('#oa-wares');box.innerHTML='';
  for(const it of oasis.wares){
    const b=document.createElement('button');b.className='card';
    const ok=G.money>=it.p;b.disabled=!ok;if(!ok)b.classList.add('off');
    b.innerHTML=`${spr(it.ico)}<div class="cmain"><b>${it.t}</b><span>${it.d}</span></div><div class="price">${spr('i_coin')}<b>${it.p}</b></div>`;
    b.addEventListener('click',()=>{if(G.money<it.p)return;G.money-=it.p;it.fn();sfx('card');floatText(G.pos,it.t,'green');oasis.wares.splice(oasis.wares.indexOf(it),1);renderOasis();render();});
    box.appendChild(b);
  }
  if(!oasis.wares.length){const p=document.createElement('p');p.textContent='Der Händler ist ausverkauft.';box.appendChild(p);}
}
function genOasis(){
  const start=idx(2,2,0),exit=idx(2,2,4),mer=idx(1,1,0);
  const walls=new Set(),terrain=new Map(),items=new Map();
  const fixed=new Set([start,exit,mer]);
  const reach=()=>{const d=bfs(start,walls);return d;};
  const dist0=bfs(start,null);
  // Teiche
  const seeds=shuffle(SHELL.filter(c=>!fixed.has(c)&&(dist0.get(c)||0)>=3)).slice(0,3);
  for(const c of seeds){
    const cl=[c];while(cl.length<3+rnd(2)){const fr=shuffle(cl.flatMap(x=>NB[x]).filter(x=>!cl.includes(x)&&!fixed.has(x)&&!terrain.has(x)));if(!fr.length)break;cl.push(fr[0]);}
    for(const x of cl)terrain.set(x,{k:'water',d:-1});
  }
  // Palmen
  for(const c of shuffle(SHELL.filter(c=>!fixed.has(c)&&!terrain.has(c)&&NB[start].indexOf(c)<0)).slice(0,30)){
    if(walls.size>=15)break;
    walls.add(c);
    const d=reach();
    if(d.get(exit)===undefined||d.get(mer)===undefined)walls.delete(c);
  }
  const d=reach();
  const free=()=>shuffle(SHELL.filter(c=>!fixed.has(c)&&!walls.has(c)&&!terrain.has(c)&&!items.has(c)&&d.get(c)!==undefined&&d.get(c)>=2));
  for(const c of free().slice(0,3))items.set(c,'heart');
  for(const c of free().slice(0,8))items.set(c,'coin');
  const wm=mkMon('wanderer',mer,{});
  return {start,exit,walls,terrain,items,mons:[wm]};
}
function rebuildScene(){
  for(const [,el] of entEls)el.remove();
  entEls.clear();
  view=findViewFor(G.pos,FACES.F);
  pending=null;walking=false;walkCancel=false;G.path=null;
  setViewNow(view);
  appearBoard();spawnEnts();applyTheme();
}
function enterOasis(chest){
  if(G.inOasis)return;
  noteState('oase');
  G.stash={seen:G.seen,terrain:G.terrain,fields:G.fields,walls:G.walls,spikes:G.spikes,items:G.items,exit:G.exit,keyNeeded:G.keyNeeded,hasKey:G.hasKey,mons:G.mons,boss:G.boss,picks:G.picks,shield:G.shield,freeKills:G.freeKills,pos:G.pos};
  const L=genOasis();
  Object.assign(G,{seen:[],inOasis:true,terrain:L.terrain,fields:[],aiming:false,walls:L.walls,spikes:new Set(),items:L.items,exit:L.exit,keyNeeded:false,hasKey:false,mons:L.mons,pos:L.start,boss:false,last:null,drinks:0});
  rebuildScene();
  sfx('heart');banner('Oase','Ein stiller Ort in der Gruft');
  setMsg('Eine Oase! Sammle Herzen und Münzen, trink aus den Teichen und sprich mit dem Händler (tippe ihn an). Die Treppe führt zurück.');
}
function leaveOasis(){
  const S=G.stash;if(!G.inOasis||!S)return;
  Object.assign(G,{seen:S.seen||[],inOasis:false,stash:null,terrain:S.terrain,fields:S.fields,walls:S.walls,spikes:S.spikes,items:S.items,exit:S.exit,keyNeeded:S.keyNeeded,hasKey:S.hasKey,mons:S.mons,boss:S.boss,picks:S.picks,shield:S.shield,freeKills:S.freeKills,pos:S.pos,aiming:false,last:null,busy:false});
  rebuildScene();
  sfx('stairs');banner('Etage '+G.depth,'Zurück in der Gruft');setMsg('Zurück in der Gruft. Die Oase ist verschwunden.');
  release();
}
$('#boss-go').addEventListener('click',()=>{sfx('click');closeModal('m-bossinfo');});
$('#oa-go').addEventListener('click',()=>{sfx('click');closeModal('m-oasis');oasis=null;if(G&&!G.over)render();});
function openChest(t){
  sfx('chest');
  if(Math.random()<.07&&!G.inOasis){enterOasis(t);return;}
  const free=shuffle(NB[t].filter(n=>n!==G.pos&&!monAt(n)&&!G.walls.has(n)&&!G.spikes.has(n)));
  const r=Math.random();
  if(r<.4){const n=25+rnd(26);G.money+=n;G.score+=n;floatText(t,'+'+n,'gold');setMsg('Die Truhe war voller Münzen.');}
  else if(r<.62){const k=pick(['heart','bomb','p_barren']);setMsg('Die Truhe birgt einen Fund.');pickup(k,t);}
  else if(r<.84&&free.length){
    {const nm=mkMon(BYNAME['Goldgoblin'],free[0],{mcd:1});G.mons.push(nm);settle(nm);}burst(free[0],'#a8743a',10);
    setMsg('Ein Goblin springt aus der Truhe und rennt los! Jage ihn.');floatText(free[0],'!','red');
  }else if(free.length){
    {const nm=mkMon(BYNAME['Mimik'],free[0],{mcd:1});G.mons.push(nm);settle(nm);}burst(free[0],'#8a5a2a',10);
    setMsg('Die Truhe war eine Mimik!');floatText(free[0],'!','red');sfx('aim');
  }else{G.money+=30;floatText(t,'+30','gold');}
}
