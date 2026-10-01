const COLOR_NAMES = ['red', 'blue', 'yellow', 'green'];
const COLOR_HEX = {
  red: '#FF2A6D',
  blue: '#05D9E8',
  yellow: '#FFDD00',
  green: '#00F59B',
  white: '#F0F4F8'
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
      spawn: { x: 80, y: 520, color: 'red' },
      portal: { x: 1080, y: 220 },
      platforms: [],
      hazards: [],
      bouncePads: []
    };
    if (id === 1) {
      lvl.spawn = { x: 80, y: 500, color: 'red' };
      lvl.portal = { x: 1050, y: 460 };
      lvl.platforms = [
        { x: 40, y: 560, w: 200, h: 30, color: 'white' },
        { x: 300, y: 520, w: 160, h: 25, color: 'red' },
        { x: 540, y: 480, w: 160, h: 25, color: 'blue' },
        { x: 780, y: 480, w: 160, h: 25, color: 'red' },
        { x: 990, y: 520, w: 180, h: 30, color: 'white' }
      ];
    } else if (id === 2) {
      lvl.spawn = { x: 80, y: 520, color: 'red' };
      lvl.portal = { x: 1060, y: 380 };
      lvl.platforms = [
        { x: 40, y: 580, w: 180, h: 30, color: 'white' },
        { x: 280, y: 520, w: 140, h: 25, color: 'red' },
        { x: 480, y: 460, w: 140, h: 25, color: 'blue' },
        { x: 680, y: 400, w: 140, h: 25, color: 'yellow' },
        { x: 880, y: 400, w: 140, h: 25, color: 'blue' },
        { x: 1020, y: 440, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 3) {
      lvl.spawn = { x: 80, y: 540, color: 'red' };
      lvl.portal = { x: 1060, y: 300 };
      lvl.platforms = [
        { x: 40, y: 600, w: 160, h: 30, color: 'white' },
        { x: 260, y: 540, w: 130, h: 24, color: 'red' },
        { x: 450, y: 480, w: 130, h: 24, color: 'blue' },
        { x: 640, y: 420, w: 130, h: 24, color: 'yellow' },
        { x: 830, y: 360, w: 130, h: 24, color: 'green' },
        { x: 1010, y: 360, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 4) {
      lvl.spawn = { x: 80, y: 480, color: 'red' };
      lvl.portal = { x: 1060, y: 440 };
      lvl.platforms = [
        { x: 40, y: 540, w: 160, h: 30, color: 'white' },
        { x: 260, y: 380, w: 140, h: 24, color: 'red' },
        { x: 470, y: 340, w: 140, h: 24, color: 'red' },
        { x: 260, y: 520, w: 140, h: 24, color: 'blue' },
        { x: 470, y: 520, w: 140, h: 24, color: 'blue' },
        { x: 690, y: 440, w: 150, h: 24, color: 'yellow' },
        { x: 900, y: 460, w: 150, h: 24, color: 'green' },
        { x: 1010, y: 500, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 5) {
      lvl.spawn = { x: 100, y: 220, color: 'red' };
      lvl.portal = { x: 1060, y: 540 };
      lvl.platforms = [
        { x: 50, y: 280, w: 160, h: 30, color: 'white' },
        { x: 280, y: 340, w: 120, h: 24, color: 'red' },
        { x: 460, y: 420, w: 120, h: 24, color: 'blue' },
        { x: 640, y: 500, w: 120, h: 24, color: 'yellow' },
        { x: 820, y: 560, w: 130, h: 24, color: 'green' },
        { x: 1000, y: 600, w: 170, h: 30, color: 'white' }
      ];
    } else if (tier === 1) {
      lvl.spawn = { x: 70, y: 500, color: 'red' };
      lvl.portal = { x: 1060, y: 320 };
      lvl.platforms.push({ x: 30, y: 560, w: 140, h: 30, color: 'white' });
      let stepCount = 5 + (id - 5);
      let spacing = 780 / stepCount;
      for (let i = 0; i < stepCount; i++) {
        let col = COLOR_NAMES[i % 4];
        let y = 520 - Math.sin((i / stepCount) * Math.PI) * 200 + (i % 2 === 0 ? -20 : 20);
        lvl.platforms.push({
          x: 220 + i * spacing,
          y: Math.max(180, Math.min(600, y)),
          w: 100 - (id - 5) * 4,
          h: 22,
          color: col
        });
      }
      lvl.platforms.push({ x: 1010, y: 380, w: 160, h: 30, color: 'white' });
    } else if (tier === 2) {
      lvl.spawn = { x: 70, y: 480, color: 'blue' };
      lvl.portal = { x: 1060, y: 440 };
      lvl.platforms.push({ x: 30, y: 540, w: 140, h: 30, color: 'white' });
      let moveCount = 4 + (id - 10) % 4;
      for (let i = 0; i < moveCount; i++) {
        let col = COLOR_NAMES[(i + 1) % 4];
        let isVert = i % 2 === 1;
        lvl.platforms.push({
          x: 240 + i * 180,
          y: 420 + (i % 2 === 0 ? -40 : 40),
          w: 120,
          h: 24,
          color: col,
          move: {
            dx: isVert ? 0 : 70 + (id - 10) * 8,
            dy: isVert ? 80 + (id - 10) * 8 : 0,
            speed: 1.2 + (id - 10) * 0.1,
            phase: i * 1.1
          }
        });
      }
      lvl.hazards.push({ x: 200, y: 650, w: 800, h: 30, color: 'all' });
      lvl.platforms.push({ x: 1000, y: 500, w: 160, h: 30, color: 'white' });
    } else if (tier === 3) {
      lvl.spawn = { x: 80, y: 500, color: 'yellow' };
      lvl.portal = { x: 1050, y: 280 };
      lvl.platforms.push({ x: 30, y: 560, w: 150, h: 30, color: 'white' });
      let count = 5 + (id - 20) % 3;
      for (let i = 0; i < count; i++) {
        let p = {
          x: 230 + i * 150,
          y: 480 - i * 35,
          w: 110,
          h: 22,
          color: COLOR_NAMES[i % 4]
        };
        if (i % 2 === 0) {
          p.colorCycle = ['red', 'blue', 'yellow', 'green'];
          p.cycleInterval = 2.4 - ((id - 20) * 0.08);
          p.cyclePhase = i * 0.6;
        }
        lvl.platforms.push(p);
      }
      if (id >= 25) {
        lvl.bouncePads.push({ x: 540, y: 460, w: 40, h: 14, force: 720 });
      }
      lvl.platforms.push({ x: 990, y: 340, w: 170, h: 30, color: 'white' });
    } else if (tier === 4) {
      lvl.spawn = { x: 100, y: 640, color: 'green' };
      lvl.portal = { x: 600, y: 120 };
      lvl.platforms.push({ x: 40, y: 700, w: 200, h: 30, color: 'white' });
      for (let f = 0; f < 8; f++) {
        let isLeft = f % 2 === 0;
        lvl.platforms.push({
          x: isLeft ? 380 : 660,
          y: 620 - f * 65,
          w: 120,
          h: 20,
          color: COLOR_NAMES[f % 4]
        });
        if (f === 3 || f === 6) {
          lvl.platforms.push({
            x: 520,
            y: 620 - f * 65,
            w: 90,
            h: 18,
            color: COLOR_NAMES[(f + 2) % 4],
            move: { dx: 0, dy: 50, speed: 1.5, phase: f }
          });
        }
      }
      lvl.bouncePads.push({ x: 180, y: 690, w: 40, h: 12, force: 680 });
      if (id >= 35) {
        lvl.bouncePads.push({ x: 420, y: 320, w: 40, h: 12, force: 740 });
      }
      lvl.platforms.push({ x: 520, y: 180, w: 180, h: 25, color: 'white' });
    } else {
      lvl.spawn = { x: 60, y: 480, color: 'red' };
      lvl.portal = { x: 1080, y: 300 };
      lvl.platforms.push({ x: 20, y: 540, w: 120, h: 30, color: 'white' });
      let segCount = 6 + (id - 40);
      for (let s = 0; s < segCount; s++) {
        lvl.platforms.push({
          x: 160 + s * 80,
          y: 520 + Math.sin(s * 0.8) * 40,
          w: 74,
          h: 20,
          color: COLOR_NAMES[s % 4],
          isCarpet: true
        });
      }
      let midX = 160 + segCount * 80;
      lvl.platforms.push({
        x: midX + 60,
        y: 380,
        w: 100,
        h: 22,
        color: 'yellow',
        move: { dx: 60, dy: 60, speed: 1.8, phase: 0 }
      });
      lvl.platforms.push({
        x: midX + 220,
        y: 340,
        w: 100,
        h: 22,
        color: 'green',
        colorCycle: ['red', 'blue', 'yellow', 'green'],
        cycleInterval: 1.5,
        cyclePhase: 1
      });
      if (id === 50) {
        lvl.name = "Sector 50: The Master Prism Gauntlet";
        lvl.timeLimit = 50;
        lvl.targetTime = 22;
        lvl.bouncePads.push({ x: 100, y: 530, w: 40, h: 12, force: 800 });
        lvl.hazards.push({ x: 150, y: 680, w: 900, h: 40, color: 'all' });
      }
      lvl.platforms.push({ x: 1020, y: 360, w: 160, h: 30, color: 'white' });
    }
    gameLevels.push(lvl);
  }
}
makeLevels();
window.levelManager = {
  levels: gameLevels
};
