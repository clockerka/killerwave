import { Artist } from '@/types';
import { Link } from 'react-router-dom';
import { VerifiedBadge } from './VerifiedBadge';
interface ArtistLinksProps {
	artists: (Artist | string)[] | undefined | null;
	className?: string;
}
export const ArtistLinks = ({ artists, className = '' }: ArtistLinksProps) => {
	if (!artists || artists.length === 0) {
		return <span className={className}>unknown artist</span>;
	}
	const validArtists = artists
		.filter((artist) => typeof artist === 'object' && artist !== null && 'name' in artist)
		.map((artist) => artist as Artist);
	if (validArtists.length === 0) {
		return <span className={className}>unknown artist</span>;
	}
	return (
		<span className={className}>
			{validArtists.map((artist, index) => (
				<span key={artist._id}>
					<Link
						to={`/artists/${artist._id}`}
						className='hover:underline inline-flex items-center gap-1'
						onClick={(e) => e.stopPropagation()}
					>
						{artist.name}
						<VerifiedBadge verified={artist.verified} size='sm' />
					</Link>
					{index < validArtists.length - 1 && ', '}
				</span>
			))}
		</span>
	);
};