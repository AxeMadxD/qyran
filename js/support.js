const pledge = {
    birdId: null,
    levelId: "keeper",
    months: 12,
    extras: {}
};

const TODAY = "2026-11-10";
const LAST_DAY = "2027-12-31";
const CAP = 9;

const ANY = {
    id: "any",
    name: "Any bird",
    kk: "Қай құс",
    species: "Wherever it is needed most",
    monthly: 12000
};

function chosenBird() {
    if (!pledge.birdId) {
        return null;
    }
    if (pledge.birdId === ANY.id) {
        return ANY;
    }
    return birdById(pledge.birdId);
}

function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function levelById(id) {
    for (const level of LEVELS) {
        if (level.id === id) {
            return level;
        }
    }
    return LEVELS[0];
}

function extraById(id) {
    for (const extra of EXTRAS) {
        if (extra.id === id) {
            return extra;
        }
    }
    return null;
}

function monthlyCost() {
    return levelById(pledge.levelId).price;
}

function extrasCost() {
    let sum = 0;
    for (const id in pledge.extras) {
        const extra = extraById(id);
        if (extra) {
            sum += extra.price * pledge.extras[id];
        }
    }
    return sum;
}

function extrasCount() {
    let n = 0;
    for (const id in pledge.extras) {
        n += pledge.extras[id];
    }
    return n;
}

function totalCost() {
    return monthlyCost() * pledge.months + extrasCost();
}

function buildBirds() {
    const box = document.getElementById("adopt-birds");
    box.textContent = "";

    const any = make("button", "adopt-bird adopt-bird--any");
    any.type = "button";
    any.setAttribute("data-bird", ANY.id);
    any.setAttribute("aria-pressed", "false");
    const anyMedia = make("span", "adopt-bird__media");
    anyMedia.appendChild(make("span", "adopt-bird__kk", ANY.kk));
    any.appendChild(anyMedia);
    const anyText = make("span", "adopt-bird__text");
    anyText.appendChild(make("span", "adopt-bird__name", ANY.name));
    anyText.appendChild(make("span", "adopt-bird__species", ANY.species));
    anyText.appendChild(make("span", "adopt-bird__status", "The duty vet decides on the day"));
    any.appendChild(anyText);
    box.appendChild(any);

    BIRDS.forEach(function (bird) {
        const button = make("button", "adopt-bird");
        button.type = "button";
        button.setAttribute("data-bird", bird.id);
        button.setAttribute("aria-pressed", "false");

        const media = make("span", "adopt-bird__media");
        if (bird.photo) {
            const image = document.createElement("img");
            image.src = bird.photo;
            image.alt = bird.alt;
            image.loading = "lazy";
            media.appendChild(image);
        } else {
            media.appendChild(make("span", "adopt-bird__kk", bird.kk));
        }
        button.appendChild(media);

        const text = make("span", "adopt-bird__text");
        text.appendChild(make("span", "adopt-bird__name", bird.name));
        text.appendChild(make("span", "adopt-bird__species", bird.species));
        text.appendChild(make("span", "adopt-bird__status", STATUS_NAMES[bird.status]));
        button.appendChild(text);

        box.appendChild(button);
    });
}

function buildLevels() {
    const box = document.getElementById("adopt-levels");
    box.textContent = "";
    LEVELS.forEach(function (level) {
        const button = make("button", "adopt-level");
        button.type = "button";
        button.setAttribute("data-level", level.id);
        button.setAttribute("aria-pressed", level.id === pledge.levelId ? "true" : "false");

        const head = make("span", "adopt-level__head");
        head.appendChild(make("span", "adopt-level__name", level.name));
        head.appendChild(make("span", "adopt-level__price", money(level.price) + " / month"));
        button.appendChild(head);

        const list = make("span", "adopt-level__perks");
        level.perks.forEach(function (perk) {
            list.appendChild(make("span", "adopt-level__perk", perk));
        });
        button.appendChild(list);

        box.appendChild(button);
    });
}

function buildExtras() {
    const box = document.getElementById("adopt-extras");
    box.textContent = "";
    EXTRAS.forEach(function (extra) {
        const row = make("div", "adopt-extra");
        row.setAttribute("data-extra", extra.id);

        const text = make("div", "adopt-extra__text");
        text.appendChild(make("p", "adopt-extra__name", extra.name));
        text.appendChild(make("p", "adopt-extra__meta", extra.unit + " · " + money(extra.price)));
        row.appendChild(text);

        const steps = make("div", "adopt-extra__steps");
        const minus = make("button", "adopt-extra__btn", "−");
        minus.type = "button";
        minus.setAttribute("data-step", "-1");
        minus.setAttribute("aria-label", "One less: " + extra.name);
        const count = make("output", "adopt-extra__count", "0");
        count.id = "extra-count-" + extra.id;
        const plus = make("button", "adopt-extra__btn", "+");
        plus.type = "button";
        plus.setAttribute("data-step", "1");
        plus.setAttribute("aria-label", "One more: " + extra.name);
        steps.appendChild(minus);
        steps.appendChild(count);
        steps.appendChild(plus);
        row.appendChild(steps);

        box.appendChild(row);
    });
}

function renderSpend(monthly) {
    const box = document.getElementById("adopt-spend");
    box.textContent = "";
    if (!monthly) {
        return;
    }
    SPEND.forEach(function (item) {
        const share = monthly * item.share;
        const units = share / item.cost;
        const shown = units >= 10 ? Math.round(units) : Math.round(units * 10) / 10;
        const word = shown === 1 && item.unit !== "kg" ? item.unit.slice(0, -1) : item.unit;
        const row = make("div", "spend__row");

        const head = make("div", "spend__head");
        head.appendChild(make("span", "spend__label", item.label));
        head.appendChild(make("span", "spend__value", String(shown).replace(".", ",") + " " + word));
        row.appendChild(head);

        const track = make("div", "spend__track");
        const bar = make("div", "spend__bar spend__bar--" + item.id);
        bar.style.width = Math.round(item.share * 100) + "%";
        track.appendChild(bar);
        row.appendChild(track);

        row.appendChild(make("p", "spend__money", money(share) + " of the month"));
        box.appendChild(row);
    });
}

function renderSummary() {
    const bird = chosenBird();
    const level = levelById(pledge.levelId);
    const lines = document.getElementById("adopt-lines");
    lines.textContent = "";

    function line(name, value) {
        const row = make("div", "adopt-line");
        row.appendChild(make("dt", null, name));
        row.appendChild(make("dd", null, value));
        lines.appendChild(row);
    }

    line("Bird", bird ? bird.name + ", " + bird.species.toLowerCase() : "not chosen yet");
    line("Level", level.name + ", " + money(level.price) + " a month");
    line("Months", pledge.months + (pledge.months === 1 ? " month" : " months"));
    line("Adoption", money(level.price * pledge.months));

    if (extrasCount()) {
        EXTRAS.forEach(function (extra) {
            const qty = pledge.extras[extra.id];
            if (qty) {
                line(extra.name, qty + " × " + money(extra.price) + " = " + money(qty * extra.price));
            }
        });
    } else {
        line("Extras", "none");
    }

    document.getElementById("adopt-total").textContent = money(totalCost());
    document.getElementById("adopt-monthly").textContent = money(level.price);

    const warning = document.getElementById("adopt-warning");
    const next = document.getElementById("adopt-next");
    if (bird) {
        warning.hidden = true;
        next.classList.remove("is-off");
        next.textContent = bird.id === ANY.id ? "Pledge for any bird →" : "Pledge for " + bird.name + " →";
    } else {
        warning.hidden = false;
        next.classList.add("is-off");
        next.textContent = "Choose a bird first";
    }

    document.querySelectorAll(".adopt-bird").forEach(function (button) {
        const on = button.getAttribute("data-bird") === pledge.birdId;
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll(".adopt-level").forEach(function (button) {
        const on = button.getAttribute("data-level") === pledge.levelId;
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    let capped = false;
    EXTRAS.forEach(function (extra) {
        const out = document.getElementById("extra-count-" + extra.id);
        const qty = pledge.extras[extra.id] || 0;
        out.textContent = String(qty);
        const row = out.closest(".adopt-extra");
        row.classList.toggle("is-on", qty > 0);
        const minus = row.querySelector("[data-step=\"-1\"]");
        const plus = row.querySelector("[data-step=\"1\"]");
        minus.disabled = qty === 0;
        plus.disabled = qty === CAP;
        if (qty === CAP) {
            capped = true;
        }
    });
    document.getElementById("adopt-cap").hidden = !capped;
    paintKeep(bird);

    renderSpend(level.price);
    fillFormSummary();
}

function paintKeep(bird) {
    const follow = document.getElementById("adopt-follow");
    const save = document.getElementById("adopt-save");
    const real = bird && bird.id !== ANY.id;
    follow.hidden = !real;
    if (real) {
        follow.setAttribute("data-follow", bird.id);
        const on = qyFollowing(bird.id);
        follow.classList.toggle("is-on", on);
        follow.setAttribute("aria-pressed", on ? "true" : "false");
        follow.querySelector(".qy-follow__text").textContent = on ? "Following" : "Follow " + bird.name;
    } else {
        follow.removeAttribute("data-follow");
    }
    save.disabled = !bird;
    const note = document.getElementById("adopt-saved");
    const many = qyPlan().length;
    note.textContent = many
        ? (many === 1 ? "One plan is saved in My aviary." : many + " plans are saved in My aviary.")
        : "";
}

function fillFormSummary() {
    const bird = chosenBird();
    const level = levelById(pledge.levelId);
    const box = document.getElementById("pledge-summary");
    if (!box) {
        return;
    }
    if (!bird) {
        box.textContent = "No bird chosen yet. The form still works for a question, a volunteer offer or a found bird.";
        return;
    }
    box.textContent = bird.name + " · " + level.name + " · " + pledge.months + " months · " + money(totalCost()) + " in total";
}

function setBird(id) {
    pledge.birdId = pledge.birdId === id ? null : id;
    renderSummary();
}

function readQuery() {
    const match = location.search.match(/bird=([a-z]+)/);
    if (match && match[1] === ANY.id) {
        pledge.birdId = ANY.id;
        return;
    }
    if (match && birdById(match[1])) {
        pledge.birdId = match[1];
        const level = birdById(match[1]).monthly;
        LEVELS.forEach(function (item) {
            if (item.price === level) {
                pledge.levelId = item.id;
            }
        });
    }
}

const FIELDS = [
    {
        id: "name",
        check: function (value) {
            if (!value) {
                return "Write the name we should ask for when we call back.";
            }
            if (value.length < 2 || value.length > 60) {
                return "Between 2 and 60 characters, please.";
            }
            if (!/^[A-Za-zЀ-ӿ' -]+$/.test(value)) {
                return "Letters, spaces and hyphens only — no digits.";
            }
            return "";
        }
    },
    {
        id: "phone",
        check: function (value) {
            if (!value) {
                return "We answer by phone first, so we need a number.";
            }
            if (!/^\+7[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(value)) {
                return "Kazakh format: +7 705 000 00 00.";
            }
            return "";
        }
    },
    {
        id: "email",
        check: function (value) {
            if (!value) {
                return "The monthly photo report goes by e-mail.";
            }
            if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value)) {
                return "This is not a working address: name@example.com.";
            }
            return "";
        }
    },
    {
        id: "village",
        check: function (value) {
            if (!value) {
                return "Tell us where you are, so we know which rescue car is closer.";
            }
            if (value.length < 2 || value.length > 40) {
                return "Between 2 and 40 characters, please.";
            }
            return "";
        }
    },
    {
        id: "when",
        check: function (value) {
            if (!value) {
                return "Choose the day the support should start.";
            }
            if (value < TODAY) {
                return "The date is in the past. Today is 10 November 2026.";
            }
            if (value > LAST_DAY) {
                return "We plan one year ahead, so not later than 31 December 2027.";
            }
            return "";
        }
    },
    {
        id: "hear",
        check: function (value) {
            if (!value) {
                return "Pick one — it tells us which of our channels actually works.";
            }
            return "";
        }
    },
    {
        id: "message",
        check: function (value) {
            const topic = document.querySelector("input[name='topic']:checked");
            const kind = topic ? topic.value : "adopt";
            if (kind === "bird" && value.length < 20) {
                return "For a found bird we need the details: where it is, can it stand, is it bleeding. At least 20 characters.";
            }
            if (value.length > 600) {
                return "Up to 600 characters, please.";
            }
            return "";
        }
    },
    {
        id: "agree",
        check: function (value, field) {
            if (!field.checked) {
                return "We cannot call you back without your permission.";
            }
            return "";
        }
    }
];

function successPanel() {
    const bird = pledge.birdId ? birdById(pledge.birdId) : null;
    const level = levelById(pledge.levelId);
    const name = document.getElementById("name").value.trim();
    const box = document.getElementById("pledge-done");
    const list = document.getElementById("pledge-done-lines");

    document.getElementById("pledge-done-title").textContent = "Thank you, " + name.split(" ")[0] + ".";
    list.textContent = "";
    const rows = [
        ["Bird", bird ? bird.name + ", " + bird.species.toLowerCase() : "a question, no bird chosen"],
        ["Level", level.name + ", " + money(level.price) + " a month"],
        ["Months", String(pledge.months)],
        ["Extras", extrasCount() ? extrasCount() + " item(s), " + money(extrasCost()) : "none"],
        ["Total", money(totalCost())],
        ["First payment", shortDate(document.getElementById("when").value)],
        ["We call you on", document.getElementById("phone").value.trim()]
    ];
    rows.forEach(function (row) {
        const item = make("div", "adopt-line");
        item.appendChild(make("dt", null, row[0]));
        item.appendChild(make("dd", null, row[1]));
        list.appendChild(item);
    });

    const form = document.getElementById("pledge-form");
    form.reset();
    qyClearErrors(FIELDS);
    form.hidden = true;
    box.hidden = false;
    if (window.qyToast) {
        qyToast("Pledge sent. The duty vet reads the table every evening.");
    }
}

function resetForm() {
    const form = document.getElementById("pledge-form");
    form.reset();
    qyClearErrors(FIELDS);
    document.getElementById("message-hint").textContent = "Anything we should know. Optional.";
    renderSummary();
}

buildBirds();
buildLevels();
buildExtras();
readQuery();
renderSummary();

document.getElementById("adopt-birds").addEventListener("click", function (event) {
    const button = event.target.closest(".adopt-bird");
    if (button) {
        setBird(button.getAttribute("data-bird"));
    }
});

document.getElementById("adopt-levels").addEventListener("click", function (event) {
    const button = event.target.closest(".adopt-level");
    if (button) {
        pledge.levelId = button.getAttribute("data-level");
        renderSummary();
    }
});

document.getElementById("adopt-months").addEventListener("change", function (event) {
    if (event.target.name === "months") {
        pledge.months = Number(event.target.value);
        renderSummary();
    }
});

document.getElementById("adopt-extras").addEventListener("click", function (event) {
    const button = event.target.closest(".adopt-extra__btn");
    if (!button) {
        return;
    }
    const id = button.closest(".adopt-extra").getAttribute("data-extra");
    const step = Number(button.getAttribute("data-step"));
    const now = pledge.extras[id] || 0;
    const next = Math.min(9, Math.max(0, now + step));
    if (next) {
        pledge.extras[id] = next;
    } else {
        delete pledge.extras[id];
    }
    renderSummary();
});

document.getElementById("adopt-next").addEventListener("click", function (event) {
    if (!pledge.birdId) {
        event.preventDefault();
        if (window.qyToast) {
            qyToast("Choose one of the twenty birds first.", "warn");
        }
        document.querySelector(".adopt-bird").focus();
        return;
    }
    const adopt = document.getElementById("topic-adopt");
    if (adopt) {
        adopt.checked = true;
    }
});

document.getElementById("pledge-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const first = qyCheckAll(FIELDS);
    if (first) {
        qyFocusFirst(first);
        if (window.qyToast) {
            qyToast("Something is missing — see the red lines.", "warn");
        }
        return;
    }
    successPanel();
});

qyWatchFields(FIELDS);

document.querySelectorAll("input[name='topic']").forEach(function (radio) {
    radio.addEventListener("change", function () {
        const message = document.getElementById("message");
        if (message.classList.contains("is-invalid")) {
            qyCheckField(FIELDS[6]);
        }
        const label = document.getElementById("message-hint");
        label.textContent = this.value === "bird"
            ? "Where exactly is the bird, can it stand, is it bleeding? At least 20 characters."
            : "Anything we should know. Optional.";
    });
});

document.getElementById("pledge-again").addEventListener("click", function () {
    document.getElementById("pledge-done").hidden = true;
    document.getElementById("pledge-form").hidden = false;
    resetForm();
    document.getElementById("name").focus();
});

document.getElementById("adopt-save").addEventListener("click", function () {
    const bird = chosenBird();
    if (!bird) {
        if (window.qyToast) {
            qyToast("Choose a bird first — Any bird is the top card.", "warn");
        }
        document.querySelector(".adopt-bird").focus();
        return;
    }
    const many = qyPlanAdd({
        bird: bird.id,
        level: pledge.levelId,
        months: pledge.months,
        extras: Object.assign({}, pledge.extras),
        at: new Date().toISOString().slice(0, 10)
    });
    renderSummary();
    if (window.qyToast) {
        qyToast(money(totalCost()) + " for " + (bird.id === ANY.id ? "any bird" : bird.name)
            + " is in My aviary. " + (many === 1 ? "It is the only plan saved." : many + " plans are saved now."));
    }
});

document.addEventListener("qyran:store", function () {
    paintKeep(chosenBird());
});
