/* src/js/meta/incentives.js
   Anreize: Gruftsteine, Tageslauf, Login-Bonus und Aufgaben. */
/* ================= Anreize: Gruftsteine, Tageslauf, Login, Aufgaben ================= */
const pad2=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const yesterdayKey=()=>{const d=new Date();d.setDate(d.getDate()-1);return dayKey(d);};
const weekKey=()=>{const d=new Date(),t=new Date(d.getFullYear(),0,1);return d.getFullYear()+'-W'+Math.floor(((d-t)/86400000+t.getDay())/7);};
const hashStr=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
function withSeed(key,fn){
  const orig=Math.random;let a=hashStr(key);
  Math.random=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};
  try{return fn();}finally{Math.random=orig;}
}
function addGS(n){if(n>0){save.gs=(save.gs||0)+n;persist();}}
const ACHGS={boss1:15,boss10:50,goblin:15,thief:25,lucky:15,gambler:20,dice10:80,rich:20,collector:30,phoenix:25,bomber:20,thrower:20,untouched:20,hc30:100,hp10:100,zoo:40,zooall:200,win:300,endless:100};
for(let i=1;i<=10;i++)ACHGS['zone'+i]=10*i;
/* dauerhafte Verbesserungen */
const META=[
  {id:'mhp',name:'Zähes Blut',desc:'+1 maximales Leben zu Beginn jedes Laufs.',cost:[40,80,140,220,320,450,650]},
  {id:'start',name:'Startvorrat',desc:'+1 Wurf-Item zu Beginn.',cost:[30,70,120]},
  {id:'gold',name:'Taschengeld',desc:'+20 Münzen zu Beginn.',cost:[30,60,90,130,180]},
  {id:'shield',name:'Eisenhaut',desc:'+1 Block pro Etage.',cost:[120,250]},
  {id:'undo',name:'Zeitband',desc:'+1 Zurück pro Etage (nicht auf Hardcore und 1 HP).',cost:[150,300]},
  {id:'dice',name:'Glücksbringer',desc:'Du startest mit dem Gruftwürfel.',cost:[100]},
  {id:'rep',name:'Verhandlungsgeschick',desc:'Händler verlangen 5 % weniger.',cost:[60,110,170,240]},
  {id:'greed',name:'Beutegeist',desc:'+10 % Münzen von Gegnern und Boden.',cost:[80,150,240]},
  {id:'boots',name:'Lederstiefel',desc:'Stacheln tun dir nichts mehr.',cost:[250]},
  {id:'armor',name:'Kettenhemd',desc:'Treffer mit 2 oder mehr Schaden richten 1 weniger an.',cost:[600]},
  {id:'reach',name:'Lange Waffen',desc:'Du startest mit dem Speer, danach auch mit der Schleuder.',cost:[350,900]},
  {id:'edge',name:'Scharfer Anfang',desc:'+1 Grundschaden in jedem Lauf.',cost:[500]}
];
const metaLv=id=>(save.meta[id]||0);
const metaOn=()=>!(G&&G.daily);
const metaMul=id=>metaOn()?metaLv(id):0;
/* Tageslauf */
const DAILY_RULES=[
  {name:'Doppelte Gegner',desc:'Zwei Gegner mehr pro Etage, dafür 50 % mehr Münzen.',mod:{mon:2,monAt:[1,1],money:1.5}},
  {name:'Glasherz',desc:'Nur 3 Leben, Herzen heilen 1, doppelte Münzen.',mod:{hp:3,heart:1,money:2}},
  {name:'Wurfkönig',desc:'Start mit 6 Wurf-Items und +1 Wurf-Item pro Etage.',mod:{ammo:5},start(g){g.sack=1;}},
  {name:'Teure Waren',desc:'Händler verlangen fast das Doppelte, Münzen geben 80 % mehr.',mod:{price:1.8,money:1.8}},
  {name:'Zähe Gegner',desc:'Gegner haben 2 Leben mehr, du startest mit 8 Leben.',mod:{hp:8,mhp:2,hpAt:1}},
  {name:'Kein Nachschub',desc:'Herzen liegen nicht herum, dafür 6 Leben und 50 % mehr Münzen.',mod:{hp:6,heart:0,money:1.5}}
];
const ruleOf=(day=dayKey())=>hashStr('rule'+day)%DAILY_RULES.length;
function makeDaily(r,r2){const R=DAILY_RULES[r];return {...DIFFS.normal,...R.mod,...(r2!==undefined&&DAILY_RULES[r2]?DAILY_RULES[r2].mod:{}),name:r2!==undefined?'Wochenprüfung':'Tageslauf'};}
const weekRules=()=>{const k=weekKey(),N=DAILY_RULES.length,a=hashStr('wk'+k)%N,b=(a+1+hashStr('wk2'+k)%(N-1))%N;return [a,b];};
const WEEK_REW=[[10,100],[20,200],[35,350],[50,500]];
function weeklyProgress(){
  const k=weekKey();if(!save.wk||save.wk.key!==k)save.wk={key:k,best:0,got:{}};
  const w=save.wk;if(G.depth>w.best)w.best=G.depth;
  for(const [d,g] of WEEK_REW)if(w.best>=d&&!w.got[d]){w.got[d]=1;mrGain(80);addGS(g);toast('Wochenprüfung: Etage '+d+' (+'+g+' Gruftsteine)');sfx('win');}
  persist();
}
function dailyRoll(){const d=save.daily;if(d.day!==dayKey()){d.day=dayKey();d.best=0;d.done=false;persist();}}
function dailyProgress(){
  if(G.weekly){weeklyProgress();return;}
  dailyRoll();const d=save.daily;
  if(G.depth>d.best)d.best=G.depth;
  if(!d.done&&G.depth>=10){
    d.done=true;d.streak=d.last===yesterdayKey()?d.streak+1:1;d.last=dayKey();
    const g=30+5*Math.min(d.streak,10);addGS(g);toast('Tageslauf geschafft: +'+g+' Gruftsteine (Serie '+d.streak+')');sfx('win');
  }
  persist();
}
/* Gruftsteine nach einem Lauf */
function grantRun(){
  if(!G||G.gsPaid)return 0;G.gsPaid=true;
  if(!G.daily){const so=(G.depth>100?3+Math.floor((G.depth-101)/3):0)+(G.rush?Math.floor((G.depth/5-1)/4):0);if(so>0){save.souls=(save.souls||0)+so;G.soulGain=so;}}
  const mul=(G.timed?1.25:1)*(1+.02*soulLv('sf'))*(1+.15*(G.asc||0))*(G.mut?1.25:1)*(G.daily?1.4:({leicht:.35,normal:1,schwer:1.8,hardcore:3,'1hp':4.5}[G.diff]||1));
  const g=Math.max(1,Math.round((G.depth*2+(G.speedGS||0)+Math.floor(G.kills/5)+(G.bossKills||0)*15)*mul));
  addGS(g);return g;
}
/* Aufgaben */
const QPOOL=[
  {t:'kills',txt:n=>'Besiege '+n+' Gegner',g:[25,40,60],r:15},
  {t:'depth',txt:n=>'Erreiche Etage '+n+' in einem Lauf',g:[8,12,16],r:20,max:true},
  {t:'bosses',txt:n=>'Besiege '+n+(n>1?' Bosse':' Boss'),g:[1,2],r:25},
  {t:'coins',txt:n=>'Sammle '+n+' Münzen vom Boden',g:[10,16,24],r:15},
  {t:'throws',txt:n=>'Wirf '+n+' Wurf-Items',g:[4,6,9],r:15},
  {t:'untouched',txt:n=>'Schaffe '+n+' Etagen ohne Schaden',g:[2,3,4],r:20},
  {t:'picks',txt:n=>'Wähle '+n+' Verstärkungen',g:[5,8,12],r:15},
  {t:'rolls',txt:n=>'Würfle '+n+'-mal im Händler',g:[1,2,3],r:20},
  {t:'zones',txt:n=>'Schaffe '+n+(n>1?' Zonen':' Zone'),g:[1,2],r:30}
];
const WPOOL=[{t:'kills',n:250,r:150,txt:'Besiege 250 Gegner'},{t:'depth',n:40,r:150,txt:'Erreiche Etage 40',max:true},{t:'bosses',n:8,r:150,txt:'Besiege 8 Bosse'},{t:'zones',n:6,r:150,txt:'Schaffe 6 Zonen'}];
function rollQuests(){
  const q=save.q;
  if(q.day!==dayKey()){
    const list=withSeed('q'+dayKey(),()=>shuffle(QPOOL.slice()).slice(0,3).map(d=>({t:d.t,n:pick(d.g),r:d.r})));
    save.q={day:dayKey(),list,prog:{},done:{}};
  }
  const w=save.wq;
  if(w.week!==weekKey()){const d=WPOOL[hashStr('w'+weekKey())%WPOOL.length];save.wq={week:weekKey(),t:d.t,n:d.n,r:d.r,prog:0,done:false};}
  persist();
}
function questEvent(t,n,isMax){
  rollQuests();
  const q=save.q;
  q.prog[t]=isMax?Math.max(q.prog[t]||0,n):(q.prog[t]||0)+n;
  for(const e of q.list){
    if(e.t!==t||q.done[t])continue;
    if(q.prog[t]>=e.n){q.done[t]=true;mrGain(25);addGS(e.r);toast('Aufgabe geschafft: +'+e.r+' Gruftsteine');sfx('win');}
  }
  const w=save.wq;
  if(w.t===t&&!w.done){w.prog=isMax?Math.max(w.prog,n):w.prog+n;if(w.prog>=w.n){w.done=true;addGS(w.r);toast('Wochenaufgabe geschafft: +'+w.r+' Gruftsteine');sfx('win');}}
  persist();
}
/* Login-Bonus */
const LOGIN_R=[10,15,20,30,40,60,100];
function loginPending(){return save.login.claimed!==dayKey();}
const dayBeforeKey=()=>{const d=new Date();d.setDate(d.getDate()-2);return dayKey(d);};
function loginNext(){const l=save.login;if(l.last===yesterdayKey())return l.streak+1;if(l.claimed===dayKey())return l.streak;if(l.last===dayBeforeKey()&&(l.shield||0)>0&&l.streak>0)return l.streak+1;return 1;}
function openLogin(){
  const l=save.login,st=loginPending()?loginNext():l.streak;
  const cur=((st-1)%7)+1;
  $('#login-days').innerHTML=LOGIN_R.map((r,i)=>`<div class="ld${i+1===cur?' cur':''}${(i+1<cur||(i+1===cur&&!loginPending()))?' done':''}"><small>Tag ${i+1}</small>${spr('i_gs')}<b>${r}</b>${(i+1<cur||(i+1===cur&&!loginPending()))?'<i class="ck">✓</i>':''}</div>`).join('');
  $('#login-sub').textContent=loginPending()?`Tag ${cur} deiner Serie. Hol dir deine Belohnung.`:'Heute schon abgeholt. Komm morgen wieder.';
  $('#login-go').textContent=loginPending()?'Abholen: '+LOGIN_R[cur-1]+' Gruftsteine':'Schließen';
  openModal('m-login');
}
function claimLogin(){
  if(!loginPending()){closeModal('m-login');return;}
  const l=save.login,st=loginNext(),r=LOGIN_R[(st-1)%7];
  if(l.last!==yesterdayKey()&&st>1){l.shield=0;setTimeout(()=>toast('Schutztag verbraucht: deine Serie bleibt'),900);}
  if(st%7===0&&st>0){l.shield=1;setTimeout(()=>toast('Schutztag verdient: eine verpasste Serie bleibt erhalten'),1900);}
  l.streak=st;l.last=dayKey();l.claimed=dayKey();addGS(r);persist();sfx('win');
  closeModal('m-login');toast('Login-Bonus: +'+r+' Gruftsteine');updateStats();
}
/* Schmiede */
function openForge(){
  const box=$('#forge-list');box.innerHTML='';
  $('#forge-gs').textContent=fmt(save.gs||0);
  for(const m of META){
    const lv=metaLv(m.id),max=m.cost.length,cost=m.cost[lv];
    const b=document.createElement('button');b.className='card';
    const done=lv>=max,ok=!done&&(save.gs||0)>=cost;
    b.disabled=done||!ok;if(!ok)b.classList.add('off');
    b.innerHTML=`<div class="cmain"><b>${m.name}<span class="lvp">${Array.from({length:max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span></b><span>${m.desc}</span></div>${done?'<div class="price max">Maximal</div>':`<div class="price">${spr('i_gs')}<b>${cost}</b></div>`}`;
    b.addEventListener('click',()=>{if(done||(save.gs||0)<cost)return;save.gs-=cost;save.meta[m.id]=lv+1;persist();sfx('card');openForge();updateStats();});
    box.appendChild(b);
  }
  openModal('m-forge');
}
/* Aufgaben-Fenster */
function openQuests(){
  rollQuests();dailyRoll();
  const q=save.q,d=save.daily,r=ruleOf(),R=DAILY_RULES[r];
  const bar=(p,n)=>`<div class="qb"><i style="width:${Math.min(100,p/n*100)}%"></i></div>`;
  let h=`<h3>Tageslauf</h3><p><b style="color:var(--gold)">${R.name}</b>: ${R.desc}</p><p>Heute bester Lauf: <b>Etage ${d.best||0}</b>. Serie: <b>${d.streak||0}</b> ${d.last===dayKey()?'(heute geschafft)':'(erreiche Etage 10)'}.</p><button class="btn big" id="q-daily">Tageslauf starten</button><h3>Tagesaufgaben</h3>`;
  for(const e of q.list){const def=QPOOL.find(x=>x.t===e.t),p=q.prog[e.t]||0;h+=`<div class="qrow${q.done[e.t]?' ok':''}"><div><b>${def.txt(e.n)}</b><small>${Math.min(p,e.n)} / ${e.n}</small>${bar(p,e.n)}</div><em class="rw">${spr('i_gs')}+${e.r}</em></div>`;}
  {const [a,b2]=weekRules(),wk=(save.wk&&save.wk.key===weekKey())?save.wk:{best:0,got:{}};
   h+=`<h3>Wochenprüfung</h3><p>Diese Woche für alle gleich: <b style="color:var(--gold)">${DAILY_RULES[a].name}</b> und <b style="color:var(--gold)">${DAILY_RULES[b2].name}</b>. Bester Lauf: <b>Etage ${wk.best||0}</b>.</p><div class="vg-chips">${WEEK_REW.map(([d,g])=>`<button disabled class="${wk.got[d]?'on':''}">Etage ${d}: +${g}</button>`).join('')}</div><button class="btn big" id="q-week">Wochenprüfung starten</button>`;
   const tj=save.tj||{};
   h+=`<h3>Zeitjagd</h3><p>Jede Etage hat einen Timer. Läuft er ab, verlierst du ein Herz. Wer schnell ist, bekommt Punkte und mehr Gruftsteine (×1,25).</p><p>Bestzeiten: ${[10,25,50,100].map(d=>'Etage '+d+': <b>'+(tj[d]?fmtMs(tj[d]):'–')+'</b>').join(' · ')}</p><button class="btn big" id="q-time">Zeitjagd starten</button>`;
   const rushOk=save.won||(save.bestDepth||0)>=30;
   h+=`<h3>Boss-Rush</h3><p>Alle 20 Bosse hintereinander, nur 4 Leben, nach jedem Boss ein Herz und eine Verstärkung. Bestwert: <b>${(save.rush&&save.rush.best)||0} von 20</b>. Sieg: +1000 Gruftsteine.</p>${rushOk?'<button class="btn big gold" id="q-rush">Boss-Rush starten</button>':'<p><small>Wird bei Etage 30 freigeschaltet.</small></p>'}`;}
  const w=save.wq;const wd=WPOOL.find(x=>x.t===w.t);
  h+=`<h3>Wochenaufgabe</h3><div class="qrow${w.done?' ok':''}"><div><b>${wd?wd.txt:''}</b><small>${Math.min(w.prog,w.n)} / ${w.n}</small>${bar(w.prog,w.n)}</div><em class="rw">${spr('i_gs')}+${w.r}</em></div>`;
  h+=`<h3>Login-Bonus</h3><p>Serie: <b>${save.login.streak||0}</b> Tage.</p><button class="btn ghost" id="q-login">${loginPending()?'Belohnung abholen':'Belohnungen ansehen'}</button>`;
  $('#q-body').innerHTML=h;
  $('#q-daily').addEventListener('click',()=>{sfx('click');closeModal('m-quests');startGame(false,true);});
  $('#q-week').addEventListener('click',()=>{sfx('click');closeModal('m-quests');startGame(false,'week');});
  $('#q-time').addEventListener('click',()=>{sfx('click');closeModal('m-quests');openClass(()=>startTimed());});
  const qr=$('#q-rush');if(qr)qr.addEventListener('click',()=>{sfx('click');closeModal('m-quests');openClass(()=>startRush());});
  $('#q-login').addEventListener('click',()=>{sfx('click');closeModal('m-quests');openLogin();});
  openModal('m-quests');
}

