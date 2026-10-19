/**
 * Web Audio API synthesized sound generator for gift box interactions and background music.
 * Requires no external audio assets; works reliably across all browsers.
 */

let audioCtx: AudioContext | null = null;
let bgmTimer: ReturnType<typeof setInterval> | null = null;
let isBgmActive = false;
let bgmStep = 0;
let musicAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Romantic music box melody (frequencies in Hz)
const MELODY = [
  // Phrase 1: Sweet & Tender
  { freq: 523.25, dur: 0.4 }, // C5
  { freq: 659.25, dur: 0.4 }, // E5
  { freq: 783.99, dur: 0.5 }, // G5
  { freq: 987.77, dur: 0.6 }, // B5
  { freq: 880.00, dur: 0.4 }, // A5
  { freq: 783.99, dur: 0.4 }, // G5
  { freq: 659.25, dur: 0.6 }, // E5
  { freq: 587.33, dur: 0.5 }, // D5

  // Phrase 2: Gentle lift
  { freq: 523.25, dur: 0.4 }, // C5
  { freq: 659.25, dur: 0.4 }, // E5
  { freq: 880.00, dur: 0.5 }, // A5
  { freq: 1046.50, dur: 0.7 }, // C6
  { freq: 987.77, dur: 0.4 }, // B5
  { freq: 783.99, dur: 0.5 }, // G5
  { freq: 659.25, dur: 0.5 }, // E5
  { freq: 523.25, dur: 0.8 }, // C5
];

export const SoundEngine = {
  isMusicPlaying(): boolean {
    return isBgmActive;
  },

  // Có URL thì phát file nhạc thay cho giai điệu tự tạo; truyền rỗng để quay lại giai điệu tự tạo.
  setMusicSource(url?: string) {
    musicAudio?.pause();
    musicAudio = null;
    if (!url || typeof Audio === 'undefined') return;

    musicAudio = new Audio(url);
    musicAudio.loop = true;
    musicAudio.volume = 0.6;
    musicAudio.preload = 'auto';
  },

  // Chỉ bật (không tắt) và chỉ báo true khi nhạc phát thật; trình duyệt chặn tự phát khi chưa có thao tác người dùng thì trả false.
  async startMusic(onStateChange?: (playing: boolean) => void): Promise<boolean> {
    if (isBgmActive) return true;

    if (musicAudio) {
      getAudioContext();
      try {
        await musicAudio.play();
      } catch {
        return false;
      }
      if (!isBgmActive) {
        isBgmActive = true;
        onStateChange?.(true);
      }
      return true;
    }

    const ctx = getAudioContext();
    if (!ctx) return false;
    try {
      await ctx.resume();
    } catch {
      return false;
    }
    if (ctx.state !== 'running') return false;
    if (!isBgmActive) this.toggleMusic(onStateChange);
    return true;
  },

  toggleMusic(onStateChange?: (playing: boolean) => void): boolean {
    // Gọi sớm để AudioContext được resume ngay trong cú chạm của người dùng, nếu không các hiệu ứng âm thanh sau sẽ bị câm.
    const ctx = getAudioContext();

    if (musicAudio) {
      if (isBgmActive) {
        musicAudio.pause();
        isBgmActive = false;
        onStateChange?.(false);
        return false;
      }

      isBgmActive = true;
      musicAudio.play().catch((error) => {
        console.warn('Không phát được file nhạc nền:', error);
        isBgmActive = false;
        onStateChange?.(false);
      });
      onStateChange?.(true);
      return true;
    }

    if (!ctx) return false;

    if (isBgmActive) {
      if (bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      }
      isBgmActive = false;
      onStateChange?.(false);
      return false;
    } else {
      isBgmActive = true;
      this.playMelodyStep();
      bgmTimer = setInterval(() => {
        if (!isBgmActive) return;
        this.playMelodyStep();
      }, 550);
      onStateChange?.(true);
      return true;
    }
  },

  playMelodyStep() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const note = MELODY[bgmStep % MELODY.length];
    bgmStep++;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(note.freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.dur);

    harmonicGain.gain.setValueAtTime(0.0001, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.015, now + 0.04);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + note.dur * 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + note.dur + 0.05);
    harmonic.stop(now + note.dur + 0.05);
  },

  playUntieBow() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    // Fluttering glissando of untying silky ribbon
    const freqs = [600, 750, 920, 1150, 1400];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.18);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  },

  playLidPop() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    // Pop sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Warm bell follow-up
    setTimeout(() => {
      SoundEngine.playSparkle();
    }, 150);
  },

  playSparkle() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const chord = [880, 1108.73, 1318.51, 1760]; // A Major sparkle
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  },

  playHeartPop() {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
};
