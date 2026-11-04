import {clamp,random} from './geometry.js';

export const CURSOR_FX=Object.freeze({desktopRadius:260,touchRadius:130,attack:.09,release:.12,band:12,cell:15});
export function fieldRadius(width,type){return type==='touch'||width<600?CURSOR_FX.touchRadius:CURSOR_FX.desktopRadius;}
export function fieldStrength(distance,radius){const t=clamp((distance/radius-.15)/.85,0,1);return 1-t*t*(3-2*t);}

// Cached triangulation follows the real six-sided frame. No full-card grid.
export function frameMesh(polygon,cell=CURSOR_FX.cell,band=CURSOR_FX.band){
 const rng=random(4021),triangles=[];
 const add=points=>{triangles.push({points,cx:points.reduce((s,p)=>s+p[0],0)/3,cy:points.reduce((s,p)=>s+p[1],0)/3,fill:rng()>.965,vertex:rng()>.97});};
 for(let e=0;e<polygon.length;e++){
  const a=polygon[e],b=polygon[(e+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),tx=dx/length,ty=dy/length,nx=-ty,ny=tx;
  const count=Math.max(1,Math.ceil(length/cell)),step=length/count;
  let outer=[a[0],a[1]],inner=[a[0]+nx*band*.55,a[1]+ny*band*.55];
  for(let i=1;i<=count;i++){
   const distance=i===count?length:(i+(rng()-.5)*.45)*step;
   const next=[a[0]+tx*distance,a[1]+ty*distance],depth=band*(.45+rng()*.55);
   const inside=[next[0]+nx*depth-tx*step*(rng()-.5)*.65,next[1]+ny*depth-ty*step*(rng()-.5)*.65];
   add([outer,next,inner]);add([next,inside,inner]);outer=next;inner=inside;
  }
 }
 return triangles;
}

export class FrameLight{
 constructor(){this.opacity=0;this.mesh=[];this.x=0;this.y=0;this.radius=260;}
 resize(polygon,w){this.mesh=frameMesh(polygon, w<600?12:15,w<600?8:12);this.width=w;}
 update(pointer,dt,immediate=false){
  const target=pointer.active?1:0;
  this.opacity=immediate?target:this.opacity+(target-this.opacity)*(1-Math.exp(-dt/(target>this.opacity?CURSOR_FX.attack:CURSOR_FX.release)));
  if(this.opacity<.001)this.opacity=0;
  if(pointer.active){this.x=pointer.x;this.y=pointer.y;this.radius=fieldRadius(this.width,pointer.type);}
 }
 draw(ctx){
  if(!this.opacity)return;ctx.save();ctx.lineWidth=.55;ctx.lineJoin='round';
  for(const triangle of this.mesh){
   const strength=fieldStrength(Math.hypot(triangle.cx-this.x,triangle.cy-this.y),this.radius)*this.opacity;
   if(strength<.004)continue;
   ctx.beginPath();triangle.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();
   ctx.strokeStyle=`rgba(243,149,83,${strength*.56})`;ctx.stroke();
   if(triangle.fill){ctx.fillStyle=`rgba(255,153,76,${strength*.12})`;ctx.fill();}
   if(triangle.vertex&&strength>.35){ctx.fillStyle=`rgba(255,214,158,${strength*.9})`;ctx.shadowColor='#ff9952';ctx.shadowBlur=3;ctx.beginPath();ctx.arc(triangle.points[0][0],triangle.points[0][1],.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  }
  ctx.restore();
 }
}
