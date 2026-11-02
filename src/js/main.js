/* src/js/main.js
   Start: Spielstand prüfen und die Oberfläche aufbauen. */
if(!DIFFS[save.diff])save.diff='normal';
if(!save.achPaid){for(const id of Object.keys(save.ach))addGS(achGS(id));save.achPaid=true;persist();}
if(!save.bd)save.bd={};if(!save.dex)save.dex={};if(!save.ach)save.ach={};if(!save.stats)save.stats={bosses:0,throws:0,rolls:0,turns:0};
if(!save.meta)save.meta={};if(!save.daily)save.daily={day:'',best:0,done:false,streak:0,last:''};if(!save.login)save.login={last:'',streak:0,claimed:''};if(!save.q)save.q={day:'',list:[],prog:{},done:{}};if(!save.wq)save.wq={week:'',t:'',n:0,r:0,prog:0,done:false};
initSprites();fillStatic();initLang();setupLang();applySettings();buildGrid();buildNet();faceTextures();buildTitle();initTitleFx();buildDust();updateStats();syncSwitches();
setTimeout(()=>{try{if(!isFresh()&&loginPending()&&$('#scr-title').classList.contains('on'))openLogin();}catch(e){}},900);
window.__wg={get G(){return G;}};
