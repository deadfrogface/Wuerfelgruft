const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:420,height:860},hasTouch:true,isMobile:true});const pg=await ctx.newPage();const e=[];pg.on('pageerror',x=>e.push(x.message));
await pg.goto('file://'+require('path').join(__dirname,process.env.WG_OUT||'.out','test.html'));await pg.waitForTimeout(1200);
await pg.evaluate(()=>{const w=window.__wg;w.save.settings.tips=false;w.save.runs=5;w.save.bestDepth=12;w.save.won=true;document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'));w.updateStats();});
const c=await ctx.newCDPSession(pg);
async function sw(x0,y0,x1,y1,n=8){await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});for(let i=1;i<=n;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/n,y:y0+(y1-y0)*i/n}]});await pg.waitForTimeout(16);}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(650);return pg.evaluate(()=>[...document.querySelectorAll('.tp.cur')].map(t=>t.id)[0]);}
const R=[];
R.push(['rechts wischen->l',await sw(100,420,320,430)]);R.push(['zurueck links->c',await sw(320,420,100,430)]);
R.push(['links->r',await sw(320,420,100,430)]);R.push(['rueck rechts->c',await sw(100,420,320,430)]);
R.push(['hoch->d',await sw(200,650,200,300)]);R.push(['rueck runter->c',await sw(200,300,200,650)]);
R.push(['runter->u',await sw(200,300,200,650)]);R.push(['rueck hoch->c',await sw(200,650,200,300)]);
R.push(['kurz flick',await sw(300,500,250,500,2)]);
R.push(['rueck',await sw(200,500,320,500,2)]);
// Wischen aus dem Lager auf Hero/Slots
await pg.evaluate(()=>window.__wg.tpGo('l'));await pg.waitForTimeout(600);
R.push(['Lager zurueck (auf Slot)',await sw(200,300,60,300)]);
console.log(JSON.stringify(R),e);await b.close();
const want=['tp-l','tp-c','tp-r','tp-c','tp-d','tp-c','tp-u','tp-c','tp-r','tp-c','tp-c'];
if(JSON.stringify(R.map(r=>r[1]))!==JSON.stringify(want)||e.length){console.error('SWIPE-TEST FEHLGESCHLAGEN');process.exit(1);}console.log('Swipe ok');})();
