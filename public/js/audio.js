let audioCtx = null;
let isMuted = false;
let isMusicOn = false;
let masterGain = null;
let slowMoFilter = null;
let bgmTimer = null;
const colorNotes = {
  red: 261.63,
  blue: 329.63,
  yellow: 392.00,
  green: 523.25
};
function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    slowMoFilter = audioCtx.createBiquadFilter();
    slowMoFilter.type = 'lowpass';
    slowMoFilter.frequency.setValueAtTime(20000, audioCtx.currentTime);
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
    slowMoFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
function toggleMute() {
  isMuted = !isMuted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, audioCtx.currentTime);
  }
  return isMuted;
}
function setSlowMotion(isSlow) {
  if (!audioCtx || !slowMoFilter) return;
  const now = audioCtx.currentTime;
  slowMoFilter.frequency.cancelScheduledValues(now);
  if (isSlow) {
    slowMoFilter.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    playSubBass();
  } else {
    slowMoFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.1);
  }
}
function playSubBass() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(85, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.25);
}
function playColorSwitch(color) {
  if (isMuted || !audioCtx) return;
  const freq = colorNotes[color] || 330;
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now);
  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(slowMoFilter);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
}
function playJump() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.12);
}
function playLand() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.08);
}
function playWallJump() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(240, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.09);
}
function playBouncePad() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.22);
}
function playDeath() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const freqs = [320, 290, 240, 180];
  for (let i = 0; i < freqs.length; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqs[i], now + i * 0.03);
    osc.frequency.exponentialRampToValueAtTime(60, now + i * 0.03 + 0.25);
    gain.gain.setValueAtTime(0.18, now + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.25);
    osc.connect(gain);
    gain.connect(slowMoFilter);
    osc.start(now + i * 0.03);
    osc.stop(now + i * 0.03 + 0.25);
  }
}
function playLevelComplete() {
  if (isMuted || !audioCtx) return;
  const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
  for (let i = 0; i < chord.length; i++) {
    setTimeout(function() {
      if (!audioCtx || isMuted) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chord[i], now);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(slowMoFilter);
      osc.start(now);
      osc.stop(now + 0.5);
    }, i * 90);
  }
}
function playUiClick() {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(slowMoFilter);
  osc.start(now);
  osc.stop(now + 0.04);
}
function toggleMusic() {
  isMusicOn = !isMusicOn;
  if (isMusicOn) {
    startMusic();
  } else {
    stopMusic();
  }
  return isMusicOn;
}
function startMusic() {
  stopMusic();
  if (!audioCtx || isMuted) return;
  const chords = [
    [261.63, 329.63, 392.00],
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63],
    [196.00, 246.94, 293.66]
  ];
  let step = 0;
  function playStep() {
    if (!isMusicOn || !audioCtx || isMuted) return;
    const now = audioCtx.currentTime;
    const currentChord = chords[step % chords.length];
    step++;
    for (let i = 0; i < currentChord.length; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(currentChord[i], now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
      osc.connect(gain);
      gain.connect(slowMoFilter);
      osc.start(now);
      osc.stop(now + 3.2);
    }
  }
  playStep();
  bgmTimer = setInterval(playStep, 3200);
}
function stopMusic() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}
window.colorAudio = {
  init: initAudio,
  toggleMute: toggleMute,
  setSlowMotion: setSlowMotion,
  playColorSwitch: playColorSwitch,
  playJump: playJump,
  playLand: playLand,
  playWallJump: playWallJump,
  playBouncePad: playBouncePad,
  playDeath: playDeath,
  playLevelComplete: playLevelComplete,
  playUiClick: playUiClick,
  toggleMusic: toggleMusic
};
