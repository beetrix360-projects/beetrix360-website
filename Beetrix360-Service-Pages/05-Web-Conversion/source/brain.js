import * as THREE from "three";
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,canvas=document.getElementById("brain");
if(canvas){let r=null;try{r=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:"high-performance"})}catch(e){document.documentElement.classList.add("nogl")}
if(r){let seed=20161;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
const P=new Uint8Array(512);{const a=[...Array(256).keys()];for(let i=255;i>0;i--){const j=R()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}for(let i=0;i<512;i++)P[i]=a[i&255]}
const G=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],fd=t=>t*t*t*(t*(t*6-15)+10),L=(a,b,t)=>a+(b-a)*t;
function N(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const g=(h,a,b,c)=>{const v=G[h%12];return v[0]*a+v[1]*b+v[2]*c},u=fd(x),v=fd(y),w=fd(z),A=P[X]+Y,B=P[X+1]+Y,AA=P[A&255]+Z,AB=P[(A+1)&255]+Z,BA=P[B&255]+Z,BB=P[(B+1)&255]+Z;return L(L(L(g(P[AA&511],x,y,z),g(P[BA&511],x-1,y,z),u),L(g(P[AB&511],x,y-1,z),g(P[BB&511],x-1,y-1,z),u),v),L(L(g(P[(AA+1)&511],x,y,z-1),g(P[(BA+1)&511],x-1,y,z-1),u),L(g(P[(AB+1)&511],x,y-1,z-1),g(P[(BB+1)&511],x-1,y-1,z-1),u),v),w)}
const gyr=(x,y,z)=>{const wx=N(x*1.6,y*1.6,z*1.6)*.42,wy=N(x*1.6+7,y*1.6,z*1.6)*.42,a=N((x+wx)*3.6+.4,(y+wy)*3.6,(z-wx)*3.6),b=N(x*7,y*7+3,z*7)*.28;return Math.pow(1-Math.min(1,Math.abs(a+b)*3.4),1.6)};
const COL=[[.98,.69,.18],[.98,.69,.18],[.87,.13,.34],[.23,.75,.98],[.17,.70,.51],[1,1,1],[.23,.75,.98]];
const W=innerWidth<760,COUNT=W?22000:64000,AMB=W?500:1100,T=COUNT+AMB,pos=new Float32Array(T*3),nor=new Float32Array(T*3),sc=new Float32Array(T*3),col=new Float32Array(T*3),dat=new Float32Array(T*4);
const put=(i,x,y,z,nx,ny,nz,c,size,g=1)=>{pos.set([x,y,z],i*3);nor.set([nx,ny,nz],i*3);const a=R()*6.283,d=1.8+R()*3.4;sc.set([Math.cos(a)*d*1.5,(R()-.5)*4.4,Math.sin(a)*d-.6],i*3);col.set(c,i*3);dat.set([size,R()*6.283,R(),g],i*4)};
let i=0,guard=0;while(i<COUNT&&guard++<COUNT*60){const u=R();
if(u<.045){const t=R(),a=R()*6.283,y=-.5-t*.56,rr=.17-.075*t;if(R()>.42)continue;put(i++,Math.cos(a)*rr,y,-.3-t*.2-t*t*.1+Math.sin(a)*rr,Math.cos(a),0,Math.sin(a),[.98,.69,.18],.6,.75);continue}
if(u<.17){const th=R()*6.283,ph=Math.acos(2*R()-1),dx=Math.sin(ph)*Math.cos(th),dy=Math.cos(ph),dz=Math.sin(ph)*Math.sin(th),f=Math.sin(dy*22+dz*6)*.5+.5;if(R()>.3+.7*f)continue;const k=1+.05*f;put(i++,dx*.5*k,-.47+dy*.25*k,-.68+dz*.34*k,dx,dy,dz,COL[R()<.7?1:2],.6,.35+.65*f);continue}
const th=R()*6.283,ph=Math.acos(2*R()-1);let dx=Math.sin(ph)*Math.cos(th),dy=Math.cos(ph),dz=Math.sin(ph)*Math.sin(th);
let x=dx*.86,y=dy*(dy>0?.78:.56),z=dz*1.06;const tl=Math.exp(-(((Math.abs(x)-.6)/.34)**2+((y+.34)/.26)**2+((z-.22)/.5)**2));x+=Math.sign(x)*tl*.12;y-=tl*.2;
const fis=Math.exp(-((x/.075)**2))*(y>-.25?1:.2);y-=fis*.2;x*=1+.0;const sulcus=Math.exp(-(((z-.1+y*.65)/.05)**2))*Math.exp(-(((Math.abs(x)-.75)/.2)**2));
const hx=Math.sign(x)||1,g=gyr(x+hx*.17,y,z),fold=.15*g-.075-sulcus*.1-fis*.05,k=1+fold,nx=dx,ny=dy,nz=dz;if(R()>.5+.5*g)continue;
const m=N(x*1.3+5,y*1.3,z*1.3)*.5+.5,n2=N(x*2.4,y*2.4+9,z*2.4)*.5+.5;let c=m>.62?COL[5]:m>.54?COL[3]:m<.36?COL[2]:n2>.6?COL[4]:n2<.4?COL[6]:COL[0];if(R()<.25)c=COL[0];
put(i++,x*k,y*k,z*k,nx,ny,nz,c,.72+g*.42,g)}
const end=i;for(;i<T;i++){const a=R()*6.283,d=1.3+R()*3.6;put(i,Math.cos(a)*d*1.6,(R()-.5)*4.2,Math.sin(a)*d-1,0,0,1,COL[[0,0,2,3,5,4][R()*6|0]],R()<.08?3.4:1+R()*.9);dat[i*4+3]=2;for(let k=0;k<3;k++)sc[i*3+k]=pos[i*3+k]}
const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("aN",new THREE.BufferAttribute(nor,3));geo.setAttribute("aS",new THREE.BufferAttribute(sc,3));geo.setAttribute("aC",new THREE.BufferAttribute(col,3));geo.setAttribute("aD",new THREE.BufferAttribute(dat,4));geo.setDrawRange(0,T);
const U={uT:{value:0},uS:{value:0},uA:{value:reduce?1:0},uPx:{value:Math.min(devicePixelRatio,2)},uM:{value:new THREE.Vector2(9,9)},uH:{value:1}};
const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`
attribute vec3 aN,aS,aC;attribute vec4 aD;uniform float uT,uS,uA,uPx,uH;uniform vec2 uM;varying vec3 vC;varying float vA,vR,vB;
void main(){float amb=step(1.5,aD.w),g=min(aD.w,1.),del=aD.z*.45;float s=smoothstep(del,del+.55,uS),a=smoothstep(del,del+.55,uA);
vec3 p=mix(aS,position,a);p=mix(p,aS,s);p+=vec3(sin(uT*.5+aD.y),cos(uT*.42+aD.y*1.3),sin(uT*.37+aD.y*.7))*(.012+(amb+s)*.05);
vec4 mv=modelViewMatrix*vec4(p,1.);vec3 n=normalize(normalMatrix*aN),v=normalize(-mv.xyz);float f=clamp(dot(n,v),0.,1.);
vec4 cp=projectionMatrix*mv;vec2 nd=cp.xy/cp.w;vec2 dm=(nd-uM)*vec2(uH,1.);float dist=length(dm),near=smoothstep(.34,.0,dist)*(1.-amb);mv.xy+=normalize(dm+.0001)*near*.09;gl_Position=projectionMatrix*mv;
float back=dot(n,v)<0.?.16:1.;float rim=pow(1.-f,1.8);vec3 c=mix(aC,vec3(.98,.69,.18),rim*.8*(1.-amb));c*=mix(1.,.34+.66*g,1.-amb);float wave=pow(.5+.5*sin(dot(position,vec3(.5,.7,.5))*5.-uT*1.5),10.)*(1.-amb);
c=mix(c,vec3(1.),near*.85+wave*.6);vC=c*(1.+wave*.8);float keep=mix(1.,step(aD.z,.13),s*(1.-amb));vA=mix(back*(.44+.38*f+rim*.34),.3+aD.z*.45,max(amb,s))*keep;vR=aD.y+uT*.12*(amb+s);vB=amb;
gl_PointSize=aD.x*uPx*(7.+s*5.+near*6.)*(6./-mv.z);}`,fragmentShader:`
varying vec3 vC;varying float vA,vR,vB;float tri(vec2 p){const float k=1.7320508;p.x=abs(p.x)-1.;p.y+=1./k;if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;p.x-=clamp(p.x,-2.,0.);return -length(p)*sign(p.y);}
void main(){vec2 q=gl_PointCoord*2.-1.;float c=cos(vR),s=sin(vR);q=mat2(c,-s,s,c)*q*2.1;float d=tri(q);float w=.26;float e=1.-smoothstep(w-.1,w+.1,abs(d));if(e<.02)discard;gl_FragColor=vec4(vC*e*vA,e*vA);}`});
const pts=new THREE.Points(geo,mat),grp=new THREE.Group(),scene=new THREE.Scene();pts.frustumCulled=false;grp.add(pts);scene.add(grp);const cam=new THREE.PerspectiveCamera(30,1,.1,60);cam.position.z=6;
let w0=0,h0=0;function size(){const c=document.getElementById("brain"),w=c.clientWidth||innerWidth,h=c.clientHeight||innerHeight;if(w===w0&&h===h0)return;w0=w;h0=h;r.setPixelRatio(U.uPx.value);r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();U.uH.value=w/h}addEventListener("resize",size);size();
const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};let pr=0,prS=0;const mo={x:9,y:9,tx:9,ty:9},look={x:0,y:0};
addEventListener("pointermove",e=>{const c=document.getElementById("brain").getBoundingClientRect();mo.tx=(e.clientX-c.left)/c.width*2-1;mo.ty=-((e.clientY-c.top)/c.height*2-1)},{passive:true});
function scrollP(){const s=document.querySelector("[data-story]");if(!s)return 0;const b=s.getBoundingClientRect(),h=s.offsetHeight-(s.firstElementChild?s.firstElementChild.offsetHeight:0);return h>0?Math.max(0,Math.min(1,-b.top/h)):0}

const clock=new THREE.Clock();function frame(){const dt=Math.min(clock.getDelta(),.05);window.__brainFrames=(window.__brainFrames||0)+1;size();pr=scrollP();prS+=(pr-prS)*(reduce?1:.09);const p=prS,m=w0<760;const box=document.getElementById("brain").getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight){if(!reduce)U.uT.value+=dt;U.uA.value=Math.min(1,U.uA.value+dt/1.9);const fr=ss(.16,.46,p);U.uS.value=ss(.58,.8,p);
if(!reduce){look.x+=((mo.tx===9?0:mo.tx)-look.x)*.04;look.y+=((mo.ty===9?0:mo.ty)-look.y)*.04}mo.x+=(mo.tx-mo.x)*.14;mo.y+=(mo.ty-mo.y)*.14;U.uM.value.set(mo.x,mo.y);
const sw=reduce?0:Math.sin(U.uT.value*.32)*.13,hx=m?0:Math.min(.98,.56*cam.aspect);grp.rotation.y=(1-fr)*(Math.PI/2+.1)+sw+look.x*.3;grp.rotation.x=.1-look.y*.14;grp.position.set(hx*(1-fr),(m?.86:.06)*(1-fr)+(m?.5:.2)*fr,0);grp.scale.setScalar((m?.56:1.02)*(1+fr*(m?.08:.1)));
r.render(scene,cam)}
const st=document.querySelector("[data-story]");if(st){const v=(a,b,c,d)=>ss(a,b,p)*(1-ss(c,d,p));st.style.setProperty("--b0",1-ss(.1,.26,p));st.style.setProperty("--y0",(-ss(.04,.3,p)*140).toFixed(1)+"px");st.style.setProperty("--b1",v(.3,.42,.54,.64));st.style.setProperty("--b2",v(.68,.8,1.2,1.3))}
requestAnimationFrame(frame)}window.__brainPoints=end;requestAnimationFrame(frame)}}
