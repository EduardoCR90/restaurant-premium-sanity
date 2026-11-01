import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fingerprint, evidence } from '../scripts/deployment-evidence';
import { reportDeployment } from '../scripts/report-deployment.mjs';
const env={GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',GITHUB_SHA:'a'.repeat(40),ACTIONS_ID_TOKEN_REQUEST_URL:'https://vstoken.actions.githubusercontent.com/token',ACTIONS_ID_TOKEN_REQUEST_TOKEN:'private-test-only'};
const hashes=[fingerprint('project','production','dish','rev')];
const read=async()=>JSON.stringify({runId:'123',attempt:'1',sha:env.GITHUB_SHA,fingerprints:hashes});
test('evidencia incluye solo revisiones de la misma instantánea, sin documentos ni secretos',()=>{
 const value=evidence('project','production',{publicationRevisions:[{_id:'dish',_rev:'rev',name:'Private content'}]});
 assert.deepEqual(value,hashes);assert.ok(!JSON.stringify(value).includes('Private content'));
 assert.notEqual(fingerprint('project','staging','dish','rev'),hashes[0]);
 assert.throws(()=>evidence('project','production',{publicationRevisions:[{_id:'drafts.dish',_rev:'rev'}]}));
 assert.throws(()=>evidence('project','production',{}));
});
test('informa una ejecución concreta usando OIDC efímero, sin PAT ni nuevos dispatch',async()=>{
 const calls: {url:string;options:RequestInit}[]=[];
 await reportDeployment('succeeded',env,async(url: string|URL|Request,options?:RequestInit)=>{
  calls.push({url:String(url),options: options || {}});
  return calls.length===1?Response.json({value:'signed-ephemeral-test'}):Response.json({recorded:true});
 },read);
 assert.equal(calls.length,2);assert.ok(calls[0].url.includes('audience=restaurant-platform-publications'));
 assert.deepEqual(JSON.parse(calls[1].options.body as string),{action:'deployment_report',phase:'succeeded',fingerprints:hashes});
 assert.ok(!calls.some(c=>c.url.includes('/dispatches')));
});
test('rechaza evidencia de otra ejecución y no confirma sin revisiones',async()=>{
 const fail=async()=>{throw new Error('No network should happen');};
 await assert.rejects(reportDeployment('succeeded',env,fail,async()=>JSON.stringify({runId:'999',attempt:'1',sha:env.GITHUB_SHA,fingerprints:hashes})),/Evidencia/);
 await assert.rejects(reportDeployment('ready',env,fail,async()=>{throw Object.assign(new Error(),{code:'ENOENT'});}),/sin evidencia/);
});
test('errores de comunicación con GitHub o backend no se reintentan',async()=>{
 let calls=0;
 await assert.rejects(reportDeployment('building',env,async()=>{calls++;return new Response('',{status:503});},read),/GitHub identity communication/);
 assert.equal(calls,1);
 calls=0;
 await assert.rejects(reportDeployment('succeeded',env,async()=>{calls++;return calls===1?Response.json({value:'private-token'}):new Response('',{status:500});},read),/report rejected/);
 assert.equal(calls,2);
});
