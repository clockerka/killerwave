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
import { useMusicStore } from "@/stores/useMusicStore";
import { ArtistAutocomplete } from "@/components/ArtistAutocomplete";
import { AlbumAutocomplete } from "@/components/AlbumAutocomplete";
import type { ChangeEvent } from "react";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
interface NewSong {
	title: string;
	artists: string[];
	albumId: string;
	duration: number;
	audioFile: File | null;
	imageFile: File | null;
	lyrics?: string;
}
const AddSongDialog = () => {
	const { fetchSongs } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artists: [],
		albumId: "",
		duration: 0,
		audioFile: null,
		imageFile: null,
		lyrics: "",
	});
	const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const audio = new Audio();
			audio.src = URL.createObjectURL(file);
			audio.onloadedmetadata = () => {
				setNewSong({
					...newSong,
					duration: Math.floor(audio.duration),
					audioFile: file,
				});
			};
		}
	};
	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setNewSong({ ...newSong, imageFile: file });
		}
	};
	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			if (!newSong.title || !newSong.audioFile) {
				return toast.error("please fill title and audio file");
			}


		const formData = new FormData();
		formData.append("title", newSong.title);
		formData.append("artists", JSON.stringify(newSong.artists));
		if (newSong.albumId) formData.append("albumId", newSong.albumId);
		formData.append("duration", newSong.duration.toString());
		if (newSong.lyrics) formData.append("lyrics", newSong.lyrics);
		formData.append("audioFile", newSong.audioFile);
		if (newSong.imageFile) formData.append("imageFile", newSong.imageFile);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

		setNewSong({
			title: "",
			artists: [],
			albumId: "",
			duration: 0,
			audioFile: null,
			imageFile: null,
			lyrics: "",
		});
			fetchSongs();
			toast.success("song added successfully");
			setSongDialogOpen(false);
		} catch (error: any) {
			console.error("Error adding song:", error);
			toast.error(error.response?.data?.message || "failed to add song");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-[#e8ecf3] hover:bg-[#d4dce8] text-black'>
					<Plus className='mr-2 h-4 w-4' />
					add song
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>add new song</DialogTitle>
					<DialogDescription>Add a new song to the music library</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						onChange={handleAudioChange}
					/>
					<input
						type='file'
						accept='image/*'
						ref={imageInputRef}
						hidden
						onChange={handleImageChange}
					/>

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => audioInputRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{newSong.audioFile ? newSong.audioFile.name : "choose audio file"}
							</div>
							<div className='text-xs text-zinc-500'>MP3, WAV up to 10MB</div>
						</div>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>
							cover image (optional)
						</label>
						<div
							className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
							onClick={() => imageInputRef.current?.click()}
						>
							<div className='text-center'>
								<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
									<Upload className='h-6 w-6 text-zinc-400' />
								</div>
								<div className='text-sm text-zinc-400 mb-2'>
									{newSong.imageFile ? newSong.imageFile.name : "choose cover image"}
								</div>
								<div className='text-xs text-zinc-500'>
									JPG, PNG up to 5MB
								</div>
							</div>
						</div>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>title</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>artists</label>
						<ArtistAutocomplete
							value={newSong.artists}
							onChange={(artists) => setNewSong({ ...newSong, artists })}
						/>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>album</label>
						<AlbumAutocomplete
							value={newSong.albumId}
							onChange={(albumId) => setNewSong({ ...newSong, albumId })}
							placeholder='search album...'
						/>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>Lyrics (optional)</label>
						<textarea
							value={newSong.lyrics}
							onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
							placeholder='enter song lyrics...'
							className='w-full bg-zinc-800 border border-zinc-700 text-white min-h-[120px] rounded-md px-3 py-2'
							rows={5}
						/>
					</div>

					{newSong.duration > 0 && (
						<div className='text-sm text-zinc-400'>
							duration: {Math.floor(newSong.duration / 60)}:{(newSong.duration % 60).toString().padStart(2, "0")}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className='bg-[#e8ecf3] hover:bg-[#d4dce8] text-black'>
						{isLoading ? "adding..." : "add song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddSongDialog;

