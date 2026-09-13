import { create } from 'zustand';

export type ControllerButton = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'START' | 'SELECT';

type ButtonListener = (button: ControllerButton) => void;

// Simple Web Audio API 8-bit sound generator
class RetroAudioEngine {
    private ctx: AudioContext | null = null;
    public soundEnabled: boolean = true;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    public playMove() {
        if (!this.soundEnabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } catch {
            // Audio error suppression
        }
    }

    public playSelect() {
        if (!this.soundEnabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.04); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.08); // G5

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch {
            // Audio error suppression
        }
    }

    public playBack() {
        if (!this.soundEnabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        } catch {
            // Audio error suppression
        }
    }

    public playTactileClick() {
        if (!this.soundEnabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(180, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.02);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.02);
        } catch {
            // Audio error suppression
        }
    }
}

export const retroAudio = new RetroAudioEngine();

export interface ControlsState {
    activeButtons: Record<ControllerButton, boolean>;
    lastPressed: { button: ControllerButton; id: number; timestamp: number } | null;
    soundEnabled: boolean;
    pressUp: () => void;
    pressDown: () => void;
    pressLeft: () => void;
    pressRight: () => void;
    pressA: () => void;
    pressB: () => void;
    pressStart: () => void;
    pressSelect: () => void;
    pressButton: (button: ControllerButton) => void;
    releaseButton: (button: ControllerButton) => void;
    toggleSound: () => void;
    addListener: (listener: ButtonListener) => () => void;
}

const listeners = new Set<ButtonListener>();
let eventIdCounter = 0;

export const useControlsStore = create<ControlsState>((set, get) => ({
    activeButtons: {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false,
        A: false,
        B: false,
        START: false,
        SELECT: false
    },
    lastPressed: null,
    soundEnabled: true,

    pressButton: (button: ControllerButton) => {
        const id = ++eventIdCounter;
        const timestamp = Date.now();

        // Trigger authentic retro audio
        if (button === 'A') {
            retroAudio.playSelect();
        } else if (button === 'B') {
            retroAudio.playBack();
        } else if (button === 'LEFT' || button === 'RIGHT' || button === 'UP' || button === 'DOWN') {
            retroAudio.playMove();
        } else {
            retroAudio.playTactileClick();
        }

        set((state) => ({
            activeButtons: {
                ...state.activeButtons,
                [button]: true
            },
            lastPressed: { button, id, timestamp }
        }));

        // Notify active subscribers
        listeners.forEach((listener) => {
            try {
                listener(button);
            } catch (err) {
                console.error('Error in controller listener:', err);
            }
        });

        // Automatically release active visual state after 120ms if not explicitly released
        setTimeout(() => {
            get().releaseButton(button);
        }, 120);
    },

    releaseButton: (button: ControllerButton) => {
        set((state) => {
            if (!state.activeButtons[button]) return state;
            return {
                activeButtons: {
                    ...state.activeButtons,
                    [button]: false
                }
            };
        });
    },

    pressUp: () => get().pressButton('UP'),
    pressDown: () => get().pressButton('DOWN'),
    pressLeft: () => get().pressButton('LEFT'),
    pressRight: () => get().pressButton('RIGHT'),
    pressA: () => get().pressButton('A'),
    pressB: () => get().pressButton('B'),
    pressStart: () => get().pressButton('START'),
    pressSelect: () => get().pressButton('SELECT'),

    toggleSound: () => {
        set((state) => {
            const next = !state.soundEnabled;
            retroAudio.soundEnabled = next;
            return { soundEnabled: next };
        });
    },

    addListener: (listener: ButtonListener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
}));
