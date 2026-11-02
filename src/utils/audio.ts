/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for Katana blade sound effects and ambient Japanese soundscape
class KatanaSoundscape {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientRunning: boolean = false;
  private chimeTimer: number | null = null;

  private initCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic Katana Draw & Lightning Slash sound
  public playKatanaSlash() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. Blade air whoosh (filtered white noise with sharp envelope)
      const bufferSize = ctx.sampleRate * 0.45;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const whooshFilter = ctx.createBiquadFilter();
      whooshFilter.type = 'bandpass';
      whooshFilter.frequency.setValueAtTime(450, now);
      whooshFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      whooshFilter.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      whooshFilter.Q.setValueAtTime(3.5, now);

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.001, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noiseSource.connect(whooshFilter);
      whooshFilter.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      noiseSource.start(now);

      // 2. High-tensile steel metallic ring (FM synth with harmonics)
      const fundamental = 1680;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const ringGain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(fundamental, now);
      osc1.frequency.exponentialRampToValueAtTime(fundamental * 0.98, now + 1.2);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(fundamental * 2.76, now);
      osc2.frequency.exponentialRampToValueAtTime(fundamental * 2.72, now + 1.0);

      ringGain.gain.setValueAtTime(0.001, now);
      ringGain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(ringGain);
      osc2.connect(ringGain);
      ringGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);

      // 3. Impact bass thump
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.32);
    } catch (e) {
      console.warn('Audio playKatanaSlash failed', e);
    }
  }

  // Shattered Ceramic Pot Sound (Clay fracture & falling fragments)
  public playCeramicShatter() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Crack burst
      const crackOsc = ctx.createOscillator();
      const crackGain = ctx.createGain();
      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(2800, now);
      crackOsc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

      crackGain.gain.setValueAtTime(0.3, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      crackOsc.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackOsc.start(now);
      crackOsc.stop(now + 0.12);

      // Clattering fragments
      for (let i = 0; i < 4; i++) {
        const delay = 0.04 + i * 0.06 + Math.random() * 0.03;
        const chipOsc = ctx.createOscillator();
        const chipGain = ctx.createGain();
        chipOsc.type = 'sine';
        chipOsc.frequency.setValueAtTime(900 + Math.random() * 1400, now + delay);

        chipGain.gain.setValueAtTime(0.001, now + delay);
        chipGain.gain.exponentialRampToValueAtTime(0.12, now + delay + 0.01);
        chipGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        chipOsc.connect(chipGain);
        chipGain.connect(ctx.destination);
        chipOsc.start(now + delay);
        chipOsc.stop(now + delay + 0.15);
      }
    } catch (e) {
      console.warn('Audio playCeramicShatter failed', e);
    }
  }

  // Blade glint shine shimmer
  public playBladeGlint() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.linearRampToValueAtTime(3600, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      console.warn('Audio playBladeGlint failed', e);
    }
  }

  // Ambient soundscape (Wind + Insen Japanese pentatonic scale water bells)
  public startAmbient() {
    if (this.ambientRunning) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      this.ambientRunning = true;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3.0);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      // Soft wind noise
      const bufferSize = ctx.sampleRate * 2.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.035;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      // Traditional Hirajoshi Japanese scale notes: D4, Eb4, G4, A4, Bb4, D5
      const notes = [293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25];

      const playWaterBell = () => {
        if (!this.ambientRunning || !this.ctx || this.ctx.state === 'closed') return;
        const actx = this.ctx;
        const now = actx.currentTime;

        const osc = actx.createOscillator();
        const bellGain = actx.createGain();

        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        bellGain.gain.setValueAtTime(0.001, now);
        bellGain.gain.exponentialRampToValueAtTime(0.065, now + 0.06);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(bellGain);
        bellGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 4.0);

        const next = 2400 + Math.random() * 3200;
        this.chimeTimer = window.setTimeout(playWaterBell, next);
      };

      playWaterBell();
    } catch (e) {
      console.warn('Audio startAmbient failed', e);
    }
  }

  public stopAmbient() {
    this.ambientRunning = false;
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      } catch (e) {
        // ignore
      }
    }
  }

  public toggleAmbient(): boolean {
    if (this.ambientRunning) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  public isAmbientOn(): boolean {
    return this.ambientRunning;
  }
}

export const soundscape = new KatanaSoundscape();
