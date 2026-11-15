/* UI réutilisable pour les apps de révision · V2 */
const {useState,useEffect,useMemo}=React;
const T = {
  page: "bg-[#FAFAF9]",
  card: "bg-white",
  ink: "text-[#18181B]",
  sub: "text-[#52525B]",
  faint: "text-[#A1A1AA]",
  line: "border-[#E8E8E4]",
  soft: "bg-[#F4F4F1]",
  font: "font-sans",
  shadow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.18)]",
  hex: "#18181B",
  onHex: "#FFFFFF",
  onAccent: "#FFFFFF",
  warn: "#B45309"
};
const ACCENTS = {
  flash: {
    name: "Flashcards",
    hex: "#0D9488"
  },
  quiz: {
    name: "Quiz",
    hex: "#2563EB"
  },
  vf: {
    name: "Vrai / Faux",
    hex: "#D97706"
  },
  cit: {
    name: "Citations",
    hex: "#7C3AED"
  }
};
const NIVEAUX = {
  1: {
    nom: "Basique",
    sous: "Maîtriser les fondamentaux : personnages, intrigue, contexte, genre.",
    hex: "#0D9488"
  },
  2: {
    nom: "Avancé",
    sous: "Analyser l'œuvre : thèmes, genres, procédés d'écriture, regard étranger.",
    hex: "#2563EB"
  },
  3: {
    nom: "Expert",
    sous: "Viser le bac : parcours, citations-clés, argumentation fine.",
    hex: "#9333EA"
  }
};

function shuffle(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/* ============ DESIGN SYSTEM ============ */
const OKS = {
  background: "rgba(5,150,105,0.10)",
  borderColor: "rgba(5,150,105,0.45)"
};
const BADS = {
  background: "rgba(225,29,72,0.08)",
  borderColor: "rgba(225,29,72,0.40)"
};
const WARNS = {
  background: "rgba(217,119,6,0.12)"
};
function Ring({
  value,
  size = 56,
  stroke = 5,
  color
}) {
  const v = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    className: "relative shrink-0",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeOpacity: "0.15",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c - v / 100 * c,
    style: {
      transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 grid place-items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-bold tabular-nums",
    style: {
      color
    }
  }, v, "%")));
}
function Card({
  children,
  className = "p-7"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `rounded-2xl border ${T.line} ${T.card} ${T.shadow} ${className}`
  }, children);
}
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    className: `text-[11px] font-bold uppercase tracking-[0.16em] ${T.faint}`
  }, children);
}
function Button({
  children,
  onClick,
  tone = "primary",
  accent,
  className = "",
  disabled
}) {
  const primary = tone === "primary";
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    className: `px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 border ${primary ? "border-transparent" : `${T.line} ${T.soft} ${T.ink} hover:opacity-75`} ${className}`,
    style: primary ? {
      background: accent || T.hex,
      color: accent ? T.onAccent : T.onHex
    } : undefined
  }, children);
}
function ModHead({
  accent,
  left,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, left), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold tabular-nums px-2.5 py-1 rounded-full",
    style: {
      background: accent + "1F",
      color: accent
    }
  }, right));
}

/* ---- Barre de navigation d'un niveau ---- */
function LevelTabs({ lvl, mod, go }) {
  const items = [{
    key: "flash",
    label: "Flashcards",
    icon: "🃏",
    hex: ACCENTS.flash.hex
  }, {
    key: "quiz",
    label: "Quiz",
    icon: "🎯",
    hex: ACCENTS.quiz.hex
  }, {
    key: "vf",
    label: "Vrai / Faux",
    icon: "⚖️",
    hex: ACCENTS.vf.hex
  }, {
    key: "cit",
    label: "Citations",
    icon: "📜",
    hex: ACCENTS.cit.hex
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: `flex flex-wrap gap-1 p-1 rounded-full border ${T.line} ${T.soft} mb-8`
  }, items.map(it => {
    const active = mod === it.key;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => go(lvl, it.key),
      className: `px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${active ? "" : `${T.sub} hover:opacity-70`}`,
      style: active ? {
        background: it.hex,
        color: T.onAccent
      } : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "mr-1.5"
    }, it.icon), it.label);
  }));
}

/* ---- Flashcards ---- */
function Flashcards({ lvl, onScore, onAnswer }) {
  const CARDS = DATA[lvl].flash;
  const modKey = "n" + lvl + "-flash";
  const accent = ACCENTS.flash.hex;
  const [order, setOrder] = useState(() => shuffle(CARDS.map((_, i) => i)));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [again, setAgain] = useState([]);
  const [done, setDone] = useState(false);
  const card = CARDS[order[idx]];
  const judge = ok => {
    onAnswer(card.id, ok);
    const nk = ok ? [...known, order[idx]] : known;
    const na = ok ? again : [...again, order[idx]];
    setKnown(nk);
    setAgain(na);
    setFlipped(false);
    if (idx + 1 >= order.length) {
      onScore(modKey, Math.round(nk.length / order.length * 100));
      setDone(true);
    } else setIdx(idx + 1);
  };
  const restart = onlyAgain => {
    const pool = onlyAgain && again.length > 0 ? shuffle(again) : shuffle(CARDS.map((_, i) => i));
    setOrder(pool);
    setIdx(0);
    setKnown([]);
    setAgain([]);
    setDone(false);
    setFlipped(false);
  };
  if (done) {
    const total = known.length + again.length || 1;
    const pct = Math.round(known.length / total * 100);
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Bilan de la série"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-6 mt-4 mb-5"
    }, /*#__PURE__*/React.createElement(Ring, {
      value: pct,
      size: 72,
      color: accent
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: `text-lg font-bold ${T.ink}`
    }, "✅ ", known.length, " maîtrisées · 🔁 ", again.length, " à revoir"), again.length > 0 && /*#__PURE__*/React.createElement("p", {
      className: `text-sm ${T.sub} mt-1`
    }, "À rejouer en priorité : ", again.map(i => CARDS[i].tag).filter((x, k, arr) => arr.indexOf(x) === k).join(", ")))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-3 flex-wrap"
    }, again.length > 0 && /*#__PURE__*/React.createElement(Button, {
      accent: accent,
      onClick: () => restart(true)
    }, "Rejouer les cartes à revoir"), /*#__PURE__*/React.createElement(Button, {
      tone: "ghost",
      onClick: () => restart(false)
    }, "Rejouer toutes les cartes")));
  }
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ModHead, {
    accent: accent,
    left: card.tag,
    right: `${idx + 1} / ${order.length}`
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFlipped(!flipped),
    className: `w-full min-h-56 rounded-2xl border-2 ${T.line} ${T.card} p-8 flex items-center justify-center text-center transition-all active:scale-[0.99]`,
    style: {
      borderColor: flipped ? accent : undefined
    }
  }, !flipped ? /*#__PURE__*/React.createElement("p", {
    className: `text-xl font-semibold leading-snug ${T.ink}`
  }, card.q) : /*#__PURE__*/React.createElement("p", {
    className: `text-[15px] leading-relaxed ${T.sub}`
  }, card.a)), /*#__PURE__*/React.createElement("p", {
    className: `text-xs font-semibold text-center mt-3 ${T.faint}`
  }, flipped ? "Clique pour revoir la question" : "Réfléchis… puis clique pour vérifier"), flipped && /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3 mt-5"
  }, /*#__PURE__*/React.createElement(Button, {
    tone: "ghost",
    className: "flex-1",
    onClick: () => judge(true)
  }, "✅ Je savais"), /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    className: "flex-1",
    onClick: () => judge(false)
  }, "🔁 À revoir")));
}

/* ---- Quiz ---- */
function Quiz({ lvl, onScore, onAnswer }) {
  const QUIZ = DATA[lvl].quiz;
  const modKey = "n" + lvl + "-quiz";
  const accent = ACCENTS.quiz.hex;
  const [order, setOrder] = useState(() => shuffle(QUIZ.map((_, k) => k)));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ[order[i]];
  const pick = k => {
    if (picked === null) {
      setPicked(k);
      onAnswer(q.id, k === q.correct);
      if (k === q.correct) setScore(score + 1);
    }
  };
  const next = () => {
    if (i + 1 >= order.length) {
      onScore(modKey, Math.round(score / order.length * 100));
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };
  if (done) {
    const pct = Math.round(score / order.length * 100);
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Résultat du quiz"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-6 mt-4 mb-5"
    }, /*#__PURE__*/React.createElement(Ring, {
      value: pct,
      size: 72,
      color: accent
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: `text-2xl font-bold ${T.ink}`
    }, score, " / ", order.length), /*#__PURE__*/React.createElement("p", {
      className: `text-sm ${T.sub} mt-1`
    }, pct >= 80 ? "Excellent ! Tu maîtrises ce niveau. 🎉" : pct >= 50 ? "Bonne base — rejoue pour verrouiller les pièges. 💪" : "Reprends les flashcards puis reviens : c'est en se trompant qu'on apprend. 🌱"))), /*#__PURE__*/React.createElement(Button, {
      accent: accent,
      onClick: () => {
        setOrder(shuffle(QUIZ.map((_, k) => k)));
        setI(0);
        setPicked(null);
        setScore(0);
        setDone(false);
      }
    }, "Rejouer le quiz"));
  }
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ModHead, {
    accent: accent,
    left: "Choix multiple",
    right: `${i + 1} / ${order.length}`
  }), /*#__PURE__*/React.createElement("p", {
    className: `text-lg font-semibold leading-snug ${T.ink} mb-5`
  }, q.q), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5"
  }, q.choices.map((c, k) => {
    let style;
    if (picked !== null) style = k === q.correct ? OKS : k === picked ? BADS : {
      opacity: 0.45
    };
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => pick(k),
      disabled: picked !== null,
      className: `w-full text-left px-4 py-3.5 rounded-xl border ${T.line} ${T.card} flex items-start gap-3 text-sm transition-all ${picked === null ? "hover:-translate-y-px" : ""}`,
      style: style
    }, /*#__PURE__*/React.createElement("span", {
      className: `w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${T.ink}`,
      style: {
        background: picked === null ? undefined : k === q.correct ? "rgba(5,150,105,0.16)" : k === picked ? "rgba(225,29,72,0.14)" : undefined
      }
    }, String.fromCharCode(65 + k)), /*#__PURE__*/React.createElement("span", {
      className: T.ink
    }, c));
  })), picked !== null && /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl border p-4 text-sm",
    style: picked === q.correct ? OKS : BADS
  }, /*#__PURE__*/React.createElement("b", {
    className: T.ink
  }, picked === q.correct ? "✅ Exact. " : "❌ Pas tout à fait. "), /*#__PURE__*/React.createElement("span", {
    className: T.sub
  }, q.why), /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    onClick: next
  }, i + 1 >= order.length ? "Voir mon résultat" : "Question suivante →"))));
}

/* ---- Vrai / Faux ---- */
function VraiFaux({ lvl, onScore, onAnswer }) {
  const VRAIFAUX = DATA[lvl].vf;
  const modKey = "n" + lvl + "-vf";
  const accent = ACCENTS.vf.hex;
  const [order, setOrder] = useState(() => shuffle(VRAIFAUX.map((_, k) => k)));
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const s = VRAIFAUX[order[i]];
  const answer = v => {
    if (answered === null) {
      setAnswered(v);
      onAnswer(s.id, v === s.v);
      if (v === s.v) setScore(score + 1);
    }
  };
  const next = () => {
    if (i + 1 >= order.length) {
      onScore(modKey, Math.round(score / order.length * 100));
      setDone(true);
    } else {
      setI(i + 1);
      setAnswered(null);
    }
  };
  if (done) {
    const pct = Math.round(score / order.length * 100);
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Résultat Vrai / Faux"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-6 mt-4 mb-5"
    }, /*#__PURE__*/React.createElement(Ring, {
      value: pct,
      size: 72,
      color: accent
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: `text-2xl font-bold ${T.ink}`
    }, score, " / ", order.length), /*#__PURE__*/React.createElement("p", {
      className: `text-sm ${T.sub} mt-1`
    }, pct >= 80 ? "Les pièges n'ont plus de secret pour toi. ✨" : "Relis les fiches, puis rejoue : chaque erreur expliquée est un point gagné au bac. 📘"))), /*#__PURE__*/React.createElement(Button, {
      accent: accent,
      onClick: () => {
        setOrder(shuffle(VRAIFAUX.map((_, k) => k)));
        setI(0);
        setAnswered(null);
        setScore(0);
        setDone(false);
      }
    }, "Rejouer"));
  }
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ModHead, {
    accent: accent,
    left: "Affirmations à trancher",
    right: `${i + 1} / ${order.length}`
  }), /*#__PURE__*/React.createElement("p", {
    className: `text-lg font-semibold leading-snug ${T.ink} mb-6`
  }, s.s), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3"
  }, [true, false].map(v => {
    const isPicked = answered === v;
    const good = v === s.v;
    let style;
    if (answered !== null) style = isPicked ? good ? OKS : BADS : {
      opacity: 0.4
    };
    return /*#__PURE__*/React.createElement("button", {
      key: String(v),
      onClick: () => answer(v),
      disabled: answered !== null,
      className: `flex-1 py-3.5 rounded-xl border font-bold text-sm transition-all ${T.line} ${T.card} ${T.ink} ${answered === null ? "hover:-translate-y-px" : ""}`,
      style: style
    }, v ? "VRAI" : "FAUX");
  })), answered !== null && /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl border p-4 text-sm",
    style: answered === s.v ? OKS : BADS
  }, /*#__PURE__*/React.createElement("b", {
    className: T.ink
  }, answered === s.v ? "✅ Bien vu. " : "❌ Raté… "), /*#__PURE__*/React.createElement("span", {
    className: T.sub
  }, s.why), /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    onClick: next
  }, i + 1 >= order.length ? "Voir mon résultat" : "Suivante →"))));
}

/* ---- Citations : analyse guidée ---- */
function Citations({ lvl, onScore, onAnswer }) {
  const CITS = DATA[lvl].cit;
  const modKey = "n" + lvl + "-cit";
  const accent = ACCENTS.cit.hex;
  const [order, setOrder] = useState(() => shuffle(CITS.map((_, k) => k)));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [judged, setJudged] = useState(null);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const t = CITS[order[i]];
  const judge = ok => {
    setJudged(ok);
    onAnswer(t.id, ok);
    const nk = known + (ok ? 1 : 0);
    setKnown(nk);
    if (i + 1 >= order.length) {
      onScore(modKey, Math.round(nk / order.length * 100));
      setDone(true);
    }
  };
  const next = () => {
    setI(i + 1);
    setRevealed(false);
    setJudged(null);
  };
  const restart = () => {
    setOrder(shuffle(CITS.map((_, k) => k)));
    setI(0);
    setRevealed(false);
    setJudged(null);
    setKnown(0);
    setDone(false);
  };
  if (done) {
    const pct = Math.round(known / order.length * 100);
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Bilan des citations"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-6 mt-4 mb-5"
    }, /*#__PURE__*/React.createElement(Ring, {
      value: pct,
      size: 72,
      color: accent
    }), /*#__PURE__*/React.createElement("p", {
      className: `text-lg font-bold ${T.ink}`
    }, "✅ ", known, " citations analysées · 🔁 ", order.length - known, " à revoir")), /*#__PURE__*/React.createElement(Button, {
      accent: accent,
      onClick: restart
    }, "Rejouer les citations"));
  }
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ModHead, {
    accent: accent,
    left: t.source,
    right: `${i + 1} / ${order.length}`
  }), /*#__PURE__*/React.createElement("blockquote", {
    className: `rounded-2xl border ${T.line} ${T.soft} p-5 text-[15px] leading-relaxed italic ${T.ink} mb-4`
  }, t.texte), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border p-4 text-sm",
    style: {
      borderColor: accent + "55",
      background: accent + "12"
    }
  }, /*#__PURE__*/React.createElement("b", {
    className: T.ink
  }, "🎯 Ta mission (de mémoire !)"), /*#__PURE__*/React.createElement("p", {
    className: `${T.sub} mt-1`
  }, t.consigne)), !revealed ? /*#__PURE__*/React.createElement("div", {
    className: "mt-5"
  }, /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    onClick: () => setRevealed(true)
  }, "J'ai cherché → voir l'analyse")) : /*#__PURE__*/React.createElement("div", {
    className: "mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border p-4 text-sm",
    style: OKS
  }, /*#__PURE__*/React.createElement("b", {
    className: T.ink
  }, "Analyse"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mt-2"
  }, t.reponse.map((r, k) => /*#__PURE__*/React.createElement("p", {
    key: k,
    className: `${T.sub} leading-relaxed`
  }, "• ", r))), /*#__PURE__*/React.createElement("p", {
    className: `italic pt-3 mt-3 border-t ${T.line} ${T.sub}`
  }, "💡 ", t.tip)), judged === null ? /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3 mt-5"
  }, /*#__PURE__*/React.createElement(Button, {
    tone: "ghost",
    className: "flex-1",
    onClick: () => judge(true)
  }, "✅ J'avais trouvé l'essentiel"), /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    className: "flex-1",
    onClick: () => judge(false)
  }, "🔁 À revoir")) : /*#__PURE__*/React.createElement("div", {
    className: "mt-5"
  }, /*#__PURE__*/React.createElement(Button, {
    accent: accent,
    onClick: next
  }, i + 1 >= order.length ? "Voir mon bilan" : "Citation suivante →"))));
}


window.RevisionUI={T,ACCENTS,NIVEAUX,shuffle,Card,Eyebrow,Button,Ring,ModHead,Flashcards,Quiz,VraiFaux,Citations};
