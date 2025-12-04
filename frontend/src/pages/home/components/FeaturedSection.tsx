import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import PlayButton from "./PlayButton";
import { ArtistLinks } from "@/components/ArtistLinks";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";
const FeaturedSection = () => {
	const { isLoading, featuredSongs, error } = useMusicStore();
	if (isLoading) return <FeaturedGridSkeleton />;
	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	// Filter out songs with placeholder audio
	const validSongs = featuredSongs.filter(song => !song.audioUrl?.includes('placeholder'));

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
			{validSongs.slice(0, 3).map((song) => (
				<div
					key={song._id}
					className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
				>
					<img
						src={song.imageUrl}
						alt={song.title}
						className='w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0'
					/>
		<div className='flex-1 p-4'>
			<p className='font-medium truncate'>{song.title}</p>
			<div className='text-sm truncate'>
				<ArtistLinks artists={song.artists} className='text-zinc-400' />
				{song.playCount !== undefined && (
					<span className='text-zinc-500'> • {song.playCount.toLocaleString()} plays</span>
				)}
			</div>
		</div>
					<div className='absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity'>
						<AddToPlaylistButton songId={song._id} size={28} />
					</div>
					<PlayButton song={song} />
				</div>
			))}
		</div>
	);
};
export default FeaturedSection;