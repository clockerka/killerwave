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
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMusicStore } from "@/stores/useMusicStore";

const AddAlbumDialog = () => {
	const { fetchAlbums } = useMusicStore();
	const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [newAlbum, setNewAlbum] = useState({
		title: "",
		artists: [] as string[],
		releaseYear: new Date().getFullYear(),
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
			if (!newAlbum.title || !imageFile) {
				return toast.error("please fill all the fields");
			}
			const formData = new FormData();
			formData.append("title", newAlbum.title);
			formData.append("artists", JSON.stringify(newAlbum.artists));
			formData.append("releaseYear", newAlbum.releaseYear.toString());
			formData.append("imageFile", imageFile);
			await axiosInstance.post("/admin/albums", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			setNewAlbum({
				title: "",
				artists: [],
				releaseYear: new Date().getFullYear(),
			});
			setImageFile(null);
			fetchAlbums();
			setAlbumDialogOpen(false);
			toast.success("album added successfully");
		} catch (error: any) {
			console.error("Error adding album:", error);
			toast.error(error.response?.data?.message || "failed to add album");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					add album
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>add new album</DialogTitle>
					<DialogDescription>add a new album to the music library</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
						<input
							type='file'
							ref={fileInputRef}
							onChange={handleImageSelect}
							accept='image/*'
							className='hidden'
						/>

						<div
							className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
							onClick={() => fileInputRef.current?.click()}
						>
							<div className='text-center'>
								<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
									<Upload className='h-6 w-6 text-zinc-400' />
								</div>
								<div className='text-sm text-zinc-400 mb-2'>
									{imageFile ? imageFile.name : "choose album cover"}
								</div>
								<div className='text-xs text-zinc-500'>jpg, png up to 5 mb</div>
							</div>
						</div>

						<div>
							<label className='text-sm font-medium mb-2 block'>album title</label>
							<Input
								value={newAlbum.title}
								onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
								className='bg-zinc-800 border-zinc-700'
							/>
						</div>

						<div>
							<label className='text-sm font-medium mb-2 block'>artists</label>
							<ArtistAutocomplete
								value={newAlbum.artists}
								onChange={(artists) => setNewAlbum({ ...newAlbum, artists })}
							/>
						</div>

						<div>
							<label className='text-sm font-medium mb-2 block'>release year</label>
							<Input
								type='number'
								value={newAlbum.releaseYear}
								onChange={(e) => setNewAlbum({ ...newAlbum, releaseYear: parseInt(e.target.value) })}
								className='bg-zinc-800 border-zinc-700'
							/>
						</div>

						<DialogFooter>
							<Button variant='outline' onClick={() => setAlbumDialogOpen(false)} disabled={isLoading}>
								cancel
							</Button>
							<Button onClick={handleSubmit} className='bg-emerald-500 hover:bg-emerald-600' disabled={isLoading}>
								{isLoading ? "adding..." : "add album"}
							</Button>
						</DialogFooter>
					</div>
			</DialogContent>
		</Dialog>
	);
}
export default AddAlbumDialog;