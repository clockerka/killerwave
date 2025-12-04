import { Album } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatArtists } from "@/lib/utils-artists";
import AddToLibraryButton from "@/components/AddToLibraryButton";

type AlbumsSectionGridProps = {
	title: string;
	albums: Album[];
	isLoading: boolean;
};

const AlbumsSectionGrid = ({ albums, title, isLoading }: AlbumsSectionGridProps) => {
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<div className='mb-8'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					{[...Array(8)].map((_, i) => (
						<div key={i} className='bg-zinc-800/40 p-4 rounded-md animate-pulse'>
							<div className='aspect-square rounded-md bg-zinc-700 mb-4'></div>
							<div className='h-4 bg-zinc-700 rounded mb-2'></div>
							<div className='h-3 bg-zinc-700 rounded w-2/3'></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{albums.map((album) => (
					<div
						key={album._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer relative'
						onClick={() => navigate(`/albums/${album._id}`)}
					>
						<div className='absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
							<AddToLibraryButton type='album' id={album._id} size={28} />
						</div>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
								<img
									src={album.imageUrl}
									alt={album.title}
									className='w-full h-full object-cover transition-transform duration-300
									group-hover:scale-105'
								/>
							</div>
						</div>
						<h3 className='font-medium mb-2 truncate'>{album.title}</h3>
						<div className='text-sm truncate text-zinc-400'>
							{formatArtists(album.artists)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AlbumsSectionGrid;

