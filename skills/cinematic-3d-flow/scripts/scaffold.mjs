#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const [output,config]=process.argv.slice(2);
if(!output){console.error('Usage: node scaffold.mjs <new-project-dir> [scene-spec.json]');process.exit(1);}
const dest=path.resolve(output);
if(fs.existsSync(dest)&&fs.readdirSync(dest).length)throw new Error('Choose a new or empty project directory.');
const source=fileURLToPath(new URL('../assets/starter/',import.meta.url));
fs.cpSync(source,dest,{recursive:true});
if(config)fs.copyFileSync(path.resolve(config),path.join(dest,'scene-spec.json'));
console.log(`Created ${dest}. Edit scene-spec.json, install dependencies, then run npm run build.`);
