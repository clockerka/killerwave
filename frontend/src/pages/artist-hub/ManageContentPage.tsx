import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, Trash2, Edit, Play } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Song {
	_id: string;
	title: string;
	duration: number;
	imageUrl: string;
	audioUrl: string;
}

interface Album {
	_id: string;
	title: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
	totalPlayCount?: number;
}

const ManageContentPage = () => {
	const navigate = useNavigate();
	const [albums, setAlbums] = useState<Album[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

	useEffect(() => {
		fetchAlbums();
	}, []);

	const fetchAlbums = async () => {
		try {
			setIsLoading(true);
			const response = await axiosInstance.get('/artist-hub/albums');
			setAlbums(response.data.albums || []);
		} catch (error) {
			console.error('Error fetching albums:', error);
			toast.error('failed to load albums');
		} finally {
			setIsLoading(false);
		}
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleDeleteAlbum = async (albumId: string) => {
		if (!confirm('are you sure you want to delete this album? all songs in this album will also be deleted.')) {
			return;
		}

		try {
			await axiosInstance.delete(`/artist-hub/albums/${albumId}`);
			toast.success('album deleted successfully');
			fetchAlbums();
		} catch (error: any) {
			console.error('Error deleting album:', error);
			toast.error(error.response?.data?.message || 'failed to delete album');
		}
	};
	const handleDeleteSong = async (songId: string, albumId: string) => {
		if (!confirm('are you sure you want to delete this song?')) {
			return;
		}
		try {
			await axiosInstance.delete(`/artist-hub/songs/${songId}`);
			toast.success('song deleted successfully');
			setAlbums(albums.map(album => {
				if (album._id === albumId) {
					return {
						...album,
						songs: album.songs.filter(song => song._id !== songId)
					};
				}
				return album;
			}));
		} catch (error: any) {
			console.error('Error deleting song:', error);
			toast.error(error.response?.data?.message || 'failed to delete song');
		}
	};

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-zinc-400'>loading your content...</p>
				</div>
			</div>
		);
	}

	if (albums.length === 0) {
		return (
			<div className='h-full overflow-y-auto'>
				<div className='min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900'>
					<div className='max-w-6xl mx-auto px-4 py-20'>
						<Button
							onClick={() => navigate('/artist-hub')}
							variant='ghost'
							className='mb-6'
						>
							<ArrowLeft className='w-4 h-4 mr-2' />
							back to artist hub
						</Button>
						<div className='bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center'>
							<Music className='w-16 h-16 mx-auto mb-4 text-zinc-600' />
							<h2 className='text-2xl font-bold text-white mb-4'>no content yet</h2>
							<p className='text-zinc-400 mb-6'>
								start by creating your first album.
							</p>
							<Button
								onClick={() => navigate('/artist-hub/create-album')}
								className='bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700'
							>
								create album
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full overflow-y-auto'>
			<div className='min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900'>
				<div className='max-w-6xl mx-auto px-4 py-20'>
					<Button
						onClick={() => navigate('/artist-hub')}
						variant='ghost'
						className='mb-6'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						back to artist hub
					</Button>
					<div className='mb-8'>
						<h1 className='text-4xl font-bold text-white mb-2'>my content</h1>
						<p className='text-zinc-400'>manage your albums and songs</p>
					</div>

					<div className='space-y-6'>
						{albums.map((album) => (
							<div
								key={album._id}
								className='bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden'
							>
								{/* Album Header */}
								<div className='p-6'>
									<div className='flex items-start gap-6'>
										<img
											src={album.imageUrl}
											alt={album.title}
											className='w-32 h-32 rounded-lg object-cover'
										/>
										<div className='flex-1'>
											<h2 className='text-2xl font-bold text-white mb-2'>{album.title}</h2>
											<p className='text-zinc-400 mb-4'>
												{album.releaseYear} • {album.songs?.length || 0} songs
												{album.totalPlayCount !== undefined && (
													<> • {album.totalPlayCount.toLocaleString()} plays</>
												)}
											</p>
											<div className='flex gap-3'>
												<Button
													onClick={() => setExpandedAlbum(expandedAlbum === album._id ? null : album._id)}
													variant='outline'
													size='sm'
												>
													<Music className='w-4 h-4 mr-2' />
													{expandedAlbum === album._id ? 'hide' : 'show'} songs
												</Button>
												<Button
													onClick={() => navigate(`/artist-hub/edit-album/${album._id}`)}
													variant='outline'
													size='sm'
												>
													<Edit className='w-4 h-4 mr-2' />
													edit
												</Button>
												<Button
													onClick={() => handleDeleteAlbum(album._id)}
													variant='outline'
													size='sm'
													className='text-red-400 border-red-400 hover:bg-red-400/10'
												>
													<Trash2 className='w-4 h-4 mr-2' />
													delete
												</Button>
											</div>
										</div>
									</div>
								</div>

								{/* Songs List */}
								{expandedAlbum === album._id && (
									<div className='border-t border-zinc-800 bg-zinc-900/30'>
										{album.songs && album.songs.length > 0 ? (
											<div className='divide-y divide-zinc-800'>
												{album.songs.map((song, index) => (
													<div
														key={song._id}
														className='p-4 hover:bg-zinc-800/30 transition-colors flex items-center gap-4'
													>
														<span className='text-zinc-500 w-8 text-center'>{index + 1}</span>
														<img
															src={song.imageUrl || album.imageUrl}
															alt={song.title}
															className='w-12 h-12 rounded object-cover'
														/>
														<div className='flex-1'>
															<p className='text-white font-medium'>{song.title}</p>
															<p className='text-sm text-zinc-400'>{formatDuration(song.duration)}</p>
														</div>
														<div className='flex gap-2'>
														<Button
															onClick={() => {
																const audio = new Audio(song.audioUrl);
																audio.play();
															}}
															variant='ghost'
															size='sm'
															className='text-sky-400 hover:text-sky-300'
														>
															<Play className='w-4 h-4' />
														</Button>
															<Button
																onClick={() => navigate(`/artist-hub/edit-song/${song._id}`)}
																variant='ghost'
																size='sm'
															>
																<Edit className='w-4 h-4' />
															</Button>
															<Button
																onClick={() => handleDeleteSong(song._id, album._id)}
																variant='ghost'
																size='sm'
																className='text-red-400 hover:text-red-300'
															>
																<Trash2 className='w-4 h-4' />
															</Button>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className='p-8 text-center'>
												<p className='text-zinc-400 mb-4'>no songs in this album yet</p>
												<Button
													onClick={() => navigate('/artist-hub/create-song')}
													size='sm'
													className='bg-sky-500 hover:bg-sky-600'
												>
													add song
												</Button>
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ManageContentPage;

