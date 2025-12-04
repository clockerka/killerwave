import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { axiosInstance } from '@/lib/axios';
interface AddToPlaylistButtonProps {
	songId: string;
	className?: string;
	size?: number;
}
const AddToPlaylistButton = ({ songId, className, size = 20 }: AddToPlaylistButtonProps) => {
	const { favoritesPlaylist, userPlaylists, fetchUserPlaylists, addSongToFavorites, removeSongFromFavorites } = useLibraryStore();
	const { dbUser } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);

	// Don't show button if user is not signed in
	if (!dbUser) {
		return null;
	}

	const handleAddToPlaylist = async (playlistId: string) => {
		try {
			await axiosInstance.post(`/playlists/${playlistId}/songs/${songId}`);
			await fetchUserPlaylists();
			toast.success('added to playlist');
		} catch (error: any) {
			console.error('Error adding to playlist:', error);
			toast.error(error.response?.data?.message || 'failed to add to playlist');
		}
	};
	const handleRemoveFromPlaylist = async (playlistId: string) => {
		try {
			await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			await fetchUserPlaylists();
			toast.success('removed from playlist');
		} catch (error: any) {
			console.error('Error removing from playlist:', error);
			toast.error(error.response?.data?.message || 'failed to remove from playlist');
		}
	};
	const handleToggleFavorites = async () => {
		if (isSongInFavorites) {
			await removeSongFromFavorites(songId);
		} else {
			await addSongToFavorites(songId);
		}
	};
	const isSongInPlaylist = (playlistId: string) => {
		const playlist = userPlaylists.find(p => p._id === playlistId);
		return playlist?.songs?.some((s: any) => s._id === songId || s === songId);
	};
	const isSongInFavorites = favoritesPlaylist?.songs?.some((s: any) => s._id === songId || s === songId);
	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						'rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110',
						'bg-zinc-800/90 hover:bg-[#8bb4f7] text-zinc-400 hover:text-white',
						className
					)}
					style={{ width: size, height: size }}
				>
					<Plus size={size * 0.6} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='bg-zinc-900 border-zinc-800 text-white w-56'>
				<DropdownMenuLabel>add to playlist</DropdownMenuLabel>
				<DropdownMenuSeparator className='bg-zinc-800' />
				<DropdownMenuItem
					onClick={handleToggleFavorites}
					className='cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800'
				>
					<div className='flex items-center justify-between w-full'>
						<span>favorite tracks</span>
						{isSongInFavorites && <Check size={16} className='text-[#8bb4f7]' />}
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator className='bg-zinc-800' />
				{userPlaylists.length > 0 ? (
					userPlaylists.map((playlist) => {
						const isInPlaylist = isSongInPlaylist(playlist._id);
						return (
							<DropdownMenuItem
								key={playlist._id}
								onClick={() => isInPlaylist ? handleRemoveFromPlaylist(playlist._id) : handleAddToPlaylist(playlist._id)}
								className='cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800'
							>
								<div className='flex items-center justify-between w-full'>
									<span className='truncate'>{playlist.title}</span>
									{isInPlaylist && <Check size={16} className='text-[#8bb4f7]' />}
								</div>
							</DropdownMenuItem>
						);
					})
				) : (
					<DropdownMenuItem disabled className='text-zinc-500 text-sm'>
						no playlists yet
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default AddToPlaylistButton;