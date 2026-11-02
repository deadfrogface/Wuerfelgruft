#!/usr/bin/env python3
"""Baut aus index.html eine Testversion (tools/.out/test.html), die Spielfunktionen als window.__wg freigibt."""
import os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out=os.path.join(root,'tools',os.environ.get('WG_OUT','.out'));os.makedirs(out,exist_ok=True)
import subprocess
subprocess.run([sys.executable,os.path.join(root,'tools','build.py')],check=True)  # index.html aus src/ frisch bauen
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
i=s.rindex("})();")
EXPORT='window.__wg={CLASSES,ACT,anyModal,altarCost,showUpgrades,get shopRef(){return shop;},shopItem,openShop,get G(){return G;},MT,UPS,newRun,startLevel,playerAct,waitTurn,useBomb,undoMove,NB,ND,SHELL,pathTo,reach1,bfs,completeLevel,afterCard,leaveShop,tapCell,spr,ensureSpr,noteState,markEx,heroId,cellAt,get view(){return view;},cellAt,renderShop,get shop(){return shop;},get save(){return save;},DF,DIFFS,kindOf,monAt,zoneOf,AMMO,lineN,reachOf,render,persist,throwAt,mkMon,tip,tipCheck,lookDir,act,monsterPhase,bfs8,enterOasis,leaveOasis,openOasisShop,openDex,openMini,miniRun,openDiff,pickup,evCount,activeEvent,EVENTS,EVSK,skinsOf,AU,ZMUS,MOT,PROGS,updateStats,openVegas,vgSettle,vgRender,get vgSt(){return vgSt;},openQuests,openForge,buildHelpZone,openShop,openDiff,openClass,openLogin,die,rollDice,tip,hintFor,genLevel,completeLevel,afterCard,leaveShop,get view(){return view;},applyTitleEvent,viewCoord,sqOf,sprayOf,openAltar,tpGo,renderHell,playOutro,playIntro,startFirstRun,isFresh,settle,openCamp,openCampPick,mrRank,mrGain,startTimed,tjFloorDone,openSouls,openLegend,landing,altarFight,goalTick,goalCheck,runeTouch};'
# Schneller Modus fuer den Balance-Bot: Wartezeiten werden zu einem Mikro-Warten
s=s.replace("const sleep=ms=>new Promise(r=>setTimeout(r,ms));","const sleep=ms=>window.__fast?new Promise(r=>setTimeout(r,0)):new Promise(r=>setTimeout(r,ms));",1)
i=s.rindex("})();")
s=s[:i]+EXPORT+"\n"+s[i:]
open(os.path.join(out,'test.html'),'w',encoding='utf-8').write(s)
print('ok',os.path.join(out,'test.html'))
