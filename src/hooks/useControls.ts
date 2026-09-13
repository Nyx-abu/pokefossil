import React, { useCallback, useEffect } from 'react';
import { useStore, Screen } from '../store';
import { useControlsStore, ControllerButton } from '../controlsStore';

const NAV_SCREENS: Screen[] = ['DASHBOARD', 'BOXES', 'GHOSTS', 'LEGITIMACY', 'JOURNEY'];

export function useControls() {
  const { currentScreen, setScreen, saveFile, reset } = useStore();
  const activeButtons = useControlsStore((state) => state.activeButtons);
  const lastPressed = useControlsStore((state) => state.lastPressed);
  const soundEnabled = useControlsStore((state) => state.soundEnabled);
  const pressButton = useControlsStore((state) => state.pressButton);
  const releaseButton = useControlsStore((state) => state.releaseButton);
  const toggleSound = useControlsStore((state) => state.toggleSound);

  // Handle button press: play retro sound, update state, and perform contextual actions
  const handleButtonAction = useCallback((button: ControllerButton) => {
    pressButton(button);

    // If on DROP screen and A is pressed, trigger file upload dialog
    if (currentScreen === 'DROP') {
      if (button === 'A') {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (fileInput) {
          fileInput.click();
        }
      }
      return;
    }

    // Save file is loaded: contextual actions
    if (saveFile) {
      if (button === 'B') {
        if (currentScreen !== 'DASHBOARD') {
          setScreen('DASHBOARD');
        }
      } else if (currentScreen !== 'DASHBOARD') {
        // When outside DASHBOARD, LEFT/RIGHT cycles between sub-screens
        if (button === 'RIGHT') {
          const currentIndex = NAV_SCREENS.indexOf(currentScreen);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % NAV_SCREENS.length;
            setScreen(NAV_SCREENS[nextIndex]);
          }
        } else if (button === 'LEFT') {
          const currentIndex = NAV_SCREENS.indexOf(currentScreen);
          if (currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + NAV_SCREENS.length) % NAV_SCREENS.length;
            setScreen(NAV_SCREENS[prevIndex]);
          }
        }
      }
      // Note: When on DASHBOARD, LEFT/RIGHT/A are handled directly by Dashboard.tsx via controlsStore listener

      if (button === 'UP') {
        const screenEl = document.querySelector('.neu-screen');
        if (screenEl) {
          screenEl.scrollBy({ top: -120, behavior: 'smooth' });
        }
      } else if (button === 'DOWN') {
        const screenEl = document.querySelector('.neu-screen');
        if (screenEl) {
          screenEl.scrollBy({ top: 120, behavior: 'smooth' });
        }
      } else if (button === 'START') {
        if (currentScreen !== 'DASHBOARD') {
          setScreen('DASHBOARD');
        }
      } else if (button === 'SELECT') {
        toggleSound();
      }
    }
  }, [currentScreen, saveFile, setScreen, toggleSound, pressButton]);

  // Keyboard controls for desktop convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      let btn: ControllerButton | null = null;
      switch (e.key) {
        case 'ArrowUp':
          btn = 'UP';
          break;
        case 'ArrowDown':
          btn = 'DOWN';
          break;
        case 'ArrowLeft':
          btn = 'LEFT';
          break;
        case 'ArrowRight':
          btn = 'RIGHT';
          break;
        case 'z':
        case 'Z':
        case 'Enter':
          btn = 'A';
          break;
        case 'x':
        case 'X':
        case 'Backspace':
          btn = 'B';
          break;
        case ' ':
          btn = 'START';
          break;
        case 'Shift':
        case 'Tab':
          btn = 'SELECT';
          if (e.key === 'Tab') e.preventDefault();
          break;
      }

      if (btn) {
        handleButtonAction(btn);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let btn: ControllerButton | null = null;
      switch (e.key) {
        case 'ArrowUp': btn = 'UP'; break;
        case 'ArrowDown': btn = 'DOWN'; break;
        case 'ArrowLeft': btn = 'LEFT'; break;
        case 'ArrowRight': btn = 'RIGHT'; break;
        case 'z': case 'Z': case 'Enter': btn = 'A'; break;
        case 'x': case 'X': case 'Backspace': btn = 'B'; break;
        case ' ': btn = 'START'; break;
        case 'Shift': case 'Tab': btn = 'SELECT'; break;
      }
      if (btn) {
        releaseButton(btn);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleButtonAction, releaseButton]);

  const getButtonProps = useCallback((button: ControllerButton) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      handleButtonAction(button);
    },
    onPointerUp: () => releaseButton(button),
    onPointerLeave: () => releaseButton(button),
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
    },
    'aria-label': `${button} button`,
    role: 'button' as const,
    tabIndex: 0,
    'data-active': activeButtons[button] ? 'true' : 'false'
  }), [activeButtons, handleButtonAction, releaseButton]);

  return {
    activeButtons,
    lastPressed: lastPressed ? lastPressed.button : null,
    soundEnabled,
    toggleSound,
    pressButton: handleButtonAction,
    releaseButton,
    getButtonProps,
    pressUp: () => handleButtonAction('UP'),
    pressDown: () => handleButtonAction('DOWN'),
    pressLeft: () => handleButtonAction('LEFT'),
    pressRight: () => handleButtonAction('RIGHT'),
    pressA: () => handleButtonAction('A'),
    pressB: () => handleButtonAction('B'),
    pressStart: () => handleButtonAction('START'),
    pressSelect: () => handleButtonAction('SELECT'),
  };
}
