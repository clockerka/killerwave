import { Song } from "./index";
export interface Playlist {
	_id: string;
	title: string;
	description?: string;
	imageUrl?: string;
	songs: Song[];
	userId?: string;
	isPrivate?: boolean;
	isFavorites?: boolean;
	createdAt: string;
	updatedAt: string;
}