import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { Card, CardContent } from '@/components/ui/card';

const PinnedPlaylist = () => {
	const { favoritesPlaylist } = useLibraryStore();

	if (!favoritesPlaylist || !favoritesPlaylist.songs || favoritesPlaylist.songs.length === 0) {
		return null;
	}

	const displayedSongs = favoritesPlaylist.songs.slice(0, 4);

	return (
		<div className='mb-8'>
			<Link to='/playlists/my'>
				<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50 overflow-hidden'>
					<CardContent className='p-0'>
						<div className='flex items-center'>
							<div className='w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0'>
								<Heart className='text-white' size={32} fill='white' />
							</div>
							<div className='px-4 flex-1 min-w-0'>
								<h3 className='font-bold text-white text-lg truncate'>favorite tracks</h3>
								<p className='text-sm text-zinc-400 truncate'>
									{favoritesPlaylist.songs.length} {favoritesPlaylist.songs.length === 1 ? 'song' : 'songs'}
								</p>
							</div>
							<div className='hidden lg:flex items-center gap-2 pr-4'>
								{displayedSongs.map((song, idx) => (
									<img
										key={song._id}
										src={song.imageUrl}
										alt={song.title}
										className='w-12 h-12 rounded object-cover'
										style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
									/>
								))}
								{favoritesPlaylist.songs.length > 4 && (
									<div className='w-12 h-12 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-300'>
										+{favoritesPlaylist.songs.length - 4}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		</div>
	);
};

export default PinnedPlaylist;

