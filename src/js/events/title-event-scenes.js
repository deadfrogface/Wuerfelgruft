/* src/js/events/title-event-scenes.js
   Event-Kulissen des Titelbilds als Pixel-Art. */
/* ---------- Event-Kulissen als Pixel-Art (105x215) ---------- */
const EVPX={
  rope(cv,y0,sag,col='#e8dcc0'){for(let x=0;x<105;x++){const u=x/104;cv.p(x,Math.round(y0+sag*4*u*(1-u)*(1)),col);}},
  ropeY(x,y0,sag){const u=x/104;return Math.round(y0+sag*4*u*(1-u));},
  bunting(cv,cols,y0=1,sag=6){EVPX.rope(cv,y0,sag);const n=11;for(let i=0;i<n;i++){const x=Math.round(4+i*9.4),y=EVPX.ropeY(x,y0,sag)+1,c=cols[i%cols.length];
    cv.poly([[x-3.5,y],[x+3.5,y],[x,y+9]],(px,py)=>px<x-1?PX.mul(c,1.2):px>x+1?PX.mul(c,.75):c);cv.line(x-3,y,x,y+8,PX.mul(c,.5));cv.line(x+3,y,x,y+8,PX.mul(c,.5));}},
  lights(cv,cols,fr,y0=1,sag=7){EVPX.rope(cv,y0,sag,'#2a2a30');const n=15;for(let i=0;i<n;i++){const x=Math.round(3+i*7.1),y=EVPX.ropeY(x,y0,sag)+1,c=cols[i%cols.length],on=(i+fr)%2===0,cc=on?c:PX.mul(c,.45);
    cv.r(x,y,1,2,'#2a2a30');cv.ell(x+.5,y+4,1.9,2.6,cc);if(on){cv.p(x,y+3,'#ffffff');cv.p(x-2,y+4,PX.mix(c,'#ffffff',.5));cv.p(x+3,y+4,PX.mix(c,'#ffffff',.5));}}},
  hills(cv,y,cols,seed){cols.forEach((c,k)=>{const base=y+k*9;for(let x=0;x<105;x++){const h=Math.round(base+Math.sin(x/(14+k*4)+seed+k*2)*5+Math.sin(x/5+k)*1.2);for(let yy=h;yy<215;yy++)cv.p(x,yy,yy===h?PX.mul(c,1.25):PX.hash(x,yy)>.95?PX.mul(c,.9):c);}});},
  moon(cv,x,y,r,c='#f4e4a8'){cv.ell(x,y,r,r,(px,py,dx,dy)=>dx<-.4?PX.mul(c,1.15):dx>.5?PX.mul(c,.78):c);cv.ell(x-r*.3,y-r*.25,r*.22,r*.22,PX.mul(c,.78));cv.ell(x+r*.3,y+r*.3,r*.28,r*.28,PX.mul(c,.78));cv.ell(x+r*.2,y-r*.5,r*.14,r*.14,PX.mul(c,.8));cv.outline(PX.mul(c,.45));},
  sun(cv,x,y,r,c='#ffe27a'){for(let a=0;a<12;a++){const an=a/12*Math.PI*2;cv.line(x+Math.cos(an)*(r+2),y+Math.sin(an)*(r+2),x+Math.cos(an)*(r+5),y+Math.sin(an)*(r+5),c);}cv.ell(x,y,r,r,(px,py,dx)=>dx<-.3?'#fff4b0':c);cv.outline('#c8962a');},
  fir(cv,x,by,cols,fr){
    cv.r(x-2,by-8,4,8,'#5a3a1b');cv.r(x-2,by-8,1,8,'#7a5028');
    [[13,by-30,22],[10,by-48,20],[7,by-62,17]].forEach(([w,ty,h],i)=>{cv.poly([[x,ty-h+8],[x-w,ty+8],[x+w,ty+8]],(px,py)=>px<x-w*.3?'#2a8a4a':px>x+w*.4?'#1a5a30':'#1f6a3a');
      cv.line(x,ty-h+8,x-w,ty+8,'#0f3a22');cv.line(x,ty-h+8,x+w,ty+8,'#0f3a22');cv.line(x-w,ty+8,x+w,ty+8,'#0f3a22');cv.r(x-w+2,ty+6,w*2-3,1,'#e8f2ff');});
    for(let i=0;i<9;i++){const bx=x+((i*37)%24)-12,byy=by-60+((i*29)%48),c=cols[i%cols.length],on=(i+fr)%2===0;cv.r(bx,byy,2,2,on?c:PX.mul(c,.5));if(on)cv.p(bx,byy,'#fff');}
    cv.poly([[x,by-82],[x+1.5,by-77],[x+6,by-77],[x+2.5,by-74],[x+4,by-69],[x,by-72],[x-4,by-69],[x-2.5,by-74],[x-6,by-77],[x-1.5,by-77]],'#ffe27a');
  },
  tomb(cv,x,by,w=10,h=14,cross){if(cross){cv.r(x-1,by-h,3,h,'#6a6a8a');cv.r(x-4,by-h+3,9,3,'#6a6a8a');cv.r(x-1,by-h,1,h,'#9a9ab8');cv.r(x-4,by-h+3,9,1,'#9a9ab8');cv.outline('#14122a');return;}
    cv.r(x-w/2,by-h+4,w,h-4,'#6a6a8a');cv.ell(x,by-h+4,w/2,4,'#6a6a8a');cv.r(x-w/2,by-h+4,2,h-4,'#9a9ab8');cv.r(x+w/2-2,by-h+4,2,h-4,'#4a4a68');cv.r(x-1,by-h+5,3,1,'#2a2a44');cv.r(x-3,by-h+7,7,1,'#2a2a44');cv.r(x,by-h+4,1,6,'#2a2a44');cv.outline('#14122a');},
  tree(cv,x,by){cv.r(x-2,by-26,4,26,'#2a1c2a');cv.r(x-2,by-26,1,26,'#4a3a4a');[[-10,-34],[9,-36],[-6,-42],[4,-44],[-14,-28],[13,-30]].forEach(([dx,dy])=>{cv.line(x,by-22,x+dx,by+dy,'#2a1c2a');cv.line(x+1,by-22,x+dx+1,by+dy,'#4a3a4a');});},
  balloon(cv,x,y,c){cv.ell(x,y,6,7.5,(px,py,dx,dy)=>dx<-.25&&dy<-.15?PX.mul(c,1.4):dx>.35?PX.mul(c,.7):c);cv.p(x-3,y-4,'#fff');cv.p(x-2,y-5,'#fff');cv.poly([[x-1.5,y+7],[x+1.5,y+7],[x,y+9]],PX.mul(c,.8));for(let k=0;k<22;k++)cv.p(x+Math.round(Math.sin(k/3)*1.2),y+9+k,'#e8dcc0');cv.outline(PX.mul(c,.4));},
  pepper(cv,x,y0,len){cv.r(x,y0,1,len,'#8a5a2a');for(let k=0;k<len/9;k++){const yy=y0+4+k*9;cv.ell(x+(k%2?-3:3),yy+3,2.2,4,(px,py,dx)=>dx<-.2?'#ff5a4a':'#c8201a');cv.r(x+(k%2?-3:3)-1,yy-1,2,2,'#3a8a3a');cv.line(x,yy,x+(k%2?-3:3),yy,'#8a5a2a');}},
  heart(cv,x,y,c,s=1){const H=['.##.##.','#######','#######','.#####.','..###..','...#...'];H.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='#'){const t=(i<3&&j<3)?PX.mul(c,1.3):PX.mul(c,j>3?.75:1);cv.p(x+i-3,y+j-3,t);}}));cv.outline(PX.mul(c,.4));},
  cypress(cv,x,by,h){cv.ell(x,by-h/2,5,h/2,(px,py,dx)=>dx<-.2?'#2a6a3a':dx>.3?'#14421e':'#1f5a2e');cv.r(x-1,by-2,2,3,'#4a2c12');cv.outline('#0a2a12');},
  curtain(cv,left){const x0=left?0:105-18;for(let x=0;x<18;x++){const fold=Math.abs(((x+(left?0:2))%6)-3);for(let y=0;y<215;y++){const w=left?x:17-x;const edge=y>150+Math.sin(w/3)*6&&y>0?0:1;cv.p(x0+x,y,fold===0?'#e8402d':fold===1?'#c8302d':fold===2?'#a82424':'#7a1618');}}
    for(let x=0;x<18;x++){const y=Math.round(16+Math.abs(Math.sin((x+(left?0:3))/2.2))*5);for(let yy=0;yy<y;yy++)cv.p(x0+x,yy,yy>y-3?'#f4d24a':'#a8201e');}cv.r(left?16:105-18,60,3,60,'#f4d24a');cv.r(left?15:105-19,118,5,9,'#f4d24a');},
  spade(cv,x,y,c,heart){if(heart)return EVPX.heart(cv,x,y,c);cv.ell(x-2.5,y+1,3,3,c);cv.ell(x+2.5,y+1,3,3,c);cv.poly([[x,y-5],[x-5,y+1],[x+5,y+1]],c);cv.r(x-1,y+3,3,5,c);cv.outline('#14122a');}
};
function buildEvent(ev,fr){
  const cv=PX.Cv(105,215),E=EVPX;
  const top=(f)=>f&&f(cv);
  switch(ev){
    case 'vegas':E.curtain(cv,true);E.curtain(cv,false);E.lights(cv,['#ffe27a','#ff5d73'],fr,2,7);E.spade(cv,9,168,fr?'#ffe27a':'#ff5d73',false);E.spade(cv,96,168,fr?'#ff5d73':'#ffe27a',true);break;
    case 'halloween':E.moon(cv,84,26,9);pxCobweb(cv,0,2);E.hills(cv,184,['#2a2048','#1c1636'],1);E.tree(cv,12,188);E.tomb(cv,34,196,10,13);E.tomb(cv,60,198,0,15,true);E.tomb(cv,88,196,10,13);
      for(let i=0;i<14;i++){const x=(i*37)%105,y=170+(i*11)%40;cv.p(x,y,'#3a2d63');}break;
    case 'xmas':E.lights(cv,['#ff5d73','#ffe27a','#5aa0e8','#8bd450'],fr,1,7);E.hills(cv,198,['#dfe8f4','#b8c8dc'],0.4);E.fir(cv,16,206,['#ff5d73','#ffe27a','#5aa0e8'],fr);E.fir(cv,90,208,['#ffe27a','#8bd450','#ff9ac0'],fr+1);break;
    case 'easter':E.bunting(cv,['#ffb3d1','#ffe27a','#b5e8ff','#c8f0a8','#d8b8ff']);E.sun(cv,16,28,8,'#fff0a0');E.hills(cv,188,['#8ad47a','#6ac45a'],2);
      [[20,206,'#ffb3d1'],[44,210,'#b5e8ff'],[70,204,'#ffe27a'],[90,209,'#d8b8ff']].forEach(([x,y,c])=>{cv.ell(x,y,3.5,4.5,(px,py,dx,dy)=>dy>.1&&dy<.4?PX.mul(c,.7):c);cv.p(x-1,y-3,'#fff');cv.outline(PX.mul(c,.4));});break;
    case 'valentine':{const y0=1,sag=7;E.rope(cv,y0,sag,'#e8c0cc');for(let i=0;i<10;i++){const x=Math.round(5+i*10.4);E.heart(cv,x,E.ropeY(x,y0,sag)+6,['#ff5d73','#ff9ac0','#e8302d'][i%3]);}
      for(const [x,y,c] of [[10,170,'#ff9ac0'],[94,176,'#ff5d73'],[22,196,'#ff5d73'],[80,200,'#ff9ac0'],[50,208,'#e8302d']])E.heart(cv,x,y,c);E.hills(cv,206,['#7a2a4a'],3);break;}
    case 'italy':E.bunting(cv,['#2f9a4a','#f4efe0','#d9302d']);E.sun(cv,90,26,8);E.hills(cv,190,['#8aa84a','#6a8a3a'],1.5);E.cypress(cv,14,208,34);E.cypress(cv,24,210,26);E.cypress(cv,92,208,32);break;
    case 'hungary':E.bunting(cv,['#d9302d','#f4efe0','#2f9a4a']);E.pepper(cv,5,6,70);E.pepper(cv,99,6,70);E.hills(cv,200,['#6a9a3a','#4a7a2a'],0.8);break;
    case 'birthday':E.bunting(cv,['#ff5d73','#ffe27a','#5aa0e8','#8bd450','#c9a7ff']);
      [[10,170,'#ff5d73'],[22,182,'#ffe27a'],[8,196,'#5aa0e8'],[94,172,'#8bd450'],[84,186,'#ff9ac0'],[97,198,'#ffb347']].forEach(([x,y,c])=>E.balloon(cv,x,y,c));
      for(let i=0;i<24;i++){const x=(i*47)%105,y=20+(i*71)%140;cv.r(x,y,2,1,['#ff5d73','#ffe27a','#5aa0e8','#8bd450'][i%4]);}break;
  }
  return PX.url(cv);
}
const EVBLINK={vegas:1,xmas:1};
function evSceneHTML(ev){
  if(!EV_DECO[ev])return '';
  const a=buildEvent(ev,0);
  if(EVBLINK[ev])return `<div class="sbox evbox"><img src="${a}" alt=""><img class="b" src="${buildEvent(ev,1)}" alt=""></div>`;
  return `<div class="sbox evbox"><img src="${a}" alt=""></div>`;
}

/* ===== Event-Kulissen (Titelbild) ===== */
const EVS={
  svg:(vb,inner,cls='',ar='none')=>`<svg viewBox="${vb}" preserveAspectRatio="${ar}" class="${cls}">${inner}</svg>`,
  /* Wimpelkette: hängt durch, Dreiecke in wechselnden Farben */
  bunting(cols,n=11){
    let t='<path d="M0 2Q50 22 100 2" fill="none" stroke="#e8dcc0" stroke-width=".5"/>';
    for(let i=0;i<n;i++){const u=(i+.5)/n,x=u*100,y=2+40*u*(1-u)*.5;t+=`<polygon points="${(x-3.4).toFixed(1)},${(y-.2).toFixed(1)} ${(x+3.4).toFixed(1)},${(y-.2).toFixed(1)} ${x.toFixed(1)},${(y+8).toFixed(1)}" fill="${cols[i%cols.length]}" stroke="#17152b" stroke-width=".3"/>`;}
    return EVS.svg('0 0 100 18',t,'','none');
  },
  /* Lichterkette mit blinkenden Birnen */
  lights(cols,n=14,r=2.3){
    let t='<path d="M0 2Q50 20 100 2" fill="none" stroke="#2a2a2a" stroke-width=".5"/>';
    for(let i=0;i<n;i++){const u=(i+.5)/n,x=u*100,y=2+36*u*(1-u)*.5;t+=`<circle class="bulb" style="animation-delay:${(-i*.23).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${(y+1.6).toFixed(1)}" r="${r}" fill="${cols[i%cols.length]}"/>`;}
    return EVS.svg('0 0 100 18',t);
  },
  hills(cols,hs){
    let t='';cols.forEach((c,i)=>{const y=hs[i];t+=`<path d="M0 ${y}Q20 ${y-10} 40 ${y-2}T80 ${y-4}T100 ${y-2}V40H0Z" fill="${c}"/>`;});
    return EVS.svg('0 0 100 40',t);
  },
  fir(cols){
    let t='<rect x="22" y="70" width="6" height="10" fill="#5a3a1b"/>';
    [[24,6,20],[14,26,34],[6,46,44]].forEach(([w,y,h],i)=>{t+=`<polygon points="25,${y} ${25-w},${y+h*.55} ${25+w},${y+h*.55}" fill="#1f6a3a" stroke="#0f3a22" stroke-width=".6"/>`;});
    for(let i=0;i<9;i++){const x=25+((i*37)%30)-15,y=14+((i*53)%52);t+=`<circle class="bulb" style="animation-delay:${(-i*.31).toFixed(2)}s" cx="${x}" cy="${y}" r="2.2" fill="${cols[i%cols.length]}"/>`;}
    t+='<polygon points="25,1 27,6 32,6 28,9 30,14 25,11 20,14 22,9 18,6 23,6" fill="#ffe27a" class="tw"/>';
    return EVS.svg('0 0 50 80',t,'','xMidYMax meet');
  },
  heart(x,y,sz,col){return `<path transform="translate(${x} ${y}) scale(${sz})" d="M0 3C-3-2 -8 1 -4 6L0 10L4 6C8 1 3-2 0 3Z" fill="${col}"/>`;},
  scene(ev){
    const E=EVS;
    switch(ev){
      case 'vegas':return `<div class="curt l"></div><div class="curt r"></div><div class="top">${E.lights(['#ffe27a','#ff5d73'],16,2.6)}</div><div class="neon l">♠</div><div class="neon r">♥</div>`;
      case 'halloween':return `<div style="right:8%;top:11%;width:clamp(54px,14vw,96px);aspect-ratio:1"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#f4e4a8"/><circle cx="13" cy="14" r="4" fill="#e0cf8a"/><circle cx="26" cy="24" r="5" fill="#e0cf8a"/><circle cx="14" cy="28" r="2.4" fill="#e0cf8a"/></svg></div>
        <div style="left:0;top:var(--sa-top);width:26%;height:18%">${E.svg('0 0 40 30','<g stroke="#cfd6e8" stroke-width=".5" fill="none" opacity=".75"><path d="M0 0L40 0M0 0L0 30M0 0L38 16M0 0L26 28M0 0L12 30"/><path d="M8 0Q8 7 0 8M16 0Q15 12 0 15M24 0Q22 17 0 22M32 0Q29 22 0 29"/></g>','','none')}</div>
        <div class="bot">${E.svg('0 0 100 40','<path d="M0 40V24Q25 14 50 22T100 18V40Z" fill="#2a2048"/><g fill="#3a2d63"><rect x="14" y="20" width="3" height="10"/><rect x="11" y="23" width="9" height="2.4"/><rect x="62" y="22" width="3" height="9"/><rect x="59" y="25" width="9" height="2.4"/><path d="M82 30V15L80 11M82 20L86 14M82 24L78 19" stroke="#3a2d63" stroke-width="1.6" fill="none"/><rect x="36" y="24" width="7" height="7" rx="3"/></g>')}</div>`;
      case 'xmas':return `<div class="top">${E.lights(['#ff5d73','#ffe27a','#5aa0e8','#8bd450'],18)}</div><div class="botl">${E.fir(['#ff5d73','#ffe27a','#5aa0e8'])}</div><div class="botr">${E.fir(['#ffe27a','#8bd450','#ff9ac0'])}</div><div class="bot" style="height:clamp(40px,9dvh,80px)">${E.hills(['#cfe0f4','#f4f8ff'],[24,30])}</div>`;
      case 'easter':return `<div class="top">${E.bunting(['#ffb3d1','#ffe27a','#b5e8ff','#c8f0a8','#d8b8ff'])}</div><div style="left:6%;top:10%;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,#fff6b0,rgba(255,240,150,0) 70%)"></div><div class="bot">${E.svg('0 0 100 40',`<path d="M0 40V20Q25 8 50 16T100 12V40Z" fill="#79c468"/><path d="M0 40V28Q30 20 60 26T100 22V40Z" fill="#5aa84a"/>${[8,22,37,52,66,80,92].map((x,i)=>`<g class="tw" style="animation-delay:${-i*.4}s"><circle cx="${x}" cy="${30+(i%3)*3}" r="1.7" fill="${['#ff9ac0','#ffe27a','#fff','#c9a7ff'][i%4]}"/><circle cx="${x}" cy="${30+(i%3)*3}" r=".7" fill="#e8a020"/></g>`).join('')}`)}</div>`;
      case 'valentine':return `<div class="top" style="height:clamp(44px,8dvh,72px)">${E.svg('0 0 100 18','<path d="M0 2Q50 20 100 2" fill="none" stroke="#e8c0cc" stroke-width=".5"/>'+Array.from({length:10},(_,i)=>{const u=(i+.5)/10;return E.heart(u*100,2+18*u*(1-u)*2+1,.75,['#ff5d73','#ff9ac0','#c8302d'][i%3]);}).join(''))}</div><div class="bob" style="left:50%;top:27%;width:60%;margin-left:-30%;aspect-ratio:1;opacity:.14">${E.svg('-10 -2 20 14',E.heart(0,0,1.2,'#ff5d73'),'','xMidYMid meet')}</div><div class="bot" style="height:clamp(40px,9dvh,80px)">${E.svg('0 0 100 40','<path d="M0 40V24Q25 16 50 22T100 18V40Z" fill="#5a1430"/><path d="M0 40V30Q30 24 60 29T100 26V40Z" fill="#7a1a40"/>')}</div>`;
      case 'italy':return `<div class="top">${E.bunting(['#2f9a4a','#f4efe0','#d9302d'])}</div><div style="right:8%;top:10%;width:74px;height:74px;border-radius:50%;background:radial-gradient(circle,#fff3b0 20%,rgba(255,220,120,.0) 70%)"></div><div class="bot">${E.svg('0 0 100 40','<g class="wave2"><path d="M-6 18Q10 10 26 18T58 18T90 18T120 18V40H-6Z" fill="#2a8ad0"/></g><g class="wave1"><path d="M-6 26Q10 18 26 26T58 26T90 26T120 26V40H-6Z" fill="#1c6aa8"/></g><path d="M0 34Q25 30 50 34T100 32V40H0Z" fill="#c8a870"/>')}</div>`;
      case 'hungary':return `<div class="top">${E.bunting(['#d9302d','#f4efe0','#2f9a4a'])}</div>${['sdl','sdr'].map(c=>`<div class="${c} sway">${E.svg('0 0 20 80','<path d="M10 0V76" stroke="#8a5a2a" stroke-width=".8"/>'+Array.from({length:8},(_,i)=>`<ellipse cx="${10+(i%2?3.5:-3.5)}" cy="${8+i*9}" rx="3.2" ry="5.6" fill="#d9302d" stroke="#8a1a1a" stroke-width=".5"/><rect x="${9+(i%2?2.5:-4.5)}" y="${3+i*9}" width="2" height="2.4" fill="#2f9a4a"/>`).join(''),'','xMidYMin meet')}</div>`).join('')}<div class="bot" style="height:clamp(34px,7dvh,64px)">${E.svg('0 0 100 12','<rect width="100" height="12" fill="#f4efe0"/>'+Array.from({length:14},(_,i)=>`<g transform="translate(${3.5+i*7.1} 6)"><path d="M0 4C-3 0 -3-4 0-5C3-4 3 0 0 4Z" fill="#d9302d"/><path d="M-3 2Q0 6 3 2" stroke="#2f9a4a" stroke-width=".9" fill="none"/></g>`).join('')+'<rect y="0" width="100" height="1.2" fill="#2f9a4a"/><rect y="10.8" width="100" height="1.2" fill="#d9302d"/>','','none')}</div>`;
      case 'birthday':return `<div class="top">${E.bunting(['#ff5d73','#ffe27a','#5aa0e8','#8bd450','#c9a7ff'])}</div>${[['botl','#ff5d73','#ffe27a','#5aa0e8'],['botr','#8bd450','#ff9ac0','#ffb347']].map(([c,a,b,d])=>`<div class="${c} bob">${E.svg('0 0 40 60',[[12,18,a],[27,14,b],[20,30,d]].map(([x,y,col])=>`<path d="M${x} ${y+12}Q${x+3} ${y+30} 20 56" stroke="#e8dcc0" stroke-width=".4" fill="none"/><ellipse cx="${x}" cy="${y}" rx="7" ry="9" fill="${col}" stroke="#17152b" stroke-width=".5"/><ellipse cx="${x-2.4}" cy="${y-3}" rx="1.6" ry="2.6" fill="#fff" opacity=".5"/>`).join(''),'','xMidYMax meet')}</div>`).join('')}`;
    }
    return '';
  }
};
