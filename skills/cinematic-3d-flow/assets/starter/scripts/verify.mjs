import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root=fileURLToPath(new URL('../',import.meta.url)),spec=JSON.parse(fs.readFileSync(path.join(root,'scene-spec.json'),'utf8'));
const args=process.env.SCENE_SOFTWARE_GL==='1'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:[];
const browser=await chromium.launch({headless:true,args});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await page.goto(pathToFileURL(path.join(root,'dist/scene.html')).href);await page.waitForFunction(()=>window.__scene?.state().drawCalls>0);
 const seek=async t=>{await page.evaluate(t=>window.__scene.seek(t),t);return page.evaluate(()=>window.__scene.state());};
 const first=await seek(0);assert(first.drawCalls>0);const firstImage=await page.screenshot();
 if(spec.replay==='loop'){await seek(spec.duration);assert(firstImage.equals(await page.screenshot()),'Exact loop endpoint changed');}
 let sum=spec.shots.reduce((n,s)=>n+s.weight,0),t=0;const poses=[];fs.mkdirSync(path.join(root,'qa'),{recursive:true});
 for(let i=0;i<spec.shots.length;i++){const len=spec.duration*spec.shots[i].weight/sum,state=await seek(t+len*.5);assert.equal(state.shotIndex,i);poses.push(state);await page.screenshot({path:path.join(root,`qa/shot-${i+1}.png`)});t+=len;}
 if(spec.transition==='cut'&&poses.length>1)assert(poses.some((p,i)=>i&&Math.hypot(...p.camera.map((v,j)=>v-poses[i-1].camera[j]))>1),'No meaningful camera change');
 const a=await seek(spec.duration*.10),b=await seek(spec.duration*.35);
 if(spec.visual.mechanicalArms&&spec.visual.armCount){assert.equal(a.armTips.length,spec.visual.armCount);assert(b.armTips.some((tip,i)=>Math.hypot(...tip.map((v,j)=>v-a.armTips[i][j]))>.15),'Articulated arms do not move');}
 await page.evaluate(()=>window.__scene.pause());const paused=await page.evaluate(()=>window.__scene.state());await page.waitForTimeout(160);const pausedLater=await page.evaluate(()=>window.__scene.state());assert.deepEqual(pausedLater,paused,'Pause did not freeze all observed state');
 await page.evaluate(()=>window.__scene.play());await page.waitForTimeout(220);assert((await page.evaluate(()=>window.__scene.state())).elapsed>paused.elapsed,'Resume did not advance');
 await page.evaluate(()=>window.__scene.pause());if(spec.pause.button){await page.getByRole('button',{name:'Play',exact:true}).click();assert(await page.evaluate(()=>window.__scene.state().playing));await page.getByRole('button',{name:'Pause',exact:true}).click();assert(!(await page.evaluate(()=>window.__scene.state().playing)));}
 if(spec.pause.keyboard){await page.locator('canvas').click({position:{x:10,y:80}});await page.keyboard.press('Space');assert(await page.evaluate(()=>window.__scene.state().playing));await page.keyboard.press('Space');assert(!(await page.evaluate(()=>window.__scene.state().playing)));}
 await page.evaluate(()=>{window.__scene.pause();window.__qaHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__qaHidden});document.dispatchEvent(new Event('visibilitychange'));window.__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});assert(!(await page.evaluate(()=>window.__scene.state().playing)),'Visibility restore cancelled manual pause');
 await page.evaluate(()=>{window.__scene.play();window.__qaHidden=true;document.dispatchEvent(new Event('visibilitychange'));});if(spec.pause.onHidden)assert(!(await page.evaluate(()=>window.__scene.state().playing)));await page.waitForTimeout(100);await page.evaluate(()=>{window.__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;delete window.__qaHidden;});assert(await page.evaluate(()=>window.__scene.state().playing),'Visibility resume failed');await page.evaluate(()=>window.__scene.pause());
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.__scene.state().reducedMotion&&!window.__scene.state().playing);
 if(spec.replay==='once'){const end=await seek(spec.duration);assert.equal(end.shotIndex,spec.shots.length-1);assert.equal(end.time,spec.duration);}
 if(spec.transition==='continuous'&&spec.replay==='loop'){const before=await seek(spec.duration-1e-5),after=await seek(0);assert(Math.hypot(...before.camera.map((v,j)=>v-after.camera[j]))<.01,'Continuous camera has a wrap jump');}
 for(const [w,h] of [[375,812],[1024,768],[1920,1080]]){await page.setViewportSize({width:w,height:h});await seek(0);assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Page overflow');}
 assert.equal(errors.length,0,errors.join('\n'));assert.equal(network.length,0,'Artifact requested network assets');
 console.log('PASS: standalone HTML, no network/errors, camera shots, arm motion, pause/resume, reduced motion and responsive layout. Inspect qa/ for composition.');
}finally{await browser.close();}
