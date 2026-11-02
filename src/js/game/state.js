/* src/js/game/state.js
   Laufzustand G und Hilfen für Zustände und Felder. */
/* ================= Zustand ================= */
const GOAL=ZONES.length*10;   /* letzte Etage = Ende der letzten Zone mit eigenem Inhalt */
let G=null;
let view=FACES.F;
let flipping=false;
const entEls=new Map();
const cellEls=[],edgeEls={},chipEls={};
const board=$('#board'),grid=$('#grid'),entLayer=$('#ents'),fxLayer=$('#fx'),frame=$('#frame');

const UPS=[
  {id:'heart',ico:'s-heart',tier:0,name:'Stählernes Herz',desc:'+2 maximale Leben und heilt 2.',can:()=>G.maxhp<12&&!DF().fixed,apply(){G.maxhp+=2;G.hp=Math.min(G.maxhp,G.hp+2);}},
  {id:'potion',ico:'s-potion',tier:0,name:'Heiltrank',desc:'Heilt sofort 4 Leben.',can:()=>G.hp<G.maxhp,apply(){G.hp=Math.min(G.maxhp,G.hp+4);}},
  {id:'blade',ico:'s-blade',tier:0,name:'Scharfe Klinge',desc:'+1 Schaden bei jedem Angriff.',can:()=>G.dmg<4,apply(){G.dmg++;}},
  {id:'spear',ico:'s-spear',tier:0,name:'Speer',desc:'Greife Gegner zwei Felder entfernt an, wenn sie in gerader Linie stehen.',can:()=>!G.spear,apply(){G.spear=true;}},
  {id:'shield',ico:'s-shield',tier:0,name:'Eisenhaut',desc:'Blockt den ersten Schaden jeder Etage.',can:()=>G.shieldMax<3,apply(){G.shieldMax++;}},
  {id:'thorns',ico:'s-thorns',tier:0,name:'Dornenpanzer',desc:'Wer dich trifft, nimmt 1 Schaden.',can:()=>!G.thorns,apply(){G.thorns=true;}},
  {id:'leech',ico:'s-drop',tier:0,name:'Blutdurst',desc:'Jeder dritte besiegte Gegner heilt 1 Leben.',can:()=>!G.leech,apply(){G.leech=true;}},
  {id:'chase',ico:'s-bolt',tier:0,name:'Nachsetzen',desc:'Der erste Sieg jeder Etage kostet keinen Zug.',can:()=>G.chase<3,apply(){G.chase++;}},
  {id:'bombs',ico:'s-bomb',tier:0,name:'Wurfvorrat',desc:'+2 Wurf-Items der aktuellen Zone.',can:()=>true,apply(){G.bombs+=2;}},
  {id:'time',ico:'undo',tier:0,name:'Zeitriss',desc:'+1 Zurück pro Etage.',can:()=>G.undoBonus<2&&!DF().noUndo,apply(){G.undoBonus++;}},
  {id:'loot',ico:'u-loot',tier:1,name:'Beutegier',desc:'Besiegte Gegner und ihre Beute geben 50 % mehr Münzen.',can:()=>!G.loot,apply(){G.loot=true;}},
  {id:'haggle',ico:'u-haggle',tier:1,name:'Feilscher',desc:'Händler verlangen 20 % weniger.',can:()=>G.haggle<2,apply(){G.haggle++;}},
  {id:'income',ico:'u-income',tier:1,name:'Reicher Erbe',desc:'+10 Münzen für jede geschaffte Zone-Etage.',can:()=>G.income<3,apply(){G.income++;}},
  {id:'net',ico:'u-net',tier:1,name:'Fangnetz',desc:'Flüchtende Gegner und Diebe sind langsamer.',can:()=>!G.net,apply(){G.net=true;}},
  {id:'hunter',ico:'u-hunter',tier:1,name:'Räuberjäger',desc:'Doppelter Schaden gegen Diebe, Goblins und Gegner mit Beute.',can:()=>!G.hunter,apply(){G.hunter=true;}},
  {id:'lockpick',ico:'u-lockpick',tier:1,name:'Dietrich',desc:'Öffnet 3 versiegelte Treppen ohne Schlüssel.',can:()=>G.lockpicks<6,apply(){G.lockpicks+=3;}},
  {id:'veil',ico:'u-veil',tier:2,name:'Sandschleier',desc:'Gegner, die weiter als 2 Schritte entfernt sind, bemerken dich nicht (außer Bosse).',can:()=>!G.veil,apply(){G.veil=true;}},
  {id:'curse',ico:'u-curse',tier:2,name:'Pharaonenfluch',desc:'Getroffene Gegner nehmen beim nächsten Treffer +1 Schaden.',can:()=>!G.curse,apply(){G.curse=true;}},
  {id:'oasis',ico:'u-oasis',tier:2,name:'Oase',desc:'Heilt 1 Leben beim Betreten einer neuen Etage.',can:()=>G.oasis<3,apply(){G.oasis++;}},
  {id:'maprel',ico:'u-maprel',tier:2,name:'Schatzkarte',desc:'Jede Etage versteckt ein zusätzliches Fundstück.',can:()=>!G.maprel,apply(){G.maprel=true;}},
  {id:'sandy',ico:'u-sandy',tier:2,name:'Sandkörner',desc:'Wurf-Items betäuben Gegner zusätzlich 1 Zug.',can:()=>!G.sandy,apply(){G.sandy=true;}},
  {id:'assassin',ico:'u-assassin',tier:2,name:'Meuchler',desc:'Doppelter Schaden gegen betäubte oder schlafende Gegner.',can:()=>!G.assassin,apply(){G.assassin=true;}},
  {id:'gears',ico:'u-gears',tier:5,name:'Getriebe',desc:'Jeder fünfte Zug: alle Gegner setzen aus.',can:()=>!G.gears,apply(){G.gears=true;}},
  {id:'rod',ico:'u-rod',tier:5,name:'Blitzableiter',desc:'Wirst du verletzt, nehmen Gegner neben dir 1 Schaden.',can:()=>!G.rod,apply(){G.rod=true;}},
  {id:'torch',ico:'u-torch',tier:5,name:'Schweißbrenner',desc:'Deine Treffer ignorieren Rüstung.',can:()=>!G.torch,apply(){G.torch=true;}},
  {id:'spare',ico:'u-spare',tier:5,name:'Ersatzteile',desc:'Herzen heilen 1 Leben mehr.',can:()=>!G.spare,apply(){G.spare=true;}},
  {id:'lens',ico:'u-lens',tier:5,name:'Präzisionslinse',desc:'Speer und Schleuder reichen 1 Feld weiter.',can:()=>!G.lens,apply(){G.lens=true;}},
  {id:'chain',ico:'u-chain',tier:5,name:'Kettenantrieb',desc:'Jeder Sieg schenkt dir einen gratis Schritt.',can:()=>!G.chain,apply(){G.chain=true;}},
  {id:'pearl',ico:'u-pearl',tier:7,name:'Perlenkette',desc:'Münzen geben doppeltes Geld.',can:()=>!G.pearl,apply(){G.pearl=true;}},
  {id:'ink',ico:'u-ink',tier:7,name:'Tintenwolke',desc:'Nach einem Treffer bemerken dich Gegner mit 50 % Chance 1 Zug lang nicht.',can:()=>!G.ink,apply(){G.ink=true;}},
  {id:'harpoon',ico:'u-harpoon',tier:7,name:'Harpune',desc:'Greife Gegner bis 4 Felder entfernt an und ziehe sie ein Feld heran.',can:()=>!G.harpoon,apply(){G.harpoon=true;}},
  {id:'feast',ico:'u-feast',tier:7,name:'Fressrausch',desc:'Jeder zweite Sieg heilt 1 Leben.',can:()=>!G.feast,apply(){G.feast=true;}},
  {id:'volt',ico:'u-volt',tier:7,name:'Kettenblitz',desc:'Jeder Treffer verletzt Nachbarn des Ziels um 1.',can:()=>!G.volt,apply(){G.volt=true;}},
  {id:'anchor',ico:'u-anchor',tier:7,name:'Anker',desc:'Kein Rückstoß und keine Betäubung mehr.',can:()=>!G.anchor,apply(){G.anchor=true;}},
  {id:'crit',ico:'u-crit',tier:3,name:'Glückstreffer',desc:'+15 % Chance auf doppelten Schaden.',can:()=>G.crit<4,apply(){G.crit++;}},
  {id:'armor',ico:'u-armor',tier:3,name:'Kettenhemd',desc:'Treffer mit 2 oder mehr Schaden richten 1 weniger an.',can:()=>!G.armor,apply(){G.armor=true;}},
  {id:'rest',ico:'u-rest',tier:3,name:'Lagerfeuer',desc:'Heilt 2 Leben, wenn du eine Etage schaffst.',can:()=>G.rest<3,apply(){G.rest++;}},
  {id:'sling',ico:'u-sling',tier:3,name:'Schleuder',desc:'Greife Gegner bis zu drei Felder entfernt an, in gerader Linie.',can:()=>!G.sling,apply(){G.sling=true;}},
  {id:'boots',ico:'u-boots',tier:3,name:'Lederstiefel',desc:'Stacheln tun dir nichts mehr.',can:()=>!G.boots,apply(){G.boots=true;}},
  {id:'wide',ico:'u-wide',tier:3,name:'Splitterwurf',desc:'Wurf-Items reichen einen Schritt weiter.',can:()=>!G.wide,apply(){G.wide=true;}},
  {id:'gale',ico:'u-gale',tier:4,name:'Windklinge',desc:'Treffer schleudern Gegner ein Feld zurück (außer Bosse).',can:()=>!G.gale,apply(){G.gale=true;}},
  {id:'gustshield',ico:'u-gustshield',tier:4,name:'Böenschild',desc:'Wer dich trifft, wird ein Feld weggeweht.',can:()=>!G.gustshield,apply(){G.gustshield=true;}},
  {id:'tailwind',ico:'u-tailwind',tier:4,name:'Rückenwind',desc:'Jede Etage beginnt mit 2 gratis Schritten.',can:()=>G.tailwind<3,apply(){G.tailwind++;}},
  {id:'sack',ico:'u-sack',tier:4,name:'Windsack',desc:'+1 Wurf-Item pro geschaffter Etage.',can:()=>G.sack<2,apply(){G.sack++;}},
  {id:'shadow',ico:'u-shadow',tier:4,name:'Windschatten',desc:'Fernangriffe verfehlen dich mit 35 % Chance.',can:()=>!G.shadow,apply(){G.shadow=true;}},
  {id:'fury',ico:'u-fury',tier:4,name:'Sturmzorn',desc:'+1 Schaden, solange du höchstens halbe Leben hast.',can:()=>!G.fury,apply(){G.fury=true;}},
  {id:'stun',ico:'u-stun',tier:6,name:'Betäubungsschlag',desc:'Getroffene Gegner setzen einen Zug aus (außer Bosse).',can:()=>!G.stun,apply(){G.stun=true;}},
  {id:'splash',ico:'u-splash',tier:6,name:'Kettenreaktion',desc:'Besiegte Gegner verletzen ihre Nachbarn um 1.',can:()=>!G.splash,apply(){G.splash=true;}},
  {id:'regen',ico:'u-regen',tier:6,name:'Regeneration',desc:'Heilt 1 Leben alle 10 Züge, später alle 7 und 5.',can:()=>G.regen<3,apply(){G.regen++;}},
  {id:'dodge',ico:'u-dodge',tier:6,name:'Schemen',desc:'10 % Chance, einem Treffer auszuweichen (bis 30 %).',can:()=>G.dodge<3,apply(){G.dodge++;}},
  {id:'gold',ico:'u-gold',tier:6,name:'Goldrausch',desc:'Münzen geben mehr Punkte, jede vierte heilt 1 Leben.',can:()=>G.gold<3,apply(){G.gold++;}},
  {id:'pick',ico:'u-pick',tier:6,name:'Spitzhacke',desc:'Zerschlage 2 Wände pro Etage durch Antippen.',can:()=>G.pickN<3,apply(){G.pickN++;}},
  {id:'phoenix',ico:'u-phoenix',tier:8,rare:.05,name:'Phönixfeder',desc:'Einmal pro Lauf: Wiederbelebung mit halben Leben. Extrem selten.',can:()=>!G.phoenix,apply(){G.phoenix=true;}},
  {id:'swift',ico:'u-swift',tier:8,name:'Schnellfuß',desc:'Jeder vierte Schritt kostet keinen Zug, später jeder dritte.',can:()=>G.swift<2,apply(){G.swift++;}},
  {id:'frost',ico:'u-frost',tier:8,name:'Frostblick',desc:'Gegner starten jede Etage erstarrt (Bosse nicht).',can:()=>G.frost<2,apply(){G.frost++;}},
  {id:'poison',ico:'u-poison',tier:8,name:'Giftklinge',desc:'Getroffene Gegner nehmen 2 Züge lang je 1 Schaden.',can:()=>!G.poison,apply(){G.poison=true;}},
  {id:'soul',ico:'u-soul',tier:8,name:'Seelenernte',desc:'50 % mehr Punkte für jeden Sieg.',can:()=>!G.soul,apply(){G.soul=true;}},
  {id:'thorns2',ico:'u-thorns2',tier:8,name:'Stachelpanzer',desc:'Dornen verursachen 2 Schaden.',can:()=>!G.thorns2,apply(){G.thorns2=true;G.thorns=true;}},
  {id:'exec',ico:'u-exec',tier:9,name:'Henkersbeil',desc:'+1 Schaden gegen Gegner mit höchstens halbem Leben.',can:()=>!G.exec,apply(){G.exec=true;}},
  {id:'spark',ico:'u-spark',tier:9,name:'Lebensfunke',desc:'Jeder Sieg heilt mit 30 % Chance 1 Leben.',can:()=>!G.spark,apply(){G.spark=true;}},
  {id:'titan',ico:'u-titan',tier:9,name:'Titanenblut',desc:'+4 maximale Leben und volle Heilung.',can:()=>G.maxhp<18&&!DF().fixed,apply(){G.maxhp+=4;G.hp=G.maxhp;}},
  {id:'fang',ico:'u-fang',tier:9,name:'Drachenzahn',desc:'+2 Schaden bei jedem Angriff.',can:()=>!G.fang,apply(){G.fang=true;}},
  {id:'master',ico:'u-master',tier:9,name:'Wurfmeister',desc:'Wurf-Items wirken stärker. +1 Wurf-Item pro Zonenwechsel und Etage.',can:()=>!G.master,apply(){G.master=true;}},
  {id:'aegis',ico:'u-aegis',tier:9,name:'Ägide',desc:'+1 Block pro Etage.',can:()=>G.shieldMax<4,apply(){G.shieldMax+=1;}}
];
const NAMES=['Der Abstieg','Feuchte Gänge','Knochenhalle','Dornengarten','Das Echo','Die Schlucht','Schwarze Kammer','Gläserner Gang','Das Herz','Der letzte Stein'];
const HINTS={
  1:'Tippe auf ein Feld neben dir. Wische, um den Würfel zu drehen: Umsehen kostet einen Zug (auf Leicht nicht). Die Treppe liegt auf einer anderen Seite, das Netz unten zeigt sie.',
  2:'Neu: Bogenschützen. Schraffierte Felder liegen in ihrer Schusslinie. Die Treppe ist versiegelt, finde den Schlüssel.',
  3:'Neu: Brocken. Sie handeln nur jeden zweiten Zug. Das „!“ zeigt, wann.',
  4:'Neu: Geister gleiten durch Wände.',
  5:'Boss: der Würfelkönig ruft Schleime. Besiege ihn, dann öffnet sich die Treppe.',
  10:'Der letzte Boss. Der König ist zäher und ruft mehr Schleime.'
};

const monAt=i=>G.mons.find(m=>m.pos===i);
function hintFor(d,L){
  const z=zoneOf(d),p=posOf(d);
  let h=(p===1&&z>0&&z<ZONES.length?'Neue Zone: '+ZONES[z]+'. Alle Gegner sind neu. ':'');
  if(z===0&&HINTS[d])return HINTS[d];
  if(p===1&&ZTERR[ZKIND[z%ZKIND.length]])h+='Gelände: '+TERR_TIP[ZTERR[ZKIND[z%ZKIND.length]]]+' ';
  if(L&&L.boss){const T=MT[L.bossType];return h+'Boss: '+T.name+' – „'+(BOSSLINE[ZKIND[T.z||0]]||'')+'“ '+(T.bm?BM_TXT[T.bm]+' ':'')+'Wird bei 2/3 und 1/3 Leben wütend. Mit seinem Tod öffnet sich die Treppe.';}
  if(z<ZONES.length){
    const nw=ROSTER[z].filter(id=>MT[id].d===p&&!(z===0&&p===1));
    if(nw.length){
      h+='Neu: '+nw.slice(0,2).map(id=>{const T=MT[id],t=traitText(T);return T.name+(t?' ('+t+')':'');}).join('; ')+(nw.length>2?' u. a':'')+'.';
      return h;
    }
  }
  return h||'Das Netz unten zeigt alle sechs Seiten. Tippe darauf, um hinzusehen.';
}

