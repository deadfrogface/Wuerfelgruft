/* src/js/render/pixel-engine.js
   Pixel-Engine: Zeichnen mit Dithering und Licht. */
/* ================= Pixel-Engine: Szenen als echtes Pixel-Art mit Dithering ================= */
const PX=(()=>{
  const cache={};
  const rgb=h=>Array.isArray(h)?h:(cache[h]||(cache[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]));
  const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]].map(r=>r.map(v=>(v+.5)/16));
  const hash=(a,b)=>{let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
  const mul=(c,f)=>{c=rgb(c);return [Math.max(0,Math.min(255,c[0]*f)),Math.max(0,Math.min(255,c[1]*f)),Math.max(0,Math.min(255,c[2]*f))];};
  const mix=(a,b,t)=>{a=rgb(a);b=rgb(b);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
  function Cv(w,h){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');const im=ctx.createImageData(w,h);const d=im.data;
    const o={w,h,c,d,
      p(x,y,col){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=w||y>=h||!col)return;const q=rgb(col),k=(y*w+x)*4;d[k]=q[0];d[k+1]=q[1];d[k+2]=q[2];d[k+3]=255;},
      has(x,y){return x>=0&&y>=0&&x<w&&y<h&&d[(y*w+x)*4+3]>0;},
      r(x,y,ww,hh,col){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)o.p(x+i,y+j,typeof col==='function'?col(x+i,y+j):col);},
      poly(pts,fn){
        const ys=pts.map(p=>p[1]);let y0=Math.max(0,Math.floor(Math.min(...ys))),y1=Math.min(h-1,Math.ceil(Math.max(...ys)));
        for(let y=y0;y<=y1;y++){const yy=y+.5,xs=[];
          for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
          xs.sort((p,q)=>p-q);
          for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++){const col=typeof fn==='function'?fn(x,y):fn;if(col)o.p(x,y,col);}}
      },
      ell(cx,cy,rx,ry,fn){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1){const col=typeof fn==='function'?fn(x,y,dx,dy):fn;if(col)o.p(x,y,col);}}},
      line(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){o.p(x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}},
      /* Kasten mit Licht oben/links und Schatten unten/rechts */
      box(x,y,ww,hh,base,hi,lo){o.r(x,y,ww,hh,base);if(hi){o.r(x,y,ww,1,hi);o.r(x,y,1,hh,hi);}if(lo){o.r(x,y+hh-1,ww,1,lo);o.r(x+ww-1,y,1,hh,lo);}},
      outline(col){const a=new Uint8Array(w*h);for(let i=0;i<w*h;i++)a[i]=d[i*4+3]?1:0;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!a[y*w+x]){if((x>0&&a[y*w+x-1])||(x<w-1&&a[y*w+x+1])||(y>0&&a[(y-1)*w+x])||(y<h-1&&a[(y+1)*w+x]))o.p(x,y,col);}},
      /* Licht: Stufen mit Dithering. lights=[{x,y,r,i,c:[r,g,b]}] */
      light(lights,base){
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(!d[k+3])continue;
          let L=base,tr=0,tg=0,tb=0;
          for(const l of lights){const dd=Math.hypot(x-l.x,(y-l.y)*(l.sq||1))/l.r;if(dd<1){const v=(1-dd)*(1-dd)*l.i;L+=v;tr+=l.c[0]*v;tg+=l.c[1]*v;tb+=l.c[2]*v;}}
          const q=L*4+B4[y&3][x&3]-.5,lv=Math.max(0,Math.min(6,Math.floor(q))),F=[.4,.55,.72,.9,1.04,1.16,1.28][lv];
          const tm=Math.min(.5,(tr+tg+tb)/765*(lv>=3?1:.4));
          d[k]=Math.min(255,d[k]*F+tr*.22*(lv>=3?1:.3));d[k+1]=Math.min(255,d[k+1]*F+tg*.22*(lv>=3?1:.3));d[k+2]=Math.min(255,d[k+2]*F+tb*.22*(lv>=3?1:.3));}
      },
      done(){ctx.putImageData(im,0,0);return c;}
    };
    return o;
  }
  const url=cv=>cv.done().toDataURL();
  return {Cv,rgb,B4,hash,mul,mix,url};
})();

