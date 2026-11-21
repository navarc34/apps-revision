"use strict";

const app = document.querySelector("#app");
const romans = ["", "I", "II", "III", "IV"];
const labels = {
  card: "Question de mémoire",
  choice: "QCM",
  boolean: "Vrai ou faux",
  order: "Remise en ordre",
};
const levels = {
  beginner: { label: "Débutant", description: "Les grands épisodes, les personnages et les étapes du voyage." },
  expert: { label: "Expert", description: "Des épisodes moins connus, des détails du récit et des repères mythologiques." },
};

let level = "beginner";
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

function selectedActivities() {
  return activities.filter(item => item.level === level && (!chant || item.chants.includes(chant)));
}

function selectionTitle() {
  return levels[level].label + " · " + (chant ? "Chant " + romans[chant] : "Tous les chants");
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
  const count = selectedActivities().length;
  app.innerHTML = `
    <section class="panel setup" aria-labelledby="quiz-heading">
      <h2 id="quiz-heading" tabindex="-1">Préparer le contrôle de lecture</h2>
      <div class="level-cards" role="group" aria-label="Niveau">
        ${Object.entries(levels).map(([id, entry]) => `<button type="button" class="level-card" data-level="${id}" aria-pressed="${id === level}">
          <strong>${entry.label}</strong><span>${entry.description}</span>
        </button>`).join("")}
      </div>
      <h3 class="filter-heading" id="filter-heading">Chants à réviser</h3>
      <div class="filters" role="group" aria-labelledby="filter-heading">
        ${romans.map((roman, index) => `<button type="button" class="filter" data-chant="${index}" aria-pressed="${index === chant}">${roman ? "Chant " + roman : "Tous les chants"}</button>`).join("")}
      </div>
      <div class="actions quiz-actions">
        <button type="button" class="primary" data-action="start" ${count ? "" : "disabled"}>Commencer</button>
        <span class="muted" role="status">${count} ${count === 1 ? "activité" : "activités"}</span>
      </div>
    </section>`;
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
  const objective = options.length > 0;
  const title = objective
    ? (isCorrect(item) ? "Bien vu !" : "À revoir") : "Réponse";
  const reference = item.chants.length === 1
    ? "Chant " + romans[item.chants[0]] + " · " + item.reference : item.reference;
  return `<section class="feedback" aria-labelledby="feedback-heading">
    <h3 id="feedback-heading" tabindex="-1">${title}</h3>
    ${item.type === "order" ? `<p><strong>Ordre attendu</strong></p><ol>${item.options.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ol>` : ""}
    <p>${escapeHtml(item.answer)}</p>
    ${item.extra ? `<aside class="extra" aria-label="Pour aller plus loin"><strong>Pour aller plus loin</strong><p>${escapeHtml(item.extra)}</p></aside>` : ""}
    <p class="reference">${escapeHtml(reference)}</p>
  </section>`;
}

function renderQuestion() {
  const item = session.items[position];
  const chants = item.chants.length === 4 ? "Chants I à IV"
    : (item.chants.length === 1 ? "Chant " : "Chants ") + new Intl.ListFormat("fr").format(item.chants.map(n => romans[n]));
  app.innerHTML = `
    <div class="session-top">
      <button type="button" class="link-button back" data-action="home">← Niveau et chants</button>
      <span class="muted">Activité ${position + 1} / ${session.items.length}</span>
    </div>
    <progress class="progress" aria-label="Activités terminées" max="${session.items.length}" value="${position + Number(revealed)}"></progress>
    <section class="panel" aria-labelledby="prompt">
      <div class="tags"><span class="tag">${levels[level].label}</span><span class="tag">${chants}</span><span class="tag">${labels[item.type]}</span></div>
      <h2 id="prompt" tabindex="-1">${escapeHtml(item.prompt)}</h2>
      ${renderChoices(item)}
      ${renderFeedback(item)}
      <div class="actions">
        ${revealed
          ? `<button type="button" class="primary" data-action="next">${position + 1 === session.items.length ? "Terminer" : "Continuer"}</button>
             ${options.length ? "" : '<button type="button" class="secondary" data-action="review">À revoir</button>'}`
          : `<button type="button" class="primary" data-action="reveal" ${needsSelection(item) ? "disabled" : ""}>${options.length ? "Vérifier" : "Afficher la réponse"}</button>`}
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
      <button type="button" class="secondary" data-action="home">Choisir le niveau et les chants</button>
    </div>
  </section>`;
  focusOn("#result");
}

app.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  const { level: selectedLevel, chant: selectedChant, option, action } = button.dataset;
  if (selectedLevel) {
    level = selectedLevel;
    renderHome();
    focusOn(`[data-level="${level}"]`);
    return;
  }
  if (selectedChant !== undefined) {
    chant = Number(selectedChant);
    renderHome();
    focusOn(`[data-chant="${chant}"]`);
    return;
  }
  if (action === "start") {
    start(selectionTitle(), selectedActivities());
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
