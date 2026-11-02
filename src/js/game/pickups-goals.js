/* src/js/game/pickups-goals.js
   Einsammeln, Etagenziele (Schlüssel, Schalter, Runen, Aufräumen, Elite, Überleben) und Opferaltar. */
function pickup(it,t){
  if(it==='coin')flyTo(t,'s-coin',document.querySelector('#chips .coin'));else if(it==='heart')flyTo(t,'s-heart',$('#hearts'));
  if(typeof it==='string'&&(it.startsWith('p_')||it==='chest'))markEx('finds',it);pickFx(t,it);
  if(it==='heart'){G.psn=0;const per0=Math.max(DF().heart>0?1:0,DF().heart+(evOn('valentine')&&DF().heart>0?1:0)-(abyssN()>=3?1:0)),per=G.heartHalf&&per0>1?Math.ceil(per0/2):per0,h=Math.min(per>0?per+(G.spare?1:0):0,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Voll','green');}
  else if(it==='coin'){
    questEvent('coins',1);G.coins=(G.coins||0)+1;const v=15+G.gold*10,mo=Math.round((5+G.gold*2)*(G.pearl?2:1)*(evOn('birthday')?2:1)*(G.goldMul||1)*DF().money*(1+.1*metaMul('greed')));G.score+=v;G.money+=mo;sfx('coin');floatText(t,'+'+mo,'gold');
    if(G.gold&&G.coins%4===0&&G.hp<G.maxhp){G.hp++;floatText(G.pos,'+1','green');}
  }
  else if(it==='key'){G.hasKey=true;sfx('key');floatText(t,'Schlüssel','gold');setMsg('Schlüssel gefunden. Die Treppe ist jetzt offen.');}
  else if(it==='air'){G.air=G.airMax;sfx('bubble');floatText(t,'Luft','blue');burst(t,'#cfeaff',8);}
  else if(it==='sw'){G.sw=(G.sw||0)+1;sfx('key');floatText(t,'Schalter '+G.sw+'/'+G.swNeed,'gold');
    if(G.sw>=G.swNeed){G.hasKey=true;setMsg('Alle Schalter gedrückt. Die Treppe ist offen.');shake();}
    else setMsg('Schalter '+G.sw+' von '+G.swNeed+'. Such die nächste Seite.');}
  else if(it==='bomb'){
    if(G.cls==='zauberer'){G.mana=Math.min(G.manaMax,G.mana+2);sfx('bombget');floatText(t,'+2 Mana','blue');}
    else if(G.cls==='alchemist'){alchGain({type:'slime',pos:t});}
    else if(G.noAmmo){const n=Math.round(8*(G.goldMul||1));G.money+=n;sfx('coin');floatText(t,'+'+n,'gold');}
    else{G.bombs++;sfx('bombget');floatText(t,AMMO[kindOf(G.depth)].name,'gold');}
  }
  else if(typeof it==='string'&&it.startsWith('e_'))evPickup(it,t);
  else if(it==='p_skarab'){G.shield+=2;sfx('block');floatText(t,'Skarabäus','blue');}
  else if(it==='p_ankh'){const h=Math.min(4,G.maxhp-G.hp);G.hp+=h;sfx('heart');floatText(t,h?'+'+h:'Voll','green');}
  else if(it==='p_zahnrad'){G.freeKills+=2;sfx('key');floatText(t,'Zahnrad','gold');}
  else if(it==='p_oel'){G.freeSteps+=6;sfx('coin');floatText(t,'Geölt','blue');}
  else if(it==='p_perle'){const h=Math.min(2,G.maxhp-G.hp);G.hp+=h;G.money+=20;sfx('heart');floatText(t,'+20','gold');}
  else if(it==='p_muschel'){G.shell+=3;sfx('block');floatText(t,'Muschel','blue');}
  else if(it==='p_windfeder'){G.freeSteps+=4;G.hp=Math.min(G.maxhp,G.hp+1);sfx('coin');floatText(t,'Windfeder','blue');}
  else if(it==='p_wirbel'){sfx('boom');floatText(t,'Wirbelwind','blue');const dd=bfs(G.pos,null);for(const m of G.mons.slice())if((dd.get(m.pos)||99)<=3)knock(m,2);}
  else if(it==='p_barren'){G.score+=50;G.money+=50;sfx('coin');floatText(t,'+50','gold');}
  else if(it==='p_kleeblatt'){G.lucky+=4;sfx('key');floatText(t,'Glück','green');}
  else if(it==='chest')openChest(t);
  else if(it==='p_beere'){const h=Math.min(2,G.maxhp-G.hp);G.hp+=h;G.shield++;sfx('heart');floatText(t,'Moorbeere','green');}
  else if(it==='p_pilz'){G.freeSteps+=5;sfx('coin');floatText(t,'Flink','blue');}
  else if(it==='p_kristall'){for(const m of G.mons)m.stun=MT[m.type].boss?1:2;sfx('block');floatText(t,'Eiskristall','blue');}
  else if(it==='p_schneeherz'){G.maxhp++;G.hp=Math.min(G.maxhp,G.hp+3);sfx('heart');floatText(t,'+1 Leben','green');}
  else if(it==='p_glutkern'){G.rage+=3;sfx('key');floatText(t,'Glut','gold');}
  else if(it==='p_feder'){G.undos++;sfx('key');floatText(t,'Zurück +1','blue');}
  else if(it==='p_splitter'){G.score+=100;G.money+=25;sfx('coin');floatText(t,'+100','gold');}
  else if(it==='p_mantel'){G.cloak+=2;sfx('aim');floatText(t,'Unsichtbar','blue');}
}
const GOAL_HINT={
  switch:L=>'Ziel: Drücke alle '+L.swNeed+' Schalter, sie liegen auf verschiedenen Seiten. ',
  altar:()=>'Ziel: Bring am Altar ein Opfer, dann öffnet sich die Treppe. ',
  runes:L=>'Ziel: Berühre die Runen in der Reihenfolge ihrer Zahlen. Sie liegen auf verschiedenen Seiten. ',
  clear:()=>'Ziel: Besiege alle Gegner, dann öffnet sich die Treppe. ',
  elite:()=>'Ziel: Ein Anführer mit goldenem Ring versperrt den Weg. Besiege ihn. ',
  survive:L=>'Ziel: Halte '+L.swNeed+' Züge durch, es kommen immer wieder Gegner nach. '
};
function goalOpen(msg){G.hasKey=true;sfx('key');shake();setMsg(msg);}
const realMon=m=>{const T=MT[m.type];return !T.npc&&!T.decoy&&!T.flee&&!m.carry;};
function goalCheck(){
  if(!G||G.over||G.hasKey)return;
  if(G.goal==='clear'&&!G.mons.some(realMon))goalOpen('Alle Gegner besiegt. Die Treppe ist offen.');
}
function airTick(){
  if(!G||!G.flood||G.over)return;
  const tr=terrOf(G.pos);
  if(tr&&tr.k==='water'){
    G.air=Math.max(0,G.air-1);
    if(G.air<=0){floatText(G.pos,'Ertrinken','red');sfx('hit');hurtPlayer(1,null);}
    else if(G.air<=3)floatText(G.pos,'Luft '+G.air,'blue');
  }else G.air=G.airMax;
}
function goalTick(){
  if(!G||G.over||G.hasKey||!G.goal)return;
  G.sv=(G.sv||0)+1;
  if(G.goal==='survive'){
    if(G.sv>=G.swNeed){goalOpen('Du hast durchgehalten. Die Treppe ist offen.');return;}
    if(G.sv%4===0)reinforce();
  }else if(G.goal==='clear'&&G.sv>=80)goalOpen('Die Gegner weichen zurück. Die Treppe ist offen.');
  else goalCheck();
}
function reinforce(){
  const z=zoneOf(G.depth),pos=posOf(G.depth),dm=bfs(G.pos,G.walls);
  const cells=shuffle([...dm.keys()].filter(c=>dm.get(c)>=4&&!monAt(c)&&!G.walls.has(c)&&!G.spikes.has(c)&&c!==G.exit&&c!==G.pos));
  if(!cells.length)return;
  const nm=mkMon(pickType(z,pos,[]),cells[0],{mcd:1});G.mons.push(nm);settle(nm);burst(cells[0],MT[nm.type].col,8);sfx('summon');floatText(cells[0],'!','red');
}
function runeTouch(t,it){
  const n=+it.slice(2);
  if(n<=G.rn)return;
  if(n===G.rn+1){G.rn++;sfx('key');floatText(t,'Rune '+n+'/'+G.swNeed,'gold');
    if(G.rn>=G.swNeed)goalOpen('Alle Runen leuchten. Die Treppe ist offen.');else setMsg('Rune '+n+' leuchtet. Weiter mit der nächsten Zahl.');}
  else{G.rn=0;sfx('block');floatText(t,'Falsche Reihenfolge','red');setMsg('Falsche Reihenfolge. Die Runen erlöschen, fang bei 1 an.');}
}
function altarCost(){return Math.round((20+G.depth*4)*DF().price);}
function openAltar(t){
  if(!G||G.over||G.hasKey||G.items.get(t)!=='altar'||anyModal())return;
  const cost=altarCost(),box=$('#altar-list');box.innerHTML='';
  const opts=[
    {n:'Herz opfern',d:'Du verlierst ein Herz.',ok:G.hp>=2,why:'Zu wenig Leben',run(){G.hp--;floatText(G.pos,'-1','red');}},
    {n:'Münzen opfern',d:'Preis: '+cost,ok:G.money>=cost,why:'Zu wenig Münzen',run(){G.money-=cost;floatText(G.pos,'-'+cost,'gold');}},
    {n:'Kampf wagen',d:'Gegner erscheinen um dich.',ok:true,run(){altarFight();}}
  ];
  for(const o of opts){
    const b=document.createElement('button');b.className='card'+(o.ok?'':' off');b.disabled=!o.ok;
    b.innerHTML=`<div class="cmain"><b>${o.n}</b><span>${o.ok?o.d:o.why}</span></div>`;
    b.addEventListener('click',()=>{
      closeModal('m-altar');
      G.items.delete(t);o.run();G.hasKey=true;sfx('boss');shake();flash();
      setMsg('Der Altar nimmt dein Opfer. Die Treppe ist offen.');render();
    });
    box.appendChild(b);
  }
  openModal('m-altar');
}
function altarFight(){
  const z=zoneOf(G.depth),pos=posOf(G.depth),dm=bfs(G.pos,G.walls);
  const cells=shuffle([...dm.keys()].filter(c=>{const d=dm.get(c);return d>=2&&d<=4&&!monAt(c)&&!G.walls.has(c)&&!G.spikes.has(c)&&c!==G.exit&&c!==G.pos;}));
  const n=3+(z>>1);
  for(const c of cells.slice(0,n)){const nm=mkMon(pickType(z,pos,[]),c,{mcd:1});G.mons.push(nm);settle(nm);burst(c,MT[nm.type].col,8);}
  sfx('summon');floatText(G.pos,'Kampf!','red');
}
