/* src/js/core/helpers.js
   Kleine Hilfsfunktionen (Zufall, Auswahl, DOM-Kürzel). */
/*GEO-START*/
/* ================= Helfer ================= */
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};

