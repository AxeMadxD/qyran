const BIRDS = [
    {
        id: "kok",
        name: "Kok",
        kk: "Көк",
        species: "Black kite",
        latin: "Milvus migrans",
        status: "critical",
        stage: "Hospital box",
        admitted: "2026-09-30",
        reason: "Lead poisoning from a shot carcass",
        wingspan: 150,
        weight: 760,
        photo: null,
        alt: "",
        monthly: 9000,
        note: "On a drip, in the dark, nobody photographs him. The next blood test is on Monday."
    },
    {
        id: "saryq",
        name: "Saryq",
        kk: "Сарық",
        species: "Upland buzzard",
        latin: "Buteo hemilasius",
        status: "critical",
        stage: "Hospital box",
        admitted: "2026-10-09",
        reason: "Power line, burns on both feet",
        wingspan: 160,
        weight: 1600,
        photo: null,
        alt: "",
        monthly: 9000,
        note: "The feet are the problem: a bird of prey that cannot grip cannot hunt."
    },
    {
        id: "altyn",
        name: "Altyn",
        kk: "Алтын",
        species: "Imperial eagle",
        latin: "Aquila heliaca",
        status: "care",
        stage: "Quiet aviary",
        admitted: "2026-06-12",
        reason: "Found under a power line near Uryl with burned primaries",
        wingspan: 200,
        weight: 3100,
        photo: "images/imperial-eagle.jpg",
        alt: "Portrait of an eastern imperial eagle with a golden nape",
        monthly: 18000,
        note: "Waiting for the autumn moult to grow the feathers back. Until then he cannot be released."
    },
    {
        id: "qyz",
        name: "Qyz",
        kk: "Қыз",
        species: "Saker falcon",
        latin: "Falco cherrug",
        status: "care",
        stage: "Flight corridor",
        admitted: "2026-04-28",
        reason: "Confiscated from a car at the border",
        wingspan: 115,
        weight: 980,
        photo: "images/saker.jpg",
        alt: "A saker falcon with a pale head",
        monthly: 9000,
        note: "Hunts live prey again. The hardest part was teaching her to be afraid of people."
    },
    {
        id: "kishkentai",
        name: "Kishkentai",
        kk: "Кішкентай",
        species: "Little owl",
        latin: "Athene noctua",
        status: "care",
        stage: "Hospital box",
        admitted: "2026-09-21",
        reason: "Car collision, concussion",
        wingspan: 56,
        weight: 170,
        photo: "images/owl-care.jpg",
        alt: "A small owl on a handler's glove",
        monthly: 3000,
        note: "Eats by herself since the fourth day. The dizziness is almost gone."
    },
    {
        id: "zhuldyz",
        name: "Zhuldyz",
        kk: "Жұлдыз",
        species: "Eagle owl",
        latin: "Bubo bubo",
        status: "care",
        stage: "Quiet aviary",
        admitted: "2026-08-15",
        reason: "Flew into a barbed wire fence, deep cut in the wing",
        wingspan: 162,
        weight: 2400,
        photo: null,
        alt: "",
        monthly: 12000,
        note: "The wound is closed. Now she has to learn to fly silently again, which takes months."
    },
    {
        id: "sary",
        name: "Sary",
        kk: "Сары",
        species: "Common kestrel",
        latin: "Falco tinnunculus",
        status: "care",
        stage: "Behind the screen",
        admitted: "2026-07-19",
        reason: "One of the three chicks from the Berel roof repair",
        wingspan: 70,
        weight: 180,
        photo: null,
        alt: "",
        monthly: 3000,
        note: "She must not see a human face before the release, so there is no photo of her."
    },
    {
        id: "tobe",
        name: "Tobe",
        kk: "Төбе",
        species: "Common kestrel",
        latin: "Falco tinnunculus",
        status: "care",
        stage: "Behind the screen",
        admitted: "2026-07-19",
        reason: "One of the three chicks from the Berel roof repair",
        wingspan: 71,
        weight: 185,
        photo: null,
        alt: "",
        monthly: 3000,
        note: "Fed through a hatch with a glove that looks nothing like a hand."
    },
    {
        id: "kishi",
        name: "Kishi",
        kk: "Кіші",
        species: "Common kestrel",
        latin: "Falco tinnunculus",
        status: "care",
        stage: "Behind the screen",
        admitted: "2026-07-19",
        reason: "One of the three chicks from the Berel roof repair",
        wingspan: 68,
        weight: 172,
        photo: null,
        alt: "",
        monthly: 3000,
        note: "The smallest of the three and the loudest. Release is planned for May."
    },
    {
        id: "zhel",
        name: "Zhel",
        kk: "Жел",
        species: "Steppe eagle",
        latin: "Aquila nipalensis",
        status: "ready",
        stage: "Flight corridor",
        admitted: "2026-03-02",
        reason: "A young male starving after his first autumn",
        wingspan: 195,
        weight: 3000,
        photo: "images/steppe-eagle.jpg",
        alt: "A steppe eagle standing on dry ground",
        monthly: 18000,
        note: "Takes live prey in the corridor and goes back to the steppe in two weeks."
    },
    {
        id: "boran",
        name: "Boran",
        kk: "Боран",
        species: "Common kestrel",
        latin: "Falco tinnunculus",
        status: "ready",
        stage: "Flight corridor",
        admitted: "2026-07-19",
        reason: "Nest lost during a roof repair in Berel",
        wingspan: 72,
        weight: 190,
        photo: "images/kestrel.jpg",
        alt: "A common kestrel perched on a branch",
        monthly: 3000,
        note: "The oldest of the four chicks, and the first one ready to go."
    },
    {
        id: "aqtas",
        name: "Aqtas",
        kk: "Ақтас",
        species: "Golden eagle",
        latin: "Aquila chrysaetos",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2022-04-18",
        reason: "Shot over the Bukhtarma valley, left wing amputated",
        wingspan: 210,
        weight: 4200,
        photo: "images/golden-eagle.jpg",
        alt: "Close-up portrait of a golden eagle",
        monthly: 24000,
        note: "He will never fly again, so he teaches instead: every school group in the valley has met him."
    },
    {
        id: "tuman",
        name: "Tuman",
        kk: "Тұман",
        species: "Eagle owl",
        latin: "Bubo bubo",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2021-09-02",
        reason: "Lost his left eye in a collision with a car",
        wingspan: 165,
        weight: 2600,
        photo: "images/eagle-owl.jpg",
        alt: "Portrait of a Eurasian eagle owl with orange eyes",
        monthly: 12000,
        note: "He cannot hunt at night any more, so he stays and meets every school group instead."
    },
    {
        id: "shoqan",
        name: "Shoqan",
        kk: "Шоқан",
        species: "Steppe eagle",
        latin: "Aquila nipalensis",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2019-05-23",
        reason: "Old fracture healed short, the left wing is 7 cm shorter",
        wingspan: 188,
        weight: 2900,
        photo: "images/steppe-eagle.jpg",
        alt: "A steppe eagle standing on dry ground",
        monthly: 18000,
        note: "The first bird the centre ever took in, and the reason the centre exists."
    },
    {
        id: "zheruiyq",
        name: "Zheruiyq",
        kk: "Жерұйық",
        species: "Imperial eagle",
        latin: "Aquila heliaca",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2023-02-07",
        reason: "Lead poisoning left nerve damage in one foot",
        wingspan: 198,
        weight: 2800,
        photo: "images/imperial-eagle.jpg",
        alt: "Portrait of an eastern imperial eagle with a golden nape",
        monthly: 18000,
        note: "He stands on one foot for hours. A wild eagle with one grip does not survive a winter."
    },
    {
        id: "bikesh",
        name: "Bikesh",
        kk: "Бикеш",
        species: "Saker falcon",
        latin: "Falco cherrug",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2020-08-30",
        reason: "Hand-raised by a family, tame and fearless of people",
        wingspan: 112,
        weight: 940,
        photo: "images/saker.jpg",
        alt: "A saker falcon with a pale head",
        monthly: 9000,
        note: "The most expensive mistake a kind family can make. She lands on strangers' heads."
    },
    {
        id: "qarlygash",
        name: "Qarlygash",
        kk: "Қарлығаш",
        species: "Black kite",
        latin: "Milvus migrans",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2023-07-11",
        reason: "Wing broken in three places, healed crooked",
        wingspan: 150,
        weight: 850,
        photo: null,
        alt: "",
        monthly: 3000,
        note: "She flies four metres and lands. Enough for the aviary, not enough for the valley."
    },
    {
        id: "kenes",
        name: "Kenes",
        kk: "Кеңес",
        species: "Upland buzzard",
        latin: "Buteo hemilasius",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2021-03-16",
        reason: "Lost three toes in a leg-hold trap",
        wingspan: 158,
        weight: 1500,
        photo: null,
        alt: "",
        monthly: 9000,
        note: "He is the bird the rangers show to hunters when they talk about traps."
    },
    {
        id: "aru",
        name: "Aru",
        kk: "Ару",
        species: "Long-eared owl",
        latin: "Asio otus",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2022-11-04",
        reason: "Blind in the right eye after a car collision",
        wingspan: 95,
        weight: 280,
        photo: null,
        alt: "",
        monthly: 3000,
        note: "Small enough to sit on a child's glove, which is exactly what she does on school days."
    },
    {
        id: "botagoz",
        name: "Botagoz",
        kk: "Ботакөз",
        species: "Little owl",
        latin: "Athene noctua",
        status: "resident",
        stage: "Resident aviary",
        admitted: "2024-06-21",
        reason: "Raised in a flat in Oskemen, cannot hunt",
        wingspan: 58,
        weight: 180,
        photo: "images/owl-care.jpg",
        alt: "A small owl on a handler's glove",
        monthly: 3000,
        note: "Two years in a cage with a mirror. She still talks to her reflection."
    }
];

const STATUS_NAMES = {
    care: "In care",
    ready: "Ready for release",
    critical: "Critical",
    resident: "Permanent resident"
};

const STATUS_SHORT = {
    care: "In care",
    ready: "Ready",
    critical: "Critical",
    resident: "Resident"
};

const LEVELS = [
    {
        id: "friend",
        name: "Friend",
        price: 3000,
        perks: ["Your name on the aviary board", "A photo report every month", "One free tour a year"]
    },
    {
        id: "keeper",
        name: "Keeper",
        price: 12000,
        perks: ["Everything from Friend", "Half of one bird's food", "The weight chart and the vet notes", "A visit on a closed day, with the falconer"]
    },
    {
        id: "guardian",
        name: "Guardian",
        price: 24000,
        perks: ["Everything from Keeper", "A whole month of food for one eagle", "Your name on the release report"]
    }
];

const EXTRAS = [
    { id: "quail", name: "Quail and day-old chicks", unit: "10 kg box", price: 9000 },
    { id: "vitamins", name: "Vitamin and calcium course", unit: "one course", price: 2400 },
    { id: "bedding", name: "Bedding and old towels", unit: "a month", price: 3100 },
    { id: "vet", name: "Vet check with an X-ray", unit: "one visit", price: 2300 },
    { id: "crate", name: "Transport crate for the rescue car", unit: "one crate", price: 45000 }
];

const SPEND = [
    { id: "meat", label: "Quail and day-old chicks", unit: "kg", cost: 900, share: 0.675 },
    { id: "vitamins", label: "Vitamins and calcium", unit: "courses", cost: 2400, share: 0.1 },
    { id: "bedding", label: "Bedding and aviary repair", unit: "days", cost: 103, share: 0.129 },
    { id: "vet", label: "Vet check with an X-ray", unit: "visits", cost: 2300, share: 0.096 }
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function money(value) {
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₸";
}

function shortDate(iso) {
    const parts = iso.split("-");
    if (parts.length < 3) {
        return parts[0];
    }
    return Number(parts[2]) + " " + MONTH_NAMES[Number(parts[1]) - 1] + " " + parts[0];
}

function daysHere(iso) {
    const from = new Date(iso + "T00:00:00");
    const today = new Date("2026-11-10T00:00:00");
    return Math.max(1, Math.round((today - from) / 86400000));
}

function birdById(id) {
    for (let i = 0; i < BIRDS.length; i++) {
        if (BIRDS[i].id === id) {
            return BIRDS[i];
        }
    }
    return null;
}

function countByStatus(status) {
    let n = 0;
    for (const bird of BIRDS) {
        if (bird.status === status) {
            n += 1;
        }
    }
    return n;
}
