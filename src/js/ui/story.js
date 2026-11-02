/* src/js/ui/story.js
   Intro, Outro und der erste Lauf. */
let introI=0,introTimer=null,introDone=true,STORY=null,storyCb=null,storyHint='Tippen zum Beginnen';
const INTRO=[
  {vis:'cube',t:'Tief unter der Stadt liegt ein Würfel aus Stein. Sechs Seiten. Jede ein eigener Raum.'},
  {vis:'b9_1',t:'Man nennt ihn den Urwürfel. Er hat die Gruft gebaut, und jeder Schritt darin ist ein Wurf seiner Würfel.'},
  {vis:'s-hero',t:'Niemand, der hineinging, kam zurück. Du gehst trotzdem.'},
  {vis:'mons',t:'Was dort unten lauert, rührt sich nur, wenn du dich rührst. Jeder Schritt zählt.'},
  {vis:'s-stairs',t:'Finde den Schlüssel, nimm die Treppe. Sie liegt immer auf einer anderen Seite.'}
];
const OUTRO=[
  {vis:'b9_1',t:'Der Urwürfel zerspringt. Sechs Seiten, sechs Splitter, und das Licht der Gruft erlischt.'},
  {vis:'mons',t:'Die Wesen, die ihm dienten, zerfallen zu Staub. Zum ersten Mal ist es still in der Tiefe.'},
  {vis:'s-hero',t:'Du steigst die lange Treppe hinauf, Etage für Etage, Seite für Seite, bis zum Tageslicht.'},
  {vis:'i_sun',t:'Über dir steht die Sonne. In deiner Hand liegen die Würfel, die du besiegt hast.'},
  {vis:'i_dice',t:'Doch tief unten rollt noch ein Würfel. Die Gruft hat keinen Boden. Wer will, geht wieder hinab.'},
  {vis:'s-key',t:'Danke fürs Spielen.'}
];
function introVis(v){
  if(v==='cube')return `<div class="scene" style="height:150px"><div class="cube bigcube"><div class="face f1">${spr('s-hero')}</div><div class="face f2">${spr('s-stairs')}</div><div class="face f3">${spr('s-slime')}</div><div class="face f4">${spr('s-key')}</div><div class="face f5">${spr('s-ghost')}</div><div class="face f6">${spr('s-spike')}</div></div></div>`;
  if(v==='mons')return spr('s-slime')+spr('s-archer')+spr('s-brute');
  return spr(v);
}
function playStory(slides,cb,hint){
  STORY=slides;storyCb=cb||null;storyHint=hint||'Tippen zum Beginnen';
  show('scr-intro');introI=0;showPanel();
}
function playIntro(){playStory(INTRO,startFirstRun,'Tippen zum Beginnen');}
function playOutro(cb){playStory(OUTRO,cb,'Tippen zum Fortfahren');}
function showPanel(){
  const p=STORY[introI];
  const vis=$('#i-vis');vis.className='i-vis in'+(p.vis==='mons'?' row3':'');vis.innerHTML=introVis(p.vis);
  const el=$('#i-txt');el.textContent='';introDone=false;
  let k=0;clearInterval(introTimer);
  introTimer=setInterval(()=>{
    k++;el.textContent=p.t.slice(0,k);
    if(k>=p.t.length){clearInterval(introTimer);introDone=true;$('#i-hint').textContent=introI===STORY.length-1?storyHint:'Tippen zum Weiterlesen';}
  },32);
  $('#i-hint').textContent='';
}
function introNext(){
  if(!$('#scr-intro').classList.contains('on'))return;
  AU.unlock();
  if(!introDone){clearInterval(introTimer);$('#i-txt').textContent=STORY[introI].t;introDone=true;$('#i-hint').textContent=introI===STORY.length-1?storyHint:'Tippen zum Weiterlesen';return;}
  if(introI<STORY.length-1){introI++;showPanel();}
  else endIntro();
}
function endIntro(){clearInterval(introTimer);const cb=storyCb;storyCb=null;if(cb)cb();else show('scr-title');}
/* Erster Lauf nach dem Intro: Normal, Krieger, mit Hinweisen Schritt für Schritt */
function startFirstRun(){
  save.seenIntro=true;save.diff='normal';save.cls='krieger';persist();
  startGame();if(G)G.tutor=true;
}

function syncSwitches(){
  $$('.sw').forEach(b=>b.setAttribute('aria-checked',String(!!save.settings[b.dataset.k])));
  $$('.rg').forEach(r=>{r.value=save.settings[r.dataset.k];});
  const sd=$('#set-diff');if(sd){sd.innerHTML='';for(const k of DIFFK){const b=document.createElement('button');b.textContent=DIFFS[k].name;b.className=save.diff===k?'on':'';b.addEventListener('click',()=>{sfx('click');save.diff=k;persist();updateStats();syncSwitches();});sd.appendChild(b);}}
}
