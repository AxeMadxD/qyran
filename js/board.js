const CORRIDOR_LIMIT = 3;

const STAGES = [
    { id: "treatment", name: "In treatment", note: "Hospital box and quiet aviary" },
    { id: "corridor", name: "Flight corridor", note: "Forty metres, flying and hunting" },
    { id: "released", name: "Released", note: "Back in the valley they came from" }
];

const PRIORITY_NAMES = { 1: "Urgent", 2: "Normal", 3: "Low" };

const birds = [
    { id: 1, name: "Altyn", species: "Imperial eagle", priority: 2, food: 350, critical: false, tags: ["eagle", "power line"], admitted: "2026-06-12", stage: "treatment" },
    { id: 2, name: "Zhel", species: "Steppe eagle", priority: 3, food: 400, critical: false, tags: ["eagle", "starvation"], admitted: "2026-03-02", stage: "corridor" },
    { id: 3, name: "Qyz", species: "Saker falcon", priority: 2, food: 150, critical: false, tags: ["falcon", "trafficking"], admitted: "2026-04-28", stage: "corridor" },
    { id: 4, name: "Boran", species: "Common kestrel", priority: 3, food: 60, critical: false, tags: ["falcon", "nest"], admitted: "2026-07-19", stage: "corridor" },
    { id: 5, name: "Kishkentai", species: "Little owl", priority: 2, food: 50, critical: false, tags: ["owl", "car"], admitted: "2026-09-21", stage: "treatment" },
    { id: 6, name: "Kok", species: "Black kite", priority: 1, food: 200, critical: true, tags: ["kite", "poison"], admitted: "2026-09-30", stage: "treatment" },
    { id: 7, name: "Saryq", species: "Upland buzzard", priority: 1, food: 250, critical: false, tags: ["buzzard", "power line"], admitted: "2026-10-09", stage: "treatment" },
    { id: 8, name: "Zhuldyz", species: "Eurasian eagle owl", priority: 2, food: 300, critical: false, tags: ["owl", "wire"], admitted: "2026-08-15", stage: "treatment" },
    { id: 9, name: "Samal", species: "Steppe eagle", priority: 3, food: 400, critical: false, tags: ["eagle", "starvation"], admitted: "2026-01-14", stage: "released" },
    { id: 10, name: "Tolqyn", species: "Golden eagle", priority: 3, food: 450, critical: false, tags: ["eagle", "shot"], admitted: "2026-02-11", stage: "released" },
    { id: 11, name: "Dala", species: "Long-eared owl", priority: 3, food: 80, critical: false, tags: ["owl", "car"], admitted: "2026-05-03", stage: "released" },
    { id: 12, name: "Saule", species: "Common kestrel", priority: 3, food: 60, critical: false, tags: ["falcon", "nest"], admitted: "2026-06-30", stage: "released" }
];

const state = {
    message: "",
    tone: "",
    blockedId: null,
    reason: "",
    focusId: null
};

const board = document.querySelector("#board");
const search = document.querySelector("#search");
const tagSelect = document.querySelector("#tag");
const sortSelect = document.querySelector("#sort");
const progress = document.querySelector("#progress");
const progressText = document.querySelector("#progress-text");
const foodText = document.querySelector("#food");
const statusLine = document.querySelector("#status");
const nothing = document.querySelector("#nothing");
const nothingText = document.querySelector("#nothing-text");
const clearButton = document.querySelector("#clear");
const admitForm = document.querySelector("#admit");
const admitStatus = document.querySelector("#admit-status");

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

function findBird(id) {
    for (const bird of birds) {
        if (bird.id === id) {
            return bird;
        }
    }
    return null;
}

function countIn(stageId) {
    let count = 0;
    for (const bird of birds) {
        if (bird.stage === stageId) {
            count++;
        }
    }
    return count;
}

function stageIndex(stageId) {
    for (let i = 0; i < STAGES.length; i++) {
        if (STAGES[i].id === stageId) {
            return i;
        }
    }
    return -1;
}

function foodPerDay() {
    let grams = 0;
    for (const bird of birds) {
        if (bird.stage !== "released") {
            grams += bird.food;
        }
    }
    return grams;
}

function allTags() {
    const tags = [];
    for (const bird of birds) {
        for (const tag of bird.tags) {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }
    }
    return tags.sort();
}

function nextId() {
    let max = 0;
    for (const bird of birds) {
        if (bird.id > max) {
            max = bird.id;
        }
    }
    return max + 1;
}

function formatDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function todayIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
}

function compare(a, b) {
    if (sortSelect.value === "name") {
        return a.name.localeCompare(b.name);
    }
    if (sortSelect.value === "admitted") {
        return a.admitted.localeCompare(b.admitted);
    }
    return a.priority - b.priority || a.name.localeCompare(b.name);
}

function report(text, tone) {
    state.message = text;
    state.tone = tone;
}

function makeButton(text, action, bird, label) {
    const button = el("button", "btn patient__btn", text);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = bird.id;
    button.setAttribute("aria-label", label);
    if (action === "forward") {
        button.classList.add("patient__btn--main");
    }
    return button;
}

function makeCard(bird) {
    const card = el("li", "patient patient--p" + bird.priority);
    card.dataset.id = bird.id;
    card.tabIndex = -1;
    if (bird.critical) {
        card.classList.add("patient--critical");
    }

    const head = el("div", "patient__head");
    head.append(el("h3", "patient__name", bird.name));
    const chips = el("div", "patient__chips");
    if (bird.critical) {
        chips.append(el("span", "qy-chip qy-chip--crit", "Critical"));
    }
    chips.append(el("span", "qy-chip patient__priority", PRIORITY_NAMES[bird.priority]));
    head.append(chips);
    card.append(head);

    card.append(el("p", "patient__species", bird.species));

    const tags = el("ul", "patient__tags");
    for (const tag of bird.tags) {
        tags.append(el("li", "patient__tag", tag));
    }
    card.append(tags);

    card.append(el("p", "patient__meta", "Admitted " + formatDate(bird.admitted) + " · " + bird.food + " g a day"));

    if (bird.id === state.blockedId) {
        card.classList.add("patient--blocked");
        card.append(el("p", "patient__reason", state.reason));
    }

    const actions = el("div", "patient__actions");
    if (bird.stage === "treatment") {
        if (bird.critical) {
            actions.append(makeButton("Mark stable", "stable", bird, "Mark " + bird.name + " as stable"));
        }
        actions.append(makeButton("To the corridor →", "forward", bird, "Move " + bird.name + " to the flight corridor"));
    } else if (bird.stage === "corridor") {
        actions.append(makeButton("← Treatment", "back", bird, "Move " + bird.name + " back to treatment"));
        actions.append(makeButton("Release →", "forward", bird, "Release " + bird.name));
    } else {
        actions.append(makeButton("← Back to the corridor", "back", bird, "Move " + bird.name + " back to the flight corridor"));
    }
    card.append(actions);

    return card;
}

function fillTags() {
    const chosen = tagSelect.value;
    const options = [el("option", "", "All tags")];
    options[0].value = "all";
    for (const tag of allTags()) {
        const option = el("option", "", tag);
        option.value = tag;
        options.push(option);
    }
    tagSelect.replaceChildren(...options);
    tagSelect.value = chosen;
    if (tagSelect.value === "") {
        tagSelect.value = "all";
    }
}

function render() {
    fillTags();

    const query = search.value.trim().toLowerCase();
    const tag = tagSelect.value;
    const filtering = query !== "" || tag !== "all";

    const shown = [];
    for (const bird of birds) {
        const textOk = query === "" || bird.name.toLowerCase().includes(query) || bird.species.toLowerCase().includes(query);
        const tagOk = tag === "all" || bird.tags.includes(tag);
        if (textOk && tagOk) {
            shown.push(bird);
        }
    }
    shown.sort(compare);

    const lanes = [];
    for (const stage of STAGES) {
        const total = countIn(stage.id);
        const lane = el("section", "lane lane--" + stage.id);
        const head = el("header", "lane__head");
        const title = el("h2", "lane__title", stage.name);
        title.id = "lane-" + stage.id;
        lane.setAttribute("aria-labelledby", title.id);
        const count = el("span", "lane__count", stage.id === "corridor" ? total + " / " + CORRIDOR_LIMIT : String(total));
        head.append(title, count);
        lane.append(head, el("p", "lane__note", stage.note));

        if (stage.id === "corridor" && total >= CORRIDOR_LIMIT) {
            lane.classList.add("lane--full");
            lane.append(el("p", "lane__full", "Full: release a bird to make space"));
        }

        const list = el("ol", "lane__list");
        for (const bird of shown) {
            if (bird.stage === stage.id) {
                list.append(makeCard(bird));
            }
        }
        if (list.children.length === 0) {
            list.append(el("li", "lane__empty", filtering ? "No matches in this column" : "No birds here right now"));
        }
        lane.append(list);
        lanes.push(lane);
    }
    board.replaceChildren(...lanes);

    nothing.classList.toggle("board-nothing--shown", shown.length === 0);
    if (shown.length === 0) {
        const parts = [];
        if (query !== "") {
            parts.push("“" + search.value.trim() + "”");
        }
        if (tag !== "all") {
            parts.push("the tag “" + tag + "”");
        }
        nothingText.textContent = "No bird matches " + parts.join(" and ") + ".";
    }

    const released = countIn("released");
    progress.max = birds.length;
    progress.value = released;
    const percent = birds.length === 0 ? 0 : Math.round(released / birds.length * 100);
    progressText.textContent = released + " of " + birds.length + " birds released, " + percent + "%";

    foodText.textContent = (foodPerDay() / 1000).toFixed(2) + " kg";

    statusLine.textContent = state.message;
    statusLine.classList.toggle("board-status--ok", state.tone === "ok");
    statusLine.classList.toggle("board-status--blocked", state.tone === "blocked");

    if (state.focusId !== null) {
        const card = board.querySelector('.patient[data-id="' + state.focusId + '"]');
        if (card) {
            card.focus();
        }
        state.focusId = null;
    }
}

function move(bird, step) {
    const target = STAGES[stageIndex(bird.stage) + step];
    state.focusId = bird.id;

    if (!target) {
        state.blockedId = bird.id;
        state.reason = bird.name + " cannot move further.";
        report(state.reason, "blocked");
    } else if (target.id === "corridor" && bird.critical) {
        state.blockedId = bird.id;
        state.reason = bird.name + " is still critical. The vet has to mark the bird stable before it can fly.";
        report("Blocked: " + state.reason, "blocked");
    } else if (target.id === "corridor" && countIn("corridor") >= CORRIDOR_LIMIT) {
        state.blockedId = bird.id;
        state.reason = "The flight corridor is full, " + CORRIDOR_LIMIT + " of " + CORRIDOR_LIMIT + " birds. Release a bird or move one back first.";
        report("Blocked: " + bird.name + " cannot go in. " + state.reason, "blocked");
    } else {
        bird.stage = target.id;
        state.blockedId = null;
        report(target.id === "released" ? bird.name + " is free. Released into the valley." : bird.name + " moved to " + target.name.toLowerCase() + ".", "ok");
    }

    render();
}

function makeStable(bird) {
    bird.critical = false;
    state.blockedId = null;
    state.focusId = bird.id;
    report(bird.name + " is stable now and can go to the corridor.", "ok");
    render();
}

board.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }
    const bird = findBird(Number(button.dataset.id));
    if (!bird) {
        return;
    }
    if (button.dataset.action === "forward") {
        move(bird, 1);
    } else if (button.dataset.action === "back") {
        move(bird, -1);
    } else if (button.dataset.action === "stable") {
        makeStable(bird);
    }
});

function filtersChanged() {
    state.blockedId = null;
    render();
}

search.addEventListener("input", filtersChanged);
tagSelect.addEventListener("change", filtersChanged);
sortSelect.addEventListener("change", filtersChanged);

clearButton.addEventListener("click", () => {
    search.value = "";
    tagSelect.value = "all";
    filtersChanged();
    search.focus();
});

admitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = admitForm.elements;
    const name = data.name.value.trim();

    for (const bird of birds) {
        if (bird.name.toLowerCase() === name.toLowerCase()) {
            admitStatus.textContent = "There is already a bird called " + bird.name + " on the board. Give the new one another name.";
            admitStatus.classList.remove("board-status--ok");
            admitStatus.classList.add("board-status--blocked");
            data.name.focus();
            return;
        }
    }

    const bird = {
        id: nextId(),
        name: name,
        species: data.species.value.trim(),
        priority: Number(data.priority.value),
        food: Number(data.food.value),
        critical: data.critical.checked,
        tags: [data.group.value, data.cause.value],
        admitted: todayIso(),
        stage: "treatment"
    };
    birds.push(bird);

    admitStatus.textContent = bird.name + " was admitted and is now in treatment.";
    admitStatus.classList.remove("board-status--blocked");
    admitStatus.classList.add("board-status--ok");
    admitForm.reset();
    report(bird.name + " was admitted.", "ok");
    state.blockedId = null;
    render();
});

render();
