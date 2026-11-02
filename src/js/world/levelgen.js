/* src/js/world/levelgen.js
   Levelgenerator: Wände, Stacheln, Gegner, Ziele und Gelände. */
/* ================= Monster & Levelgenerator ================= */
const MT={
  slime:{name:'Schleim',hp:1,dmg:1,pts:10,col:'#8bd450'},
  archer:{name:'Bogenschütze',hp:1,dmg:1,pts:20,col:'#c08bff'},
  brute:{name:'Brocken',hp:3,dmg:2,pts:40,col:'#e8553d'},
  ghost:{name:'Geist',hp:2,dmg:1,pts:30,col:'#b9a7ff'},
  king:{name:'Würfelkönig',hp:8,dmg:2,pts:200,col:'#8a5fa8'}
};
let MID=0;
const MON_BASE=[2,3,4,5,5,6,6,7,7,8];
function mkMon(type,pos,extra){
  const T=MT[type];const hm=hpMod();const hp=Math.max(1,T.hp+(T.boss?hm*3+deepHp()*2:((G&&G.hpb)||0)+(G&&G.legHp||0)+(T.z>=6?1:0)+hm+deepHp()));
  const mo={id:'m'+(++MID),type,hp,mx:hp,pos,cd:T.slow&&!T.boss?rnd(2):(T.boss?1:0),mcd:rnd(2),aim:false,n:0,ph:1,...extra};
  noteSeen(type);return mo;
}
function zonePool(z,pos){
  if(z>=ZONES.length)return [].concat(...ROSTER);
  return ROSTER[z].filter(id=>MT[id].d<=pos);
}
function pickType(z,pos,forced){
  if(forced.length)return forced.shift();
  const pool=zonePool(z,pos);
  const tot=pool.reduce((s,id)=>s+MT[id].w,0);let r=Math.random()*tot;
  for(const id of pool){if((r-=MT[id].w)<0)return id;}
  return pool[0];
}
/* Etagenziel: Schlüssel bleibt der Standard, dazwischen Schalter auf mehreren Würfelseiten oder ein Opferaltar */
function pickGoal(depth){
  if(DEVBUILD&&window.__goalForce&&depth>=2&&depth%5!==0)return window.__goalForce;
  if(depth<3||depth%5===0)return 'key';
  const h=(G&&G.goals)||[],last=h[h.length-1];
  const w={key:36+(last&&last!=='key'?30:0),switch:14,altar:14,runes:10,clear:9,elite:9,survive:8};
  const FROM={switch:5,clear:8,altar:11,elite:14,runes:17,survive:20};
  for(const g in FROM)if(depth<FROM[g])delete w[g];
  for(const g of h.slice(-2))if(g!=='key')delete w[g];
  const tot=Object.values(w).reduce((a,b)=>a+b,0);let x=Math.random()*tot;
  for(const k of Object.keys(w)){x-=w[k];if(x<0)return k;}
  return 'key';
}
function genLevel(depth){
  const z=zoneOf(depth),pos=posOf(depth);
  for(let tries=0;tries<120;tries++){
    const start=pick(SHELL.filter(i=>faceCount(i)===1));
    const d0=bfs(start,null);
    const far=SHELL.filter(i=>faceCount(i)===1&&d0.get(i)>=8);
    if(!far.length)continue;
    const exit=pick(far);
    const keep=new Set([start,exit,...NB[start],...NB[exit]]);
    const walls=new Set();
    const wt=Math.min(5+depth,13);
    for(const c of shuffle(SHELL.slice())){
      if(walls.size>=wt)break;
      if(keep.has(c))continue;
      walls.add(c);
      if(bfs(start,walls).size!==SHELL.length-walls.size)walls.delete(c);
    }
    const dist=bfs(start,walls);
    if(dist.get(exit)===undefined)continue;
    const used=new Set([start,exit]);
    const free=min=>SHELL.filter(i=>!walls.has(i)&&!used.has(i)&&dist.get(i)>=min);
    const items=new Map();
    const boss=depth%5===0;
    let keyCell=-1,goal=boss?'boss':'key',swNeed=0;
    const g0=boss?'boss':pickGoal(depth);
    if(g0==='switch'){
      swNeed=depth>=30?4:3;
      const byFace=new Map();
      for(const i of free(3))if(faceCount(i)===1){const f=[...facesOf(i)][0];if(!byFace.has(f))byFace.set(f,[]);byFace.get(f).push(i);}
      if(byFace.size>=swNeed){
        for(const f of shuffle([...byFace.keys()]).slice(0,swNeed)){const c=pick(byFace.get(f));used.add(c);items.set(c,'sw');}
        goal='switch';
      }
    }else if(g0==='runes'){
      swNeed=depth>=40?4:3;
      const byFace=new Map();
      for(const i of free(3))if(faceCount(i)===1){const f=[...facesOf(i)][0];if(!byFace.has(f))byFace.set(f,[]);byFace.get(f).push(i);}
      if(byFace.size>=swNeed){
        shuffle([...byFace.keys()]).slice(0,swNeed).forEach((f,k)=>{const c=pick(byFace.get(f));used.add(c);items.set(c,'rn'+(k+1));});
        goal='runes';
      }
    }else if(g0==='clear'||g0==='elite'){goal=g0;
    }else if(g0==='survive'){goal='survive';swNeed=Math.min(12+2*Math.floor(depth/10),22);
    }else if(g0==='altar'){
      const c=free(5).filter(i=>faceCount(i)===1);
      if(c.length){const a=pick(c);used.add(a);items.set(a,'altar');goal='altar';}
    }
    if(goal==='key'&&depth>=2&&!boss){
      const ef=facesOf(exit);
      let c=free(5).filter(i=>![...facesOf(i)].some(f=>ef.has(f)));
      if(!c.length)c=free(4);
      if(!c.length)continue;
      keyCell=pick(c);used.add(keyCell);items.set(keyCell,'key');
    }
    if(depth<2&&!boss)goal='none';
    const spikes=new Set();
    const sc=depth===1?1:Math.min(2+Math.floor(depth/2),7);
    for(const c of shuffle(free(2)).slice(0,sc)){spikes.add(c);used.add(c);}
    const terrain=new Map();
    const tk=ZTERR[kindOf(depth)];
    if(tk){
      const freeT=()=>free(2).filter(i=>!terrain.has(i)&&!keep.has(i));
      const put=(c,o)=>{terrain.set(c,{k:tk,d:-1,...o});used.add(c);};
      const dirFor=c=>{const o=shuffle([0,1,2,3,4,5]);for(const d of o)if(tstep(c,DIRS[d],walls)>=0)return d;return -1;};
      const cluster=n=>{const c0=pick(freeT());if(c0===undefined)return [];const cl=[c0],seen=new Set(cl);
        while(cl.length<n){const fr=shuffle(cl.flatMap(c=>NB[c]).filter(x=>!seen.has(x)&&!walls.has(x)&&!used.has(x)&&!keep.has(x)&&(dist.get(x)||0)>=2));if(!fr.length)break;cl.push(fr[0]);seen.add(fr[0]);}
        return cl;};
      if(tk==='slick'){for(let k=0;k<1+(pos>=5?1:0);k++)for(const c of cluster(3+rnd(2)))put(c);}
      else if(tk==='lava'||tk==='quick'||tk==='vines'){for(let k=0;k<1+(pos>=4?1:0);k++)for(const c of cluster(2+rnd(2)))put(c);}
      else if(tk==='gust'){for(let k=0;k<3+Math.floor(pos/3);k++){const c=pick(freeT());if(c!==undefined)put(c,{d:dirFor(c)});}}
      else if(tk==='belt'){for(let k=0;k<2;k++){const c=pick(freeT());if(c===undefined)continue;const d=dirFor(c);if(d<0)continue;
        const cs=[c];let cur=c;for(let q=0;q<2;q++){const nx=tstep(cur,DIRS[d],walls);if(nx<0||used.has(nx)||keep.has(nx)||terrain.has(nx)||(dist.get(nx)||0)<2)break;cs.push(nx);cur=nx;}
        for(const x of cs)put(x,{d});}}
      else if(tk==='current'){for(let k=0;k<1+(pos>=5?1:0);k++){const cl=cluster(3);if(!cl.length)continue;const d=dirFor(cl[0]);for(const x of cl)put(x,{d});}}
      else if(tk==='chute'||tk==='rift'){for(let k=0;k<1+(pos>=6?1:0);k++){const a=pick(freeT());if(a===undefined)continue;const da=bfs(a,walls);
        const b=pick(freeT().filter(x=>x!==a&&(da.get(x)||0)>=4));if(b===undefined)continue;put(a,{pair:b});put(b,{pair:a});}}
    }
    if(kindOf(depth)==='tiefsee'){
      const freeW=()=>free(2).filter(i=>!terrain.has(i)&&!keep.has(i));
      for(let k=0;k<2+(pos>=5?1:0);k++){
        const c0=pick(freeW());if(c0===undefined)break;const cl=[c0],seen=new Set(cl);
        const want=4+rnd(3);
        while(cl.length<want){const fr=shuffle(cl.flatMap(c=>NB[c]).filter(x=>!seen.has(x)&&!walls.has(x)&&!used.has(x)&&!keep.has(x)&&!terrain.has(x)&&(dist.get(x)||0)>=2));if(!fr.length)break;cl.push(fr[0]);seen.add(fr[0]);}
        for(const c of cl){terrain.set(c,{k:'water',d:-1});used.add(c);}
      }
    }
    let flood=!boss&&((depth>=12&&Math.random()<(kindOf(depth)==='tiefsee'?.4:.09))||(DEVBUILD&&window.__floodForce));
    if(flood)for(const c of SHELL){if(walls.has(c)||c===start||c===exit||terrain.has(c))continue;terrain.set(c,{k:'water',d:-1});}
    const mons=[];
    const forced=z<ZONES.length?ROSTER[z].filter(id=>MT[id].d===pos).slice(0,3):[];
    let mc=Math.min(MON_BASE[pos-1]+Math.min(z,3),11);
    let mcells=shuffle(free(4));
    let bossType=null;
    if(boss){
      bossType=z>=ZONES.length?pick([].concat(...BOSSES)):BOSSES[z][pos===10?1:0];
      const kc=shuffle(free(6));const kp=kc.length?kc[0]:mcells[0];
      mons.push(mkMon(bossType,kp,{}));
      used.add(kp);mcells=mcells.filter(c=>c!==kp);mc=(pos===5?2:3)+(z>>1);
    }else mc=Math.max(mc,forced.length);
    mc+=monAdd()+(boss?(DF().bossMon||0):0)+deepMon();
    for(let k=0;k<mc&&k<mcells.length;k++){
      const type=pickType(z,pos,forced);
      mons.push(mkMon(type,mcells[k],{}));
      used.add(mcells[k]);
    }
    if(goal==='elite'){
      const ok=mons.filter(m=>{const T=MT[m.type];return !T.flee&&!T.thief&&!T.npc&&!T.decoy&&!T.boss;});
      const m=ok.length?pick(ok):mons[0];
      if(m){m.elite=1;m.hp=m.mx=m.hp+2+(z>>1);}else goal='clear';
    }
    const hearts=DF().heart===0?0:1+(depth>=3&&depth%2===1?1:0)+(z>=2?1:0);
    const place=(kind,n)=>{for(const c of shuffle(free(2)).slice(0,n)){items.set(c,kind);used.add(c);}};
    place('heart',hearts);
    place('coin',3+rnd(3));
    if(flood)place('air',4);
    if(rnd(2)===0||depth%3===0)place('bomb',1);
    const zp=ZPICKS[kindOf(depth)];
    if(zp)for(let k=0;k<1+rnd(2);k++)place(pick(zp),1);
    if(kindOf(depth)!=='gold'&&!boss&&rnd(100)<28)place('chest',1);
    if(!G.daily&&!boss){const ev=activeEvent(),E=ev&&EVENTS[ev];if(E){

    }}
    if(G.maprel){const all=[].concat(...Object.values(ZPICKS));place(pick(all),1);}
    return {start,exit,walls,spikes,items,mons,keyCell,boss,bossType,terrain,goal,swNeed,flood};
  }
  throw new Error('levelgen');
}
/*GEO-END*/

/* ================= Hilfen ================= */
const $=(s,e=document)=>e.querySelector(s);
const $$=(s,e=document)=>Array.from(e.querySelectorAll(s));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduceMotion=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const ART={"hero": ["................", "................", "....kkkkkkk.....", "...kttuuuuttk...", "..kttuutttttTk..", "..ktkkkkkkkkTk..", "..ktkykkkykkTk.a", "..ktkkkkkkkkTkak", "..kttkkkkkkTTkak", "..kttttttttTTkyk", ".kttTtttttttTTkh", ".kttTttttttTTTkk", ".kttTtttttttTTk.", ".kTTTTTTTTTTTTk.", "..kkkTTkkTTkkk..", "...kk.kk.kk.k..."], "slime": ["................", "................", "................", "................", "......kkkk......", "....kkmmllkk....", "...kmmmllmmmk...", "..kmmmmmmmmmmk..", "..kmWWmmmmWWmk..", ".kmmWkmmmmWkmmk.", ".kmmmmmmmmmmmmk.", ".kmmmkkkkkkmmmk.", ".kMmmmmmmmmmmMk.", "..kMMMMMMMMMMk..", "...kkkkkkkkkk...", "................"], "archer": ["................", "................", "....kkkkkk......", "...kWWWWWWk.hk..", "...kWkWWkWk.hHk.", "...kWkWWkWk.h.k.", "...kWWWkWWk.h.k.", "....kWkWkWkkh.k.", "...kkeeeeeekhHk.", "..keeEeeeeeEk.k.", "..keeEeeeeeEkhk.", "..keeEeeeeeEkh..", "..keEEeeeeEEk...", "..kkEEEEEEEEkk..", "...kk.kkkk.kk...", "................"], "brute": ["................", "..k..........k..", "..kbk.kkkk.kbk..", "...kbkkoooookbk.", "....kkooooooook.", "...koWkooooWkok.", "...kokoooookoRk.", "...kookkkkkkoRk.", "..kkoRkWkkWkRRkk", ".kooRRkkkkkkRRok", ".koorrrrrrrrrook", ".kooRrrrrrrrRook", "..kkRrrrrrrrRkk.", "...kRRrrrrrRRk..", "...kkRRkkkkRRkk.", "....kkk....kkk.."], "ghost": ["................", "................", "....kkkkkkkk....", "...kvvvvvvvvk...", "..kvvWWvvvvvvk..", "..kvvWvvvvvvvk..", "..kvvvvvvvvvvk..", "..kvkkvvvkkvVk..", "..kvkkvvvkkvVk..", "..kvvvvkkvvvVk..", "..kvvvvkkvvVVk..", "..kvvvvvvvvVVk..", "..kvvvvvvvVVVk..", "..kvVvvvvVVVVk..", "..kkvVkkVVkVkk..", "...k.kk.kk.kk..."], "heart": ["................", "................", "................", "...kkk....kkk...", "..kppppk.kpWpk..", ".kppWppppkppppk.", ".kpWpppppppppPk.", ".kpppppppppppPk.", ".kppppppppppPPk.", "..kppppppppPPk..", "...kppppppPPk...", "....kppppPPk....", ".....kppPPk.....", "......kPPk......", ".......kk.......", "................"], "coin": ["................", "................", "................", ".....kkkkkk.....", "....kzzzzyyk....", "...kzzyyyyyYk...", "...kzyyYYyyYk...", "...kzyyYyyyYk...", "...kzyyYyyyYk...", "...kzyyYYyyYk...", "...kyyyyyyYYk...", "....kyyyyYYk....", ".....kkkkkk.....", "................", "................", "................"], "key": ["................", "................", "...kkkk.........", "..kzzyyk........", ".kzkkkyYk.......", ".kzk.kyYk.......", ".kyk.kyYk.......", ".kyyYyYYk.......", "..kkyYYkkk......", "....kyYkYkk.....", ".....kyYkYYk....", "......kyYkYk....", ".......kyYkk....", "........kYYk....", ".........kk.....", "................"], "bomb": ["................", "................", "..........k*k...", ".........kh*k...", "........kh.k....", ".....kkkkkk.....", "....kSSSSSSk....", "...kSsWSSSSSk...", "..kSsWSSSSSSSk..", "..kSSSSSSSSSdk..", "..kSSSSSSSSSdk..", "..kSSSSSSSSddk..", "...kSSSSSSddk...", "....kddddddk....", ".....kkkkkk.....", "................"], "spike": ["................", "................", "................", "................", "................", ".......kk.......", "..kk...kak..kk..", ".kak...kak.kak..", ".kak..kaAAkkak..", ".kaAk.kaAAkkaAk.", "kkaAkkkaAAkkaAkk", "kSSSSSSSSSSSSSSk", "kSssssssssssssSk", "kSSSSSSSSSSSSSSk", ".kkkkkkkkkkkkkk.", "................"], "stairs": ["................", ".kkkkkkkkkkkkkk.", ".ky*y*y*y*y*yyk.", ".kyBBBBBBBBBByk.", ".kykkkkkkkkkkyk.", ".kydSSSSSSSSdyk.", ".kydkkkkkkkkdyk.", ".kyddSSSSSSddyk.", ".kyddkkkkkkddyk.", ".kydddSSSSdddyk.", ".kydddkkkkdddyk.", ".kyddddddddddyk.", ".kyddddddddddyk.", ".kyyyyyyyyyyyyk.", ".kkkkkkkkkkkkkk.", "................"], "lock": ["................", "................", "................", ".....kkkkkk.....", "....kaaaaaak....", "....ka....ak....", "....ka....ak....", "..kkkkkkkkkkkk..", "..kzzyyyyyyyYk..", "..kzyyyyyyyyYk..", "..kyyyykkyyyYk..", "..kyyyykkyyyYk..", "..kyyyyykyyYYk..", "..kyyyyyyyyYYk..", "..kkkkkkkkkkkk..", "................"], "potion": ["................", "......kkkk......", ".....kbbBbk.....", ".....kbBBbk.....", "......kWWk......", "......kWWk......", ".....kWttWk.....", "....kWtttttk....", "...kttuuttTTk...", "...ktuutttTTk...", "...kttttttTTk...", "...kttttttTTk...", "....kTTTTTTk....", ".....kkkkkk.....", "................", "................"], "blade": ["................", ".............kk.", "............kaak", "...........kaWak", "..........kaWak.", ".........kaWak..", "........kaWak...", ".......kaWak....", "..kk..kaWak.....", "..kykkaWak......", "...kyykak.......", "....kkyyk.......", "...khkkyyk......", "..khHk.kkk......", "..kkk...........", "................"], "spear": ["................", "..............k.", ".............kak", "............kaWk", "...........kaaak", "..........kkAak.", ".........khkkk..", "........khk.....", ".......khk......", "......khk.......", ".....khk........", "....khk.........", "...khk..........", "..khk...........", "..kk............", "................"], "shield": ["................", "..kkkkkkkkkkkk..", ".knnnnnnnnnnnNk.", ".knWnnnbbnnnnNk.", ".knWnnnbbnnnnNk.", ".knnnnnbbnnnnNk.", ".knbbbbbbbbbbNk.", ".knbbbbbbbbbbNk.", ".knnnnnbbnnnNNk.", "..knnnnbbnnnNk..", "..knnnnbbnnNNk..", "...knnnnnnNNk...", "....knnnnNNk....", ".....kNNNNk.....", "......kkkk......", "................"], "thorns": ["................", ".......kk.......", "......kaak......", ".k....kaak....k.", ".kak..kaak..kak.", "..kakkkaakkkak..", "...kaaaAAaaak...", ".kkaaarrrraaakk.", "kaaaaarrrrraaaak", ".kkaaarrrraaakk.", "...kaaaAAaaak...", "..kakkkaakkkak..", ".kak..kaak..kak.", ".k....kaak....k.", "......kaak......", ".......kk......."], "drop": ["................", ".......kk.......", "......krrk......", "......krrk......", ".....krrrrk.....", ".....krrrrk.....", "....krrWrrrk....", "....krWrrrrRk...", "...krrWrrrrRk...", "...krrrrrrRRk...", "...krrrrrrRRk...", "....krrrrRRk....", ".....kRRRRk.....", "......kkkk......", "................", "................"], "bolt": ["................", "........kkkk....", ".......kzyyk....", "......kzyyk.....", ".....kzyyk......", "....kzyyk.......", "...kzyyyyyk.....", "...kkkkzyYk.....", "......kzyk......", ".....kzyYk......", "....kzyYk.......", "....kyYk........", "...kyYk.........", "...kYk..........", "...kk...........", "................"], "wall": ["kkkkkkkkkkkkkkkk", "kssssssskssssssk", "kSSSSSSSkSSSSSSk", "kSSSSSSSkSSSSSSk", "kkkkkkkkkkkkkkkk", "kssskssssssskssk", "kSSSkSSSSSSSkSSk", "kSSSkSSSSSSSkSSk", "kkkkkkkkkkkkkkkk", "kssssssskssssssk", "kSSSSSSSkSSSSSSk", "kSSSSSSSkSSSSSSk", "kkkkkkkkkkkkkkkk", "kssskssssssskssk", "kSSSkSSSSSSSkSSk", "kkkkkkkkkkkkkkkk"], "floor0": ["GGGGGGGGGGGGGGGH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "HHHHHHHHHHHHHHHH"], "floor1": ["GGGGGGGGGGGGGGGH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFIFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFIFFFFH", "GFFFFFIFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFIFFH", "GFFFFFFFFFFFFFFH", "GFFIFFFFFFFFFFFH", "GFFFFFFFFFFFFIFH", "GFFFFFIFFFFFFFFH", "GFFFFFFFFFFFFFFH", "HHHHHHHHHHHHHHHH"], "floor2": ["GGGGGGGGGGGGGGGH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFHIFFFFFFH", "GFFFFFFFHFFFFFFH", "GFFFFFFFHIFFFFFH", "GFFFFFFFFHFFFFFH", "GFFFFFFFFHIFFFFH", "GFFFFFFFFFHFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "HHHHHHHHHHHHHHHH"], "floor3": ["GGGGGGGGGGGGGGGH", "GFFFFFFFFFFFFFFH", "GFFIIFFIIFFFFFFH", "GFFHFFFHFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFIIFFFFFFFFFFFH", "GFHFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFFFFFFH", "GFFFFFFFFFIIFFFH", "GFFFFFFFFFHFFFFH", "GFFFFFFFFFFFFFFH", "HHHHHHHHHHHHHHHH"], "king": ["................", "..k..k.kk.k..k..", "..kykkyzzykkyk..", "..kyyyyyyyyyyk..", "...kkkkkkkkkk...", "..kWWWWWWWWWWk..", "..kWrkWWWWkrWk..", "..kWWWWkkWWWWk..", "..kWWkkkkkkWWk..", ".kkeEEeeeeEEekk.", "kEEeeEeeeeEeeEEk", "kEeeeEeeeeEeeeEk", "kEEeeEEeeEEeeEEk", ".kEEEEEEEEEEEEk.", "..kkEEkkkkEEkk..", "...kkk....kkk..."], "undo": ["................", "................", ".....kkkkkk.....", "...kkbbbbbbkk...", "..kbbbbbkbbbbk..", "..kbbbbbkbbbbk..", ".kbbbbbbkbbbbBk.", ".kbbbbbbkbbbbBk.", ".kbbkkkkkbbbbBk.", ".kbbbbbbbbbbbBk.", ".kbbbbbbbbbbBBk.", "..kbbbbbbbbBBk..", "..kkBBBBBBBBkk..", "...kkkkkkkkkk...", "................", "................"]};
const PALJ={"k": "#17152b", "W": "#f4efe0", "b": "#e9dfc8", "B": "#c9ba98", "s": "#6f6993", "S": "#4a4566", "d": "#2c2847", "t": "#3fd0b0", "T": "#2a9a82", "u": "#8ff5da", "r": "#e8553d", "R": "#a93a28", "o": "#ff8a5c", "y": "#f4b942", "Y": "#b47a14", "z": "#ffe27a", "m": "#8bd450", "M": "#5aa02c", "l": "#c5f285", "v": "#cdbfff", "V": "#8a72e0", "p": "#ff5d73", "P": "#b8334a", "n": "#5aa0e8", "N": "#3f6fb5", "a": "#dfe6f2", "A": "#8b93ad", "h": "#c98a4b", "H": "#312b58", "e": "#8a5fa8", "E": "#5d3d78", "g": "#2a2547", "F": "#3d3768", "G": "#4b4580", "I": "#474177"};
/*CONTENT-START*/
