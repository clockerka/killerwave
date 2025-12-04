import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

// Lazy load pages for better performance
const MyLibraryPage = lazy(() => import("./pages/my/MyLibraryPage"));
const FavoritesPlaylistPage = lazy(() => import("./pages/favorites/FavoritesPlaylistPage"));
const AlbumPage = lazy(() => import("./pages/album/AlbumPage"));
const ArtistPage = lazy(() => import("./pages/artist/ArtistPage"));
const PlaylistPage = lazy(() => import("./pages/playlist/PlaylistPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const PremiumPage = lazy(() => import("./pages/premium/PremiumPage"));
const PremiumSuccessPage = lazy(() => import("./pages/premium/PremiumSuccessPage"));
const PremiumFailPage = lazy(() => import("./pages/premium/PremiumFailPage"));
const ArtistHubPage = lazy(() => import("./pages/artist-hub/ArtistHubPage"));
const CreateAlbumPage = lazy(() => import("./pages/artist-hub/CreateAlbumPage"));
const CreateSongPage = lazy(() => import("./pages/artist-hub/CreateSongPage"));
const ManageContentPage = lazy(() => import("./pages/artist-hub/ManageContentPage"));
const EditAlbumPage = lazy(() => import("./pages/artist-hub/EditAlbumPage"));
const EditSongPage = lazy(() => import("./pages/artist-hub/EditSongPage"));
const NotFoundPage = lazy(() => import("./pages/404/NotFoundPage"));
const SupportPage = lazy(() => import("./pages/support/SupportPage"));
const MyTicketsPage = lazy(() => import("./pages/support/MyTicketsPage"));
const SupportDashboardPage = lazy(() => import("./pages/support-dashboard/SupportDashboardPage"));
const LyricsPage = lazy(() => import("./pages/lyrics/LyricsPage"));
const DMCAPage = lazy(() => import("./pages/dmca/DMCAPage"));

// Loading fallback component
const PageLoader = () => (
	<div className="min-h-screen bg-zinc-900 flex items-center justify-center">
		<div className="text-center">
			<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p className="text-zinc-400">loading...</p>
		</div>
	</div>
);

function App() {
	return (
		<ErrorBoundary>
			<>
				<Suspense fallback={<PageLoader />}>
					<Routes>
						<Route
							path='/sso-callback'
							element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
						/>
						<Route path='/auth-callback' element={<AuthCallbackPage />} />
						<Route path='/admin' element={<AdminPage />} />
						<Route path='/sup' element={<SupportDashboardPage />} />
				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/lyrics' element={<LyricsPage />} />
					<Route path='/dmca' element={<DMCAPage />} />
					<Route path='/my' element={<MyLibraryPage />} />
					<Route path='/support' element={<SupportPage />} />
					<Route path='/support/my-tickets' element={<MyTicketsPage />} />
					<Route path='/playlists/my' element={<FavoritesPlaylistPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/artists/:artistId' element={<ArtistPage />} />
					<Route path='/playlists/:playlistId' element={<PlaylistPage />} />
					<Route path='/premium' element={<PremiumPage />} />
					<Route path='/premium/success' element={<PremiumSuccessPage />} />
					<Route path='/premium/succes' element={<PremiumSuccessPage />} />
					<Route path='/premium/fail' element={<PremiumFailPage />} />
				<Route path='/artist-hub' element={<ArtistHubPage />} />
				<Route path='/artist-hub/create-album' element={<CreateAlbumPage />} />
				<Route path='/artist-hub/create-song' element={<CreateSongPage />} />
				<Route path='/artist-hub/manage' element={<ManageContentPage />} />
				<Route path='/artist-hub/edit-album/:albumId' element={<EditAlbumPage />} />
				<Route path='/artist-hub/edit-song/:songId' element={<EditSongPage />} />
				<Route path='/404' element={<NotFoundPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
					</Routes>
				</Suspense>
				<Toaster />
			</>
		</ErrorBoundary>
	);
}
export default App;