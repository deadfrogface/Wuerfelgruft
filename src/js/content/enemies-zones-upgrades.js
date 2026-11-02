/* src/js/content/enemies-zones-upgrades.js
   Inhalte: Gegner (normal und Boss), Zonen und Verstärkungen. */
/* ================= Inhalte: Gegner, Zonen, Verstärkungen ================= */
const BODY={
blob:["................","................","................","................","......kkkk......","....kkmmllkk....","...kmmmllmmmk...","..kmmmmmmmmmmk..","..kmWWmmmmWWmk..",".kmmWkmmmmWkmmk.",".kmmmmmmmmmmmmk.",".kmmmkkkkkkmmmk.",".kMmmmmmmmmmmMk.","..kMMMMMMMMMMk..","...kkkkkkkkkk...","................"],
human:["................","....kkkkkkkk....","...kmmmmmmmmk...","...kmWkmmWkmk...","...kmmmmmmmmk...","....kkmmmmkk....","..kkaaaaaaaakk..",".kaalaaaaaalaak.",".kaalaaaaaaaaak.",".kaaAAAAAAAAaak.","..kkAAAAAAAAkk..","...kAAkkkkAAk...","...kAAk..kAAk...","..kkkkk..kkkkk..","................","................"],
beast:["................","................","...kk......kk...","..kmmk....kmmk..","..kmmkkkkkkmmk..","..kmmmmmmmmmmk..","..kmWkmmmmkWmk..","..kmmmmkkmmmmk..","...kmmmkkmmmk...","..kkMMMmmMMMkk..",".kmmMMMMMMMMmmk.",".kmmMMMMMMMMmmk.",".kMMkMMMMMMkMMk.",".kkk.kkkkkk.kkk.","................","................"],
wisp:["................","................",".......kk.......","......kllk......",".....kllmmk.....","....kllmmmmk....","....kmmmmmmk....","...kmWkmmWkmk...","...kmmmmmmmmk...","...kmmmkkmmmk...","...kMmmmmmmMk...","...kMMmmmmMMk...","....kMMMMMMk....","....kk.kk.kk....",".....k..k..k....","................"],
bug:["................","................","..k...kkkk...k..","..kk.kmmmmk.kk..","...kkkmWmWkkk...","..k.kmmmmmmk.k..",".kk.kMmaamMk.kk.",".k.kkMmaamMkk.k.","k..kMMmmmmMMk..k","...kMMMMMMMMk...","..kkMMMMMMMMkk..",".k..kkMMMMkk..k.","k....kkkkkk....k","................","................","................"],
head:["................","................","....kkkkkkkk....","...kmmmmmmmmk...","..kmmllmmmmmmk..","..kmlmmmmmmmmk..","..kmmWWmmWWmmk..","..kmmWkmmkWmmk..","..kmmmmmmmmmmk..","...kmmmkkmmmk...","...kMmkmmkmMk...","....kMkMMkMk....","....kkkkkkkk....","................","................","................"],
golem:["................","...kkkkkkkkkk...","..kmmmmmmmmmmk..","..kmWkmmmmkWmk..","..kmmmmmmmmmmk..",".kkkMMMMMMMMkkk.","kmmkMMMMMMMMkmmk","kmmkMMaaaaMMkmmk","kmmkMMaaaaMMkmmk","kMMkMMMMMMMMkMMk",".kkkMMMMMMMMkkk.","...kMMkkkkMMk...","...kMMk..kMMk...","..kkkkk..kkkkk..","................","................"],
wing:["................","................","................","k..............k","kk....kkkk....kk","kmk..kmmmmk..kmk","kmmkkkmWmWkkkmmk",".kmmkmmmmmmkmmk.","..kmmmmmmmmmmk..","...kMmmmmmmMk...","....kMMMMMMk....","....k.kMMk.k....",".........k......","................","................","................"],
plant:["................","................","....kkkkkkkk....","..kkaaaaaaaakk..",".kaaaWWaaaaaaak.",".kaaWWaaaWaaaak.","kaaaaaaaaWWaaaak","kkkkkkkkkkkkkkkk","...kmmmmmmmmk...","...kmWkmmWkmk...","...kmmmmmmmmk...","...kMmmmmmmMk...","....kMMMMMMk....",".....kkkkkk.....","................","................"],
worm:["................","................","................",".....kkkk.......","....kmmmmk......","....kWkmWk......","....kmmmmk.kkk..",".....kkkk.kmmmk.","..kkk.kMMkmllmk.",".kmmmkkMMMMmmmk.",".kmllmkMMkkMMMk.",".kmmmmMMMk.kkk..","..kMMMMkkk......","...kkkk.........","................","................"]
};
const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const toHx=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const shadeC=(h,k)=>toHx(hx(h).map(v=>v*k));
const lightC=(h,k)=>toHx(hx(h).map(v=>v+(255-v)*k));
function genGrid(body,main,acc,kind){
  const src=BODY[body].map(r=>r.split(''));
  const pal={k:'#17152b',m:main,M:shadeC(main,.68),l:lightC(main,.42),W:'#f4efe0',a:acc,A:shadeC(acc,.68)};
  const g=src.map(r=>r.map(c=>c==='.'?null:(pal[c]||null)));
  if(kind==='glow'){for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(src[y][x]==='W')g[y][x]=lightC(acc,.3);}
  if(kind==='spots'){for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(src[y][x]==='m'&&(x*5+y*3)%11===0)g[y][x]=pal.l;}
  if(kind==='stripes'){for(let y=0;y<16;y++)for(let x=0;x<16;x++)if((src[y][x]==='m'||src[y][x]==='a')&&y%3===0)g[y][x]=pal.M;}
  let y0=0;while(y0<16&&g[y0].every(c=>c===null))y0++;
  if(kind==='crown'&&y0>=2){for(const x of [5,7,8,10])g[y0-1][x]=acc;for(const x of [6,7,8,9])g[y0][x]=g[y0][x]||acc;g[y0-1][6]=null;}
  if(kind==='horns'&&y0>=2){
    const xs=g[y0+1].map((c,x)=>c?x:-1).filter(x=>x>=0);const a=xs[0]+1,b=xs[xs.length-1]-1;
    g[y0][a]=acc;g[y0-1][a-1]=acc;g[y0][b]=acc;g[y0-1][b+1]=acc;
  }
  if(kind==='sack'){
    for(const [x,y] of [[12,9],[13,9],[11,10],[12,10],[13,10],[14,10],[11,11],[12,11],[13,11],[14,11],[12,12],[13,12]])g[y][x]='#a8743a';
    g[8][12]='#c98a4b';g[8][13]='#c98a4b';g[10][12]='#ffe27a';g[11][13]='#f4b942';
  }
  const o=g.map(r=>r.slice());
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!g[y][x]){
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&X<16&&Y>=0&&Y<16&&g[Y][X]&&g[Y][X]!=='#17152b'){o[y][x]='#17152b';break;}}
  }
  return o;
}
const GEN={};
/* Zonen: [Name, Boss 1, Boss 2] */
const ZONES=['Die Gruft','Die Goldkammer','Die Sandsturmwüste','Der Schlund','Die Sturmzinnen','Das Uhrwerk','Das Glasreich','Die Tiefsee','Die Glutkammern','Das Nichts'];
const ZKIND=['gruft','gold','wueste','moor','wind','uhrwerk','eis','tiefsee','glut','leere'];   /* Optik/Effekte hängen am Namen, nicht an der Nummer */
const kindOf=d=>ZKIND[zoneOf(d)%ZKIND.length];
const ZTERR={gold:'chute',wueste:'quick',moor:'vines',wind:'gust',uhrwerk:'belt',eis:'slick',tiefsee:'current',glut:'lava',leere:'rift'};
const TERR_TIP={chute:'Goldrutschen kommen paarweise: wer hineintritt, landet an der Schwesterrutsche.',quick:'Treibsand hält dich und Gegner fest: du setzt einen Zug aus.',vines:'Ranken verheddern dich: du setzt einen Zug aus. Gegner meiden sie.',gust:'Windböen schieben dich ein Feld in Pfeilrichtung.',belt:'Fließbänder tragen dich am Zugende ein Feld in Pfeilrichtung.',slick:'Glatteis: du rutschst in Laufrichtung weiter, bis das Eis endet.',current:'Strömung trägt dich am Zugende ein Feld mit. Alle 3 Züge dreht sie um.',water:'Wasser: Du schwimmst hindurch, Gegner an Land meiden es. Im Wasser kannst du nichts werfen.',lava:'Lava verbrennt: 1 Schaden für dich, 2 für Gegner. Fliegende Gegner sind immun.',rift:'Risse kommen paarweise: wer hineintritt, landet am Schwesterriss.'};
const TR={ghost:'schwebt durch Wände',shoot:'schießt aus der Ferne',turret:'steht still',slow:'handelt jeden zweiten Zug',fast:'läuft doppelt so schnell',rand:'torkelt',diag:'zieht und schlägt diagonal',armor:'Rüstung (−1 Schaden)',regen:'heilt sich',split:'zerfällt in Kleine',boom:'explodiert im Tod',tele:'springt dir nah',thorny:'verletzt Angreifer',summon:'ruft Verstärkung',heal:'heilt Verbündete',steal:'klaut Bomben',charge:'stürmt in gerader Linie',lob:'wirft Bomben',drain:'saugt Leben',trail:'legt Stacheln',sleep:'schläft bis du nah bist',push:'schleudert dich zurück',steam:'stößt alle paar Züge Dampf aus (Felder in 2 Schritten)',shock:'betäubt dich einen Zug',flee:'rennt mit Beute davon, fang ihn',thief:'stiehlt dir etwas, jage ihn',rise:'erhebt sich einmal wieder, wenn du ihn besiegst',greed:'stiehlt Münzen und gibt sie erst im Tod zurück',burrow:'gräbt sich ein und bricht plötzlich neben dir hervor (Boden bebt)',mire:'wirft Giftschlamm, dessen Wolke liegen bleibt',hitrun:'greift an und zieht sich zurück',rewind:'spult dich zwei Züge zurück',icy:'lässt Glatteis hinter sich',inkspray:'verdunkelt mit Tinte die Sicht',sparks:'sprüht Funken und Flammen, wenn du ihn triffst',phase:'springt weg, wenn du ihn triffst',hop:'springt: jeden zweiten Zug ein weiter Satz (zwei Felder)',kite:'hält Abstand und weicht aus, wenn du nah kommst',siren:'singt: zieht dich zwei Felder zu sich',gaze:'versteinert dich mit einem Blick für einen Zug',venom:'vergiftet dich (Schaden über Zeit), beißt nur in eine Richtung und dreht sich erst zu dir',toxic:'vergiftet dich',ignite:'setzt dich in Brand, Warten löscht'};
/* [Name,Körper,Hauptfarbe,Akzent,Muster,hp,dmg,ab Etage,Eigenschaften] */
const RAW=[
[
 ['Ratte','beast','#9a7b5a','#d8b890','spots',1,1,2,{fast:1}],
 ['Fledermaus','wing','#6b5a8e','#c9a7ff','',1,1,3,{fast:1,rand:1}],
 ['Skelett','human','#e9dfc8','#8b93ad','',2,1,4,{dies:'bones',rise:1}],
 ['Giftspinne','bug','#5aa02c','#c5f285','stripes',1,1,5,{venom:1}],
 ['Moderpilz','plant','#8a6f4a','#e8553d','',2,1,5,{turret:1,heal:1}],
 ['Knochenwerfer','human','#cfc3a5','#c98a4b','',1,1,5,{shoot:1,rng:3,kite:1,rise:1}],
 ['Grabwächter','golem','#7a7f99','#f4b942','',4,1,6,{slow:1,armor:1}],
 ['Kriechhand','bug','#d9a577','#a93a28','',1,1,6,{diag:1,hop:1}],
 ['Fackelgeist','wisp','#ff8a5c','#f4b942','glow',1,1,6,{ignite:1,ghost:1,boom:1}],
 ['Schleimmutter','blob','#5aa0e8','#c5e8ff','spots',2,1,7,{split:'Schleim',dumb:1}],
 ['Irrlicht','wisp','#7fe0c8','#e8fff8','',1,1,7,{tele:1}],
 ['Aasgeier','wing','#8b6a58','#e8553d','',2,1,7,{charge:1}],
 ['Dornenschreck','plant','#3f8a4a','#e8553d','horns',2,1,8,{thorny:1}],
 ['Bombenwichtel','beast','#e8553d','#f4b942','horns',1,1,8,{lob:1}],
 ['Totenbeschwörer','human','#6a4a8a','#8a5fa8','',2,1,9,{summon:'Schleim',sumN:4,rise:1}],
 ['Wächterauge','head','#cdbfff','#e8553d','glow',2,1,9,{turret:1,shoot:1,rng:4}]
],[
 ['Goldgoblin','human','#7fb04a','#a8743a','sack',1,1,1,{flee:1,loot:25}],
 ['Münzkäfer','bug','#e8c030','#a8743a','',2,1,1,{diag:1,loot:6,dies:'coins'}],
 ['Taler-Schleim','blob','#f4b942','#ffe27a','spots',2,1,1,{dumb:1,loot:8,dies:'coins'}],
 ['Beutelschnitzer','human','#5a4a3a','#c98a4b','',1,1,2,{thief:1,fast:1}],
 ['Mimik','golem','#8a5a2a','#ffe27a','',3,2,2,{turret:1,loot:12}],
 ['Goldfliege','wing','#f4d03a','#17152b','stripes',1,1,2,{fast:1,rand:1,loot:4,greed:1}],
 ['Schatzmeister','human','#c9a050','#6a4a8a','crown',2,1,3,{summon:'Münzkäfer',sumN:4,dies:'coins'}],
 ['Zwergenkrieger','human','#a8743a','#8b93ad','horns',3,1,3,{charge:1,armor:1}],
 ['Goldschütze','human','#e8c030','#8a5a2a','',2,1,3,{shoot:1,rng:4,kite:1,greed:1}],
 ['Leprechaun','human','#3fa04a','#ffe27a','sack',2,1,4,{flee:1,fast:1,loot:40}],
 ['Barrengolem','golem','#f4b942','#b47a14','',5,2,4,{slow:1,armor:1,loot:20}],
 ['Hortauge','head','#ffe27a','#e8553d','glow',3,1,4,{turret:1,shoot:1,rng:5,greed:1}],
 ['Goldwelpe','wing','#e8b84a','#e8553d','horns',3,1,5,{shoot:1,rng:4,armor:1}],
 ['Münzfresser','worm','#c9a050','#ffe27a','stripes',3,1,5,{drain:1,loot:10,greed:1}],
 ['Dukatenspinne','bug','#d9a030','#17152b','',2,1,5,{trail:1,loot:6,greed:1}],
 ['Straßenräuber','human','#4a3a5a','#e8553d','',2,1,6,{thief:1,fast:1,hop:1,greed:1}],
 ['Funkenimp','beast','#ffb347','#e8553d','horns',2,1,8,{ignite:1,lob:1,sparks:1}],
 ['Midasstatue','golem','#ffd36a','#ffffff','',6,2,7,{regen:1,slow:1,loot:30}],
 ['Goldharpyie','wing','#f4d03a','#e8553d','',3,1,7,{charge:1,loot:12,greed:1}],
 ['Drachenbrut','blob','#e8b84a','#e8553d','spots',3,1,8,{split:'Münzkäfer',dumb:1,thorny:1}]
],[
 ['Skorpion','bug','#c9843a','#e8553d','',2,1,1,{venom:1,thorny:1}],
 ['Sandfloh','bug','#d9b45a','#17152b','',2,1,1,{fast:1,rand:1,hop:1}],
 ['Wüstenfuchs','beast','#e8b070','#f4efe0','',2,1,1,{fast:1,burrow:1}],
 ['Mumie','human','#e9dfc8','#c9ba98','stripes',3,1,2,{slow:1,armor:1,dies:'sand'}],
 ['Sandwurm','worm','#c9a45a','#8a6a2a','',3,1,2,{sleep:1,drain:1,burrow:1}],
 ['Kaktusling','plant','#4a9a4a','#e8553d','',3,1,2,{thorny:1,turret:1}],
 ['Kobra','worm','#6a9a3a','#ffe27a','',2,1,3,{toxic:1,sleep:1,charge:1}],
 ['Geier','wing','#8a6a4a','#e8553d','',3,1,3,{charge:1,drain:1}],
 ['Staubschütze','human','#d9b45a','#8a5a2a','',2,1,3,{shoot:1,rng:5,kite:1,push:1}],
 ['Dschinn','wisp','#5aa0e8','#ffe27a','glow',3,1,4,{tele:1,ghost:1}],
 ['Skarabäus','bug','#2a9a9a','#f4b942','',3,1,4,{diag:1,armor:1,dies:'sand',burrow:1}],
 ['Sandgolem','golem','#d9b45a','#a8743a','',5,2,4,{slow:1,sleep:1}],
 ['Anubiswächter','human','#2a2a45','#f4b942','horns',4,1,5,{charge:1,armor:1,slow:1}],
 ['Wüstenräuber','human','#8a5a3a','#e8553d','',3,1,5,{steal:1,fast:1}],
 ['Sphinx','golem','#e8c070','#2a9a9a','crown',5,2,5,{slow:1,turret:1,shoot:1,rng:5}],
 ['Sandschleim','blob','#e8c870','#c9a45a','spots',3,1,6,{split:'Sandfloh',dumb:1,dies:'sand'}],
 ['Sonnenpriester','human','#f4b942','#e8553d','crown',3,1,6,{lob:1}],
 ['Fata Morgana','wisp','#cfe6ff','#e8c870','glow',3,1,7,{ghost:1,boom:1,tele:1}],
 ['Grabräuber','human','#5a4a3a','#c9a45a','',3,1,7,{summon:'Skarabäus',sumN:4,burrow:1}],
 ['Pharaonengeist','wisp','#8ad0c8','#f4b942','crown',4,1,8,{ghost:1,regen:1}],
 ['Medusa','human','#4a9a5a','#ffe27a','crown',4,1,8,{shoot:1,gaze:1,rng:4,slow:1}]
],[
 ['Sumpfblase','blob','#4fa88a','#b8ffe6','',2,1,1,{dumb:1,dies:'spore'}],
 ['Moorhund','beast','#6f6a4a','#c9c07a','',2,1,1,{fast:1,hitrun:1}],
 ['Schilfschütze','human','#6e8a4a','#cfd96b','',2,1,1,{shoot:1,rng:4,kite:1,toxic:1}],
 ['Egelwurm','worm','#7a4a5a','#e8a0b0','',2,1,2,{drain:1,toxic:1}],
 ['Glühkäfer','bug','#cdd84a','#6aff6a','glow',2,1,2,{boom:1}],
 ['Torfgeist','wisp','#8a7f5a','#e8dcb0','',2,1,2,{ghost:1,drain:1}],
 ['Krötenkrieger','human','#5a8a3a','#3f5f2a','',3,1,3,{armor:1,hop:1}],
 ['Sporenpilz','plant','#b090d8','#7a4aa8','spots',3,1,3,{turret:1,heal:1,dies:'spore'}],
 ['Nebelhexe','human','#9ab0c8','#5a5a8a','',2,1,3,{siren:1}],
 ['Brackbrut','blob','#6aa0c0','#cfeaff','spots',3,1,4,{split:'Sumpfblase',dumb:1,dies:'spore',toxic:1}],
 ['Sumpfleiche','golem','#4a6a5a','#8bd450','',5,2,4,{slow:1,toxic:1}],
 ['Wasserspeier','head','#7a8aa8','#5aa0e8','horns',3,1,4,{turret:1,lob:1,mire:1}],
 ['Hornisse','wing','#e8c030','#17152b','stripes',2,1,5,{fast:1,rand:1,toxic:1}],
 ['Dornenranke','plant','#2f7a3a','#e8553d','',3,1,5,{thorny:1,turret:1,venom:1}],
 ['Flusskrebs','bug','#d9644a','#f4b942','',3,1,5,{diag:1,armor:1}],
 ['Schlammwerfer','human','#7a5a3a','#a08060','',2,1,6,{lob:1,mire:1}],
 ['Giftmolch','worm','#4a8ac0','#f4b942','stripes',3,1,6,{venom:1}],
 ['Sumpfhexer','human','#5a3a7a','#8bd450','crown',3,1,7,{summon:'Sumpfblase',sumN:4,lob:1,mire:1}],
 ['Nachtreiher','wing','#aab4cc','#e8553d','',3,1,8,{charge:1,hitrun:1}],
 ['Faulgas','wisp','#9ac04a','#e8f0a0','',2,1,9,{ghost:1,regen:1,toxic:1}]
],[
 ['Windgeist','wisp','#cfe6ff','#8ab4e0','glow',2,1,1,{ghost:1,fast:1}],
 ['Sturmfalke','wing','#8a7a5a','#e8f0ff','',2,1,1,{fast:1,charge:1,hitrun:1}],
 ['Staubteufel','wisp','#c9a878','#8a6a4a','',2,1,1,{rand:1,push:1}],
 ['Wolkenschaf','blob','#f0f4ff','#8ab4e0','spots',3,1,2,{dumb:1,regen:1,dies:'gale'}],
 ['Blitzechse','beast','#ffe27a','#3a5aa8','stripes',2,1,2,{fast:1,shock:1,hitrun:1}],
 ['Federschütze','human','#e8f0ff','#5a7a9a','',2,1,2,{shoot:1,rng:5,kite:1,hop:1}],
 ['Böenhexe','human','#9ab0d8','#e8f0ff','',2,1,3,{siren:1,push:1}],
 ['Windmüller','golem','#c9ba98','#e8f0ff','',5,2,3,{slow:1,armor:1,steam:1}],
 ['Drachenläufer','bug','#8ad0c8','#e8f0ff','',2,1,3,{diag:1,fast:1}],
 ['Wirbelschleim','blob','#a8d8f0','#ffffff','spots',3,1,4,{split:'Wolkenschaf',dumb:1,dies:'gale',rand:1}],
 ['Himmelsadler','wing','#e8d8a8','#a8743a','horns',3,1,4,{charge:1,push:1,hitrun:1}],
 ['Sturmwolke','head','#6a7a9a','#ffe27a','glow',3,1,4,{turret:1,shoot:1,rng:5,shock:1}],
 ['Orkanreiter','beast','#5a6a8a','#e8f0ff','horns',3,1,5,{fast:1,charge:1,hitrun:1}],
 ['Donnervogel','wing','#3a4a7a','#ffe27a','glow',3,1,5,{shoot:1,rng:5,fast:1,shock:1}],
 ['Flatterwurm','worm','#a8d8c8','#ffffff','stripes',3,1,5,{drain:1,rand:1}],
 ['Wetterhahn','golem','#d9a030','#e8f0ff','',4,1,6,{turret:1,shoot:1,rng:5,armor:1}],
 ['Luftgeist','wisp','#e8f4ff','#ff9ae8','glow',3,1,6,{boom:1,ghost:1,dies:'gale'}],
 ['Windbrecher','golem','#8aa0b8','#e8f0ff','horns',6,2,7,{slow:1,armor:1,push:1,regen:1}],
 ['Zephyrpriester','human','#cfe6ff','#8a5fa8','crown',3,1,7,{summon:'Windgeist',sumN:4,push:1}],
 ['Tornadoling','wisp','#8ad0f0','#ffffff','',3,1,8,{push:1,tele:1}]
],[
 ['Zahnradkäfer','bug','#c98a4b','#8b93ad','',3,1,1,{diag:1,dies:'gear'}],
 ['Aufziehsoldat','human','#c9a050','#8b93ad','',3,1,1,{armor:1,dies:'gear'}],
 ['Messingratte','beast','#c98a4b','#ffe27a','',3,1,1,{fast:1,armor:1}],
 ['Dampfkessel','golem','#8a5a3a','#e8e8e8','',4,1,2,{turret:1,steam:1}],
 ['Pendelwächter','head','#c9a050','#8b93ad','',3,1,2,{turret:1,shoot:1,rng:4,rewind:1}],
 ['Funkenspringer','wisp','#ffe27a','#e8553d','glow',3,1,2,{tele:1,shock:1}],
 ['Schraubenschütze','human','#8b93ad','#c98a4b','',3,1,3,{shoot:1,rng:5,kite:1,armor:1}],
 ['Kolbenfaust','golem','#6f6993','#c98a4b','',5,2,3,{slow:1,armor:1,push:1}],
 ['Federkäfer','bug','#dfe6f2','#c98a4b','stripes',3,1,3,{fast:1,rand:1,hop:1,armor:1}],
 ['Rostschleim','blob','#a8541a','#c98a4b','spots',4,1,4,{split:'Zahnradkäfer',dumb:1,dies:'gear',armor:1}],
 ['Kuckucksvogel','wing','#e8c030','#e8553d','',3,1,4,{charge:1,shock:1}],
 ['Uhrmacher','human','#6a4a2a','#ffe27a','crown',3,1,4,{summon:'Zahnradkäfer',sumN:4,dies:'gear',armor:1}],
 ['Dampfdrache','wing','#c98a4b','#e8e8e8','horns',4,1,5,{steam:1,shoot:1,rng:4}],
 ['Magnetspinne','bug','#8b93ad','#e8553d','',3,1,5,{trail:1,fast:1}],
 ['Kettenwurm','worm','#8b93ad','#c98a4b','stripes',4,1,5,{drain:1,shock:1}],
 ['Ölgeist','wisp','#2a2a45','#c98a4b','glow',3,1,6,{ghost:1,trail:1}],
 ['Zeitwächter','head','#ffe27a','#8b93ad','glow',4,1,6,{turret:1,shoot:1,rng:5,armor:1,rewind:1}],
 ['Bolzenwerfer','beast','#6f6993','#ffe27a','horns',3,1,7,{lob:1,armor:1}],
 ['Turmwächter','golem','#c9a050','#6f6993','',7,2,7,{regen:1,slow:1,rewind:1}],
 ['Chronomat','wisp','#c9ba98','#ffe27a','crown',4,1,8,{tele:1,steam:1,rewind:1}]
],[
 ['Glassplitter','blob','#9fe0ff','#e8fbff','',2,1,1,{dumb:1,dies:'frost',thorny:1}],
 ['Frostwolf','beast','#b0d0f0','#ffffff','',2,1,1,{fast:1,icy:1}],
 ['Eisschütze','human','#7ab0e0','#e8fbff','',2,1,1,{shoot:1,rng:4,kite:1,icy:1}],
 ['Spiegelgeist','wisp','#cfe6ff','#a0c0ff','glow',2,1,2,{ghost:1,shock:1}],
 ['Eiszapfen','head','#bfe8ff','#5aa0e8','',3,1,2,{turret:1,shoot:1,rng:5,icy:1}],
 ['Glasspinne','bug','#8fd0e8','#17152b','',2,1,2,{trail:1,dies:'frost'}],
 ['Prismawächter','golem','#a0b8d8','#ff9ae8','',5,2,3,{slow:1,armor:1,shock:1}],
 ['Schneehexe','human','#e8f0ff','#8ab0e0','',3,1,3,{tele:1,icy:1}],
 ['Eisfledermaus','wing','#7ab0d8','#e8fbff','',2,1,3,{fast:1,rand:1,icy:1}],
 ['Zerberstender','blob','#cfeaff','#ff8a5c','glow',2,1,4,{boom:1,dumb:1,dies:'frost',fast:1}],
 ['Frostpilz','plant','#a0e0d8','#5a8ab8','spots',3,1,4,{turret:1,heal:1,dies:'frost',icy:1}],
 ['Spiegelritter','human','#c0c8e0','#5a6aa8','horns',4,1,4,{diag:1,armor:1,icy:1}],
 ['Eislanzer','worm','#8ad0f0','#ffffff','',3,1,5,{charge:1,icy:1}],
 ['Winterkrähe','wing','#4a5a7a','#cfeaff','',3,1,5,{drain:1,rand:1}],
 ['Kältekrebs','bug','#a0d0e8','#ffd966','',3,1,5,{diag:1,thorny:1,icy:1}],
 ['Splitterbomber','beast','#e8fbff','#e8553d','',2,1,6,{lob:1,boom:1}],
 ['Glasgolem','golem','#bfe8ff','#ffffff','',5,2,6,{regen:1,slow:1,thorny:1}],
 ['Raureifpriester','human','#d8e8ff','#6a8ae0','crown',3,1,7,{summon:'Glassplitter',sumN:4,icy:1}],
 ['Gletscherwurm','worm','#6aa0c0','#e8fbff','',4,1,7,{drain:1,dies:'frost',icy:1}],
 ['Schneewehe','wisp','#f0f8ff','#cfe6ff','',3,1,8,{ghost:1,tele:1,icy:1}],
 ['Basilisk','worm','#6a9a8a','#ffe27a','horns',5,1,8,{shoot:1,gaze:1,rng:4,slow:1}]
],[
 ['Qualle','wisp','#ff9ae8','#8fd0e8','glow',3,1,1,{shock:1}],
 ['Piranha','beast','#e8553d','#f4efe0','',3,1,1,{fast:1,drain:1}],
 ['Seeigel','plant','#6a3a8a','#cdbfff','',3,1,1,{thorny:1,turret:1,toxic:1}],
 ['Anglerfisch','head','#2a4a6a','#ffe27a','glow',4,1,2,{turret:1,shoot:1,rng:5,inkspray:1}],
 ['Strandkrebs','bug','#e8553d','#f4b942','',4,1,2,{diag:1,armor:1,thorny:1}],
 ['Muräne','worm','#4a8a5a','#ffe27a','stripes',4,1,2,{drain:1,hop:1}],
 ['Seepferd','beast','#f4b942','#8fd0e8','',3,1,3,{rand:1,fast:1}],
 ['Nixe','human','#4aa0c8','#ff9ae8','',3,1,3,{shoot:1,rng:5,kite:1,shock:1}],
 ['Tintenfisch','beast','#6a3a8a','#ffffff','',3,1,3,{lob:1,inkspray:1}],
 ['Kugelfisch','blob','#f4d03a','#e8553d','spots',3,1,4,{boom:1,dumb:1,dies:'wave',thorny:1}],
 ['Hai','beast','#8a9ab8','#f4efe0','horns',4,2,4,{charge:1,drain:1}],
 ['Quallenschwarm','blob','#ffb0ec','#8fd0e8','spots',4,1,4,{split:'Qualle',dumb:1,dies:'wave',shock:1}],
 ['Korallenwächter','golem','#ff7a8a','#f4b942','',6,2,5,{regen:1,slow:1,armor:1}],
 ['Perlenmuschel','plant','#cfc3a5','#ffffff','',4,1,5,{turret:1,heal:1,dies:'wave',thorny:1}],
 ['Strudelgeist','wisp','#4aa0c8','#ffffff','',4,1,5,{ghost:1,tele:1,inkspray:1}],
 ['Zitteraal','worm','#3a8ac8','#ffe27a','glow',4,1,6,{shock:1,trail:1}],
 ['Seehexe','human','#4a2a6a','#4aa0c8','crown',4,1,6,{summon:'Piranha',sumN:4,kite:1}],
 ['Rochen','wing','#5a7a9a','#e8f0ff','',4,1,7,{diag:1,fast:1}],
 ['Seeschlange','worm','#2a8a6a','#e8c870','horns',5,2,7,{toxic:1,charge:1}],
 ['Sirene','human','#8fd0e8','#ff9ae8','crown',4,1,8,{siren:1,kite:1}]
],[
 ['Funke','blob','#ff8a3d','#ffe27a','glow',3,1,1,{boom:1,dumb:1,dies:'ember'}],
 ['Aschehund','beast','#5a4a4a','#ff6a3d','',3,1,1,{fast:1,ignite:1}],
 ['Flammenschütze','human','#c0442a','#ffb347','',3,1,1,{ignite:1,shoot:1,rng:4}],
 ['Glutgeist','wisp','#ff6a3d','#ffe27a','glow',3,1,2,{ghost:1,ignite:1}],
 ['Magmaauge','head','#ff5a2a','#ffe27a','horns',3,1,2,{ignite:1,turret:1,shoot:1,rng:5}],
 ['Feuerspinne','bug','#a83a1a','#ffb347','',3,1,2,{ignite:1,trail:1}],
 ['Schlackegolem','golem','#4a3f3a','#ff6a3d','',6,2,3,{slow:1,armor:1,sparks:1}],
 ['Rußfledermaus','wing','#3a3030','#ff8a3d','',2,1,3,{fast:1,rand:1,ignite:1}],
 ['Kobold','human','#d9442a','#f4b942','horns',3,1,3,{tele:1,ignite:1}],
 ['Lavaschleim','blob','#e8553d','#ffcf6a','spots',4,1,4,{split:'Funke',dumb:1,dies:'ember',ignite:1}],
 ['Kohlenritter','human','#4a4a5a','#ff6a3d','',4,1,4,{armor:1,ignite:1,sparks:1}],
 ['Brandwurm','worm','#c05a2a','#ffd966','stripes',4,1,4,{drain:1,ignite:1}],
 ['Phönixbrut','wing','#ff7a3a','#ffe27a','',3,1,5,{ignite:1,charge:1}],
 ['Brandwurzel','plant','#6a3a2a','#ff6a3d','',4,1,5,{thorny:1,turret:1,ignite:1}],
 ['Glutkäfer','bug','#e88a2a','#2a1a1a','',3,1,5,{ignite:1,diag:1,sparks:1}],
 ['Aschepriester','human','#8a7a6a','#ff6a3d','crown',3,1,6,{summon:'Funke',sumN:4,dies:'ember',ignite:1}],
 ['Zunder','wisp','#ffcf6a','#ff6a3d','glow',3,1,6,{boom:1,ghost:1,sparks:1}],
 ['Höllenhund','beast','#7a1a1a','#ff6a3d','horns',4,1,7,{ignite:1,charge:1,sparks:1}],
 ['Schmelzer','golem','#c06a3a','#ffe27a','',6,2,7,{regen:1,slow:1,sparks:1}],
 ['Feuerimp','beast','#ff5a3a','#ffe27a','horns',3,1,8,{ignite:1,lob:1}]
],[
 ['Leerenblob','blob','#3a2a5a','#b890ff','glow',4,1,1,{dumb:1,dies:'void',drain:1}],
 ['Schattenhund','beast','#2a2a3a','#8a72e0','',4,1,1,{fast:1,phase:1}],
 ['Dunkelschütze','human','#4a3a6a','#b890ff','',3,1,1,{shoot:1,rng:5,kite:1,phase:1}],
 ['Nachtgeist','wisp','#5a4a8a','#d0c0ff','glow',4,1,2,{ghost:1,phase:1}],
 ['Leerenauge','head','#2a1a4a','#ff5d73','glow',4,1,2,{turret:1,shoot:1,rng:5,gaze:1}],
 ['Schattenspinne','bug','#1f1f3a','#8a72e0','',3,1,2,{venom:1,trail:1}],
 ['Obsidianwächter','golem','#2a2a45','#8a72e0','',7,2,3,{slow:1,armor:1,phase:1}],
 ['Schattenfledermaus','wing','#3a2a5a','#ff5d73','',3,1,3,{fast:1,rand:1,dies:'void'}],
 ['Trugmagier','human','#6a4a9a','#e0c8ff','crown',3,1,3,{tele:1,phase:1}],
 ['Nichtsbrut','blob','#4a3a7a','#b890ff','spots',4,1,4,{split:'Leerenblob',dumb:1,dies:'void',phase:1}],
 ['Schwarzer Ritter','human','#1f1f2a','#8a72e0','horns',5,1,4,{armor:1,diag:1,phase:1}],
 ['Fressende Made','worm','#5a3a6a','#ff5d73','',4,1,4,{drain:1,toxic:1,rand:1}],
 ['Rabe des Endes','wing','#1f1a2f','#ff5d73','',4,1,5,{charge:1,phase:1}],
 ['Würgeranke','plant','#2a3a4a','#ff5d73','',4,1,5,{thorny:1,turret:1,drain:1}],
 ['Sternenkäfer','bug','#3a2a6a','#ffe27a','glow',4,1,5,{diag:1,hop:1,armor:1}],
 ['Hohepriester','human','#4a2a6a','#ffe27a','crown',4,1,6,{summon:'Leerenblob',sumN:4,slow:1}],
 ['Sternenstaub','wisp','#8a72e0','#ffffff','glow',3,1,6,{ghost:1,boom:1,fast:1}],
 ['Fenrir','beast','#3a3a55','#ff5d73','horns',5,1,7,{charge:1,push:1}],
 ['Weltenfresser','golem','#3a2a5a','#ff5d73','',7,2,7,{regen:1,slow:1,drain:1}],
 ['Nihilimp','beast','#6a2a8a','#ff9ae8','horns',3,1,8,{lob:1,phase:1}]
]];
/* Bosse je Zone: [Etage 5, Etage 10] */
const BOSSRAW=[
 [null,['Würfelkaiser','human','#8a5fa8','#f4b942','crown',12,2,{slow:1,summon:'Schleim',sumN:3,bm:'dieroll'}]],
 [['Goblinkönig','human','#7fb04a','#ffe27a','crown',14,2,{slow:1,armor:1,summon:'Münzkäfer',sumN:3,bm:'hoard',greed:1}],['Drache Aurum','wing','#ffd36a','#fff3b0','crown',22,2,{slow:1,shoot:1,rng:5,summon:'Goldwelpe',sumN:3,bm:'devour'}]],
 [['Pharao Rahotep','human','#2a9a9a','#f4b942','crown',16,2,{slow:1,armor:1,summon:'Skarabäus',sumN:3,bm:'decoys'}],['Apep, der Sandwurm','worm','#c9a45a','#e8553d','horns',22,2,{slow:1,drain:1,summon:'Skorpion',sumN:3,bm:'burrowb'}]],
 [['Moorkönigin','plant','#4a8a5a','#e8a0b0','crown',12,2,{slow:1,summon:'Sumpfblase',sumN:3,bm:'vines'}],['Schlundwurm','worm','#5a3a4a','#e8a0b0','horns',18,2,{slow:1,drain:1,summon:'Egelwurm',sumN:3,bm:'slimetrail'}]],
 [['Sturmherrin','human','#8ad0f0','#ffe27a','crown',16,2,{slow:1,push:1,summon:'Windgeist',sumN:3,bm:'gustback'}],['Wetterdrache Aeolus','wing','#cfe6ff','#ffe27a','horns',24,2,{slow:1,shoot:1,rng:5,push:1,summon:'Sturmfalke',sumN:3,bm:'bolt'}]],
 [['Uhrmacher Horolo','human','#c98a4b','#ffe27a','crown',20,2,{slow:1,armor:1,steam:1,summon:'Zahnradkäfer',sumN:3,bm:'rewindb'}],['Die Große Uhr','golem','#8a5a3a','#ffe27a','horns',28,2,{slow:1,steam:1,shoot:1,rng:5,summon:'Messingratte',sumN:3,bm:'clock'}]],
 [['Glasfürst','human','#bfe8ff','#ffffff','crown',14,2,{slow:1,tele:1,summon:'Glassplitter',sumN:3,bm:'shell'}],['Splittergolem','golem','#a0b8d8','#ff9ae8','horns',22,2,{slow:1,armor:1,summon:'Spiegelgeist',sumN:3,bm:'iceflood'}]],
 [['Nerea','human','#4aa0c8','#ffe27a','crown',24,2,{slow:1,shock:1,summon:'Piranha',sumN:3,bm:'tide'}],['Leviathan','worm','#2a4a7a','#ffe27a','horns',32,3,{slow:1,drain:1,shock:1,summon:'Qualle',sumN:3,bm:'inkb'}]],
 [['Glutfürst','human','#c0442a','#ffe27a','crown',16,2,{slow:1,summon:'Funke',sumN:3,bm:'lava'}],['Aschedrache','wing','#4a3a3a','#ff6a3d','horns',24,2,{slow:1,boom:1,summon:'Glutgeist',sumN:3,bm:'rebirth'}]],
 [['Leerenwächter','golem','#2a2a45','#8a72e0','horns',18,3,{slow:1,summon:'Leerenblob',sumN:3,bm:'gravity'}],['Der Urwürfel','head','#1a1a2f','#ffe27a','crown',28,3,{slow:1,tele:1,summon:'Schattenhund',sumN:3,bm:'worldshift'}]]
];
const ROSTER=[];            /* ROSTER[zone] = Typ-IDs */
const nz=(x,y,s)=>{let h=(x*374761393+y*668265263+s*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)%1000/1000;};
const TAU=Math.PI*2;
const mkAnim=fn=>Array.from({length:4},(_,f)=>Array.from({length:16},(_,y)=>Array.from({length:16},(_,x)=>fn(x,y,f))));
GEN.tr_lava={frames:mkAnim((x,y,f)=>{
  const v=Math.sin(x*.55+f*TAU/4)+Math.sin(y*.5-f*TAU/4+x*.2)+Math.sin((x+y)*.35+f*TAU/2)+(nz(x,y,1)-.5)*.8;
  return v>1.9?'#ffe27a':v>1.0?'#ff8a2a':v>-.2?'#c0401a':v>-1.2?'#7a1c0c':'#3a0f08';})};
GEN.tr_quick={frames:mkAnim((x,y,f)=>{
  const dx=x-7.5,dy=y-7.5,r=Math.hypot(dx,dy),th=Math.atan2(dy,dx);
  const v=Math.sin(r*1.5-f*TAU/4+th*2)+(nz(x,y,2)-.5)*.6;
  return v>.7?'#e8c880':v>0?'#c9a45a':v>-.7?'#a8854a':'#7a5a2a';})};
GEN.tr_vines={frames:mkAnim((x,y,f)=>{
  const s1=Math.sin(x*.9+y*.6+Math.sin(y*.5+f*TAU/4)*1.3),s2=Math.sin(x*.7-y*.8+Math.cos(x*.4-f*TAU/4)*1.2),n=nz(x,y,3);
  if(s1>.88||s2>.9)return n>.7?'#c5f285':'#8bd450';
  if(s1>.7||s2>.72)return '#4aa04a';
  if(n>.96)return '#e8553d';
  return n>.5?'#1e4a1e':'#163816';})};
GEN.tr_slick={frames:mkAnim((x,y,f)=>{
  const m=(((x+y)-f*4)%16+16)%16;
  let c=nz(x,y,4)>.8?'#9fd0f0':'#bfe8ff';
  if(m<2)c='#ffffff';else if(m<3)c='#e8faff';
  else if((x+y)%8===0&&nz(x,y,5)>.5)c='#8fc4e8';
  return c;})};
GEN.tr_belt={frames:mkAnim((x,y,f)=>{
  if(y<1||y>14)return '#241810';
  const d=Math.floor(Math.abs(y-7.5)),k=(((x+d-f)%4)+4)%4;
  if(k===0)return '#ffe27a';if(k===1)return '#b47a14';
  return (x+y)%7===0?'#4a3420':'#3a2a1a';})};
GEN.tr_current={frames:mkAnim((x,y,f)=>{
  const wv=Math.sin((x-f*4)*.8+Math.sin(y*.7)*1.5),d=Math.floor(Math.abs(y-7.5));
  if((((x+d-f*4)%8)+8)%8===0)return '#e8faff';
  return wv>.6?'#6ac0e8':wv>-.2?'#3a9ad8':'#2a7ab8';})};
GEN.tr_gust={frames:mkAnim((x,y,f)=>{
  const yy=y+Math.round(Math.sin((x-f*4)*.5)*1.5);
  if(((yy%5)+5)%5===0&&(((x-f*4)%8)+8)%8<5)return '#ffffff';
  return nz(x,y,6)>.85?'#d8ecf8':(y%2?'#9ec8e0':'#a8d0e8');})};
GEN.tr_water={frames:mkAnim((x,y,f)=>{
  const w=Math.sin(x*.7+y*.5+f*TAU/4)+Math.sin(x*.4-y*.9-f*TAU/4);
  return w>1.5?'#e8faff':w>.6?'#6ad0f0':w>-.6?'#3a9ad8':'#2a7ab8';})};
GEN.fl_sand={frames:mkAnim((x,y,f)=>nz(x,y,7+f)>.55?(nz(x,y,9)>.5?'#e8c880':'#c9a45a'):null)};
GEN.fl_spore={frames:mkAnim((x,y,f)=>{const n=nz(x,y,10+f);return n>.74?'#c5f285':n>.6?'#6aa83a':null;})};
GEN.fl_ice={frames:mkAnim((x,y,f)=>{
  const n=nz(x,y,20);
  if(nz(x,y,30+f)>.94)return '#ffffff';
  if((x*3+y*5)%7===0||n>.8)return '#e8faff';
  return n>.5?'#bfe8ff':n>.35?'#8fc4e8':null;})};
GEN.fl_fire={frames:mkAnim((x,y,f)=>{
  const v=nz(x,y,40+f)+(y/15)*.9-Math.abs(x-7.5)/10;
  return v>1.25?'#ffe27a':v>1.0?'#ff8a2a':v>.8?'#e8553d':null;})};
GEN.fl_whirl={frames:mkAnim((x,y,f)=>{
  const dx=x-7.5,dy=y-7.5,r=Math.hypot(dx,dy),th=Math.atan2(dy,dx),v=Math.sin(r*1.4-f*TAU/4+th*2);
  return v>.8?'#e8faff':v>.4?'#6ac0e8':(r<7.5&&v>-.2?'#3a9ad8':null);})};
GEN.fl_cloud={frames:mkAnim((x,y,f)=>{
  const v=Math.sin(x*.8+f*TAU/4)+Math.sin(y*.7-f*TAU/4)+nz(x,y,60)*1.2;
  return v>1.9?'#d8f27a':v>1.2?'#8bd450':v>.7?'#5a9a3a':null;})};
function portalFrames(kind){
  const P=kind==='gold'?{o:'#17152b',core:'#2a1a05',a:'#fff3b0',b:'#ffe27a',c:'#d99a1c',d:'#b47a14',r1:'#ffe27a',r2:'#8a5a0c'}:{o:'#0a0714',core:'#0c0818',a:'#f0e0ff',b:'#b890ff',c:'#8a6ae0',d:'#4a2a8a',r1:'#b890ff',r2:'#5a3aa0'};
  const frames=[];
  for(let f=0;f<4;f++){
    const g=Array.from({length:16},()=>Array(16).fill(null));
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){
      const dx=x-7.5,dy=y-7.5,r=Math.hypot(dx,dy);let th=Math.atan2(dy,dx);if(th<0)th+=Math.PI*2;
      if(r>7.7)continue;
      let c;
      if(r>7.0)c=P.o;
      else if(r>5.9){const seg=Math.floor((th+f*(Math.PI*2/10*2)/4)/(Math.PI*2/10))%2;c=seg?P.r1:P.r2;}
      else{
        if(r<1.6)c=P.a;
        else{const sp=((th-f*(Math.PI*2/3)/4+r*.8)/(Math.PI*2/3));const fr=sp-Math.floor(sp);c=fr<.16?P.a:fr<.3?P.b:fr<.42?P.d:P.core;}
      }
      g[y][x]=c;
    }
    frames.push(g);
  }
  return frames;
}
GEN.portal_gold={frames:portalFrames('gold')};GEN.portal_void={frames:portalFrames('void')};
function caravanFrames(){
  const O='#2a1a0c',T='#d9a860',TD='#a8743a',TL='#ecc888',W='#8a5a2a',WL='#b8803a',WD='#5a3a1a',R='#c0442a',C='#f4efe0',P='#6a4a8a',PL='#8e6cb4',F='#e8b890',G='#f4b942',GD='#b47a14',S='#c9b078',RD='#8a2a1a';
  const mk=(ph)=>{
    const N=32,g=Array.from({length:N},()=>Array(N).fill(null));
    const px=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<N&&y>=0&&y<N)g[y][x]=c;};
    const r=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(x+i,y+j,c);};
    const el=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1)px(x,y,c);}};
    const ln=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)px(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);};
    const bob=ph%2;
    // Kamelbeine (hinten, vorne), je nach Phase angehoben
    const leg=(x,lift)=>{r(x,21,2,8-lift,TD);r(x,29-lift,2,1,O);};
    leg(18,ph===1?2:0);leg(21,ph===3?2:0);leg(26,ph===3?2:0);leg(29,ph===1?2:0);
    // Wagenrad
    el(8,25,4.2,4.2,WD);el(8,25,3,3,WL);
    const ang=ph*Math.PI/4;for(let k=0;k<4;k++){const a=ang+k*Math.PI/2;ln(8,25,8+Math.cos(a)*3.4,25+Math.sin(a)*3.4,WD);}px(8,25,GD);
    // Ladefläche
    r(1,17,14,5,W);r(1,17,14,1,WL);r(1,21,14,1,WD);for(let x=3;x<14;x+=4)r(x,18,1,3,WD);
    r(0,16,1,7,WD);r(15,16,1,7,WD);
    // Deichsel + Geschirr
    r(15,19,4,1,WD);ln(18,19,20,18+bob,O);
    // Plane (rot/weiß), Reifen
    for(let x=1;x<=10;x++){const hh=Math.round(Math.sqrt(Math.max(0,1-Math.pow((x-5.5)/5.2,2)))*8);for(let y=16-hh;y<16;y++)px(x,y,(x+((y)>>1))%2?R:C);}
    r(1,15,10,1,RD);
    // Säcke hinten auf der Plane
    el(3,15,2.2,1.8,S);px(3,14,TD);el(7,14,2,1.6,S);
    // Händler vorne auf dem Wagen
    r(11,13,4,4,P);r(11,13,4,1,PL);r(12,9,3,4,F);px(13,11,O);px(14,11,O);r(12,7,3,2,PL);r(11,8,5,1,GD);px(15,8,G);r(15,12,1,1,TD);
    // Kamel: Körper, Höcker, Decke
    el(24,18+bob,7,3.6,T);el(24,20+bob,6,1.6,TL);r(18,17+bob,12,1,TD);
    el(23,13+bob,2.6,2.6,T);r(20,15+bob,8,2,R);r(20,15+bob,8,1,G);r(20,17+bob,8,1,RD);
    // Hals und Kopf
    ln(29,16+bob,30,8+bob,T);ln(28,16+bob,29,8+bob,T);r(29,10+bob,2,5,T);
    r(27,5+bob,5,3,T);r(30,8+bob,2,1,TD);px(29,5+bob,O);r(28,3+bob,1,2,TD);r(30,3+bob,1,2,TD);
    // Schwanz
    ln(17,17+bob,15,20,TD);
    // Funkeln
    if(ph===2){px(13,6,G);px(12,5,C);px(14,5,C);}
    // Kontur
    const o=g.map(row=>row.slice());
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(g[y][x])continue;
      if((y>0&&g[y-1][x])||(y<N-1&&g[y+1][x])||(x>0&&g[y][x-1])||(x<N-1&&g[y][x+1]))o[y][x]=O;}
    return o;
  };
  return [mk(0),mk(1),mk(2),mk(3)];
}
GEN.wanderer={frames:caravanFrames(),size:32};
MT.decoy={name:'Trugbild',hp:1,dmg:1,pts:0,col:'#cfc8a0',body:'human',z:2,decoy:1};
MT.wanderer={name:'Wandernder Händler',hp:99,dmg:0,pts:0,col:'#d9b45a',body:'human',npc:1,z:0};
const BYNAME={Schleim:'slime',Bogenschütze:'archer',Brocken:'brute',Geist:'ghost'};
const BOSSES=[];            /* BOSSES[zone] = [id5,id10] */
for(const k of ['slime','archer','brute','ghost','king'])MT[k].z=0;
MT.slime.body='blob';MT.archer.body='human';MT.brute.body='golem';MT.ghost.body='wisp';MT.king.body='human';
Object.assign(MT.slime,{d:1,w:6,dumb:1});
Object.assign(MT.archer,{d:2,w:3,shoot:1,rng:4});
Object.assign(MT.brute,{d:3,w:3,slow:1});
Object.assign(MT.ghost,{d:4,w:2,ghost:1});
Object.assign(MT.king,{boss:1,slow:1,summon:'slime',sumN:3});
ROSTER[0]=['slime','archer','brute','ghost'];
RAW.forEach((zone,z)=>{
  const ids=z===0?ROSTER[0]:(ROSTER[z]=[]);
  zone.forEach((r,i)=>{
    const [name,body,main,acc,kind,hp,dmg,d,f]=r;
    const id='e'+z+'_'+i;BYNAME[name]=id;
    const nf=Object.keys(f).filter(k=>TR[k]).length;
    MT[id]={name,hp,dmg,pts:Math.round((10*hp+10*dmg+8*nf+12*z)/5)*5,col:main,d,w:3,z,body,...f};
    GEN[id]={body,main,acc,kind};ids.push(id);
  });
});
BOSSRAW.forEach((pair,z)=>{
  BOSSES[z]=pair.map((r,k)=>{
    if(!r)return 'king';
    const [name,body,main,acc,kind,hp,dmg,f]=r;
    const id='b'+z+'_'+k;BYNAME[name]=id;
    MT[id]={name,hp,dmg,pts:200+z*100+k*100,col:main,boss:1,z,body,bi:k,...f};
    GEN[id]={body,main,acc,kind};return id;
  });
});
/* Verweise (Name -> ID) auflösen */
for(const id of Object.keys(MT)){const T=MT[id];if(typeof T.split==='string')T.split=BYNAME[T.split]||T.split;if(typeof T.summon==='string')T.summon=BYNAME[T.summon]||T.summon;}
BOSSES[0][0]='king';
Object.assign(MT.king,{summon:'slime',bm:'ward'});
MT.king.name='Würfelkönig';MT.king.bi=0;
const DIES={bones:'hinterlässt manchmal ein Herz',coins:'lässt Münzen fallen',sand:'hinterlässt Treibsand',spore:'platzt in eine Giftwolke',gale:'platzt in einen Windstoß, der Nachbarn und dich wegschleudert',gear:'gibt dir 2 gratis Schritte',frost:'erstarrt alle Nachbarn',wave:'platzt in eine Welle, die Nachbarn zurückdrängt und Feuer löscht',ember:'hinterlässt Flammen',void:'reißt ein Loch: du wirst ein Stück versetzt'};
const BM_TXT={ward:'Ein Schutzschild halbiert den Schaden, solange seine Diener leben.',dieroll:'Würfelt seine Angriffe aus: jeder Wurf wirkt anders.',hoard:'Raubt Münzen und streut sie in der Wut wieder aus.',devour:'Frisst Münzen vom Boden und heilt sich damit.',decoys:'Wirft Trugbilder von sich, die bei einem Treffer vergehen.',burrowb:'Gräbt sich ein und bricht neben dir wieder hervor.',vines:'Lässt Ranken um dich wachsen.',slimetrail:'Hinterlässt eine Giftspur.',gustback:'Jeder Nahkampftreffer schleudert dich zurück.',bolt:'Ruft Blitze auf dich herab, nur neben einer Wand bist du sicher.',rewindb:'Spult die Zeit zurück: du landest zwei Züge früher, er heilt sich.',clock:'Ein Zeiger kreist um ihn und schlägt Linien in den Boden.',shell:'Ein Glasschild fängt Treffer ab, bis es zerbricht.',iceflood:'Überzieht den Boden mit Glatteis.',tide:'Ruft die Flut: der Boden wird zu Wasser.',inkb:'Hüllt alles in Tinte, du siehst nur noch Nachbarn.',lava:'Lässt Lava aufsteigen, vorher glüht der Boden.',rebirth:'Steigt einmal aus der Asche wieder auf.',gravity:'Zieht dich Zug um Zug zu sich heran.',worldshift:'Verschiebt die Wände des Raums.'};
const traitText=T=>Object.keys(TR).filter(k=>T[k]).map(k=>TR[k]).concat(T.dies?[DIES[T.dies]]:[]).concat(T.bm?[BM_TXT[T.bm]]:[]).join(', ');
const zoneOf=d=>Math.floor((d-1)/10);                 /* 0..: Zone der Etage */
const posOf=d=>((d-1)%10)+1;                          /* Etage innerhalb der Zone */
/* Wurf-Item je Zone (zählt in G.bombs). Beim Zonenwechsel im Händler umtauschbar. */
function settleBasic(m){settleSpike(m);}
function settle(m){settleSpike(m);terrM(m);}
function settleSpike(m){
  if(!G.mons.includes(m))return;
  const T=MT[m.type];
  if(G.traps&&G.traps.length&&!(T.ghost||T.body==='wing'||T.body==='wisp')){const ti=G.traps.indexOf(m.pos);if(ti>=0){G.traps.splice(ti,1);floatText(m.pos,'Falle!','gold');sfx('spike');m.stun=Math.max(m.stun||0,2);hitMonster(m,2,true);return;}}
  if(G.spikes.has(m.pos)&&!T.ghost&&T.body!=='wing'&&T.body!=='wisp'){
    if(m.spk!==m.pos){m.spk=m.pos;floatText(m.pos,'Stachel','red');sfx('spike');hitMonster(m,1,false);}
  }else m.spk=-1;
}
function pull(m,steps,to){
  for(let i=0;i<steps;i++){
    if(!G.mons.includes(m))return;
    const T=MT[m.type],src=to===undefined?G.pos:to,dd=bfs(src,null),cur=dd.get(m.pos);if(cur===undefined||cur===0)return;
    const c=NB[m.pos].filter(n=>n!==G.pos&&!monAt(n)&&(T.ghost||!G.walls.has(n))&&dd.get(n)!==undefined&&dd.get(n)<cur);
    if(!c.length)return;m.pos=pick(c);settle(m);
  }
}
const AIM=5;
function areaOf(t,r){
  let a=new Set([t]);
  for(let i=0;i<r;i++){const n=new Set(a);for(const c of a){for(const x of NB[c])n.add(x);for(const x of ND[c].keys())n.add(x);}a=n;}
  for(const c of [...a])if(G.walls.has(c))a.delete(c);
  return a;
}
const monsIn=ar=>G.mons.filter(m=>ar.has(m.pos));
function addField(kind,cells,ttl,c){G.fields.push({kind,cells:[...cells],ttl,c});}
const fieldAt=i=>{let k=null;for(const f of G.fields||[])if(f.cells.includes(i))k=f.kind;return k;};
const KZ=k=>({z:ZKIND.indexOf(k)});
const AMMO={
  gruft:{name:'Bombe',ico:'bomb',desc:'explodiert am Zielfeld und trifft 3×3 Felder mit 2 Schaden. Steht du mittendrin, trifft sie auch dich',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));boomFx(t,KZ('gruft'));sfx('boom');shake();
      const hit=monsIn(ar);for(const m of hit)hitMonster(m,G.master?3:2,false);
      if(ar.has(G.pos)){floatText(G.pos,'Eigenschaden','red');hurtPlayer(1,null);}return hit;}},
  gold:{name:'Beutel',ico:'ammo_gold',desc:'Münzregen am Zielfeld: 1 Schaden, Gegner und Diebe rennen 4 Züge zum Gold',
    async throw(t){const ar=areaOf(t,2+(G.wide?1:0));sfx('coins');burst(t,'#ffe27a',16);boomFx(t,KZ('gold'));
      const hit=monsIn(ar);const d=bfs(t,G.walls);
      for(const m of hit){if(hitMonster(m,G.master?2:1,false))continue;m.lure={c:t,n:4,d};floatText(m.pos,'Gold!','gold');}
      return hit;}},
  wueste:{name:'Sand',ico:'ammo_wueste',desc:'Sandwolke am Zielfeld: Gegner darin sind 4 Züge blind',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));sfx('dust');boomFx(t,KZ('wueste'));addField('sand',ar,4,t);return monsIn(ar);}},
  moor:{name:'Sporen',ico:'ammo_moor',desc:'Giftwolke am Zielfeld: Gegner darin bleiben 4 Züge vergiftet',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));sfx('spore');boomFx(t,KZ('moor'));addField('spore',ar,4,t);return monsIn(ar);}},
  wind:{name:'Windladung',ico:'ammo_wind',desc:'Windstoß am Zielfeld: schleudert Gegner 4 Felder von dir weg, Aufprall macht Schaden',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));sfx('gust');gustFx(G.pos,t);boomFx(t,KZ('wind'));
      const hit=monsIn(ar);for(const m of hit)knock(m,G.master?5:4);return hit;}},
  uhrwerk:{name:'Batterie',ico:'ammo_uhrwerk',desc:'Blitz springt vom Zielfeld über bis zu 4 Gegner, je 1 Schaden und Stromschlag',
    async throw(t){
      const hit=[],jumps=G.wide?5:4;
      const near=(c,r)=>{const d=bfs(c,null);return G.mons.filter(m=>!hit.includes(m)&&(d.get(m.pos)===undefined?99:d.get(m.pos))<=r).sort((a,b)=>d.get(a.pos)-d.get(b.pos))[0];};
      let m=near(t,2);
      if(!m){boltFx(G.pos,t);burst(t,'#ffe27a',8);floatText(t,'Funken','gold');sfx('zap');return hit;}
      boltFx(G.pos,m.pos);
      for(let i=0;i<jumps&&m;i++){
        sfx('zap');hit.push(m);const p=m.pos;burst(p,'#ffe27a',8);
        if(!hitMonster(m,G.master?2:1,false)&&G.mons.includes(m))m.stun=Math.max(m.stun||0,1);
        const nx=near(p,3);if(nx)boltFx(p,nx.pos);m=nx;await sleep(130);
      }
      return hit;}},
  eis:{name:'Frost',ico:'ammo_eis',desc:'Eisfeld am Zielfeld: 1 Schaden, Gegner darin bleiben 5 Züge eingefroren',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));sfx('shatter');boomFx(t,KZ('eis'));addField('ice',ar,5,t);
      const hit=monsIn(ar);for(const m of hit)hitMonster(m,G.master?2:1,false);return hit;}},
  tiefsee:{name:'Strudel',ico:'ammo_tiefsee',desc:'Wasserstrudel am Zielfeld: zieht Gegner 3 Züge lang zur Mitte, dort 1 Schaden pro Zug',
    async throw(t){const ar=areaOf(t,2+(G.wide?1:0));sfx('bubble');boomFx(t,KZ('tiefsee'));addField('whirl',ar,3,t);return monsIn(ar);}},
  glut:{name:'Fass',ico:'ammo_glut',desc:'Feuerfass am Zielfeld: 3 Schaden in der Mitte, 4 Züge Flammen drumherum (auch für dich gefährlich)',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));sfx('fireball');boomFx(t,KZ('glut'));shake();addField('fire',ar,4,t);
      const hit=monsIn(ar);for(const m of hit)hitMonster(m,m.pos===t?(G.master?4:3):1,false);
      if(ar.has(G.pos)){floatText(G.pos,'Flammen','red');hurtPlayer(1,null);}return hit;}},
  leere:{name:'Leere',ico:'ammo_leere',desc:'Riss am Zielfeld: Gegner darin nehmen 1 Schaden und werden weit weggeschleudert',
    async throw(t){const ar=areaOf(t,1+(G.wide?1:0));const dA=bfs(G.pos,null);sfx('voidzap');boomFx(t,KZ('leere'));
      const hit=monsIn(ar);
      for(const m of hit){if(hitMonster(m,G.master?2:1,false))continue;
        const c=SHELL.filter(i=>(dA.get(i)||0)>=5&&!G.walls.has(i)&&!monAt(i)&&i!==G.exit&&i!==G.pos);
        if(c.length){burst(m.pos,MT[m.type].col,8);m.pos=pick(c);settle(m);}}
      return hit;}}
};
function tickFields(){
  if(!G.fields||!G.fields.length)return;
  for(const f of G.fields){
    const cs=new Set(f.cells);
    for(const m of G.mons.slice()){
      if(!G.mons.includes(m)||!cs.has(m.pos))continue;
      const boss=MT[m.type].boss;
      if(f.kind==='sand'&&!boss){m.stun=Math.max(m.stun||0,1);}
      else if(f.kind==='ice'&&!boss){m.stun=Math.max(m.stun||0,1);}
      else if(f.kind==='spore'){m.poison=Math.max(m.poison||0,2);}
      else if(f.kind==='fire'){if(!hitMonster(m,1,false))m.poison=Math.max(m.poison||0,1);}
      else if(f.kind==='cloud'){m.poison=Math.max(m.poison||0,2);}
      else if(f.kind==='whirl'){if(m.pos===f.c)hitMonster(m,1,false);else pull(m,1,f.c);}
    }
    if(f.kind==='cloud'&&cs.has(G.pos)&&G.hp>0&&!(G.psn>0)){setPoison();}
    if(f.kind==='fire'&&cs.has(G.pos)&&G.hp>0){floatText(G.pos,'Brand','red');sfx('crackle');hurtPlayer(1,null);}
    f.ttl--;
  }
  G.fields=G.fields.filter(f=>f.ttl>0);
}
const CLS_BLOCK={
  zauberer:['heart','titan','spear','harpoon','sling','lens','bombs','sack','master','sandy'],
  schatz:['bombs','sack','master','sandy','wide'],
  waechter:['spear','harpoon','sling','lens','swift','tailwind','wide','bombs','sack','master','sandy'],
  jaeger:['spear','assassin','master','sandy'],
  dieb:['veil','assassin','master','sandy'],
  alchemist:['bombs','sack','master','sandy','wide']
};
const ZPICKS={wueste:['p_skarab','p_ankh'],uhrwerk:['p_zahnrad','p_oel'],tiefsee:['p_perle','p_muschel'],wind:['p_windfeder','p_wirbel'],gold:['p_barren','p_kleeblatt','chest','chest'],moor:['p_beere','p_pilz'],eis:['p_kristall','p_schneeherz'],glut:['p_glutkern','p_feder'],leere:['p_splitter','p_mantel']};
const PICKN={p_skarab:'Skarabäus',p_ankh:'Anch',p_zahnrad:'Zahnrad',p_oel:'Ölkanne',p_perle:'Perle',p_muschel:'Muschel',p_windfeder:'Windfeder',p_wirbel:'Wirbelwind',p_barren:'Goldbarren',p_kleeblatt:'Kleeblatt',chest:'Truhe',p_beere:'Moorbeere',p_pilz:'Glühpilz',p_kristall:'Eiskristall',p_schneeherz:'Schneeherz',p_glutkern:'Glutkern',p_feder:'Aschefeder',p_splitter:'Sternensplitter',p_mantel:'Schattenmantel'};
const BOSSMV={
  gruft:[['Schleimsturm','wave',3,'boom'],['Würfelregen','rain',5,'boom']],
  gruft2:[['Kaiserhieb','ring',1,'boom'],['Würfelsturm','rain',7,'boom']],
  gold:[['Raubzug','pull',3,'coins'],['Münzsturm','ring',2,'coins']],
  gold2:[['Drachenatem','line',6,'fire'],['Goldregen','rain',6,'coins']],
  wueste:[['Sandsturm','stasis',1,'sand'],['Fluch','ring',2,'sand']],
  wueste2:[['Wurmbiss','pull',3,'sand'],['Aufbruch','rain',5,'sand']],
  moor:[['Ranken','pull',2,'spore'],['Sporenwolke','ring',2,'spore']],
  moor2:[['Giftstrahl','line',6,'spore'],['Würgegriff','pull',4,'spore']],
  wind:[['Orkan','push',3,'wind'],['Windhose','ring',2,'wind']],
  wind2:[['Donnerschlag','rain',4,'bolt'],['Sturmlinie','line',7,'wind']],
  uhrwerk:[['Zeitstopp','stasis',2,'steam'],['Dampfstoß','ring',2,'steam']],
  uhrwerk2:[['Stundenschlag','ring',3,'steam'],['Zeiger','line',7,'bolt']],
  eis:[['Splitterregen','rain',5,'ice'],['Eiseskälte','stasis',1,'ice']],
  eis2:[['Eiswelle','line',7,'ice'],['Kristallsturm','rain',7,'ice']],
  tiefsee:[['Sog','pull',4,'bubble'],['Strudel','ring',2,'bubble']],
  tiefsee2:[['Flutwelle','line',8,'bubble'],['Verschlingen','pull',5,'bubble']],
  glut:[['Flammenring','ring',2,'fire'],['Feuerregen','rain',6,'fire']],
  glut2:[['Feuerodem','line',7,'fire'],['Meteorsturm','rain',8,'fire']],
  leere:[['Leerensog','pull',4,'void'],['Schattenring','ring',2,'void']],
  leere2:[['Würfelwurf','chaos',0,'void'],['Weltenende','rain',9,'void']]
};
const DIEMOVES=[['Schleimsturm','wave',3,'boom'],['Würfelregen','rain',5,'boom'],['Kaiserhieb','ring',1,'boom'],['Würfelsturm','rain',7,'boom'],['Würfelwurf','chaos',0,'void'],['Sog','pull',3,'void']];
const bossMoves=T=>BOSSMV[ZKIND[T.z||0]+(T.bi===1?'2':'')];
const BOSSLINE={gruft:'Niemand verlässt die Gruft.',gold:'Alles Gold gehört mir!',wueste:'Der Sand begräbt jeden.',moor:'Der Sumpf holt dich.',wind:'Der Sturm kennt kein Erbarmen.',uhrwerk:'Deine Zeit läuft ab.',eis:'Alles erstarrt unter meinem Blick.',tiefsee:'Die Tiefe verschlingt dich.',glut:'Verbrenne!',leere:'Es gibt kein Entkommen aus dem Nichts.'};
const AVOIDT=new Set(['lava','quick','vines','chute','rift','water']);
const FLY=m=>{const T=MT[m.type];return !!(T.ghost||T.body==='wing'||T.body==='wisp');};
const terrOf=i=>G.terrain&&G.terrain.get(i);
function tstep(c,d,walls){const [x,y,z]=xyz(c);const a=x+d[0],b=y+d[1],e=z+d[2];if(!isShell(a,b,e))return -1;const n=idx(a,b,e);return (walls||G.walls).has(n)?-1:n;}
function dirBetween(a,b){const [x,y,z]=xyz(a),[X,Y,Z]=xyz(b);return DIRS.findIndex(d=>d[0]===X-x&&d[1]===Y-y&&d[2]===Z-z);}
function tdir(tr){let d=tr.d;if(d===undefined||d<0)return -1;if(tr.k==='current'&&Math.floor(G.turns/3)%2===1)d^=1;return d;}
const avoidT=(m,n)=>{const tr=terrOf(n);return !!tr&&AVOIDT.has(tr.k)&&!FLY(m)&&!(G.flood&&tr.k==='water');};
const nearTen=d=>Math.max(10,Math.round(d/10)*10);    /* 33 -> 30 */

