const COLOR_NAMES = ["red", "blue", "yellow", "green"];
const COLOR_HEX = {
  red: "#FF2A6D",
  blue: "#05D9E8",
  yellow: "#FFDD00",
  green: "#00F59B",
  white: "#F0F4F8"
};
const tierNames = [
  "Tier 1: Fundamentals",
  "Tier 2: Kinetic Momentum",
  "Tier 3: Chroma Shift",
  "Tier 4: The Ascendant Towers",
  "Tier 5: Color Carpets & Gauntlet"
];
const levelTitles = {
  1: "First Spectrum",
  2: "Chroma Step",
  3: "Tricolor Arch",
  4: "Quad Split",
  5: "Prism Drop",
  6: "Harmonic Bridge",
  7: "Color Drift",
  8: "Twin Leap",
  9: "Spectrum Run",
  10: "Tier 1 Apex",
  11: "Kinetic Drift",
  12: "Oscillation",
  13: "Shifting Rails",
  14: "Moving Hue",
  15: "Synchrony",
  16: "Dynamic Spire",
  17: "Pendulum",
  18: "Orbit Path",
  19: "Velocity Step",
  20: "Tier 2 Apex",
  21: "Chroma Pulse",
  22: "Phase Shift",
  23: "Rhythm Weaver",
  24: "Color Wave",
  25: "Strobe Canyon",
  26: "Prism Flicker",
  27: "Tempo Jump",
  28: "Chromatic Beat",
  29: "Shift Cascade",
  30: "Tier 3 Apex",
  31: "Spire of Red",
  32: "Azure Ascent",
  33: "Amber Zenith",
  34: "Emerald Pinnacle",
  35: "Skyward Prism",
  36: "Tower of Vertigo",
  37: "Bouncing Summit",
  38: "The High Pillar",
  39: "Towering Heights",
  40: "Tier 4 Apex",
  41: "Runway Sprint",
  42: "Color Carpet 01",
  43: "Prismatic Highway",
  44: "Carpet Rush",
  45: "Rapid Sequence",
  46: "The Gauntlet Walk",
  47: "Chroma Torrent",
  48: "Infinity Floor",
  49: "Pre-Ascension",
  50: "THE MASTER PRISM"
};
const gameLevels = [];
function makeLevels() {
  for (let id = 1; id <= 50; id++) {
    let tier = Math.ceil(id / 10);
    let title = levelTitles[id] || ("Sector " + id);
    let lvl = {
      id: id,
      tier: tier,
      tierName: tierNames[tier - 1],
      name: title,
      timeLimit: 25 + tier * 5,
      targetTime: 12 + tier * 3,
      spawn: { x: 70, y: 500, color: "red" },
      portal: { x: 1080, y: 440 },
      platforms: [],
      hazards: [],
      bouncePads: []
    };
    if (id === 1) {
      lvl.spawn = { x: 70, y: 500, color: "red" };
      lvl.portal = { x: 1040, y: 450 };
      lvl.platforms = [
        { x: 30, y: 560, w: 130, h: 25, color: "white" },
        { x: 220, y: 510, w: 90, h: 22, color: "red" },
        { x: 390, y: 460, w: 90, h: 22, color: "blue" },
        { x: 560, y: 460, w: 90, h: 22, color: "red" },
        { x: 730, y: 490, w: 90, h: 22, color: "blue" },
        { x: 910, y: 510, w: 140, h: 28, color: "white" }
      ];
    } else if (id === 2) {
      lvl.spawn = { x: 70, y: 520, color: "red" };
      lvl.portal = { x: 1050, y: 440 };
      lvl.platforms = [
        { x: 30, y: 580, w: 120, h: 25, color: "white" },
        { x: 210, y: 520, w: 85, h: 22, color: "red" },
        { x: 380, y: 465, w: 80, h: 22, color: "blue" },
        { x: 550, y: 410, w: 80, h: 22, color: "yellow" },
        { x: 720, y: 450, w: 80, h: 22, color: "blue" },
        { x: 880, y: 490, w: 80, h: 22, color: "red" },
        { x: 1020, y: 500, w: 130, h: 28, color: "white" }
      ];
    } else if (id === 3) {
      lvl.spawn = { x: 70, y: 540, color: "red" };
      lvl.portal = { x: 1040, y: 430 };
      lvl.platforms = [
        { x: 30, y: 600, w: 120, h: 25, color: "white" },
        { x: 205, y: 540, w: 80, h: 22, color: "red" },
        { x: 365, y: 480, w: 75, h: 22, color: "blue" },
        { x: 525, y: 420, w: 75, h: 22, color: "yellow" },
        { x: 690, y: 440, w: 75, h: 22, color: "green" },
        { x: 855, y: 480, w: 75, h: 22, color: "yellow" },
        { x: 1000, y: 490, w: 130, h: 28, color: "white" }
      ];
    } else if (id === 4) {
      lvl.spawn = { x: 70, y: 500, color: "red" };
      lvl.portal = { x: 1040, y: 420 };
      lvl.platforms = [
        { x: 30, y: 560, w: 120, h: 25, color: "white" },
        { x: 210, y: 500, w: 75, h: 22, color: "red" },
        { x: 370, y: 450, w: 75, h: 22, color: "red" },
        { x: 210, y: 560, w: 75, h: 22, color: "blue" },
        { x: 370, y: 520, w: 75, h: 22, color: "blue" },
        { x: 530, y: 460, w: 80, h: 22, color: "yellow" },
        { x: 700, y: 420, w: 75, h: 22, color: "green" },
        { x: 860, y: 450, w: 75, h: 22, color: "blue" },
        { x: 1000, y: 460, w: 130, h: 28, color: "white" }
      ];
    } else if (id === 5) {
      lvl.spawn = { x: 80, y: 260, color: "red" };
      lvl.portal = { x: 1030, y: 420 };
      lvl.platforms = [
        { x: 30, y: 320, w: 120, h: 25, color: "white" },
        { x: 200, y: 380, w: 75, h: 22, color: "red" },
        { x: 360, y: 440, w: 75, h: 22, color: "blue" },
        { x: 520, y: 490, w: 75, h: 22, color: "yellow" },
        { x: 680, y: 450, w: 75, h: 22, color: "green" },
        { x: 840, y: 480, w: 75, h: 22, color: "red" },
        { x: 1000, y: 480, w: 130, h: 28, color: "white" }
      ];
    } else if (id === 6) {
      lvl.spawn = { x: 70, y: 500, color: "red" };
      lvl.portal = { x: 1090, y: 430 };
      lvl.platforms = [
        { x: 30, y: 560, w: 120, h: 25, color: "white" },
        { x: 195, y: 505, w: 75, h: 22, color: "red" },
        { x: 345, y: 445, w: 75, h: 22, color: "blue" },
        { x: 500, y: 390, w: 80, h: 22, color: "yellow" },
        { x: 660, y: 405, w: 75, h: 22, color: "green" },
        { x: 810, y: 450, w: 75, h: 22, color: "red" },
        { x: 955, y: 490, w: 75, h: 22, color: "blue" },
        { x: 1060, y: 490, w: 130, h: 28, color: "white" }
      ];
    } else if (tier === 1) {
      lvl.spawn = { x: 70, y: 500, color: "red" };
      lvl.portal = { x: 1060, y: 430 };
      lvl.platforms.push({ x: 30, y: 560, w: 110, h: 25, color: "white" });
      let stepCount = 6 + (id - 6);
      let spacing = 780 / stepCount;
      let width = 74 - (id - 6) * 3;
      for (let i = 0; i < stepCount; i++) {
        let col = COLOR_NAMES[i % 4];
        let y = 505 - Math.sin((i / (stepCount - 1)) * Math.PI) * 115;
        lvl.platforms.push({
          x: 180 + i * spacing,
          y: Math.round(y),
          w: width,
          h: 22,
          color: col
        });
      }
      lvl.platforms.push({ x: 1010, y: 490, w: 130, h: 28, color: "white" });
    } else if (tier === 2) {
      lvl.spawn = { x: 70, y: 460, color: "blue" };
      lvl.portal = { x: 1060, y: 360 };
      lvl.platforms.push({ x: 30, y: 520, w: 110, h: 25, color: "white" });
      let moveCount = 5 + (id - 10) % 3;
      let spacing = 760 / moveCount;
      for (let i = 0; i < moveCount; i++) {
        let col = COLOR_NAMES[(i + 1) % 4];
        let isVert = i % 2 === 1;
        lvl.platforms.push({
          x: 180 + i * spacing,
          y: 460 - (i % 2 === 0 ? 0 : 40),
          w: 75,
          h: 22,
          color: col,
          move: {
            dx: isVert ? 0 : 36 + (id - 10) * 3,
            dy: isVert ? 36 + (id - 10) * 3 : 0,
            speed: 1.4 + (id - 10) * 0.07,
            phase: i * 1.3
          }
        });
      }
      lvl.platforms.push({ x: 990, y: 420, w: 130, h: 28, color: "white" });
    } else if (tier === 3) {
      lvl.spawn = { x: 70, y: 500, color: "yellow" };
      lvl.portal = { x: 1060, y: 320 };
      lvl.platforms.push({ x: 30, y: 560, w: 110, h: 25, color: "white" });
      let count = 6 + (id - 20) % 3;
      let spacing = 760 / count;
      for (let i = 0; i < count; i++) {
        let p = {
          x: 180 + i * spacing,
          y: 490 - i * 30,
          w: 72,
          h: 22,
          color: COLOR_NAMES[i % 4],
          colorCycle: ["red", "blue", "yellow", "green"],
          cycleInterval: Math.max(1.4, 2.0 - ((id - 20) * 0.06)),
          cyclePhase: i * 0.7
        };
        lvl.platforms.push(p);
      }
      if (id >= 25) {
        lvl.bouncePads.push({ x: 500, y: 430, w: 35, h: 14, force: 720 });
      }
      lvl.platforms.push({ x: 990, y: 370, w: 130, h: 28, color: "white" });
    } else if (tier === 4) {
      lvl.spawn = { x: 80, y: 640, color: "green" };
      lvl.portal = { x: 520, y: 130 };
      lvl.platforms.push({ x: 30, y: 700, w: 140, h: 25, color: "white" });
      for (let f = 0; f < 8; f++) {
        let isLeft = f % 2 === 0;
        lvl.platforms.push({
          x: isLeft ? 430 : 610,
          y: 640 - f * 52,
          w: 80,
          h: 20,
          color: COLOR_NAMES[f % 4]
        });
        if (f === 2 || f === 5) {
          lvl.platforms.push({
            x: 520,
            y: 640 - f * 52,
            w: 60,
            h: 18,
            color: COLOR_NAMES[(f + 2) % 4],
            move: { dx: 0, dy: 30, speed: 1.8, phase: f }
          });
        }
      }
      lvl.bouncePads.push({ x: 200, y: 690, w: 35, h: 12, force: 660 });
      if (id >= 35) {
        lvl.bouncePads.push({ x: 440, y: 350, w: 35, h: 12, force: 720 });
      }
      lvl.platforms.push({ x: 450, y: 190, w: 140, h: 25, color: "white" });
    } else {
      lvl.spawn = { x: 60, y: 460, color: "red" };
      lvl.portal = { x: 1080, y: 300 };
      lvl.platforms.push({ x: 20, y: 520, w: 110, h: 25, color: "white" });
      let segCount = 6 + (id - 40);
      for (let s = 0; s < segCount; s++) {
        lvl.platforms.push({
          x: 160 + s * 74,
          y: 500 - s * 10,
          w: 55,
          h: 20,
          color: COLOR_NAMES[s % 4],
          isCarpet: true
        });
      }
      let midX = 160 + segCount * 74;
      lvl.platforms.push({
        x: midX + 30,
        y: 430,
        w: 70,
        h: 22,
        color: "yellow",
        move: { dx: 40, dy: 30, speed: 2.0, phase: 0 }
      });
      lvl.platforms.push({
        x: midX + 160,
        y: 380,
        w: 70,
        h: 22,
        color: "green",
        colorCycle: ["red", "blue", "yellow", "green"],
        cycleInterval: 1.4,
        cyclePhase: 1
      });
      if (id === 50) {
        lvl.name = "Sector 50: The Master Prism Gauntlet";
        lvl.timeLimit = 50;
        lvl.targetTime = 22;
        lvl.bouncePads.push({ x: 90, y: 510, w: 35, h: 12, force: 760 });
      }
      lvl.platforms.push({ x: 1010, y: 360, w: 130, h: 28, color: "white" });
    }
    gameLevels.push(lvl);
  }
}
makeLevels();
window.gameLevels = gameLevels;
window.levelManager = {
  levels: gameLevels
};
window.COLOR_NAMES = COLOR_NAMES;
window.COLOR_HEX = COLOR_HEX;