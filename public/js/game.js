let canvas;
let ctx;
let currentLevelIndex = 1;
let currentLevel = null;
let levelTime = 0;
let deaths = 0;
let isSlowMo = false;
let timeScale = 1.0;
let wheelAngle = -Math.PI / 2;
let selectedWheelColor = 'red';
window.gameMode = 'solo';
window.roomCode = null;
window.isHost = false;
window.inGame = false;
let socket = null;
let lastMoveEmitTime = 0;
const opponents = {};
let saveData = {
  unlockedLevel: 1,
  lastLevel: 1,
  stars: {}
};
let settings = {
  graphics: 'high',
  particles: 'high',
  shake: true,
  sfx: true,
  music: false
};
const keys = {
  left: false,
  right: false,
  jumpPressed: false,
  jumpHold: false
};
function loadSave() {
  try {
    let raw = localStorage.getItem('the_color_save');
    if (raw) {
      saveData = JSON.parse(raw);
    }
  } catch (e) {}
  window.saveData = saveData;
  try {
    let setRaw = localStorage.getItem('the_color_settings');
    if (setRaw) {
      settings = Object.assign(settings, JSON.parse(setRaw));
    }
  } catch (e) {}
  window.settings = settings;
}
function writeSave() {
  try {
    localStorage.setItem('the_color_save', JSON.stringify(saveData));
  } catch (e) {}
}
function loadLevel(id) {
  let list = window.levelManager.levels;
  let found = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      found = list[i];
      break;
    }
  }
  if (!found) found = list[0];
  currentLevelIndex = found.id;
  window.currentLevelIndex = currentLevelIndex;
  currentLevel = JSON.parse(JSON.stringify(found));
  levelTime = 0;
  deaths = 0;
  if (window.gameMode !== 'party') {
    clearOpponents();
  }
  window.resetPlayer(currentLevel.spawn);
  window.ui.updateHUD(currentLevel, levelTime, deaths);
  window.ui.updateHomeStats();
}
function restartLevel() {
  deaths++;
  window.resetPlayer(currentLevel.spawn);
}
function onPlayerDeath() {
  window.renderer.addDeathBurst(window.player.x, window.player.y, window.player.color);
  setTimeout(function() {
    restartLevel();
  }, 450);
}
window.onPlayerDeathCallback = onPlayerDeath;
function checkGoal() {
  let portal = currentLevel.portal;
  let dist = Math.hypot(window.player.x - portal.x, window.player.y - portal.y);
  if (dist < 36) {
    onLevelCompleted();
  }
}
function onLevelCompleted() {
  window.colorAudio.playLevelComplete();
  let stars = 1;
  if (deaths === 0) stars++;
  if (levelTime <= currentLevel.targetTime) stars++;
  let oldStars = saveData.stars[currentLevelIndex] || 0;
  saveData.stars[currentLevelIndex] = Math.max(oldStars, stars);
  if (currentLevelIndex + 1 > saveData.unlockedLevel) {
    saveData.unlockedLevel = Math.min(50, currentLevelIndex + 1);
  }
  saveData.lastLevel = currentLevelIndex;
  writeSave();
  if (window.gameMode === 'party' && socket && window.roomCode) {
    socket.emit('playerFinishedLevel', {
      level: currentLevelIndex,
      time: levelTime
    });
  }
  window.ui.showVictoryModal({
    level: currentLevel,
    time: levelTime,
    deaths: deaths,
    stars: stars,
    nextLevelAvailable: currentLevelIndex < 50
  });
}
function setupInputs() {
  window.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (!window.inGame) return;
    window.colorAudio.init();
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (!keys.jumpHold) {
        keys.jumpPressed = true;
      }
      keys.jumpHold = true;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyQ') {
      setSlowMotionState(true);
    }
    if (e.code === 'KeyE' || e.code === 'KeyC') {
      cyclePlayerColor();
    }
    if (e.key === '1') window.setPlayerColor('red');
    if (e.key === '2') window.setPlayerColor('blue');
    if (e.key === '3') window.setPlayerColor('yellow');
    if (e.key === '4') window.setPlayerColor('green');
    if (e.code === 'KeyR') {
      restartLevel();
    }
  });
  window.addEventListener('keyup', function(e) {
    if (!window.inGame) return;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      keys.jumpHold = false;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE' || e.code === 'KeyQ') {
      commitWheelColor();
      setSlowMotionState(false);
    }
  });
  canvas.addEventListener('mousedown', function(e) {
    if (!window.inGame) return;
    window.colorAudio.init();
    if (e.button === 2) {
      setSlowMotionState(true);
    } else if (e.button === 0) {
      if (isSlowMo) {
        commitWheelColor();
        setSlowMotionState(false);
      }
    }
  });
  canvas.addEventListener('mouseup', function(e) {
    if (!window.inGame) return;
    if (e.button === 2) {
      commitWheelColor();
      setSlowMotionState(false);
    }
  });
  canvas.addEventListener('mousemove', function(e) {
    if (!window.inGame) return;
    if (isSlowMo) {
      let rect = canvas.getBoundingClientRect();
      let mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      let my = (e.clientY - rect.top) * (canvas.height / rect.height);
      let px = window.player.x - window.renderer.camera.x;
      let py = window.player.y - window.renderer.camera.y;
      wheelAngle = Math.atan2(my - py, mx - px);
      selectedWheelColor = getColorFromAngle(wheelAngle);
    }
  });
  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  setupTouch();
}
function cyclePlayerColor() {
  if (!window.player || !window.inGame) return;
  const standardColors = ['red', 'blue', 'yellow', 'green'];
  let current = window.player.color;
  let targetColors = standardColors;
  if (window.currentLevel && window.currentLevel.platforms) {
    let activeInLevel = [];
    for (let i = 0; i < window.currentLevel.platforms.length; i++) {
      let c = window.currentLevel.platforms[i].color;
      if (c && c !== 'white' && standardColors.includes(c) && !activeInLevel.includes(c)) {
        activeInLevel.push(c);
      }
    }
    if (activeInLevel.length > 1) {
      targetColors = activeInLevel;
    }
  }
  let idx = targetColors.indexOf(current);
  let nextColor = targetColors[(idx + 1) % targetColors.length];
  if (window.setPlayerColor) {
    let changed = window.setPlayerColor(nextColor);
    if (changed && window.renderer && window.player) {
      window.renderer.addColorBurst(window.player.x, window.player.y, nextColor);
    }
  }
}
window.cyclePlayerColor = cyclePlayerColor;
function setupTouch() {
  const dpad = document.getElementById('touchDpad');
  const btnLeft = document.getElementById('touchLeft');
  const btnRight = document.getElementById('touchRight');
  const btnJump = document.getElementById('touchJump');
  const btnCycle = document.getElementById('touchCycle');
  const btnSlowMo = document.getElementById('touchSlowMo');
  const gemRed = document.getElementById('touchColorRed');
  const gemBlue = document.getElementById('touchColorBlue');
  const gemYellow = document.getElementById('touchColorYellow');
  const gemGreen = document.getElementById('touchColorGreen');
  if (!dpad && !btnJump) return;
  function setMoveLeft(active) {
    keys.left = active;
    if (active) {
      keys.right = false;
      if (btnLeft) btnLeft.classList.add('active');
      if (btnRight) btnRight.classList.remove('active');
    } else {
      if (btnLeft) btnLeft.classList.remove('active');
    }
  }
  function setMoveRight(active) {
    keys.right = active;
    if (active) {
      keys.left = false;
      if (btnRight) btnRight.classList.add('active');
      if (btnLeft) btnLeft.classList.remove('active');
    } else {
      if (btnRight) btnRight.classList.remove('active');
    }
  }
  if (btnLeft) {
    btnLeft.addEventListener('touchstart', function(e) {
      e.preventDefault();
      setMoveLeft(true);
    }, { passive: false });
    btnLeft.addEventListener('touchend', function(e) {
      e.preventDefault();
      setMoveLeft(false);
    }, { passive: false });
    btnLeft.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      setMoveLeft(false);
    }, { passive: false });
  }
  if (btnRight) {
    btnRight.addEventListener('touchstart', function(e) {
      e.preventDefault();
      setMoveRight(true);
    }, { passive: false });
    btnRight.addEventListener('touchend', function(e) {
      e.preventDefault();
      setMoveRight(false);
    }, { passive: false });
    btnRight.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      setMoveRight(false);
    }, { passive: false });
  }
  if (dpad) {
    function updateDpadFromTouch(touch) {
      let el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && (el === btnLeft || btnLeft.contains(el))) {
        setMoveLeft(true);
      } else if (el && (el === btnRight || btnRight.contains(el))) {
        setMoveRight(true);
      }
    }
    dpad.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (e.touches.length > 0) updateDpadFromTouch(e.touches[0]);
    }, { passive: false });
    dpad.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (e.touches.length > 0) updateDpadFromTouch(e.touches[0]);
    }, { passive: false });
    dpad.addEventListener('touchend', function(e) {
      e.preventDefault();
      setMoveLeft(false);
      setMoveRight(false);
    }, { passive: false });
    dpad.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      setMoveLeft(false);
      setMoveRight(false);
    }, { passive: false });
  }
  if (btnJump) {
    btnJump.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (window.inGame) {
        keys.jumpPressed = true;
        keys.jumpHold = true;
        btnJump.classList.add('active');
      }
    }, { passive: false });
    btnJump.addEventListener('touchend', function(e) {
      e.preventDefault();
      keys.jumpHold = false;
      btnJump.classList.remove('active');
    }, { passive: false });
    btnJump.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      keys.jumpHold = false;
      btnJump.classList.remove('active');
    }, { passive: false });
  }
  if (btnCycle) {
    btnCycle.addEventListener('touchstart', function(e) {
      e.preventDefault();
      cyclePlayerColor();
      btnCycle.classList.add('active');
    }, { passive: false });
    btnCycle.addEventListener('touchend', function(e) {
      e.preventDefault();
      btnCycle.classList.remove('active');
    }, { passive: false });
    btnCycle.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      btnCycle.classList.remove('active');
    }, { passive: false });
  }
  if (btnSlowMo) {
    btnSlowMo.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (window.inGame) {
        let newState = !isSlowMo;
        setSlowMotionState(newState);
        if (newState) {
          btnSlowMo.classList.add('active');
        } else {
          btnSlowMo.classList.remove('active');
        }
      }
    }, { passive: false });
  }
  const colorGems = [
    { el: gemRed, color: 'red' },
    { el: gemBlue, color: 'blue' },
    { el: gemYellow, color: 'yellow' },
    { el: gemGreen, color: 'green' }
  ];
  colorGems.forEach(function(item) {
    if (!item.el) return;
    item.el.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (window.inGame && window.setPlayerColor) {
        let changed = window.setPlayerColor(item.color);
        if (changed && window.renderer && window.player) {
          window.renderer.addColorBurst(window.player.x, window.player.y, item.color);
        }
      }
    }, { passive: false });
  });
}
function setSlowMotionState(active) {
  if (isSlowMo !== active) {
    isSlowMo = active;
    timeScale = active ? 0.15 : 1.0;
    window.colorAudio.setSlowMotion(active);
  }
}
function getColorFromAngle(angle) {
  let norm = angle;
  while (norm > Math.PI) norm -= Math.PI * 2;
  while (norm < -Math.PI) norm += Math.PI * 2;
  if (norm >= -Math.PI / 4 && norm <= Math.PI / 4) return 'blue';
  if (norm > Math.PI / 4 && norm <= 3 * Math.PI / 4) return 'yellow';
  if (norm < -Math.PI / 4 && norm >= -3 * Math.PI / 4) return 'red';
  return 'green';
}
function commitWheelColor() {
  if (selectedWheelColor) {
    let changed = window.setPlayerColor(selectedWheelColor);
    if (changed) {
      window.renderer.addColorBurst(window.player.x, window.player.y, selectedWheelColor);
    }
  }
}
function setupSocket() {
  socket = io();
  window.socket = socket;
  socket.on('playerMoved', function(data) {
    if (data.id !== socket.id) {
      if (!opponents[data.id]) {
        opponents[data.id] = data;
      } else {
        Object.assign(opponents[data.id], data);
      }
    }
  });
  socket.on('playerLeft', function(data) {
    if (data && data.id) {
      delete opponents[data.id];
      if (window.ui && window.ui.showBanner) {
        window.ui.showBanner('A racer left the game', 2000);
      }
    }
  });
  socket.on('roomUpdate', function(data) {
    if (window.roomCode && data.code === window.roomCode) {
      window.isHost = (data.host === socket.id);
      if (window.ui && window.ui.renderPartyPlayers) {
        window.ui.renderPartyPlayers(data.players);
      }
      let startBtn = document.getElementById('btnStartRace');
      let waitTxt = document.getElementById('guestWaitingText');
      let lvlSel = document.getElementById('partyLevelSelect');
      if (startBtn) startBtn.style.display = window.isHost ? 'block' : 'none';
      if (waitTxt) waitTxt.style.display = window.isHost ? 'none' : 'block';
      if (lvlSel) {
        lvlSel.disabled = !window.isHost;
        if (data.level) lvlSel.value = data.level;
      }
      for (let oid in opponents) {
        let exists = false;
        for (let i = 0; i < data.players.length; i++) {
          if (data.players[i].id === oid) {
            exists = true;
            break;
          }
        }
        if (!exists) delete opponents[oid];
      }
    }
  });
  socket.on('levelChanged', function(data) {
    let lvlSel = document.getElementById('partyLevelSelect');
    if (lvlSel) lvlSel.value = data.level;
    if (window.ui && window.ui.showBanner) {
      window.ui.showBanner('Race level set to Level ' + data.level, 1800);
    }
  });
  socket.on('raceStarting', function(data) {
    let modalParty = document.getElementById('modalParty');
    let modalVictory = document.getElementById('modalVictory');
    let homeScreen = document.getElementById('homeScreen');
    let gameHeader = document.getElementById('gameHeader');
    let controlsHintBar = document.getElementById('controlsHintBar');
    if (modalParty) modalParty.style.display = 'none';
    if (modalVictory) modalVictory.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    if (gameHeader) gameHeader.style.display = 'flex';
    if (controlsHintBar) controlsHintBar.style.display = 'flex';
    if (window.showMobileControls) window.showMobileControls();
    if (window.tryLockLandscape) window.tryLockLandscape();
    window.inGame = true;
    for (let id in opponents) {
      delete opponents[id];
    }
    loadLevel(data.level);
    if (window.ui && window.ui.showBanner) {
      window.ui.showBanner('GO! RACE STARTED', 2500);
    }
    window.colorAudio.init();
  });
  socket.on('playerWon', function(data) {
    let isYou = (data.id === socket.id);
    if (window.ui && window.ui.showBanner) {
      if (isYou) {
        window.ui.showBanner('YOU WON THE RACE! ' + data.time.toFixed(1) + 's', 3500);
      } else {
        window.ui.showBanner((data.name || 'Friend') + ' WON THE RACE! ' + data.time.toFixed(1) + 's', 3500);
      }
    }
  });
}
function startGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  window.inGame = false;
  loadSave();
  setupSocket();
  setupInputs();
  window.ui.setup();
  loadLevel(saveData.lastLevel || 1);
  let lastTime = performance.now();
  function gameLoop(timestamp) {
    let dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    if (window.inGame) {
      if (!window.player.isDead) {
        levelTime += dt * timeScale;
      }
      window.updatePlayer(dt, keys, currentLevel, timeScale);
      keys.jumpPressed = false;
      checkGoal();
      window.ui.updateTimer(levelTime, currentLevel.timeLimit);
    }
    let oppList = [];
    for (let id in opponents) {
      oppList.push(opponents[id]);
    }
    window.renderer.render(
      ctx,
      canvas,
      window.player,
      currentLevel,
      isSlowMo,
      wheelAngle,
      oppList,
      dt
    );
    if (window.inGame && window.gameMode === 'party' && socket && window.roomCode) {
      let now = performance.now();
      if (now - lastMoveEmitTime > 35) {
        lastMoveEmitTime = now;
        socket.emit('playerMove', {
          x: Math.round(window.player.x),
          y: Math.round(window.player.y),
          color: window.player.color,
          facing: window.player.facing || 1,
          scaleX: +(window.player.scaleX || 1).toFixed(2),
          scaleY: +(window.player.scaleY || 1).toFixed(2),
          vx: Math.round(window.player.vx || 0),
          vy: Math.round(window.player.vy || 0)
        });
      }
    }
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}
function clearOpponents() {
  for (let id in opponents) {
    delete opponents[id];
  }
}
window.clearOpponents = clearOpponents;
window.loadLevel = loadLevel;
window.restartLevel = restartLevel;
window.startGame = startGame;
