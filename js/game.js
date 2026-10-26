const LIVES = 3;
const WIN_STREAK = 10;
const UNIT = "cm";

const BIRDS = [
    { name: "Himalayan griffon", latin: "Gyps himalayensis", span: 300 },
    { name: "Cinereous vulture", latin: "Aegypius monachus", span: 290 },
    { name: "Bearded vulture", latin: "Gypaetus barbatus", span: 280 },
    { name: "White-tailed eagle", latin: "Haliaeetus albicilla", span: 240 },
    { name: "Golden eagle", latin: "Aquila chrysaetos", span: 230 },
    { name: "Steppe eagle", latin: "Aquila nipalensis", span: 215 },
    { name: "Imperial eagle", latin: "Aquila heliaca", span: 200 },
    { name: "Eurasian eagle owl", latin: "Bubo bubo", span: 180 },
    { name: "Osprey", latin: "Pandion haliaetus", span: 170 },
    { name: "Upland buzzard", latin: "Buteo hemilasius", span: 160 },
    { name: "Black kite", latin: "Milvus migrans", span: 155 },
    { name: "Saker falcon", latin: "Falco cherrug", span: 120 },
    { name: "Booted eagle", latin: "Hieraaetus pennatus", span: 120 },
    { name: "Northern goshawk", latin: "Accipiter gentilis", span: 115 },
    { name: "Peregrine falcon", latin: "Falco peregrinus", span: 110 },
    { name: "Long-eared owl", latin: "Asio otus", span: 100 },
    { name: "Short-eared owl", latin: "Asio flammeus", span: 100 },
    { name: "Common kestrel", latin: "Falco tinnunculus", span: 75 },
    { name: "Eurasian sparrowhawk", latin: "Accipiter nisus", span: 75 },
    { name: "Little owl", latin: "Athene noctua", span: 58 }
];

const state = {
    current: null,
    next: null,
    lives: LIVES,
    streak: 0,
    best: 0,
    phase: "guess",
    lastRight: false,
    won: false
};

const game = document.querySelector("#game");
const livesBox = document.querySelector("#lives");
const streakText = document.querySelector("#streak");
const bestText = document.querySelector("#best");
const goalText = document.querySelector("#goal");
const nextCard = document.querySelector("#next");
const nextTag = document.querySelector("#next-tag");
const widerButton = document.querySelector("#wider");
const narrowerButton = document.querySelector("#narrower");
const nextButton = document.querySelector("#next-bird");
const message = document.querySelector("#message");
const endTitle = document.querySelector("#end-title");
const endText = document.querySelector("#end-text");
const playAgainButton = document.querySelector("#play-again");
const restartButton = document.querySelector("#restart");

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBird(except) {
    let bird = BIRDS[randomInt(0, BIRDS.length - 1)];
    while (bird === except && BIRDS.length > 1) {
        bird = BIRDS[randomInt(0, BIRDS.length - 1)];
    }
    return bird;
}

function say(text, tone) {
    message.textContent = text;
    message.classList.remove("game__message--good", "game__message--bad", "game__message--warn");
    if (tone) {
        message.classList.add("game__message--" + tone);
    }
}

function startGame() {
    state.lives = LIVES;
    state.streak = 0;
    state.phase = "guess";
    state.lastRight = false;
    state.won = false;
    state.current = pickBird(null);
    state.next = pickBird(state.current);
    say("New game. Is the next bird wider or narrower than the " + state.current.name.toLowerCase() + "?");
    show();
}

function guess(direction) {
    if (state.phase === "over") {
        say("The game is over. Press Play again to start a new one.", "warn");
        return;
    }
    if (state.phase === "reveal") {
        say("You already guessed this bird. Press Next bird first, this click was not counted.", "warn");
        return;
    }
    if (direction !== "wider" && direction !== "narrower") {
        say("Only wider or narrower can be chosen.", "warn");
        return;
    }

    const a = state.current.span;
    const b = state.next.span;
    const same = a === b;
    const right = same || (direction === "wider" && b > a) || (direction === "narrower" && b < a);
    const record = right && state.streak + 1 > state.best;

    if (right) {
        state.streak += 1;
    } else {
        state.lives -= 1;
        state.streak = 0;
    }
    if (record) {
        state.best = state.streak;
    }
    state.lastRight = right;
    state.phase = "reveal";

    const compare = state.next.name + " " + b + " " + UNIT + ", " + state.current.name.toLowerCase() + " " + a + " " + UNIT + ".";

    if (right && state.streak === WIN_STREAK) {
        state.phase = "over";
        state.won = true;
        say("Right again: " + compare + " That is " + WIN_STREAK + " in a row.", "good");
    } else if (!right && state.lives === 0) {
        state.phase = "over";
        state.won = false;
        say("Wrong: " + compare + " That was the last life.", "bad");
    } else if (same) {
        say("The same wingspan: " + compare + " Equal counts as a right guess.", "good");
    } else if (right && record) {
        say("Right: " + compare + " New best streak!", "good");
    } else if (right) {
        say("Right: " + compare, "good");
    } else {
        say("Wrong: " + compare + " You lose one life.", "bad");
    }

    show();

    if (state.phase === "over") {
        playAgainButton.focus();
    }
}

function nextRound() {
    if (state.phase === "over") {
        say("The game is over. Press Play again to start a new one.", "warn");
        return;
    }
    if (state.phase === "guess") {
        say("First guess: wider or narrower. The next bird comes after that.", "warn");
        return;
    }

    state.current = state.next;
    state.next = pickBird(state.current);
    state.phase = "guess";
    say("Is the next bird wider or narrower than the " + state.current.name.toLowerCase() + "?");
    show();
}

function fillCard(prefix, bird, showSpan) {
    document.querySelector("#" + prefix + "-name").textContent = bird.name;
    document.querySelector("#" + prefix + "-latin").textContent = bird.latin;
    document.querySelector("#" + prefix + "-span").textContent = showSpan ? bird.span + " " + UNIT : "? " + UNIT;
}

function showLives() {
    livesBox.replaceChildren();
    for (let i = 0; i < LIVES; i++) {
        const life = document.createElement("span");
        life.classList.add("life");
        if (i >= state.lives) {
            life.classList.add("life--lost");
        }
        livesBox.append(life);
    }
    livesBox.setAttribute("aria-label", state.lives + " of " + LIVES + " lives left");
}

function lock(button, locked) {
    button.setAttribute("aria-disabled", locked ? "true" : "false");
}

function show() {
    const guessing = state.phase === "guess";
    const over = state.phase === "over";

    showLives();
    streakText.textContent = state.streak;
    bestText.textContent = state.best;
    goalText.textContent = WIN_STREAK;

    fillCard("current", state.current, true);
    fillCard("next", state.next, !guessing);
    nextTag.textContent = guessing ? "Next bird" : (state.lastRight ? "Right guess" : "Wrong guess");
    nextCard.classList.toggle("bird-card--hidden", guessing);
    nextCard.classList.toggle("bird-card--right", !guessing && state.lastRight);
    nextCard.classList.toggle("bird-card--wrong", !guessing && !state.lastRight);

    lock(widerButton, !guessing);
    lock(narrowerButton, !guessing);
    lock(nextButton, guessing || over);

    game.classList.toggle("game--won", over && state.won);
    game.classList.toggle("game--lost", over && !state.won);

    if (over && state.won) {
        endTitle.textContent = "You won";
        endText.textContent = WIN_STREAK + " right guesses in a row. Our falconers would trust you with the measuring tape.";
    } else if (over) {
        endTitle.textContent = "No lives left";
        endText.textContent = "Your best streak so far is " + state.best + ". The goal is " + WIN_STREAK + " in a row.";
    }
}

widerButton.addEventListener("click", () => guess("wider"));
narrowerButton.addEventListener("click", () => guess("narrower"));
nextButton.addEventListener("click", nextRound);
playAgainButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }
    if (event.key === "ArrowUp") {
        event.preventDefault();
        guess("wider");
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        guess("narrower");
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextRound();
    }
});

startGame();
