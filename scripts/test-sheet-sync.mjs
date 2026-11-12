import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../google-apps-script/RegistrationSync.gs',import.meta.url),'utf8');
const rows=[[]];let failWrite=false;let failAck=false;let acks=[];let jobs=[];
const sheet={
 getLastRow:()=>rows.length,getMaxRows:()=>1000,getFilter:()=>null,
 getRange:(row,col,height,width)=>({getValues:()=>rows.slice(row-1,row-1+height).map(r=>r.slice(col-1,col-1+width)),setNumberFormat(){return this;},setValues(values){if(failWrite)throw Error('write failed');rows[row-1]=values[0];return this;}})
};
const context=vm.createContext({SpreadsheetApp:{flush(){}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})}});
vm.runInContext(source,context);
context.registrationSyncSheet=()=>sheet;
context.registrationSyncRpc=(name,body)=>{
 if(name==='sheet_sync_batch')return jobs;
 if(failAck)throw Error('ack network failure');
 acks.push(body);
};
const cells=Array(27).fill('');cells[0]='id-1';cells[3]='=IMPORTXML("url")';cells[8]='+94771234567';
jobs=[{registration_id:'id-1',version:1,cells}];
context.syncRegistrations();assert.equal(rows.length,2);assert.equal(rows[1].length,28);assert.ok(rows[1][3].startsWith("'="));assert.ok(rows[1][8].startsWith("'+"));
context.syncRegistrations();assert.equal(rows.length,2);
failWrite=true;context.syncRegistrations();assert.ok(acks.at(-1).p_error);failWrite=false;
failAck=true;assert.throws(()=>context.syncRegistrations(),/ack network failure/);failAck=false;
context.syncRegistrations();assert.equal(rows.length,2);assert.equal(acks.at(-1).p_version,1);
console.log('PASS: worker upserts, formula escaping, failed writes and acknowledgement retries.');
