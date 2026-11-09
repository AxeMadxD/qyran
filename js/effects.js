(function ($) {
    const NAV_SPACE = 90;
    const FADE = 220;

    function scroller() {
        return $(document.scrollingElement || document.documentElement);
    }

    function quietFocus(element) {
        if (!element) {
            return;
        }
        element.setAttribute("tabindex", "-1");
        element.focus({ preventScroll: true });
    }

    function samePage(link) {
        const href = link.getAttribute("href");
        if (!href || href === "#" || href.indexOf("#") === -1) {
            return false;
        }
        const parts = href.split("#");
        const page = parts[0];
        if (page && page !== location.pathname.split("/").pop()) {
            return false;
        }
        return document.getElementById(parts[1]) !== null;
    }

    $(document).on("click", "a[href*='#']", function (event) {
        if (!samePage(this)) {
            return;
        }
        const id = this.getAttribute("href").split("#")[1];
        const target = $("#" + id);
        if (!target.length) {
            return;
        }
        event.preventDefault();
        const menu = $(".navbar-collapse.show");
        if (menu.length && window.bootstrap) {
            bootstrap.Collapse.getOrCreateInstance(menu[0]).hide();
        }
        scroller().stop(true, true).animate({ scrollTop: Math.max(0, target.offset().top - NAV_SPACE) }, 500, function () {
            if (history.replaceState) {
                history.replaceState(null, "", "#" + id);
            }
            quietFocus(target.get(0));
        });
    });

    const top = $("<button>", {
        type: "button",
        class: "qy-top",
        "aria-label": "Back to the top of the page",
        html: "<span aria-hidden=\"true\">↑</span>"
    }).appendTo("body").hide();

    let topShown = false;

    function watchTop() {
        const want = $(window).scrollTop() > 500;
        if (want === topShown) {
            return;
        }
        topShown = want;
        top.stop(true, true);
        if (want) {
            top.fadeIn(FADE);
        } else {
            top.fadeOut(FADE);
        }
    }

    top.on("click", function () {
        scroller().stop(true, true).animate({ scrollTop: 0 }, 450, function () {
            quietFocus($(".qy-brand").get(0));
        });
    });

    $(window).on("scroll", watchTop);
    watchTop();

    const layer = $("<div>", { class: "qy-light", "aria-hidden": "true" }).hide().appendTo("body");
    const back = $("<div>", { class: "qy-light__back" }).appendTo(layer);
    let openShot = null;
    let openFigure = null;

    function closeShot() {
        if (!openShot) {
            return;
        }
        const shot = openShot;
        const figure = openFigure;
        openShot = null;
        openFigure = null;
        const image = figure ? figure.find("img").first() : null;
        back.stop(true, true).fadeOut(FADE);
        if (!image || !image.length || !image.is(":visible")) {
            shot.stop(true, true).fadeOut(FADE, function () {
                $(this).remove();
                layer.hide().attr("aria-hidden", "true");
            });
            return;
        }
        const box = image.offset();
        shot.stop(true, true).animate({
            left: box.left,
            top: box.top,
            width: image.outerWidth(),
            height: image.outerHeight(),
            opacity: 0
        }, 320, function () {
            $(this).remove();
            layer.hide().attr("aria-hidden", "true");
        });
    }

    $(document).on("click", ".qy-zoom img", function (event) {
        event.preventDefault();
        const image = $(this);
        const figure = image.closest(".qy-zoom");
        if (openShot) {
            closeShot();
        }

        const box = image.offset();
        const caption = figure.find("figcaption").text() || image.attr("alt") || "";
        const shot = $("<figure>", { class: "qy-light__shot" }).css({
            left: box.left,
            top: box.top,
            width: image.outerWidth(),
            height: image.outerHeight()
        });
        $("<img>", { src: image.attr("src"), alt: image.attr("alt") || "" }).appendTo(shot);
        if (caption) {
            $("<figcaption>", { text: caption }).appendTo(shot);
        }
        $("<button>", { type: "button", class: "qy-light__close", text: "Close", "aria-label": "Close the photo" }).appendTo(shot);

        layer.show().attr("aria-hidden", "false").css({ height: $(document).height() });
        shot.appendTo(layer);

        const maxWidth = Math.min($(window).width() - 48, 880);
        const ratio = (image.get(0).naturalHeight || 3) / (image.get(0).naturalWidth || 4);
        const width = maxWidth;
        const height = Math.min(Math.round(width * ratio), $(window).height() - 140);
        const left = $(window).scrollLeft() + ($(window).width() - width) / 2;
        const shotTop = $(window).scrollTop() + Math.max(24, ($(window).height() - height - 60) / 2);

        back.stop(true, true).css({ height: $(document).height() }).fadeIn(FADE);
        shot.stop(true, true).animate({ left: left, top: shotTop, width: width, height: height }, 380, function () {
            shot.find(".qy-light__close").trigger("focus");
        });

        openShot = shot;
        openFigure = figure;
    });

    layer.on("click", function (event) {
        if (!$(event.target).closest(".qy-light__shot").length || $(event.target).is(".qy-light__close")) {
            closeShot();
        }
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape") {
            closeShot();
        }
    });

    $(document).on("click", ".qy-acc__head", function () {
        const head = $(this);
        const panel = head.next(".qy-acc__panel");
        const open = head.attr("aria-expanded") === "true";
        const group = head.closest(".qy-acc");

        group.find(".qy-acc__head").not(head).attr("aria-expanded", "false")
            .next(".qy-acc__panel").stop(true, true).slideUp(260);

        head.attr("aria-expanded", open ? "false" : "true");
        panel.stop(true, true).slideToggle(300);
    });

    function group(value) {
        return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
    }

    function countUp(element) {
        const node = $(element);
        if (node.data("counted")) {
            return;
        }
        node.data("counted", true);
        const target = Number(node.attr("data-count"));
        const suffix = node.attr("data-suffix") || "";
        $({ value: 0 }).animate({ value: target }, {
            duration: 900,
            easing: "swing",
            step: function (now) {
                node.text(group(Math.round(now)) + suffix);
            },
            complete: function () {
                node.text(group(target) + suffix);
            }
        });
    }

    function watchCounters() {
        const bottom = $(window).scrollTop() + $(window).height();
        $("[data-count]").each(function () {
            if ($(this).offset().top < bottom - 40) {
                countUp(this);
            }
        });
    }

    $(window).on("scroll", watchCounters);
    watchCounters();

    const toast = $("<div>", { class: "qy-toast", role: "status", "aria-live": "polite" }).hide().appendTo("body");

    window.qyToast = function (message, kind) {
        toast.stop(true, true)
            .removeClass("qy-toast--ok qy-toast--warn")
            .addClass(kind === "warn" ? "qy-toast--warn" : "qy-toast--ok")
            .text(message)
            .slideDown(260)
            .delay(4200)
            .slideUp(260);
    };
}(jQuery));
