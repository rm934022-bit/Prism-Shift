let currentTierTab = 1;
function setupUI() {
  const btnOpenLevels = document.getElementById('btnOpenLevels');
  const modalLevels = document.getElementById('modalLevels');
  const btnCloseLevels = document.getElementById('btnCloseLevels');
  if (btnOpenLevels && modalLevels) {
    btnOpenLevels.onclick = function() {
      window.colorAudio.playUiClick();
      renderLevelGrid();
      modalLevels.style.display = 'flex';
    };
    btnCloseLevels.onclick = function() {
      window.colorAudio.playUiClick();
      modalLevels.style.display = 'none';
    };
  }
  const btnOpenParty = document.getElementById('btnOpenParty');
  const modalParty = document.getElementById('modalParty');
  const btnCloseParty = document.getElementById('btnCloseParty');
  if (btnOpenParty && modalParty) {
    btnOpenParty.onclick = function() {
      window.colorAudio.playUiClick();
      modalParty.style.display = 'flex';
    };
    btnCloseParty.onclick = function() {
      window.colorAudio.playUiClick();
      modalParty.style.display = 'none';
    };
  }
  const tierBtns = document.querySelectorAll('.tier-tab-btn');
  for (let i = 0; i < tierBtns.length; i++) {
    tierBtns[i].onclick = function() {
      window.colorAudio.playUiClick();
      for (let j = 0; j < tierBtns.length; j++) {
        tierBtns[j].classList.remove('active');
      }
      this.classList.add('active');
      currentTierTab = parseInt(this.dataset.tier);
      renderLevelGrid();
    };
  }
  const btnAudio = document.getElementById('btnAudioToggle');
  const btnMusic = document.getElementById('btnMusicToggle');
  if (btnAudio) {
    btnAudio.onclick = function() {
      let muted = window.colorAudio.toggleMute();
      btnAudio.innerText = muted ? '🔇' : '🔊';
    };
  }
  if (btnMusic) {
    btnMusic.onclick = function() {
      let isMusic = window.colorAudio.toggleMusic();
      btnMusic.classList.toggle('active', isMusic);
    };
  }
  const colorDots = document.querySelectorAll('.hud-color-dot');
  for (let i = 0; i < colorDots.length; i++) {
    colorDots[i].onclick = function() {
      window.setPlayerColor(this.dataset.color);
    };
  }
  const btnNextLevel = document.getElementById('btnNextLevel');
  const btnRetry = document.getElementById('btnRetry');
  const btnLevelSelectFromVic = document.getElementById('btnLevelSelectFromVic');
  if (btnNextLevel) {
    btnNextLevel.onclick = function() {
      window.colorAudio.playUiClick();
      document.getElementById('modalVictory').style.display = 'none';
      if (window.loadLevel) {
        window.loadLevel(window.currentLevelIndex + 1);
      }
    };
  }
  if (btnRetry) {
    btnRetry.onclick = function() {
      window.colorAudio.playUiClick();
      document.getElementById('modalVictory').style.display = 'none';
      if (window.restartLevel) {
        window.restartLevel();
      }
    };
  }
  if (btnLevelSelectFromVic) {
    btnLevelSelectFromVic.onclick = function() {
      window.colorAudio.playUiClick();
      document.getElementById('modalVictory').style.display = 'none';
      renderLevelGrid();
      document.getElementById('modalLevels').style.display = 'flex';
    };
  }
  const btnCreateParty = document.getElementById('btnCreateParty');
  const btnJoinParty = document.getElementById('btnJoinParty');
  const btnCopyPartyLink = document.getElementById('btnCopyPartyLink');
  if (btnCreateParty) {
    btnCreateParty.onclick = function() {
      createParty();
    };
  }
  if (btnJoinParty) {
    btnJoinParty.onclick = function() {
      let code = document.getElementById('inputPartyCode').value.trim();
      if (code) {
        joinParty(code);
      }
    };
  }
  if (btnCopyPartyLink) {
    btnCopyPartyLink.onclick = function() {
      let code = document.getElementById('partyCodeDisplay').innerText;
      let url = window.location.origin + window.location.pathname + '?party=' + code;
      navigator.clipboard.writeText(url).then(function() {
        btnCopyPartyLink.innerText = 'COPIED!';
        setTimeout(function() { btnCopyPartyLink.innerText = 'COPY LINK'; }, 2000);
      });
    };
  }
}
function renderLevelGrid() {
  const grid = document.getElementById('levelCardsGrid');
  if (!grid || !window.levelManager) return;
  grid.innerHTML = '';
  let startIdx = (currentTierTab - 1) * 10 + 1;
  let endIdx = currentTierTab * 10;
  for (let i = startIdx; i <= endIdx; i++) {
    let lvl = window.levelManager.levels[i - 1];
    if (!lvl) continue;
    let isUnlocked = i <= (window.saveData ? window.saveData.unlockedLevel : 1);
    let isCurrent = i === window.currentLevelIndex;
    let stars = (window.saveData && window.saveData.stars) ? (window.saveData.stars[i] || 0) : 0;
    let card = document.createElement('div');
    card.className = 'level-card ' + (isUnlocked ? 'unlocked' : 'locked') + (isCurrent ? ' current' : '');
    let starHtml = '';
    for (let s = 1; s <= 3; s++) {
      starHtml += '<span class="star-icon ' + (s <= stars ? 'earned' : '') + '">★</span>';
    }
    card.innerHTML = '<div class="level-num">' + (i < 10 ? '0' + i : i) + '</div>' +
                     '<div class="level-title">' + lvl.name + '</div>' +
                     '<div class="level-stars">' + (isUnlocked ? starHtml : '🔒 LOCKED') + '</div>';
    if (isUnlocked) {
      card.onclick = function() {
        window.colorAudio.playUiClick();
        document.getElementById('modalLevels').style.display = 'none';
        window.loadLevel(i);
      };
    }
    grid.appendChild(card);
  }
}
function updateHUD(level, time, deaths) {
  const titleEl = document.getElementById('hudLevelName');
  const tierEl = document.getElementById('hudTierName');
  if (titleEl) titleEl.innerText = level.name;
  if (tierEl) tierEl.innerText = level.tierName;
}
function updateTimer(time, timeLimit) {
  const timerEl = document.getElementById('hudTimer');
  if (!timerEl) return;
  let remaining = Math.max(0, timeLimit - time);
  timerEl.innerText = remaining.toFixed(1) + 's';
  if (remaining < 5) {
    timerEl.classList.add('urgent');
  } else {
    timerEl.classList.remove('urgent');
  }
}
function showVictoryModal(data) {
  const modal = document.getElementById('modalVictory');
  const levelName = document.getElementById('vicLevelName');
  const timeVal = document.getElementById('vicTime');
  const deathsVal = document.getElementById('vicDeaths');
  const starsContainer = document.getElementById('vicStars');
  const btnNext = document.getElementById('btnNextLevel');
  levelName.innerText = data.level.name;
  timeVal.innerText = data.time.toFixed(1) + 's (Target: <' + data.level.targetTime + 's)';
  deathsVal.innerText = data.deaths === 0 ? '0 (Flawless!)' : data.deaths + ' deaths';
  starsContainer.innerHTML = '';
  for (let s = 1; s <= 3; s++) {
    let star = document.createElement('span');
    star.className = 'vic-star ' + (s <= data.stars ? 'earned' : '');
    star.innerText = '★';
    starsContainer.appendChild(star);
  }
  if (btnNext) {
    btnNext.style.display = data.nextLevelAvailable ? 'inline-block' : 'none';
  }
  modal.style.display = 'flex';
}
function showBanner(text, duration) {
  const banner = document.getElementById('globalBanner');
  if (!banner) return;
  banner.innerText = text;
  banner.style.opacity = '1';
  banner.style.transform = 'translate(-50%, -50%) scale(1)';
  setTimeout(function() {
    banner.style.opacity = '0';
    banner.style.transform = 'translate(-50%, -50%) scale(0.85)';
  }, duration || 2500);
}
function createParty() {
  if (!window.socket) return;
  let chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  window.socket.emit('joinRoom', { code: code, name: 'Host' }, function() {
    window.roomCode = code;
    window.gameMode = 'party';
    document.getElementById('partyCodeDisplay').innerText = code;
    document.getElementById('partyActiveSection').style.display = 'block';
    document.getElementById('partyLobbySection').style.display = 'none';
    showBanner('PARTY CODE: ' + code, 3000);
  });
}
function joinParty(code) {
  if (!window.socket) return;
  let upper = code.toUpperCase();
  window.socket.emit('joinRoom', { code: upper, name: 'Racer' }, function() {
    window.roomCode = upper;
    window.gameMode = 'party';
    document.getElementById('partyCodeDisplay').innerText = upper;
    document.getElementById('partyActiveSection').style.display = 'block';
    document.getElementById('partyLobbySection').style.display = 'none';
    document.getElementById('modalParty').style.display = 'none';
    showBanner('JOINED PARTY: ' + upper, 3000);
  });
}
window.ui = {
  setup: setupUI,
  renderLevelGrid: renderLevelGrid,
  updateHUD: updateHUD,
  updateTimer: updateTimer,
  showVictoryModal: showVictoryModal,
  showBanner: showBanner
};
