/* src/js/audio/engine.js
   Audio-Motor: Web-Audio, Instrumente und Soundeffekte. */
/* ================= Audio ================= */
const AU={ctx:null,playing:false,step:0,next:0,timer:null,intensity:0,sd:60/88/4};
const CH=[[50,53,57],[46,50,53],[43,46,50],[45,49,52]];
const mf=m=>440*Math.pow(2,(m-69)/12);
AU.init=function(){
  if(this.ctx)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=this.ctx=new C();
    const comp=c.createDynamicsCompressor();comp.connect(c.destination);
    this.master=c.createGain();this.master.gain.value=.9;this.master.connect(comp);
    this.mus=c.createGain();this.mus.connect(this.master);
    this.sfx=c.createGain();this.sfx.connect(this.master);
    this.delay=c.createDelay(1);this.delay.delayTime.value=.34;
    const fb=c.createGain();fb.gain.value=.36;const wet=c.createGain();wet.gain.value=.3;
    this.delay.connect(fb);fb.connect(this.delay);this.delay.connect(wet);wet.connect(this.mus);
    const len=c.sampleRate;const buf=c.createBuffer(1,len,c.sampleRate);const dd=buf.getChannelData(0);
    for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;
    this.nbuf=buf;
    const rl=Math.floor(c.sampleRate*1.7),ir=c.createBuffer(2,rl,c.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<rl;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/rl,3.2);}
    this.rev=c.createConvolver();this.rev.buffer=ir;const rgn=c.createGain();rgn.gain.value=.55;this.rev.connect(rgn);rgn.connect(this.mus);
    this.apply();
  }catch(e){this.ctx=null;}
};
AU.apply=function(){if(!this.ctx)return;this.mus.gain.value=save.settings.music?.6*(save.settings.musicVol/100):0;this.sfx.gain.value=save.settings.sfx?.9*(save.settings.sfxVol/100):0;};
AU.unlock=function(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();if(this.ctx&&!this.playing)this.startMusic();};
AU.pcache=new Map();
AU.pluckBuf=function(f,dur){
  const c=this.ctx,sr=c.sampleRate,key=Math.round(f*4)+':'+Math.round(dur*10);
  let b=this.pcache.get(key);if(b)return b;
  const n=Math.max(64,Math.floor(sr*dur)),N=Math.max(2,Math.round(sr/f));
  b=c.createBuffer(1,n,sr);const d=b.getChannelData(0),ring=new Float32Array(N);
  let prev=0;for(let i=0;i<N;i++){const r=Math.random()*2-1;prev=prev*.45+r*.55;ring[i]=prev;}
  const dec=Math.min(.9996,.985+f/9000*.1+.006);let p=0;
  for(let i=0;i<n;i++){const a=ring[p],q=ring[(p+1)%N];const v=dec*.5*(a+q);ring[p]=v;d[i]=a;p=(p+1)%N;}
  const fo=Math.min(n,Math.floor(sr*.02));for(let i=0;i<fo;i++)d[n-1-i]*=i/fo;
  if(this.pcache.size>400)this.pcache.clear();
  this.pcache.set(key,b);return b;
};
AU.inst=function(o){
  const c=this.ctx;if(!c)return;
  const t=o.t!==undefined?o.t:c.currentTime,f=o.f,dur=Math.max(.06,o.dur),vol=o.vol||.1,ty=o.type;
  const g=c.createGain(),stops=[];
  const ex=(node,a,hold)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);g.gain.setValueAtTime(vol,t+Math.max(a+.001,dur-hold));g.gain.exponentialRampToValueAtTime(.0001,t+dur);};
  const flt=hz=>{const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=hz;return l;};
  if(ty==='pluck'){
    const bf=this.pluckBuf(f,Math.min(2.4,dur*1.5)),s=c.createBufferSource();s.buffer=bf;
    const l=flt(o.lp||3000);s.connect(l);l.connect(g);
    g.gain.setValueAtTime(vol*2,t);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.08,dur*1.4));
    s.start(t);stops.push(s);
  }else if(ty==='ep'){
    const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain();
    car.frequency.value=f;mod.frequency.value=f;mg.gain.setValueAtTime(f*(o.idx||2.4),t);mg.gain.exponentialRampToValueAtTime(f*.12,t+dur*.7);
    mod.connect(mg);mg.connect(car.frequency);car.connect(g);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    car.start(t);mod.start(t);stops.push(car,mod);
  }else{
    const l=flt(o.lp||2400);l.connect(g);
    const det=ty==='strings'?[-10,0,10]:ty==='accord'?[-9,0,9]:ty==='brass'?[-6,6]:ty==='sax'?[-4,4]:[0];
    const lf=(o.vib||ty==='accord'||ty==='sax')?c.createOscillator():null;
    if(ty==='sax'){const q=c.createOscillator();q.type='triangle';q.frequency.value=f;q.connect(l);q.start(t);stops.push(q);}
    for(const dc of det){
      const q=c.createOscillator();
      if(ty==='organ'){if(!AU.wave){AU.wave=c.createPeriodicWave(new Float32Array(8),new Float32Array([0,1,.55,.4,.25,0,.18,0]));}q.setPeriodicWave(AU.wave);}
      else q.type='sawtooth';
      q.frequency.value=f;q.detune.value=dc;
      if(lf){const lg=c.createGain();lg.gain.value=f*(o.vib||8)*.000578;lf.connect(lg);lg.connect(q.frequency);}
      q.connect(l);q.start(t);stops.push(q);
    }
    if(lf){lf.frequency.value=5.3;lf.start(t);stops.push(lf);}
    const a=o.attack||(ty==='strings'?.35:ty==='sax'?.07:ty==='brass'?.03:.03);
    if(ty==='brass'){l.frequency.setValueAtTime((o.lp||2400)*.22,t);l.frequency.exponentialRampToValueAtTime(o.lp||2400,t+.08);}
    ex(g,a,Math.min(.12,dur*.3));
  }
  g.connect(o.dest||this.sfx);if(o.send)g.connect(this.delay);
  if(o.rv&&this.rev){const rg=c.createGain();rg.gain.value=o.rv;g.connect(rg);rg.connect(this.rev);}
  for(const q of stops)q.stop(t+dur*1.5+.15);
};
AU.tone=function(o){
  if(o.type==='pluck'||o.type==='ep'||o.type==='brass'||o.type==='organ'||o.type==='accord'||o.type==='strings'||o.type==='sax')return this.inst(o);
  const c=this.ctx;if(!c)return;
  const t=o.t!==undefined?o.t:c.currentTime;
  const osc=c.createOscillator(),g=c.createGain();
  osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.f,t);
  if(o.vib){const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(o.f*o.vib*.000578,t+Math.min(.35,o.dur*.5));lf.connect(lg);lg.connect(osc.frequency);lf.start(t);lf.stop(t+o.dur+.05);}
  if(o.to)osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.to),t+o.dur);
  const a=o.attack||.005;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.2,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+o.dur);
  if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;osc.connect(f);f.connect(g);}else osc.connect(g);
  g.connect(o.dest||this.sfx);if(o.send)g.connect(this.delay);
  osc.start(t);osc.stop(t+o.dur+.05);
};
AU.noise=function(o){
  const c=this.ctx;if(!c)return;
  const t=o.t!==undefined?o.t:c.currentTime;
  const s=c.createBufferSource();s.buffer=this.nbuf;
  const f=c.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);
  if(o.to)f.frequency.exponentialRampToValueAtTime(Math.max(20,o.to),t+o.dur);
  f.Q.value=o.q||1;
  const g=c.createGain();g.gain.setValueAtTime(o.vol||.2,t);g.gain.exponentialRampToValueAtTime(.0001,t+o.dur);
  s.connect(f);f.connect(g);g.connect(o.dest||this.sfx);s.start(t);s.stop(t+o.dur+.05);
};
AU.reset=function(){
  const c=this.ctx;if(!c||!this.mus)return;
  const g=this.mus.gain,now=c.currentTime,tgt=save.settings.music?.6*(save.settings.musicVol/100):0;
  try{g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(0,now+.14);g.setValueAtTime(0,now+.5);g.linearRampToValueAtTime(tgt,now+1.1);}catch(_){}
  this.step=0;this.next=now+.55;
};
AU.setKind=function(kz,zm,mots,progs){
  if(this.kz===kz&&this.zm===zm)return false;
  this.kz=kz;this.zm=zm;this.mots=mots;this.progs=progs;this.reset();return true;
};
AU.startMusic=function(){
  if(!this.ctx||this.playing)return;
  this.playing=true;this.step=0;this.next=this.ctx.currentTime+.12;
  this.timer=setInterval(()=>this.sched(),30);
};
AU.sched=function(){
  const c=this.ctx;if(!c)return;
  while(this.next<c.currentTime+.16){this.play(this.step,this.next);this.next+=this.sd;this.step=(this.step+1)%((((this.zm&&this.zm.song&&this.zm.song.bl)||16))*16);}
};
const mfT=n=>mf(n+(AU.trans||0));
const SC={minp:[0,3,5,7,10],majp:[0,2,4,7,9],phryg:[0,1,4,5,7,8,10],dor:[0,2,3,5,7,9,10],lyd:[0,2,4,6,7,9,11],min:[0,2,3,5,7,8,10],hung:[0,2,3,6,7,8,11],whole:[0,2,4,6,8,10]};
