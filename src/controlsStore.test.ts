import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useControlsStore } from './controlsStore';

describe('useControlsStore', () => {
    beforeEach(() => {
        // Reset state before each test
        const state = useControlsStore.getState();
        state.releaseButton('UP');
        state.releaseButton('DOWN');
        state.releaseButton('LEFT');
        state.releaseButton('RIGHT');
        state.releaseButton('A');
        state.releaseButton('B');
        state.releaseButton('START');
        state.releaseButton('SELECT');
    });

    it('exposes press functions for all controller buttons', () => {
        const store = useControlsStore.getState();
        expect(typeof store.pressUp).toBe('function');
        expect(typeof store.pressDown).toBe('function');
        expect(typeof store.pressLeft).toBe('function');
        expect(typeof store.pressRight).toBe('function');
        expect(typeof store.pressA).toBe('function');
        expect(typeof store.pressB).toBe('function');
        expect(typeof store.pressStart).toBe('function');
        expect(typeof store.pressSelect).toBe('function');
    });

    it('updates lastPressed and activeButtons when pressButton is called', () => {
        const store = useControlsStore.getState();
        store.pressA();

        const updatedState = useControlsStore.getState();
        expect(updatedState.lastPressed?.button).toBe('A');
        expect(updatedState.activeButtons.A).toBe(true);
        expect(updatedState.activeButtons.B).toBe(false);
    });

    it('notifies registered listeners on button press and supports unsubscription', () => {
        const store = useControlsStore.getState();
        const listener = vi.fn();
        const unsubscribe = store.addListener(listener);

        store.pressLeft();
        expect(listener).toHaveBeenCalledWith('LEFT');

        store.pressRight();
        expect(listener).toHaveBeenCalledWith('RIGHT');

        unsubscribe();
        store.pressUp();
        expect(listener).not.toHaveBeenCalledWith('UP');
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('toggles sound setting', () => {
        const initial = useControlsStore.getState().soundEnabled;
        useControlsStore.getState().toggleSound();
        expect(useControlsStore.getState().soundEnabled).toBe(!initial);
        useControlsStore.getState().toggleSound();
        expect(useControlsStore.getState().soundEnabled).toBe(initial);
    });

    it('triggers each individual press method correctly', () => {
        const store = useControlsStore.getState();
        const listener = vi.fn();
        const unsubscribe = store.addListener(listener);

        store.pressUp();
        expect(listener).toHaveBeenLastCalledWith('UP');

        store.pressDown();
        expect(listener).toHaveBeenLastCalledWith('DOWN');

        store.pressLeft();
        expect(listener).toHaveBeenLastCalledWith('LEFT');

        store.pressRight();
        expect(listener).toHaveBeenLastCalledWith('RIGHT');

        store.pressA();
        expect(listener).toHaveBeenLastCalledWith('A');

        store.pressB();
        expect(listener).toHaveBeenLastCalledWith('B');

        store.pressStart();
        expect(listener).toHaveBeenLastCalledWith('START');

        store.pressSelect();
        expect(listener).toHaveBeenLastCalledWith('SELECT');

        unsubscribe();
    });

    it('remains resilient if one listener throws an error', () => {
        const store = useControlsStore.getState();
        const badListener = vi.fn(() => {
            throw new Error('Listener crash');
        });
        const goodListener = vi.fn();

        const unsub1 = store.addListener(badListener);
        const unsub2 = store.addListener(goodListener);

        expect(() => store.pressA()).not.toThrow();
        expect(goodListener).toHaveBeenCalledWith('A');

        unsub1();
        unsub2();
    });
});
