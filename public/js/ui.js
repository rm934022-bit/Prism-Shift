let currentTierTab = 1;
function setupUI() {
  const homeScreen = document.getElementById('homeScreen');
  const gameHeader = document.getElementById('gameHeader');
  const controlsHintBar = document.getElementById('controlsHintBar');
  const modalLevels = document.getElementById('modalLevels');
  const modalParty = document.getElementById('modalParty');
  const modalSettings = document.getElementById('modalSettings');
  const btnHomePlay = document.getElementById('btnHomePlay');
  if (btnHomePlay) {
    btnHomePlay.onclick = function() {
      window.colorAudio.init();
      window.colorAudio.playUiClick();
      homeScreen.style.display = 'none';
      gameHeader.style.display = 'flex';
      controlsHintBar.style.display = 'flex';
      window.inGame = true;
    };
  }
  const btnBackHome = document.getElementById('btnBackHome');
  if (btnBackHome) {
    btnBackHome.onclick = function() {
      window.colorAudio.playUiClick();
      window.inGame = false;
      homeScreen.style.display = 'flex';
      gameHeader.style.display = 'none';
      controlsHintBar.style.display = 'none';
      updateHomeStats();
    };
  }
  const btnHomeLevels = document.getElementById('btnHomeLevels');
  const btnOpenLevels = document.getElementById('btnOpenLevels');
  const btnCloseLevels = document.getElementById('btnCloseLevels');
  function openLevelsModal() {
    window.colorAudio.playUiClick();
    renderLevelGrid();
    modalLevels.style.display = 'flex';
  }
  if (btnHomeLevels) btnHomeLevels.onclick = openLevelsModal;
  if (btnOpenLevels) btnOpenLevels.onclick = openLevelsModal;
  if (btnCloseLevels) {
    btnCloseLevels.onclick = function() {
      window.colorAudio.playUiClick();
      modalLevels.style.display = 'none';
    };
  }
  const btnHomeParty = document.getElementById('btnHomeParty');
  const btnOpenParty = document.getElementById('btnOpenParty');
  const btnCloseParty = document.getElementById('btnCloseParty');
  function openPartyModal() {
    window.colorAudio.playUiClick();
    modalParty.style.display = 'flex';
  }
  if (btnHomeParty) btnHomeParty.onclick = openPartyModal;
  if (btnOpenParty) btnOpenParty.onclick = openPartyModal;
  if (btnCloseParty) {
    btnCloseParty.onclick = function() {
      window.colorAudio.playUiClick();
      modalParty.style.display = 'none';
    };
  }
  const btnHomeSettings = document.getElementById('btnHomeSettings');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  function openSettingsModal() {
    window.colorAudio.playUiClick();
    syncSettingsUI();
    modalSettings.style.display = 'flex';
  }
  if (btnHomeSettings) btnHomeSettings.onclick = openSettingsModal;
  if (btnOpenSettings) btnOpenSettings.onclick = openSettingsModal;
  if (btnCloseSettings) {
    btnCloseSettings.onclick = function() {
      window.colorAudio.playUiClick();
      modalSettings.style.display = 'none';
    };
  }
  const btnHomeSfxToggle = document.getElementById('btnHomeSfxToggle');
  const btnSettingSfx = document.getElementById('btnSettingSfx');
  function toggleSfx() {
    let muted = window.colorAudio.toggleMute();
    window.settings.sfx = !muted;
    saveSettings();
    syncSettingsUI();
  }
  if (btnHomeSfxToggle) btnHomeSfxToggle.onclick = toggleSfx;
  if (btnSettingSfx) btnSettingSfx.onclick = toggleSfx;
  const btnHomeBgmToggle = document.getElementById('btnHomeBgmToggle');
  const btnSettingBgm = document.getElementById('btnSettingBgm');
  function toggleBgm() {
    window.colorAudio.init();
    let isMusic = window.colorAudio.toggleMusic();
    window.settings.music = isMusic;
    saveSettings();
    syncSettingsUI();
  }
  if (btnHomeBgmToggle) btnHomeBgmToggle.onclick = toggleBgm;
  if (btnSettingBgm) btnSettingBgm.onclick = toggleBgm;
  const btnGfxHigh = document.getElementById('btnGfxHigh');
  const btnGfxLow = document.getElementById('btnGfxLow');
  if (btnGfxHigh && btnGfxLow) {
    btnGfxHigh.onclick = function() {
      window.settings.graphics = 'high';
      saveSettings();
      syncSettingsUI();
    };
    btnGfxLow.onclick = function() {
      window.settings.graphics = 'low';
      saveSettings();
      syncSettingsUI();
    };
  }
  const btnPartHigh = document.getElementById('btnPartHigh');
  const btnPartLow = document.getElementById('btnPartLow');
  if (btnPartHigh && btnPartLow) {
    btnPartHigh.onclick = function() {
      window.settings.particles = 'high';
      saveSettings();
      syncSettingsUI();
    };
    btnPartLow.onclick = function() {
      window.settings.particles = 'low';
      saveSettings();
      syncSettingsUI();
    };
  }
  const btnSettingShake = document.getElementById('btnSettingShake');
  if (btnSettingShake) {
    btnSettingShake.onclick = function() {
      window.settings.shake = !window.settings.shake;
      saveSettings();
      syncSettingsUI();
    };
  }
  const btnResetSave = document.getElementById('btnResetSave');
  if (btnResetSave) {
    btnResetSave.onclick = function() {
      if (confirm('Are you sure you want to reset all game progress?')) {
        localStorage.removeItem('the_color_save');
        window.saveData = { unlockedLevel: 1, lastLevel: 1, stars: {} };
        renderLevelGrid();
        updateHomeStats();
        alert('Progress reset to Sector 01.');
      }
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
  updateHomeStats();
  syncSettingsUI();
}
function syncSettingsUI() {
  const sfxBtn = document.getElementById('btnSettingSfx');
  const homeSfx = document.getElementById('btnHomeSfxToggle');
  if (sfxBtn) {
    sfxBtn.innerText = window.settings.sfx ? 'ON' : 'OFF';
    sfxBtn.classList.toggle('active', window.settings.sfx);
  }
  if (homeSfx) {
    homeSfx.innerText = window.settings.sfx ? 'SFX: ON' : 'SFX: OFF';
    homeSfx.classList.toggle('active', window.settings.sfx);
  }
  const bgmBtn = document.getElementById('btnSettingBgm');
  const homeBgm = document.getElementById('btnHomeBgmToggle');
  if (bgmBtn) {
    bgmBtn.innerText = window.settings.music ? 'ON' : 'OFF';
    bgmBtn.classList.toggle('active', window.settings.music);
  }
  if (homeBgm) {
    homeBgm.innerText = window.settings.music ? 'BGM: ON' : 'BGM: OFF';
    homeBgm.classList.toggle('active', window.settings.music);
  }
  const btnGfxHigh = document.getElementById('btnGfxHigh');
  const btnGfxLow = document.getElementById('btnGfxLow');
  if (btnGfxHigh && btnGfxLow) {
    btnGfxHigh.classList.toggle('active', window.settings.graphics === 'high');
    btnGfxLow.classList.toggle('active', window.settings.graphics === 'low');
  }
  const btnPartHigh = document.getElementById('btnPartHigh');
  const btnPartLow = document.getElementById('btnPartLow');
  if (btnPartHigh && btnPartLow) {
    btnPartHigh.classList.toggle('active', window.settings.particles === 'high');
    btnPartLow.classList.toggle('active', window.settings.particles === 'low');
  }
  const btnShake = document.getElementById('btnSettingShake');
  if (btnShake) {
    btnShake.innerText = window.settings.shake ? 'ON' : 'OFF';
    btnShake.classList.toggle('active', window.settings.shake);
  }
}
function saveSettings() {
  try {
    localStorage.setItem('the_color_settings', JSON.stringify(window.settings));
  } catch (e) {}
}
function updateHomeStats() {
  const starsEl = document.getElementById('homeStarsTotal');
  const sectorEl = document.getElementById('homeCurrentSector');
  const btnHomePlay = document.getElementById('btnHomePlay');
  let unlocked = (window.saveData && window.saveData.unlockedLevel) ? window.saveData.unlockedLevel : 1;
  let totalStars = 0;
  if (window.saveData && window.saveData.stars) {
    for (let id in window.saveData.stars) {
      totalStars += window.saveData.stars[id] || 0;
    }
  }
  if (starsEl) starsEl.innerText = '★ ' + totalStars + '/150';
  if (sectorEl) sectorEl.innerText = 'SECTOR ' + (unlocked < 10 ? '0' + unlocked : unlocked);
  if (btnHomePlay) {
    btnHomePlay.innerText = unlocked > 1 ? ('CONTINUE (SECTOR ' + (unlocked < 10 ? '0' + unlocked : unlocked) + ')') : 'PLAY GAME';
  }
}
function renderLevelGrid() {
  const grid = document.getElementById('levelCardsGrid');
  if (!grid || !window.levelManager) return;
  grid.innerHTML = '';
  let startIdx = (currentTierTab - 1) * 10 + 1;
  let endIdx = currentTierTab * 10;
  let maxUnlocked = (window.saveData && window.saveData.unlockedLevel) ? window.saveData.unlockedLevel : 1;
  for (let i = startIdx; i <= endIdx; i++) {
    let lvl = window.levelManager.levels[i - 1];
    if (!lvl) continue;
    let isUnlocked = i <= maxUnlocked;
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
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('gameHeader').style.display = 'flex';
        document.getElementById('controlsHintBar').style.display = 'flex';
        window.inGame = true;
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
  updateHomeStats();
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
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('gameHeader').style.display = 'flex';
    document.getElementById('controlsHintBar').style.display = 'flex';
    window.inGame = true;
    showBanner('JOINED PARTY: ' + upper, 3000);
  });
}
window.ui = {
  setup: setupUI,
  renderLevelGrid: renderLevelGrid,
  updateHUD: updateHUD,
  updateTimer: updateTimer,
  showVictoryModal: showVictoryModal,
  showBanner: showBanner,
  updateHomeStats: updateHomeStats
};
