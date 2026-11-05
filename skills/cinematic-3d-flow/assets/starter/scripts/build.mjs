import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {validateSpec} from './validate-spec.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const spec=validateSpec(JSON.parse(fs.readFileSync(path.join(root,'scene-spec.json'),'utf8')));
let logo='';
if(spec.logoPath){const image=path.resolve(root,spec.logoPath);const ext=path.extname(image).toLowerCase();const mime={'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg'}[ext];if(!mime)throw new Error('Unsupported logo format');logo=`data:${mime};base64,${fs.readFileSync(image).toString('base64')}`;}
// Only runtime fields enter the artifact; evidence notes and local paths remain in the work project.
const runtime=Object.fromEntries(['title','duration','autoplay','pause','replay','transition','visual','palette'].map(k=>[k,spec[k]]));
runtime.nodes=spec.nodes.map(({id,label,position,shape})=>({id,label,position,shape}));
runtime.edges=spec.edges.map(({from,to,kind,start,duration})=>({from,to,kind,start,duration}));
runtime.shots=spec.shots.map(({name,preset,focus,weight,span,from,to,target})=>({name,preset,focus,weight,span,from,to,target}));
const result=await build({entryPoints:[path.join(root,'scene.js')],bundle:true,minify:true,write:false,format:'iife',target:'es2020',legalComments:'inline',define:{__SPEC__:JSON.stringify(runtime),__LOGO__:JSON.stringify(logo)}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallback=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360"><rect width="600" height="360" fill="${spec.palette.background}"/><text x="300" y="100" text-anchor="middle" fill="${spec.palette.ink}" font-size="28">${esc(spec.title)}</text>${spec.nodes.map((n,i)=>`<text x="300" y="${150+i*24}" text-anchor="middle" fill="${spec.palette.ink}" font-size="17">${esc(n.label)}</text>`).join('')}</svg>`;
const fallbackData='data:image/svg+xml;base64,'+Buffer.from(fallback).toString('base64');
const require=createRequire(import.meta.url);const license=fs.readFileSync(path.resolve(path.dirname(require.resolve('three')),'../LICENSE'),'utf8');
const replacements={TITLE:esc(spec.title),FALLBACK:fallbackData,SCRIPT:result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'),LICENSE:license.replace(/--/g,'—')};
const html=fs.readFileSync(path.join(root,'template.html'),'utf8').replace(/__([A-Z]+)__/g,(m,key)=>replacements[key]??m);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/scene.html'),html);console.log(`Built dist/scene.html (${Buffer.byteLength(html)} bytes), all dependencies embedded.`);
