const TEASER_ORDER = ["care", "ready", "resident"];

function homeCard(bird) {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("article");
    card.className = "card qy-card h-100";

    if (bird.photo) {
        const figure = document.createElement("figure");
        figure.className = "qy-zoom m-0";
        const image = document.createElement("img");
        image.src = bird.photo;
        image.className = "card-img-top";
        image.alt = bird.alt;
        image.loading = "lazy";
        figure.appendChild(image);
        card.appendChild(figure);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const chipLine = document.createElement("p");
    chipLine.className = "mb-2";
    const chip = document.createElement("span");
    chip.className = "qy-chip qy-chip--" + bird.status;
    chip.textContent = STATUS_NAMES[bird.status];
    chipLine.appendChild(chip);
    body.appendChild(chipLine);

    const title = document.createElement("h3");
    title.className = "card-title qy-card-title";
    title.textContent = bird.name;
    body.appendChild(title);

    const species = document.createElement("p");
    species.className = "qy-species";
    species.appendChild(document.createTextNode(bird.species + " · "));
    const kk = document.createElement("span");
    kk.setAttribute("lang", "kk");
    kk.textContent = bird.kk;
    species.appendChild(kk);
    body.appendChild(species);

    const text = document.createElement("p");
    text.className = "card-text";
    text.textContent = bird.reason + ". " + bird.note;
    body.appendChild(text);

    card.appendChild(body);

    const footer = document.createElement("div");
    footer.className = "card-footer qy-card-footer";
    footer.textContent = (bird.status === "resident" ? "With us since " : "Admitted ") + shortDate(bird.admitted);
    card.appendChild(footer);

    col.appendChild(card);
    return col;
}

function pickTeaser() {
    const picked = [];
    TEASER_ORDER.forEach(function (status) {
        for (const bird of BIRDS) {
            if (bird.status === status && bird.photo && picked.indexOf(bird) === -1) {
                picked.push(bird);
                return;
            }
        }
    });
    return picked;
}

function fillTeaser() {
    const row = document.getElementById("home-birds");
    if (!row) {
        return;
    }
    row.textContent = "";
    pickTeaser().forEach(function (bird) {
        row.appendChild(homeCard(bird));
    });

    const line = document.getElementById("home-birds-line");
    if (line) {
        const patients = BIRDS.length - countByStatus("resident");
        line.textContent = "Right now the centre keeps " + BIRDS.length + " birds: " + patients
            + " patients in treatment and " + countByStatus("resident") + " residents that cannot go back to the wild. Three of them are below.";
    }
}

fillTeaser();
