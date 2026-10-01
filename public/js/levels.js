// The Color - 50 Levels across 5 Difficulty Tiers
// Tier 1: Fundamentals (1-10)
// Tier 2: Kinetic Momentum (11-20)
// Tier 3: Chroma Shift (21-30)
// Tier 4: The Towers (31-40)
// Tier 5: Color Carpets & The Gauntlet (41-50)

const COLOR_NAMES = ['red', 'blue', 'yellow', 'green'];
const COLOR_HEX = {
  red: '#FF2A6D',
  blue: '#05D9E8',
  yellow: '#FFDD00',
  green: '#00F59B',
  white: '#F0F4F8' // Neutral platform always solid
};

class LevelManager {
  constructor() {
    this.levels = [];
    this.generateLevels();
  }

  generateLevels() {
    // Handcrafted foundations + progressive complexity
    for (let i = 1; i <= 50; i++) {
      const tier = Math.ceil(i / 10);
      this.levels.push(this.createLevel(i, tier));
    }
  }

  createLevel(id, tier) {
    const tierNames = [
      "Tier 1: Fundamentals",
      "Tier 2: Kinetic Momentum",
      "Tier 3: Chroma Shift",
      "Tier 4: The Ascendant Towers",
      "Tier 5: Color Carpets & Gauntlet"
    ];

    const baseLevel = {
      id,
      tier,
      tierName: tierNames[tier - 1],
      name: this.getLevelName(id, tier),
      timeLimit: 25 + tier * 5,
      targetTime: 12 + tier * 3,
      spawn: { x: 80, y: 520, color: 'red' },
      portal: { x: 1080, y: 220 },
      platforms: [],
      hazards: [],
      bouncePads: []
    };

    // Build specific layouts based on ID and Tier
    if (id === 1) {
      // Intro: 2 red platforms, 2 blue platforms
      baseLevel.spawn = { x: 80, y: 500, color: 'red' };
      baseLevel.portal = { x: 1050, y: 460 };
      baseLevel.platforms = [
        { x: 40, y: 560, w: 200, h: 30, color: 'white' }, // Start
        { x: 300, y: 520, w: 160, h: 25, color: 'red' },
        { x: 540, y: 480, w: 160, h: 25, color: 'blue' },
        { x: 780, y: 480, w: 160, h: 25, color: 'red' },
        { x: 990, y: 520, w: 180, h: 30, color: 'white' }  // Goal
      ];
    } else if (id === 2) {
      // Intro to 3 colors: Red, Blue, Yellow
      baseLevel.spawn = { x: 80, y: 520, color: 'red' };
      baseLevel.portal = { x: 1060, y: 380 };
      baseLevel.platforms = [
        { x: 40, y: 580, w: 180, h: 30, color: 'white' },
        { x: 280, y: 520, w: 140, h: 25, color: 'red' },
        { x: 480, y: 460, w: 140, h: 25, color: 'blue' },
        { x: 680, y: 400, w: 140, h: 25, color: 'yellow' },
        { x: 880, y: 400, w: 140, h: 25, color: 'blue' },
        { x: 1020, y: 440, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 3) {
      // Intro to all 4 colors in succession
      baseLevel.spawn = { x: 80, y: 540, color: 'red' };
      baseLevel.portal = { x: 1060, y: 300 };
      baseLevel.platforms = [
        { x: 40, y: 600, w: 160, h: 30, color: 'white' },
        { x: 260, y: 540, w: 130, h: 24, color: 'red' },
        { x: 450, y: 480, w: 130, h: 24, color: 'blue' },
        { x: 640, y: 420, w: 130, h: 24, color: 'yellow' },
        { x: 830, y: 360, w: 130, h: 24, color: 'green' },
        { x: 1010, y: 360, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 4) {
      // Over-under split paths
      baseLevel.spawn = { x: 80, y: 480, color: 'red' };
      baseLevel.portal = { x: 1060, y: 440 };
      baseLevel.platforms = [
        { x: 40, y: 540, w: 160, h: 30, color: 'white' },
        // Upper Red Path
        { x: 260, y: 380, w: 140, h: 24, color: 'red' },
        { x: 470, y: 340, w: 140, h: 24, color: 'red' },
        // Lower Blue Path
        { x: 260, y: 520, w: 140, h: 24, color: 'blue' },
        { x: 470, y: 520, w: 140, h: 24, color: 'blue' },
        // Converge on Yellow
        { x: 690, y: 440, w: 150, h: 24, color: 'yellow' },
        { x: 900, y: 460, w: 150, h: 24, color: 'green' },
        { x: 1010, y: 500, w: 160, h: 30, color: 'white' }
      ];
    } else if (id === 5) {
      // Vertical Drop & Leap
      baseLevel.spawn = { x: 100, y: 220, color: 'red' };
      baseLevel.portal = { x: 1060, y: 540 };
      baseLevel.platforms = [
        { x: 50, y: 280, w: 160, h: 30, color: 'white' },
        { x: 280, y: 340, w: 120, h: 24, color: 'red' },
        { x: 460, y: 420, w: 120, h: 24, color: 'blue' },
        { x: 640, y: 500, w: 120, h: 24, color: 'yellow' },
        { x: 820, y: 560, w: 130, h: 24, color: 'green' },
        { x: 1000, y: 600, w: 170, h: 30, color: 'white' }
      ];
    } else if (tier === 1) {
      // Tier 1 Procedural Progression (Levels 6-10)
      this.buildTier1Level(baseLevel, id);
    } else if (tier === 2) {
      // Tier 2: Moving Platforms & Kinetic timing (Levels 11-20)
      this.buildTier2Level(baseLevel, id);
    } else if (tier === 3) {
      // Tier 3: Chroma Shift / Color-changing rhythm (Levels 21-30)
      this.buildTier3Level(baseLevel, id);
    } else if (tier === 4) {
      // Tier 4: The Ascendant Towers (Levels 31-40)
      this.buildTier4Level(baseLevel, id);
    } else {
      // Tier 5: Color Carpets & The Master Gauntlet (Levels 41-50)
      this.buildTier5Level(baseLevel, id);
    }

    return baseLevel;
  }

  // Tier 1 (Levels 6-10): Rhythm and mid-air precision
  buildTier1Level(lvl, id) {
    lvl.spawn = { x: 70, y: 500, color: 'red' };
    lvl.portal = { x: 1060, y: 320 };
    lvl.platforms.push({ x: 30, y: 560, w: 140, h: 30, color: 'white' });

    const stepCount = 5 + (id - 5);
    const startX = 220;
    const spacing = 780 / stepCount;

    for (let i = 0; i < stepCount; i++) {
      const color = COLOR_NAMES[i % 4];
      const y = 520 - Math.sin((i / stepCount) * Math.PI) * 200 + (i % 2 === 0 ? -20 : 20);
      lvl.platforms.push({
        x: startX + i * spacing,
        y: Math.max(180, Math.min(600, y)),
        w: 100 - (id - 5) * 4,
        h: 22,
        color
      });
    }

    lvl.platforms.push({ x: 1010, y: 380, w: 160, h: 30, color: 'white' });
  }

  // Tier 2 (Levels 11-20): Moving Platforms
  buildTier2Level(lvl, id) {
    lvl.spawn = { x: 70, y: 480, color: 'blue' };
    lvl.portal = { x: 1060, y: 440 };
    lvl.platforms.push({ x: 30, y: 540, w: 140, h: 30, color: 'white' });

    const moveCount = 4 + (id - 10) % 4;
    for (let i = 0; i < moveCount; i++) {
      const color = COLOR_NAMES[(i + 1) % 4];
      const x = 240 + i * 180;
      const isVertical = i % 2 === 1;
      lvl.platforms.push({
        x,
        y: 420 + (i % 2 === 0 ? -40 : 40),
        w: 120,
        h: 24,
        color,
        move: {
          dx: isVertical ? 0 : 70 + (id - 10) * 8,
          dy: isVertical ? 80 + (id - 10) * 8 : 0,
          speed: 1.2 + (id - 10) * 0.1,
          phase: i * 1.1
        }
      });
    }

    // Add colored hazard spikes below
    lvl.hazards.push({
      x: 200,
      y: 650,
      w: 800,
      h: 30,
      color: 'all' // lethal to all colors
    });

    lvl.platforms.push({ x: 1000, y: 500, w: 160, h: 30, color: 'white' });
  }

  // Tier 3 (Levels 21-30): Chroma Shift (Color-cycling platforms)
  buildTier3Level(lvl, id) {
    lvl.spawn = { x: 80, y: 500, color: 'yellow' };
    lvl.portal = { x: 1050, y: 280 };
    lvl.platforms.push({ x: 30, y: 560, w: 150, h: 30, color: 'white' });

    const count = 5 + (id - 20) % 3;
    for (let i = 0; i < count; i++) {
      const isCycling = i % 2 === 0;
      const x = 230 + i * 150;
      const y = 480 - i * 35;
      const color = COLOR_NAMES[i % 4];

      const p = {
        x,
        y,
        w: 110,
        h: 22,
        color
      };

      if (isCycling) {
        p.colorCycle = ['red', 'blue', 'yellow', 'green'];
        p.cycleInterval = 2.4 - ((id - 20) * 0.08); // Speed up cycle on higher levels
        p.cyclePhase = i * 0.6;
      }

      lvl.platforms.push(p);
    }

    // Bounce pad checkpoint
    if (id >= 25) {
      lvl.bouncePads.push({ x: 540, y: 460, w: 40, h: 14, force: 720 });
    }

    lvl.platforms.push({ x: 990, y: 340, w: 170, h: 30, color: 'white' });
  }

  // Tier 4 (Levels 31-40): The Ascendant Towers (Vertical platforming)
  buildTier4Level(lvl, id) {
    lvl.spawn = { x: 100, y: 640, color: 'green' };
    lvl.portal = { x: 600, y: 120 }; // High up tower peak!
    lvl.platforms.push({ x: 40, y: 700, w: 200, h: 30, color: 'white' });

    // Center climbing shaft with alternating side ledges
    const floors = 8;
    for (let f = 0; f < floors; f++) {
      const isLeft = f % 2 === 0;
      const y = 620 - f * 65;
      const color = COLOR_NAMES[f % 4];

      lvl.platforms.push({
        x: isLeft ? 380 : 660,
        y,
        w: 120,
        h: 20,
        color
      });

      // Moving central lift platform
      if (f === 3 || f === 6) {
        lvl.platforms.push({
          x: 520,
          y,
          w: 90,
          h: 18,
          color: COLOR_NAMES[(f + 2) % 4],
          move: { dx: 0, dy: 50, speed: 1.5, phase: f }
        });
      }
    }

    // Bounce pads for big vertical leaps
    lvl.bouncePads.push({ x: 180, y: 690, w: 40, h: 12, force: 680 });
    if (id >= 35) {
      lvl.bouncePads.push({ x: 420, y: 320, w: 40, h: 12, force: 740 });
    }

    // Summit platform
    lvl.platforms.push({ x: 520, y: 180, w: 180, h: 25, color: 'white' });
  }

  // Tier 5 (Levels 41-50): Color Carpets & The Master Gauntlet
  buildTier5Level(lvl, id) {
    lvl.spawn = { x: 60, y: 480, color: 'red' };
    lvl.portal = { x: 1080, y: 300 };
    lvl.platforms.push({ x: 20, y: 540, w: 120, h: 30, color: 'white' });

    // Continuous "Color Carpet" runway
    // Segmented into 4 alternating color zones requiring rapid switching while running!
    const carpetStart = 160;
    const segW = 80;
    const segCount = 6 + (id - 40);

    for (let s = 0; s < segCount; s++) {
      const color = COLOR_NAMES[s % 4];
      lvl.platforms.push({
        x: carpetStart + s * segW,
        y: 520 + Math.sin(s * 0.8) * 40,
        w: segW - 6,
        h: 20,
        color,
        isCarpet: true // Glows and grants speed
      });
    }

    // Mid-air floating moving obstacles
    const midX = carpetStart + segCount * segW;
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

    // Special Level 50 Masterpiece
    if (id === 50) {
      lvl.name = "Sector 50: The Master Prism Gauntlet";
      lvl.timeLimit = 50;
      lvl.targetTime = 22;
      lvl.bouncePads.push({ x: 100, y: 530, w: 40, h: 12, force: 800 });
      lvl.hazards.push({ x: 150, y: 680, w: 900, h: 40, color: 'all' });
    }

    lvl.platforms.push({ x: 1020, y: 360, w: 160, h: 30, color: 'white' });
  }

  getLevelName(id, tier) {
    const titles = {
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
    return titles[id] || `Sector ${id < 10 ? '0' + id : id}`;
  }
}

window.levelManager = new LevelManager();
