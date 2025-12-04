import { useMusicStore } from "@/stores/useMusicStore";
import { useNavigate } from "react-router-dom";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
const TopArtistsSection = () => {
	const { topArtists, isLoading } = useMusicStore();
	const navigate = useNavigate();
	if (isLoading) return <SectionGridSkeleton />;
	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>top artists</h2>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
				{topArtists.slice(0, 4).map((artist) => (
					<div
						key={artist._id}
						onClick={() => navigate(`/artists/${artist._id}`)}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all cursor-pointer group relative'
					>
					<div className='relative mb-4'>
						<div className='aspect-square rounded-full overflow-hidden mb-4 shadow-lg'>
							<img
								src={artist.imageUrl || '/default-artist.png'}
								alt={artist.name}
								className='w-full h-full object-cover'
							/>
						</div>
					</div>
				<h3 className='font-medium mb-2 truncate text-center flex items-center justify-center gap-1'>
					{artist.name}
					<VerifiedBadge verified={artist.verified} size='sm' />
				</h3>
					<p className='text-sm text-zinc-400 truncate text-center'>
						{artist.songCount || 0} song{artist.songCount !== 1 ? 's' : ''}
					</p>
					</div>
				))}
			</div>
		</div>
	);
};
export default TopArtistsSection;