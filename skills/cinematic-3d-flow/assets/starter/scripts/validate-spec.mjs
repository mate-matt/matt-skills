export function validateSpec(s){
 const fail=m=>{throw new Error(`scene-spec: ${m}`);};
 if(!s||typeof s.title!=='string'||!s.title.trim())fail('title required');
 if(!Number.isFinite(s.duration)||s.duration<=0)fail('duration must be positive seconds');
 if(!['loop','once'].includes(s.replay))fail('replay must be loop or once');
 if(!['cut','continuous'].includes(s.transition))fail('transition must be cut or continuous');
 if(typeof s.autoplay!=='boolean')fail('autoplay must be boolean');
 for(const key of ['keyboard','button','onHidden'])if(typeof s.pause?.[key]!=='boolean')fail(`pause.${key} must be boolean`);
 for(const key of ['background','surface','ink','accent'])if(!/^#[a-f\d]{6}$/i.test(s.palette?.[key]))fail(`palette.${key} must be a hex color`);
 if(!Array.isArray(s.nodes)||s.nodes.length<2)fail('at least 2 nodes required');
 const ids=new Set();for(const n of s.nodes){if(typeof n.id!=='string'||!n.id||ids.has(n.id))fail('node IDs must be unique nonempty strings');ids.add(n.id);if(typeof n.label!=='string'||!n.label.trim())fail(`label missing: ${n.id}`);if(!Array.isArray(n.position)||n.position.length!==3||!n.position.every(Number.isFinite))fail(`invalid position: ${n.id}`);if(!['core','stack','disk'].includes(n.shape))fail(`unsupported shape: ${n.shape}`);}
 if(s.nodes.filter(n=>n.shape==='core').length!==1)fail('starter needs exactly one core; adapt engine for other topology');
 if(!['radial','pipeline','layered'].includes(s.visual?.layout))fail('unsupported layout');
 if(!Number.isInteger(s.visual.armCount)||s.visual.armCount<0||s.visual.armCount>s.nodes.length-1)fail('armCount exceeds non-core targets');
 if(!Array.isArray(s.edges))fail('edges must be an array');
 for(const e of s.edges){if(!ids.has(e.from)||!ids.has(e.to)||e.from===e.to)fail('invalid edge endpoints');if(!['flow','feedback','dependency','contains'].includes(e.kind))fail('invalid edge kind');if(!Number.isFinite(e.start)||e.start<0||!Number.isFinite(e.duration)||e.duration<=0||e.start+e.duration>s.duration+1e-8)fail('edge timing outside cycle');}
 const presets=['overview-orbit','hero-dolly','truck','crane','cluster-cut','flow-follow','turntable','static'];
 if(!Array.isArray(s.shots)||!s.shots.length)fail('shots required');
 for(const shot of s.shots){if(!presets.includes(shot.preset))fail('unsupported camera preset');if(typeof shot.name!=='string'||!shot.name)fail('shot name required');if(!Array.isArray(shot.focus)||!shot.focus.length||shot.focus.some(id=>!ids.has(id)))fail('invalid shot focus');if(!Number.isFinite(shot.weight)||shot.weight<=0||!Number.isFinite(shot.span)||shot.span<=0)fail('shot weight/span must be positive');for(const key of ['from','to','target'])if(shot[key]!==undefined&&(!Array.isArray(shot[key])||shot[key].length!==3||!shot[key].every(Number.isFinite)))fail(`invalid shot ${key}`);}
 if(s.logoPath&&(/^[a-z]+:/i.test(s.logoPath)||s.logoPath.startsWith('//')))fail('logo must be a local file');
 return s;
}
