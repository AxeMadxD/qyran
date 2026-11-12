(function () {
    const KEY = "qyran:mode";
    const root = document.documentElement;
    const button = document.getElementById("qyMode");

    function saved() {
        try {
            return localStorage.getItem(KEY);
        } catch (error) {
            return null;
        }
    }

    function remember(mode) {
        try {
            localStorage.setItem(KEY, mode);
        } catch (error) {
            return;
        }
    }

    function current() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function apply(mode) {
        root.setAttribute("data-theme", mode);
        root.setAttribute("data-bs-theme", mode);
        if (button) {
            button.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
        }
    }

    apply(current());

    if (button) {
        button.addEventListener("click", function () {
            const next = current() === "dark" ? "light" : "dark";
            apply(next);
            remember(next);
            if (window.qyToast) {
                qyToast(next === "dark"
                    ? "Dark mode on. Every page will stay dark on this device."
                    : "Light mode on. Every page will stay light on this device.");
            }
        });
    }

    const system = window.matchMedia("(prefers-color-scheme: dark)");
    system.addEventListener("change", function (event) {
        if (!saved()) {
            apply(event.matches ? "dark" : "light");
        }
    });
}());
