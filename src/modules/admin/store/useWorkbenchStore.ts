import type { ExtendedVocabulary } from '@/types/admin-types';
import { create } from 'zustand';

// Define the store interface
interface WorkbenchState {
	// State
	activeItem: ExtendedVocabulary | null;
	originalItem: ExtendedVocabulary | null;
	locale: 'vi' | 'en';
	isDirty: boolean;

	// Actions
	init: (item: ExtendedVocabulary) => void;
	setLocale: (locale: 'vi' | 'en') => void;
	reset: () => void;

	// Explicit Updaters
	updateMeanings: (meanings: string[]) => void;
	updateEtymologyNote: (note: string) => void;
	updateMnemonic: (mnemonic: string) => void;

	// Complex Lists (Examples)
	addExample: (example: ExtendedVocabulary['examples'][number]) => void;
	updateExample: (index: number, example: ExtendedVocabulary['examples'][number]) => void;
	removeExample: (index: number) => void;

	// Complex Lists (Confusions)
	addConfusion: (confusion: NonNullable<ExtendedVocabulary['confusions']>[number]) => void;
	updateConfusion: (
		index: number,
		confusion: NonNullable<ExtendedVocabulary['confusions']>[number],
	) => void;
	removeConfusion: (index: number) => void;

	updateField: <K extends keyof ExtendedVocabulary>(key: K, value: ExtendedVocabulary[K]) => void;
}

const checkDirty = (active: ExtendedVocabulary | null, original: ExtendedVocabulary | null) => {
	if (!active || !original) return false;
	return JSON.stringify(active) !== JSON.stringify(original);
};

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
	activeItem: null,
	originalItem: null,
	locale: 'vi',
	isDirty: false,

	init: (item) => {
		const cloned = structuredClone(item);
		set({
			activeItem: cloned,
			originalItem: cloned, // Keep a separate copy
			isDirty: false,
		});
	},

	setLocale: (locale) => set({ locale }),

	reset: () =>
		set((state) => ({
			activeItem: state.originalItem ? structuredClone(state.originalItem) : null,
			isDirty: false,
		})),

	updateMeanings: (newMeaningsList) =>
		set((state) => {
			if (!state.activeItem) return state;
			const { locale } = state;
			const newItem = structuredClone(state.activeItem);
			newItem.meanings[locale] = newMeaningsList;
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	updateEtymologyNote: (note) =>
		set((state) => {
			if (!state.activeItem) return state;
			const { locale } = state;
			const newItem = structuredClone(state.activeItem);
			if (!newItem.etymology) newItem.etymology = { parts: [], note: { vi: '', en: '' } };
			if (!newItem.etymology.note) newItem.etymology.note = { vi: '', en: '' };
			newItem.etymology.note[locale] = note;
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	updateMnemonic: (val) =>
		set((state) => {
			if (!state.activeItem) return state;
			const { locale } = state;
			const newItem = structuredClone(state.activeItem);
			if (!newItem.mnemonic) newItem.mnemonic = { vi: '', en: '' };
			newItem.mnemonic[locale] = val;
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	// Examples
	addExample: (example) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (!newItem.examples) newItem.examples = [];
			newItem.examples.push(example);
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	updateExample: (index, example) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (newItem.examples && newItem.examples[index]) {
				newItem.examples[index] = example;
			}
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	removeExample: (index) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (newItem.examples) {
				newItem.examples.splice(index, 1);
			}
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	// Confusions
	addConfusion: (confusion) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (!newItem.confusions) newItem.confusions = [];
			newItem.confusions.push(confusion);
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	updateConfusion: (index, confusion) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (newItem.confusions && newItem.confusions[index]) {
				newItem.confusions[index] = confusion;
			}
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	removeConfusion: (index) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			if (newItem.confusions) {
				newItem.confusions.splice(index, 1);
			}
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),

	// Generic Updater for Core Fields (Surface, Reading, Tags, Pitch, etc.)
	updateField: (key, value) =>
		set((state) => {
			if (!state.activeItem) return state;
			const newItem = structuredClone(state.activeItem);
			newItem[key] = value;
			return {
				activeItem: newItem,
				isDirty: checkDirty(newItem, state.originalItem),
			};
		}),
}));
