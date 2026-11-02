/* src/js/game/terrain.js
   Betreten von Feldern und Gelände (Eis, Sand, Ranken, Lava und mehr). */
function landing(t,from,dep,noTerr){
  if(G.traps&&G.traps.includes(t)){G.traps.splice(G.traps.indexOf(t),1);G.bombs++;floatText(t,'Falle aufgenommen','gold');sfx('coin');}
  if(fieldAt(t)==='fire'){floatText(t,'Brand','red');sfx('crackle');hurtPlayer(1,null);}
  if(G.spikes.has(t)&&!G.boots){sfx('spike');hurtPlayer(1,null);}
  const it=G.items.get(t);
  if(it==='altar')setTimeout(()=>openAltar(t),250);
  else if(typeof it==='string'&&/^rn\d$/.test(it))runeTouch(t,it);
  else if(it){G.items.delete(t);pickup(it,t);}
  if(!noTerr&&dep<4)terrainEnter(t,from,dep);
}
function onEnter(t,from){landing(t,from,0,false);}
function terrainEnter(t,from,dep){
  const tr=terrOf(t);if(!tr||G.hp<=0)return;
  markEx('terr',tr.k);
  const d=tdir(tr);
  if(tr.k==='water'){
    const was=from!==undefined&&terrOf(from)&&terrOf(from).k==='water';
    if(!was){floatText(t,'Platsch','blue');sfx('bubble');burst(t,'#cfeaff',8);}
    else if(G.flood&&dep===0&&from!==undefined){
      const dd=dirBetween(from,t),nx=dd>=0?tstep(t,DIRS[dd],G.walls):-1;
      if(nx>=0&&!G.walls.has(nx)&&!monAt(nx)&&!G.spikes.has(nx)&&nx!==from){G.pos=nx;floatText(nx,'Gleiten','blue');sfx('whoosh');landing(nx,t,dep+1,false);}
    }
    if(G.burn>0){G.burn=0;floatText(t,'Gelöscht','blue');}
    if(G.inOasis&&!was&&(G.drinks||0)<3){G.drinks=(G.drinks||0)+1;G.psn=0;G.stone=0;G.hp=Math.min(G.maxhp,G.hp+1);floatText(G.pos,'+1','green');sfx('heart');}
    return;
  }
  if(tr.k==='slick'){
    const dd=from!==undefined?dirBetween(from,t):-1;
    if(dd>=0){
      let cur=t,n=0;
      while(n<4&&terrOf(cur)&&terrOf(cur).k==='slick'){const nx=tstep(cur,DIRS[dd]);if(nx<0||monAt(nx))break;cur=nx;n++;}
      if(cur!==t){G.pos=cur;floatText(cur,'Rutsch','blue');sfx('whoosh');landing(cur,t,dep+1,false);}
    }
  }else if(tr.k==='quick'||tr.k==='vines'){
    G.paralyzed=Math.max(G.paralyzed,1);floatText(t,tr.k==='quick'?'Treibsand':'Ranken','red');sfx('squelch');
  }else if(tr.k==='lava'){
    floatText(t,'Lava','red');sfx('crackle');hurtPlayer(1,null);
  }else if(tr.k==='gust'&&d>=0){
    const nx=tstep(t,DIRS[d]);
    if(nx>=0&&!monAt(nx)){G.pos=nx;floatText(nx,'Böe','blue');sfx('push');landing(nx,t,dep+1,false);}
  }else if((tr.k==='chute'||tr.k==='rift')&&tr.pair!==undefined&&!monAt(tr.pair)){
    burst(t,tr.k==='chute'?'#ffe27a':'#b890ff',10);G.pos=tr.pair;burst(G.pos,tr.k==='chute'?'#ffe27a':'#b890ff',10);
    floatText(G.pos,tr.k==='chute'?'Rutsche':'Riss','gold');sfx('blink');landing(G.pos,undefined,dep+1,true);
  }
}
function terrM(m){
  const tr=terrOf(m.pos);if(!tr||!G.mons.includes(m)||FLY(m))return;
  const d=tdir(tr);
  if(tr.k==='lava'){floatText(m.pos,'Lava','red');sfx('crackle');hitMonster(m,2,false);}
  else if(tr.k==='quick'){m.stun=Math.max(m.stun||0,2);floatText(m.pos,'Treibsand','red');}
  else if(tr.k==='vines'){m.stun=Math.max(m.stun||0,1);floatText(m.pos,'Ranken','red');}
  else if(tr.k==='gust'&&d>=0){const nx=tstep(m.pos,DIRS[d]);if(nx>=0&&!monAt(nx)&&nx!==G.pos){m.pos=nx;sfx('push');settleBasic(m);}}
  else if(tr.k==='slick'&&m.last!==undefined){
    const dd=dirBetween(m.last,m.pos);
    if(dd>=0){let cur=m.pos,n=0;while(n<4&&terrOf(cur)&&terrOf(cur).k==='slick'){const nx=tstep(cur,DIRS[dd]);if(nx<0||monAt(nx)||nx===G.pos)break;cur=nx;n++;}
      if(cur!==m.pos){m.pos=cur;floatText(cur,'Rutsch','blue');settleBasic(m);}}
  }
}
function terrainTick(){
  if(!G.terrain||!G.terrain.size)return;
  const mv=[];
  const h=terrOf(G.pos);
  if(h&&(h.k==='belt'||h.k==='current')){const d=tdir(h);if(d>=0){const nx=tstep(G.pos,DIRS[d]);if(nx>=0&&!monAt(nx)){const old=G.pos;G.pos=nx;floatText(nx,h.k==='belt'?'Band':'Strömung','blue');landing(nx,old,1,false);}}}
  for(const m of G.mons.slice()){
    const tr=terrOf(m.pos);if(!tr||!(tr.k==='belt'||tr.k==='current')||FLY(m))continue;
    const d=tdir(tr);if(d<0)continue;const nx=tstep(m.pos,DIRS[d]);
    if(nx>=0&&!monAt(nx)&&nx!==G.pos){m.pos=nx;settleBasic(m);}
  }
}
