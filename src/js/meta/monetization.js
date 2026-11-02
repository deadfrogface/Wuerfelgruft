/* src/js/meta/monetization.js
   Unterstützen: Werbefrei, Unterstützer-Skin und freiwillige Belohnungs-Werbung. */
/* ================= Unterstützen: Werbefrei-Kauf und freiwillige Werbung =================
   Nur in der Android-App (Capacitor-Plugins AdMob und NativePurchases). Im Browser bleibt alles verborgen.
   Vor der Veröffentlichung: Test-IDs durch echte AdMob-IDs ersetzen und test:false setzen. */
const MONET={appId:'ca-app-pub-3940256099942544~3347511713',reward:'ca-app-pub-3940256099942544/5224354917',test:true,noads:'remove_ads',sup:'supporter',dailyGS:50};
const capPlug=n=>{try{const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return null;return (C.Plugins&&C.Plugins[n])||(C.registerPlugin?C.registerPlugin(n):null);}catch(e){return null;}};
const iapHas=k=>!!(save.iap&&save.iap[k]);
let monetPrices={},monetAdInit=false;
async function monetSync(){
  const NP=capPlug('NativePurchases');if(!NP)return;
  try{
    const ps=await NP.getPurchases({productType:'inapp'});
    const ids=(ps.purchases||[]).map(p=>p.productIdentifier);
    if(!save.iap)save.iap={};
    if(ids.includes(MONET.noads))save.iap.noads=true;
    if(ids.includes(MONET.sup)){save.iap.sup=true;if(!save.evs)save.evs={};save.evs.supporter=true;}
    persist();
  }catch(e){}
  try{const r=await NP.getProducts({productIdentifiers:[MONET.noads,MONET.sup],productType:'inapp'});for(const p of r.products||[])monetPrices[p.identifier]=p.priceString;}catch(e){}
}
async function monetBuy(id){
  const NP=capPlug('NativePurchases');if(!NP)return false;
  try{
    await NP.purchaseProduct({productIdentifier:id,productType:'inapp'});
    if(!save.iap)save.iap={};
    if(id===MONET.noads)save.iap.noads=true;
    if(id===MONET.sup){save.iap.sup=true;if(!save.evs)save.evs={};save.evs.supporter=true;}
    persist();sfx('win');toast('Danke für deine Unterstützung!');return true;
  }catch(e){toast('Kauf nicht abgeschlossen.');return false;}
}
async function monetReward(){
  if(iapHas('noads'))return true;
  const A=capPlug('AdMob');if(!A){toast('Keine Anzeige verfügbar.');return false;}
  try{
    if(!monetAdInit){
      await A.initialize({initializeForTesting:MONET.test});
      try{const ci=await A.requestConsentInfo();if(ci.isConsentFormAvailable&&ci.status==='REQUIRED')await A.showConsentForm();}catch(e){}
      monetAdInit=true;
    }
    let ok=false;
    const h=await A.addListener('onRewardedVideoAdReward',()=>{ok=true;});
    try{await A.prepareRewardVideoAd({adId:MONET.reward,isTesting:MONET.test});const it=await A.showRewardVideoAd();if(it)ok=true;}finally{try{h.remove();}catch(e){}}
    return ok;
  }catch(e){toast('Keine Anzeige verfügbar.');return false;}
}
function openSupport(){
  const box=$('#sup-list');box.innerHTML='';
  const card=(name,desc,btn,on,fn,done)=>{
    const b=document.createElement('button');b.className='card'+(done||!on?' off':'');b.disabled=done||!on;
    b.innerHTML=`<div class="cmain"><b>${name}</b><span>${desc}</span></div><div class="price max">${done?'✓':btn}</div>`;
    b.addEventListener('click',async()=>{sfx('click');await fn();openSupport();});box.appendChild(b);
  };
  const pr=id=>monetPrices[id]||(id===MONET.noads?'2,99 €':'4,99 €');
  card('Werbefrei','Alle Anzeigen aus. Belohnungen gibt es ohne Anschauen.',pr(MONET.noads),true,()=>monetBuy(MONET.noads),iapHas('noads'));
  card('Unterstützer','Die Goldkrone als Skin für alle Klassen. Ohne Spielvorteil.',pr(MONET.sup),true,()=>monetBuy(MONET.sup),iapHas('sup'));
  const today=dayKey(),got=save.adDay===today;
  card('Tägliche Belohnung','+'+MONET.dailyGS+' Gruftsteine, einmal am Tag'+(iapHas('noads')?'.':' (Anzeige ansehen).'),iapHas('noads')?'Abholen':'Ansehen',!got,async()=>{if(await monetReward()){save.adDay=today;addGS(MONET.dailyGS);updateStats();toast('+'+MONET.dailyGS+' Gruftsteine');}},got);
  openModal('m-support');
}
/* Nächstes Ziel für den Game-Over: kleine, greifbare Gründe für "noch ein Lauf" */
function nextGoals(){
  const gs=save.gs||0,out=[];
  if(G&&G.soulGain)out.push({ico:'i_gs',t:`<b>+${G.soulGain}</b> Seelen verdient. Gib sie in der Seelenschmiede aus.`});
  let best=null;
  for(const m of META){const lv=metaLv(m.id);if(lv>=m.cost.length)continue;const c=m.cost[lv];if(!best||c<best.c)best={m,c};}
  if(best){
    if(gs>=best.c)out.push({ico:'i_forge',t:`Du kannst dir jetzt <b>${best.m.name}</b> in der Schmiede leisten.`});
    else if(best.c-gs<=80)out.push({ico:'i_forge',t:`<b>${best.c-gs}</b> Gruftsteine bis <b>${best.m.name}</b>.`});
  }
  for(const k of CLSK){if(!clsOpen(k)){const d=CLASSES[k].need-(save.bestDepth||0);if(d<=15)out.push({ico:CLASSES[k].ico,t:`<b>${d}</b> Etagen bis zur Klasse <b>${CLASSES[k].name}</b>.`});break;}}
  if(G&&G.depth<(save.bestDepth||0))out.push({ico:'s-stairs',t:`Dein Rekord liegt bei Etage <b>${save.bestDepth}</b>. Diesmal: ${G.depth}.`});
  return out.slice(0,2);
}
function overAdButton(gain){
  const box=$('#over-ad');box.innerHTML='';
  if((capPlug('AdMob')||capPlug('NativePurchases'))&&!iapHas('noads')&&(save.runs||0)>=3&&(save.runs-(save.offerAt||0))>=4){
    save.offerAt=save.runs;persist();
    const o=document.createElement('button');o.className='btn ghost';o.style.margin='0 0 10px';o.textContent='Werbefrei & Unterstützen';o.addEventListener('click',()=>{sfx('click');closeModal('m-over');openSupport();});box.appendChild(o);
  }
  if(!capPlug('AdMob')&&!iapHas('noads')||!capPlug('NativePurchases')&&!capPlug('AdMob')||gain<=0||G.adBonus)return;
  const b=document.createElement('button');b.className='btn gold';b.style.margin='0 0 10px';
  b.textContent=(iapHas('noads')?'Bonus abholen':'Anzeige ansehen')+': +'+gain+' Gruftsteine';
  b.addEventListener('click',async()=>{b.disabled=true;if(await monetReward()){G.adBonus=1;addGS(gain);updateStats();toast('+'+gain+' Gruftsteine');b.remove();}else b.disabled=false;});
  box.appendChild(b);
}
