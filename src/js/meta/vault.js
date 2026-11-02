/* src/js/meta/vault.js
   Kammer der Schätze: Aussehen gegen Gruftsteine. */
/* ================= Kammer der Schätze: Aussehen gegen Gruftsteine ================= */
const VAULT=[
  {id:'a_glut',type:'aura',n:'Glutaura',d:'Ein warmes Leuchten um den Helden.',price:1000,gl:'255,120,40',sw:'#ff8a3d'},
  {id:'a_frost',type:'aura',n:'Frostaura',d:'Kühles Blau.',price:1000,gl:'120,200,255',sw:'#8fd0e8'},
  {id:'a_gold',type:'aura',n:'Goldaura',d:'Für alle, die es zeigen wollen.',price:2500,gl:'255,215,90',sw:'#ffe27a'},
  {id:'a_leere',type:'aura',n:'Leerenaura',d:'Ein Hauch von Dunkel und Violett.',price:3500,gl:'150,100,255',sw:'#a870e8'},
  {id:'c_obsidian',type:'cube',n:'Obsidian-Würfel',d:'Dunkler Stein mit violetten Edelsteinen.',price:800,sw:'#2c2c3c'},
  {id:'c_eis',type:'cube',n:'Eis-Würfel',d:'Blaues Eis und weiße Kristalle.',price:800,sw:'#6a90b8'},
  {id:'c_glut',type:'cube',n:'Glut-Würfel',d:'Rotbrauner Stein, glühende Edelsteine.',price:1200,sw:'#6a3a32'},
  {id:'c_smaragd',type:'cube',n:'Smaragd-Würfel',d:'Grüner Stein.',price:1500,sw:'#3a6a4a'},
  {id:'c_gold',type:'cube',n:'Gold-Würfel',d:'Der teuerste Würfel der Gruft.',price:4000,sw:'#a8843a'},
  {id:'t_gier',type:'title',n:'Titel: der Gierige',d:'Ein Name, den jeder lesen soll.',price:800,tn:'der Gierige'},
  {id:'t_fuerst',type:'title',n:'Titel: Münzfürst',d:'Für Sammler von Gruftsteinen.',price:1500,tn:'Münzfürst'},
  {id:'t_koenig',type:'title',n:'Titel: Würfelkönig',d:'Die Krone der Sammlung.',price:3000,tn:'Würfelkönig'}
];
const vOwn=id=>!!(save.cosOwn&&save.cosOwn[id]);
for(const v of VAULT)if(v.type==='title')TITLES.push({id:v.id,n:v.tn,ok:()=>vOwn(v.id)});
function openVault(){
  if(!endGate())return;
  const box=$('#vault-list');box.innerHTML='';$('#vault-gs').textContent=fmt(save.gs||0);
  if(!save.cos)save.cos={};if(!save.cosOwn)save.cosOwn={};
  const groups=[['aura','Auren'],['cube','Würfel-Muster'],['title','Titel']];
  for(const [ty,name] of groups){
    const h=document.createElement('h3');h.textContent=name;box.appendChild(h);
    for(const v of VAULT.filter(x=>x.type===ty)){
      const own=vOwn(v.id),eq=ty==='title'?save.titleSel===v.id:save.cos[ty]===v.id.replace(/^[a-z]_/,'')||save.cos[ty]===v.id;
      const b=document.createElement('button');b.className='card vcard'+(own||(save.gs||0)>=v.price?'':' off');
      b.innerHTML=`${v.sw?`<span class="vsw" style="background:${v.sw}"></span>`:''}<div class="cmain"><b>${v.n}</b><span>${v.d}</span></div><div class="price${eq?' on':''}">${own?(eq?'Aktiv':'Anlegen'):spr('i_gs')+'<b>'+v.price+'</b>'}</div>`;
      b.addEventListener('click',()=>{
        if(!own){if((save.gs||0)<v.price){sfx('block');return;}save.gs-=v.price;save.cosOwn[v.id]=1;sfx('win');}
        else sfx('card');
        if(ty==='title')save.titleSel=eq?'':v.id;
        else save.cos[ty]=eq?'':v.id.replace(/^[a-z]_/,'');
        persist();if(ty==='cube')faceTextures();updateStats();openVault();
      });
      box.appendChild(b);
    }
  }
  openModal('m-vault');
}


