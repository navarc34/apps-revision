"use strict";

const app = document.querySelector("#app");
const romans = ["", "I", "II", "III", "IV"];
const labels = {
  card: "Question de mémoire",
  choice: "QCM",
  boolean: "Vrai ou faux",
  order: "Remise en ordre",
  challenge: "Défi à réponse ouverte",
};
const modules = [
  { id: "reading", title: "Récit, personnages et dieux", description: "Retrouve les épisodes, les escales du voyage et le rôle de chacun." },
  { id: "challenge", title: "Interpréter et faire le lien avec Auguste", description: "Appuie ta réponse sur le récit, ta lecture ou un repère du cours." },
];

let chant = 0;
let session = null;
let position = 0;
let picked = [];
let options = [];
let revealed = false;
let toReview = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function randomizedOptions(item) {
  const values = item.type === "boolean" ? ["Vrai", "Faux"] : item.options ?? [];
  const indexed = values.map((value, index) => ({ value, index }));
  if (item.type === "boolean") return indexed;
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  if (item.type === "order" && indexed.every((option, index) => option.index === index)) {
    indexed.push(indexed.shift());
  }
  return indexed;
}

function moduleItems(id) {
  return activities.filter(item =>
    (id === "challenge" ? item.type === id : item.type !== "challenge") &&
    (!chant || item.chants.includes(chant))
  );
}

function focusOn(selector) {
  app.querySelector(selector)?.focus();
}

function goHome() {
  session = null;
  renderHome();
  window.scrollTo(0, 0);
  focusOn("#quiz-heading");
}

function renderHome() {
  app.innerHTML = `
    <section class="panel" aria-labelledby="quiz-heading">
      <h2 id="quiz-heading" tabindex="-1">Préparer le contrôle de lecture</h2>
      <p>Deux quiz différents sur les quatre chants. Chacun mêle 9 questions de lecture et 3 défis.</p>
      <div class="actions quiz-actions">
        <button type="button" class="primary" data-quiz="1">Quiz 1 · 12 activités</button>
        <button type="button" class="secondary" data-quiz="2">Quiz 2 · 12 activités</button>
      </div>
    </section>
    <h2 class="filter-heading" id="filter-heading">Réviser par chant</h2>
    <div class="filters" role="group" aria-labelledby="filter-heading">
      ${romans.map((roman, index) => `<button type="button" class="filter" data-chant="${index}" aria-pressed="${index === chant}">${roman ? "Chant " + roman : "Tous les chants"}</button>`).join("")}
    </div>
    <div class="modules">
      ${modules.map(module => {
        const count = moduleItems(module.id).length;
        return `<section class="module">
          <h3>${module.title}</h3>
          <p class="muted">${module.description}</p>
          <button type="button" class="primary" data-module="${module.id}" aria-label="Commencer · ${module.title} · ${count} activités">Commencer · ${count} activités</button>
        </section>`;
      }).join("")}
    </div>`;
}

function start(title, items) {
  session = { title, items };
  position = 0;
  toReview = [];
  window.scrollTo(0, 0);
  openQuestion();
}

function openQuestion() {
  picked = [];
  revealed = false;
  options = randomizedOptions(session.items[position]);
  renderQuestion();
  focusOn("#prompt");
}

function isCorrect(item) {
  if (item.type === "order") return picked.every((option, index) => option === index);
  return picked[0] === item.correct;
}

function needsSelection(item) {
  if (item.type === "order") return picked.length !== options.length;
  return ["choice", "boolean"].includes(item.type) && !picked.length;
}

function renderChoices(item) {
  if (!options.length) return "";
  const order = item.type === "order";
  return `
    ${order && !revealed ? `<p class="muted">Sélectionne les éléments dans l’ordre. Clique à nouveau sur un élément sélectionné pour le retirer.</p>` : ""}
    ${item.type === "boolean" && !revealed ? `<p class="muted">Si tu réponds « Faux », essaie de reformuler la phrase avant de vérifier.</p>` : ""}
    <div class="choices" role="group" aria-label="Réponses proposées">
      ${options.map(({ value, index }) => {
        const rank = picked.indexOf(index);
        let status = "";
        let note = "";
        if (revealed && !order && index === item.correct) {
          status = "good";
          note = " · Bonne réponse";
        } else if (revealed && !order && rank >= 0) {
          status = "wrong";
          note = " · Ton choix";
        }
        return `<button type="button" class="choice ${status}" data-option="${index}" aria-pressed="${rank >= 0}" ${revealed ? "disabled" : ""}>${order && rank >= 0 ? (rank + 1) + ". " : ""}${escapeHtml(value + note)}</button>`;
      }).join("")}
    </div>`;
}

function renderFeedback(item) {
  if (!revealed) return "";
  const challenge = item.type === "challenge";
  const objective = options.length > 0;
  const title = challenge ? "Critères et exemple" : objective
    ? (isCorrect(item) ? "Bien vu !" : "À revoir") : "Réponse";
  const reference = item.chants.length === 1
    ? "Chant " + romans[item.chants[0]] + " · " + item.reference : item.reference;
  return `<section class="feedback" aria-labelledby="feedback-heading">
    <h3 id="feedback-heading" tabindex="-1">${title}</h3>
    ${challenge ? `<ul>${item.criteria.map(criterion => `<li>${escapeHtml(criterion)}</li>`).join("")}</ul>` : ""}
    ${item.type === "order" ? `<p><strong>Ordre attendu</strong></p><ol>${item.options.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ol>` : ""}
    <p>${challenge ? "<strong>Exemple.</strong> " : ""}${escapeHtml(item.answer)}</p>
    ${item.extra ? `<p class="extra"><strong>Pour aller plus loin.</strong> ${escapeHtml(item.extra)}</p>` : ""}
    <p class="reference">${escapeHtml(reference)}</p>
  </section>`;
}

function renderQuestion() {
  const item = session.items[position];
  const challenge = item.type === "challenge";
  const chants = item.chants.length === 4 ? "Chants I à IV"
    : (item.chants.length === 1 ? "Chant " : "Chants ") + new Intl.ListFormat("fr").format(item.chants.map(n => romans[n]));
  app.innerHTML = `
    <div class="session-top">
      <button type="button" class="link-button back" data-action="home">← Activités</button>
      <span class="muted">Activité ${position + 1} / ${session.items.length}</span>
    </div>
    <progress class="progress" aria-label="Activités terminées" max="${session.items.length}" value="${position + Number(revealed)}"></progress>
    <section class="panel" aria-labelledby="prompt">
      <div class="tags"><span class="tag">${chants}</span><span class="tag">${labels[item.type]}</span></div>
      ${challenge ? `<p class="eyebrow">${escapeHtml(item.title)}</p>` : ""}
      <h2 id="prompt" tabindex="-1">${escapeHtml(item.prompt)}</h2>
      ${challenge && !revealed ? "<p class='muted'>Réponds en 30 à 60 secondes à voix haute ou en quelques lignes au brouillon.</p>" : ""}
      ${item.type === "card" && !revealed ? "<p class='muted'>Formule ta réponse de mémoire, puis compare-la au corrigé.</p>" : ""}
      ${renderChoices(item)}
      ${renderFeedback(item)}
      <div class="actions">
        ${revealed
          ? `<button type="button" class="primary" data-action="next">${position + 1 === session.items.length ? "Terminer" : "Continuer"}</button>
             ${options.length ? "" : '<button type="button" class="secondary" data-action="review">À revoir</button>'}`
          : `<button type="button" class="primary" data-action="reveal" ${needsSelection(item) ? "disabled" : ""}>${challenge ? "Afficher les critères" : options.length ? "Vérifier" : "Afficher la réponse"}</button>`}
      </div>
    </section>`;
}

function advance() {
  position++;
  if (position < session.items.length) {
    openQuestion();
    return;
  }
  const count = toReview.length;
  app.innerHTML = `<section class="panel" aria-labelledby="result">
    <h2 id="result" tabindex="-1">${escapeHtml(session.title)} · Terminé</h2>
    <p>${session.items.length} activités terminées. ${count
      ? count + (count === 1 ? " activité à revoir." : " activités à revoir.")
      : ""}</p>
    <div class="actions">
      ${count ? `<button type="button" class="primary" data-action="retry">Revoir ces activités</button>` : ""}
      <button type="button" class="secondary" data-action="home">Retour aux activités</button>
      ${session.title === "Quiz 1" ? '<button type="button" class="secondary" data-quiz="2">Faire le quiz 2</button>' : ""}
    </div>
  </section>`;
  focusOn("#result");
}

app.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  const { quiz, chant: selectedChant, module, option, action } = button.dataset;
  if (quiz) {
    start("Quiz " + quiz, activities.filter(item => item.quiz === Number(quiz)));
    return;
  }
  if (selectedChant !== undefined) {
    chant = Number(selectedChant);
    renderHome();
    focusOn(`[data-chant="${chant}"]`);
    return;
  }
  if (module) {
    start(modules.find(entry => entry.id === module).title, moduleItems(module));
    return;
  }
  if (action === "home") {
    goHome();
    return;
  }
  if (action === "retry") {
    start("À revoir", toReview);
    return;
  }
  const item = session?.items[position];
  if (!item) return;
  if (option !== undefined && !revealed) {
    const index = Number(option);
    if (item.type === "order") {
      picked = picked.includes(index) ? picked.filter(value => value !== index) : [...picked, index];
    } else {
      picked = [index];
    }
    renderQuestion();
    focusOn(`[data-option="${index}"]`);
  }
  if (action === "reveal" && !revealed && !needsSelection(item)) {
    revealed = true;
    if (options.length && !isCorrect(item)) toReview.push(item);
    renderQuestion();
    focusOn("#feedback-heading");
  }
  if (revealed && (action === "next" || action === "review")) {
    if (action === "review") toReview.push(item);
    advance();
  }
});

renderHome();
