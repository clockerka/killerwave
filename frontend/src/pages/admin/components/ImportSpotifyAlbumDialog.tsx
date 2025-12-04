import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { ArtistAutocomplete } from "@/components/ArtistAutocomplete";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMusicStore } from "@/stores/useMusicStore";
import { useImportStore } from "@/stores/useImportStore";

interface SpotifyArtist {
	id: string;
	name: string;
	spotifyUrl: string | null;
}

interface SpotifyTrack {
	title: string;
	duration: number;
	trackNumber: number;
	spotifyId: string;
	previewUrl: string | null;
	spotifyArtists: SpotifyArtist[];
}

interface SpotifyAlbumData {
	title: string;
	releaseYear: number;
	imageUrl: string | null;
	spotifyArtists: SpotifyArtist[];
	tracks: SpotifyTrack[];
}

const ImportSpotifyAlbumDialog = () => {
	const { fetchAlbums, fetchSongs } = useMusicStore();
	const { startImport, updateProgress, completeImport, failImport } = useImportStore();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [spotifyUrl, setSpotifyUrl] = useState("");
	const [albumData, setAlbumData] = useState<SpotifyAlbumData | null>(null);
	const [albumArtists, setAlbumArtists] = useState<string[]>([]);
	const [trackArtists, setTrackArtists] = useState<Record<number, string[]>>({});

	// Handle album artists change - automatically update all tracks
	const handleAlbumArtistsChange = (newAlbumArtists: string[]) => {
		setAlbumArtists(newAlbumArtists);

		// Update all tracks to include album artists
		if (albumData) {
			const updatedTrackArtists: Record<number, string[]> = {};
			albumData.tracks.forEach((track) => {
				const currentTrackArtists = trackArtists[track.trackNumber] || [];
				// Remove old album artists and add new ones
				const trackOnlyArtists = currentTrackArtists.filter(
					artistId => !albumArtists.includes(artistId)
				);
				// Add new album artists at the beginning
				updatedTrackArtists[track.trackNumber] = [...newAlbumArtists, ...trackOnlyArtists];
			});
			setTrackArtists(updatedTrackArtists);
		}
	};

	const handleFetchAlbum = async () => {
		setIsLoading(true);
		try {
			if (!spotifyUrl.trim()) {
				return toast.error("please enter a spotify album URL");
			}

			const response = await axiosInstance.post("/admin/spotify/import-album", {
				spotifyUrl: spotifyUrl.trim(),
			});

			setAlbumData(response.data.albumInfo);

			// Fetch all artists from database for auto-matching
			const artistsResponse = await axiosInstance.get("/admin/artists");
			const dbArtists = artistsResponse.data;

			// Helper function to normalize names for comparison
			const normalizeName = (name: string) => {
				return name.toLowerCase().trim().replace(/[^\w\s]/g, '');
			};

			// Helper function to find matching artist
			// Priority: 1. Exact match, 2. Case-insensitive, 3. Normalized
			const findMatchingArtist = (spotifyName: string) => {
				// 1. First, try exact match (case-sensitive)
				let matched = dbArtists.find((dbArtist: any) =>
					dbArtist.name.trim() === spotifyName.trim()
				);
				if (matched) return matched;

				// 2. Try case-insensitive exact match
				matched = dbArtists.find((dbArtist: any) =>
					dbArtist.name.toLowerCase().trim() === spotifyName.toLowerCase().trim()
				);
				if (matched) return matched;

				// 3. Try normalized match (without special characters)
				const normalizedSpotifyName = normalizeName(spotifyName);
				matched = dbArtists.find((dbArtist: any) =>
					normalizeName(dbArtist.name) === normalizedSpotifyName
				);

				return matched;
			};

			// Auto-match album artists
			const matchedAlbumArtists: string[] = [];
			const exactMatchCount = { album: 0, track: 0 };

			response.data.albumInfo.spotifyArtists.forEach((spotifyArtist: SpotifyArtist) => {
				const matchedArtist = findMatchingArtist(spotifyArtist.name);
				if (matchedArtist) {
					matchedAlbumArtists.push(matchedArtist._id);
					// Check if it was exact match
					if (matchedArtist.name.trim() === spotifyArtist.name.trim()) {
						exactMatchCount.album++;
					}
				}
			});
			setAlbumArtists(matchedAlbumArtists);

			// Auto-match track artists
			const initialTrackArtists: Record<number, string[]> = {};
			response.data.albumInfo.tracks.forEach((track: SpotifyTrack) => {
				// Start with album artists (автоматически добавляем артистов альбома)
				const matchedTrackArtists: string[] = [...matchedAlbumArtists];

				// Then add track-specific artists if they're not already included
				track.spotifyArtists.forEach((spotifyArtist: SpotifyArtist) => {
					const matchedArtist = findMatchingArtist(spotifyArtist.name);
					if (matchedArtist && !matchedTrackArtists.includes(matchedArtist._id)) {
						matchedTrackArtists.push(matchedArtist._id);
						// Check if it was exact match
						if (matchedArtist.name.trim() === spotifyArtist.name.trim()) {
							exactMatchCount.track++;
						}
					}
				});
				initialTrackArtists[track.trackNumber] = matchedTrackArtists;
			});
			setTrackArtists(initialTrackArtists);

			const totalMatchedCount = matchedAlbumArtists.length +
				Object.values(initialTrackArtists).reduce((sum, arr) => sum + arr.length, 0);
			const totalExactCount = exactMatchCount.album + exactMatchCount.track;

			if (totalMatchedCount > 0) {
				if (totalExactCount === totalMatchedCount) {
					toast.success(`album loaded! ${totalMatchedCount} artist(s) matched exactly ✓`);
				} else if (totalExactCount > 0) {
					toast.success(
						`album loaded! ${totalExactCount} exact match(es) ✓, ${totalMatchedCount - totalExactCount} similar match(es) ~`
					);
				} else {
					toast.success(`album loaded! ${totalMatchedCount} similar artist match(es) found ~`);
				}
			} else {
				toast.success("album data loaded from spotify");
			}
		} catch (error: any) {
			console.error("Error fetching album from Spotify:", error);
			toast.error(error.response?.data?.message || "failed to fetch album from spotify");
		} finally {
			setIsLoading(false);
		}
	};

	const handleImport = async () => {
		if (!albumData) return;

		setIsLoading(true);
		try {
			if (albumArtists.length === 0) {
				return toast.error("please select at least one artist for the album");
			}

			// Check if all tracks have at least one artist
			const tracksWithoutArtists = albumData.tracks.filter(
				track => !trackArtists[track.trackNumber] || trackArtists[track.trackNumber].length === 0
			);

			if (tracksWithoutArtists.length > 0) {
				return toast.error("please select artists for all tracks");
			}

			// Save data before resetting state
			const albumTitle = albumData.title;
			const totalTracks = albumData.tracks.length;
			const savedAlbumData = albumData;
			const savedAlbumArtists = [...albumArtists];
			const savedTrackArtists = { ...trackArtists };

			// Close dialog immediately
			setDialogOpen(false);

			// Reset form state
			setAlbumData(null);
			setSpotifyUrl("");
			setAlbumArtists([]);
			setTrackArtists({});

		// Start import progress indicator
		startImport(albumTitle, totalTracks);

		// Step 1: Creating album structure (0-5%)
		updateProgress(0, 'creating');

		// NO simulation - only real progress from backend
		const response = await axiosInstance.post("/admin/spotify/create-imported-album", {
			albumData: savedAlbumData,
			artistMappings: {
				albumArtists: savedAlbumArtists,
				trackArtists: savedTrackArtists,
			}
		});

		const { downloadedCount = 0, songsNeedingAudio = [] } = response.data;

		// Mark as complete with full progress
		updateProgress(totalTracks, 'uploading');
		setTimeout(() => completeImport(), 100);

		// Show success message
		if (downloadedCount > 0 && songsNeedingAudio.length === 0) {
			toast.success(
				`🎉 album "${albumTitle}" imported! all ${downloadedCount} tracks downloaded automatically!`,
				{ duration: 5000 }
			);
		} else if (downloadedCount > 0) {
			toast.success(
				`album "${albumTitle}" imported! ${downloadedCount} tracks downloaded. ` +
				`${songsNeedingAudio.length} tracks need manual upload in songs tab.`,
				{ duration: 7000 }
			);
		} else {
			toast.success(
				`album "${albumTitle}" imported with ${response.data.songs.length} tracks. upload audio in songs tab.`,
				{ duration: 6000 }
			);
		}

			// Refresh data
			await fetchAlbums();
			await fetchSongs();
		} catch (error: any) {
			console.error("Error importing album:", error);
			failImport(error.response?.data?.message || "failed to import album");
			toast.error(error.response?.data?.message || "failed to import album");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setDialogOpen(false);
		setAlbumData(null);
		setSpotifyUrl("");
		setAlbumArtists([]);
		setTrackArtists({});
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={(open) => !isLoading && (open ? setDialogOpen(true) : handleClose())}>
			<DialogTrigger asChild>
				<Button className='bg-green-600 hover:bg-green-700 text-white'>
					<Download className='mr-2 h-4 w-4' />
					import from Spotify
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[85vh] overflow-auto max-w-4xl'>
				<DialogHeader>
					<DialogTitle>Import Album from Spotify</DialogTitle>
					<DialogDescription>
						Enter a Spotify album URL to import album data and tracks
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{!albumData ? (
						<>
							<div>
								<label className='text-sm font-medium mb-2 block'>Spotify Album URL</label>
								<Input
									value={spotifyUrl}
									onChange={(e) => setSpotifyUrl(e.target.value)}
									placeholder='https://open.spotify.com/album/...'
									className='bg-zinc-800 border-zinc-700'
									disabled={isLoading}
								/>
							</div>
							<Button
								onClick={handleFetchAlbum}
								disabled={isLoading}
								className='bg-green-600 hover:bg-green-700 w-full'
							>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Loading...
									</>
								) : (
									<>
										<Download className='mr-2 h-4 w-4' />
										Fetch Album Data
									</>
								)}
							</Button>
						</>
					) : (
						<>
							<div className='bg-zinc-800 rounded-lg p-4 border border-zinc-700'>
								<div className='flex items-start gap-4'>
									{albumData.imageUrl && (
										<img
											src={albumData.imageUrl}
											alt={albumData.title}
											className='w-24 h-24 rounded object-cover'
										/>
									)}
									<div className='flex-1'>
										<h3 className='text-xl font-bold text-white'>{albumData.title}</h3>
										<p className='text-sm text-zinc-400'>Release Year: {albumData.releaseYear}</p>
										<p className='text-sm text-zinc-400'>
											Spotify Artists: {albumData.spotifyArtists.map(a => a.name).join(', ')}
										</p>
										<p className='text-sm text-zinc-400'>{albumData.tracks.length} tracks</p>
									</div>
								</div>
							</div>

							<div>
								<label className='text-sm font-medium mb-2 block'>
									Select Album Artists from Your Catalog
								</label>
								<ArtistAutocomplete
									value={albumArtists}
									onChange={handleAlbumArtistsChange}
									placeholder='Search and select artists...'
								/>
							</div>


							<div className='space-y-3'>
								<h4 className='text-sm font-medium'>Assign Artists to Tracks</h4>
								<div className='max-h-[300px] overflow-y-auto space-y-2'>
									{albumData.tracks.map((track) => (
										<div key={track.trackNumber} className='bg-zinc-800 rounded p-3 border border-zinc-700'>
											<div className='mb-2'>
												<span className='text-xs text-zinc-500'>#{track.trackNumber}</span>
												<h5 className='text-sm font-medium text-white'>{track.title}</h5>
												<p className='text-xs text-zinc-400'>
													Spotify: {track.spotifyArtists.map(a => a.name).join(', ')}
												</p>
											</div>
											<ArtistAutocomplete
												value={trackArtists[track.trackNumber] || []}
												onChange={(artists) => setTrackArtists({
													...trackArtists,
													[track.trackNumber]: artists
												})}
												placeholder='Select artists for this track...'
											/>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					{albumData && (
						<Button
							onClick={handleImport}
							disabled={isLoading}
							className='bg-green-600 hover:bg-green-700'
						>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Importing...
								</>
							) : (
								'Import Album'
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ImportSpotifyAlbumDialog;

