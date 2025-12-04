import { useEffect } from "react";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Play, Music, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { formatArtists } from "@/lib/utils-artists";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";
import { ScrollArea } from "@/components/ui/scroll-area";

const FavoritesPlaylistPage = () => {
	const { favoritesPlaylist, fetchFavoritesPlaylist, isLoading } = useLibraryStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		fetchFavoritesPlaylist();
	}, [fetchFavoritesPlaylist]);

	const handlePlaySong = (index: number) => {
		if (!favoritesPlaylist?.songs) return;
		playAlbum(favoritesPlaylist.songs, index);
	};

	const handlePlayAll = () => {
		if (!favoritesPlaylist?.songs || favoritesPlaylist.songs.length === 0) return;
		const isCurrentPlaylistPlaying = favoritesPlaylist.songs.some((song: any) => song._id === currentSong?._id);
		if (isCurrentPlaylistPlaying) togglePlay();
		else playAlbum(favoritesPlaylist.songs, 0);
	};

	if (isLoading && !favoritesPlaylist) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-[#8bb4f7] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-zinc-400'>loading your favorites...</p>
				</div>
			</div>
		);
	}

	const songs = favoritesPlaylist?.songs || [];

	return (
		<div className='h-full rounded-md overflow-hidden'>
			<div className='h-full flex flex-col bg-gradient-to-b from-blue-800 via-zinc-900 to-black'>
				<div className='p-8'>
					<div className='flex items-end gap-6'>
						<div className='w-52 h-52 rounded shadow-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center'>
							<Music className='w-24 h-24 text-white' />
						</div>
						<div>
							<p className='text-sm font-medium uppercase mb-2'>playlist</p>
							<h1 className='text-7xl font-bold mb-6'>favorite tracks</h1>
							<p className='text-zinc-400'>{songs.length} songs</p>
						</div>
					</div>
				</div>

				<div className='px-8 pb-4'>
					<Button
						size='icon'
						className='w-14 h-14 rounded-full bg-[#8bb4f7] hover:bg-[#7aa3e6] hover:scale-105 transition-all'
						onClick={handlePlayAll}
						disabled={songs.length === 0}
					>
						<Play className='h-7 w-7 text-white' fill='white' />
					</Button>
				</div>

				<ScrollArea className='flex-1'>
					<div className='px-8 pb-8'>
						{songs.length > 0 ? (
							<div className='space-y-2'>
								<div className='grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800'>
									<div>#</div>
									<div>title</div>
									<div>artist</div>
									<div>
										<Clock className='h-4 w-4' />
									</div>
									<div></div>
								</div>

								{songs.map((song: any, index: number) => {
									const isCurrentSong = currentSong?._id === song._id;

									return (
										<div
											key={song._id}
											className='grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer'
											onClick={() => handlePlaySong(index)}
										>
											<div className='flex items-center justify-center'>
												{isCurrentSong && isPlaying ? (
													<div className='size-4 text-[#8bb4f7]'>♫</div>
												) : (
													<span className='group-hover:hidden'>{index + 1}</span>
												)}
												{!isCurrentSong && <Play className='h-4 w-4 hidden group-hover:block' />}
											</div>

											<div className='flex items-center gap-3'>
												<img src={song.imageUrl} alt={song.title} className='size-10 rounded' />
												<div>
													<div className={`font-medium text-white ${isCurrentSong ? 'text-[#8bb4f7]' : ''}`}>{song.title}</div>
												</div>
											</div>

											<div className='flex items-center'>
												{formatArtists(song.artists)}
												{song.playCount !== undefined && (
													<span className='text-zinc-500'> • {song.playCount.toLocaleString()} plays</span>
												)}
											</div>

											<div className='flex items-center'>{formatDuration(song.duration)}</div>

											<div className='flex items-center' onClick={(e) => e.stopPropagation()}>
												<AddToPlaylistButton songId={song._id} />
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-20'>
								<Music size={64} className='text-zinc-600 mb-4' />
								<p className='text-zinc-400'>no favorite tracks yet</p>
								<p className='text-zinc-500 text-sm mt-2'>songs you like will appear here</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default FavoritesPlaylistPage;

