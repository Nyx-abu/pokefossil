import { create } from 'zustand';
import { SaveFile } from './parser/types';
import { GhostRecord } from './parser/ghosts';
import { JourneyEvent } from './parser/timeline';

export type Screen = 'DROP' | 'STORY' | 'EXPLORE' | 'DASHBOARD' | 'BOXES' | 'GHOSTS' | 'LEGITIMACY' | 'JOURNEY';
export type ExploreTab = 'BOXES' | 'JOURNEY' | 'GHOSTS' | 'LEGITIMACY';

interface AppState {
    currentScreen: Screen;
    exploreTab: ExploreTab;
    saveFile: SaveFile | null;
    ghosts: GhostRecord[];
    timeline: JourneyEvent[];
    setScreen: (screen: Screen) => void;
    setExploreTab: (tab: ExploreTab) => void;
    setSaveData: (data: { saveFile: SaveFile, ghosts: GhostRecord[], timeline: JourneyEvent[] }) => void;
    reset: () => void;
}

export const useStore = create<AppState>((set) => ({
    currentScreen: 'DROP',
    exploreTab: 'BOXES',
    saveFile: null,
    ghosts: [],
    timeline: [],
    setScreen: (screen) => set({ currentScreen: screen }),
    setExploreTab: (tab) => set({ exploreTab: tab }),
    setSaveData: (data) => set({ ...data, currentScreen: 'STORY' }),
    reset: () => set({ currentScreen: 'DROP', saveFile: null, ghosts: [], timeline: [] }),
}));


