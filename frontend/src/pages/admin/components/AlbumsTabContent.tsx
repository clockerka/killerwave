import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";
import AlbumsTable from "./AlbumsTable";
import AddAlbumDialog from "./AddAlbumDialog";
import ImportSpotifyAlbumDialog from "./ImportSpotifyAlbumDialog";
const AlbumsTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Library className='h-5 w-5 text-[#e8ecf3]' />
							albums library
						</CardTitle>
						<CardDescription>manage your album collection</CardDescription>
					</div>
					<div className='flex gap-2'>
						<ImportSpotifyAlbumDialog />
						<AddAlbumDialog />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<AlbumsTable />
			</CardContent>
		</Card>
	);
};
export default AlbumsTabContent;