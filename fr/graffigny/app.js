/* Graffigny · interface V2.0.0 · sans saisie libre */
(function(){
"use strict";
const h=React.createElement;
const {useState,useMemo,useEffect}=React;
const {T,ACCENTS,NIVEAUX,Card,Eyebrow,Button,Ring,Flashcards,Quiz,VraiFaux,Citations}=window.RevisionUI;
const E=window.RevisionEngine;
const entries=E.catalog(window.REVISION_DATA);
const MODULES=[["flash","🃏","Flashcards"],["quiz","🎯","Quiz"],["vf","⚖️","Vrai / Faux"],["cit","📜","Citations"]];
const THEMES=[...new Set(entries.flatMap(e=>e.tags||[]))].sort((a,b)=>a.localeCompare(b,"fr"));
function CurrentExercise({item,onAnswer}){
 const [choice,setChoice]=useState(null);
 const [revealed,setRevealed]=useState(false);
 const answer=ok=>{if(choice!==null)return;setChoice(ok);onAnswer(ok)};
 if(item.type==="flash"||item.type==="cit"){
   return h("div",{className:"v2-question"},
     h("div",{className:"v2-question-label"},item.type==="flash"?"FLASHCARD":item.source||"CITATION"),
     h("p",{className:"v2-question-text"},item.type==="flash"?item.q:item.texte),
     item.type==="cit"?h("p",{className:"v2-prompt"},item.consigne):null,
     !revealed?h("button",{className:"v2-primary",onClick:()=>setRevealed(true)},"J'ai cherché · Voir la réponse"):
      h("div",{},h("div",{className:"v2-feedback"},item.type==="flash"?item.a:h("div",{},...(item.reponse||[]).map((r,i)=>h("p",{key:i},r)),h("p",{},item.tip||""))),
        choice===null?h("div",{className:"v2-actions"},h("button",{onClick:()=>answer(true)},"✓ Je savais"),h("button",{onClick:()=>answer(false)},"↻ À revoir")):null)
   );
 }
 if(item.type==="quiz")return h("div",{className:"v2-question"},
   h("div",{className:"v2-question-label"},"QUIZ"),
   h("p",{className:"v2-question-text"},item.q),
   h("div",{className:"v2-options"},...(item.choices||[]).map((o,i)=>h("button",{key:i,disabled:choice!==null,onClick:()=>answer(i===item.correct),className:choice!==null&&i===item.correct?"v2-correct":""},o))),
   choice!==null?h("div",{className:"v2-feedback"},item.why):null
 );
 return h("div",{className:"v2-question"},
   h("div",{className:"v2-question-label"},"VRAI / FAUX"),
   h("p",{className:"v2-question-text"},item.s),
   h("div",{className:"v2-options"},...[true,false].map(v=>h("button",{key:String(v),disabled:choice!==null,onClick:()=>answer(v===item.v)},v?"Vrai":"Faux"))),
   choice!==null?h("div",{className:"v2-feedback"},item.why):null
 );
}
function Daily({items,record,exit}){
 const [index,setIndex]=useState(0);
 const [result,setResult]=useState(null);
 const [correct,setCorrect]=useState(0);
 const [finished,setFinished]=useState(false);
 if(!items.length)return h(Card,null,h("p",{},"Aucune question disponible."),h(Button,{onClick:exit},"Retour"));
 const current=items[index];
 const next=()=>{if(index===items.length-1)setFinished(true);else{setIndex(index+1);setResult(null)}};
 if(finished)return h("div",{className:"v2-hero"},h(Eyebrow,null,"Session terminée"),h("h2",{},"Révision terminée"),
   h("p",{},correct+" réponses réussies sur "+items.length+". Les erreurs reviendront en priorité dans les prochaines sessions."),
   h("button",{className:"v2-primary",onClick:exit},"Voir ma progression"));
 return h("div",{},
   h("div",{className:"v2-session-top"},h("button",{onClick:exit},"← Accueil"),h("span",{},(index+1)+" / "+items.length+" · niveau "+NIVEAUX[current.level].nom)),
   h("div",{className:"v2-progressbar"},h("div",{style:{width:(index/items.length*100)+"%"}})),
   h(CurrentExercise,{key:current.id,item:current,onAnswer:ok=>{if(result!==null)return;record(current.id,ok);setResult(ok);if(ok)setCorrect(n=>n+1)}}),
   result!==null?h("div",{className:"v2-next"},h("span",{},result?"✓ Réussi":"↻ À retravailler"),h("button",{className:"v2-primary",onClick:next},index+1===items.length?"Voir mon bilan":"Question suivante →")):null);
}
function Home({progress,rows,open,startDaily,filter,filterSet}){
 const overview=E.stats(progress,entries);
 const lev=E.levels(progress,entries);
 const due=overview.due;
 return h("div",{},
   h("section",{className:"v2-hero"},
     h("div",{className:"v2-eyebrow"},"MON PARCOURS DE RÉVISION"),
     h("h2",{},"Que réviser aujourd'hui ?"),
     h("p",{},"Une courte séance de rappel actif, adaptée aux notions déjà rencontrées."),
     h("div",{className:"v2-metrics"},
       h("div",{},h("strong",{},due),h("span",{},"à revoir maintenant")),
       h("div",{},h("strong",{},overview.weak),h("span",{},"à consolider")),
       h("div",{},h("strong",{},overview.mastery+" %"),h("span",{},"maîtrise estimée"))),
     h("button",{className:"v2-primary",onClick:startDaily},"Commencer ma révision · 12 questions →"),
     h("p",{className:"v2-hint"},"Environ 7–10 min · Les questions non vues sont introduites progressivement.")
   ),
   h("section",{className:"v2-section"},h("h2",{},"Choisir librement un niveau"),
     ...[1,2,3].map(level=>h("article",{key:level,className:"v2-level"},
       h("div",{className:"v2-level-heading"},h("div",{},h("small",{},"NIVEAU "+level),h("h3",{},NIVEAUX[level].nom),h("p",{},NIVEAUX[level].sous)),
         h("div",{className:"v2-percent"},lev[level].mastery+" %")),
       level>1&&lev[level-1].mastery<75?h("p",{className:"v2-hint"},"Conseil : consolider le niveau précédent avant celui-ci."):null,
       h("div",{className:"v2-module-grid"},...MODULES.map(([type,emoji,label])=>h("button",{key:type,onClick:()=>open(level,type)},emoji+" "+label)))
     ))
   ),
   h("section",{className:"v2-section"},h("h2",{},"Réviser par thème"),
     h("p",{className:"v2-hint"},"Choisis un thème pour composer ta prochaine séance."),
     h("div",{className:"v2-themes"},...THEMES.map(theme=>h("button",{key:theme,className:filter===theme?"selected":"",onClick:()=>filterSet(filter===theme?null:theme)},theme))),
     filter?h("button",{className:"v2-primary",onClick:startDaily},"Réviser : "+filter+" →"):null
   ),
   h("section",{className:"v2-section v2-note"},h("h3",{},"Comment progresser ?"),
     h("p",{},"Cherche la réponse avant de la dévoiler. Une erreur revient plus tôt, une réussite espace la prochaine révision. Les pourcentages sont des estimations, pas des notes."))
 );
}
function App(){
 const [progress,setProgress]=useState(()=>E.load());
 const [page,setPage]=useState("home");
 const [level,setLevel]=useState(1);
 const [mod,setMod]=useState("flash");
 const [filter,setFilter]=useState(null);
 const [dailyItems,setDailyItems]=useState([]);
 const overview=useMemo(()=>E.stats(progress,entries),[progress]);
 function record(id,ok){setProgress(prev=>E.record(prev,id,ok))}
 function open(l,m){setLevel(l);setMod(m);setPage("module");window.scrollTo(0,0)}
 function home(){setPage("home");window.scrollTo(0,0)}
 function startDaily(){
   const pool=filter?entries.filter(x=>x.tags?.includes(filter)):entries;
   const items=E.daily(progress,pool,12);
   setDailyItems(items);setPage("daily");window.scrollTo(0,0);
 }
 function reset(){if(!confirm("Effacer les résultats enregistrés sur cet appareil ?"))return;
   const d={version:2,items:{},history:[],legacyScores:{}};E.save(d);setProgress(d);home();
 }
 const moduleKey="n"+level+"-"+mod;
 const moduleItems=window.REVISION_DATA[level][mod];
 const tested=moduleItems.filter(x=>progress.items[x.id]);
 const modulePct=tested.length?Math.round(100*tested.filter(x=>progress.items[x.id].lastCorrect).length/moduleItems.length):0;
 const onScore=(key,score)=>{try{track("score",key,score)}catch(e){}};
 const props={key:moduleKey,lvl:level,onScore,onAnswer:record};
 return h("div",{className:"v2-page"},
   h("div",{className:"v2-shell"},
     h("header",{className:"v2-header"},
       h("div",{},h("div",{className:"v2-eyebrow"},"1ʳᵉ ST2S3 · FRANÇAIS · V2.0"),
       h("h1",{},"Lettres d'une Péruvienne"),
       h("p",{},"Françoise de Graffigny · Réviser pour comprendre et retenir")),
       h("div",{className:"v2-header-ring"},h(Ring,{value:overview.mastery,color:"#0D9488",size:64}),h("small",{},"maîtrise"))
     ),
     page==="home"?h(Home,{progress,rows:entries,open,startDaily,filter,filterSet:setFilter}):null,
     page==="daily"?h(Daily,{items:dailyItems,record,exit:home}):null,
     page==="module"?h("div",{},
       h("div",{className:"v2-session-top"},h("button",{onClick:home},"← Tous les niveaux"),h("span",{},"Niveau "+NIVEAUX[level].nom+" · "+modulePct+" % réussis récemment")),
       h("div",{className:"v2-module-grid v2-module-nav"},...MODULES.map(([key,emoji,label])=>h("button",{key,onClick:()=>open(level,key),className:key===mod?"selected":""},emoji+" "+label))),
       mod==="flash"?h(Flashcards,props):mod==="quiz"?h(Quiz,props):mod==="vf"?h(VraiFaux,props):h(Citations,props)
     ):null,
     h("footer",{className:"v2-footer"},h("span",{},"Révision autonome · Données de progression conservées sur cet appareil"),h("button",{onClick:reset},"Réinitialiser ma progression"))
   ));
}
try{
 ReactDOM.createRoot(document.getElementById("root")).render(h(App));
 document.getElementById("fallback")?.remove();
}catch(err){document.getElementById("fallback").textContent="Erreur au démarrage : "+err.message;console.error(err)}
})();