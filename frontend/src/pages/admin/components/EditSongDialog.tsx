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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Song } from "@/types";

interface EditSongDialogProps {
	songId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditSongDialog = ({ songId, open, onOpenChange }: EditSongDialogProps) => {
	const { fetchSongs } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const [songData, setSongData] = useState<Song | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		lyrics: "",
	});

	const fetchSongData = async () => {
		if (!songId) return;

		try {
			const response = await axiosInstance.get(`/songs/${songId}`);
			setSongData(response.data);
			setFormData({
				title: response.data.title || "",
				lyrics: response.data.lyrics || "",
			});
		} catch (error: any) {
			console.error("Error fetching song:", error);
			toast.error("Failed to load song data");
		}
	};

	useEffect(() => {
		if (songId && open) {
			fetchSongData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [songId, open]);

	const handleSubmit = async () => {
		if (!songId) return;

		setIsLoading(true);
		try {
			// Update title if changed
			if (formData.title !== songData?.title) {
				await axiosInstance.put(`/admin/songs/${songId}`, {
					title: formData.title,
				});
			}

			// Update lyrics
			await axiosInstance.put(`/songs/${songId}/lyrics`, {
				lyrics: formData.lyrics,
			});

			toast.success("Song updated successfully");
			fetchSongs();
			onOpenChange(false);
		} catch (error: any) {
			console.error("Error updating song:", error);
			toast.error(error.response?.data?.message || "Failed to update song");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>Update song information and lyrics</DialogDescription>
				</DialogHeader>

				{songData && (
					<div className="space-y-4 py-4">
						<div className="flex items-center gap-4 mb-4">
							<img
								src={songData.imageUrl}
								alt={songData.title}
								className="w-20 h-20 rounded object-cover"
							/>
							<div>
								<div className="font-medium text-white">{songData.title}</div>
								<div className="text-sm text-zinc-400">
									{songData.artists?.map(a => a.name).join(", ")}
								</div>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium mb-2 block">Title</label>
							<Input
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								className="bg-zinc-800 border-zinc-700"
							/>
						</div>

						<div>
							<label className="text-sm font-medium mb-2 block">Lyrics</label>
							<textarea
								value={formData.lyrics}
								onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
								placeholder="enter song lyrics..."
								className="w-full bg-zinc-800 border border-zinc-700 text-white min-h-[300px] rounded-md px-3 py-2 font-mono text-sm leading-relaxed"
								rows={15}
							/>
							<div className="text-xs text-zinc-500 mt-1">
								{formData.lyrics ? `${formData.lyrics.length} characters` : "No lyrics"}
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading}
						className="bg-[#e8ecf3] hover:bg-[#d4dce8] text-black"
					>
						{isLoading ? "saving..." : "save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;

