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
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMusicStore } from "@/stores/useMusicStore";
const AddPlaylistDialog = () => {
	const { fetchPlaylists } = useMusicStore();
	const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [newPlaylist, setNewPlaylist] = useState({
		title: "",
		description: "",
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};
	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			if (!newPlaylist.title) {
				return toast.error("please enter a playlist title");
			}
			const formData = new FormData();
			formData.append("title", newPlaylist.title);
			if (newPlaylist.description) formData.append("description", newPlaylist.description);
			if (imageFile) formData.append("imageFile", imageFile);
			await axiosInstance.post("/admin/playlists", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			setNewPlaylist({
				title: "",
				description: "",
			});
			setImageFile(null);
			fetchPlaylists();
			setPlaylistDialogOpen(false);
			toast.success("playlist created successfully");
		} catch (error: any) {
			console.error("Error creating playlist:", error);
			toast.error(error.response?.data?.message || "failed to create playlist");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-orange-500 hover:bg-orange-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					add playlist
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>create playlist</DialogTitle>
					<DialogDescription>create a new playlist and add songs later</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='image/*'
						ref={fileInputRef}
						onChange={handleImageSelect}
						className='hidden'
					/>
					<div>
						<label className='text-sm font-medium mb-2 block'>playlist title</label>
						<Input
							value={newPlaylist.title}
							onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
					<div>
						<label className='text-sm font-medium mb-2 block'>description (optional)</label>
						<Input
							value={newPlaylist.description}
							onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
					<div>
						<label className='text-sm font-medium mb-2 block'>cover image (optional)</label>
						<Button onClick={() => fileInputRef.current?.click()} variant='outline' className='w-full'>
							{imageFile ? imageFile.name : "choose image"}
						</Button>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setPlaylistDialogOpen(false)} disabled={isLoading}>
						cancel
					</Button>
					<Button onClick={handleSubmit} className='bg-orange-500 hover:bg-orange-600' disabled={isLoading}>
						{isLoading ? "creating..." : "create playlist"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddPlaylistDialog;