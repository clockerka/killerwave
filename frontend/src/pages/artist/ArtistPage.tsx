import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Music2, Shuffle, Repeat } from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import AddToLibraryButton from '@/components/AddToLibraryButton';
import AddToPlaylistButton from '@/components/AddToPlaylistButton';
import { useLibraryStore } from '@/stores/useLibraryStore';

const ArtistPage = () => {
	const { artistId } = useParams();
	const navigate = useNavigate();
	const [artist, setArtist] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const { currentSong, isPlaying, playAlbum, repeatMode, isShuffle, toggleRepeat, toggleShuffle } = usePlayerStore();
	const { fetchLibrary, fetchFavoritesPlaylist } = useLibraryStore();
	const { dbUser } = useAuthStore();
	const isAuthenticated = !!dbUser;

	useEffect(() => {
		if (!artistId) return;
		setLoading(true);
		axiosInstance.get(`/artists/${artistId}`).then((res) => {
			setArtist(res.data);
		}).catch(() => {
		}).finally(() => setLoading(false));
		// Only fetch library data if user is authenticated
		if (isAuthenticated) {
			fetchLibrary();
			fetchFavoritesPlaylist();
		}
	}, [artistId, fetchLibrary, fetchFavoritesPlaylist, isAuthenticated]);

	if (loading) return null;
	if (!artist) return <div className='h-full flex items-center justify-center text-zinc-400'>artist not found</div>;

	const handlePlayArtist = () => {
		if (artist.songs && artist.songs.length > 0) {
			playAlbum(artist.songs, 0);
		}
	};

	const topTracks = artist.songs?.slice(0, 5) || [];

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='absolute inset-0 bg-gradient-to-b from-blue-500/40 via-zinc-900/80 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<img
								src={artist.imageUrl || '/default-artist.png'}
								alt={artist.name}
								className='w-[240px] h-[240px] shadow-xl rounded-full object-cover'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>artist</p>
								<div className='flex items-center gap-4'>
									<h1 className='text-7xl font-bold my-4 flex items-center gap-3'>
										{artist.name}
										<VerifiedBadge verified={artist.verified} size='lg' />
									</h1>
									{artistId && <AddToLibraryButton type='artist' id={artistId} size={48} />}
								</div>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span>{artist.songs?.length || 0} songs</span>
									<span>• {artist.albums?.length || 0} albums</span>
									{artist.monthlyListeners !== undefined && (
										<span>• {artist.monthlyListeners.toLocaleString()} monthly listeners</span>
									)}
								</div>
							</div>
						</div>

						<div className='px-6 pb-4 flex items-center gap-4'>
							<Button
								onClick={handlePlayArtist}
								size='icon'
								className='w-14 h-14 rounded-full bg-[#e8ecf3] hover:bg-[#d4dce8] hover:scale-105 transition-all'
								disabled={!artist.songs || artist.songs.length === 0}
							>
								<Play className='h-7 w-7 text-black' />
							</Button>

							<Button
								onClick={toggleShuffle}
								size='icon'
								variant='ghost'
								className={`hover:bg-white/10 transition-colors ${
									isShuffle ? 'text-[#e8ecf3]' : 'text-zinc-400'
								}`}
							>
								<Shuffle className='h-5 w-5' />
							</Button>

							<Button
								onClick={toggleRepeat}
								size='icon'
								variant='ghost'
								className={`hover:bg-white/10 transition-colors relative ${
									repeatMode === 'off' ? 'text-zinc-400' : 'text-[#e8ecf3]'
								}`}
							>
								<Repeat className='h-5 w-5' />
								{repeatMode === 'one' && (
									<span className='absolute text-[10px] font-bold' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
										1
									</span>
								)}
							</Button>
						</div>

						{/* Top Tracks Section */}
						{topTracks.length > 0 && (
							<div className='px-6 pb-8'>
								<h2 className='text-2xl font-bold mb-4'>popular</h2>
								<div className='space-y-2'>
									{topTracks.map((song: any, index: number) => {
										const isCurrentSong = currentSong?._id === song._id;

										return (
											<div
												key={song._id}
												className='grid grid-cols-[auto_1fr_auto] gap-4 p-3 hover:bg-white/5 rounded-md group cursor-pointer'
												onClick={() => playAlbum(artist.songs, index)}
											>
												<div className='flex items-center'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-[#e8ecf3]'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-12 rounded' />
													<div>
														<div className={`font-medium ${isCurrentSong ? 'text-[#e8ecf3]' : 'text-white'}`}>
															{song.title}
														</div>
														<div className='text-sm text-zinc-400'>{artist.name}</div>
													</div>
												</div>

												<div className='flex items-center' onClick={(e) => e.stopPropagation()}>
													<AddToPlaylistButton songId={song._id} />
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Albums Section */}
						{artist.albums && artist.albums.length > 0 && (
							<div className='px-6 pb-40'>
								<h2 className='text-2xl font-bold mb-4'>albums</h2>
								<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
									{artist.albums.map((album: any) => (
										<div
											key={album._id}
											className='bg-zinc-900/40 p-4 rounded-md hover:bg-zinc-800/40 transition-all cursor-pointer group'
											onClick={() => navigate(`/albums/${album._id}`)}
										>
											<div className='relative mb-4'>
												<img
													src={album.imageUrl}
													alt={album.title}
													className='w-full aspect-square object-cover rounded-md'
												/>
											</div>
											<h3 className='font-medium truncate'>{album.title}</h3>
											<p className='text-sm text-zinc-400 mt-1'>
												{album.releaseYear || new Date(album.createdAt).getFullYear()}
												{album.totalPlayCount !== undefined && (
													<> • {album.totalPlayCount.toLocaleString()} plays</>
												)}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						{(!topTracks.length && (!artist.albums || artist.albums.length === 0)) && (
							<div className='flex flex-col items-center justify-center py-20'>
								<Music2 size={64} className='text-zinc-600 mb-4' />
								<p className='text-zinc-400'>no content available</p>
							</div>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default ArtistPage;

