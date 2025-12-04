import { useLibraryStore } from "@/stores/useLibraryStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AddToLibraryButtonProps {
	type: "song" | "album" | "artist" | "playlist";
	id: string;
	className?: string;
	size?: number;
}

const AddToLibraryButton = ({ type, id, className, size = 20 }: AddToLibraryButtonProps) => {
	const { isInLibrary, addSongToFavorites, removeSongFromFavorites, addAlbumToLibrary, removeAlbumFromLibrary, addArtistToLibrary, removeArtistFromLibrary, addPlaylistToLibrary, removePlaylistFromLibrary } = useLibraryStore();
	const { dbUser } = useAuthStore();

	const inLibrary = isInLibrary(type, id);
	const isSignedIn = !!dbUser;

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Check if user is signed in
		if (!isSignedIn) {
			toast.error('please sign in to add to library');
			return;
		}

		if (inLibrary) {
			switch (type) {
				case "song":
					await removeSongFromFavorites(id);
					break;
				case "album":
					await removeAlbumFromLibrary(id);
					break;
				case "artist":
					await removeArtistFromLibrary(id);
					break;
				case "playlist":
					await removePlaylistFromLibrary(id);
					break;
			}
		} else {
			switch (type) {
				case "song":
					await addSongToFavorites(id);
					break;
				case "album":
					await addAlbumToLibrary(id);
					break;
				case "artist":
					await addArtistToLibrary(id);
					break;
				case "playlist":
					await addPlaylistToLibrary(id);
					break;
			}
		}
	};

	// Don't show button if user is not signed in
	if (!isSignedIn) {
		return null;
	}

	return (
		<button
			onClick={handleClick}
			className={cn(
				"rounded-full flex items-center justify-center transition-all duration-200",
				inLibrary
					? "bg-[#8bb4f7] text-white hover:bg-[#7aa3e6]"
					: "bg-zinc-800/60 text-white hover:bg-zinc-700/60 hover:text-white hover:scale-105",
				className
			)}
			style={{ width: size, height: size }}
			title={inLibrary ? `remove from library` : `add to library`}
		>
			{inLibrary ? <Check size={size * 0.6} /> : <Plus size={size * 0.6} />}
		</button>
	);
};

export default AddToLibraryButton;