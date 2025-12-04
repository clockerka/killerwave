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
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
	artistId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditArtistDialog = ({ artistId, open, onOpenChange }: Props) => {
	const { fetchArtists } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const [local, setLocal] = useState<any>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!artistId || !open) return;
		let mounted = true;
		axiosInstance.get(`/artists/${artistId}`).then((res) => {
			if (mounted) setLocal(res.data);
		}).catch((e) => {
			toast.error("failed to load artist: " + e.message);
		});
		return () => {
			mounted = false;
		};
	}, [artistId, open]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setLocal({ ...local, newImage: file });
	};

	const handleSave = async () => {
		if (!local) return;
		setIsLoading(true);
		try {
			const fd = new FormData();
			fd.append("name", local.name);
			fd.append("verified", local.verified.toString());
			if (local.newImage) fd.append("imageFile", local.newImage);

			await axiosInstance.put(`/admin/artists/${artistId}`, fd, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			fetchArtists();
			onOpenChange(false);
			toast.success("artist updated");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "failed to update artist");
		} finally {
			setIsLoading(false);
		}
	};

	if (!local) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>edit artist</DialogTitle>
					<DialogDescription>update artist details</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<input type='file' accept='image/*' ref={fileRef} onChange={handleImageChange} className='hidden' />

					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => fileRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{local.newImage ? local.newImage.name : "change artist image"}
							</div>
							<div className='text-xs text-zinc-500'>JPG, PNG up to 5MB</div>
						</div>
					</div>

					<div>
						<label className='text-sm font-medium mb-2 block'>artist name</label>
						<Input
							value={local.name}
							onChange={(e) => setLocal({ ...local, name: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='flex items-center gap-2'>
						<input
							type='checkbox'
							id='edit-verified'
							checked={local.verified}
							onChange={(e) => setLocal({ ...local, verified: e.target.checked })}
							className='w-4 h-4'
						/>
						<label htmlFor='edit-verified' className='text-sm font-medium'>
							verified artist
						</label>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						cancel
					</Button>
					<Button onClick={handleSave} disabled={isLoading} className='bg-blue-500 hover:bg-blue-600'>
						{isLoading ? "saving..." : "save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditArtistDialog;

