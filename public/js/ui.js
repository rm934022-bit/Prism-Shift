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
      if (window.gameMode !== 'party' && window.clearOpponents) {
        window.clearOpponents();
      }
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
    let initView = document.getElementById('partyInitView');
    let lobbyView = document.getElementById('partyLobbyView');
    if (window.roomCode) {
      if (initView) initView.style.display = 'none';
      if (lobbyView) lobbyView.style.display = 'block';
    } else {
      if (initView) initView.style.display = 'block';
      if (lobbyView) lobbyView.style.display = 'none';
    }
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
  const btnStartRace = document.getElementById('btnStartRace');
  const btnLeaveParty = document.getElementById('btnLeaveParty');
  const partyLevelSelect = document.getElementById('partyLevelSelect');
  if (partyLevelSelect && partyLevelSelect.children.length === 0) {
    for (let i = 1; i <= 50; i++) {
      let opt = document.createElement('option');
      opt.value = i;
      opt.innerText = 'Level ' + i;
      partyLevelSelect.appendChild(opt);
    }
    partyLevelSelect.onchange = function() {
      if (window.socket && window.roomCode && window.isHost) {
        window.socket.emit('selectLevel', { level: parseInt(this.value) });
      }
    };
  }
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
  if (btnStartRace) {
    btnStartRace.onclick = function() {
      window.colorAudio.playUiClick();
      if (window.socket && window.roomCode && window.isHost) {
        window.socket.emit('startRace');
      }
    };
  }
  if (btnLeaveParty) {
    btnLeaveParty.onclick = function() {
      window.colorAudio.playUiClick();
      leaveParty();
    };
  }
  const btnCopyCode = document.getElementById('btnCopyCode');
  const colPartyCode = document.getElementById('colPartyCode');
  if (btnCopyCode) {
    btnCopyCode.onclick = function() {
      let code = (window.roomCode || document.getElementById('partyCodeDisplay').innerText).trim();
      copyTextToClipboard(code, btnCopyCode, 'CODE COPIED: ' + code);
    };
  }
  if (colPartyCode) {
    colPartyCode.onclick = function() {
      let code = (window.roomCode || document.getElementById('partyCodeDisplay').innerText).trim();
      copyTextToClipboard(code, btnCopyCode, 'CODE COPIED: ' + code);
    };
  }
  if (btnCopyPartyLink) {
    btnCopyPartyLink.onclick = function() {
      let code = (window.roomCode || document.getElementById('partyCodeDisplay').innerText).trim();
      let url = window.location.href.split('?')[0] + '?party=' + code;
      copyTextToClipboard(url, btnCopyPartyLink, 'LINK COPIED!');
    };
  }
  let urlParams = new URLSearchParams(window.location.search);
  let partyParam = urlParams.get('party');
  if (partyParam) {
    let joinInput = document.getElementById('inputPartyCode');
    if (joinInput) joinInput.value = partyParam.toUpperCase().trim();
    openPartyModal();
    joinParty(partyParam.toUpperCase().trim());
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
function getRacerName() {
  let name = localStorage.getItem('prism_racer_name');
  if (!name) {
    name = 'Racer ' + Math.floor(100 + Math.random() * 900);
    localStorage.setItem('prism_racer_name', name);
  }
  return name;
}
function createParty() {
  if (!window.socket) return;
  window.colorAudio.init();
  window.colorAudio.playUiClick();
  let racerName = getRacerName();
  window.socket.emit('createRoom', { name: racerName }, function(res) {
    if (res && res.success) {
      window.roomCode = res.code;
      window.isHost = true;
      window.gameMode = 'party';
      document.getElementById('partyCodeDisplay').innerText = res.code;
      document.getElementById('partyInitView').style.display = 'none';
      document.getElementById('partyLobbyView').style.display = 'block';
      let startBtn = document.getElementById('btnStartRace');
      let waitTxt = document.getElementById('guestWaitingText');
      let lvlSel = document.getElementById('partyLevelSelect');
      if (startBtn) startBtn.style.display = 'block';
      if (waitTxt) waitTxt.style.display = 'none';
      if (lvlSel) {
        lvlSel.disabled = false;
        lvlSel.value = res.level || 1;
      }
      renderPartyPlayers(res.players);
      let hudBadge = document.getElementById('hudPartyRoomBadge');
      if (hudBadge) {
        hudBadge.innerText = 'PARTY: ' + res.code;
        hudBadge.style.display = 'inline-block';
      }
      showBanner('PARTY CREATED: ' + res.code, 2500);
    }
  });
}
function joinParty(code) {
  if (!window.socket) return;
  window.colorAudio.init();
  window.colorAudio.playUiClick();
  let upper = (code || '').toUpperCase().trim();
  if (upper.length < 4) {
    alert('Please enter a valid 4-character room code.');
    return;
  }
  let racerName = getRacerName();
  window.socket.emit('joinRoom', { code: upper, name: racerName }, function(res) {
    if (res && res.success) {
      window.roomCode = res.code;
      window.isHost = res.isHost;
      window.gameMode = 'party';
      document.getElementById('partyCodeDisplay').innerText = res.code;
      document.getElementById('partyInitView').style.display = 'none';
      document.getElementById('partyLobbyView').style.display = 'block';
      let startBtn = document.getElementById('btnStartRace');
      let waitTxt = document.getElementById('guestWaitingText');
      let lvlSel = document.getElementById('partyLevelSelect');
      if (startBtn) startBtn.style.display = window.isHost ? 'block' : 'none';
      if (waitTxt) waitTxt.style.display = window.isHost ? 'none' : 'block';
      if (lvlSel) {
        lvlSel.disabled = !window.isHost;
        lvlSel.value = res.level || 1;
      }
      renderPartyPlayers(res.players);
      let hudBadge = document.getElementById('hudPartyRoomBadge');
      if (hudBadge) {
        hudBadge.innerText = 'PARTY: ' + res.code;
        hudBadge.style.display = 'inline-block';
      }
      showBanner('JOINED ROOM: ' + res.code, 2500);
    } else {
      alert(res && res.message ? res.message : 'Could not join room. Check the code.');
    }
  });
}
function leaveParty() {
  if (window.socket && window.roomCode) {
    window.socket.emit('leaveRoom');
  }
  window.roomCode = null;
  window.isHost = false;
  window.gameMode = 'solo';
  if (window.clearOpponents) {
    window.clearOpponents();
  }
  let hudBadge = document.getElementById('hudPartyRoomBadge');
  if (hudBadge) hudBadge.style.display = 'none';
  let initView = document.getElementById('partyInitView');
  let lobbyView = document.getElementById('partyLobbyView');
  if (initView) initView.style.display = 'block';
  if (lobbyView) lobbyView.style.display = 'none';
  showBanner('Left Party Room', 2000);
}
function copyTextToClipboard(text, btnEl, successMsg) {
  window.colorAudio.playUiClick();
  let fallback = function() {
    let ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      if (btnEl) {
        let old = btnEl.innerText;
        btnEl.innerText = 'COPIED!';
        setTimeout(function() { btnEl.innerText = old; }, 2000);
      }
      showBanner(successMsg || 'COPIED TO CLIPBOARD', 2000);
    } catch (e) {
      prompt('Copy:', text);
    }
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (btnEl) {
        let old = btnEl.innerText;
        btnEl.innerText = 'COPIED!';
        setTimeout(function() { btnEl.innerText = old; }, 2000);
      }
      showBanner(successMsg || 'COPIED TO CLIPBOARD', 2000);
    }).catch(function() {
      fallback();
    });
  } else {
    fallback();
  }
}
function renderPartyPlayers(players) {
  let list = document.getElementById('partyPlayersList');
  if (!list || !players) return;
  list.innerHTML = '';
  for (let i = 0; i < players.length; i++) {
    let p = players[i];
    let row = document.createElement('div');
    row.className = 'player-item';
    let isYou = window.socket && (p.id === window.socket.id);
    let nameText = p.name + (isYou ? ' (You)' : '');
    let badgeClass = p.isHost ? 'host' : 'guest';
    let badgeText = p.isHost ? 'HOST' : 'READY';
    row.innerHTML = '<span class="player-name">' + nameText + '</span><span class="player-role-badge ' + badgeClass + '">' + badgeText + '</span>';
    list.appendChild(row);
  }
}
window.ui = {
  setup: setupUI,
  renderLevelGrid: renderLevelGrid,
  updateHUD: updateHUD,
  updateTimer: updateTimer,
  showVictoryModal: showVictoryModal,
  showBanner: showBanner,
  updateHomeStats: updateHomeStats,
  renderPartyPlayers: renderPartyPlayers
};
