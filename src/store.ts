import { create } from 'zustand';
import { SaveFile } from '../parser/types';
import { GhostRecord } from '../parser/ghosts';
import { JourneyEvent } from '../parser/timeline';

export type Screen = 'DROP' | 'SCANNING' | 'DASHBOARD' | 'BOXES' | 'GHOSTS' | 'LEGITIMACY' | 'JOURNEY';

interface AppState {
    currentScreen: Screen;
    saveFile: SaveFile | null;
    ghosts: GhostRecord[];
    timeline: JourneyEvent[];
    setScreen: (screen: Screen) => void;
    setSaveData: (data: { saveFile: SaveFile, ghosts: GhostRecord[], timeline: JourneyEvent[] }) => void;
    reset: () => void;
}

export const useStore = create<AppState>((set) => ({
    currentScreen: 'DROP',
    saveFile: null,
    ghosts: [],
    timeline: [],
    setScreen: (screen) => set({ currentScreen: screen }),
    setSaveData: (data) => set({ ...data, currentScreen: 'DASHBOARD' }),
    reset: () => set({ currentScreen: 'DROP', saveFile: null, ghosts: [], timeline: [] }),
}));
