/* src/js/ui/title-build.js
   Titelbuchstaben und Glut aufbauen. */
/* ================= Titel aufbauen ================= */
function buildTitle(){
  const mk=(id,word,dl0)=>{
    const row=$(id);
    [...word].forEach((ch,k)=>{
      const s=document.createElement('span');s.className='tt';s.textContent=ch;
      s.style.setProperty('--rot',((Math.random()*8-4)).toFixed(1)+'deg');
      s.style.setProperty('--dl',(dl0+k*.09).toFixed(2)+'s');
      row.appendChild(s);
    });
  };
  mk('#t1','WÜRFEL',.1);mk('#t2','GRUFT',.75);
  const em=$('#embers');
  for(let k=0;k<16;k++){
    const e=document.createElement('i');e.className='ember';
    e.style.left=(Math.random()*100)+'%';
    e.style.setProperty('--d',(7+Math.random()*7).toFixed(1)+'s');
    e.style.setProperty('--dl',(-Math.random()*10).toFixed(1)+'s');
    e.style.setProperty('--sx',((Math.random()*80-40)).toFixed(0)+'px');
    em.appendChild(e);
  }
}

