
const Dungeons = [
    {
        name: "오닉시아의 둥지",
        shortName: "오닉",
        reset: 5,
        opened:'2020-01-05',
        max: 40,
        className:"badge badge-warning mr-1"
    },
    {
        name: "화산 심장부",
        shortName: "화심",
        reset: 7,
        opened: '2020-01-02',
        max: 40,
        className: "badge badge-danger mr-1"
    },
    {
        name: "검은날개 둥지",
        shortName: "검둥",
        reset: 7,
        opened: '2020-02-13',
        max: 40,
        className: "badge badge-light mr-1"
    },
    {
        name: "줄구룹",
        shortName: "줄구룹",
        reset: 3,
        opened: '2020-04-17',
        max: 20,
        className: "badge badge-info mr-1"
    },
    {
        name: "안퀴라즈 사원",
        shortName: "사원",
        max: 40
    },
    {
        name: "안퀴라즈 폐허",
        shortName: "폐허",
        max: 20
    },
    {
        name: "낙스라마스",
        shortName: "낙스",
        max: 40
    },
    {
        name: "예정",
        shortName: "예정"
    }
]

const Classes = [
    {
        name: "전사",
        color: "#C79C6E",
        css: 'wow-warrior',
        icon: '/images/class/warrior.png',
        order: 1,
        enName: "Warrior"
    },
    {
        name: "사제",
        color: "#FFFFFF",
        css: 'wow-priest',
        icon: '/images/class/priest.png',
        order: 2,
        enName: "Priest"
    },
    {
        name: "마법사",
        color: "#40C7EB",
        css: 'wow-mage',
        icon: '/images/class/mage.png',
        order: 3,
        enName: "Mage"
    },
    {
        name: "도적",
        color: "#FFF569",
        css: 'wow-rogue',
        icon: '/images/class/rogue.png',
        order: 4,
        enName: "Rogue"
    },
    {
        name: "사냥꾼",
        color: "#A9D271",
        css: 'wow-hunter',
        icon: '/images/class/hunter.png',
        order: 5,
        enName: "Hunter"
    },
    {
        name: "흑마법사",
        color: "#8787ED",
        css: 'wow-warlock',
        icon: '/images/class/warlock.png',
        order: 6,
        enName: "Warlock"
    },
    {
        name: "주술사",
        color: "#0070DE",
        css: 'wow-shaman',
        icon: '/images/class/shaman.png',
        order: 7,
        enName: "Shaman"
    },
    {
        name: "드루이드",
        color: "#FF7D0A",
        css: 'wow-druid',
        icon: '/images/class/druid.png',
        order: 8,
        enName: "Druid"
    }
]

function cooperToGold(c) {
    const g = Math.floor(c / (100*100))
    return c == 0 ? " - " :  `${g} 골`
}

export {
    Dungeons, Classes, cooperToGold
}