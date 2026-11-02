/* src/js/ui/screens-modals.js
   Bildschirm- und Fensterverwaltung. */
/* ================= Screens & Modale ================= */
function show(id){$$('.screen').forEach(s=>s.classList.toggle('on',s.id===id));if(id==='scr-title')setTimeout(titleTips,1400);}
function titleTips(){
  try{
    if(!$('#scr-title').classList.contains('on')||anyModal())return;
    const n=save.runs||0;
    if(n>=1&&tip('t_swipe','<b>Der Titelbildschirm ist ein Würfel</b>: Wische nach links (Gruftlager), rechts (Aufgaben und Herausforderungen), oben (Sammlung, Schmiede, Meisterschaft) oder unten (Abgrund), oder tippe die Pfeile am Rand.'))return;
    if(n>=1&&tip('t_forge','<b>Neu: Schmiede</b>. Mit Gruftsteinen kaufst du dauerhafte Verbesserungen, die in jedem neuen Lauf gelten.'))return;
    if(n>=1&&tip('t_q','<b>Aufgaben</b> geben täglich Gruftsteine. Der <b>Tageslauf</b> hat jeden Tag eine andere Regel, mit Serie.'))return;
    if(n>=3&&tip('t_dex','In der <b>Sammlung</b> siehst du alle Gegner, die du getroffen hast, mit ihren Eigenschaften.'))return;
  }catch(e){}
}
function openModal(id){$('#'+id).classList.add('on');}
function closeModal(id){$('#'+id).classList.remove('on');}
function anyModal(){return $$('.modal.on').length>0;}

