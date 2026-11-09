const view = {
    query: "",
    status: "all",
    species: "all",
    sort: "stage",
    mode: "cards"
};

const SORTS = {
    stage: function (a, b) {
        const order = { critical: 0, care: 1, ready: 2, resident: 3 };
        if (order[a.status] !== order[b.status]) {
            return order[a.status] - order[b.status];
        }
        return a.name.localeCompare(b.name);
    },
    name: function (a, b) {
        return a.name.localeCompare(b.name);
    },
    wingspan: function (a, b) {
        return b.wingspan - a.wingspan;
    },
    newest: function (a, b) {
        return b.admitted.localeCompare(a.admitted);
    }
};

function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function speciesList() {
    const names = [];
    for (const bird of BIRDS) {
        if (names.indexOf(bird.species) === -1) {
            names.push(bird.species);
        }
    }
    return names.sort(function (a, b) {
        return a.localeCompare(b);
    });
}

function matches(bird) {
    if (view.status !== "all" && bird.status !== view.status) {
        return false;
    }
    if (view.species !== "all" && bird.species !== view.species) {
        return false;
    }
    if (!view.query) {
        return true;
    }
    const haystack = [bird.name, bird.kk, bird.species, bird.latin, bird.reason, bird.stage, bird.note].join(" ").toLowerCase();
    return haystack.indexOf(view.query) !== -1;
}

function found() {
    const list = [];
    for (const bird of BIRDS) {
        if (matches(bird)) {
            list.push(bird);
        }
    }
    return list.sort(SORTS[view.sort]);
}

function silhouette(bird) {
    const box = node("div", "patient-card__screen");
    box.appendChild(node("p", "patient-card__kk", bird.kk));
    box.appendChild(node("p", "patient-card__noshot", bird.stage === "Behind the screen" ? "No photo: behind the screen" : "No photo: in the hospital block"));
    return box;
}

function fact(name, value) {
    const row = node("div", "patient-card__fact");
    row.appendChild(node("dt", null, name));
    row.appendChild(node("dd", null, value));
    return row;
}

function buildCard(bird) {
    const card = node("article", "patient-card patient-card--" + bird.status);
    card.setAttribute("data-bird", bird.id);

    const media = node("div", "patient-card__media");
    if (bird.photo) {
        const figure = node("figure", "patient-card__figure qy-zoom");
        const image = node("img");
        image.src = bird.photo;
        image.alt = bird.alt;
        image.loading = "lazy";
        figure.appendChild(image);
        media.appendChild(figure);
    } else {
        media.appendChild(silhouette(bird));
    }
    card.appendChild(media);

    const body = node("div", "patient-card__body");
    const head = node("div", "patient-card__head");
    const title = node("h3", "patient-card__name");
    title.appendChild(document.createTextNode(bird.name + " "));
    const kk = node("span", "patient-card__kkname", bird.kk);
    kk.setAttribute("lang", "kk");
    title.appendChild(kk);
    head.appendChild(title);
    head.appendChild(node("span", "qy-chip qy-chip--" + bird.status, STATUS_SHORT[bird.status]));
    body.appendChild(head);

    const species = node("p", "patient-card__species");
    species.appendChild(document.createTextNode(bird.species + " "));
    const latin = node("em", null, bird.latin);
    species.appendChild(latin);
    body.appendChild(species);

    body.appendChild(node("p", "patient-card__reason", bird.reason));

    const facts = node("dl", "patient-card__facts");
    facts.appendChild(fact("Stage", bird.stage));
    facts.appendChild(fact("Wingspan", bird.wingspan + " cm"));
    facts.appendChild(fact("Weight", (bird.weight / 1000).toFixed(1).replace(".", ",") + " kg"));
    facts.appendChild(fact(bird.status === "resident" ? "Here since" : "Admitted", shortDate(bird.admitted) + " · " + daysHere(bird.admitted) + " days"));
    body.appendChild(facts);

    body.appendChild(node("p", "patient-card__note", bird.note));

    const link = node("a", "qy-btn qy-btn--ghost patient-card__link", "Support " + bird.name + " →");
    link.href = "support.html?bird=" + bird.id + "#adopt";
    body.appendChild(link);

    card.appendChild(body);
    return card;
}

function buildTable(list) {
    const wrap = node("div", "table-responsive");
    const table = node("table", "table qy-table align-middle");
    table.appendChild(node("caption", null, "Birds in the aviaries, state on 10 November 2026"));

    const head = node("thead");
    const headRow = node("tr");
    ["Name", "Species", "Admitted", "Reason", "Stage", "Wingspan", "Status"].forEach(function (name) {
        const cell = node("th", null, name);
        cell.setAttribute("scope", "col");
        headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = node("tbody");
    list.forEach(function (bird) {
        const row = node("tr");
        const name = node("th", "qy-table__name", bird.name);
        name.setAttribute("scope", "row");
        row.appendChild(name);
        row.appendChild(node("td", null, bird.species));
        row.appendChild(node("td", null, shortDate(bird.admitted)));
        row.appendChild(node("td", null, bird.reason));
        row.appendChild(node("td", null, bird.stage));
        row.appendChild(node("td", null, bird.wingspan + " cm"));
        const status = node("td");
        status.appendChild(node("span", "qy-chip qy-chip--" + bird.status, STATUS_SHORT[bird.status]));
        row.appendChild(status);
        body.appendChild(row);
    });
    table.appendChild(body);
    wrap.appendChild(table);
    return wrap;
}

function buildEmpty() {
    const box = node("div", "qy-empty");
    box.appendChild(node("p", "qy-empty__title", "Nothing found"));
    box.appendChild(node("p", "qy-empty__text", "No bird matches “" + view.query + "” with these filters. The centre has twenty birds in total — try a species, a name or the word “power line”."));
    const button = node("button", "qy-btn qy-btn--solid", "Show all twenty birds");
    button.type = "button";
    button.id = "bird-reset-empty";
    box.appendChild(button);
    return box;
}

function average(list, key) {
    if (!list.length) {
        return 0;
    }
    let sum = 0;
    for (const item of list) {
        sum += item[key];
    }
    return sum / list.length;
}

function renderCount(list) {
    const line = document.getElementById("bird-count");
    const words = list.length === 1 ? "1 bird" : list.length + " birds";
    if (!list.length) {
        line.textContent = "No birds match";
        return;
    }
    const span = Math.round(average(list, "wingspan"));
    const food = list.length * 0.6;
    line.textContent = words + " shown · average wingspan " + span + " cm · " + food.toFixed(1).replace(".", ",") + " kg of meat a day";
}

function render() {
    const list = found();
    const results = document.getElementById("bird-results");
    results.textContent = "";

    if (!list.length) {
        results.appendChild(buildEmpty());
    } else if (view.mode === "table") {
        results.appendChild(buildTable(list));
    } else {
        const grid = node("div", "patient-grid");
        list.forEach(function (bird) {
            grid.appendChild(buildCard(bird));
        });
        results.appendChild(grid);
    }

    renderCount(list);
    document.querySelectorAll(".qy-filter").forEach(function (button) {
        const on = button.getAttribute("data-status") === view.status;
        button.classList.toggle("is-active", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".qy-viewswitch button").forEach(function (button) {
        const on = button.getAttribute("data-view") === view.mode;
        button.classList.toggle("is-active", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (window.jQuery) {
        jQuery(document).trigger("qyran:rendered");
    }
}

function fillSpecies() {
    const select = document.getElementById("bird-species");
    speciesList().forEach(function (name) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function fillSummary() {
    const strip = document.getElementById("bird-summary");
    if (!strip) {
        return;
    }
    const patients = BIRDS.length - countByStatus("resident");
    const items = [
        { num: BIRDS.length, label: "birds in the aviaries" },
        { num: patients, label: "patients in treatment" },
        { num: countByStatus("resident"), label: "permanent residents" },
        { num: Math.round(average(BIRDS, "wingspan")) + " cm", label: "average wingspan" }
    ];
    items.forEach(function (item) {
        const box = node("div", "bird-summary__item");
        box.appendChild(node("p", "bird-summary__num", String(item.num)));
        box.appendChild(node("p", "bird-summary__label", item.label));
        strip.appendChild(box);
    });
}

function resetAll() {
    view.query = "";
    view.status = "all";
    view.species = "all";
    view.sort = "stage";
    document.getElementById("bird-search").value = "";
    document.getElementById("bird-species").value = "all";
    document.getElementById("bird-sort").value = "stage";
    render();
    document.getElementById("bird-search").focus();
}

fillSpecies();
fillSummary();
render();

document.getElementById("bird-search").addEventListener("input", function () {
    view.query = this.value.trim().toLowerCase();
    render();
});

document.getElementById("bird-search").addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        this.value = "";
        view.query = "";
        render();
    }
});

document.getElementById("bird-species").addEventListener("change", function () {
    view.species = this.value;
    render();
});

document.getElementById("bird-sort").addEventListener("change", function () {
    view.sort = this.value;
    render();
});

document.getElementById("bird-filters").addEventListener("click", function (event) {
    const button = event.target.closest(".qy-filter");
    if (!button) {
        return;
    }
    view.status = button.getAttribute("data-status");
    render();
});

document.querySelector(".qy-viewswitch").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-view]");
    if (!button) {
        return;
    }
    view.mode = button.getAttribute("data-view");
    render();
});

document.getElementById("bird-reset").addEventListener("click", resetAll);

document.getElementById("bird-results").addEventListener("click", function (event) {
    if (event.target.id === "bird-reset-empty") {
        resetAll();
    }
});
