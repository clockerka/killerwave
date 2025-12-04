import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import PlaylistsTable from "./PlaylistsTable";
import AddPlaylistDialog from "./AddPlaylistDialog";
const PlaylistsTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<List className='h-5 w-5 text-sky-500' />
							playlists library
						</CardTitle>
						<CardDescription>manage your playlists</CardDescription>
					</div>
					<AddPlaylistDialog />
				</div>
			</CardHeader>
			<CardContent>
				<PlaylistsTable />
			</CardContent>
		</Card>
	);
};
export default PlaylistsTabContent;