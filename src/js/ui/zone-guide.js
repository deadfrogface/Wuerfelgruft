/* src/js/ui/zone-guide.js
   Zonen-Anleitung. */
/* ================= Zonen-Anleitung ================= */
const OLD_DESC={slime:'läuft jeden Zug auf dich zu. Stachel töten ihn.',archer:'zielt einen Zug, schießt im nächsten. Verlasse die Linie, bevor er schießt.',brute:'zäh, schlägt hart, handelt nur jeden zweiten Zug. Das „!“ zeigt, wann.',ghost:'gleitet durch Wände.',king:'ruft alle paar Züge Schleime. Mit seinem Tod öffnet sich die Treppe.'};
const ZINFO={
  gruft:'Die alte Gruft. Der Eingang des Würfel-Dungeons, bedeckt mit Moos, Schleim und den ersten Kreaturen der Tiefe.',
  gold:'Die Goldkammer. Münzen bedecken den Boden, und nicht alles, was glänzt, bleibt liegen.',
  wueste:'Die Sandsturmwüste. Heißer Wind, glühender Sand und Dinge, die darunter schlafen.',
  moor:'Der Schlund. Ein feuchter Sumpf unter der Erde, dicht von Ranken und trüben Pfützen, in denen sich etwas regt.',
  wind:'Die Sturmzinnen. Hoch oben pfeift der Wind zwischen den Türmen, und nichts bleibt dort, wo man es abgestellt hat.',
  uhrwerk:'Das Uhrwerk. Zahnräder, Dampf und ein Ticken, das nie verstummt. Alles hier folgt einem Takt.',
  eis:'Das Glasreich. Frost und Spiegel, so still, dass jeder Schritt zu laut klingt.',
  tiefsee:'Die Tiefsee. Schweres, dunkles Wasser, in dem Strömungen flüstern und Lichter locken.',
  glut:'Die Glutkammern. Lava, Asche und eine Hitze, die jeden Atemzug schwer macht.',
  leere:'Das Nichts. Hier endet die Welt. Was noch lebt, ist Schatten und Hunger.'
};
const PDESC={p_skarab:'+2 Blocks',p_ankh:'heilt 4 Leben',p_zahnrad:'die nächsten 2 Siege kosten keinen Zug',p_oel:'6 Schritte kosten keinen Zug',p_perle:'heilt 2 und gibt 20 Münzen',p_muschel:'die nächsten 3 Treffer auf dich verfehlen',p_beere:'heilt 2 und gibt 1 Block',p_pilz:'5 Schritte kosten keinen Zug',p_kristall:'friert alle Gegner kurz ein',p_schneeherz:'+1 maximales Leben und heilt 3',p_glutkern:'die nächsten 3 Angriffe machen +2 Schaden',p_feder:'+1 Zurück in dieser Etage',p_splitter:'+100 Punkte und +25 Münzen',p_mantel:'Gegner bemerken dich 2 Züge lang nicht',p_barren:'+50 Münzen und Punkte',p_kleeblatt:'die nächsten 4 Angriffe machen doppelten Schaden',chest:'Überraschung: Münzen, ein Fund, ein fliehender Goblin oder eine Mimik',p_windfeder:'4 Schritte gratis und heilt 1',p_wirbel:'stößt alle Gegner in der Nähe weg'};
const STATE_INFO=[
  ['gift','st-gift','Gift','1 Schaden pro Zug für 3 Züge. Ein Herz heilt es. Giftige Gegner beißen nur in eine Richtung: erst dreht sich der Gegner (rotes Feld), im nächsten Zug beißt er. Tritt zur Seite.'],
  ['brand','st-brand','Brand','1 Schaden pro Zug für 3 Züge. „Warten“ oder Wasser löscht ihn.'],
  ['stein','st-stein','Versteinert','Ein starrer Blick hält dich einen Zug fest. Weich seiner Linie aus.'],
  ['gesang','st-gesang','Gesang','Ein Lied zieht dich bis zu 2 Felder zu sich, wenn du in Sichtweite kommst. Das Singen kündigt sich an.'],
  ['oase','st-oase','Oase','Hinter mancher Truhe verbirgt sich ein geheimer Ort mit Herzen, Quelle, Münzen und einem wandernden Händler.']
];
function buildHelpStates(){
  const box=$('#h-states');if(!box)return;
  const seen=STATE_INFO.filter(x=>save.st&&save.st[x[0]]);
  box.innerHTML=seen.length?'<h3>Zustände und Besonderes</h3><ul>'+seen.map(x=>`<li><span class="ph">${spr(x[1])}</span><span><b>${x[2]}</b>: ${x[3]}</span></li>`).join('')+'</ul>':'';
}
function buildHelpZone(){
  buildHelpStates();
  const box=$('#h-zone');if(!box)return;
  if(!G){box.innerHTML='';return;}
  const z=zoneOf(G.depth)%ZONES.length,kd=ZKIND[z],A=AMMO[kd];
  const first=z*10+1;
  const li=(ico,t,d)=>`<li><span class="ph">${spr(ico)}</span><span><b>${t}</b>${d?': '+d:''}</span></li>`;
  const endl=G&&zoneOf(G.depth)>=ZONES.length;
  let h=`<h3>${ZONES[z]} (${endl?'Endlosmodus, Gegner wiederholen sich':'Etage '+first+'–'+(first+9)})</h3><p>${ZINFO[kd]}</p>`;
  const tk=[ZTERR[kd],kd==='tiefsee'?'water':null].filter(k=>k&&hasEx('terr',k));
  if(tk.length)h+='<h3>Gelände</h3><ul>'+tk.map(k=>li('s-spike','Gelände dieser Zone',TERR_TIP[k])).join('')+'</ul>';
  const metIt=id=>!!(save.dex[id]&&save.dex[id].s>0);
  const allIds=[...ROSTER[z],...BOSSES[z]],metIds=allIds.filter(metIt);
  if(metIds.length)h+='<h3>Gegner dieser Zone</h3><ul>';
  const ids=ROSTER[z].filter(metIt).sort((a,b)=>MT[a].d-MT[b].d);
  for(const id of ids){const T=MT[id];h+=li(id,T.name,(OLD_DESC[id]||traitText(T)||'läuft auf dich zu.')+' <i style="opacity:.7">'+(endl?'':'(ab Etage '+(first+T.d-1)+')')+'</i>');}
  for(const id of BOSSES[z].filter(metIt)){const T=MT[id];h+=li(id,'Boss '+T.name,(OLD_DESC[id]||traitText(T))+' Etage '+(first+(id===BOSSES[z][0]?4:9))+'.');}
  if(metIds.length)h+='</ul>';
  if(metIds.length<allIds.length)h+='<p style="opacity:.7">Weitere Gegner warten noch unentdeckt.</p>';
  if(hasEx('ammo',kd))h+='<h3>Wurf-Item</h3><ul>'+li(A.ico,A.name,A.desc+'. Beim Zonenwechsel tauschst du übrige Stücke im Händler.')+'</ul>';
  const pk=ZPICKS[kd];
  const fk=pk?[...new Set(pk)].filter(k=>hasEx('finds',k)):[];
  if(fk.length)h+='<h3>Fundstücke dieser Zone</h3><ul>'+fk.map(k=>li(k,PICKN[k],PDESC[k])).join('')+'</ul>';
  const ups=UPS.filter(u=>u.tier===z&&hasEx('ups',u.id));
  if(ups.length)h+='<h3>Neue Verstärkungen</h3><ul>'+ups.map(u=>li(u.ico,u.name,u.desc)).join('')+'</ul>';
  box.innerHTML=h;
}

