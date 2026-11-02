/* src/js/game/shop.js
   Händler zwischen den Zonen. */
/* ================= Händler zwischen den Zonen ================= */
const DIE={wueste:{fav:3,name:'Wüstenwürfel',col:'#e8c870'},uhrwerk:{fav:4,name:'Uhrwerkwürfel',col:'#c98a4b'},tiefsee:{fav:2,name:'Tiefseewürfel',col:'#4aa0c8'},gruft:{fav:1,name:'Gruftwürfel',col:'#e9dfc8'},gold:{fav:6,name:'Goldwürfel',col:'#f4b942'},moor:{fav:2,name:'Moorwürfel',col:'#8bd450'},wind:{fav:5,name:'Windwürfel',col:'#cfe6ff'},eis:{fav:3,name:'Eiswürfel',col:'#8fd0e8'},glut:{fav:4,name:'Glutwürfel',col:'#ff8a5c'},leere:{fav:6,name:'Leerenwürfel',col:'#b890ff'}};
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=(n,col,cls='')=>`<div class="die ${cls}" style="--dc:${col||'#f4efe0'}">${[0,1,2,3,4,5,6,7,8].map(k=>`<i class="${PIPS[n].includes(k)?'on':''}"></i>`).join('')}</div>`;
const rollDie=kd=>{const f=DIE[kd].fav;if(Math.random()<.34)return f;const o=[1,2,3,4,5,6].filter(n=>n!==f);return o[Math.floor(Math.random()*5)];};
let shop=null;
const MAXROLLS=5;
const stakeOf=n=>Math.max(5,Math.round(12*n*(1+.3*(n-1))*(1+.012*G.depth)*Math.pow(1.5,shop?shop.rolls:0)*(1+.4*(shop?shop.heat||0:0))*DF().price*(1-.05*metaMul('rep'))));
function afterCard(){
  if(G.rush){G.depth+=5;G.money+=G.income*10;startLevel();return;}
  if(G.depth>=100&&G.depth%25===0&&G.legAt!==G.depth){G.legAt=G.depth;openLegend(afterCard);return;}
  if(G.depth%10===0){
    const kd=kindOf(G.depth);let nd=null;
    if(!G.dice.includes(kd)){G.dice.push(kd);nd=kd;if(G.dice.length>=10)award('dice10');}
    openShop(nd);return;
  }
  G.depth++;if(G.master)G.bombs++;G.bombs+=G.sack;G.money+=G.income*10;G.hp=Math.min(G.maxhp,G.hp+G.oasis);startLevel();
}
function shopItem(sid,price,num){
  const NA=AMMO[kindOf(G.depth+1)];
  let it=null;
  if(sid.startsWith('up:')){
    const u=UPS.find(x=>x.id===sid.slice(3));if(!u)return null;
    it={ico:u.ico,name:u.name,desc:u.desc,can:()=>u.can(),buy(){u.apply();G.ups[u.id]=(G.ups[u.id]||0)+1;}};
  }else if(sid==='potion')it={ico:'potion',name:'Heiltrank',desc:'Heilt 5 Leben.',can:()=>G.hp<G.maxhp,buy(){G.hp=Math.min(G.maxhp,G.hp+5);}};
  else if(sid==='ammo')it={ico:NA.ico,name:NA.name+' ×3',desc:'3 Stück: '+NA.desc+'.',can:()=>true,buy(){shop.newAmmo+=3;}};
  else if(sid==='heart')it={ico:'s-heart',name:'Stählernes Herz',desc:'+2 maximale Leben und heilt 2.',can:()=>G.maxhp<22&&!DF().fixed&&!G.noHpUp,buy(){G.maxhp+=2;G.hp=Math.min(G.maxhp,G.hp+2);}};
  if(!it)return null;
  it.sid=sid;it.price=price;it.num=num;return it;
}
function serializeShop(){
  return {conv:shop.conv,newAmmo:shop.newAmmo,rolls:shop.rolls,bought:shop.bought||0,heat:shop.heat||0,sel:[...shop.sel],res:shop.res,msg:shop.msg,newDie:shop.newDie,stock:shop.stock.map(i=>[i.sid,i.price,i.num])};
}
function restoreShop(d){
  return {conv:d.conv,newAmmo:d.newAmmo,rolls:d.rolls,bought:d.bought||0,heat:d.heat||0,sel:new Set(d.sel),res:d.res,msg:d.msg,newDie:d.newDie,busy:false,stock:d.stock.map(x=>shopItem(x[0],x[1],x[2])).filter(Boolean)};
}
function openShop(newDie){
  const nz=Math.min(ZONES.length-1,Math.floor(G.depth/10));
  shop={conv:G.bombs>0&&!G.noAmmo,newAmmo:0,stock:[],rolls:0,sel:new Set(),res:null,msg:'',newDie:newDie||null,busy:false};
  const buildStock=()=>{
    for(const u of shuffle(UPS.filter(u=>u.can()&&u.tier<=nz&&(!u.rare||Math.random()<u.rare))).slice(0,3))shop.stock.push(shopItem('up:'+u.id,60+u.tier*20+rnd(20),0));
    if(!DF().fixed)shop.stock.push(shopItem('potion',30,0));
    if(!G.noAmmo)shop.stock.push(shopItem('ammo',45,0));
    if(!DF().fixed&&!G.noHpUp)shop.stock.push(shopItem('heart',90,0));
    for(const it of shop.stock)it.num=1+rnd(6);
  };
  if(G.daily)withSeed(G.dday+':s'+G.depth,buildStock);else buildStock();
  renderShop();openModal('m-shop');sfx('key');
}
const depthPrice=()=>1+.065*G.depth;
const priceOf=it=>Math.max(5,Math.round(it.price*(1-.2*G.haggle)*DF().price*(1-.05*metaMul('rep'))*depthPrice()*(1+.3*(shop?shop.bought||0:0))));
function renderShop(){
  const nk=kindOf(G.depth+1),NA=AMMO[nk],OA=AMMO[kindOf(G.depth)];
  const nd=shop.newDie?` <b style="color:var(--gold)">Neu: ${DIE[shop.newDie].name}</b> (Glückszahl ${DIE[shop.newDie].fav}).`:'';
  $('#shop-sub').innerHTML=`<span class="mhead">${spr('wanderer')}<span><span class="mm">${spr('i_coin')}<b>${G.money}</b></span><small>Hier endet die Zone, die nächste beginnt mit neuen Gegnern.${nd}</small></span></span>`;
  const cv=$('#shop-conv');cv.innerHTML='';
  if(shop.conv){
    const n=G.bombs;
    const hd=document.createElement('p');hd.textContent=`Du trägst ${n} ${OA.name}. In der nächsten Zone sind sie wertlos. Tausche sie:`;cv.appendChild(hd);
    const mk=(ico,t,d,fn)=>{const b=document.createElement('button');b.className='card';b.innerHTML=`${spr(ico)}<div><b>${t}</b><span>${d}</span></div>`;b.addEventListener('click',()=>{sfx('card');fn();shop.conv=false;G.bombs=0;renderShop();});cv.appendChild(b);};
    mk('i_coin',`${n*10} Münzen`,'Für den Einkauf.',()=>{G.money+=n*10;});
    mk(NA.ico,`${n} ${NA.name}`,NA.desc+'.',()=>{shop.newAmmo+=n;});
  }
  const w=$('#shop-wares');w.innerHTML='';
  for(const it of shop.stock){
    const b=document.createElement('button');b.className='card';
    const pr=priceOf(it),ok=G.money>=pr&&it.can();
    b.disabled=!ok;if(!ok)b.classList.add('off');
    b.innerHTML=`${spr(it.ico)}<div class="cmain"><b>${it.name}<span class="numb" style="display:inline">Zahl ${it.num}</span></b><span>${it.desc}</span></div><div class="price">${spr('i_coin')}<b>${pr}</b></div>`;
    b.addEventListener('click',()=>{if(G.money<pr||!it.can())return;G.money-=pr;it.buy();sfx('card');shop.bought=(shop.bought||0)+1;shop.stock=shop.stock.filter(x=>x!==it);renderShop();});
    w.appendChild(b);
  }
  const gm=$('#shop-gamble');gm.innerHTML='';
  if(G.dice.length){
    const h=document.createElement('p');
    h.innerHTML=`<b style="color:var(--gold)">Glücksspiel:</b> Wähle Würfel und wirf. Jede Zahl, die eine Ware trägt, gewinnt sie gratis. Jeder Würfel ist gezinkt. Mehr Würfel und jeder weitere Wurf kosten mehr (höchstens 5 Würfe pro Händler). Ohne Treffer gibt es Trostpreise, Pasch und Jackpot, aber auch Pech.`;gm.appendChild(h);
    const row=document.createElement('div');row.className='dice-row';
    G.dice.forEach((kd,i)=>{
      const b=document.createElement('button');b.className='dbtn'+(shop.sel.has(i)?' sel':'');
      b.innerHTML=dieHTML(DIE[kd].fav,DIE[kd].col)+`<span>Glückszahl ${DIE[kd].fav}</span>`;
      b.addEventListener('click',()=>{if(shop.busy)return;sfx('click');if(shop.sel.has(i))shop.sel.delete(i);else shop.sel.add(i);renderShop();});
      row.appendChild(b);
    });
    gm.appendChild(row);
    const n=shop.sel.size,st=stakeOf(n);
    const rb=document.createElement('button');rb.className='btn big';rb.id='b-roll';
    const left=MAXROLLS-shop.rolls;
    rb.textContent=left<=0?'Der Händler will nicht mehr würfeln':n?`Würfeln (${n}) für ${st} Münzen`:'Würfel wählen';rb.disabled=!n||G.money<st||shop.busy||left<=0;
    rb.addEventListener('click',rollDice);gm.appendChild(rb);
    const rs=document.createElement('div');rs.className='dice-res';rs.id='dice-res';
    if(shop.res)rs.innerHTML=shop.res.map(r=>dieHTML(r.n,DIE[r.kd].col)).join('');
    gm.appendChild(rs);
    if(shop.msg){const m=document.createElement('p');m.innerHTML=shop.msg;gm.appendChild(m);}
  }
  $('#shop-go').disabled=shop.conv||shop.busy;
  if(!shop.busy&&G&&!G.over)saveRun();
}
async function rollDice(){
  if(!shop||shop.busy||shop.rolls>=MAXROLLS)return;
  const idx=[...shop.sel].filter(i=>G.dice[i]);const n=idx.length;if(!n)return;
  const st=stakeOf(n);if(G.money<st)return;
  G.money-=st;shop.rolls++;shop.busy=true;shop.msg='';sfx('card');
  const res=idx.map(i=>({kd:G.dice[i],n:rollDie(G.dice[i])}));
  renderShop();
  const box=$('#dice-res');
  const t0=Date.now();
  while(Date.now()-t0<800){
    box.innerHTML=res.map(r=>dieHTML(1+rnd(6),DIE[r.kd].col,'roll')).join('');
    sfx('dice');await new Promise(r=>setTimeout(r,110));
  }
  shop.res=res;
  const nums=res.map(r=>r.n);
  const nz=Math.min(ZONES.length-1,Math.floor(G.depth/10));
  const free=()=>{const pl=UPS.filter(u=>u.can()&&u.tier<=nz&&(!u.rare||Math.random()<u.rare));if(!pl.length)return null;const u=pick(pl);u.apply();G.ups[u.id]=(G.ups[u.id]||0)+1;return u.name;};
  const won=shop.stock.filter(it=>nums.includes(it.num));
  const names=[],extra=[];
  for(const it of won){if(it.can()){it.buy();names.push(it.name);}else{G.money+=Math.round(priceOf(it)/2);names.push(it.name+' (als Münzen)');}}
  shop.stock=shop.stock.filter(it=>!won.includes(it));
  shop.heat=(shop.heat||0)+won.length;
  // Würfe ohne Treffer: Trostpreise und Pech
  const have=new Set(won.map(w=>w.num));
  const miss=nums.filter(x=>!have.has(x));
  for(const x of miss){
    const r=Math.random();
    if(r<.30){const m=Math.max(3,Math.round(st/n*(.5+Math.random()*1.1)));G.money+=m;extra.push('Trostpreis +'+m);}
    else if(r<.48){if(G.hp<G.maxhp&&!DF().fixed){G.hp=Math.min(G.maxhp,G.hp+2);extra.push('Heiltrunk +2');}else{G.money+=6;extra.push('Trostpreis +6');}}
    else if(r<.62){shop.newAmmo+=1;extra.push('+1 Wurf-Item');}
    else if(r<.72){const u=free();if(u)extra.push('Geschenk: '+u);}
    else if(r<.88){extra.push('nichts');}
    else{const l=Math.max(5,Math.round(G.money*.1));G.money=Math.max(0,G.money-l);extra.push('Pech: −'+l+' Münzen');}
  }
  const cnt={};nums.forEach(x=>{cnt[x]=(cnt[x]||0)+1;});
  const mx=Math.max(...Object.values(cnt));
  if(mx>=3){const a=free(),b2=free();const j=Math.round(100*(1+G.depth/20));G.money+=j;extra.push('JACKPOT! '+[a,b2].filter(Boolean).join(' und ')+' +'+j+' Münzen');sfx('win');}
  else if(mx>=2){const u=free();if(u)extra.push('Pasch! Gratis: '+u);}
  shop.msg=(names.length?`Gewonnen: <b style="color:var(--gold)">${names.join(', ')}</b>. `:'')+(extra.length?extra.join(' · ')+'.':(names.length?'':'Nichts getroffen.'));
  questEvent('rolls',1);save.stats.rolls++;if(names.length)award('lucky');if(save.stats.rolls>=10)award('gambler');
  if(names.length)sfx('win');
  shop.busy=false;renderShop();
}
function leaveShop(){
  if(!shop||shop.conv)return;
  sfx('click');closeModal('m-shop');
  G.bombs=G.noAmmo?0:shop.newAmmo+1+(G.master?1:0)+G.sack;if(G.cls==='zauberer')G.mana=G.manaMax;shop=null;
  G.depth++;G.money+=G.income*10;G.hp=Math.min(G.maxhp,G.hp+G.oasis);startLevel();
}

