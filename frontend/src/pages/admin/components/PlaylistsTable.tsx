import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
const PlaylistsTable = () => {
	const { playlists, isLoading, error, deletePlaylist } = useMusicStore();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [EditDialogComp, setEditDialogComp] = useState<any>(null);
	useEffect(() => {
		let mounted = true;
		if (!selectedId) {
			setEditDialogComp(null);
			return;
		}
		import("./EditPlaylistDialog").then((m) => {
			if (!mounted) return;
			setEditDialogComp(() => m.default);
		});
		return () => {
			mounted = false;
		};
	}, [selectedId]);
	if (isLoading) return <div className='py-8 text-zinc-400'>loading playlists...</div>;
	if (error) return <div className='py-8 text-red-400'>{error}</div>;
	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>created</TableHead>
					<TableHead className='text-right'>actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{playlists.map((p: any) => (
					<TableRow key={p._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={p.imageUrl} alt={p.title} className='size-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{p.title}</TableCell>
						<TableCell className='max-w-[300px] truncate'>{p.description}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{p.createdAt.split("T")[0]}
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button variant='ghost' size='sm' onClick={() => setSelectedId(p._id)}>
									<Edit2 className='size-4' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									onClick={() => deletePlaylist(p._id)}
								>
									<Trash2 className='size-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			{selectedId && EditDialogComp && (
				<EditDialogComp playlistId={selectedId} open={!!selectedId} onOpenChange={(o: boolean) => !o && setSelectedId(null)} />
			)}
		</Table>
	);
};
export default PlaylistsTable;