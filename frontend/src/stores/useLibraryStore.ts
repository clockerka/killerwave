import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Song, Album, Artist } from "@/types";
import { Playlist } from "@/types/playlist";
interface Library {
	songs: Song[];
	albums: Album[];
	artists: Artist[];
	playlists: Playlist[];
}
interface LibraryStore {
	library: Library | null;
	favoritesPlaylist: Playlist | null;
	userPlaylists: Playlist[];
	isLoading: boolean;
	fetchLibrary: () => Promise<void>;
	fetchFavoritesPlaylist: () => Promise<void>;
	fetchUserPlaylists: () => Promise<void>;
	addSongToFavorites: (songId: string) => Promise<void>;
	removeSongFromFavorites: (songId: string) => Promise<void>;
	addAlbumToLibrary: (albumId: string) => Promise<void>;
	removeAlbumFromLibrary: (albumId: string) => Promise<void>;
	addArtistToLibrary: (artistId: string) => Promise<void>;
	removeArtistFromLibrary: (artistId: string) => Promise<void>;
	addPlaylistToLibrary: (playlistId: string) => Promise<void>;
	removePlaylistFromLibrary: (playlistId: string) => Promise<void>;
	createPlaylist: (title: string, description?: string, imageFile?: File) => Promise<Playlist>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	isInLibrary: (type: "song" | "album" | "artist" | "playlist", id: string) => boolean;
}
export const useLibraryStore = create<LibraryStore>((set, get) => ({
	library: null,
	favoritesPlaylist: null,
	userPlaylists: [],
	isLoading: false,
	fetchLibrary: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/library");
			set({ library: response.data, isLoading: false });
		} catch (error: any) {
			console.error("error fetching library:", error);
			// Don't show toast error for 401 - user is likely not signed in
			if (!get().library) {
				set({ library: { songs: [], albums: [], artists: [], playlists: [] } });
			}
			set({ isLoading: false });
		}
	},
	fetchFavoritesPlaylist: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/library/favorites");
			set({ favoritesPlaylist: response.data });
		} catch (error: any) {
			console.error("Error fetching favorites:", error);
			// Don't show auth error toast - silently handle
			set({ favoritesPlaylist: { _id: '', title: 'Favorite Tracks', songs: [], createdAt: '', updatedAt: '' } as any });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchUserPlaylists: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/library/playlists");
			set({ userPlaylists: response.data, isLoading: false });
		} catch (error: any) {
			console.error("error fetching playlists:", error);
			// Don't show auth error toast - silently handle
			if (!get().userPlaylists || get().userPlaylists.length === 0) {
				set({ userPlaylists: [] });
			}
			set({ isLoading: false });
		}
	},
	addSongToFavorites: async (songId: string) => {
		try {
			await axiosInstance.post(`/library/songs/${songId}`);
			await get().fetchFavoritesPlaylist();
			toast.success("added to favorites");
		} catch (error: any) {
			console.error("Error adding song to favorites:", error);
			if (error.response?.status === 401) {
				toast.error("please sign in to add to favorites");
			} else {
				toast.error("failed to add to favorites");
			}
		}
	},
	removeSongFromFavorites: async (songId: string) => {
		try {
			await axiosInstance.delete(`/library/songs/${songId}`);
			await get().fetchFavoritesPlaylist();
			toast.success("removed from favorites");
		} catch (error: any) {
			console.error("Error removing song from favorites:", error);
			if (error.response?.status === 401) {
				toast.error("please sign in to remove from favorites");
			} else {
				toast.error("failed to remove from favorites");
			}
		}
	},
	addAlbumToLibrary: async (albumId: string) => {
		try {
			await axiosInstance.post(`/library/albums/${albumId}`);
			await get().fetchLibrary();
			toast.success("Added to library");
		} catch (error: any) {
			console.error("Error adding album to library:", error);
			toast.error("Failed to add to library");
		}
	},
	removeAlbumFromLibrary: async (albumId: string) => {
		try {
			await axiosInstance.delete(`/library/albums/${albumId}`);
			await get().fetchLibrary();
			toast.success("Removed from library");
		} catch (error: any) {
			console.error("Error removing album from library:", error);
			toast.error("Failed to remove from library");
		}
	},
	addArtistToLibrary: async (artistId: string) => {
		try {
			await axiosInstance.post(`/library/artists/${artistId}`);
			await get().fetchLibrary();
			toast.success("Added to library");
		} catch (error: any) {
			console.error("Error adding artist to library:", error);
			toast.error("Failed to add to library");
		}
	},
	removeArtistFromLibrary: async (artistId: string) => {
		try {
			await axiosInstance.delete(`/library/artists/${artistId}`);
			await get().fetchLibrary();
			toast.success("Removed from library");
		} catch (error: any) {
			console.error("Error removing artist from library:", error);
			toast.error("Failed to remove from library");
		}
	},
	addPlaylistToLibrary: async (playlistId: string) => {
		try {
			console.log("Adding playlist to library:", playlistId);
			const response = await axiosInstance.post(`/library/playlists/${playlistId}`);
			console.log("Playlist added response:", response.data);
			await get().fetchLibrary();
			toast.success("Added to library");
		} catch (error: any) {
			console.error("Error adding playlist to library:", error);
			console.error("Response:", error.response?.data);
			console.error("Status:", error.response?.status);
			toast.error(error.response?.data?.message || "Failed to add to library");
		}
	},
	removePlaylistFromLibrary: async (playlistId: string) => {
		try {
			await axiosInstance.delete(`/library/playlists/${playlistId}`);
			await get().fetchLibrary();
			toast.success("Removed from library");
		} catch (error: any) {
			console.error("Error removing playlist from library:", error);
			toast.error("Failed to remove from library");
		}
	},
	createPlaylist: async (title: string, description?: string, imageFile?: File) => {
		try {
			const formData = new FormData();
			formData.append("title", title);
			if (description) formData.append("description", description);
			if (imageFile) formData.append("imageFile", imageFile);
			const response = await axiosInstance.post("/playlists", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			await get().fetchUserPlaylists();
			toast.success("Playlist created");
			return response.data;
		} catch (error: any) {
			console.error("Error creating playlist:", error);
			toast.error("Failed to create playlist");
			throw error;
		}
	},
	addSongToPlaylist: async (playlistId: string, songId: string) => {
		try {
			await axiosInstance.post(`/playlists/${playlistId}/songs/${songId}`);
			await get().fetchUserPlaylists();
			toast.success("Added to playlist");
		} catch (error: any) {
			console.error("Error adding song to playlist:", error);
			toast.error("Failed to add to playlist");
		}
	},
	removeSongFromPlaylist: async (playlistId: string, songId: string) => {
		try {
			await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			await get().fetchUserPlaylists();
			toast.success("Removed from playlist");
		} catch (error: any) {
			console.error("Error removing song from playlist:", error);
			toast.error("Failed to remove from playlist");
		}
	},
	isInLibrary: (type: "song" | "album" | "artist" | "playlist", id: string) => {
		const { library, favoritesPlaylist } = get();
		if (type === "song") {
			return favoritesPlaylist?.songs?.some((s: any) => s._id === id) || false;
		}
		if (!library) return false;
		switch (type) {
			case "album":
				return library.albums?.some((item: any) => item._id === id) || false;
			case "artist":
				return library.artists?.some((item: any) => item._id === id) || false;
			case "playlist":
				return library.playlists?.some((item: any) => item._id === id) || false;
			default:
				return false;
		}
	},
}));