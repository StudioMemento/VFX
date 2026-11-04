import {clamp} from './geometry.js';
import {fieldRadius} from './cursor-field.js';

// Canvas measures real glyph ink once per layout; visible lettering stays vector.
export function measureLine(ctx,text,spacing=0,fontFor=null){
 let advance=0,min=Infinity,max=-Infinity,ascent=0,descent=0;const glyphs=[];
 for(const char of text){if(fontFor)ctx.font=fontFor(char);const m=ctx.measureText(char);glyphs.push({char,x:advance});
  if(char!==' '){min=Math.min(min,advance-m.actualBoundingBoxLeft);max=Math.max(max,advance+m.actualBoundingBoxRight);}
  ascent=Math.max(ascent,m.actualBoundingBoxAscent);descent=Math.max(descent,m.actualBoundingBoxDescent);advance+=m.width+spacing;
 }
 for(const g of glyphs)g.x-=min;
 return {glyphs,width:max-min,ascent,descent,left:min};
}

export function typeLayout(ctx,w,h){
 const pad=clamp(w*.056,24,108),available=w-pad*2,wide=w>=640&&w/h>=1.12;
 const labels=wide?['READY TO START?']:['READY TO','START?'],weight=400;
 ctx.font=weight+' 100px Inter';const reference=measureLine(ctx,labels[0],7.5);
 let font=available/reference.width*100,lines,tracking,height,gap;
 // Ink, rather than CSS line boxes, meets both the left and right padding.
 for(let attempt=0;attempt<5;attempt++){
  ctx.font=weight+' '+font+'px Inter';tracking=labels.map(()=>font*.075);
  lines=labels.map((text,i)=>measureLine(ctx,text,tracking[i]));
  for(let i=0;i<lines.length;i++){
   tracking[i]+=(available-lines[i].width)/(labels[i].length-1);
   lines[i]=measureLine(ctx,labels[i],tracking[i]);
  }
  gap=wide?0:font*.22;height=lines.reduce((sum,l)=>sum+l.ascent+l.descent,0)+gap;
  if(height<=h-pad*2||attempt===4)break;
  font*=Math.min(1,(h-pad*2-1)/height);
 }
 return {font,weight,tracking,labels,lines,wide,width:available,height,gap,x:pad,y:h-pad-height,pad,frameWidth:w};
}

// CSS 135 degrees: a true 45-degree axis in user space. The entire title,
// including both portrait lines, shares these endpoints instead of restarting.
export function diagonalGradient(width,height){
 const half=(width+height)/4,cx=width/2,cy=height/2;
 return {x1:cx-half,y1:cy-half,x2:cx+half,y2:cy+half};
}

// One local radial mask spans neighboring glyphs. No particle text, displacement,
// glyph warping, or full-frame postprocessing. It also remains active at rest.
export function typeHover(state,pointer,layout,dt,immediate=false){
 const radius=fieldRadius(layout.frameWidth||layout.width,pointer.type);
 const x=(pointer.x??state.x+layout.x)-layout.x,y=(pointer.y??state.y+layout.y)-layout.y;
 const dx=Math.max(0,-x,x-layout.width),dy=Math.max(0,-y,y-layout.height);
 const distance=Math.hypot(dx,dy),target=pointer.active&&distance<radius?1:0;
 // Input is already smoothed once by the scene. Type, frame and environment
 // share the same origin, including when the pointer is in the empty gutter.
 if(pointer.active){state.x=x;state.y=y;}
 const ease=immediate?1:1-Math.exp(-Math.max(dt,0)/(target>state.opacity?.09:.12));
 state.opacity+=(target-state.opacity)*ease;if(state.opacity<.001)state.opacity=0;
 state.radius=radius;return state;
}

// Irregular triangulation is created only at resize, in a bounded text strip.
// Geometry never changes on hover; only the radial reveal and its opacity move.
export function triangleMesh(width,height,font){
 let cell=clamp(font*.11,8,16),cols,rows;
 do{cols=Math.ceil(width/cell)+1;rows=Math.ceil(height/cell)+1;if(cols*rows*2<=1600)break;cell*=1.04;}while(true);
 const nodes=[],triangles=[];let seed=9127;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)nodes.push([x*cell+(rand()-.5)*cell*.48,y*cell+(rand()-.5)*cell*.48]);
 const at=(x,y)=>nodes[y*(cols+1)+x];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const a=at(x,y),b=at(x+1,y),c=at(x,y+1),d=at(x+1,y+1);
  const pair=(x+y)%2?[[a,b,c],[b,d,c]]:[[a,b,d],[a,d,c]];
  for(const points of pair){const light=rand();triangles.push({d:'M'+points.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')+'Z',opacity:light>.78?.56+rand()*.32:.06+rand()*.25,color:light>.94?'#fff0ca':light>.78?'#ff9a37':light>.40?'#d98536':'#fff1d2'});}
 }
 return triangles;
}

let typeSequence=0;
export class SolidType{
 constructor(element){
  this.element=element;this.ctx=document.createElement('canvas').getContext('2d');this.ready=false;
  this.light={x:0,y:0,radius:100,opacity:0};const id='memento-type-'+(++typeSequence);this.id=id;
  element.innerHTML=`<defs>
   <linearGradient id="${id}-base" gradientUnits="userSpaceOnUse" data-type-gradient>
    <stop offset="0" stop-color="#fffefa"/><stop offset=".34" stop-color="#f7ecdc"/><stop offset=".70" stop-color="#e5b67b"/><stop offset="1" stop-color="#c98445"/>
   </linearGradient>
   <radialGradient id="${id}-light" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="100">
    <stop offset="0" stop-color="white"/><stop offset=".15" stop-color="white"/><stop offset=".40" stop-color="white" stop-opacity=".79"/><stop offset=".65" stop-color="white" stop-opacity=".37"/><stop offset=".85" stop-color="white" stop-opacity=".08"/><stop offset="1" stop-color="white" stop-opacity="0"/>
   </radialGradient>
   <g id="${id}-glyphs" data-type-glyphs><text>READY TO</text><text>START?</text></g>
   <clipPath id="${id}-clip"><use href="#${id}-glyphs"/></clipPath>
   <mask id="${id}-mask" maskUnits="userSpaceOnUse"><rect data-light-mask fill="url(#${id}-light)"/></mask>
   <filter id="${id}-glow" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3.2"/></filter>
  </defs>
  <use class="memento-start__type-base" href="#${id}-glyphs" fill="url(#${id}-base)"/>
  <g class="memento-start__type-fx" mask="url(#${id}-mask)" opacity="0">
   <use href="#${id}-glyphs" fill="none" stroke="#ff913b" stroke-width="4.2" filter="url(#${id}-glow)"/>
   <use href="#${id}-glyphs" fill="#ffbe70" opacity=".20"/>
   <g clip-path="url(#${id}-clip)" data-type-facets stroke="#ffe5b9" stroke-width=".72" stroke-linejoin="round"></g>
   <use href="#${id}-glyphs" fill="none" stroke="#fff0ce" stroke-width=".95"/>
  </g>`;
  this.rows=[...element.querySelectorAll('[data-type-glyphs] text')];
  this.gradient=element.querySelector('[data-type-gradient]');this.radial=element.querySelector('radialGradient');this.clip=element.querySelector('clipPath');this.mask=element.querySelector('mask');this.maskRect=element.querySelector('[data-light-mask]');this.filter=element.querySelector('filter');this.fx=element.querySelector('.memento-start__type-fx');this.facets=element.querySelector('[data-type-facets]');
 }
 resize(w,h){
  const layout=typeLayout(this.ctx,w,h);Object.assign(this,layout);this.opticalWidths=layout.lines.map(l=>l.width);
  const el=this.element;el.style.fontSize=layout.font+'px';el.style.width=layout.width+'px';el.style.height=layout.height+'px';
  el.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);el.dataset.lines=String(layout.lines.length);
  for(const [key,value] of Object.entries(diagonalGradient(layout.width,layout.height)))this.gradient.setAttribute(key,value.toFixed(3));
  let y=0;
  for(let i=0;i<this.rows.length;i++){
   const row=this.rows[i],line=layout.lines[i];row.textContent=layout.labels[i]||'';row.style.display=line?'':'none';if(!line)continue;
   row.style.letterSpacing=layout.tracking[i]+'px';row.setAttribute('x',-line.left);row.setAttribute('y',y+line.ascent);
   y+=line.ascent+line.descent+layout.gap;
  }
  // A clipPath use cannot reference a group of text in every SVG engine.
  // Keep direct text geometry in the clip, with the exact same ink metrics.
  this.clip.innerHTML=this.rows.slice(0,layout.lines.length).map(row=>row.outerHTML).join('');
  const mesh=triangleMesh(layout.width,layout.height,layout.font);this.triangleCount=mesh.length;
  this.facets.innerHTML=mesh.map(t=>`<path d="${t.d}" fill="${t.color}" fill-opacity="${t.opacity.toFixed(3)}"/>`).join('');
  for(const node of [this.mask,this.maskRect]){node.setAttribute('x','-12');node.setAttribute('y','-12');node.setAttribute('width',layout.width+24);node.setAttribute('height',layout.height+24);}
  this.light.opacity=0;this.fx.setAttribute('opacity','0');this.ready=true;
 }
 update(pointer,dt,immediate=false){
  if(!this.ready)return;
  const before=this.light.opacity;typeHover(this.light,pointer,this,dt,immediate);
  if(!before&&!this.light.opacity)return;
  const {x,y,radius,opacity}=this.light;
  this.radial.setAttribute('cx',x.toFixed(1));this.radial.setAttribute('cy',y.toFixed(1));this.radial.setAttribute('r',radius.toFixed(1));
  // Limit the blur's intermediate texture to the actual hotspot, not the SVG.
  this.filter.setAttribute('x',(x-radius-6).toFixed(1));this.filter.setAttribute('y',(y-radius-6).toFixed(1));
  this.filter.setAttribute('width',(radius*2+12).toFixed(1));this.filter.setAttribute('height',(radius*2+12).toFixed(1));
  this.fx.setAttribute('opacity',opacity.toFixed(3));
 }
 stats(){return {textParticles:0,textMode:'vector / amber gradient / local triangle reveal',textWeights:[400],textLines:this.lines?.length,textInkWidths:this.opticalWidths?.map(n=>+n.toFixed(3)),typeGlow:+(this.light?.opacity||0).toFixed(3),typeTriangles:this.triangleCount||0};}
 dispose(){this.ready=false;this.ctx=null;}
}

