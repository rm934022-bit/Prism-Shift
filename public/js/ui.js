// The Color - Tactile Minimalist UI & Level Selection Controller
class UIManager {
  constructor() {
    this.game = null;
    this.currentTierTab = 1;
    this.bindElements();
  }

  setGame(game) {
    this.game = game;
    this.renderLevelGrid();
  }

  bindElements() {
    // Level Select Modal Toggle
    const btnOpenLevels = document.getElementById('btnOpenLevels');
    const modalLevels = document.getElementById('modalLevels');
    const btnCloseLevels = document.getElementById('btnCloseLevels');

    if (btnOpenLevels && modalLevels) {
      btnOpenLevels.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        this.renderLevelGrid();
        modalLevels.style.display = 'flex';
      });
      btnCloseLevels.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        modalLevels.style.display = 'none';
      });
    }

    // Party Modal Toggle
    const btnOpenParty = document.getElementById('btnOpenParty');
    const modalParty = document.getElementById('modalParty');
    const btnCloseParty = document.getElementById('btnCloseParty');

    if (btnOpenParty && modalParty) {
      btnOpenParty.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        modalParty.style.display = 'flex';
      });
      btnCloseParty.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        modalParty.style.display = 'none';
      });
    }

    // Tier Tabs in Level Select
    document.querySelectorAll('.tier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        document.querySelectorAll('.tier-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTierTab = parseInt(btn.dataset.tier);
        this.renderLevelGrid();
      });
    });

    // Sound & Music Toggles
    const btnAudio = document.getElementById('btnAudioToggle');
    const btnMusic = document.getElementById('btnMusicToggle');

    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = window.colorAudio.toggleMute();
        btnAudio.innerText = isMuted ? '🔇' : '🔊';
        btnAudio.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
      });
    }

    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        const isMusic = window.colorAudio.toggleMusic();
        btnMusic.classList.toggle('active', isMusic);
        btnMusic.title = isMusic ? 'Music: ON' : 'Music: OFF';
      });
    }

    // Quick Color Buttons in HUD
    document.querySelectorAll('.hud-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        if (this.game && this.game.player) {
          this.game.player.setColor(dot.dataset.color);
        }
      });
    });

    // Victory Modal Buttons
    const btnNextLevel = document.getElementById('btnNextLevel');
    const btnRetry = document.getElementById('btnRetry');
    const btnLevelSelectFromVic = document.getElementById('btnLevelSelectFromVic');

    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        document.getElementById('modalVictory').style.display = 'none';
        if (this.game) {
          this.game.loadLevel(this.game.currentLevelIndex + 1);
        }
      });
    }

    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        document.getElementById('modalVictory').style.display = 'none';
        if (this.game) {
          this.game.restartLevel();
        }
      });
    }

    if (btnLevelSelectFromVic) {
      btnLevelSelectFromVic.addEventListener('click', () => {
        window.colorAudio.playUiClick();
        document.getElementById('modalVictory').style.display = 'none';
        this.renderLevelGrid();
        document.getElementById('modalLevels').style.display = 'flex';
      });
    }

    // Party Code Buttons
    const btnCreateParty = document.getElementById('btnCreateParty');
    const btnJoinParty = document.getElementById('btnJoinParty');
    const btnCopyPartyLink = document.getElementById('btnCopyPartyLink');

    if (btnCreateParty) {
      btnCreateParty.addEventListener('click', () => {
        this.createParty();
      });
    }

    if (btnJoinParty) {
      btnJoinParty.addEventListener('click', () => {
        const code = document.getElementById('inputPartyCode').value.trim();
        if (code) {
          this.joinParty(code);
        }
      });
    }

    if (btnCopyPartyLink) {
      btnCopyPartyLink.addEventListener('click', () => {
        const code = document.getElementById('partyCodeDisplay').innerText;
        const url = window.location.origin + window.location.pathname + `?party=${code}`;
        navigator.clipboard.writeText(url).then(() => {
          btnCopyPartyLink.innerText = 'COPIED!';
          setTimeout(() => { btnCopyPartyLink.innerText = 'COPY LINK'; }, 2000);
        });
      });
    }
  }

  renderLevelGrid() {
    const grid = document.getElementById('levelCardsGrid');
    if (!grid || !this.game) return;

    grid.innerHTML = '';
    const tier = this.currentTierTab;
    const startIdx = (tier - 1) * 10 + 1;
    const endIdx = tier * 10;

    for (let i = startIdx; i <= endIdx; i++) {
      const lvl = this.game.levels.levels.find(l => l.id === i);
      if (!lvl) continue;

      const isUnlocked = i <= (this.game.progress.unlockedLevel || 1);
      const isCurrent = i === this.game.currentLevelIndex;
      const stars = this.game.progress.stars[i] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;

      let starHtml = '';
      for (let s = 1; s <= 3; s++) {
        starHtml += `<span class="star-icon ${s <= stars ? 'earned' : ''}">★</span>`;
      }

      card.innerHTML = `
        <div class="level-num">${i < 10 ? '0' + i : i}</div>
        <div class="level-title">${lvl.name.replace(/^Sector \d+: /, '')}</div>
        <div class="level-stars">${isUnlocked ? starHtml : '🔒 LOCKED'}</div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          window.colorAudio.playUiClick();
          document.getElementById('modalLevels').style.display = 'none';
          this.game.loadLevel(i);
        });
      }

      grid.appendChild(card);
    }
  }

  updateHUD(level, time, deaths) {
    const titleEl = document.getElementById('hudLevelName');
    const tierEl = document.getElementById('hudTierName');
    if (titleEl) titleEl.innerText = level.name;
    if (tierEl) tierEl.innerText = level.tierName;
  }

  updateTimer(time, timeLimit) {
    const timerEl = document.getElementById('hudTimer');
    if (!timerEl) return;

    const remaining = Math.max(0, timeLimit - time);
    const secs = remaining.toFixed(1);
    timerEl.innerText = `${secs}s`;

    if (remaining < 5) {
      timerEl.classList.add('urgent');
    } else {
      timerEl.classList.remove('urgent');
    }
  }

  showVictoryModal(data) {
    const modal = document.getElementById('modalVictory');
    const levelName = document.getElementById('vicLevelName');
    const timeVal = document.getElementById('vicTime');
    const deathsVal = document.getElementById('vicDeaths');
    const starsContainer = document.getElementById('vicStars');
    const btnNext = document.getElementById('btnNextLevel');

    levelName.innerText = data.level.name;
    timeVal.innerText = `${data.time.toFixed(1)}s (Target: <${data.level.targetTime}s)`;
    deathsVal.innerText = data.deaths === 0 ? '0 (Flawless!)' : `${data.deaths} deaths`;

    starsContainer.innerHTML = '';
    for (let s = 1; s <= 3; s++) {
      const star = document.createElement('span');
      star.className = `vic-star ${s <= data.stars ? 'earned' : ''}`;
      star.innerText = '★';
      starsContainer.appendChild(star);
    }

    if (btnNext) {
      btnNext.style.display = data.nextLevelAvailable ? 'inline-block' : 'none';
    }

    modal.style.display = 'flex';
  }

  showBanner(text, duration = 2500) {
    const banner = document.getElementById('globalBanner');
    if (!banner) return;
    banner.innerText = text;
    banner.style.opacity = '1';
    banner.style.transform = 'translate(-50%, -50%) scale(1)';

    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, -50%) scale(0.85)';
    }, duration);
  }

  createParty() {
    if (!this.game || !this.game.socket) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];

    this.game.socket.emit('joinRoom', { code, name: 'Host' }, () => {
      this.game.roomCode = code;
      this.game.mode = 'party';
      document.getElementById('partyCodeDisplay').innerText = code;
      document.getElementById('partyActiveSection').style.display = 'block';
      document.getElementById('partyLobbySection').style.display = 'none';
      this.showBanner(`PARTY CODE: ${code}`, 3000);
    });
  }

  joinParty(code) {
    if (!this.game || !this.game.socket) return;
    this.game.socket.emit('joinRoom', { code: code.toUpperCase(), name: 'Racer' }, () => {
      this.game.roomCode = code.toUpperCase();
      this.game.mode = 'party';
      document.getElementById('partyCodeDisplay').innerText = code.toUpperCase();
      document.getElementById('partyActiveSection').style.display = 'block';
      document.getElementById('partyLobbySection').style.display = 'none';
      document.getElementById('modalParty').style.display = 'none';
      this.showBanner(`JOINED PARTY: ${code.toUpperCase()}`, 3000);
    });
  }
}

window.uiManager = new UIManager();
