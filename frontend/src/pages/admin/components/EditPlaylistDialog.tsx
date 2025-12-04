import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { SortableTrackList } from "@/components/SortableTrackList";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
	playlistId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditPlaylistDialog = ({ playlistId, open, onOpenChange }: Props) => {
	const { updatePlaylist, fetchPlaylists } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const [local, setLocal] = useState<any>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!playlistId || !open) return;
		let mounted = true;
		axiosInstance.get(`/playlists/${playlistId}`).then((res) => {
			if (mounted) setLocal(res.data);
		}).catch((e) => {
			toast.error("failed to load playlist: " + e.message);
		});
		return () => {
			mounted = false;
		};
	}, [playlistId, open]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setLocal({ ...local, newImage: file });
	};

	const handleSave = async () => {
		if (!local) return;
		setIsLoading(true);
		try {
			const fd = new FormData();
			fd.append("title", local.title);
			fd.append("description", local.description || "");
			if (local.newImage) fd.append("imageFile", local.newImage);
			fd.append("songs", JSON.stringify(local.songs.map((s: any) => s._id)));

			await updatePlaylist(local._id, fd);
			onOpenChange(false);
			await fetchPlaylists();
			toast.success("playlist updated");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "failed to update playlist");
		} finally {
			setIsLoading(false);
		}
	};

	if (!local) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-w-3xl max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>edit playlist</DialogTitle>
					<DialogDescription>edit playlist metadata and songs</DialogDescription>
				</DialogHeader>
				<input type='file' accept='image/*' ref={fileRef} onChange={handleImageChange} className='hidden' />

				<div className='space-y-4 py-4'>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => fileRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{local.newImage ? local.newImage.name : "change cover image"}
							</div>
							<div className='text-xs text-zinc-500'>JPG, PNG up to 5MB</div>
						</div>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>playlist title</label>
						<Input
							value={local.title}
							onChange={(e) => setLocal({ ...local, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>description</label>
						<Input
							value={local.description || ""}
							onChange={(e) => setLocal({ ...local, description: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>tracks</label>
						<SortableTrackList
							tracks={local.songs || []}
							onReorder={(songs) => setLocal({ ...local, songs })}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						cancel
					</Button>
					<Button onClick={handleSave} disabled={isLoading} className='bg-orange-500 hover:bg-orange-600'>
						{isLoading ? "saving..." : "save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditPlaylistDialog;

