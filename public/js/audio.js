// The Color - Sound & Procedural Audio Synthesizer Engine
class ColorAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = false;
    this.masterGain = null;
    this.slowMoFilter = null;
    this.bgmTimer = null;

    // Harmonic frequencies for colors: Red (C4), Blue (E4), Yellow (G4), Green (C5)
    this.colorNotes = {
      red: 261.63,
      blue: 329.63,
      yellow: 392.00,
      green: 523.25
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master audio chain with slow-mo filter
      this.slowMoFilter = this.ctx.createBiquadFilter();
      this.slowMoFilter.type = 'lowpass';
      this.slowMoFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

      this.slowMoFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Smooth filter sweep for slow motion bullet-time
  setSlowMotion(isSlow) {
    if (!this.ctx || !this.slowMoFilter) return;
    const now = this.ctx.currentTime;
    this.slowMoFilter.frequency.cancelScheduledValues(now);
    if (isSlow) {
      // Muffle high frequencies, deep atmospheric resonance
      this.slowMoFilter.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      this.playSubBassThrum();
    } else {
      // Restore full spectrum
      this.slowMoFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.1);
    }
  }

  playSubBassThrum() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Color Switch Chime
  playColorSwitch(color) {
    if (this.isMuted || !this.ctx) return;
    const freq = this.colorNotes[color] || 330;
    const now = this.ctx.currentTime;

    // Harmonic bell chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now); // 1 octave overtone

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.slowMoFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  // Jump sound
  playJump() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Landing sound
  playLand() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Wall Jump sound
  playWallJump() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Bounce Pad
  playBouncePad() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Death / Dissolve
  playDeath() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Discordant dissolve chords
    [320, 290, 240, 180].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(60, now + idx * 0.03 + 0.25);

      gain.gain.setValueAtTime(0.18, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.25);

      osc.connect(gain);
      gain.connect(this.slowMoFilter);

      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.25);
    });
  }

  // Level Clear Fanfare
  playLevelComplete() {
    if (this.isMuted || !this.ctx) return;
    // Radiant ascending pentatonic arpeggio
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C, E, G, C, E, G
    chord.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.slowMoFilter);

        osc.start(now);
        osc.stop(now + 0.5);
      }, i * 90);
    });
  }

  // Tactile UI click
  playUiClick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Tactile UI hover
  playUiHover() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.slowMoFilter);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Ambient Procedural Soundtrack
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  startMusic() {
    this.stopMusic();
    if (!this.ctx || this.isMuted) return;

    // Ambient floating harmonic loop
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66]  // G major
    ];
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.musicEnabled || !this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.slowMoFilter);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    };

    playChordStep();
    this.bgmTimer = setInterval(playChordStep, 3200);
  }

  stopMusic() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.colorAudio = new ColorAudio();
