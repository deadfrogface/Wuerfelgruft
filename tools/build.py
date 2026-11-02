#!/usr/bin/env python3
"""Baut aus src/ die auslieferbare Datei index.html (Stile, Markup und Skripte werden in der Reihenfolge aus src/manifest.json zusammengefügt).
Aufruf: python3 tools/build.py          (schreibt index.html)
        python3 tools/build.py --check  (prüft, ob index.html zu src/ passt; für CI)"""
import json,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=os.path.join(root,'src')
man=json.load(open(os.path.join(src,'manifest.json'),encoding='utf-8'))
def read(kind,name):
    return open(os.path.join(src,kind,name),encoding='utf-8').read()
def build():
    out=[]
    for line in open(os.path.join(src,'template.html'),encoding='utf-8').read().split('\n')[:-1]:
        if line=='{{CSS}}':out.append(''.join(read('css',n) for n in man['css']))
        elif line=='{{JS}}':out.append(''.join(read('js',n) for n in man['js']))
        elif line.startswith('{{HTML:'):out.append(read('html',line[7:-2]))
        else:out.append(line+'\n')
    return ''.join(out)
if __name__=='__main__':
    html=build();target=os.path.join(root,'index.html')
    if '--check' in sys.argv:
        cur=open(target,encoding='utf-8').read() if os.path.exists(target) else ''
        if cur!=html:print('index.html passt nicht zu src/. Bitte `python3 tools/build.py` ausführen und das Ergebnis einchecken.');sys.exit(1)
        print('index.html ist aktuell.');sys.exit(0)
    open(target,'w',encoding='utf-8').write(html);print('index.html geschrieben (%d Zeichen)'%len(html))
