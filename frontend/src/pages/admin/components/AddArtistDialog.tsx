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
const AddArtistDialog = () => {
	const { fetchArtists } = useMusicStore();
	const [artistDialogOpen, setArtistDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [newArtist, setNewArtist] = useState({
		name: "",
		verified: false,
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
			if (!newArtist.name || !imageFile) {
				return toast.error("please fill all the fields");
			}
			const formData = new FormData();
			formData.append("name", newArtist.name);
			formData.append("verified", newArtist.verified.toString());
			formData.append("imageFile", imageFile);

			await axiosInstance.post("/admin/artists", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			setNewArtist({
				name: "",
				verified: false,
			});
			setImageFile(null);
			fetchArtists();
			setArtistDialogOpen(false);
			toast.success("artist added successfully");
		} catch (error: any) {
			console.error("Error adding artist:", error);
			toast.error(error.response?.data?.message || "failed to add artist");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Dialog open={artistDialogOpen} onOpenChange={setArtistDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-blue-500 hover:bg-blue-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					add artist
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>add new artist</DialogTitle>
					<DialogDescription>add a new artist to the music library</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input type='file' accept='image/*' ref={fileInputRef} onChange={handleImageSelect} className='hidden' />
					<div>
						<label className='text-sm font-medium mb-2 block'>artist name</label>
						<Input
							value={newArtist.name}
							onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
					<div>
						<label className='text-sm font-medium mb-2 block'>artist image</label>
						<Button onClick={() => fileInputRef.current?.click()} variant='outline' className='w-full'>
 							{imageFile ? imageFile.name : "choose image"}
						</Button>
					</div>
					<div className='flex items-center gap-2'>
						<input
							type='checkbox'
							id='verified'
							checked={newArtist.verified}
							onChange={(e) => setNewArtist({ ...newArtist, verified: e.target.checked })}
							className='w-4 h-4'
						/>
						<label htmlFor='verified' className='text-sm font-medium'>
							verified artist
						</label>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setArtistDialogOpen(false)} disabled={isLoading}>
						cancel
					</Button>
					<Button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-600' disabled={isLoading}>
						{isLoading ? "adding..." : "add artist"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddArtistDialog;