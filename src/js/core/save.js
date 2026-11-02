/* src/js/core/save.js
   Spielstand (localStorage) laden und speichern. */
/* ================= Speicher ================= */
const SAVE_KEY='wuerfelgruft.v1';
let save={best:0,bestDepth:0,runs:0,kills:0,seenIntro:false,endless:false,diff:'normal',bd:{},dex:{},ach:{},stats:{bosses:0,throws:0,rolls:0,turns:0},gs:0,meta:{},daily:{day:'',best:0,done:false,streak:0,last:''},login:{last:'',streak:0,claimed:''},q:{day:'',list:[],prog:{},done:{}},wq:{week:'',t:'',n:0,r:0,prog:0,done:false},achPaid:false,settings:{lang:'',music:true,sfx:true,vib:true,shake:true,tips:true,rotcost:false,musicVol:100,sfxVol:100,bright:100,ts:100,rm:false,cb:false,num:false,lite:false,liteAuto:false}};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s)save={...save,...s,settings:{...save.settings,...(s.settings||{})}};}catch(e){}
