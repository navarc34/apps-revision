/* Smoke tests V2 : node tests/smoke.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const storage=new Map();
const ctx={window:{},localStorage:{
 getItem:key=>storage.get(key)||null,
 setItem:(key,value)=>storage.set(key,String(value)),
 removeItem:key=>storage.delete(key)
}};
vm.createContext(ctx);
for(const filename of ["shared/revision-engine.js","fr/graffigny/data.js"]){
 vm.runInContext(fs.readFileSync(filename,"utf8"),ctx,{filename});
}
const E=ctx.window.RevisionEngine;
const rows=E.catalog(ctx.window.REVISION_DATA);
assert.equal(rows.length,118);
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
for(const l of [1,2,3])for(const type of ["flash","quiz","vf","cit"]){
 const part=rows.filter(x=>x.level===l&&x.type===type);
 assert.ok(part.length,"module vide : "+l+"/"+type);
}
for(const x of rows){
 assert.ok(x.tags?.length,"tags manquants : "+x.id);
 if(x.type==="quiz"){assert.ok(Array.isArray(x.choices));assert.ok(x.correct>=0&&x.correct<x.choices.length);assert.ok(x.why)}
 if(x.type==="vf"){assert.equal(typeof x.v,"boolean");assert.ok(x.why)}
 if(x.type==="cit"){assert.ok(Array.isArray(x.reponse));assert.ok(x.consigne)}
}
const now=Date.UTC(2026,10,15,17);
let state=E.load();
assert.equal(E.stats(state,rows).mastery,0);
assert.equal(E.daily(state,rows).length,12);
state=E.record(state,rows[0].id,false,now);
assert.equal(state.items[rows[0].id].dueAt,now+15*60000);
state=E.record(state,rows[0].id,true,now+16*60000);
assert.equal(state.items[rows[0].id].streak,1);
assert.equal(state.items[rows[0].id].intervalDays,1);
assert.equal(E.load().items[rows[0].id].attempts,2);
console.log("OK — 118 items uniques, 12 modules, 4 formats, persistance et échéances.");
