import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import ArtistsTable from './ArtistsTable';
import AddArtistDialog from './AddArtistDialog';
const ArtistsTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Users className='h-5 w-5 text-sky-500' />
							artists
						</CardTitle>
						<CardDescription>manage artist profiles</CardDescription>
					</div>
					<AddArtistDialog />
				</div>
			</CardHeader>
			<CardContent>
				<ArtistsTable />
			</CardContent>
		</Card>
	);
};
export default ArtistsTabContent;