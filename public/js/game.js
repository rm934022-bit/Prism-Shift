// The Color - Core Game Engine & Game State Machine
class GameApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderer = new ColorRenderer(this.canvas);
    this.player = new PlayerController();
    this.audio = window.colorAudio;
    this.levels = window.levelManager;

    this.currentLevelIndex = 1;
    this.currentLevel = null;
    this.levelTime = 0;
    this.deaths = 0;

    // Time Dilation & Color Wheel
    this.isSlowMo = false;
    this.timeScale = 1.0;
    this.wheelAngle = -Math.PI / 2; // Default point to Red (top)
    this.selectedWheelColor = 'red';

    // Game Mode & Multiplayer
    this.mode = 'solo'; // 'solo' or 'party'
    this.socket = null;
    this.roomCode = null;
    this.opponents = new Map(); // socketId -> { name, color, x, y }

    // Input States
    this.input = {
      left: false,
      right: false,
      jumpPressed: false,
      jumpHold: false,
      wheelHold: false
    };

    // Saved Progress in localStorage
    this.progress = this.loadProgress();

    this.initSocket();
    this.initInputListeners();
    this.loadLevel(this.progress.lastLevel || 1);
    this.startLoop();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('the_color_save');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load save:', e);
    }
    return {
      unlockedLevel: 1,
      lastLevel: 1,
      stars: {} // levelId -> 1..3
    };
  }

  saveProgress() {
    try {
      localStorage.setItem('the_color_save', JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Could not save progress:', e);
    }
  }

  initSocket() {
    this.socket = io();

    this.socket.on('playerMoved', (data) => {
      if (data.id !== this.socket.id) {
        this.opponents.set(data.id, data);
      }
    });

    this.socket.on('playerLeft', (data) => {
      this.opponents.delete(data.id);
    });

    this.socket.on('opponentWon', (data) => {
      window.uiManager.showBanner(`${data.name} REACHED THE PRISM!`, 3000);
    });
  }

  loadLevel(levelId) {
    const lvl = this.levels.levels.find(l => l.id === levelId) || this.levels.levels[0];
    this.currentLevelIndex = lvl.id;
    this.currentLevel = JSON.parse(JSON.stringify(lvl));
    this.levelTime = 0;
    this.deaths = 0;

    this.player.reset(this.currentLevel.spawn);
    this.renderer.updateCamera(this.player.x, this.player.y, 1.0);

    window.uiManager.updateHUD(this.currentLevel, this.levelTime, this.deaths);
  }

  restartLevel() {
    this.deaths++;
    this.player.reset(this.currentLevel.spawn);
  }

  onPlayerDeath() {
    this.renderer.addDeathBurst(this.player.x, this.player.y, this.player.color);
    setTimeout(() => {
      this.restartLevel();
    }, 450);
  }

  checkGoal() {
    const portal = this.currentLevel.portal;
    const dist = Math.hypot(this.player.x - portal.x, this.player.y - portal.y);
    if (dist < 36) {
      this.onLevelCompleted();
    }
  }

  onLevelCompleted() {
    this.audio.playLevelComplete();

    // Calculate stars
    // Star 1: Complete level
    // Star 2: 0 deaths
    // Star 3: Under target time
    let stars = 1;
    if (this.deaths === 0) stars++;
    if (this.levelTime <= this.currentLevel.targetTime) stars++;

    // Save record
    const prevStars = this.progress.stars[this.currentLevelIndex] || 0;
    this.progress.stars[this.currentLevelIndex] = Math.max(prevStars, stars);
    if (this.currentLevelIndex + 1 > this.progress.unlockedLevel) {
      this.progress.unlockedLevel = Math.min(50, this.currentLevelIndex + 1);
    }
    this.progress.lastLevel = this.currentLevelIndex;
    this.saveProgress();

    // If multiplayer, notify others
    if (this.mode === 'party' && this.socket && this.roomCode) {
      this.socket.emit('playerFinishedLevel', {
        room: this.roomCode,
        level: this.currentLevelIndex,
        time: this.levelTime
      });
    }

    window.uiManager.showVictoryModal({
      level: this.currentLevel,
      time: this.levelTime,
      deaths: this.deaths,
      stars,
      nextLevelAvailable: this.currentLevelIndex < 50
    });
  }

  initInputListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      this.audio.init();

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = true;

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (!this.input.jumpHold) {
          this.input.jumpPressed = true;
        }
        this.input.jumpHold = true;
      }

      // Open Color Wheel (Shift, Q, E)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE' || e.code === 'KeyQ') {
        this.setSlowMo(true);
      }

      // Direct hotkeys 1, 2, 3, 4 for instant color switch
      if (e.key === '1') this.player.setColor('red');
      if (e.key === '2') this.player.setColor('blue');
      if (e.key === '3') this.player.setColor('yellow');
      if (e.key === '4') this.player.setColor('green');

      // Restart key 'R'
      if (e.code === 'KeyR') {
        this.restartLevel();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.input.jumpHold = false;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE' || e.code === 'KeyQ') {
        this.commitWheelColor();
        this.setSlowMo(false);
      }
    });

    // Mouse interactions: Right click or hold to slow-mo wheel
    this.canvas.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (e.button === 2) { // Right Click
        this.setSlowMo(true);
      } else if (e.button === 0) { // Left Click
        if (this.isSlowMo) {
          this.commitWheelColor();
          this.setSlowMo(false);
        }
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.commitWheelColor();
        this.setSlowMo(false);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isSlowMo) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        const px = this.player.x - this.renderer.camera.x;
        const py = this.player.y - this.renderer.camera.y;

        this.wheelAngle = Math.atan2(my - py, mx - px);
        this.selectedWheelColor = this.getColorFromAngle(this.wheelAngle);
      }
    });

    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Touch controls for mobile / tablet
    this.initTouchControls();
  }

  initTouchControls() {
    const btnLeft = document.getElementById('touchLeft');
    const btnRight = document.getElementById('touchRight');
    const btnJump = document.getElementById('touchJump');
    const btnWheel = document.getElementById('touchWheel');

    if (!btnLeft || !btnJump) return;

    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.input.left = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.input.left = false; });

    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.input.right = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); this.input.right = false; });

    btnJump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.jumpPressed = true;
      this.input.jumpHold = true;
    });
    btnJump.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.input.jumpHold = false;
    });

    btnWheel.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.setSlowMo(true);
    });

    btnWheel.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = btnWheel.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.wheelAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
      this.selectedWheelColor = this.getColorFromAngle(this.wheelAngle);
    });

    btnWheel.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.commitWheelColor();
      this.setSlowMo(false);
    });
  }

  setSlowMo(active) {
    if (this.isSlowMo !== active) {
      this.isSlowMo = active;
      this.timeScale = active ? 0.15 : 1.0;
      this.audio.setSlowMotion(active);
    }
  }

  getColorFromAngle(angle) {
    let norm = angle;
    while (norm > Math.PI) norm -= Math.PI * 2;
    while (norm < -Math.PI) norm += Math.PI * 2;

    if (norm >= -Math.PI / 4 && norm <= Math.PI / 4) return 'blue';
    if (norm > Math.PI / 4 && norm <= 3 * Math.PI / 4) return 'yellow';
    if (norm < -Math.PI / 4 && norm >= -3 * Math.PI / 4) return 'red';
    return 'green';
  }

  commitWheelColor() {
    if (this.selectedWheelColor) {
      const changed = this.player.setColor(this.selectedWheelColor);
      if (changed) {
        this.renderer.addColorBurst(this.player.x, this.player.y, this.selectedWheelColor);
      }
    }
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      // Update timer (in normal time)
      if (!this.player.isDead) {
        this.levelTime += dt * this.timeScale;
      }

      // Physics update
      this.player.update(dt, this.input, this.currentLevel, this.timeScale);
      this.input.jumpPressed = false; // Reset single trigger

      // Check portal reach
      this.checkGoal();

      // Render
      this.renderer.render(
        this.player,
        this.currentLevel,
        this.isSlowMo,
        this.wheelAngle,
        Array.from(this.opponents.values()),
        dt
      );

      // Update HUD values
      window.uiManager.updateTimer(this.levelTime, this.currentLevel.timeLimit);

      // Broadcast position if in multiplayer party
      if (this.mode === 'party' && this.socket && this.roomCode) {
        this.socket.emit('playerMove', {
          room: this.roomCode,
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          color: this.player.color
        });
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

window.GameApp = GameApp;
