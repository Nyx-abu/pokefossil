// Web Audio API Retro Sound Effects Synthesizer

export type ControlButton = 'A' | 'B' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'START' | 'SELECT';

let audioCtx: AudioContext | null = null;

/**
 * Lazily initialize and resume the AudioContext upon user gesture.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Audio context resume might be prevented if not in user gesture
    });
  }

  return audioCtx;
}

/**
 * Synthesizes authentic 8-bit retro Game Boy audio clicks and blips.
 */
export function playRetroSound(button: ControlButton): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Square wave creates the classic 8-bit chip sound
    osc.type = 'square';

    switch (button) {
      case 'A': {
        // High ascending double-blip (Select / Confirm)
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880.0, now + 0.04); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'B': {
        // Descending double-blip (Cancel / Back)
        osc.frequency.setValueAtTime(440.0, now); // A4
        osc.frequency.setValueAtTime(311.13, now + 0.04); // Eb4
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'UP':
      case 'DOWN':
      case 'LEFT':
      case 'RIGHT': {
        // Snappy directional cursor blip
        const freqs: Record<string, number> = {
          UP: 587.33,   // D5
          DOWN: 493.88, // B4
          LEFT: 523.25, // C5
          RIGHT: 554.37 // C#5
        };
        const freq = freqs[button] || 523.25;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
        break;
      }
      case 'START': {
        // Classic menu opening chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'SELECT': {
        // Subtle soft toggle blip
        osc.frequency.setValueAtTime(739.99, now); // F#5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
    }
  } catch (err) {
    console.warn('Retro audio playback failed:', err);
  }
}
