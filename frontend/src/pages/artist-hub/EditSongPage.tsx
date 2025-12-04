import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Song } from '@/types';

interface Album {
	_id: string;
	title: string;
	imageUrl?: string;
}

const EditSongPage = () => {
	const { songId } = useParams<{ songId: string }>();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [song, setSong] = useState<Song | null>(null);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [formData, setFormData] = useState({
		title: '',
		albumId: '',
	});

	useEffect(() => {
		fetchSong();
		fetchAlbums();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [songId]);

	const fetchSong = async () => {
		try {
			const response = await axiosInstance.get(`/artist-hub/songs/${songId}`);
			setSong(response.data);
			setFormData({
				title: response.data.title || '',
				albumId: response.data.albumId || '',
			});
		} catch (error: any) {
			console.error('Error fetching song:', error);
			toast.error('failed to load song');
			navigate('/artist-hub/manage');
		}
	};

	const fetchAlbums = async () => {
		try {
			const response = await axiosInstance.get('/artist-hub/albums');
			setAlbums(response.data.albums || []);
		} catch (error: any) {
			console.error('Error fetching albums:', error);
		}
	};

	const handleSave = async () => {
		if (!songId) return;

		setIsLoading(true);
		try {
			await axiosInstance.put(`/artist-hub/songs/${songId}`, {
				title: formData.title,
				albumId: formData.albumId || null,
			});

			toast.success('song updated successfully');
			navigate('/artist-hub/manage');
		} catch (error: any) {
			console.error('Error updating song:', error);
			toast.error(error.response?.data?.message || 'failed to update song');
		} finally {
			setIsLoading(false);
		}
	};

	if (!song) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-zinc-400">loading...</div>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900">
				<div className="relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent" />
					<div className="relative max-w-4xl mx-auto px-4 py-20">
						<Button
							variant="ghost"
							onClick={() => navigate('/artist-hub/manage')}
							className="mb-6 hover:bg-zinc-800"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							back to manage
						</Button>

						<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
							<div className="flex items-center gap-4 mb-8">
								<img
									src={song.imageUrl}
									alt={song.title}
									className="w-24 h-24 rounded-lg object-cover"
								/>
								<div>
									<h1 className="text-3xl font-bold text-white mb-2">edit song</h1>
									<p className="text-zinc-400">
										{song.artists?.map(a => a.name).join(', ')}
									</p>
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<Label className="text-sm font-medium text-zinc-300 mb-2">
										song title
									</Label>
									<Input
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										className="bg-zinc-800 border-zinc-700 text-white"
									/>
								</div>

								<div>
									<Label className="text-sm font-medium text-zinc-300 mb-2">
										album (changing album will update song cover to match album)
									</Label>
									<Select
										value={formData.albumId}
										onValueChange={(value) => setFormData({ ...formData, albumId: value })}
									>
										<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
											<SelectValue placeholder="select album" />
										</SelectTrigger>
										<SelectContent className="bg-zinc-800 border-zinc-700">
											{albums.map((album) => (
												<SelectItem key={album._id} value={album._id}>
													<div className="flex items-center gap-2">
														{album.imageUrl && (
															<img
																src={album.imageUrl}
																alt={album.title}
																className="w-6 h-6 rounded object-cover"
															/>
														)}
														{album.title}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-xs text-zinc-500 mt-1">
										song cover will automatically match the selected album's cover
									</p>
								</div>

								<div className="flex gap-3">
									<Button
										onClick={handleSave}
										disabled={isLoading}
										className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium px-8"
									>
										<Save className="w-4 h-4 mr-2" />
										{isLoading ? 'saving...' : 'save changes'}
									</Button>
									<Button
										variant="outline"
										onClick={() => navigate('/artist-hub/manage')}
										disabled={isLoading}
										className="border-zinc-700"
									>
										cancel
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditSongPage;

