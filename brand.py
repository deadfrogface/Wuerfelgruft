#!/usr/bin/env python3
"""Erzeugt App-Icon und Splash fuer Wuerfelgruft und schreibt sie in die Android-Ressourcen.
Aufruf: python3 tools/brand.py <android-res-ordner>   |   python3 tools/brand.py --preview <ordner>"""
import sys,os,glob
from PIL import Image,ImageDraw
PAL={"k": "#17152b", "W": "#f4efe0", "b": "#e9dfc8", "B": "#c9ba98", "s": "#6f6993", "S": "#4a4566", "d": "#2c2847", "t": "#3fd0b0", "T": "#2a9a82", "u": "#8ff5da", "r": "#e8553d", "R": "#a93a28", "o": "#ff8a5c", "y": "#f4b942", "Y": "#b47a14", "z": "#ffe27a", "m": "#8bd450", "M": "#5aa02c", "l": "#c5f285", "v": "#cdbfff", "V": "#8a72e0", "p": "#ff5d73", "P": "#b8334a", "n": "#5aa0e8", "N": "#3f6fb5", "a": "#dfe6f2", "A": "#8b93ad", "h": "#c98a4b", "H": "#312b58", "e": "#8a5fa8", "E": "#5d3d78", "g": "#2a2547", "F": "#3d3768", "G": "#4b4580", "I": "#474177"}
HERO=["................", "................", "....kkkkkkk.....", "...kttuuuuttk...", "..kttuutttttTk..", "..ktkkkkkkkkTk..", "..ktkykkkykkTk.a", "..ktkkkkkkkkTkak", "..kttkkkkkkTTkak", "..kttttttttTTkyk", ".kttTtttttttTTkh", ".kttTttttttTTTkk", ".kttTtttttttTTk.", ".kTTTTTTTTTTTTk.", "..kkkTTkkTTkkk..", "...kk.kk.kk.k..."]
INK=(23,21,43)
def rgb(h):return tuple(int(h[i:i+2],16) for i in (1,3,5))
def art_sprite(rows):
    im=Image.new('RGBA',(16,16),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            c=PAL.get(ch)
            if c:im.putpixel((x,y),rgb(c)+(255,))
    return im
def cube_art():
    """64x64 Pixelart: isometrischer Wuerfel mit Held, transparent."""
    W=64
    im=Image.new('RGBA',(W,W),(0,0,0,0));d=ImageDraw.Draw(im)
    top=[(32,14),(52,24),(32,34),(12,24)]
    left=[(12,24),(32,34),(32,56),(12,46)]
    right=[(32,34),(52,24),(52,46),(32,56)]
    d.polygon(left,fill=rgb(PAL['S']))
    d.polygon(right,fill=rgb(PAL['d']))
    d.polygon(top,fill=rgb(PAL['b']))
    def lerp(a,b,t):return (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
    # Raster auf den Flaechen
    def grid(poly,col,n=5):
        p0,p1,p2,p3=poly
        for k in range(1,n):
            t=k/n
            a=lerp(p0,p1,t);b=lerp(p3,p2,t);d.line([a,b],fill=col)
            a=lerp(p0,p3,t);b=lerp(p1,p2,t);d.line([a,b],fill=col)
    grid(top,rgb(PAL['B']));grid(left,rgb(PAL['d']));grid(right,rgb(PAL['k']))
    # Kontur
    for poly in (top,left,right):
        d.polygon(poly,outline=rgb(PAL['k']))
    # Held auf der Oberseite
    h=art_sprite(HERO)
    im.alpha_composite(h,(24,6))
    # Glitzer
    for (x,y) in [(8,10),(56,12),(50,6),(6,34)]:
        im.putpixel((x,y),rgb(PAL['z']));im.putpixel((x+1,y),rgb(PAL['z']));im.putpixel((x,y+1),rgb(PAL['z']))
    return im
def icon_full(size):
    """Voller Hintergrund + Wuerfel (Legacy-Icon)."""
    bg=Image.new('RGBA',(64,64),INK+(255,))
    d=ImageDraw.Draw(bg)
    for r,c in ((30,(34,31,61)),(22,(43,38,80))):
        d.ellipse((32-r,32-r,32+r,32+r),fill=c)
    bg.alpha_composite(cube_art())
    return bg.resize((size,size),Image.NEAREST if size>=64 else Image.BOX)
def icon_fg(size):
    """Adaptives Vordergrundbild: Wuerfel auf 66% Sicherheitszone."""
    a=cube_art().resize((int(size*0.66),)*2,Image.NEAREST)
    fg=Image.new('RGBA',(size,size),(0,0,0,0))
    o=(size-a.width)//2
    fg.alpha_composite(a,(o,o))
    return fg
def circle(im):
    s=im.width;m=Image.new('L',(s,s),0);ImageDraw.Draw(m).ellipse((0,0,s-1,s-1),fill=255)
    out=Image.new('RGBA',(s,s),(0,0,0,0));out.paste(im,(0,0),m);return out
def splash(w,h):
    im=Image.new('RGBA',(w,h),INK+(255,))
    s=int(min(w,h)*0.42)
    a=cube_art().resize((s,s),Image.NEAREST)
    im.alpha_composite(a,((w-s)//2,(h-s)//2))
    return im.convert('RGB')
def main():
    if sys.argv[1]=='--preview':
        out=sys.argv[2];os.makedirs(out,exist_ok=True)
        icon_full(512).save(out+'/icon.png');circle(icon_full(512)).save(out+'/round.png')
        sp=Image.new('RGBA',(512,512),(120,120,160,255));sp.alpha_composite(icon_fg(512));sp.save(out+'/fg.png')
        splash(360,640).save(out+'/splash.png');return
    res=sys.argv[1];n=0
    for p in glob.glob(res+'/**/*.png',recursive=True):
        name=os.path.basename(p)
        w,h=Image.open(p).size
        if name=='ic_launcher.png':icon_full(w).convert('RGBA').save(p);n+=1
        elif name=='ic_launcher_round.png':circle(icon_full(w)).save(p);n+=1
        elif name=='ic_launcher_foreground.png':icon_fg(w).save(p);n+=1
        elif name=='splash.png':splash(w,h).save(p);n+=1
    bgx=res+'/values/ic_launcher_background.xml'
    open(bgx,'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#17152B</color>\n</resources>\n')
    print('Bilder ersetzt:',n)
main()
