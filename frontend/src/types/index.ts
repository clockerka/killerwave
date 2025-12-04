export interface Artist {
	_id: string;
	name: string;
	imageUrl?: string;
	bio?: string;
	verified?: boolean;
	monthlyListeners?: number;
}
export interface Song {
	_id: string;
	title: string;
	artists: Artist[];
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	lyrics?: string;
	createdAt: string;
	updatedAt: string;
	playCount?: number;
}
export interface Album {
	_id: string;
	title: string;
	artists: Artist[];
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
	totalPlayCount?: number;
}
export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}
export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}
export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	premium?: boolean;
}