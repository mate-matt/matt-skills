import * as T from 'three';
const spec=__SPEC__,logo=__LOGO__;
const $=s=>document.querySelector(s),canvas=$('canvas'),fallback=$('#fallback'),playButton=$('#play');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true});}catch{document.body.classList.add('failed');}
if(renderer)start();
function start(){
 const duration=spec.duration,p=spec.palette;
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const scene=new T.Scene();scene.background=new T.Color(p.background);
 const camera=new T.OrthographicCamera(-10,10,7,-7,.1,150);
 scene.add(new T.HemisphereLight(0xffffff,0x879a85,1.7));
 const light=new T.DirectionalLight(0xfff5e5,3);light.position.set(-7,12,8);scene.add(light);
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.55,metalness:.14});
 const white=mat(p.surface),dark=mat(p.ink),accent=mat(p.accent);
 const add=(geo,material,parent=scene)=>{const m=new T.Mesh(geo,material);parent.add(m);return m;};
 const vector=a=>new T.Vector3(...a),clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 const mix=(a,b,u)=>a.clone().lerp(b,u),smooth=u=>u*u*(3-2*u);
 const text=(label,position,size=.4)=>{const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.font='500 72px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=p.ink;ctx.fillText(label,512,80);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const m=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:false,toneMapped:false}));m.scale.set(size*6.4,size,1);m.position.copy(position);scene.add(m);return m;};
 const cylinder=(r,h,m,parent)=>add(new T.CylinderGeometry(r,r,h,40),m,parent);
 const floor=add(new T.PlaneGeometry(100,100),new T.MeshBasicMaterial({color:p.background,toneMapped:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.3;
 const grid=new T.GridHelper(40,40,p.ink,p.ink);grid.position.y=-.29;grid.material.transparent=true;grid.material.opacity=.065;grid.material.depthWrite=false;scene.add(grid);
 function shadow(position,size){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(25,45,25,.25)');g.addColorStop(1,'rgba(25,45,25,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const plane=add(new T.PlaneGeometry(size,size),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));plane.rotation.x=-Math.PI/2;plane.position.copy(position);plane.position.y=-.28;}
 const byId=new Map(spec.nodes.map(n=>[n.id,n]));
 const coreNode=spec.nodes.find(n=>n.shape==='core'),origin=vector(coreNode.position),nodePositions=Object.fromEntries(spec.nodes.map(n=>[n.id,vector(n.position)]));
 const groups=new Map();
 for(const n of spec.nodes){const g=new T.Group();g.position.fromArray(n.position);scene.add(g);groups.set(n.id,g);const isCore=n.shape==='core';shadow(g.position,isCore?7:3.3);
  const base=spec.visual.layout==='pipeline'&&isCore?add(new T.BoxGeometry(3.5,.28,2.8),white,g):cylinder(isCore?2.1:1.05,.26,white,g);base.position.y=.1;
  const band=cylinder(isCore?2.12:1.07,.06,dark,g);band.position.y=-.02;
  if(isCore){const body=add(new T.SphereGeometry(1.05,36,24),white,g);body.position.y=1.58;const foot=cylinder(.70,.38,dark,g);foot.position.y=.54;const lid=cylinder(.52,.16,accent,g);lid.position.y=2.6;
   for(const y of [-.48,0,.48]){const r=Math.sqrt(1.055**2-y*y),pts=Array.from({length:65},(_,i)=>new T.Vector3(Math.cos(i/64*Math.PI*2)*r,y+1.58,Math.sin(i/64*Math.PI*2)*r));const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:p.ink}));g.add(line);}
   const rim=add(new T.TorusGeometry(.54,.06,8,48),accent,g);rim.position.set(0,1.53,1.10);const badge=add(new T.CircleGeometry(.51,48),dark,g);badge.position.set(0,1.53,1.115);
   if(logo){const img=new Image();img.onload=()=>{const map=new T.Texture(img);map.colorSpace=T.SRGBColorSpace;map.needsUpdate=true;const icon=add(new T.PlaneGeometry(.8,.8),new T.MeshBasicMaterial({map,transparent:true,toneMapped:false,side:T.DoubleSide}),g);icon.position.set(0,1.53,1.14);};img.src=logo;}
  }else if(n.shape==='disk'){for(let i=0;i<3;i++){const disk=cylinder(.58,.20,i===1?accent:white,g);disk.position.y=.47+i*.26;}}
  else{for(let i=0;i<3;i++){const box=add(new T.BoxGeometry(1.1,.22,.85),i===1?accent:white,g);box.position.y=.46+i*.26;}}
  text(n.label,g.position.clone().add(new T.Vector3(0,.42,isCore?1.7:1.28)),isCore?.48:.36);
  const row=document.createElement('div');row.className='node';row.textContent=n.label;$('#nodes').append(row);
 }
 const graph=[];
 for(const edge of spec.edges){const a=nodePositions[edge.from].clone().setY(.5),b=nodePositions[edge.to].clone().setY(.5),mid=mix(a,b,.5);mid.y+=.5;const curve=new T.QuadraticBezierCurve3(a,mid,b);let path=curve.getPoints(48);if(edge.kind==='contains'){const minX=Math.min(a.x,b.x)-1.3,maxX=Math.max(a.x,b.x)+1.3,minZ=Math.min(a.z,b.z)-1.3,maxZ=Math.max(a.z,b.z)+1.3;path=[[minX,minZ],[maxX,minZ],[maxX,maxZ],[minX,maxZ],[minX,minZ]].map(([x,z])=>new T.Vector3(x,.03,z));}const material=['contains','dependency'].includes(edge.kind)?new T.LineDashedMaterial({color:p.ink,transparent:true,opacity:.25,dashSize:.12,gapSize:.10}):new T.LineBasicMaterial({color:p.ink,transparent:true,opacity:.18});const line=new T.Line(new T.BufferGeometry().setFromPoints(path),material);line.computeLineDistances();scene.add(line);
  const particle=edge.kind==='flow'||edge.kind==='feedback'?add(new T.SphereGeometry(.1,10,8),new T.MeshBasicMaterial({color:p.accent,toneMapped:false})):null;
  graph.push({...edge,curve,particle});
 }
 // Reusable articulated geometry; no subject-specific assets or brand values.
 const targets=spec.nodes.filter(n=>n!==coreNode).slice(0,spec.visual.mechanicalArms?spec.visual.armCount:0),segments=14,total=targets.length*segments,armTips=[];
 const batches=[];
 const instance=(geo,m)=>{const obj=new T.InstancedMesh(geo,m,total);obj.instanceMatrix.setUsage(T.DynamicDrawUsage);obj.frustumCulled=false;scene.add(obj);batches.push(obj);return obj;};
 const sleeves=instance(new T.CylinderGeometry(.15,.18,1,10),white),bones=instance(new T.CylinderGeometry(.11,.11,1,8),dark),joints=instance(new T.SphereGeometry(.16,8,6),dark),cuffs=instance(new T.CylinderGeometry(.19,.19,.06,10),accent);
 const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
 function armState(t){armTips.length=0;let index=0;const angle=t/duration*Math.PI*2;
  for(let arm=0;arm<targets.length;arm++){const delta=nodePositions[targets[arm].id].clone().sub(origin),dist=Math.hypot(delta.x,delta.z),dir=new T.Vector3(delta.x,0,delta.z).normalize(),side=new T.Vector3(-dir.z,0,dir.x),phase=angle+arm*.8,reach=.76+.16*(.5+.5*Math.sin(phase)),curl=.6+.4*Math.cos(phase);
   const pos=(r,y,offset=0)=>origin.clone().addScaledVector(dir,r).addScaledVector(side,offset).add(new T.Vector3(0,y,0));
   const curve=new T.CatmullRomCurve3([pos(.9,1.2),pos(1.6,1.55),pos(dist*.5,2+.5*Math.sin(phase),Math.sin(phase)*.8),pos(dist*reach-.4,.7,curl),pos(dist*reach,.55,curl*.4),pos(dist*reach-.18,.7,-curl*.3)]);
   const points=curve.getPoints(segments);armTips.push(points.at(-1).toArray());
   for(let i=0;i<segments;i++,index++){const a=points[i],b=points[i+1],direction=b.clone().sub(a),len=direction.length();if(len<1e-7)continue;const quaternion=new T.Quaternion().setFromUnitVectors(up,direction.divideScalar(len));dummy.position.copy(a).lerp(b,.5);dummy.quaternion.copy(quaternion);dummy.scale.set(1,len,1);dummy.updateMatrix();bones.setMatrixAt(index,dummy.matrix);dummy.scale.y=len*.72;dummy.updateMatrix();sleeves.setMatrixAt(index,dummy.matrix);dummy.position.copy(a);dummy.scale.setScalar(1);dummy.quaternion.identity();dummy.updateMatrix();joints.setMatrixAt(index,dummy.matrix);dummy.position.copy(a).lerp(b,.2);dummy.quaternion.copy(quaternion);dummy.updateMatrix();cuffs.setMatrixAt(index,dummy.matrix);}
  }for(const batch of batches)batch.instanceMatrix.needsUpdate=true;
 }
 const sum=spec.shots.reduce((a,s)=>a+s.weight,0);let boundary=0;
 const shots=spec.shots.map(shot=>{const start=boundary;boundary+=shot.weight/sum*duration;return{...shot,start,end:boundary};});
 const focusOf=shot=>shot.target?vector(shot.target):shot.focus.reduce((p,id)=>p.add(nodePositions[id]),new T.Vector3()).divideScalar(shot.focus.length).add(new T.Vector3(0,.6,0));
 function pose(shot,u){let target=focusOf(shot),offset,span=shot.span;
  switch(shot.preset){
   case 'hero-dolly':offset=new T.Vector3(-8+4*u,6-1.2*u,15);span*=1-.15*u;break;
   case 'truck':offset=new T.Vector3(-8+16*u,10,19);break;
   case 'crane':offset=new T.Vector3(7,7+12*u,19-6*u);break;
   case 'cluster-cut':offset=new T.Vector3(12-4*u,10-2*u,10+2*u);break;
   case 'flow-follow':if(shot.focus.length>1)target=nodePositions[shot.focus[0]].clone().lerp(nodePositions[shot.focus[1]],u).add(new T.Vector3(0,.6,0));offset=new T.Vector3(7-3*u,11,17);break;
   case 'turntable':offset=new T.Vector3(Math.sin(u*Math.PI*2)*18,12,Math.cos(u*Math.PI*2)*18);break;
   case 'static':offset=new T.Vector3(0,15,23);break;
   default:offset=new T.Vector3(-8+12*u,14,23);
  }
  let position=target.clone().add(offset);if(shot.from)position=vector(shot.from).lerp(vector(shot.to??shot.from),u);else if(shot.to)position.lerp(vector(shot.to),u);
  return{position,target,span};
 }
 const anchors=shots.map(shot=>pose(shot,0));
 const continuousAnchors=spec.replay==='once'?[...anchors,pose(shots.at(-1),1)]:anchors;
 const positionTrack=anchors.length>1?new T.CatmullRomCurve3(continuousAnchors.map(a=>a.position),spec.replay==='loop','catmullrom',.3):null;
 const targetTrack=anchors.length>1?new T.CatmullRomCurve3(continuousAnchors.map(a=>a.target),spec.replay==='loop','catmullrom',.3):null;
 let shotIndex=0,viewSpan=7;
 function cameraState(t){const lookup=Math.min(t,duration-1e-8);shotIndex=shots.findIndex(s=>lookup<s.end);if(shotIndex<0)shotIndex=shots.length-1;const shot=shots[shotIndex],u=clamp((lookup-shot.start)/(shot.end-shot.start));let result;
  if(spec.transition==='continuous'&&anchors.length>1){const phase=(shotIndex+u)/anchors.length,next=spec.replay==='once'?shotIndex+1:(shotIndex+1)%anchors.length;result={position:positionTrack.getPoint(phase),target:targetTrack.getPoint(phase),span:continuousAnchors[shotIndex].span+(continuousAnchors[next].span-continuousAnchors[shotIndex].span)*smooth(u)};}else result=pose(shot,smooth(u));
  camera.position.copy(result.position);camera.lookAt(result.target);const aspect=innerWidth/innerHeight;viewSpan=Math.max(result.span,(shotIndex===0?7.5:4.5)/aspect);camera.left=-viewSpan*aspect;camera.right=viewSpan*aspect;camera.top=viewSpan;camera.bottom=-viewSpan;camera.updateProjectionMatrix();$('#shot').textContent=`${String(shotIndex+1).padStart(2,'0')} / ${shot.name}`;
 }
 let elapsed=0,playing=spec.autoplay&&!preference.matches,lastNow=null,raf=0,hiddenResume=false,hiddenAt=0,renderTime=0;
 function renderAt(raw){const t=spec.replay==='loop'?((raw%duration)+duration)%duration:clamp(raw,0,duration);renderTime=t;cameraState(t);armState(t);for(const edge of graph){if(!edge.particle)continue;const u=(t-edge.start)/edge.duration;edge.particle.visible=u>=0&&u<=1;if(edge.particle.visible)edge.particle.position.copy(edge.curve.getPoint(clamp(u)));}$('#clock').textContent=`${t.toFixed(2)} / ${duration} s`;renderer.render(scene,camera);}
 function ui(){playButton.textContent=playing?'Pause':elapsed>=duration&&spec.replay==='once'?'Replay':'Play';playButton.setAttribute('aria-pressed',String(!playing));}
 function pause(){hiddenResume=false;playing=false;lastNow=null;cancelAnimationFrame(raf);raf=0;ui();}
 function play(){if(spec.replay==='once'&&elapsed>=duration)elapsed=0;playing=true;lastNow=null;ui();schedule();}
 function schedule(){if(!raf&&!document.hidden&&playing)raf=requestAnimationFrame(frame);}
 function frame(now){raf=0;if(!playing||document.hidden){lastNow=null;return;}if(lastNow!==null)elapsed+=(now-lastNow)/1000;lastNow=now;if(spec.replay==='once'&&elapsed>=duration){elapsed=duration;renderAt(elapsed);pause();return;}renderAt(elapsed);schedule();}
 function seek(t){if(!Number.isFinite(t))throw new Error('seek requires finite seconds');pause();elapsed=Math.max(0,t);renderAt(elapsed);ui();}
 function resize(){renderer.setSize(innerWidth,innerHeight);renderAt(elapsed);}
 playButton.hidden=!spec.pause.button;playButton.addEventListener('click',()=>playing?pause():play());
 window.addEventListener('keydown',event=>{if(!spec.pause.keyboard||event.code!=='Space'||event.repeat)return;if(event.target?.closest('button,input,textarea,select,[contenteditable]'))return;event.preventDefault();playing?pause():play();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){const wasPlaying=playing;hiddenAt=performance.now();if(spec.pause.onHidden)pause();else{cancelAnimationFrame(raf);raf=0;lastNow=null;}hiddenResume=wasPlaying;}else{const resume=hiddenResume;hiddenResume=false;if(!spec.pause.onHidden&&resume&&playing)elapsed+=(performance.now()-hiddenAt)/1000;if(spec.pause.onHidden&&resume)play();else{renderAt(elapsed);schedule();}}});
 preference.addEventListener('change',()=>{if(preference.matches)seek(0);});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();pause();document.body.classList.add('failed');fallback.hidden=false;});
 window.addEventListener('resize',resize);
 const api={seek,play,pause,state:()=>({time:renderTime,elapsed,playing,visible:!document.hidden,reducedMotion:preference.matches,shotIndex,camera:camera.position.toArray(),target:camera.getWorldDirection(new T.Vector3()).toArray(),span:viewSpan,armTips:armTips.map(a=>[...a]),graph:spec.edges.map(({from,to,kind})=>({from,to,kind})),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,duration,replay:spec.replay})};
 window.__scene=api;
 document.documentElement.style.setProperty('--accent',p.accent);if(!spec.visual.console)document.body.classList.add('minimal');
 resize();fallback.hidden=true;ui();schedule();
}
