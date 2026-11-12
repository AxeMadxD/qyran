const NAME_RE = /^[A-Za-zЀ-ӿ' -]+$/;
const MAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^\+7[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

const SIGNUP = [
    {
        id: "su-name",
        check: function (value) {
            if (!value) {
                return "Write the name the centre should call you by.";
            }
            if (value.length < 2 || value.length > 60) {
                return "Between 2 and 60 characters, please.";
            }
            if (!NAME_RE.test(value)) {
                return "Letters, spaces and hyphens only — no digits.";
            }
            return "";
        }
    },
    {
        id: "su-email",
        check: function (value) {
            if (!value) {
                return "The e-mail is how you log in again.";
            }
            if (!MAIL_RE.test(value)) {
                return "This is not a working address: name@example.com.";
            }
            if (qyFindUser(value)) {
                return "This e-mail already has an account in this browser. Log in on the right.";
            }
            return "";
        }
    },
    {
        id: "su-phone",
        check: function (value) {
            if (!value) {
                return "We answer by phone first, so we ask for a number.";
            }
            if (!PHONE_RE.test(value)) {
                return "Kazakh format: +7 705 000 00 00.";
            }
            return "";
        }
    },
    {
        id: "su-village",
        check: function (value) {
            if (!value) {
                return "Tell us where you are — it decides which rescue car is closer.";
            }
            if (value.length < 2 || value.length > 40) {
                return "Between 2 and 40 characters, please.";
            }
            return "";
        }
    },
    {
        id: "su-pass",
        check: function (value) {
            if (!value) {
                return "Pick a password. This is a demo, so pick a throwaway one.";
            }
            if (value.length < 8) {
                return "At least eight characters — this one has " + value.length + ".";
            }
            if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
                return "Mix letters and digits, like keeper1234.";
            }
            return "";
        }
    },
    {
        id: "su-again",
        check: function (value) {
            if (!value) {
                return "Type the password a second time.";
            }
            if (value !== document.getElementById("su-pass").value.trim()) {
                return "The two passwords are different.";
            }
            return "";
        }
    },
    {
        id: "su-demo",
        check: function (value, field) {
            if (!field.checked) {
                return "Please confirm you are not using a real password here.";
            }
            return "";
        }
    }
];

const LOGIN = [
    {
        id: "li-email",
        check: function (value) {
            if (!value) {
                return "The e-mail you signed up with.";
            }
            if (!MAIL_RE.test(value)) {
                return "This is not a working address: name@example.com.";
            }
            return "";
        }
    },
    {
        id: "li-pass",
        check: function (value) {
            if (!value) {
                return "The password you chose when you signed up.";
            }
            return "";
        }
    }
];

function knownCount() {
    const box = document.getElementById("login-count");
    if (!box) {
        return;
    }
    const many = qyRead().users.length;
    if (!many) {
        box.textContent = "No keeper account has been made in this browser yet.";
        return;
    }
    box.textContent = many === 1
        ? "One keeper account is saved in this browser."
        : many + " keeper accounts are saved in this browser.";
}

function goToProfile(name, moved) {
    const form = document.getElementById("signup-form");
    const done = document.getElementById("signup-done");
    document.getElementById("signup-done-title").textContent = "Welcome, " + name.split(" ")[0] + ".";
    document.getElementById("signup-done-text").textContent = moved
        ? "What you had already followed moved into your account. Opening My aviary…"
        : "Your aviary is empty for now. Follow a bird and it will show up there. Opening My aviary…";
    form.reset();
    qyClearErrors(SIGNUP);
    form.hidden = true;
    done.hidden = false;
    if (window.qyToast) {
        qyToast("Account created in this browser. You are logged in.");
    }
    window.setTimeout(function () {
        location.href = "profile.html";
    }, 1400);
}

document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const first = qyCheckAll(SIGNUP);
    if (first) {
        qyFocusFirst(first);
        if (window.qyToast) {
            qyToast("Something is missing — see the red lines.", "warn");
        }
        return;
    }
    const result = qySignUp({
        name: document.getElementById("su-name").value,
        email: document.getElementById("su-email").value,
        phone: document.getElementById("su-phone").value,
        village: document.getElementById("su-village").value,
        pass: document.getElementById("su-pass").value.trim()
    });
    if (!result.ok) {
        qyShowError("su-email", result.error);
        qyFocusFirst("su-email");
        return;
    }
    goToProfile(document.getElementById("su-name").value.trim() || "keeper", result.moved);
});

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const box = document.getElementById("err-login");
    box.hidden = true;
    box.textContent = "";
    const first = qyCheckAll(LOGIN);
    if (first) {
        qyFocusFirst(first);
        return;
    }
    const result = qyLogIn(
        document.getElementById("li-email").value,
        document.getElementById("li-pass").value.trim()
    );
    if (!result.ok) {
        box.textContent = result.error;
        box.hidden = false;
        document.getElementById("li-pass").value = "";
        document.getElementById("li-email").focus();
        if (window.qyToast) {
            qyToast("That did not match. Check the e-mail and the password.", "warn");
        }
        return;
    }
    if (window.qyToast) {
        qyToast("Welcome back, " + result.name.split(" ")[0] + ".");
    }
    location.href = "profile.html";
});

qyWatchFields(SIGNUP);
qyWatchFields(LOGIN);
knownCount();

if (qyUser()) {
    const panel = document.getElementById("signup-done");
    document.getElementById("signup-form").hidden = true;
    document.getElementById("signup-done-title").textContent = "You are already logged in, " + qyUser().name.split(" ")[0] + ".";
    document.getElementById("signup-done-text").textContent = "Open your aviary, or log out from the menu to use another account.";
    panel.hidden = false;
}
