/* apps-revision · moteur partagé V2.0.0 · aucune dépendance externe */
(function(global){
"use strict";
const VERSION="2.0.0";
const DAY=86400000;
const KEY="apps-revision:graffigny:v2";
function safeRead(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch(e){return null}}
function safeWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
function initial(){const old=safeRead("graffigny-progress")||{};return {version:2,items:{},history:[],legacyScores:old}}
function load(){const saved=safeRead(KEY);return saved&&saved.version===2&&saved.items? saved:initial()}
function save(data){safeWrite(KEY,data)}
function itemKey(level,type,item){return item.id||("graffigny-"+level+"-"+type+"-"+String(item.index||0))}
function record(prev,key,correct,now=Date.now()){
 const items={...prev.items},old=items[key]||{attempts:0,correct:0,streak:0,intervalDays:0};
 const streak=correct?(old.streak||0)+1:0;
 const intervalDays=correct?Math.min(30,streak===1?1:streak===2?3:streak===3?7:Math.round((old.intervalDays||7)*1.7)):0;
 // Les échecs sont remis à disposition après 15 minutes.
 const dueAt=now+(correct?intervalDays*DAY:15*60000);
 items[key]={attempts:old.attempts+1,correct:old.correct+(correct?1:0),streak,intervalDays,lastSeen:now,dueAt,lastCorrect:!!correct};
 const history=[...(prev.history||[]),{key,correct:!!correct,at:now}].slice(-500);
 const next={...prev,items,history};save(next);return next;
}
function stats(data,entries,now=Date.now()){
 const items=data.items||{};let seen=0,due=0,weak=0,mastered=0,total=0,sum=0;
 for(const entry of entries){total++;const s=items[entry.id];if(!s)continue;seen++;
 if(s.dueAt<=now)due++;if(!s.lastCorrect||s.streak<2)weak++;
 if(s.streak>=3)mastered++;
 sum+=Math.min(1,Math.max(0,(s.streak||0)/3));
 }
 return {total,seen,due,weak,mastered,mastery:seen?Math.round(100*sum/total):0};
}
function catalog(data){const rows=[];for(const lvl of [1,2,3])for(const type of ["flash","quiz","vf","cit"])(data[lvl]?.[type]||[]).forEach(item=>rows.push({...item,level:lvl,type,id:item.id}));return rows}
function daily(data,entries,limit=12,now=Date.now()){
 const items=data.items||{};
 const due=entries.filter(x=>items[x.id]&&items[x.id].dueAt<=now);
 const weak=entries.filter(x=>items[x.id]&&(!items[x.id].lastCorrect||items[x.id].streak<2)&&items[x.id].dueAt>now);
 const fresh=entries.filter(x=>!items[x.id]);
 const consolidated=entries.filter(x=>items[x.id]&&items[x.id].streak>=2&&items[x.id].dueAt>now);
 const mix=(arr)=>arr.sort((a,b)=>a.id.localeCompare(b.id));
 // Priorité aux révisions dues, puis nouvelles notions, puis consolidation.
 const selected=[],keys=new Set();
 function take(pool,n){for(const x of mix([...pool])){if(selected.length>=limit||n<=0)break;if(keys.has(x.id))continue;selected.push(x);keys.add(x.id);n--}}
 take(due,limit);take(weak,Math.max(0,Math.min(3,limit-selected.length)));take(fresh,Math.max(0,Math.min(4,limit-selected.length)));
 take(consolidated,limit-selected.length);take(fresh,limit-selected.length);
 return selected;
}
function levels(data,entries){const out={};for(const lvl of [1,2,3])out[lvl]=stats(data,entries.filter(x=>x.level===lvl));return out}
global.RevisionEngine={VERSION,KEY,load,save,record,stats,catalog,daily,levels,itemKey};
})(window);
