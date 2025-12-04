import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Music } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

interface Playlist {
	_id: string;
	title: string;
	imageUrl?: string;
	songs?: { _id: string }[] | string[];
}

interface AddToPlaylistAdminButtonProps {
	songId: string;
}

const AddToPlaylistAdminButton = ({ songId }: AddToPlaylistAdminButtonProps) => {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchPlaylists = async () => {
		try {
			const response = await axiosInstance.get("/playlists");
			setPlaylists(response.data);
		} catch (error: any) {
			console.error("Error fetching playlists:", error);
			toast.error("failed to load playlists");
		}
	};

	const handleAddToPlaylist = async (playlistId: string, playlistTitle: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post("/admin/playlists/add-song", {
				playlistId: playlistId,
				songId: songId
			});
			toast.success(`added to ${playlistTitle}`);
			// Refresh playlists to update status
			fetchPlaylists();
		} catch (error: any) {
			console.error("Error adding song to playlist:", error);
			toast.error(error.response?.data?.message || "failed to add to playlist");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveFromPlaylist = async (playlistId: string, playlistTitle: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post("/admin/playlists/remove-song", {
				playlistId: playlistId,
				songId: songId
			});
			toast.success(`removed from ${playlistTitle}`);
			// Refresh playlists to update status
			fetchPlaylists();
		} catch (error: any) {
			console.error("Error removing song from playlist:", error);
			toast.error(error.response?.data?.message || "failed to remove from playlist");
		} finally {
			setIsLoading(false);
		}
	};

	const isInPlaylist = (playlist: Playlist): boolean => {
		if (!playlist.songs) return false;
		return playlist.songs.some(song => {
			const songIdStr = typeof song === 'string' ? song : song._id;
			return songIdStr === songId;
		});
	};

	return (
		<DropdownMenu onOpenChange={(open) => open && fetchPlaylists()}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
					disabled={isLoading}
				>
					<Plus className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 w-64">
				<div className="px-2 py-1.5 text-sm font-medium text-zinc-400 border-b border-zinc-700">
					manage playlists
				</div>
				{playlists.length === 0 ? (
					<div className="px-2 py-4 text-sm text-zinc-500 text-center">
						<Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
						no playlists found
					</div>
				) : (
					playlists.map((playlist) => {
						const inPlaylist = isInPlaylist(playlist);
						return (
							<DropdownMenuItem
								key={playlist._id}
								onClick={() => inPlaylist ?
									handleRemoveFromPlaylist(playlist._id, playlist.title) :
									handleAddToPlaylist(playlist._id, playlist.title)
								}
								className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800"
							>
								{playlist.imageUrl ? (
									<img
										src={playlist.imageUrl}
										alt={playlist.title}
										className="w-8 h-8 rounded object-cover"
									/>
								) : (
									<div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center">
										<Music className="h-4 w-4 text-zinc-400" />
									</div>
								)}
								<span className="flex-1 truncate">{playlist.title}</span>
								{inPlaylist ? (
									<span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
										in playlist
									</span>
								) : (
									<span className="text-xs text-zinc-500">
										add
									</span>
								)}
							</DropdownMenuItem>
						);
					})
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AddToPlaylistAdminButton;
