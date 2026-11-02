/* src/js/audio/music.js
   Musik: Zonenstücke, Motive und komponierte Songs. */
/* ---- Komponierte Stücke (Events, Wüste): feste Melodien, Akkorde und Klangfarben ---- */
const NOTEI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const nm=s=>{const m=/^([A-G])([#b]?)(-?\d)$/.exec(s);return 12*(+m[3]+1)+NOTEI[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);};
const parseMel=str=>{const o={};for(const t of str.split(' ')){if(!t)continue;const m=/^([A-G][#b]?\d)@(\d+)\/(\d+)$/.exec(t);o[+m[2]]=[nm(m[1]),+m[3]];}return o;};
const prepSong=sg=>{sg.P=sg.secs.map(S=>({ch:S.ch.map(c=>c.split(' ').map(nm)),mel:S.mel.map(parseMel)}));return sg;};
const SONGS={
  /* Vegas: Smooth Jazz in F-Dur, 78 BPM: Saxofon-Melodie, Rhodes-Akkorde (Gm9 C13 Fmaj9 Dm9), weicher Bass, Besenschlagzeug */
  /* Vegas: Casino-Jazz, langsam, Klavier, 60 BPM in C-Dur (Dm9 G13 Cmaj9 A7b9) */
  vegas:prepSong({swing:1,drums:'smoothjazz',rv:.4,slot:true,
    lead:{type:'ep',lp:3400,vol:.14,dur:2.4,attack:.006,idx:1.0,harm:[{n:-12,type:'ep',v:.4}]},
    bass:{pat:'cool',type:'pluck',vol:.34,lp:440,dur:2.8},
    comp:{steps:[0,6,10],type:'ep',vol:.04,lp:1700,dur:1.8},
    pad:{type:'strings',vol:.008,lp:800},
    secs:[
      {ch:['D2 C3 F3 A3 E4','G2 F3 B3 E4 A4','C2 B3 E4 G4 D5','A2 G3 C#4 E4 Bb4'],
       mel:['A5@0/6 G5@6/2 F5@8/8','E5@0/4 D5@4/4 B4@8/6 D5@14/2','E5@0/8 G5@8/4 D5@12/4','C#5@0/4 E5@4/4 Bb4@8/4 A4@12/4']},
      {ch:['F2 E3 A3 C4 G4','Bb2 Ab3 D4 F4 G4','E2 D3 G3 B3 F#4','A2 G3 C#4 E4 B4'],
       mel:['C6@0/6 A5@6/2 G5@8/8','D6@0/4 C6@4/4 Ab5@8/8','B5@0/6 G5@6/2 E5@8/8','C#6@0/4 B5@4/4 A5@8/8']},
      {ch:['D2 C3 F3 A3 E4','G2 F3 B3 E4 A4','C2 B3 E4 G4 D5','A2 G3 C#4 E4 Bb4'],
       mel:['A5@0/4 C6@4/4 B5@8/6 A5@14/2','G5@0/6 E5@6/2 D5@8/8','E5@0/4 G5@4/4 C6@8/8','E6@0/4 C#6@4/4 A5@8/4 E5@12/4']},
      {ch:['D2 C3 F3 A3 E4','G2 F3 B3 E4 A4','C2 B3 E4 G4 D5','A2 G3 C#4 E4 Bb4'],
       mel:['F5@0/12','D5@0/16','C5@0/16','A4@0/16']}]}),
  /* Italien: Strand-Pop in G-Dur, 112 BPM: Akkordeon in Terzen, Zupf- und Schlaggitarre, Mandolinen-Tremolo, Streicher, Bongos, Wellen */
  italy:prepSong({swing:0,drums:'beach',rv:.22,
    lead:{type:'accord',lp:2300,vol:.075,dur:.9,vib:5,attack:.03,harm:[{n:-4,type:'accord',v:.7}],dbl:{n:12,type:'pluck',v:.5}},
    bass:{pat:'oompah',type:'pluck',vol:.28,lp:650,dur:1.1},
    comp:{steps:[0,4,6,10,12,14],type:'pluck',vol:.03,lp:2200,dur:.45},
    arp:{every:2,minI:0,type:'pluck',vol:.025,dur:1,oct:12,lp:2200},
    pad:{type:'strings',vol:.012,lp:1000},
    secs:[
      {ch:['G2 G3 B3 D4','E2 E3 G3 B3','C3 C4 E4 G4','D2 D3 F#3 A3'],
       mel:['D5@0/4 D5@4/2 E5@6/2 D5@8/4 B4@12/4','B4@0/4 B4@4/2 C5@6/2 B4@8/4 G4@12/4','E5@0/4 E5@4/2 D5@6/2 E5@8/4 G5@12/4','F#5@0/6 E5@6/2 D5@8/8']},
      {ch:['C3 C4 E4 G4','G2 G3 B3 D4','A2 A3 C4 E4','D2 D3 F#3 A3'],
       mel:['E5@0/4 G5@4/4 E5@8/4 C5@12/4','D5@0/4 B4@4/4 G4@8/8','C5@0/4 E5@4/4 A5@8/4 G5@12/4','F#5@0/8 D5@8/8']},
      {ch:['E2 E3 G3 B3','C3 C4 E4 G4','G2 G3 B3 D4','D2 D3 F#3 A3'],
       mel:['G5@0/4 E5@4/4 B4@8/8','G5@0/4 E5@4/4 C5@8/8','D5@0/4 G5@4/4 B5@8/8','A5@0/4 F#5@4/4 D5@8/8']},
      {ch:['G2 G3 B3 D4','C3 C4 E4 G4','A2 A3 C4 E4','D2 D3 F#3 A3'],
       mel:['B4@0/8 G4@8/8','G4@0/8 E5@8/8','C5@0/8 A4@8/8','F#4@0/8 A4@8/8']}]})
};
const ZMUS={
  oase:{root:55,sc:'majp',prog:[0,3,4,3],bpm:86,pad:'sine',padLp:1800,lead:'triangle',leadLp:2400,leadVol:.09,leadDur:3,bass:{type:'sine',lp:600,vol:.22,pat:[0,6,8,14]},stab:[10],stabType:'triangle',drums:'soft'},
  gruft:{root:57,sc:'minp',prog:[0,2,4,3],bpm:112,pad:'sawtooth',padLp:600,lead:'square',leadLp:2400,leadVol:.05,leadDur:2,bass:{type:'sawtooth',lp:520,vol:.17,pat:[0,3,6,8,11,14]},stab:[6,10],drums:'rock'},
  gold:{root:60,sc:'majp',prog:[0,2,1,3],bpm:128,pad:'triangle',padLp:1500,lead:'triangle',leadLp:3000,leadVol:.1,leadDur:2,bass:{type:'triangle',lp:900,vol:.26,pat:[0,2,4,6,8,10,12,14]},stab:[2,6,10,14],stabType:'triangle',drums:'dance'},
  moor:{root:50,sc:'dor',prog:[0,3,4,2],bpm:98,pad:'triangle',padLp:600,lead:'triangle',leadLp:1500,leadVol:.1,leadDur:3,bass:{type:'sine',lp:700,vol:.3,pat:[0,6,8,14]},stab:[10],drums:'soft'},
  wind:{root:53,sc:'lyd',prog:[0,1,0,4],bpm:118,pad:'sine',padLp:2000,lead:'triangle',leadLp:2600,leadVol:.09,leadDur:3,bass:{type:'triangle',lp:800,vol:.24,pat:[0,4,8,12]},stab:[4,12],stabType:'triangle',drums:'rock',wash:1},
  uhrwerk:{root:52,sc:'min',prog:[0,5,3,4],bpm:124,pad:'sawtooth',padLp:600,lead:'square',leadLp:2000,leadVol:.045,leadDur:1,bass:{type:'sawtooth',lp:520,vol:.15,pat:[0,2,4,6,8,10,12,14]},stab:[4,12],drums:'tick'},
  eis:{root:50,sc:'min',prog:[0,5,2,6],bpm:100,pad:'sine',padLp:1400,lead:'triangle',leadLp:1500,leadVol:.085,leadDur:3,bass:{type:'sine',lp:600,vol:.3,pat:[0,6,8,14]},stab:[6,14],stabType:'triangle',drums:'soft',soft:1},
  tiefsee:{root:45,sc:'min',prog:[0,3,4,0],bpm:92,pad:'triangle',padLp:420,lead:'sine',leadLp:1200,leadVol:.12,leadDur:3,bass:{type:'sine',lp:500,vol:.34,pat:[0,6,8,14]},stab:[],drums:'bubble'},
  hoelle:{root:41,sc:'phryg',prog:[0,1,0,4],bpm:76,pad:'sawtooth',padLp:380,lead:'square',leadLp:1000,leadVol:.04,leadDur:3,bass:{type:'sawtooth',lp:260,vol:.26,pat:[0,6,8,12]},stab:[10],drums:'heavy'},
  glut:{root:52,sc:'phryg',prog:[0,1,3,4],bpm:134,pad:'sawtooth',padLp:700,lead:'sawtooth',leadLp:1900,leadVol:.05,leadDur:2,bass:{type:'sawtooth',lp:560,vol:.2,pat:[0,2,3,6,8,10,11,14]},stab:[3,6,11],drums:'heavy'},
  leere:{root:48,sc:'whole',prog:[0,2,4,1],bpm:86,pad:'sawtooth',padLp:420,lead:'sine',leadLp:1400,leadVol:.1,leadDur:4,bass:{type:'sine',lp:400,vol:.3,pat:[0,8]},stab:[],drums:'void',sparse:.65,drone:1},
  wueste:{root:52,sc:'phryg',prog:[0,1,0,4],bpm:104,pad:'sawtooth',padLp:600,lead:'sawtooth',leadLp:1700,leadVol:.045,leadDur:2,bass:{type:'sawtooth',lp:480,vol:.17,pat:[0,3,6,10,13]},stab:[3,10],drums:'tribal',drone:1},
  ev_halloween:{root:45,sc:'min',prog:[0,5,3,4],bpm:104,pad:'sawtooth',padLp:420,lead:'sine',leadLp:1800,leadVol:.11,leadDur:3,bass:{type:'sine',lp:500,vol:.3,pat:[0,6,8,14]},stab:[6,14],stabType:'triangle',drums:'void',sparse:.6,drone:1},
  ev_xmas:{root:62,sc:'majp',prog:[0,3,4,3],bpm:100,pad:'sine',padLp:1800,lead:'sine',leadLp:4200,leadVol:.1,leadDur:2,bass:{type:'sine',lp:700,vol:.22,pat:[0,8]},stab:[4,12],stabType:'triangle',drums:'bells'},
  ev_easter:{root:60,sc:'majp',prog:[0,2,3,4],bpm:124,pad:'triangle',padLp:1600,lead:'triangle',leadLp:3200,leadVol:.1,leadDur:1,bass:{type:'triangle',lp:900,vol:.24,pat:[0,4,8,12]},stab:[2,6,10,14],stabType:'triangle',drums:'dance'},
  ev_valentine:{root:57,sc:'majp',prog:[0,3,1,4],bpm:76,pad:'sine',padLp:1500,lead:'sine',leadLp:2200,leadVol:.12,leadDur:4,bass:{type:'sine',lp:600,vol:.24,pat:[0,8]},stab:[4,12],stabType:'triangle',drums:'soft',soft:1},
  ev_italy:{bpm:112,song:SONGS.italy},
  ev_hungary:{root:52,sc:'hung',prog:[0,3,4,0],bpm:128,pad:'sawtooth',padLp:700,lead:'sawtooth',leadLp:2200,leadVol:.05,leadDur:2,bass:{type:'sawtooth',lp:560,vol:.2,pat:[0,3,6,8,11,14]},stab:[2,6,10,14],drums:'tribal'},
  ev_birthday:{root:60,sc:'majp',prog:[0,2,3,4],bpm:132,pad:'triangle',padLp:1800,lead:'triangle',leadLp:3200,leadVol:.11,leadDur:1,bass:{type:'triangle',lp:900,vol:.26,pat:[0,2,4,6,8,10,12,14]},stab:[2,6,10,14],stabType:'triangle',drums:'dance'},
  ev_vegas:{bpm:60,song:SONGS.vegas}
};
const noteOf=(zm,deg)=>{const sc=SC[zm.sc];const o=Math.floor(deg/sc.length);return zm.root+sc[((deg%sc.length)+sc.length)%sc.length]+12*o;};
function mkRng(kind){let a=2166136261;for(let i=0;i<kind.length;i++){a^=kind.charCodeAt(i);a=Math.imul(a,16777619);}return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
function mkMotif(kind,zm,pr){
  const R=mkRng(kind);
  const RH=[[0,3,6,8,10,12,14],[0,2,3,6,8,11,12,14],[0,4,6,8,10,13,14],[0,3,4,7,8,12,14],[0,2,6,8,10,14],[0,2,4,6,8,10,12,14],[0,6,8,12,14]];
  const rA=RH[Math.floor(R()*RH.length)],rB=RH[Math.floor(R()*RH.length)];
  const walk=(rh,base)=>{const seq=[];let c=base;for(const st of rh){const m=R();c+=m<.18?-2:m<.42?-1:m<.52?0:m<.78?1:2;c=Math.max(base-3,Math.min(base+4,c));seq.push([st,c]);}return seq;};
  const A=walk(rA,pr[0]+2),B=walk(rB,pr[1]+2);
  const B2=B.map((x,i)=>i===B.length-1?[x[0],pr[0]]:x);
  const mot=Array(64).fill(null);
  [A,B,A,B2].forEach((bar,bi)=>{for(const [st,deg] of bar)mot[bi*16+st]=deg;});
  return mot;
}
function mkProgs(kind,zm){
  const R=mkRng(kind+'p'),pick=a=>a[Math.floor(R()*a.length)];
  const P0=zm.prog.slice();
  const P1=[P0[0],pick([1,2,5]),pick([3,4]),pick([4,3,1])];
  const P2=[pick([3,5]),pick([4,2]),P0[0],pick([4,1])];
  const P3=[5,3,1,4].map(d=>(d+Math.floor(R()*2))%6);
  return [P0,P1,P2,P3];
}
const MOT={},PROGS={};
for(const k of Object.keys(ZMUS)){if(ZMUS[k].song)continue;PROGS[k]=mkProgs(k,ZMUS[k]);MOT[k]=PROGS[k].map((pr,i)=>mkMotif(k+i,ZMUS[k],pr));}
AU.zm=ZMUS.gruft;AU.mots=MOT.gruft;AU.progs=PROGS.gruft;AU.var=0;
AU.playSong=function(sg,step,t){
  const BL=sg.bl||16,bar=Math.floor(step/BL)%16,s=step%BL;
  if(s===0&&bar%4===0&&this.pvar!==undefined)this.var=this.pvar;
  const sec=(Math.floor(bar/4)+(this.var||0))%4,bi=bar%4;
  const I=sec===3?0:Math.min(2,this.intensity+(sec===2?1:0));
  const sd=this.sd,T=t+(sg.swing&&s%4===2?sd*sg.swing*.67:0);
  const P=sg.P[sec],ch=P.ch[bi],br=ch[0],ct=ch.slice(1);
  const F=m=>mfT(m);
  const tn=(o,tt)=>{o.t=tt===undefined?T:tt;o.dest=this.mus;if(o.rv===undefined&&sg.rv)o.rv=sg.rv;this.tone(o);};
  const ns=o=>{o.t=t;o.dest=this.mus;this.noise(o);};
  const kick=v=>tn({f:140,to:45,dur:.18,type:'sine',vol:v},t),snare=v=>{ns({f:1900,dur:.12,vol:v,q:.7});tn({f:190,to:120,dur:.08,type:'triangle',vol:v*.6},t);},hat=v=>ns({f:8000,ft:'highpass',dur:.03,vol:v});
  if(sg.slot&&s===0&&bi===0&&bar%4===0&&I>=1){tn({f:2637,dur:.25,type:'sine',vol:.04,send:true},t);tn({f:3951,dur:.35,type:'sine',vol:.04,send:true},t+sd*1.5);}
  if(s===0&&sg.pad)for(const n of ct)tn({f:F(n),dur:sd*(BL-.5),attack:.5,type:sg.pad.type,vol:sg.pad.vol,lp:sg.pad.lp},t);
  if(s===0&&sg.drone)for(const n of sg.drone)tn({f:F(nm(n)),dur:sd*15.5,attack:.8,type:'sine',vol:.05},t);
  const bs=sg.bass;
  if(bs&&(I>=1||s%8===0)){
    let off=null;
    if(bs.pat==='boogie'){if(s%2===0)off=[0,4,7,9,10,9,7,4][s/2];}
    else if(bs.pat==='oompah'){if(s===0||s===8)off=0;else if(s===4||s===12)off=7;}
    else if(bs.pat==='hop'){if(s===0||s===14)off=0;else if(s===6||s===8)off=7;}
    else if(bs.pat==='tar'){if(s%4===0)off=s%8===0?0:7;}
    else if(bs.pat==='root'){if(s===0||s===8)off=0;}
    else if(bs.pat==='waltz'){if(s===0)off=0;}
    else if(bs.pat==='six'){if(s===0)off=0;else if(s===6)off=7;}
    else if(bs.pat==='walk'){if(s%4===0)off=[0,4,7,9][s/4];}
    else if(bs.pat==='cool'){if(s===0)off=0;else if(s===7)off=7;else if(s===10)off=12;}
    if(off!==null)tn({f:F(br+off),dur:sd*(bs.dur||1.8),type:bs.type,vol:bs.vol,lp:bs.lp,attack:.005});
  }
  for(const cp of [sg.comp,sg.comp2])if(cp&&I>=1&&cp.steps.includes(s))for(const n of ct)tn({f:F(n),dur:sd*(cp.dur||1),type:cp.type,vol:cp.vol,lp:cp.lp||2000});
  if(sg.arp&&I>=sg.arp.minI&&s%sg.arp.every===0){const k=Math.floor(s/sg.arp.every)%ct.length;tn({f:F(ct[k]+(sg.arp.oct||0)),dur:sd*(sg.arp.dur||1.5),type:sg.arp.type,vol:sg.arp.vol,lp:sg.arp.lp||2400,send:true});}
  const mn=P.mel[bi][s];
  if(mn){
    const m=mn[0],len=mn[1],L=sg.lead,v=L.vol*(I>=2?1.15:1)*(sec===3?.75:1);
    if(L.trem){for(let k=0;k<len;k+=L.trem)tn({f:F(m),dur:sd*Math.min(len-k,L.trem)*1.15+.03,type:L.type,vol:v*(k?.7:1),lp:L.lp,attack:.004,send:true},T+k*sd);}
    else tn({f:F(m),dur:sd*len*(L.dur||1),type:L.type,vol:v,lp:L.lp,attack:L.attack||.012,vib:L.vib,send:true});
    if(L.harm&&I>=1)for(const h of L.harm)tn({f:F(m+h.n),dur:sd*len*(L.dur||1),type:h.type,vol:v*h.v,lp:L.lp,attack:L.attack||.012,send:true});
    if(L.dbl&&(sec===2||L.dblAll))tn({f:F(m+L.dbl.n),dur:sd*len*(L.dur||1),type:L.dbl.type,vol:v*L.dbl.v,lp:L.lp,attack:.01,send:true});
  }
  switch(sg.drums){
    case 'rock':
      if(s===0||s===8)kick(.34);if(I>=1&&s===10)kick(.2);if(s===4||s===12)snare(.16);if(s%4===0||s%4===2)hat(.04);
      if(bi===3&&I>=1&&s>=12)snare(.1);break;
    case 'rr':
      if(s===0||s===8)kick(.36);if(I>=1&&(s===6||s===10))kick(.2);if(s===4||s===12)snare(.2);
      if(s%2===0)ns({f:9000,ft:'highpass',dur:.06,vol:.045});
      if(s===0&&bi===0)ns({f:6000,ft:'highpass',dur:.7,vol:.07});
      if(bi===3&&s>=8&&s%2===0)tn({f:230-(s-8)*14,to:110,dur:.14,type:'sine',vol:.2},t);
      if(bi===3&&s>=12)snare(.1);break;
    case 'bigband':
      if(s%4===0)kick(.1);if(I>=1&&(s===4||s===12))ns({f:2600,dur:.05,vol:.07,q:1.2});
      if(s%8===0||s===6||s===14||s===4||s===12)ns({f:8500,ft:'highpass',dur:.09,vol:.05});
      if(I>=2&&(s===10||s===2))snare(.05);break;
    case 'chip':
      if(s===0||s===8)kick(.22);if(I>=1&&s===10)kick(.14);
      if(s===4||s===12){tn({f:900,to:180,dur:.09,type:'square',vol:.06},t);ns({f:5000,dur:.06,vol:.1,q:.5});}
      if(s%2===0)hat(.03);
      if(s===0&&bi===0&&I>=1){tn({f:2637,dur:.25,type:'sine',vol:.05,send:true},t);tn({f:3951,dur:.35,type:'sine',vol:.05,send:true},t+sd*1.5);}
      if(bi===3&&s>=12)snare(.08);break;
    case 'pop':
      if(s===0||s===8)kick(.22);if(I>=1&&s===10)kick(.12);
      if(s===4||s===12)ns({f:2200,dur:.08,vol:.07,q:.7});if(s%2===0)hat(.022);break;
    case 'brush':
      if(s===0||(I>=1&&s===10))kick(.1);
      if(s===4||s===12)ns({f:1500,ft:'lowpass',dur:.14,vol:.05,q:.4});
      if(s%4===0||s%8===6)ns({f:3800,ft:'lowpass',dur:.1,vol:.03,q:.4});break;
    case 'beach':
      if(s===0||(I>=1&&s===8))kick(.12);
      if(s===3||s===6||s===10||s===14)tn({f:s%8===6?340:250,to:s%8===6?260:190,dur:.07,type:'sine',vol:.09},t);
      if(s%2===0)ns({f:4500,ft:'lowpass',dur:.05,vol:.03,q:.5});
      if(s===0&&bi===0&&bar%4===0)ns({f:500,to:1400,dur:sd*14,vol:.035,q:.4});break;
    case 'smoothjazz':
      if(s===0)kick(.05);
      if(s%4===0)ns({f:3600,ft:'lowpass',dur:.16,vol:.026,q:.4});
      if(s===6||s===14)ns({f:5200,ft:'bandpass',dur:.07,vol:.02,q:.8});
      if(s===4||s===12)ns({f:2300,ft:'bandpass',dur:.05,vol:.03,q:1.4});
      if(bi===3&&s===14)ns({f:2800,to:700,dur:.3,vol:.03,q:.5});break;
    case 'swingbig':
      if(s%4===0)kick(.07);
      if(s===0||s===4||s===6||s===8||s===12||s===14)ns({f:6200,ft:'bandpass',dur:.09,vol:s%8===6||s%8===0?.055:.04,q:.9});
      if(s===4||s===12)ns({f:1800,ft:'lowpass',dur:.06,vol:.05,q:.5});
      if(bi===3&&s>=12&&I>=1)snare(.07);break;
    case 'tar6':
      if(s===0||s===6)kick(.24);
      if(s%2===0)ns({f:6800,ft:'highpass',dur:.045,vol:s%6===0?.08:.045});
      if(I>=1&&(s===3||s===9))ns({f:2400,dur:.06,vol:.07,q:1});break;
    case 'sleigh':
      if(s===0)kick(.18);if(s%2===0)ns({f:7500,ft:'highpass',dur:.05,vol:.05});if(s%4===0)ns({f:5200,ft:'highpass',dur:.09,vol:.035});break;
    case 'polka':
      if(s===0||s===8)kick(.3);if(s===4||s===12)snare(.12);if(s%4===2)hat(.05);
      if(sg.party&&s===0&&sec===2&&bi===0)ns({f:3000,to:9000,dur:.5,vol:.08,q:.5});break;
    case 'tar':
      if(s===0||s===8)kick(.26);if(s%2===0)ns({f:6500,ft:'highpass',dur:.04,vol:.05});if(I>=1&&(s===6||s===14))snare(.08);break;
    case 'csardas':
      if(s===0||s===8)kick(.28);if(I>=1&&(s===4||s===12))snare(.1);if(s%2===0)hat(.035);break;
    case 'darbuka':
      if(s===0||s===8)tn({f:120,to:70,dur:.2,type:'sine',vol:.3},t);
      if(s===2||s===6||s===12||(I>=1&&s===14))ns({f:3600,dur:.06,vol:.1,q:2});
      if(I>=2&&s===10)ns({f:3000,dur:.05,vol:.06,q:2});break;
    case 'spring':
      if(s===0||s===8)kick(.16);if(s%4===0)tn({f:900,dur:.05,type:'square',vol:.035},t);if(I>=1&&s%8===4)ns({f:4200,ft:'highpass',dur:.05,vol:.05});break;
  }
};
AU.play=function(step,t){
  if((this.zm||ZMUS.gruft).song)return this.playSong(this.zm.song,step,t);
  const zm=this.zm||ZMUS.gruft,sd=this.sd,bar=Math.floor(step/16)%16,s=step%16;
  if(s===0&&bar%4===0&&this.pvar!==undefined){this.var=this.pvar;}
  const sec=(Math.floor(bar/4)+(this.var||0))%4,bi4=bar%4;
  const I=sec===3?0:Math.min(2,this.intensity+(sec===2?1:0));
  const sc=SC[zm.sc],rd=(this.progs||PROGS.gruft)[sec][bi4];
  const nt=d=>mfT(noteOf(zm,d));
  const tn=o=>{o.t=t;o.dest=this.mus;this.tone(o);},ns=o=>{o.t=t;o.dest=this.mus;this.noise(o);};
  const kick=v=>tn({f:140,to:45,dur:.18,type:'sine',vol:v||.38});
  const snare=v=>{ns({f:1900,dur:.12,vol:v||.14,q:.7});tn({f:190,to:120,dur:.08,type:'triangle',vol:.09});};
  const hat=v=>ns(zm.soft?{f:4200,dur:.04,vol:(v||.04)*.6,q:.8}:{f:8000,ft:'highpass',dur:.03,vol:v||.045});
  // Teppich
  if(s===0){
    for(const d of [0,2,4])tn({f:nt(rd+d),dur:sd*15.5,attack:.6,type:zm.pad,vol:.03,lp:zm.padLp});
    if(zm.drone)tn({f:nt(rd)/2,dur:sd*15.5,attack:1,type:'sine',vol:.06});
  }
  // Bass
  const bi=zm.bass.pat.indexOf(s);
  if(bi>=0&&(I>=1||s===0||s===8))tn({f:nt(rd+(bi%4===2?4:0))/2,dur:sd*1.7,type:zm.bass.type,vol:zm.bass.vol,lp:zm.bass.lp,attack:.005});
  // Akkord-Stöße
  if(I>=1&&zm.stab.includes(s))for(const d of [0,2,4])tn({f:nt(rd+d),dur:sd*1.2,type:zm.stabType||'triangle',vol:.032,lp:1700});
  // Melodie
  const m=(this.mots||MOT.gruft)[sec][bi4*16+s];
  if(m!==null&&m!==undefined&&(!zm.sparse||Math.random()<zm.sparse))
    {tn({f:nt(m+sc.length),dur:sd*(zm.leadDur||2)*(sec===3?1.6:1),type:zm.lead,vol:(zm.leadVol||.07)*(I>=2?1.15:1)*(sec===3?.8:1),lp:zm.leadLp,attack:.012,send:true});
     if(sec===2&&I>=1)tn({f:nt(m+sc.length-2),dur:sd*(zm.leadDur||2),type:zm.lead,vol:(zm.leadVol||.07)*.45,lp:zm.leadLp,attack:.02,send:true});}
  // Arpeggio in Abschnitt 2 und 3 der Form
  if((sec===1||sec===2)&&I>=1&&s%2===0)tn({f:nt(rd+[0,2,4,2][(s/2)%4]+sc.length),dur:sd*1.5,type:'triangle',vol:.018,lp:2400,send:true});
  // Fill am Ende jedes vierten Takts
  if(bi4===3&&I>=1&&zm.drums!=='void'&&(s===14||s===15))snare(.07);
  // Schlagzeug
  switch(zm.drums){
    case 'rock':
      if(s===0||s===8||(I>=2&&s===10))kick();
      if(s===4||s===12)snare();
      if(I>=1&&s%2===0)hat();if(I>=2&&s%2===1)hat(.03);break;
    case 'dance':
      if(I>=1&&s%4===0)kick(.34);else if(s===0)kick(.34);
      if(s===4||s===12)snare(.1);
      if(s%4===2)hat(.05);break;
    case 'tribal':
      if(s===0||s===6||s===10)tn({f:130,to:75,dur:.14,type:'sine',vol:.3});
      if(I>=1&&(s===3||s===8||s===13))ns({f:2200,dur:.05,vol:.1,q:2});
      if(I>=2&&s%2===1)hat(.04);break;
    case 'tick':
      if(I>=1&&s%2===0)tn({f:1800,dur:.02,type:'square',vol:.04});
      if(s===0||s===8)kick(.3);if(s===4||s===12)ns({f:2600,dur:.05,vol:.12,q:1.5});
      if(I>=2)hat(.035);break;
    case 'soft':
      if(s===0||(I>=1&&s===10))kick(.3);
      if(I>=1&&(s===4||s===12))hat(.05);
      if(zm.soft&&I>=2&&s%8===4)tn({f:300,dur:.2,type:'triangle',vol:.05});break;
    case 'bubble':
      if(s===0||(I>=1&&s===8))kick(.3);
      if(s%2===1&&Math.random()<.16)tn({f:300+Math.random()*200,to:900,dur:.09,type:'sine',vol:.06});
      if(I>=1&&(s===4||s===12))hat(.04);break;
    case 'heavy':
      if(s%4===0||(I>=1&&(s===3||s===11)))kick(.4);
      if(s===4||s===12)snare(.18);
      if(s%2===0)hat(.05);if(I>=2&&s%2===1)hat(.035);break;
    case 'swing':
      if(s===0||s===8)kick(.22);
      if(I>=1&&(s===4||s===12))ns({f:2400,dur:.09,vol:.08,q:.6});
      if(s%4===0)hat(.04);if(s%4===3&&I>=1)hat(.03);break;
    case 'bells':
      if(s===0)kick(.22);
      if(s%2===0)ns({f:7500,ft:'highpass',dur:.03,vol:.05});
      if(I>=1&&s%4===0)tn({f:nt(rd+4+sc.length*2),dur:.25,type:'sine',vol:.025,send:true});break;
    case 'oompah':
      if(s===0||s===8)kick(.3);if(s===4||s===12)snare(.1);
      if(I>=1&&s%2===0)hat(.04);break;
    case 'void':
      if(s===0&&bar%2===0)tn({f:nt(rd)/4,dur:sd*16,type:'sine',vol:.2,attack:1});
      if(I>=1&&s===8)kick(.3);
      if(I>=2&&s%4===2)ns({f:400,ft:'lowpass',dur:.3,vol:.1});break;
  }
  if(zm.wash&&s===0&&bar%2===0)ns({f:300,to:1500,dur:sd*14,vol:.05,q:.4});
};
AU.setIntensity=function(i){this.intensity=i;};
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume();});

const T=o=>AU.tone(o),N=o=>AU.noise(o);
const SFX={
  click(t){T({t,f:620,to:420,dur:.06,type:'square',vol:.07});},
  hop(t){T({t,f:300,to:620,dur:.1,type:'square',vol:.08});},
  ice(t){T({t,f:1800,to:900,dur:.2,type:'triangle',vol:.1});N({t,f:6000,ft:'highpass',dur:.12,vol:.06});},
  lure(t){[0,.12,.24].forEach((o,i)=>T({t:t+o,f:520+i*160,to:600+i*160,dur:.2,type:'sine',vol:.12}));},
  undo(t){T({t,f:600,to:300,dur:.18,type:'triangle',vol:.14});T({t:t+.08,f:450,to:900,dur:.15,type:'sine',vol:.1});},
  step(t){T({t,f:170,to:110,dur:.08,type:'triangle',vol:.18});N({t,f:900,dur:.04,vol:.05});},
  bump(t){T({t,f:90,to:60,dur:.1,type:'square',vol:.12});},
  wait(t){T({t,f:300,to:260,dur:.1,type:'sine',vol:.1});},
  hit(t){N({t,f:1800,to:500,dur:.14,vol:.3,q:.8});T({t,f:240,to:70,dur:.14,type:'sawtooth',vol:.14});},
  kill(t){[0,1,2].forEach(k=>T({t:t+k*.05,f:520-k*110,dur:.12,type:'square',vol:.1}));N({t,f:700,ft:'lowpass',dur:.2,vol:.15});},
  hurt(t){T({t,f:170,to:55,dur:.28,type:'sawtooth',vol:.22});N({t,f:500,to:120,dur:.25,vol:.25,q:.6});},
  block(t){T({t,f:900,to:1300,dur:.12,type:'triangle',vol:.14});N({t,f:3000,dur:.08,vol:.1});},
  mhit(t){T({t,f:200,to:90,dur:.1,type:'square',vol:.08});},
  shoot(t){T({t,f:1000,to:180,dur:.14,type:'square',vol:.1});N({t,f:4000,to:800,dur:.12,vol:.08});},
  aim(t){T({t,f:500,to:900,dur:.12,type:'sine',vol:.1});},
  spike(t){N({t,f:2500,dur:.1,vol:.22,q:1.2});T({t,f:300,to:120,dur:.1,type:'sawtooth',vol:.1});},
  coin(t){T({t,f:880,dur:.08,type:'sine',vol:.14});T({t:t+.07,f:1320,dur:.14,type:'sine',vol:.14});},
  heart(t){[523,659,784].forEach((f,k)=>T({t:t+k*.07,f,dur:.16,type:'triangle',vol:.14}));},
  key(t){T({t,f:1046,dur:.25,type:'triangle',vol:.14});T({t:t+.08,f:1568,dur:.3,type:'sine',vol:.12});T({t:t+.16,f:2093,dur:.3,type:'sine',vol:.08});},
  bombget(t){T({t,f:200,to:400,dur:.12,type:'square',vol:.1});},
  boom(t){N({t,f:900,to:60,dur:.6,vol:.5,ft:'lowpass',q:.5});T({t,f:110,to:30,dur:.5,type:'sine',vol:.5});},
  stairs(t){[392,494,587,784].forEach((f,k)=>T({t:t+k*.09,f,dur:.3,type:'triangle',vol:.14,send:true}));},
  flip(t){N({t,f:400,to:2400,dur:.18,vol:.12,q:.8});},
  card(t){[392,494,587].forEach(f=>T({t,f,dur:.4,type:'triangle',vol:.1,send:true}));},
  over(t){[392,349,311,262,196].forEach((f,k)=>T({t:t+k*.22,f,dur:.5,type:'sawtooth',vol:.1,lp:900,send:true}));},
  win(t){[262,330,392,523,659,784].forEach((f,k)=>T({t:t+k*.12,f,dur:.5,type:'triangle',vol:.14,send:true}));}
};
const SFXV={
  clink(t){T({t,f:1760,dur:.07,type:'triangle',vol:.13});T({t:t+.04,f:2349,dur:.1,type:'sine',vol:.1});},
  ping(t){T({t,f:2200,to:900,dur:.18,type:'sine',vol:.12});N({t,f:6000,ft:'highpass',dur:.05,vol:.05});},
  coins(t){[0,1,2,3].forEach(k=>T({t:t+k*.05,f:1500+k*260,dur:.1,type:'triangle',vol:.1}));N({t,f:5000,ft:'highpass',dur:.2,vol:.08});},
  sandsoft(t){N({t,f:2500,to:900,dur:.1,vol:.09,q:.5});},
  sandspit(t){N({t,f:3500,to:700,dur:.16,vol:.14,q:.4});T({t,f:300,to:140,dur:.1,type:'triangle',vol:.08});},
  thud(t){T({t,f:120,to:55,dur:.14,type:'sine',vol:.25});N({t,f:700,ft:'lowpass',dur:.1,vol:.12});},
  dust(t){N({t,f:1800,to:300,dur:.45,vol:.3,q:.4});T({t,f:100,to:40,dur:.3,type:'sine',vol:.2});},
  squelch(t){T({t,f:260,to:90,dur:.14,type:'sine',vol:.17});T({t:t+.04,f:200,to:330,dur:.09,type:'sine',vol:.1});N({t,f:500,to:200,dur:.12,vol:.08});},
  dart(t){T({t,f:1400,to:500,dur:.1,type:'triangle',vol:.1});N({t,f:5000,ft:'highpass',dur:.06,vol:.07});},
  spore(t){N({t,f:900,to:200,dur:.5,vol:.28,q:.5});T({t,f:150,to:60,dur:.4,type:'sine',vol:.25});},
  whoosh(t){N({t,f:400,to:2200,dur:.18,vol:.12,q:.6});},
  whistle(t){T({t,f:1800,to:1300,dur:.22,type:'sine',vol:.09});N({t,f:2500,dur:.2,vol:.05});},
  gust(t){N({t,f:300,to:2500,dur:.5,vol:.35,q:.4});},
  tick(t){T({t,f:1500,dur:.03,type:'square',vol:.1});T({t:t+.05,f:1000,dur:.03,type:'square',vol:.08});},
  clank(t){T({t,f:420,to:380,dur:.1,type:'square',vol:.1});T({t,f:640,to:600,dur:.12,type:'square',vol:.07});N({t,f:3000,dur:.06,vol:.12});},
  bolt(t){T({t,f:900,to:300,dur:.1,type:'sawtooth',vol:.09,lp:2000});N({t,f:2000,dur:.08,vol:.1,q:1.5});},
  steam(t){N({t,f:5000,ft:'highpass',dur:.45,vol:.25});T({t,f:300,to:200,dur:.3,type:'sine',vol:.1});},
  crystal(t){T({t,f:784,dur:.14,type:'triangle',vol:.1,send:true});T({t:t+.04,f:1047,dur:.16,type:'triangle',vol:.07,send:true});},
  shard(t){T({t,f:1500,to:700,dur:.14,type:'triangle',vol:.1});N({t,f:3500,dur:.08,vol:.06,q:.8});},
  shatter(t){N({t,f:2800,dur:.3,vol:.2,q:.7});[0,1,2].forEach(k=>T({t:t+k*.04,f:1200-k*200,dur:.12,type:'triangle',vol:.08}));},
  bloop(t){T({t,f:200,to:420,dur:.1,type:'sine',vol:.15});},
  bubble(t){T({t,f:500,to:1100,dur:.1,type:'sine',vol:.12});T({t:t+.06,f:700,to:1400,dur:.08,type:'sine',vol:.08});},
  crackle(t){N({t,f:4000,to:1200,dur:.14,vol:.14,q:1.2});T({t,f:180,to:90,dur:.1,type:'sawtooth',vol:.08,lp:600});},
  fireball(t){N({t,f:600,to:3000,dur:.3,vol:.28,q:.5});T({t,f:300,to:700,dur:.25,type:'sawtooth',vol:.1,lp:1200});},
  drone(t){T({t,f:80,to:60,dur:.25,type:'sawtooth',vol:.1,lp:300});T({t,f:83,to:62,dur:.25,type:'sawtooth',vol:.07,lp:300});},
  voidzap(t){T({t,f:1500,to:90,dur:.3,type:'sawtooth',vol:.1,lp:1500});T({t:t+.05,f:60,dur:.3,type:'sine',vol:.15});},
  zap(t){T({t,f:1400,to:150,dur:.22,type:'sawtooth',vol:.14,lp:3000});N({t,f:3500,dur:.2,vol:.18,q:2});},
  push(t){N({t,f:200,to:1800,dur:.22,vol:.3,q:.5});T({t,f:140,to:70,dur:.2,type:'sine',vol:.2});},
  blink(t){T({t,f:1000,to:250,dur:.1,type:'sine',vol:.12});T({t:t+.1,f:250,to:1000,dur:.1,type:'sine',vol:.12});},
  summon(t){[0,1,2,3].forEach(k=>T({t:t+k*.07,f:300+k*120,dur:.2,type:'triangle',vol:.1,send:true}));N({t,f:500,to:1400,dur:.3,vol:.08});},
  split(t){T({t,f:260,to:120,dur:.12,type:'sine',vol:.15});T({t:t+.05,f:320,to:140,dur:.12,type:'sine',vol:.12});},
  wake(t){T({t,f:110,to:70,dur:.35,type:'sawtooth',vol:.14,lp:500});T({t:t+.18,f:140,to:90,dur:.3,type:'sawtooth',vol:.1,lp:500});},
  steal(t){[880,740,622,523].forEach((f,k)=>T({t:t+k*.05,f,dur:.1,type:'square',vol:.07}));},
  chest(t){T({t,f:140,to:220,dur:.3,type:'sawtooth',vol:.08,lp:500});T({t:t+.25,f:1046,dur:.2,type:'triangle',vol:.12});T({t:t+.32,f:1568,dur:.25,type:'sine',vol:.1});},
  dice(t){N({t,f:2200,dur:.04,vol:.12,q:2});T({t,f:300+Math.random()*400,dur:.04,type:'square',vol:.05});},
  boss(t){T({t,f:95,to:48,dur:.9,type:'sawtooth',vol:.2,lp:400});T({t:t+.1,f:70,to:35,dur:.8,type:'sine',vol:.3});N({t,f:300,to:80,dur:.7,vol:.25,q:.4});}
};
const ZSND={
  gold:{step:'clink',hit:'clink',mhit:'clink',shoot:'ping',kill:'coins',boom:'coins'},
  wueste:{step:'sandsoft',mhit:'thud',shoot:'sandspit',kill:'dust',boom:'dust'},
  moor:{step:'squelch',mhit:'squelch',shoot:'dart',kill:'squelch',boom:'spore'},
  wind:{step:'whoosh',mhit:'whoosh',shoot:'whistle',kill:'whoosh',boom:'gust'},
  uhrwerk:{step:'tick',hit:'clank',mhit:'clank',shoot:'bolt',kill:'clank',boom:'steam'},
  eis:{step:'crystal',mhit:'crystal',shoot:'shard',kill:'shatter',boom:'shatter'},
  tiefsee:{step:'bloop',mhit:'bloop',shoot:'bubble',kill:'bubble',boom:'bubble'},
  glut:{step:'crackle',mhit:'crackle',shoot:'fireball',kill:'crackle',boom:'fireball'},
  leere:{step:'drone',mhit:'drone',shoot:'voidzap',kill:'voidzap',boom:'voidzap'}
};
function sfx(n,kd){
  if(!AU.ctx||!save.settings.sfx)return;
  try{
    const k=kd||(G?kindOf(G.depth):'gruft');
    const v=ZSND[k]&&ZSND[k][n];
    const f=(v&&SFXV[v])||SFX[n]||SFXV[n];
    if(f)f(AU.ctx.currentTime);
  }catch(e){}
}
const vibe=ms=>{if(save.settings.vib&&navigator.vibrate)try{navigator.vibrate(ms);}catch(e){}};

