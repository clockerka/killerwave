import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useMusicStore } from "@/stores/useMusicStore";

interface AudioUploadDropzoneProps {
	songId: string;
	onSuccess?: () => void;
}

const AudioUploadDropzone = ({ songId, onSuccess }: AudioUploadDropzoneProps) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { fetchSongs } = useMusicStore();

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		const audioFile = files.find(file => file.type.startsWith('audio/'));

		if (audioFile) {
			await uploadAudio(audioFile);
		} else {
			toast.error("please drop an audio file");
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await uploadAudio(file);
		}
	};

	const uploadAudio = async (file: File) => {
		setIsUploading(true);
		try {
			console.log(`📤 Uploading audio for song ${songId}...`);

			const formData = new FormData();
			formData.append("audioFile", file);

			const response = await axiosInstance.put(`/admin/songs/${songId}/audio`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("✅ Audio upload response:", response.data);

			toast.success("audio uploaded successfully!");

			// Refresh songs list to show updated audio
			await fetchSongs();
			onSuccess?.();
		} catch (error: any) {
			console.error("❌ Error uploading audio:", error);
			console.error("Error response:", error.response?.data);
			toast.error(error.response?.data?.message || "failed to upload audio");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`relative border-2 border-dashed rounded-lg p-2 transition-all ${
				isDragging
					? "border-blue-400 bg-blue-400/10"
					: "border-zinc-600 hover:border-blue-400/50 hover:bg-blue-400/5"
			} ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="audio/*"
				onChange={handleFileSelect}
				className="hidden"
			/>
			<Button
				variant="ghost"
				size="sm"
				className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading}
			>
				<Upload className="size-4 mr-2" />
				{isUploading ? "uploading..." : "upload audio"}
			</Button>
		</div>
	);
};

export default AudioUploadDropzone;

