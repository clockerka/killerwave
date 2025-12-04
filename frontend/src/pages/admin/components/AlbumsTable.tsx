import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Music, Trash2, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { ArtistLinks } from "@/components/ArtistLinks";
import EditAlbumDialog from "./EditAlbumDialog";
const AlbumsTable = () => {
	const { albums, deleteAlbum, fetchAlbums } = useMusicStore();
	const [editAlbumId, setEditAlbumId] = useState<string | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>title</TableHead>
						<TableHead>artist</TableHead>
						<TableHead>release year</TableHead>
						<TableHead>songs</TableHead>
						<TableHead className='text-right'>actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{albums.map((album) => (
						<TableRow key={album._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								<img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
							</TableCell>
				<TableCell className='font-medium'>{album.title}</TableCell>
			<TableCell><ArtistLinks artists={album.artists} /></TableCell>
						<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
									{album.releaseYear}
								</span>
							</TableCell>
							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Music className='h-4 w-4' />
									{album.songs.length} songs
								</span>
							</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => {
										setEditAlbumId(album._id);
										setEditDialogOpen(true);
									}}
									className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
								>
									<Edit className='h-4 w-4' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => deleteAlbum(album._id)}
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
		<EditAlbumDialog
			albumId={editAlbumId}
			open={editDialogOpen}
			onOpenChange={setEditDialogOpen}
		/>
		</>
	);
};
export default AlbumsTable;