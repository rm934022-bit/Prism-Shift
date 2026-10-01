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
let gameMode = 'solo';
let socket = null;
let roomCode = null;
const opponents = {};
let saveData = {
  unlockedLevel: 1,
  lastLevel: 1,
  stars: {}
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
  window.resetPlayer(currentLevel.spawn);
  window.ui.updateHUD(currentLevel, levelTime, deaths);
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
  if (gameMode === 'party' && socket && roomCode) {
    socket.emit('playerFinishedLevel', {
      room: roomCode,
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
    window.colorAudio.init();
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (!keys.jumpHold) {
        keys.jumpPressed = true;
      }
      keys.jumpHold = true;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE' || e.code === 'KeyQ') {
      setSlowMotionState(true);
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
    if (e.button === 2) {
      commitWheelColor();
      setSlowMotionState(false);
    }
  });
  canvas.addEventListener('mousemove', function(e) {
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
function setupTouch() {
  const btnLeft = document.getElementById('touchLeft');
  const btnRight = document.getElementById('touchRight');
  const btnJump = document.getElementById('touchJump');
  const btnWheel = document.getElementById('touchWheel');
  if (!btnLeft || !btnJump) return;
  btnLeft.ontouchstart = function(e) { e.preventDefault(); keys.left = true; };
  btnLeft.ontouchend = function(e) { e.preventDefault(); keys.left = false; };
  btnRight.ontouchstart = function(e) { e.preventDefault(); keys.right = true; };
  btnRight.ontouchend = function(e) { e.preventDefault(); keys.right = false; };
  btnJump.ontouchstart = function(e) {
    e.preventDefault();
    keys.jumpPressed = true;
    keys.jumpHold = true;
  };
  btnJump.ontouchend = function(e) {
    e.preventDefault();
    keys.jumpHold = false;
  };
  btnWheel.ontouchstart = function(e) {
    e.preventDefault();
    setSlowMotionState(true);
  };
  btnWheel.ontouchmove = function(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = btnWheel.getBoundingClientRect();
    let cx = rect.left + rect.width / 2;
    let cy = rect.top + rect.height / 2;
    wheelAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
    selectedWheelColor = getColorFromAngle(wheelAngle);
  };
  btnWheel.ontouchend = function(e) {
    e.preventDefault();
    commitWheelColor();
    setSlowMotionState(false);
  };
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
      opponents[data.id] = data;
    }
  });
  socket.on('playerLeft', function(data) {
    delete opponents[data.id];
  });
  socket.on('opponentWon', function(data) {
    window.ui.showBanner((data.name || 'Friend') + ' REACHED THE PRISM!', 3000);
  });
}
function startGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  loadSave();
  setupSocket();
  setupInputs();
  window.ui.setup();
  loadLevel(saveData.lastLevel || 1);
  let lastTime = performance.now();
  function gameLoop(timestamp) {
    let dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    if (!window.player.isDead) {
      levelTime += dt * timeScale;
    }
    window.updatePlayer(dt, keys, currentLevel, timeScale);
    keys.jumpPressed = false;
    checkGoal();
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
    window.ui.updateTimer(levelTime, currentLevel.timeLimit);
    if (gameMode === 'party' && socket && roomCode) {
      socket.emit('playerMove', {
        room: roomCode,
        x: Math.round(window.player.x),
        y: Math.round(window.player.y),
        color: window.player.color
      });
    }
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}
window.loadLevel = loadLevel;
window.restartLevel = restartLevel;
window.startGame = startGame;
