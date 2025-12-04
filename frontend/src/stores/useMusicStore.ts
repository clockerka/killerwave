import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
interface MusicStore {
	songs: Song[];
	albums: Album[];
	playlists: any[];
	artists: any[];
	topArtists: any[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	madeForYouAlbums: Album[];
	trendingSongs: Song[];
	stats: Stats;
	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchMadeForYouAlbums: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchTopArtists: () => Promise<void>;
	fetchStats: () => Promise<void>;
	forceRefreshStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	fetchPlaylists: () => Promise<void>;
	fetchArtists: () => Promise<void>;
	createPlaylist: (formData: FormData) => Promise<void>;
	createArtist: (formData: FormData) => Promise<void>;
	updatePlaylist: (id: string, formData: FormData) => Promise<void>;
	updateArtist: (id: string, formData: FormData) => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	deletePlaylist: (id: string) => Promise<void>;
	deleteArtist: (id: string) => Promise<void>;
}
export const useMusicStore = create<MusicStore>((set) => ({
	albums: [],
	songs: [],
	playlists: [],
	artists: [],
	topArtists: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	madeForYouAlbums: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},
	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);
			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},
	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},
	deletePlaylist: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/playlists/${id}`);
			set((state) => ({ playlists: state.playlists.filter((p) => p._id !== id) }));
			toast.success("Playlist deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete playlist: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},
	deleteArtist: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/artists/${id}`);
			set((state) => ({
				artists: state.artists.filter((a) => a._id !== id),
				stats: {
					...state.stats,
					totalArtists: Math.max(0, state.stats.totalArtists - 1)
				}
			}));
			toast.success("artist deleted");
			// Force refresh stats to get accurate count
			const statsResponse = await axiosInstance.get("/stats");
			set({ stats: statsResponse.data });
		} catch (error: any) {
			toast.error("failed to delete artist: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},
	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			console.error("Error fetching songs:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			console.error("Error fetching stats:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	forceRefreshStats: async () => {
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			console.error("Error refreshing stats:", error);
			if (error.response?.status === 401) {
				console.error("authentication expired while refreshing stats");
			}
		}
	},
	fetchAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			// Add timestamp to bypass cache
			const response = await axiosInstance.get(`/albums?_t=${Date.now()}`);
			set({ albums: response.data });
		} catch (error: any) {
			console.error("Error fetching albums:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			console.error("Error fetching album:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else if (error.response?.status === 404) {
				set({ error: "album not found" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			console.error("Error fetching featured songs:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			console.error("Error fetching made for you songs:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchMadeForYouAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/albums");
			// Get random 4 albums for "Made For You" section (1 row)
			const shuffled = [...response.data].sort(() => 0.5 - Math.random());
			set({ madeForYouAlbums: shuffled.slice(0, 4) });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			console.error("Error fetching trending songs:", error);
			if (error.response?.status === 401) {
				set({ error: "authentication expired, please refresh page" });
			} else {
				set({ error: error.response?.data?.message || error.message });
			}
		} finally {
			set({ isLoading: false });
		}
	},
	fetchTopArtists: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/artists/top");
			set({ topArtists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchPlaylists: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/playlists");
			set({ playlists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message ?? error.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchArtists: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get('/admin/artists');
			set({ artists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message ?? error.message });
		} finally {
			set({ isLoading: false });
		}
	},
	createPlaylist: async (formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/playlists", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			set((state) => ({ playlists: [response.data, ...state.playlists] }));
			toast.success("Playlist created");
		} catch (error: any) {
			toast.error("Failed to create playlist: " + (error.message || error.response?.data?.message));
		} finally {
			set({ isLoading: false });
		}
	},
	createArtist: async (formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post('/admin/artists', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
			set((state) => ({
				artists: [response.data, ...state.artists],
				stats: {
					...state.stats,
					totalArtists: state.stats.totalArtists + 1
				}
			}));
			toast.success('artist created');
			// Force refresh stats to get accurate count
			const statsResponse = await axiosInstance.get("/stats");
			set({ stats: statsResponse.data });
		} catch (error: any) {
			toast.error('failed to create artist: ' + (error.message || error.response?.data?.message));
		} finally {
			set({ isLoading: false });
		}
	},
	updatePlaylist: async (id, formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/playlists/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			set((state) => ({ playlists: state.playlists.map((p) => (p._id === id ? response.data : p)) }));
			toast.success("Playlist updated");
		} catch (error: any) {
			toast.error("Failed to update playlist: " + (error.message || error.response?.data?.message));
		} finally {
			set({ isLoading: false });
		}
	},
	updateArtist: async (id: string, formData: FormData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/artists/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
			set((state) => ({ artists: state.artists.map(a => a._id === id ? response.data : a) }));
			toast.success('Artist updated');
		} catch (error: any) {
			toast.error('Failed to update artist: ' + (error.message || error.response?.data?.message));
		} finally {
			set({ isLoading: false });
		}
	},
}));