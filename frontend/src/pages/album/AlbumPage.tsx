import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Clock, Pause, Play, Repeat, Shuffle } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import AddToLibraryButton from "@/components/AddToLibraryButton";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { formatArtists } from "@/lib/utils-artists";
import { ArtistLinks } from "@/components/ArtistLinks";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay, repeatMode, isShuffle, toggleRepeat, toggleShuffle } = usePlayerStore();
	const { fetchLibrary, fetchFavoritesPlaylist } = useLibraryStore();
	const { dbUser } = useAuthStore();
	const isAuthenticated = !!dbUser;

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
		// Only fetch library data if user is authenticated
		if (isAuthenticated) {
			fetchLibrary();
			fetchFavoritesPlaylist();
		}
	}, [fetchAlbumById, albumId, fetchLibrary, fetchFavoritesPlaylist, isAuthenticated]);

	if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='absolute inset-0 bg-gradient-to-b from-blue-500/40 via-zinc-900/80 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='flex flex-col sm:flex-row p-6 gap-6 pb-8'>
							<img
								src={currentAlbum?.imageUrl}
								alt={currentAlbum?.title}
								className='w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] shadow-xl rounded mx-auto sm:mx-0'
							/>
							<div className='flex flex-col justify-end text-center sm:text-left'>
								<p className='text-sm font-medium'>album</p>
								<h1 className='text-4xl sm:text-7xl font-bold my-4'>{currentAlbum?.title}</h1>
								<div className='flex flex-wrap items-center gap-2 text-sm text-zinc-100'>
									<ArtistLinks artists={currentAlbum?.artists || []} />
									<span className='hidden sm:inline'>•</span>
									<span>{currentAlbum?.songs.length} songs</span>
									<span className='hidden sm:inline'>•</span>
									<span>{currentAlbum?.releaseYear}</span>
									{currentAlbum?.totalPlayCount !== undefined && (
										<>
											<span className='hidden sm:inline'>•</span>
											<span>{currentAlbum.totalPlayCount.toLocaleString()} plays</span>
										</>
									)}
								</div>
							</div>
						</div>

						<div className='px-6 pb-4 flex flex-col sm:flex-row items-center gap-4'>
							<div className='flex items-center gap-4'>
								<Button
									onClick={handlePlayAlbum}
									size='icon'
									className='w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 hover:scale-105 transition-all'
								>
									{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
										<Pause className='h-7 w-7 text-black' />
									) : (
										<Play className='h-7 w-7 text-black' />
									)}
								</Button>

								<Button
									onClick={toggleShuffle}
									size='icon'
									variant='ghost'
									className={`hover:bg-white/10 transition-colors ${isShuffle ? 'text-blue-400' : 'text-zinc-400'}`}
								>
									<Shuffle className='h-5 w-5' />
								</Button>

								<Button
									onClick={toggleRepeat}
									size='icon'
									variant='ghost'
									className={`hover:bg-white/10 transition-colors relative ${repeatMode === 'off' ? 'text-zinc-400' : 'text-blue-400'}`}
								>
									<Repeat className='h-5 w-5' />
									{repeatMode === 'one' && (
										<span className='absolute text-[10px] font-bold' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
											1
										</span>
									)}
								</Button>
							</div>

							{albumId && <AddToLibraryButton type='album' id={albumId} size={40} />}
						</div>

						<div className='bg-black/20 backdrop-blur-sm'>
							{/* Desktop table header */}
							<div className='hidden md:grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-10 py-2 text-sm text-zinc-400 border-b border-white/5'>
								<div>#</div>
								<div>title</div>
								<div>released date</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div></div>
							</div>

							<div className='px-6 space-y-2 pb-40'>
								{currentAlbum?.songs.map((song, index) => {
									const isCurrentSong = currentSong?._id === song._id;

									return (
										<div key={song._id}>
											{/* Mobile layout */}
											<div className='md:hidden flex items-center gap-3 p-3 hover:bg-white/5 rounded-md group cursor-pointer'
												onClick={() => handlePlaySong(index)}
											>
												<div className='flex-shrink-0 w-8 text-sm text-zinc-400 group-hover:text-white'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-[#e8ecf3]'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<img src={song.imageUrl || currentAlbum?.imageUrl} alt={song.title} className='size-10 rounded' />

												<div className='flex-1 min-w-0'>
													<div className='font-medium truncate text-white'>{song.title}</div>
													<div className='text-sm text-zinc-400 truncate'>
														<ArtistLinks artists={song.artists} />
														{song.playCount !== undefined && (
															<> • {song.playCount.toLocaleString()} plays</>
														)}
													</div>
													<div className='text-xs text-zinc-500'>{formatDuration(song.duration)}</div>
												</div>

												<div className='flex items-center gap-2'>
													<AddToLibraryButton type="song" id={song._id} />
													<AddToPlaylistButton songId={song._id} />
												</div>
											</div>

											{/* Desktop layout */}
											<div
												className={`hidden md:grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer`}
												onClick={() => handlePlaySong(index)}
											>
												<div className='flex items-center justify-center'>
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
													<img src={song.imageUrl || currentAlbum?.imageUrl} alt={song.title} className='size-10' />
													<div>
														<div className={`font-medium text-white ${isCurrentSong ? "text-[#e8ecf3]" : ""}`}>{song.title}</div>
														<div>{formatArtists(song.artists)}</div>
													</div>
												</div>
												<div className='flex items-center'>{currentAlbum.releaseYear}</div>
												<div className='flex items-center'>{formatDuration(song.duration)}</div>
												<div className='flex items-center' onClick={(e) => e.stopPropagation()}>
													<AddToPlaylistButton songId={song._id} />
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default AlbumPage;

