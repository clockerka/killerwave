import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
type RepeatMode = 'off' | 'all' | 'one';
interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	repeatMode: RepeatMode;
	isShuffle: boolean;
	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	toggleRepeat: () => void;
	toggleShuffle: () => void;
}
export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	repeatMode: 'off',
	isShuffle: false,
	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},
	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;
		const song = songs[startIndex];
		const artistNames = song.artists?.map(a => typeof a === 'object' ? a.name : 'Unknown').join(', ') || 'Unknown Artist';
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${artistNames}`,
			});
		}
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},
	setCurrentSong: (song: Song | null) => {
		if (!song) return;
		const artistNames = song.artists?.map(a => typeof a === 'object' ? a.name : 'Unknown').join(', ') || 'Unknown Artist';
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${artistNames}`,
			});
		}
		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},
	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;
		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			const artistNames = currentSong?.artists?.map(a => typeof a === 'object' ? a.name : 'Unknown').join(', ') || 'Unknown Artist';
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${artistNames}` : "Idle",
			});
		}
		set({
			isPlaying: willStartPlaying,
		});
	},
	playNext: () => {
		const { currentIndex, queue, repeatMode, isShuffle } = get();
		if (queue.length === 0) return;
		let nextIndex: number;
		if (repeatMode === 'one') {
			nextIndex = currentIndex;
		} else if (isShuffle) {
			nextIndex = Math.floor(Math.random() * queue.length);
		} else {
			nextIndex = currentIndex + 1;
			if (nextIndex >= queue.length) {
				if (repeatMode === 'all') {
					nextIndex = 0;
				} else {
					set({ isPlaying: false });
					const socket = useChatStore.getState().socket;
					if (socket.auth) {
						socket.emit("update_activity", {
							userId: socket.auth.userId,
							activity: `Idle`,
						});
					}
					return;
				}
			}
		}
		const nextSong = queue[nextIndex];
		const artistNames = nextSong.artists?.map(a => typeof a === 'object' ? a.name : 'Unknown').join(', ') || 'Unknown Artist';
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${nextSong.title} by ${artistNames}`,
			});
		}
		set({
			currentSong: nextSong,
			currentIndex: nextIndex,
			isPlaying: true,
		});
	},
	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];
			const artistNames = prevSong.artists?.map(a => typeof a === 'object' ? a.name : 'Unknown').join(', ') || 'Unknown Artist';
			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${artistNames}`,
				});
			}
			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
	toggleRepeat: () => {
		const currentMode = get().repeatMode;
		const nextMode: RepeatMode =
			currentMode === 'off' ? 'all' :
			currentMode === 'all' ? 'one' :
			'off';
		set({ repeatMode: nextMode });
	},
	toggleShuffle: () => {
		set({ isShuffle: !get().isShuffle });
	},
}));