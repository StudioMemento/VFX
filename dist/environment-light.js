import {random,clamp} from './geometry.js';
import {surfaceTarget} from './ambient-surfaces.js';
import {CURSOR_FX,fieldRadius} from './cursor-field.js';

// A fixed UV topology follows the three actual environment surfaces. The
// pointer only reveals material; it cannot warp the mesh or the sparkle.
export class EnvironmentLight{
 constructor(){this.opacity=0;this.count=0;this.x=0;this.y=0;this.radius=260;this.nodes=[];this.triangles=[];this.scratch=[];}
 resize(w,h){
  this.w=w;this.h=h;this.nodes=[];this.triangles=[];
  const rng=random(6031),cols=clamp(Math.ceil(w/27),22,76);
  for(let kind=0;kind<3;kind++){
   const columns=kind===1?Math.ceil(cols*1.25):cols,rows=kind===0?18:kind===1?4:5,offset=this.nodes.length;
   for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
    const u=(i+(i>0&&i<columns?(rng()-.5)*.56:0))/columns;
    const v=kind===1&&i===columns?this.nodes[offset+j*(columns+1)].v:(j+(j>0&&j<rows?(rng()-.5)*.56:0))/rows;
    this.nodes.push({kind,u,v,x:0,y:0,z:0});
   }
   const at=(i,j)=>offset+j*(columns+1)+i;
   for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
    const a=at(i,j),b=at(i+1,j),c=at(i,j+1),d=at(i+1,j+1);
    for(const ids of rng()>.5?[[a,b,c],[b,d,c]]:[[a,b,d],[a,d,c]])this.triangles.push({ids,seed:rng()});
   }
  }
  this.vertices=new Float32Array(this.triangles.length*3*7);this.count=0;this.lastTime=null;
 }
 update(pointer,dt,time,immediate=false){
  const target=pointer.active?1:0;
  this.opacity=immediate?target:this.opacity+(target-this.opacity)*(1-Math.exp(-Math.max(0,dt)/(target>this.opacity?CURSOR_FX.attack:CURSOR_FX.release)));
  if(this.opacity<.001)this.opacity=0;
  if(pointer.active){this.x=pointer.x;this.y=pointer.y;this.radius=fieldRadius(this.w,pointer.type);}
  this.count=0;if(!this.opacity||!this.vertices)return;
  if(time!==this.lastTime){
   for(const n of this.nodes){surfaceTarget(n.kind,n.u,n.v,time,this.w,this.h,this.scratch);n.x=this.scratch[0];n.y=this.scratch[1];n.z=this.scratch[2];}
   this.lastTime=time;
  }
  const R=this.radius+4,v=this.vertices;
  for(const triangle of this.triangles){
   const a=this.nodes[triangle.ids[0]],b=this.nodes[triangle.ids[1]],c=this.nodes[triangle.ids[2]];
   const minX=Math.min(a.x,b.x,c.x),maxX=Math.max(a.x,b.x,c.x),minY=Math.min(a.y,b.y,c.y),maxY=Math.max(a.y,b.y,c.y);
   if(maxX<0||minX>this.w||maxY<0||minY>this.h||Math.hypot(Math.max(minX-this.x,0,this.x-maxX),Math.max(minY-this.y,0,this.y-maxY))>R)continue;
   const area=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
   if(area<.2)continue;
   const ha=area/Math.hypot(b.x-c.x,b.y-c.y),hb=area/Math.hypot(a.x-c.x,a.y-c.y),hc=area/Math.hypot(a.x-b.x,a.y-b.y);
   for(let i=0;i<3;i++){
    const n=i===0?a:i===1?b:c,o=this.count++*7;
    v[o]=n.x;v[o+1]=n.y;v[o+2]=n.z;v[o+3]=i===0?ha:0;v[o+4]=i===1?hb:0;v[o+5]=i===2?hc:0;v[o+6]=triangle.seed;
   }
  }
 }
 stats(){return {environmentMaterial:'local triangular surface reveal',environmentFxTriangles:this.count/3,environmentFxPresence:+this.opacity.toFixed(3)};}
 dispose(){this.nodes=[];this.triangles=[];this.vertices=null;this.count=0;}
}

export const ENVIRONMENT_VERTEX=`
precision highp float;
attribute vec3 a_position;attribute vec3 a_edge;attribute float a_seed;
uniform vec2 u_resolution;uniform vec4 u_camera;
varying vec3 v_edge;varying vec2 v_screen;varying float v_linearDepth;varying float v_seed;
void main(){
 float d=u_camera.x-a_position.z,n=u_camera.y,f=u_camera.z;
 // Multiply by clip W to obtain perspective-independent CSS-pixel distances.
 v_edge=a_edge*d;v_screen=a_position.xy*d;v_linearDepth=d;v_seed=a_seed;
 gl_Position=vec4((a_position.x/u_resolution.x*2.-1.)*d,(1.-a_position.y/u_resolution.y*2.)*d,((f+n)*d-2.*f*n)/(f-n),d);
}`;
export const ENVIRONMENT_FRAGMENT=`
precision highp float;
uniform vec4 u_pointer;uniform vec4 u_camera;uniform float u_depthPass;
varying vec3 v_edge;varying vec2 v_screen;varying float v_linearDepth;varying float v_seed;
void main(){
 vec2 screen=v_screen/v_linearDepth;float d=distance(screen,u_pointer.xy);
 float field=(1.-smoothstep(u_pointer.z*.15,u_pointer.z,d))*u_pointer.w;
 vec3 edges=v_edge/v_linearDepth;float edge=min(edges.x,min(edges.y,edges.z));
 float line=1.-smoothstep(.25,.95,edge),halo=1.-smoothstep(.5,3.2,edge);
 float face=step(.935,v_seed)*.065,depth=.60+.40*clamp((u_camera.x-v_linearDepth)/u_camera.x+.65,0.,1.);
 float alpha=field*depth*(line*.48+halo*.11+face);
 if(alpha<.003)discard;
 vec3 color=mix(vec3(.96,.31,.08),vec3(1.,.70,.36),line*.7+face);
 gl_FragColor=u_depthPass>.5?vec4(vec3(v_linearDepth/u_camera.z),1.):vec4(color*alpha,0.);
}`;
