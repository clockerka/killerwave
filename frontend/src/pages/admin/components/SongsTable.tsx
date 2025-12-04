import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { useImportStore } from "@/stores/useImportStore";
import { Calendar, Trash2, Pencil, AlertCircle } from "lucide-react";
import { ArtistLinks } from "@/components/ArtistLinks";
import { useState, useMemo } from "react";
import EditSongDialog from "./EditSongDialog";
import AddToPlaylistAdminButton from "./AddToPlaylistAdminButton";
import AudioUploadDropzone from "./AudioUploadDropzone";
import toast from "react-hot-toast";

const SongsTable = () => {
	const { songs, isLoading, error, deleteSong } = useMusicStore();
	const { startDelete, updateProgress, completeImport, failImport } = useImportStore();
	const [editSongId, setEditSongId] = useState<string | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const handleEditClick = (songId: string) => {
		setEditSongId(songId);
		setEditDialogOpen(true);
	};

	const handleDeleteClick = async (songId: string, songTitle: string) => {
		// Start background deletion
		startDelete(songTitle);

		try {
			updateProgress(0, 'deleting');
			await deleteSong(songId);
			updateProgress(1, 'complete');
			completeImport();
			toast.success(`track "${songTitle}" deleted successfully!`);
		} catch (error: any) {
			console.error("Error deleting song:", error);
			failImport(error?.message || "failed to delete track");
			toast.error(error?.message || "failed to delete track");
		}
	};

	// Sort songs: missing audio first, then by creation date
	const sortedSongs = useMemo(() => {
		return [...songs].sort((a, b) => {
			const aMissing = a.audioUrl?.includes('placeholder') ? 1 : 0;
			const bMissing = b.audioUrl?.includes('placeholder') ? 1 : 0;

			if (aMissing !== bMissing) {
				return bMissing - aMissing; // Missing audio first
			}

			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [songs]);
	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>loading songs...</div>
			</div>
		);
	}
	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>title</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead>release date</TableHead>
						<TableHead className='text-right'>actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedSongs.map((song) => {
						const needsAudio = song.audioUrl?.includes('placeholder');
						return (
							<TableRow
								key={song._id}
								className={`hover:bg-zinc-800/50 ${needsAudio ? 'bg-blue-500/10 border-l-4 border-blue-400' : ''}`}
							>
								<TableCell>
									<div className="relative">
										<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
										{needsAudio && (
											<div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
												<AlertCircle className="size-3 text-white" />
											</div>
										)}
									</div>
								</TableCell>
								<TableCell className='font-medium'>
									{song.title}
									{needsAudio && (
										<span className="ml-2 text-xs text-blue-400">(needs audio)</span>
									)}
								</TableCell>
								<TableCell><ArtistLinks artists={song.artists} /></TableCell>
								<TableCell>
									<span className='inline-flex items-center gap-1 text-zinc-400'>
										<Calendar className='h-4 w-4' />
										{song.createdAt.split("T")[0]}
									</span>
								</TableCell>
								<TableCell className='text-right'>
									{needsAudio ? (
										<div className="flex gap-2 justify-end items-center">
											<div className="w-48">
												<AudioUploadDropzone songId={song._id} />
											</div>
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
												onClick={() => handleEditClick(song._id)}
											>
												<Pencil className='size-4' />
											</Button>
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
												onClick={() => handleDeleteClick(song._id, song.title)}
											>
												<Trash2 className='size-4' />
											</Button>
										</div>
									) : (
										<div className='flex gap-2 justify-end'>
											<AddToPlaylistAdminButton songId={song._id} />
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
												onClick={() => handleEditClick(song._id)}
											>
												<Pencil className='size-4' />
											</Button>
											<Button
												variant={"ghost"}
												size={"sm"}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
												onClick={() => handleDeleteClick(song._id, song.title)}
											>
												<Trash2 className='size-4' />
											</Button>
										</div>
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<EditSongDialog
				songId={editSongId}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
			/>
		</>
	);
};
export default SongsTable;