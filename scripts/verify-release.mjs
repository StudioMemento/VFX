import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
function walk(dir){return readdirSync(dir).flatMap(name=>{const path=resolve(dir,name);return statSync(path).isDirectory()?walk(path):[path];});}
const files=walk(root);let checked=0;
for(const path of files){
 if(!/\.(?:js|css|html)$/.test(path))continue;
 const source=readFileSync(path,'utf8');
 const refs=[...source.matchAll(/(?:from\s*|import\s*\(\s*|src=|href=|url\()\s*['"](\.\.?\/[^'"\s)]+)/g)].map(m=>m[1]);
 for(const ref of refs){const target=resolve(dirname(path),ref.split(/[?#]/)[0]);assert.ok(target.startsWith(root+'/'));assert.ok(existsSync(target),`${relative(root,path)} needs ${ref}`);checked++;}
 assert.ok(!/siwc_bypass|gh[pousr]_[A-Za-z0-9]{20}|sk-proj-|BEGIN PRIVATE KEY/.test(source),`secret-like data in ${path}`);
}
const config=JSON.parse(readFileSync('vercel.json'));assert.equal(config.framework,null);assert.equal(config.outputDirectory,'dist');assert.ok(existsSync('dist/index.html'));assert.ok(existsSync('dist/performance.js'));
assert.ok(!files.some(p=>/(?:^|\/)(?:node_modules|\.git|\.openai)(?:\/|$)/.test(p)));
console.log(`${files.length} runtime files, ${checked} local references verified; no runtime packages required.`);
console.log('RELEASE_VERIFIED');
