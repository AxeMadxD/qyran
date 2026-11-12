function pnode(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function factRow(list, name, value) {
    const dt = pnode("dt", null, name);
    const dd = pnode("dd", null, value);
    list.appendChild(dt);
    list.appendChild(dd);
}

function levelName(id) {
    for (const level of LEVELS) {
        if (level.id === id) {
            return level.name;
        }
    }
    return id;
}

function extrasText(item) {
    if (!item.extras) {
        return "none";
    }
    const parts = [];
    for (const extra of EXTRAS) {
        const many = item.extras[extra.id];
        if (many) {
            parts.push(many + " × " + extra.name.toLowerCase());
        }
    }
    return parts.length ? parts.join(", ") : "none";
}

function paintAccount() {
    const user = qyUser();
    const guest = document.getElementById("profile-guest");
    const card = document.getElementById("profile-card");
    guest.hidden = !!user;
    card.hidden = !user;

    if (!user) {
        const saved = qyFollows().length + qyPlan().length;
        document.getElementById("profile-guest-text").textContent = saved
            ? "You already have " + saved + " saved item" + (saved === 1 ? "" : "s") + " in this browser. They work without an account; signing up only puts a name on them and keeps them apart from whoever else uses this computer."
            : "Nothing is saved in this browser yet. Follow a bird or save a support plan and it will appear here — an account is not needed, it only keeps your lists apart from other people using this computer.";
        return;
    }

    const list = document.getElementById("profile-facts");
    list.textContent = "";
    factRow(list, "Name", user.name);
    factRow(list, "E-mail", user.email);
    factRow(list, "Phone", user.phone);
    factRow(list, "Village or city", user.village);
    factRow(list, "Keeper since", shortDate(user.joined));
}

function paintCounts() {
    const box = document.getElementById("profile-counts");
    const follows = qyFollows();
    const plan = qyPlan();
    box.textContent = "";
    const items = [
        { num: String(follows.length), label: follows.length === 1 ? "bird followed" : "birds followed" },
        { num: String(plan.length), label: plan.length === 1 ? "saved plan" : "saved plans" },
        { num: money(qyPlanTotal()), label: "the plan comes to" }
    ];
    items.forEach(function (item) {
        const cell = pnode("div", "qy-counts__item");
        cell.appendChild(pnode("p", "qy-counts__num", item.num));
        cell.appendChild(pnode("p", "qy-counts__label", item.label));
        box.appendChild(cell);
    });
}

function followCard(bird) {
    const col = pnode("div", "col");
    const card = pnode("article", "qy-keep qy-keep--" + bird.status);

    const media = pnode("div", "qy-keep__media");
    if (bird.photo) {
        const figure = pnode("figure", "qy-zoom m-0");
        const image = document.createElement("img");
        image.src = bird.photo;
        image.alt = bird.alt;
        image.loading = "lazy";
        figure.appendChild(image);
        media.appendChild(figure);
    } else {
        const screen = pnode("div", "qy-keep__screen");
        screen.appendChild(pnode("p", "qy-keep__kk", bird.kk));
        screen.appendChild(pnode("p", "qy-keep__noshot", "No photo: " + bird.stage.toLowerCase()));
        media.appendChild(screen);
    }
    card.appendChild(media);

    const body = pnode("div", "qy-keep__body");
    body.appendChild(pnode("span", "qy-chip qy-chip--" + bird.status, STATUS_SHORT[bird.status]));
    body.appendChild(pnode("h3", "qy-keep__name", bird.name));
    body.appendChild(pnode("p", "qy-keep__species", bird.species));
    body.appendChild(pnode("p", "qy-keep__note", bird.reason + "."));
    body.appendChild(pnode("p", "qy-keep__meta", (bird.status === "resident" ? "Here since " : "Admitted ") + shortDate(bird.admitted) + " · " + daysHere(bird.admitted) + " days"));

    const actions = pnode("div", "qy-keep__actions");
    const support = pnode("a", "btn qy-btn qy-btn--ghost", "Support " + bird.name);
    support.href = "support.html?bird=" + bird.id + "#adopt";
    actions.appendChild(support);
    const drop = pnode("button", "qy-keep__drop", "Remove");
    drop.type = "button";
    drop.setAttribute("data-drop-follow", bird.id);
    actions.appendChild(drop);
    body.appendChild(actions);

    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function paintFollows() {
    const box = document.getElementById("follow-list");
    const head = document.getElementById("follow-head");
    const clear = document.getElementById("follow-clear");
    const ids = qyFollows();
    box.textContent = "";

    head.textContent = ids.length === 1 ? "The bird you follow" : "Birds you follow";
    clear.hidden = !ids.length;

    if (!ids.length) {
        const empty = pnode("div", "qy-empty");
        empty.appendChild(pnode("p", "qy-empty__title", "No birds yet"));
        empty.appendChild(pnode("p", "qy-empty__text", "Open the catalogue and press Follow on any of the twenty birds. The list is kept in this browser, so it will still be here tomorrow."));
        const link = pnode("a", "qy-btn qy-btn--solid", "Open the catalogue");
        link.href = "birds.html";
        empty.appendChild(link);
        box.appendChild(empty);
        return;
    }

    const grid = pnode("div", "row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4");
    ids.forEach(function (id) {
        const bird = birdById(id);
        if (bird) {
            grid.appendChild(followCard(bird));
        }
    });
    box.appendChild(grid);
}

function paintPlan() {
    const box = document.getElementById("plan-list");
    const clear = document.getElementById("plan-clear");
    const plan = qyPlan();
    box.textContent = "";
    clear.hidden = !plan.length;

    if (!plan.length) {
        const empty = pnode("div", "qy-empty");
        empty.appendChild(pnode("p", "qy-empty__title", "Nothing saved yet"));
        empty.appendChild(pnode("p", "qy-empty__text", "Build a level, a number of months and the extras the centre needs on the support page, then press Save to my aviary. The total will wait for you here."));
        const link = pnode("a", "qy-btn qy-btn--solid", "Build a support plan");
        link.href = "support.html#adopt";
        empty.appendChild(link);
        box.appendChild(empty);
        return;
    }

    const wrap = pnode("div", "table-responsive");
    const table = pnode("table", "table qy-table qy-table--total align-middle");
    table.appendChild(pnode("caption", null, "Saved in this browser, newest at the bottom"));

    const head = pnode("thead");
    const headRow = pnode("tr");
    ["Bird", "Level", "Months", "Extras", "Saved", "Cost", ""].forEach(function (name) {
        const cell = pnode("th", null, name);
        cell.setAttribute("scope", "col");
        headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = pnode("tbody");
    plan.forEach(function (item, index) {
        const bird = birdById(item.bird);
        const row = pnode("tr");
        const name = pnode("th", "qy-table__name", bird ? bird.name : "Any bird");
        name.setAttribute("scope", "row");
        row.appendChild(name);
        row.appendChild(pnode("td", null, levelName(item.level)));
        row.appendChild(pnode("td", null, String(item.months)));
        row.appendChild(pnode("td", null, extrasText(item)));
        row.appendChild(pnode("td", null, shortDate(item.at)));
        row.appendChild(pnode("td", "qy-table__money", money(qyItemCost(item))));
        const last = pnode("td");
        const drop = pnode("button", "qy-keep__drop", "Remove");
        drop.type = "button";
        drop.setAttribute("data-drop-plan", String(index));
        last.appendChild(drop);
        row.appendChild(last);
        body.appendChild(row);
    });
    table.appendChild(body);

    const foot = pnode("tfoot");
    const footRow = pnode("tr");
    const label = pnode("td", null, plan.length === 1 ? "One saved plan" : plan.length + " saved plans");
    label.setAttribute("colspan", "5");
    footRow.appendChild(label);
    footRow.appendChild(pnode("td", "qy-table__money", money(qyPlanTotal())));
    footRow.appendChild(pnode("td", null, ""));
    foot.appendChild(footRow);
    table.appendChild(foot);

    wrap.appendChild(table);
    box.appendChild(wrap);
}

function paintLead() {
    const user = qyUser();
    const lead = document.getElementById("profile-lead");
    const title = document.getElementById("profile-title");
    const follows = qyFollows().length;
    const plan = qyPlan().length;

    title.textContent = user ? user.name.split(" ")[0] + "’s aviary" : "My aviary";

    if (!follows && !plan) {
        lead.textContent = "Nothing here yet. Follow a bird in the catalogue or save a support plan, and both will be waiting in this browser next time.";
        return;
    }
    const parts = [];
    if (follows) {
        parts.push(follows === 1 ? "one bird followed" : follows + " birds followed");
    }
    if (plan) {
        parts.push(plan === 1 ? "one saved support plan of " + money(qyPlanTotal()) : plan + " saved plans adding up to " + money(qyPlanTotal()));
    }
    lead.textContent = parts.join(" and ") + ", kept by this browser alone.";
}

function paintJson() {
    const box = document.getElementById("profile-json");
    let raw = null;
    try {
        raw = localStorage.getItem("qyran:data");
    } catch (error) {
        raw = null;
    }
    if (!raw) {
        box.textContent = "Nothing is saved under qyran:data yet.";
        return;
    }
    try {
        box.textContent = JSON.stringify(JSON.parse(raw), null, 2);
    } catch (error) {
        box.textContent = raw;
    }
}

function paintAll() {
    paintAccount();
    paintCounts();
    paintFollows();
    paintPlan();
    paintLead();
    paintJson();
}

paintAll();

document.addEventListener("qyran:store", paintAll);

document.getElementById("follow-clear").addEventListener("click", function () {
    const many = qyFollows().length;
    if (!many) {
        return;
    }
    qyClearFollows();
    if (window.qyToast) {
        qyToast(many === 1 ? "The bird was removed from your aviary." : "All " + many + " birds were removed from your aviary.");
    }
});

document.getElementById("plan-clear").addEventListener("click", function () {
    const many = qyPlan().length;
    if (!many) {
        return;
    }
    qyClearPlan();
    if (window.qyToast) {
        qyToast(many === 1 ? "The saved plan was removed." : "All " + many + " saved plans were removed.");
    }
});

document.addEventListener("click", function (event) {
    const follow = event.target.closest("[data-drop-follow]");
    if (follow) {
        const bird = birdById(follow.getAttribute("data-drop-follow"));
        qyUnfollow(follow.getAttribute("data-drop-follow"));
        if (window.qyToast) {
            qyToast((bird ? bird.name : "The bird") + " is no longer in your aviary.");
        }
        return;
    }
    const plan = event.target.closest("[data-drop-plan]");
    if (plan) {
        qyPlanRemove(Number(plan.getAttribute("data-drop-plan")));
        if (window.qyToast) {
            qyToast("That saved plan was removed.");
        }
    }
});

document.getElementById("profile-out").addEventListener("click", function () {
    const user = qyUser();
    const name = user ? user.name.split(" ")[0] : "keeper";
    qyLogOut();
    if (window.qyToast) {
        qyToast("Logged out. See you, " + name + ".");
    }
    paintAll();
});

document.getElementById("profile-forget").addEventListener("click", function () {
    const user = qyUser();
    if (!user) {
        return;
    }
    const data = qyRead();
    data.users = data.users.filter(function (one) {
        return one.id !== user.id;
    });
    delete data.keeps[user.id];
    data.session = null;
    qySave(data);
    if (window.qyToast) {
        qyToast("The account and its lists were deleted from this browser.", "warn");
    }
    paintAll();
});
