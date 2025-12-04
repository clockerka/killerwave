import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useMemo, memo } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import AlbumsSectionGrid from "./components/AlbumsSectionGrid";
import TopArtistsSection from "./components/TopArtistsSection";
import KillerWhaleFact from "@/components/KillerWhaleFact";
import PinnedPlaylist from "./components/PinnedPlaylist";
import DaylistPlaylist from "./components/DaylistPlaylist";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useAuthStore } from "@/stores/useAuthStore";
import DMCAWarning from "@/components/DMCAWarning";

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouAlbums,
		fetchTopArtists,
		isLoading,
		madeForYouAlbums,
		featuredSongs,
	} = useMusicStore();

	const { dbUser } = useAuthStore();
	const isAuthenticated = !!dbUser;
	const { initializeQueue } = usePlayerStore();
	const { fetchLibrary, fetchFavoritesPlaylist } = useLibraryStore();

	// Memoize valid songs to avoid recalculation
	const validSongs = useMemo(() => {
		return featuredSongs.filter(song => !song.audioUrl?.includes('placeholder'));
	}, [featuredSongs]);

	useEffect(() => {
		fetchFeaturedSongs();
		fetchMadeForYouAlbums();
		fetchTopArtists();
		// Only fetch library data if user is authenticated
		if (isAuthenticated) {
			fetchLibrary();
			fetchFavoritesPlaylist();
		}
	}, [fetchFeaturedSongs, fetchMadeForYouAlbums, fetchTopArtists, fetchLibrary, fetchFavoritesPlaylist, isAuthenticated]);

	useEffect(() => {
		if (validSongs.length > 0) {
			initializeQueue(validSongs);
		}
	}, [initializeQueue, validSongs]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>good afternoon</h1>

					<DMCAWarning />
					<DaylistPlaylist />

					{isAuthenticated && (
						<>
							<PinnedPlaylist />
							<div className='mb-6'>
								<KillerWhaleFact />
							</div>
						</>
					)}

					<FeaturedSection />

					<div className='space-y-8'>
						<AlbumsSectionGrid title='made for you' albums={madeForYouAlbums} isLoading={isLoading} />
						<TopArtistsSection />
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};

export default HomePage;

