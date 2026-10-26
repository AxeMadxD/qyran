const OPEN_DAYS = [5, 6, 0];
const SOLD_OUT = ["2027-05-08", "2027-06-05", "2027-07-10", "2027-08-14", "2027-08-15"];
const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const PROGRAMMES = [
    { id: "tour", name: "Guided tour", time: "11:00", price: 2000, firstSaturday: false },
    { id: "talk", name: "Falconry talk", time: "13:00", price: 1500, firstSaturday: false },
    { id: "photo", name: "Photography morning", time: "08:00", price: 6000, firstSaturday: true }
];

const TYPES = [
    { id: "adult", name: "Adult", share: 1, seatsLeft: 8 },
    { id: "student", name: "Student", share: 0.5, seatsLeft: 3 },
    { id: "child", name: "Child 7 to 15", share: 0.5, seatsLeft: 2 }
];

const PROMOS = [
    { code: "BERKUT10", percent: 10 },
    { code: "ALTAI20", percent: 20 },
    { code: "VOLUNTEER", percent: 50 }
];

const FIELDS = ["programme", "date", "type", "quantity", "promo", "name", "email"];

const LABELS = {
    programme: "Programme",
    date: "Day",
    type: "Ticket type",
    quantity: "Number of tickets",
    promo: "Promo code",
    name: "Name and surname",
    email: "Email"
};

const form = document.querySelector("#ticket-form");
const programmeSelect = document.querySelector("#programme");
const typesBox = document.querySelector("#types");
const summary = document.querySelector("#summary");
const summaryTitle = document.querySelector("#summary-title");
const summaryList = document.querySelector("#summary-list");
const preview = document.querySelector("#preview");
const ticketList = document.querySelector("#tickets");
const booked = document.querySelector("#booked");

const touched = new Set();

form.noValidate = true;

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

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findProgramme(id) {
    return PROGRAMMES.find((programme) => programme.id === id) || null;
}

function findType(id) {
    return TYPES.find((type) => type.id === id) || null;
}

function findPromo(code) {
    const clean = code.trim().toUpperCase();
    return PROMOS.find((promo) => promo.code === clean) || null;
}

function toDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function longDate(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function shortDate(date) {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function isFirstSaturday(date) {
    return date.getDay() === 6 && date.getDate() <= 7;
}

function money(amount) {
    return amount.toLocaleString("ru-RU") + " ₸";
}

function radios() {
    return form.querySelectorAll('input[name="type"]');
}

function controlsOf(name) {
    return name === "type" ? Array.from(radios()) : [form.elements[name]];
}

function priceFor(programme, type, quantity, promo) {
    const price = programme.price * type.share * quantity;
    const discount = promo ? Math.round(price * promo.percent / 100) : 0;
    return { price: price, discount: discount, total: price - discount };
}

const checks = {
    programme() {
        if (programmeSelect.validity.valueMissing) {
            return "Choose a programme.";
        }
        return "";
    },

    date() {
        const input = form.elements.date;
        if (input.validity.badInput) {
            return "This is not a full date. Pick the day in the calendar.";
        }
        if (input.validity.valueMissing) {
            return "Choose the day of your visit.";
        }
        if (input.validity.rangeUnderflow || input.validity.rangeOverflow) {
            return "The season runs from " + shortDate(toDate(input.min)) + " to " + shortDate(toDate(input.max)) + ".";
        }
        const day = toDate(input.value);
        if (!OPEN_DAYS.includes(day.getDay())) {
            return longDate(day) + " is a closed day. We are open only on Friday, Saturday and Sunday.";
        }
        if (SOLD_OUT.includes(input.value)) {
            return "Everything on " + shortDate(day) + " is sold out. Try another day.";
        }
        const programme = findProgramme(programmeSelect.value);
        if (programme && programme.firstSaturday && !isFirstSaturday(day)) {
            return "The " + programme.name.toLowerCase() + " is only on the first Saturday of the month.";
        }
        return "";
    },

    type() {
        if (radios()[0].validity.valueMissing) {
            return "Choose a ticket type.";
        }
        const type = findType(form.elements.type.value);
        if (type && type.seatsLeft === 0) {
            return "There are no " + type.name.toLowerCase() + " tickets left. Choose another type.";
        }
        return "";
    },

    quantity() {
        const input = form.elements.quantity;
        if (input.validity.badInput) {
            return "Write the number of tickets with digits.";
        }
        if (input.validity.valueMissing) {
            return "How many tickets do you need?";
        }
        if (input.validity.rangeUnderflow) {
            return "At least " + input.min + " ticket.";
        }
        if (input.validity.rangeOverflow) {
            return "One booking is up to " + input.max + " tickets.";
        }
        if (input.validity.stepMismatch) {
            return "Tickets come whole. Write a whole number.";
        }
        const type = findType(form.elements.type.value);
        if (type && type.seatsLeft > 0 && Number(input.value) > type.seatsLeft) {
            return "Only " + type.seatsLeft + " " + type.name.toLowerCase() + " tickets are left.";
        }
        return "";
    },

    promo() {
        const value = form.elements.promo.value.trim();
        if (value === "") {
            return "";
        }
        if (!findPromo(value)) {
            return "We do not know the code " + value.toUpperCase() + ". Check it or leave the field empty.";
        }
        return "";
    },

    name() {
        const input = form.elements.name;
        const value = input.value.trim().replace(/\s+/g, " ");
        if (input.validity.valueMissing || value === "") {
            return "Write the name for the ticket.";
        }
        if (input.validity.tooShort) {
            return "The name is too short, at least " + input.minLength + " letters.";
        }
        if (!/^\p{L}+(['\u2019 -]\p{L}+)*$/u.test(value)) {
            return "Use letters only. A space, a hyphen or an apostrophe can go between them.";
        }
        if (value.split(" ").length < 2) {
            return "Write your first name and your surname.";
        }
        return "";
    },

    email() {
        const input = form.elements.email;
        if (input.validity.valueMissing) {
            return "Write your email, the ticket is sent there.";
        }
        if (input.validity.typeMismatch) {
            return "This is not an email address. Example: aigerim@mail.kz";
        }
        const domain = input.value.split("@")[1];
        if (!domain.includes(".")) {
            return "The part after @ needs a dot, like mail.kz or gmail.com.";
        }
        return "";
    }
};

function hasValue(name) {
    return name === "type" ? form.elements.type.value !== "" : form.elements[name].value.trim() !== "";
}

function mark(name, message) {
    document.querySelector("#" + name + "-error").textContent = message;
    for (const control of controlsOf(name)) {
        control.classList.toggle("is-invalid", message !== "");
        control.classList.toggle("is-valid", message === "" && hasValue(name));
        control.setAttribute("aria-invalid", message === "" ? "false" : "true");
    }
}

function unmark(name) {
    document.querySelector("#" + name + "-error").textContent = "";
    for (const control of controlsOf(name)) {
        control.classList.remove("is-invalid", "is-valid");
        control.removeAttribute("aria-invalid");
    }
}

function validate(name) {
    const message = checks[name]();
    mark(name, message);
    return message === "";
}

function isReady() {
    for (const name of FIELDS) {
        if (checks[name]() !== "") {
            return false;
        }
    }
    return true;
}

function buildProgrammes() {
    for (const programme of PROGRAMMES) {
        const option = el("option", "", programme.name + " · " + money(programme.price));
        option.value = programme.id;
        programmeSelect.append(option);
    }
}

function buildTypes() {
    for (const type of TYPES) {
        const box = el("div", "qy-type");
        box.id = "box-" + type.id;

        const input = el("input", "form-check-input qy-type__input");
        input.type = "radio";
        input.name = "type";
        input.id = "type-" + type.id;
        input.value = type.id;
        input.required = true;
        input.setAttribute("aria-describedby", "type-error");

        const label = el("label", "qy-type__label");
        label.htmlFor = input.id;
        const share = type.share === 1 ? "Full price" : Math.round(type.share * 100) + "% of the price";
        const left = el("span", "qy-type__left");
        left.id = "left-" + type.id;
        label.append(el("span", "qy-type__name", type.name), el("span", "qy-type__share", share), left);

        box.append(input, label);
        typesBox.append(box);
    }
}

function updateSeats() {
    for (const type of TYPES) {
        document.querySelector("#left-" + type.id).textContent = type.seatsLeft > 0 ? type.seatsLeft + " left" : "Sold out";
        document.querySelector("#box-" + type.id).classList.toggle("qy-type--soldout", type.seatsLeft === 0);
    }
}

function setText(id, text, empty) {
    const node = document.querySelector("#" + id);
    node.textContent = text;
    node.classList.toggle("ticket__empty", empty);
}

function updatePreview() {
    const programme = findProgramme(programmeSelect.value);
    const type = findType(form.elements.type.value);
    const dateValue = form.elements.date.value;
    const quantity = Number(form.elements.quantity.value);
    const quantityOk = form.elements.quantity.value !== "" && Number.isInteger(quantity) && quantity > 0;
    const promo = checks.promo() === "" ? findPromo(form.elements.promo.value) : null;
    const nameValue = form.elements.name.value.trim();
    const emailValue = form.elements.email.value.trim();

    setText("p-programme", programme ? programme.name : "Choose a programme", !programme);
    setText("p-date", dateValue ? longDate(toDate(dateValue)) : "Not chosen yet", !dateValue);
    setText("p-time", programme ? programme.time : "—", !programme);
    setText("p-tickets", type && quantityOk ? quantity + " × " + type.name : "—", !(type && quantityOk));
    setText("p-name", nameValue || "Your name", !nameValue);
    setText("p-email", emailValue || "Your email", !emailValue);

    if (programme && type && quantityOk) {
        const cost = priceFor(programme, type, quantity, promo);
        setText("p-price", money(cost.price), false);
        setText("p-discount", promo ? "−" + money(cost.discount) + ", " + promo.code : "No code", !promo);
        setText("p-total", money(cost.total), false);
    } else {
        setText("p-price", "—", true);
        setText("p-discount", "—", true);
        setText("p-total", "—", true);
    }

    const ready = isReady();
    preview.classList.toggle("ticket--ready", ready);
    document.querySelector("#p-stamp").textContent = ready ? "Ready to book" : "Draft";
}

function showSummary(wrong) {
    summaryTitle.textContent = wrong.length === 1 ? "1 field needs fixing" : wrong.length + " fields need fixing";
    const items = [];
    for (const name of wrong) {
        items.push(el("li", "", LABELS[name] + ": " + checks[name]()));
    }
    summaryList.replaceChildren(...items);
    summary.classList.add("qy-summary--shown");
}

function refreshSummary() {
    if (!summary.classList.contains("qy-summary--shown")) {
        return;
    }
    const wrong = FIELDS.filter((name) => touched.has(name) && checks[name]() !== "");
    if (wrong.length === 0) {
        hideSummary();
    } else {
        showSummary(wrong);
    }
}

function hideSummary() {
    summary.classList.remove("qy-summary--shown");
    summaryList.replaceChildren();
    summaryTitle.textContent = "";
}

function focusField(name) {
    if (name === "type") {
        const checked = form.querySelector('input[name="type"]:checked');
        (checked || radios()[0]).focus();
    } else {
        form.elements[name].focus();
    }
}

function bookingCode() {
    let code = "QY-";
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_LETTERS[randomInt(0, CODE_LETTERS.length - 1)];
    }
    return code;
}

function addFact(list, term, value) {
    const row = el("div");
    row.append(el("dt", "", term), el("dd", "", value));
    list.append(row);
}

function issueTicket() {
    const programme = findProgramme(programmeSelect.value);
    const type = findType(form.elements.type.value);
    const quantity = Number(form.elements.quantity.value);
    const promo = findPromo(form.elements.promo.value);
    const cost = priceFor(programme, type, quantity, promo);
    const code = bookingCode();

    type.seatsLeft -= quantity;

    const ticket = el("li", "ticket ticket--issued");
    ticket.tabIndex = -1;
    ticket.setAttribute("aria-label", "Ticket " + code);

    const main = el("div", "ticket__main");
    const top = el("div", "ticket__top");
    top.append(el("p", "ticket__brand", "Qyran · Berel"), el("p", "ticket__stamp", "Paid"));
    main.append(top, el("h3", "ticket__title", programme.name));
    const facts = el("dl", "ticket__facts");
    addFact(facts, "Day", longDate(toDate(form.elements.date.value)));
    addFact(facts, "Time", programme.time);
    addFact(facts, "Tickets", quantity + " × " + type.name);
    addFact(facts, "Name", form.elements.name.value.trim());
    addFact(facts, "Email", form.elements.email.value.trim());
    main.append(facts);

    const stub = el("div", "ticket__stub");
    stub.append(el("p", "ticket__code-label", "Booking code"), el("p", "ticket__code", code));
    const prices = el("dl", "ticket__money");
    addFact(prices, "Price", money(cost.price));
    addFact(prices, "Discount", promo ? "−" + money(cost.discount) + ", " + promo.code : "No code");
    addFact(prices, "Total", money(cost.total));
    prices.lastElementChild.classList.add("ticket__total");
    stub.append(prices);

    ticket.append(main, stub);
    ticketList.prepend(ticket);
    booked.classList.add("booked--has");

    form.reset();
    touched.clear();
    for (const name of FIELDS) {
        unmark(name);
    }
    updateSeats();
    updatePreview();
    ticket.focus();
}

buildProgrammes();
buildTypes();
updateSeats();

for (const name of FIELDS) {
    for (const control of controlsOf(name)) {
        control.addEventListener("blur", () => {
            touched.add(name);
            validate(name);
        });
    }
}

form.addEventListener("input", (event) => {
    const name = event.target.name;
    if (touched.has(name)) {
        validate(name);
    }
    refreshSummary();
    updatePreview();
});

form.addEventListener("change", (event) => {
    const name = event.target.name;
    if (name === "programme" && touched.has("date")) {
        validate("date");
    }
    if (name === "type" && touched.has("quantity")) {
        validate("quantity");
    }
    refreshSummary();
    updatePreview();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const wrong = [];
    for (const name of FIELDS) {
        touched.add(name);
        if (!validate(name)) {
            wrong.push(name);
        }
    }
    if (wrong.length > 0) {
        showSummary(wrong);
        focusField(wrong[0]);
        return;
    }
    hideSummary();
    issueTicket();
});

updatePreview();
