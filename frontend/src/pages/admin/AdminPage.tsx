import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import MissingAudioAlert from "./components/MissingAudioAlert";
import ImportProgressIndicator from "./components/ImportProgressIndicator";
import { Album, Music, List, Shield, Headphones, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import PlaylistsTabContent from "./components/PlaylistsTabContent";
import ArtistsTabContent from "./components/ArtistsTabContent";
import AdminsTabContent from "./components/AdminsTabContent";
import SupportAgentsTabContent from "./components/SupportAgentsTabContent";
import ImportTabContent from "./components/ImportTabContent";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { axiosInstance, initializeAuthInstance } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";

const AdminPage = () => {
	const navigate = useNavigate();
	const { isSuperAdmin, isLoading } = useAuthStore();
	const { fetchAlbums, fetchSongs, fetchStats, fetchPlaylists, fetchArtists } = useMusicStore();
	const [isVerifying, setIsVerifying] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const auth = useAuth();

	// Initialize auth instance for axios interceptors
	useEffect(() => {
		initializeAuthInstance(auth);
	}, [auth]);

	const verifyAccess = useCallback(async () => {
		try {
			// Add a small delay to ensure auth state is stable
			await new Promise(resolve => setTimeout(resolve, 100));

			const response = await axiosInstance.get("/admin/check");
			const { admin } = response.data;

			if (admin) {
				setHasAccess(true);
			} else {
				navigate("/404", { replace: true });
			}
		} catch (error) {
			console.error("Error verifying admin access:", error);
			navigate("/404", { replace: true });
		} finally {
			setIsVerifying(false);
		}
	}, [navigate]);

	useEffect(() => {
		// Only verify access after auth loading is complete
		if (!isLoading) {
			verifyAccess();
		}
	}, [verifyAccess, isLoading]);

	useEffect(() => {
		if (hasAccess && !isLoading) {
			fetchAlbums();
			fetchSongs();
			fetchStats();
			fetchPlaylists();
			fetchArtists();
		}
	}, [hasAccess, isLoading, fetchAlbums, fetchSongs, fetchStats, fetchPlaylists, fetchArtists]);

	// Add interval to refresh stats every 30 seconds
	useEffect(() => {
		if (!hasAccess) return;

		const interval = setInterval(() => {
			fetchStats();
		}, 30000); // Refresh every 30 seconds

		return () => clearInterval(interval);
	}, [hasAccess, fetchStats]);

	if (isVerifying || isLoading) {
		return (
			<div className="min-h-screen bg-zinc-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-zinc-400">verifying access...</p>
				</div>
			</div>
		);
	}

	if (!hasAccess) {
		return null; // Will be redirected
	}
	return (
		<div
			className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
		>
			<ImportProgressIndicator />
			<Header />
			<DashboardStats />
			<MissingAudioAlert />
			<Tabs defaultValue='songs' className='space-y-6'>
				<TabsList className='p-1 bg-zinc-800/50'>
					<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
						<Music className='mr-2 size-4' />
						songs
					</TabsTrigger>
					<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
						<Album className='mr-2 size-4' />
						albums
					</TabsTrigger>
					<TabsTrigger value='playlists' className='data-[state=active]:bg-zinc-700'>
						<List className='mr-2 size-4' />
						playlists
					</TabsTrigger>
					<TabsTrigger value='artists' className='data-[state=active]:bg-zinc-700'>
						<List className='mr-2 size-4' />
						artists
					</TabsTrigger>
					<TabsTrigger value='import' className='data-[state=active]:bg-zinc-700'>
						<Download className='mr-2 size-4' />
						import
					</TabsTrigger>
					{isSuperAdmin && (
						<TabsTrigger value='admins' className='data-[state=active]:bg-zinc-700'>
							<Shield className='mr-2 size-4' />
							admins
						</TabsTrigger>
					)}
					{isSuperAdmin && (
						<TabsTrigger value='support-agents' className='data-[state=active]:bg-zinc-700'>
							<Headphones className='mr-2 size-4' />
							support agents
						</TabsTrigger>
					)}
				</TabsList>
				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
				<TabsContent value='playlists'>
					<PlaylistsTabContent />
				</TabsContent>
				<TabsContent value='artists'>
					<ArtistsTabContent />
				</TabsContent>
				<TabsContent value='import'>
					<ImportTabContent />
				</TabsContent>
				{isSuperAdmin && (
					<TabsContent value='admins'>
						<AdminsTabContent />
					</TabsContent>
				)}
				{isSuperAdmin && (
					<TabsContent value='support-agents'>
						<SupportAgentsTabContent />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
};
export default AdminPage;