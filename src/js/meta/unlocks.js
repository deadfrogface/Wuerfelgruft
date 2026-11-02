/* src/js/meta/unlocks.js
   Freischaltungen (das Titelmenü wächst mit dem Spieler) und Endgame-Sperre. */
/* ===== Freischaltungen: das Titelmenü wächst mit dem Spieler ===== */
const UNL={
  u:{n:'Wissen',ok:()=>(save.runs||0)>=1,h:'Wissen ab dem 1. abgeschlossenen Lauf'},
  r:{n:'Aufgaben',ok:()=>(save.runs||0)>=3||(save.bestDepth||0)>=5,h:'Aufgaben ab dem 3. Lauf oder Etage 5'},
  l:{n:'Gruftlager',ok:()=>(save.bestDepth||0)>=8||(save.runs||0)>=6,h:'Gruftlager ab Etage 8 oder dem 6. Lauf'},
  daily:{n:'Tageslauf',ok:()=>(save.runs||0)>=2,h:'Tageslauf ab dem 2. Lauf'},
  forge:{n:'Schmiede',ok:()=>(save.runs||0)>=1,h:'Schmiede ab dem 1. abgeschlossenen Lauf'},
  ach:{n:'Erfolge',ok:()=>(save.runs||0)>=3,h:'Erfolge ab dem 3. Lauf'},
  stat:{n:'Statistik',ok:()=>(save.runs||0)>=5,h:'Statistik ab dem 5. Lauf'},
  mst:{n:'Meister und Titel',ok:()=>(save.bestDepth||0)>=10||(save.runs||0)>=8,h:'Meister und Titel ab Etage 10 oder dem 8. Lauf'}
};
const UNL_EL={daily:'b-daily',forge:'b-forge',ach:'b-ach',stat:'b-stat',mst:'b-mst'};
const unlOk=k=>DEVBUILD||!UNL[k]||UNL[k].ok();
const unlGate=k=>{if(unlOk(k))return true;toast(UNL[k].h+'.');sfx('block');return false;};
function applyUnlocks(){
  if(!save.annUnl){save.annUnl={};save.visUnl={};for(const k in UNL)if(UNL[k].ok()){save.annUnl[k]=1;save.visUnl[k]=1;}}
  if(!save.visUnl)save.visUnl={};
  for(const k in UNL_EL){const el=$('#'+UNL_EL[k]);if(!el)continue;el.dataset.gate=k;el.classList.toggle('lock',!unlOk(k));el.classList.toggle('new',unlOk(k)&&!save.visUnl[k]&&!isFresh());}
  const t=$('#scr-title');
  if(t&&t.classList.contains('on')&&!anyModal()&&!isFresh()){
    const nw=Object.keys(UNL).filter(k=>UNL[k].ok()&&!save.annUnl[k]);
    if(nw.length){for(const k of nw)save.annUnl[k]=1;persist();setTimeout(()=>{toast('Neu freigeschaltet: '+nw.map(k=>UNL[k].n).join(', '));sfx('win');},500);}
  }
  const gh=$('#goalhint');if(gh)gh.textContent=isFresh()?'':nextGoalText();
}
const GOAL_STEPS=[[8,'Gruftlager'],[10,'Zauberer'],[10,'Meister und Titel'],[20,'Schatzjäger'],[30,'Wächter'],[100,'Der Urwürfel (Endgame)']];
function nextGoalText(){
  const best=save.bestDepth||0;
  for(const [need,name] of GOAL_STEPS)if(best<need)return 'Nächstes Ziel: '+name+' ab Etage '+need+' (bisher '+best+')';
  const r=mrRank().r;
  for(const k of ['jaeger','dieb','alchemist']){const C=CLASSES[k];if(C&&r<C.mr)return 'Nächstes Ziel: '+C.name+' ab Meisterrang '+C.mr+' (bisher '+r+')';}
  return '';
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-gate]');if(!b)return;const k=b.dataset.gate;
  if(!unlOk(k)){e.stopPropagation();e.preventDefault();toast(UNL[k].h+'.');sfx('block');return;}
  if(!save.visUnl||!save.visUnl[k]){if(!save.visUnl)save.visUnl={};save.visUnl[k]=1;persist();b.classList.remove('new');}
},true);
const END_MSG='Besiege den Urwürfel auf Etage 100, um den Abgrund zu öffnen.';
const endOpen=()=>!!save.won||DEVBUILD;
const endGate=()=>{if(endOpen())return true;toast(END_MSG);sfx('block');return false;};
