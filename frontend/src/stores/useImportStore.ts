import { create } from "zustand";

interface ImportProgress {
	albumTitle: string;
	totalTracks: number;
	processedTracks: number;
	status: 'fetching' | 'uploading' | 'creating' | 'deleting' | 'complete' | 'error';
	error?: string;
	operation?: 'import' | 'delete';
	startTime?: number;
}

interface ImportStore {
	isImporting: boolean;
	progress: ImportProgress | null;
	startImport: (albumTitle: string, totalTracks: number) => void;
	startDelete: (trackTitle: string) => void;
	updateProgress: (processedTracks: number, status: ImportProgress['status']) => void;
	completeImport: () => void;
	failImport: (error: string) => void;
	resetImport: () => void;
}

export const useImportStore = create<ImportStore>((set) => ({
	isImporting: false,
	progress: null,

	startImport: (albumTitle: string, totalTracks: number) => {
		set({
			isImporting: true,
			progress: {
				albumTitle,
				totalTracks,
				processedTracks: 0,
				status: 'fetching',
				operation: 'import',
				startTime: Date.now()
			}
		});
	},

	startDelete: (trackTitle: string) => {
		set({
			isImporting: true,
			progress: {
				albumTitle: trackTitle,
				totalTracks: 1,
				processedTracks: 0,
				status: 'deleting',
				operation: 'delete',
				startTime: Date.now()
			}
		});
	},

	updateProgress: (processedTracks: number, status: ImportProgress['status']) => {
		set((state) => {
			if (!state.progress) return state;
			return {
				progress: {
					...state.progress,
					processedTracks,
					status
				}
			};
		});
	},

	completeImport: () => {
		set((state) => {
			if (!state.progress) return state;
			return {
				isImporting: false,
				progress: {
					...state.progress,
					processedTracks: state.progress.totalTracks,
					status: 'complete'
				}
			};
		});

		// Clear after 3 seconds
		setTimeout(() => {
			set({ progress: null });
		}, 3000);
	},

	failImport: (error: string) => {
		set((state) => ({
			isImporting: false,
			progress: state.progress ? {
				...state.progress,
				status: 'error',
				error
			} : null
		}));

		// Clear after 5 seconds
		setTimeout(() => {
			set({ progress: null });
		}, 5000);
	},

	resetImport: () => {
		set({ isImporting: false, progress: null });
	}
}));

