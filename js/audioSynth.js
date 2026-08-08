/**
 * FloraMagic Wand - Web Audio API Synthesizer
 * Generates sparkling pentatonic chime tones and ambient magical soundscapes.
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.initialized = false;

    // Pentatonic scale frequencies (C major / A minor pentatonic across 3 octaves)
    this.scales = {
      sakura: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66],
      lotus: [220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00, 1046.50],
      rose: [196.00, 233.08, 261.63, 293.66, 349.23, 392.00, 466.16, 523.25, 587.33, 698.46, 783.99, 932.33],
      sunflower: [246.94, 293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99, 880.00, 987.77, 1174.66],
      cosmos: [277.18, 311.13, 369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 830.61, 932.33, 1108.73, 1244.51],
      custom: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]
    };

    this.currentTheme = 'sakura';
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setTheme(themeName) {
    if (this.scales[themeName]) {
      this.currentTheme = themeName;
    }
  }

  setVolume(volPercent) {
    this.volume = volPercent / 100;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Plays a magical chime note when a flower blooms.
   * @param {number} x Screen X coordinate (maps to stereo pan)
   * @param {number} y Screen Y coordinate (maps to pitch frequency)
   * @param {number} width Screen width
   * @param {number} height Screen height
   * @param {number} scale Flower scale multiplier
   */
  playFlowerBloomSound(x, y, width, height, scale = 1.0) {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pick note based on Y position (inverted: top of screen = high pitch, bottom = low)
    const scaleNotes = this.scales[this.currentTheme] || this.scales.sakura;
    const normalizedY = 1 - Math.max(0, Math.min(1, y / height));
    const noteIndex = Math.floor(normalizedY * scaleNotes.length);
    const baseFreq = scaleNotes[Math.min(noteIndex, scaleNotes.length - 1)];

    // Stereo Panner
    let pannerNode = null;
    if (this.ctx.createStereoPanner) {
      pannerNode = this.ctx.createStereoPanner();
      const panVal = (x / width) * 2 - 1; // -1 (left) to +1 (right)
      pannerNode.pan.setValueAtTime(Math.max(-1, Math.min(1, panVal)), now);
    }

    // Main Chime Oscillator (Sine wave)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    // Harmonic Bell Layer (Triangle wave + 1 octave up)
    const bellOsc = this.ctx.createOscillator();
    bellOsc.type = 'triangle';
    bellOsc.frequency.setValueAtTime(baseFreq * 2, now);

    // Envelope Gain
    const noteGain = this.ctx.createGain();
    const bellGain = this.ctx.createGain();

    const peakVolume = Math.min(0.25, 0.08 * scale);
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(peakVolume, now + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + scale * 0.2);

    bellGain.gain.setValueAtTime(0.001, now);
    bellGain.gain.exponentialRampToValueAtTime(peakVolume * 0.4, now + 0.02);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    // Connect nodes
    osc.connect(noteGain);
    bellOsc.connect(bellGain);

    const destinationNode = pannerNode ? pannerNode : this.masterGain;
    if (pannerNode) pannerNode.connect(this.masterGain);

    noteGain.connect(destinationNode);
    bellGain.connect(destinationNode);

    // Start & Stop
    osc.start(now);
    bellOsc.start(now);
    osc.stop(now + 1.2);
    bellOsc.stop(now + 0.6);
  }
}

// Global Audio Instance
window.audioSynth = new AudioSynthesizer();
