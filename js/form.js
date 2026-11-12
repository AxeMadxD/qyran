function qyFieldValue(field) {
    if (field.type === "checkbox") {
        return field.checked ? "yes" : "";
    }
    return field.value.trim();
}

function qyShowError(id, message) {
    const field = document.getElementById(id);
    const box = document.getElementById("err-" + id);
    if (!field || !box) {
        return;
    }
    if (message) {
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        box.textContent = message;
        box.hidden = false;
    } else {
        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        box.textContent = "";
        box.hidden = true;
    }
}

function qyCheckField(rule) {
    const field = document.getElementById(rule.id);
    if (!field) {
        return true;
    }
    const message = rule.check(qyFieldValue(field), field);
    qyShowError(rule.id, message);
    return !message;
}

function qyCheckAll(rules) {
    let first = null;
    rules.forEach(function (rule) {
        if (!qyCheckField(rule) && !first) {
            first = rule.id;
        }
    });
    return first;
}

function qyClearErrors(rules) {
    rules.forEach(function (rule) {
        qyShowError(rule.id, "");
    });
}

function qyWatchFields(rules) {
    rules.forEach(function (rule) {
        const field = document.getElementById(rule.id);
        if (!field) {
            return;
        }
        const name = field.type === "checkbox" || field.tagName === "SELECT" || field.type === "date" ? "change" : "input";
        field.addEventListener(name, function () {
            if (field.classList.contains("is-invalid")) {
                qyCheckField(rule);
            }
        });
        field.addEventListener("blur", function () {
            if (qyFieldValue(field)) {
                qyCheckField(rule);
            }
        });
    });
}

function qyFocusFirst(id) {
    const field = document.getElementById(id);
    if (!field) {
        return;
    }
    if (window.jQuery) {
        jQuery(document.scrollingElement || document.documentElement).stop(true, true)
            .animate({ scrollTop: jQuery(field).offset().top - 120 }, 400);
    }
    field.focus({ preventScroll: true });
}
