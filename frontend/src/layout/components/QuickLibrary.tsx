import { ScrollArea } from "@/components/ui/scroll-area";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Library, Play, Music, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { formatArtists } from "@/lib/utils-artists";

const killerWhaleFacts = [
	"Killer whales are actually dolphins, not whales. They're the largest members of the dolphin family.",
	"Orcas are found in all the world's oceans, from the Arctic to the Antarctic.",
	"A killer whale can swim at speeds of up to 56 km/h (34.8 mph).",
	"Orcas have the second-largest brain of any marine mammal, weighing up to 6.8 kg (15 lb).",
	"Each killer whale pod has its own unique dialect of calls that members use to communicate.",
	"Orcas can live for 50-80 years in the wild, with females typically living longer than males.",
	"A male orca's dorsal fin can grow up to 1.8 meters (6 feet) tall.",
	"Killer whales are apex predators and have no natural predators in the ocean.",
	"Orcas hunt in coordinated packs and use sophisticated hunting techniques.",
	"Different orca populations have different diets - some eat fish, others prefer seals or even other whales.",
	"Baby orcas are born after a 17-month gestation period and can weigh up to 180 kg (400 lb).",
	"Orcas are highly social animals and live in matriarchal family groups called pods.",
	"An orca's distinctive black and white coloring helps them camouflage while hunting.",
	"Killer whales can eat up to 227 kg (500 lb) of food per day.",
	"Orcas have been observed teaching their young hunting techniques, showing cultural transmission.",
	"The name 'killer whale' comes from ancient sailors who saw them hunting larger whales.",
	"Orcas can dive to depths of over 100 meters (330 feet) while hunting.",
	"Each orca has a unique pattern of white and gray markings called a saddle patch behind its dorsal fin.",
	"Killer whales sleep by resting one half of their brain at a time, staying partially conscious.",
	"Orcas have been known to swim over 160 km (100 miles) in a single day.",
];

const QuickLibrary = () => {
	const { library, favoritesPlaylist, userPlaylists, fetchLibrary, fetchFavoritesPlaylist, fetchUserPlaylists } = useLibraryStore();
	const { playAlbum } = usePlayerStore();
	const { dbUser } = useAuthStore();
	const isAuthenticated = !!dbUser;

	const [fact, setFact] = useState('');

	useEffect(() => {
		if (isAuthenticated) {
			fetchLibrary();
			fetchFavoritesPlaylist();
			fetchUserPlaylists();
		}
	}, [isAuthenticated, fetchLibrary, fetchFavoritesPlaylist, fetchUserPlaylists]);

	useEffect(() => {
		if (!isAuthenticated) {
			// Get random fact on component mount
			const randomFact = killerWhaleFacts[Math.floor(Math.random() * killerWhaleFacts.length)];
			setFact(randomFact);

			// Change fact every 30 seconds
			const interval = setInterval(() => {
				const newRandomFact = killerWhaleFacts[Math.floor(Math.random() * killerWhaleFacts.length)];
				setFact(newRandomFact);
			}, 30000);

			return () => clearInterval(interval);
		}
	}, [isAuthenticated]);

	// Show killer whale facts for unauthenticated users
	if (!isAuthenticated) {
		return (
			<div className='h-full bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-indigo-500/10 rounded-lg flex flex-col items-center justify-center p-6'>
				<div className='flex flex-col items-center text-center max-w-sm'>
					<div className='text-6xl mb-4'>🐋</div>
					<h2 className='text-xl font-bold text-cyan-400 mb-4'>killer whale fact</h2>
					<p className='text-zinc-300 leading-relaxed text-sm'>{fact}</p>
				</div>
			</div>
		);
	}

	// Show library for authenticated users
	return (
		<div className='h-full bg-zinc-900 rounded-lg flex flex-col relative'>
			<div className='p-4 flex justify-between items-center border-b border-zinc-800'>
				<div className='flex items-center gap-2'>
					<Library className='size-5 shrink-0' />
					<h2 className='font-semibold'>library</h2>
				</div>
			</div>
			<ScrollArea className='flex-1'>
				<div className='p-4 pb-20 space-y-4'>
					{favoritesPlaylist && (
						<Link to='/playlists/my' className='block'>
							<div className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'>
							<div className='flex items-center gap-3'>
								<div className='w-12 h-12 rounded flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
									<Heart className='text-white' size={20} fill='white' />
								</div>
								<div className='flex-1 min-w-0'>
									<h3 className='font-medium truncate'>favorite tracks</h3>
									<p className='text-sm text-zinc-400 truncate'>
										{favoritesPlaylist.songs?.length || 0} tracks
									</p>
								</div>
							</div>
							</div>
						</Link>
					)}
					{userPlaylists.length > 0 && (
						<>
							<div className='text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 pt-2'>playlists</div>
							{userPlaylists.slice(0, 3).map((playlist) => (
								<Link key={playlist._id} to={`/playlists/${playlist._id}`} className='block'>
									<div className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'>
										<div className='flex items-center gap-3'>
											<div className='w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800'>
												{playlist.imageUrl ? (
													<img src={playlist.imageUrl} alt={playlist.title} className='w-full h-full object-cover' />
												) : (
													<div className='w-full h-full flex items-center justify-center'>
														<Music className='text-zinc-600' size={20} />
													</div>
												)}
											</div>
											<div className='flex-1 min-w-0'>
												<h3 className='font-medium truncate'>{playlist.title}</h3>
												<p className='text-sm text-zinc-400 truncate'>
													{playlist.songs?.length || 0} tracks
												</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</>
					)}
					{library?.albums && library.albums.length > 0 && (
						<>
							<div className='text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 pt-2'>albums</div>
							{library.albums.slice(0, 3).map((album: any) => (
								<Link key={album._id} to={`/albums/${album._id}`} className='block'>
									<div className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'>
										<div className='flex items-center gap-3'>
											<div className='w-12 h-12 rounded flex-shrink-0 overflow-hidden'>
												<img src={album.imageUrl} alt={album.title} className='w-full h-full object-cover' />
											</div>
											<div className='flex-1 min-w-0'>
												<h3 className='font-medium truncate'>{album.title}</h3>
												<p className='text-sm text-zinc-400 truncate'>{formatArtists(album.artists)}</p>
											</div>
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													playAlbum(album.songs, 0);
												}}
												className='opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-500/20 rounded-full flex-shrink-0'
											>
												<Play className='text-blue-500' size={16} fill='currentColor' />
											</button>
										</div>
									</div>
								</Link>
							))}
						</>
					)}
					{library?.artists && library.artists.length > 0 && (
						<>
							<div className='text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 pt-2'>artists</div>
							{library.artists.slice(0, 3).map((artist: any) => (
								<Link key={artist._id} to={`/artists/${artist._id}`} className='block'>
									<div className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'>
									<div className='flex items-center gap-3'>
										<div className='w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-zinc-700'>
											<img src={artist.imageUrl || '/placeholder-artist.png'} alt={artist.name} className='w-full h-full object-cover' />
										</div>
										<div className='flex-1 min-w-0'>
											<h3 className='font-medium flex items-center gap-1'>
												<span className='truncate'>{artist.name}</span>
												<VerifiedBadge verified={artist.verified} size='xs' />
											</h3>
											<p className='text-sm text-zinc-400 truncate'>artist</p>
										</div>
									</div>
									</div>
								</Link>
							))}
						</>
					)}
					{library?.playlists && library.playlists.length > 0 && (
						<>
							<div className='text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 pt-2'>saved playlists</div>
							{library.playlists.slice(0, 3).map((playlist: any) => (
								<Link key={playlist._id} to={`/playlists/${playlist._id}`} className='block'>
									<div className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'>
										<div className='flex items-center gap-3'>
											<div className='w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800'>
												{playlist.imageUrl ? (
													<img src={playlist.imageUrl} alt={playlist.title} className='w-full h-full object-cover' />
												) : (
													<div className='w-full h-full flex items-center justify-center'>
														<Music className='text-zinc-600' size={20} />
													</div>
												)}
											</div>
											<div className='flex-1 min-w-0'>
												<h3 className='font-medium truncate'>{playlist.title}</h3>
												<p className='text-sm text-zinc-400 truncate'>
													{playlist.songs?.length || 0} tracks
												</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</>
					)}
					{(!library || (
						(!library.albums || library.albums.length === 0) &&
						(!library.artists || library.artists.length === 0) &&
						(!library.playlists || library.playlists.length === 0) &&
						userPlaylists.length === 0
					)) && (
						<div className='text-center py-8 px-4'>
							<Music className='mx-auto text-zinc-600 mb-2' size={32} />
							<p className='text-sm text-zinc-400'>your library is empty rn</p>
							<p className='text-xs text-zinc-500 mt-1'>you can start adding music rn!</p>
						</div>
					)}
				</div>
			</ScrollArea>
			<div className='absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800'>
				<Link to='/my' className='block'>
					<div className='cursor-pointer hover:bg-zinc-800/50 p-4 transition-colors text-center'>
						<p className='text-sm text-sky-500 font-medium'>view full library</p>
					</div>
				</Link>
			</div>
		</div>
	);
};
export default QuickLibrary;