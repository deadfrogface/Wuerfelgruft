/* src/js/lodge/camp-data.js
   Gruftlager: Plätze und Dekoration (Daten). */
/* ================= Gruftlager: eigener Raum mit Deko ================= */
const CAMP_SLOTS=[['w1','wand','Wand links'],['w2','wand','Wand Mitte'],['w3','wand','Wand rechts'],['f1','boden','Boden links'],['f2','boden','Boden Mitte'],['f3','boden','Boden rechts'],['t1','tisch','Regal links'],['t2','tisch','Regal rechts'],['w4','wand','Wand oben links'],['w5','wand','Wand oben rechts'],['t3','tisch','Tisch unten links'],['t4','tisch','Tisch unten rechts'],['f4','boden','Boden oben links'],['f5','boden','Boden oben rechts']];
const CAMP_PROPS=[
  {id:'p_fackel',n:'Fackel',ico:'i_torch',price:300,at:['wand','tisch']},
  {id:'p_buch',n:'Zauberbuch',ico:'i_book',price:250,at:['tisch']},
  {id:'p_schriftrolle',n:'Schriftrolle',ico:'i_scroll',price:200,at:['tisch','wand']},
  {id:'p_amboss',n:'Amboss',ico:'i_forge',price:500,at:['boden','tisch']},
  {id:'p_sonne',n:'Sonnenschild',ico:'i_sun',price:700,at:['wand']},
  {id:'p_schluessel',n:'Goldener Schlüssel',ico:'s-key',price:400,at:['wand','tisch']},
  {id:'p_herz',n:'Herz der Gruft',ico:'s-heart',price:900,at:['tisch','wand']},
  {id:'p_schild',n:'Wappenschild',ico:'s-shield',price:600,at:['wand']},
  {id:'p_schwert',n:'Ahnenschwert',ico:'s-blade',price:800,at:['wand']},
  {id:'p_chip',n:'Casino-Chip',ico:'i_chip',price:350,at:['tisch']},
  {id:'p_wuerfel',n:'Gruftwürfel',ico:'i_dice',price:1200,at:['boden','tisch']}
];
function campItems(type){
  const out=[];
  if(type==='boden'){for(const id of dexMons())if(!MT[id].boss&&starsOf(id)>=1)out.push({id:'st:'+id,n:'Statue: '+MT[id].name,ico:id,price:0,kind:'statue'});}
  if(type==='wand'){for(const id of dexMons())if(MT[id].boss&&((save.dex[id]||{}).k||0)>=1)out.push({id:'tr:'+id,n:'Trophäe: '+MT[id].name,ico:id,price:0,kind:'trophy'});}
  for(const p of CAMP_PROPS)if(p.at.includes(type))out.push({...p,kind:'prop'});
  return out;
}
function campFind(id){
  if(!id)return null;
  if(id.startsWith('st:')||id.startsWith('tr:')){const m=id.slice(3);return MT[m]?{id,n:MT[m].name,ico:m,kind:id[0]==='s'?'statue':'trophy'}:null;}
  const p=CAMP_PROPS.find(x=>x.id===id);return p?{...p,kind:'prop'}:null;
}
