class SoundManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  deathGain: GainNode | null = null;
  isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);
      
      this.deathGain = this.ctx.createGain();
      this.deathGain.gain.value = 0.5;
      this.deathGain.connect(this.masterGain);
      
      this.isInitialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  async checkContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setVolumes(musicVol: number, sfxVol: number, deathVol?: number) {
    if (!this.ctx) return;
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0.001, sfxVol), this.ctx.currentTime, 0.1);
    }
    if (this.deathGain && deathVol !== undefined) {
      this.deathGain.gain.setTargetAtTime(Math.max(0.001, deathVol), this.ctx.currentTime, 0.1);
    }
  }

  async playJump() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    // Classic retro jump: freq slide from 140 to 440
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.1);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.12);
  }

  async playDie(soundId?: string) {
    await this.checkContext();
    if (!this.ctx || !this.deathGain) return;
    
    const t = this.ctx.currentTime;
    
    if (soundId === 'fart') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      for (let i = 0; i < 5; i++) {
        osc.frequency.linearRampToValueAtTime(80 + Math.random() * 40, t + 0.05 * i);
      }
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.3);
    } else if (soundId === 'explosion') {
      const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, t);
      filter.frequency.exponentialRampToValueAtTime(50, t + 0.5);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      noise.connect(filter); filter.connect(gain); gain.connect(this.deathGain);
      noise.start(t);
    } else if (soundId === 'whistle_down') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.8);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.8);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.8);
    } else if (soundId === 'power_down') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.5);
    } else if (soundId === 'crunch') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(50, t + 0.1);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.2);
    } else if (soundId === 'glitch') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(200, t + 0.05);
      osc.frequency.setValueAtTime(600, t + 0.1);
      osc.frequency.setValueAtTime(100, t + 0.15);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.25);
    } else if (soundId === 'sad_trombone') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      
      const freqs = [300, 280, 260, 200];
      const step = 0.3;
      freqs.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, t + i * step);
        if (i === freqs.length - 1) {
            osc.frequency.linearRampToValueAtTime(f - 50, t + i * step + 0.6);
        }
      });
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.setValueAtTime(0.3, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 1.2);
    } else if (soundId === 'splat') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.15);
    } else if (soundId === 'boing_die') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain); gain.connect(this.deathGain);
      osc.start(t); osc.stop(t + 0.4);
    } else if (soundId === 'glass') {
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      noise.connect(filter); filter.connect(gain); gain.connect(this.deathGain);
      noise.start(t);
    } else {
      // Improved standard death (retro crunch + bass drop)
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.4);
      
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(150, t);
      osc2.frequency.linearRampToValueAtTime(20, t + 0.4);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.deathGain);
      
      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.4);
      osc2.stop(t + 0.4);
    }
  }

  async playCoin() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Sine wave for clean "ding"
    osc.type = 'sine';
    // High pitch, slight upward inflection
    osc.frequency.setValueAtTime(1000, t);
    osc.frequency.linearRampToValueAtTime(1800, t + 0.05);
    
    // Very short ping
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.3);
  }

  async playBuild() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Short distinct 'blip'
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.05);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.05);
  }

  async playPowerup() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Rising "power up" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.3);
  }

  async playWin() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.1;
      const duration = 0.2;
      
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  async playSecret() {
    await this.checkContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.4);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  async playSfx(type: string) {
    switch (type) {
      case 'jump': await this.playJump(); break;
      case 'die': await this.playDie(); break;
      case 'coin': await this.playCoin(); break;
      case 'build': await this.playBuild(); break;
      case 'powerup': await this.playPowerup(); break;
      case 'secret': await this.playSecret(); break;
      case 'win':
      case 'goal': 
        await this.playWin(); 
        break;
    }
  }
}

export const audio = new SoundManager();