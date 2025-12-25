import { create } from 'zustand';

interface UIState {
	isNavBarVisible: boolean;
	setNavBarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
	isNavBarVisible: true, // Default to visible
	setNavBarVisible: (visible) => set({ isNavBarVisible: visible }),
}));
