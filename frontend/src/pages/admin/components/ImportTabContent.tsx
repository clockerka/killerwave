import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Upload } from "lucide-react";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const ImportTabContent = () => {
	const [soundcloudUrl, setSoundcloudUrl] = useState("");
	const [albumTitle, setAlbumTitle] = useState("");
	const [albumYear, setAlbumYear] = useState(new Date().getFullYear().toString());
	const [isImporting, setIsImporting] = useState(false);
	const [isLoadingInfo, setIsLoadingInfo] = useState(false);
	const [contentType, setContentType] = useState<'track' | 'playlist' | null>(null);
	const [trackInfo, setTrackInfo] = useState<any>(null);
	const [playlistInfo, setPlaylistInfo] = useState<any>(null);

	const handleGetTrackInfo = async () => {
		if (!soundcloudUrl.trim()) {
			toast.error("Please enter a SoundCloud URL");
			return;
		}

		if (!soundcloudUrl.includes('soundcloud.com')) {
			toast.error("Please enter a valid SoundCloud URL");
			return;
		}

		setIsLoadingInfo(true);
		try {
			const response = await axiosInstance.post("/soundcloud/track-info", {
				url: soundcloudUrl.trim()
			});

			setContentType(response.data.type);

			if (response.data.type === 'playlist') {
				setPlaylistInfo(response.data.playlist);
				setTrackInfo(null);
				toast.success(`Playlist info loaded! (${response.data.playlist.trackCount} tracks)`);
			} else {
				setTrackInfo(response.data.track);
				setPlaylistInfo(null);
				toast.success("Track info loaded!");
			}
		} catch (error: any) {
			console.error("Error getting info:", error);
			toast.error(error.response?.data?.message || "Failed to get info");
		} finally {
			setIsLoadingInfo(false);
		}
	};

	const handleImport = async () => {
		if (!soundcloudUrl.trim()) {
			toast.error("Please enter a SoundCloud URL");
			return;
		}

		if (!soundcloudUrl.includes('soundcloud.com')) {
			toast.error("Please enter a valid SoundCloud URL");
			return;
		}

		setIsImporting(true);
		const isPlaylist = contentType === 'playlist';
		const toastId = toast.loading(isPlaylist ? "Importing playlist from SoundCloud..." : "Importing track from SoundCloud...");

		try {
			const response = await axiosInstance.post("/soundcloud/import", {
				url: soundcloudUrl.trim(),
				albumTitle: albumTitle.trim() || undefined,
				albumYear: albumYear ? parseInt(albumYear) : undefined
			});

			if (isPlaylist && response.data.stats) {
				const { imported, total, failed } = response.data.stats;
				toast.success(`Playlist imported! ${imported}/${total} tracks (${failed} failed)`, { id: toastId });
			} else {
				toast.success("Track imported successfully!", { id: toastId });
			}

			setSoundcloudUrl("");
			setAlbumTitle("");
			setTrackInfo(null);
			setPlaylistInfo(null);
			setContentType(null);
		} catch (error: any) {
			console.error("Error importing from SoundCloud:", error);
			toast.error(error.response?.data?.message || "Failed to import", { id: toastId });
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<div className='space-y-6'>
			<Card className='p-6 bg-zinc-800/50 border-zinc-700/50'>
				<div className='flex items-center gap-2 mb-6'>
					<Music className='size-6 text-blue-500' />
					<h2 className='text-2xl font-bold'>import from soundcloud</h2>
				</div>

				<div className='space-y-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>soundcloud track url</label>
						<div className='flex gap-2'>
							<Input
								value={soundcloudUrl}
								onChange={(e) => setSoundcloudUrl(e.target.value)}
								placeholder='https://soundcloud.com/...'
								className='flex-1'
							/>
							<Button
								onClick={handleGetTrackInfo}
								disabled={isLoadingInfo || !soundcloudUrl.trim()}
								variant='outline'
							>
								{isLoadingInfo ? "loading..." : "get info"}
							</Button>
						</div>
					</div>

					{playlistInfo && (
						<div className='bg-zinc-900/50 rounded-lg p-4 space-y-3'>
							<div className='mb-4'>
								<h3 className='font-bold text-lg'>{playlistInfo.title}</h3>
								<p className='text-zinc-400'>{playlistInfo.trackCount} tracks</p>
								<p className='text-sm text-zinc-500 mt-2'>{playlistInfo.description || 'No description'}</p>
							</div>

							<div className='max-h-48 overflow-y-auto space-y-2'>
								{playlistInfo.tracks.slice(0, 10).map((track: any, index: number) => (
									<div key={track.id} className='flex items-center gap-3 p-2 bg-zinc-800/50 rounded'>
										<span className='text-zinc-500 text-sm w-6'>{index + 1}</span>
										<img
											src={track.imageUrl}
											alt={track.title}
											className='w-10 h-10 rounded object-cover'
										/>
										<div className='flex-1 min-w-0'>
											<p className='font-medium truncate text-sm'>{track.title}</p>
											<p className='text-xs text-zinc-400 truncate'>{track.artist}</p>
										</div>
									</div>
								))}
								{playlistInfo.trackCount > 10 && (
									<p className='text-center text-sm text-zinc-500'>
										and {playlistInfo.trackCount - 10} more tracks...
									</p>
								)}
							</div>
						</div>
					)}

					{trackInfo && (
						<div className='bg-zinc-900/50 rounded-lg p-4 space-y-3'>
							<div className='flex items-center gap-4'>
								<img
									src={trackInfo.imageUrl}
									alt={trackInfo.title}
									className='w-20 h-20 rounded object-cover'
								/>
								<div className='flex-1'>
									<h3 className='font-bold text-lg'>{trackInfo.title}</h3>
									<p className='text-zinc-400'>{trackInfo.artist}</p>
									<p className='text-sm text-zinc-500'>
										{Math.floor(trackInfo.duration / 60)}:{(trackInfo.duration % 60).toString().padStart(2, '0')}
									</p>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium mb-2'>album title (optional)</label>
									<Input
										value={albumTitle}
										onChange={(e) => setAlbumTitle(e.target.value)}
										placeholder={trackInfo.title}
									/>
								</div>
								<div>
									<label className='block text-sm font-medium mb-2'>album year</label>
									<Input
										type='number'
										value={albumYear}
										onChange={(e) => setAlbumYear(e.target.value)}
										placeholder={new Date().getFullYear().toString()}
									/>
								</div>
							</div>
						</div>
					)}

					<Button
						onClick={handleImport}
						disabled={isImporting || !soundcloudUrl.trim()}
						className='w-full'
					>
						<Upload className='mr-2 h-4 w-4' />
						{isImporting
							? (contentType === 'playlist' ? "importing playlist..." : "importing...")
							: (contentType === 'playlist' ? "import playlist" : "import track")}
					</Button>
				</div>
			</Card>

			<Card className='p-6 bg-zinc-800/50 border-zinc-700/50'>
				<h3 className='text-lg font-bold mb-4'>how to use</h3>
				<ul className='space-y-2 text-sm text-zinc-400'>
					<li>• paste a soundcloud track or playlist url</li>
					<li>• track: https://soundcloud.com/artist/track</li>
					<li>• playlist: https://soundcloud.com/artist/sets/playlist</li>
					<li>• click "get info" to preview details</li>
					<li>• for playlists, it will import as an album with all tracks</li>
					<li>• optionally specify an album title (for single tracks)</li>
					<li>• click "import track/playlist" to download and add to your library</li>
					<li>• files will be automatically uploaded to cloudinary</li>
					<li>• if the artist doesn't exist, it will be created automatically</li>
				</ul>
			</Card>
		</div>
	);
};

export default ImportTabContent;

