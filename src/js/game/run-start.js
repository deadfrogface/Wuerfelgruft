/* src/js/game/run-start.js
   Lauf starten (newRun). */
/* ================= Lauf starten ================= */
function newRun(resume,endless,daily){
  wrapUps();shop=null;
  const wk=daily==='week',dr=daily?(wk?weekRules()[0]:ruleOf()):0,dr2=wk?weekRules()[1]:undefined;
  const dk=daily?'normal':(save.diff||'normal');let D0=daily?makeDaily(dr,dr2):DIFFS[dk];
  G={depth:1,score:0,kills:0,turns:0,hp:5,maxhp:5,dmg:1,bombs:1,ups:{},shieldMax:0,shield:0,thorns:false,leech:false,spear:false,chase:0,money:0,rage:0,cloak:0,freeSteps:0,lucky:0,veil:false,curse:false,oasis:0,maprel:false,sandy:false,assassin:false,gears:false,rod:false,torch:false,spare:false,lens:false,chain:false,pearl:false,ink:false,harpoon:false,feast:false,volt:false,anchor:false,paralyzed:0,shell:0,gale:false,gustshield:false,tailwind:0,sack:0,shadow:false,fury:false,dice:[],loot:false,haggle:0,income:0,net:false,hunter:false,lockpicks:0,crit:0,armor:false,rest:0,sling:false,boots:false,wide:false,stun:false,splash:false,regen:0,dodge:0,gold:0,pickN:0,phoenix:false,phx:false,swift:0,frost:0,poison:false,soul:false,thorns2:false,exec:false,spark:false,fang:false,master:false,steps:0,coins:0,picks:0,hpb:0,freeKills:0,killCount:0,hasKey:false,over:false,won:false,busy:false,mons:[],walls:new Set(),spikes:new Set(),items:new Map(),exit:0,pos:0,keyNeeded:false,undoBonus:0,undos:1,last:null,boss:false,endless:!!endless,diff:dk,daily:!!daily,rule:dr,dday:dayKey(),bossKills:0,gsPaid:false};
  if(!daily&&!resume){G.asc=Math.min(ascOf(dk),save.ascSel||0);G.mut=save.won?(save.mut||''):'';D0=DF();}
  G.psn=0;G.burn=0;G.stone=0;G.cls='krieger';G.mana=0;G.manaMax=0;G.goldMul=1;
  if(daily){G.dailyD=D0;G.weekly=wk;G.rule2=dr2;if(wk)G.dday=weekKey()+'-W';}
  G.hp=G.maxhp=D0.hp;G.bombs=1+(D0.ammo||0);G.undoBonus=D0.undo||0;G.undos=D0.noUndo?0:1+G.undoBonus;
  if(!resume){
    if(daily){const R=DAILY_RULES[dr];if(R.start)R.start(G);if(wk&&DAILY_RULES[dr2].start)DAILY_RULES[dr2].start(G);}
    else{
      const M=save.meta;
      if(!D0.fixed){G.maxhp+=M.mhp||0;G.hp=G.maxhp;}
      G.bombs+=M.start||0;G.money+=(M.gold||0)*20;G.shieldMax+=M.shield||0;
      if(M.edge)G.dmg+=1;
      if(!D0.fixed){G.maxhp+=Math.min(5,Math.floor(soulLv('sh')/5));G.hp=G.maxhp;}
      G.shieldMax+=Math.min(3,Math.floor(soulLv('ss')/10));if(soulLv('sk')>=20)G.dmg+=1;if(soulLv('sk')>=40)G.dmg+=1;
      if(G.mut==='glass')G.dmg+=1;
      if(!D0.noUndo){G.undoBonus+=M.undo||0;G.undos=1+G.undoBonus;}
      if(M.dice)G.dice=['gruft'];
      if((save.early||0)>=2&&!D0.fixed){G.maxhp+=1;G.hp=G.maxhp;save.early=0;persist();setTimeout(()=>toast('Die Gruft ist gnädig: +1 Leben'),1100);}
      if(M.boots)G.boots=true;if(M.armor)G.armor=true;if(M.reach>=1)G.spear=true;if(M.reach>=2)G.sling=true;
      const ck=clsOpen(save.cls||'krieger')?(save.cls||'krieger'):'krieger';G.cls=ck;const C=CLASSES[ck];if(C.apply)C.apply(D0);
    }
  }
  let sh=null;
  if(resume&&save.run){Object.assign(G,JSON.parse(JSON.stringify(save.run)));sh=G.shop||null;delete G.shop;G.over=false;G.busy=false;if(G.daily)G.dailyD=makeDaily(G.rule,G.rule2);}
  startLevel();
  if(sh){shop=restoreShop(sh);renderShop();openModal('m-shop');}
}
let fpsChecked=false;
function checkFps(){
  if(fpsChecked||save.settings.liteAuto||!window.requestAnimationFrame)return;
  fpsChecked=true;let n=0;const t0=performance.now();
  const f=()=>{n++;const t=performance.now()-t0;if(t<2800)requestAnimationFrame(f);else{
    const fps=n/(t/1000);save.settings.liteAuto=true;
    if(fps<38&&!save.settings.lite){save.settings.lite=true;applySettings();toast('Sparmodus aktiviert (schwaches Gerät erkannt)');}
    persist();}};
  setTimeout(()=>requestAnimationFrame(f),1500);
}
function startLevel(){
  lookPos=-1;
  if(JUICE_OK())pulse($('#board'),'enter',480);
  checkFps();
  G.hpb=Math.max(0,zoneOf(G.depth)-(ZONES.length-1));
  if(G.depth%5===0)setTimeout(()=>sfx('boss'),500);
  const L=G.daily?withSeed(G.dday+':'+G.depth,()=>genLevel(G.depth)):genLevel(G.depth);
  G.freeSteps+=G.tailwind*2;
  if(G.frost)for(const m of L.mons)if(!MT[m.type].boss)m.stun=G.frost;
  if(G.timed){G.tlMax=timeFor(G.depth);G.tl=G.tlMax;tjShow();}
  if((G.cls==='jaeger'||G.cls==='dieb')&&G.bombs<3)G.bombs=3;
  Object.assign(G,{traps:[],seen:[],limbo:[],hist:[],temps:[],ink:0,inOasis:false,stash:null,lvlLoss:0,terrain:L.terrain||new Map(),fields:[],aiming:false,picks:G.pickN*2,walls:L.walls,spikes:L.spikes,items:L.items,exit:L.exit,keyNeeded:L.keyCell>=0||L.boss||['switch','altar','runes','clear','elite','survive'].includes(L.goal),rn:0,sv:0,goal:L.goal,swNeed:L.swNeed||0,sw:0,flood:!!L.flood,air:14,airMax:14,goals:((G.goals||[]).concat(L.goal)).slice(-3),hasKey:false,mons:L.mons,pos:L.start,shield:Math.min(G.shieldMax,4),freeKills:G.chase,busy:false,undos:DF().noUndo?0:1+G.undoBonus,last:null,boss:!!L.boss});
  for(const m of G.mons)if(MT[m.type].boss&&G.mons.some(o=>o!==m&&!MT[o.type].boss))m.dormant=true;
  for(const [,el] of entEls)el.remove();
  entEls.clear();
  view=findViewFor(G.pos,FACES.F);
  pending=null;walking=false;walkCancel=false;G.path=null;
  setViewNow(view);
  appearBoard();spawnEnts();
  const z=zoneOf(G.depth),zn=ZONES[Math.min(z,ZONES.length-1)];
  banner('Etage '+G.depth,L.boss?'Boss: '+MT[L.bossType].name:z===0?NAMES[(G.depth-1)%10]:z>=ZONES.length?'Endlose Tiefe':zn+' · '+posOf(G.depth));
  setMsg((L.flood?'Überflutet: Du gleitest im Wasser weiter, die Luft wird knapp. Sammle Luftblasen. ':'')+(GOAL_HINT[L.goal]?GOAL_HINT[L.goal](L):'')+hintFor(G.depth,L));
  $('#scr-game').classList.toggle('flood',!!L.flood);
  if(L.flood)setTimeout(()=>{banner('Überflutet','Schwimm und such die Luftblasen');sfx('bubble');},900);
  if(G.depth>100&&(G.depth-101)%25===0&&deepOn()){const A=ABYSS[Math.min(abyssN(),ABYSS.length)-1]||['Wahnsinn','Alles wird härter.'];setTimeout(()=>{banner('Abgrund: '+A[0],A[1]);sfx('boss');},1500);}
  if(L.boss&&!save.seenBoss&&!G.daily){save.seenBoss=true;persist();setTimeout(()=>openModal('m-bossinfo'),700);}
  if(G.depth===1&&!G.daily)setTimeout(()=>tip('move','Tippe auf ein Nachbarfeld, um zu laufen. Auch diagonal geht. Tippst du weiter weg, läufst du den Weg automatisch.'),900);
  recordBest();applyTheme();saveRun();
}

