const QY_KEY = "qyran:data";

function qyBlank() {
    return { v: 1, users: [], session: null, keeps: {} };
}

function qyRead() {
    let raw = null;
    try {
        raw = localStorage.getItem(QY_KEY);
    } catch (error) {
        raw = null;
    }
    if (!raw) {
        return qyBlank();
    }
    let data = null;
    try {
        data = JSON.parse(raw);
    } catch (error) {
        return qyBlank();
    }
    if (!data || typeof data !== "object") {
        return qyBlank();
    }
    if (!Array.isArray(data.users)) {
        data.users = [];
    }
    if (!data.keeps || typeof data.keeps !== "object") {
        data.keeps = {};
    }
    if (!data.session || !data.session.id) {
        data.session = null;
    }
    return data;
}

function qySave(data) {
    try {
        localStorage.setItem(QY_KEY, JSON.stringify(data));
    } catch (error) {
        return false;
    }
    document.dispatchEvent(new CustomEvent("qyran:store"));
    return true;
}

function qyUser() {
    const data = qyRead();
    if (!data.session) {
        return null;
    }
    for (const user of data.users) {
        if (user.id === data.session.id) {
            return user;
        }
    }
    return null;
}

function qyOwner() {
    const user = qyUser();
    return user ? user.id : "guest";
}

function qyKeeps(data, owner) {
    const key = owner || qyOwner();
    if (!data.keeps[key] || typeof data.keeps[key] !== "object") {
        data.keeps[key] = { follows: [], plan: [] };
    }
    if (!Array.isArray(data.keeps[key].follows)) {
        data.keeps[key].follows = [];
    }
    if (!Array.isArray(data.keeps[key].plan)) {
        data.keeps[key].plan = [];
    }
    return data.keeps[key];
}

function qyFollows() {
    const data = qyRead();
    return qyKeeps(data).follows.slice();
}

function qyPlan() {
    const data = qyRead();
    return qyKeeps(data).plan.slice();
}

function qyFollowing(birdId) {
    return qyFollows().indexOf(birdId) !== -1;
}

function qyToggleFollow(birdId) {
    const data = qyRead();
    const keeps = qyKeeps(data);
    const at = keeps.follows.indexOf(birdId);
    if (at === -1) {
        keeps.follows.push(birdId);
    } else {
        keeps.follows.splice(at, 1);
    }
    qySave(data);
    return at === -1;
}

function qyUnfollow(birdId) {
    const data = qyRead();
    const keeps = qyKeeps(data);
    const at = keeps.follows.indexOf(birdId);
    if (at !== -1) {
        keeps.follows.splice(at, 1);
        qySave(data);
    }
}

function qyClearFollows() {
    const data = qyRead();
    qyKeeps(data).follows = [];
    qySave(data);
}

function qyPlanAdd(item) {
    const data = qyRead();
    const keeps = qyKeeps(data);
    keeps.plan.push(item);
    qySave(data);
    return keeps.plan.length;
}

function qyPlanRemove(index) {
    const data = qyRead();
    const keeps = qyKeeps(data);
    if (index >= 0 && index < keeps.plan.length) {
        keeps.plan.splice(index, 1);
        qySave(data);
    }
}

function qyClearPlan() {
    const data = qyRead();
    qyKeeps(data).plan = [];
    qySave(data);
}

function qyItemCost(item) {
    if (typeof LEVELS === "undefined") {
        return 0;
    }
    let monthly = 0;
    for (const level of LEVELS) {
        if (level.id === item.level) {
            monthly = level.price;
        }
    }
    let extras = 0;
    if (item.extras && typeof EXTRAS !== "undefined") {
        for (const extra of EXTRAS) {
            const many = item.extras[extra.id];
            if (many) {
                extras += extra.price * many;
            }
        }
    }
    return monthly * item.months + extras;
}

function qyPlanTotal() {
    let sum = 0;
    for (const item of qyPlan()) {
        sum += qyItemCost(item);
    }
    return sum;
}

function qyHash(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
}

function qyFindUser(email) {
    const wanted = email.trim().toLowerCase();
    for (const user of qyRead().users) {
        if (user.email === wanted) {
            return user;
        }
    }
    return null;
}

function qySignUp(fields) {
    const data = qyRead();
    const email = fields.email.trim().toLowerCase();
    for (const user of data.users) {
        if (user.email === email) {
            return { ok: false, error: "This e-mail is already registered. Log in instead." };
        }
    }
    const id = "k" + (Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36));
    const guest = data.keeps.guest;
    data.users.push({
        id: id,
        name: fields.name.trim(),
        email: email,
        phone: fields.phone.trim(),
        village: fields.village.trim(),
        pass: qyHash(fields.pass),
        joined: new Date().toISOString().slice(0, 10)
    });
    data.session = { id: id, at: new Date().toISOString() };
    if (guest && (guest.follows.length || guest.plan.length)) {
        data.keeps[id] = { follows: guest.follows.slice(), plan: guest.plan.slice() };
        data.keeps.guest = { follows: [], plan: [] };
    }
    qySave(data);
    return { ok: true, moved: !!(guest && (guest.follows.length || guest.plan.length)) };
}

function qyLogIn(email, pass) {
    const data = qyRead();
    const wanted = email.trim().toLowerCase();
    for (const user of data.users) {
        if (user.email === wanted) {
            if (user.pass !== qyHash(pass)) {
                return { ok: false, error: "That password does not match the one saved for this e-mail." };
            }
            data.session = { id: user.id, at: new Date().toISOString() };
            qySave(data);
            return { ok: true, name: user.name };
        }
    }
    return { ok: false, error: "No keeper with this e-mail. Sign up first — it takes one form." };
}

function qyLogOut() {
    const data = qyRead();
    data.session = null;
    qySave(data);
}

function qyCount() {
    const data = qyRead();
    const keeps = qyKeeps(data);
    return keeps.follows.length + keeps.plan.length;
}

function qyPaintNav() {
    const box = document.getElementById("qyAccount");
    if (!box) {
        return;
    }
    const user = qyUser();
    const page = location.pathname.split("/").pop() || "index.html";
    const count = qyCount();
    box.textContent = "";

    function item(href, label, active, id) {
        const li = document.createElement("li");
        li.className = "nav-item";
        const link = document.createElement("a");
        link.className = "nav-link" + (active ? " active" : "");
        if (active) {
            link.setAttribute("aria-current", "page");
        }
        link.href = href;
        link.textContent = label;
        if (id) {
            link.id = id;
        }
        li.appendChild(link);
        box.appendChild(li);
        return link;
    }

    if (user) {
        const label = count ? "My aviary (" + count + ")" : "My aviary";
        item("profile.html", label, page === "profile.html", "qyAviary");
        const out = document.createElement("li");
        out.className = "nav-item";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "nav-link qy-nav__out";
        button.id = "qyLogOut";
        button.textContent = "Log out";
        out.appendChild(button);
        box.appendChild(out);
        button.addEventListener("click", function () {
            const name = user.name.split(" ")[0];
            qyLogOut();
            if (window.qyToast) {
                qyToast("Logged out. See you, " + name + ". What you saved stays on this device.");
            }
            if (page === "profile.html") {
                location.reload();
            }
        });
    } else {
        item("account.html", count ? "Log in (" + count + " saved)" : "Log in", page === "account.html" || page === "profile.html");
    }
}

function qyPaintFollowButtons() {
    document.querySelectorAll("[data-follow]").forEach(function (button) {
        const on = qyFollowing(button.getAttribute("data-follow"));
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
        const label = button.querySelector(".qy-follow__text");
        if (label) {
            label.textContent = on ? "Following" : "Follow";
        }
    });
}

document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-follow]");
    if (!button) {
        return;
    }
    const birdId = button.getAttribute("data-follow");
    if (!birdId) {
        return;
    }
    const added = qyToggleFollow(birdId);
    const bird = typeof birdById === "function" ? birdById(birdId) : null;
    const name = bird ? bird.name : "The bird";
    if (window.qyToast) {
        qyToast(added
            ? name + " is in your aviary. Open My aviary to see the list."
            : name + " is no longer in your aviary.");
    }
});

document.addEventListener("qyran:store", function () {
    qyPaintNav();
    qyPaintFollowButtons();
});

qyPaintNav();
qyPaintFollowButtons();
