import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { ArtistLinks } from "@/components/ArtistLinks";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";
type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};
const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;
	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{songs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer relative'
					>
						<div className='absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
							<AddToPlaylistButton songId={song._id} size={28} />
						</div>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
								<img
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300
									group-hover:scale-105'
								/>
							</div>
							<PlayButton song={song} />
						</div>
			<h3 className='font-medium mb-2 truncate'>{song.title}</h3>
			<div className='text-sm truncate'>
				<ArtistLinks artists={song.artists} className='text-zinc-400' />
				{song.playCount !== undefined && (
					<span className='text-zinc-500'> • {song.playCount.toLocaleString()} plays</span>
				)}
			</div>
		</div>
				))}
			</div>
		</div>
	);
};
export default SectionGrid;