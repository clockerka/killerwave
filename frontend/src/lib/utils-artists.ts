import { Artist } from '@/types';
export const formatArtists = (artists: (Artist | string)[] | undefined | null): string => {
	if (!artists || artists.length === 0) {
		return 'unknown artist';
	}
	return artists
		.map((artist) => {
			if (typeof artist === 'object' && artist !== null && 'name' in artist) {
				return artist.name;
			}
			return null;
		})
		.filter(Boolean)
		.join(', ') || 'Unknown Artist';
};