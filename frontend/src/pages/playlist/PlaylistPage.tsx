import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/lib/axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Play, Pause, Clock, Repeat, Shuffle, Edit, Trash, X, GripVertical, ImagePlus, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { ArtistLinks } from '@/components/ArtistLinks';
import AddToLibraryButton from '@/components/AddToLibraryButton';
import AddToPlaylistButton from '@/components/AddToPlaylistButton';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const PlaylistPage = () => {
	const { playlistId } = useParams();
	const navigate = useNavigate();
	const [playlist, setPlaylist] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { currentSong, isPlaying, playAlbum, togglePlay, repeatMode, isShuffle, toggleRepeat, toggleShuffle } = usePlayerStore();
	const { fetchLibrary, fetchFavoritesPlaylist } = useLibraryStore();
	const { dbUser } = useAuthStore();

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editTitle, setEditTitle] = useState('');
	const [editDescription, setEditDescription] = useState('');
	const [editImage, setEditImage] = useState<File | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [daylistCover, setDaylistCover] = useState<string>('');

	const DAYLIST_ID = '6903a8fcf3c46d242519832d';
	const isDaylist = playlistId === DAYLIST_ID;

	const getDaylistCover = () => {
		const hour = new Date().getHours();
		if (hour >= 6 && hour < 10) {
			return '/daylist/morning.JPG';
		} else if (hour >= 10 && hour < 18) {
			return '/daylist/day.JPG';
		} else if (hour >= 18 && hour < 22) {
			return '/daylist/evening.JPG';
		} else {
			return '/daylist/night.JPG';
		}
	};

	const isOwner = playlist?.userId && dbUser?._id && String(playlist.userId) === String(dbUser._id);

	useEffect(() => {
		const fetchPlaylist = async () => {
			if (!playlistId) return;
			try {
				const response = await axiosInstance.get(`/playlists/${playlistId}`);
				setPlaylist(response.data);
			} catch (error) {
				console.error('Failed to fetch playlist:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlaylist();
		// Only fetch library data if user is authenticated
		if (dbUser) {
			fetchLibrary();
			fetchFavoritesPlaylist();
		}

		// Update daylist cover if it's daylist
		if (isDaylist) {
			setDaylistCover(getDaylistCover());
			const interval = setInterval(() => {
				setDaylistCover(getDaylistCover());
			}, 60000);
			return () => clearInterval(interval);
		}
	}, [playlistId, fetchLibrary, fetchFavoritesPlaylist, isDaylist, dbUser]);

	if (loading) return null;
	if (!playlist) return <div className='h-full flex items-center justify-center text-zinc-400'>playlist not found</div>;

	const handlePlayPlaylist = () => {
		if (!playlist?.songs || playlist.songs.length === 0) return;

		const isCurrentPlaylistPlaying = playlist.songs.some((song: any) => song._id === currentSong?._id);
		if (isCurrentPlaylistPlaying) togglePlay();
		else playAlbum(playlist.songs, 0);
	};

	const handlePlaySong = (index: number) => {
		if (!playlist?.songs) return;
		playAlbum(playlist.songs, index);
	};

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const handleEditPlaylist = async () => {
		if (!editTitle.trim()) {
			toast.error('Title is required');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('title', editTitle);
			if (editDescription) formData.append('description', editDescription);
			if (editImage) formData.append('imageFile', editImage);

			const response = await axiosInstance.put(`/playlists/${playlistId}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			setPlaylist(response.data);
			setIsEditDialogOpen(false);
			toast.success('Playlist updated');
		} catch (error) {
			console.error('Error updating playlist:', error);
			toast.error('Failed to update playlist');
		}
	};

	const handleDeletePlaylist = async () => {
		if (!window.confirm('Are you sure you want to delete this playlist?')) return;

		setIsDeleting(true);
		try {
			await axiosInstance.delete(`/playlists/${playlistId}`);
			toast.success('Playlist deleted');
			navigate('/my');
		} catch (error) {
			console.error('Error deleting playlist:', error);
			toast.error('Failed to delete playlist');
			setIsDeleting(false);
		}
	};

	const handleRemoveSong = async (songId: string) => {
		try {
			await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			const response = await axiosInstance.get(`/playlists/${playlistId}`);
			setPlaylist(response.data);
			toast.success('Song removed');
		} catch (error) {
			console.error('Error removing song:', error);
			toast.error('Failed to remove song');
		}
	};

	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(playlist.songs);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setPlaylist({ ...playlist, songs: items });

		try {
			await axiosInstance.put(`/playlists/${playlistId}`, {
				songs: items.map((song: any) => song._id),
			});
			toast.success('Order updated');
		} catch (error: any) {
			console.error('Error reordering songs:', error);
			toast.error('Failed to update order');
			const response = await axiosInstance.get(`/playlists/${playlistId}`);
			setPlaylist(response.data);
		}
	};

	const openEditDialog = () => {
		setEditTitle(playlist.title);
		setEditDescription(playlist.description || '');
		setEditImage(null);
		setIsEditDialogOpen(true);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='absolute inset-0 bg-gradient-to-b from-blue-500/40 via-zinc-900/80 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='flex flex-col sm:flex-row p-6 gap-6 pb-8'>
							{isDaylist && daylistCover ? (
								<img
									src={daylistCover}
									alt={playlist.title}
									className='w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] shadow-xl rounded object-cover mx-auto sm:mx-0'
								/>
							) : playlist.imageUrl ? (
								<img
									src={playlist.imageUrl}
									alt={playlist.title}
									className='w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] shadow-xl rounded object-cover mx-auto sm:mx-0'
								/>
							) : (
								<div className='w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] shadow-xl rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto sm:mx-0'>
									<Music size={96} className='text-white' />
								</div>
							)}
							<div className='flex flex-col justify-end flex-1 text-center sm:text-left'>
								<p className='text-sm font-medium'>playlist</p>
								<div className='flex flex-col sm:flex-row sm:items-center gap-4'>
									<h1 className='text-4xl sm:text-7xl font-bold my-4'>{playlist.title}</h1>
									{!isOwner && !playlist.isFavorites && playlistId && playlistId !== 'my' && (
										<AddToLibraryButton type='playlist' id={playlistId} size={40} />
									)}
									{isOwner && (
										<div className='flex gap-2'>
											<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
												<DialogTrigger asChild>
													<Button size='icon' variant='ghost' className='rounded-full hover:bg-white/10' onClick={openEditDialog}>
														<Edit size={24} />
													</Button>
												</DialogTrigger>
												<DialogContent className='bg-zinc-900 text-white border-zinc-800'>
													<DialogHeader>
														<DialogTitle>edit playlist</DialogTitle>
														<DialogDescription className='text-zinc-400'>Update playlist details</DialogDescription>
													</DialogHeader>
													<div className='space-y-4 mt-4'>
														<div>
															<label className='text-sm text-zinc-400 mb-2 block'>Title *</label>
															<Input
																value={editTitle}
																onChange={(e) => setEditTitle(e.target.value)}
																className='bg-zinc-800 border-zinc-700 text-white'
															/>
														</div>
														<div>
															<label className='text-sm text-zinc-400 mb-2 block'>Description</label>
															<Input
																value={editDescription}
																onChange={(e) => setEditDescription(e.target.value)}
																className='bg-zinc-800 border-zinc-700 text-white'
															/>
														</div>
														<div>
															<label className='text-sm text-zinc-400 mb-2 block'>cover image</label>
															<div
																className='border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-zinc-800/50'
																onClick={() => document.getElementById('edit-playlist-image-input')?.click()}
																onDragOver={(e) => {
																	e.preventDefault();
																	e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
																}}
																onDragLeave={(e) => {
																	e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
																}}
																onDrop={(e) => {
																	e.preventDefault();
																	e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
																	const file = e.dataTransfer.files[0];
																	if (file && file.type.startsWith('image/')) {
																		setEditImage(file);
																	}
																}}
															>
																{editImage ? (
																	<div className='space-y-2'>
																		<ImagePlus className='mx-auto text-blue-500' size={48} />
																		<p className='text-sm text-white font-medium'>{editImage.name}</p>
																		<p className='text-xs text-zinc-500'>Click to change image</p>
																	</div>
																) : (
																	<div className='space-y-2'>
																		<ImagePlus className='mx-auto text-zinc-500' size={48} />
																		<p className='text-sm text-zinc-400'>Click or drag image here</p>
																		<p className='text-xs text-zinc-500'>PNG, JPG up to 10MB</p>
																	</div>
																)}
																<input
																	id='edit-playlist-image-input'
																	type='file'
																	accept='image/*'
																	className='hidden'
																	onChange={(e) => {
																		const file = e.target.files?.[0];
																		if (file) setEditImage(file);
																	}}
																/>
															</div>
														</div>
													</div>
													<div className='flex gap-2 mt-4'>
														<Button onClick={handleEditPlaylist} className='flex-1 bg-blue-500 hover:bg-blue-600'>
															save changes
														</Button>
														<Button onClick={() => setIsEditDialogOpen(false)} variant='outline' className='border-zinc-700'>
															cancel
														</Button>
													</div>
												</DialogContent>
											</Dialog>
											<Button
												size='icon'
												variant='ghost'
												className='rounded-full hover:bg-red-500/20 text-red-500'
												onClick={handleDeletePlaylist}
												disabled={isDeleting}
											>
												<Trash size={24} />
											</Button>
										</div>
									)}
								</div>
								{playlist.description && <p className='text-zinc-400'>{playlist.description}</p>}
								<div className='flex items-center gap-2 text-sm text-zinc-100 mt-2'>
									<span>{playlist.songs?.length || 0} songs</span>
								</div>
							</div>
						</div>

						<div className='px-6 pb-4 flex items-center gap-4'>
							<Button
								onClick={handlePlayPlaylist}
								size='icon'
								className='w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 hover:scale-105 transition-all'
								disabled={!playlist.songs || playlist.songs.length === 0}
							>
								{isPlaying && playlist.songs?.some((song: any) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>

							<Button
								onClick={toggleShuffle}
								size='icon'
								variant='ghost'
								className={`hover:bg-white/10 transition-colors ${isShuffle ? 'text-blue-500' : 'text-zinc-400'}`}
							>
								<Shuffle className='h-5 w-5' />
							</Button>

							<Button
								onClick={toggleRepeat}
								size='icon'
								variant='ghost'
								className={`hover:bg-white/10 transition-colors relative ${
									repeatMode === 'off' ? 'text-zinc-400' : 'text-blue-500'
								}`}
							>
								<Repeat className='h-5 w-5' />
								{repeatMode === 'one' && (
									<span className='absolute text-[10px] font-bold' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
										1
									</span>
								)}
							</Button>
						</div>

						<div className='bg-black/20 backdrop-blur-sm'>
							<div className='grid grid-cols-[auto_16px_4fr_2fr_1fr_40px] gap-4 px-10 py-2 text-sm text-zinc-400 border-b border-white/5'>
								<div></div>
								<div>#</div>
								<div>Title</div>
								<div>Artist</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div></div>
							</div>

							{playlist.songs && playlist.songs.length > 0 ? (
								<DragDropContext onDragEnd={handleDragEnd}>
									<Droppable droppableId='playlist-songs' isDropDisabled={!isOwner}>
										{(provided) => (
											<div {...provided.droppableProps} ref={provided.innerRef} className='px-6 space-y-2 pb-40'>
												{playlist.songs.map((song: any, index: number) => {
													const isCurrentSong = currentSong?._id === song._id;

													return (
														<Draggable key={song._id} draggableId={song._id} index={index} isDragDisabled={!isOwner}>
															{(provided, snapshot) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	className={`grid grid-cols-[auto_16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer ${
																		snapshot.isDragging ? 'bg-white/10' : ''
																	}`}
																	onClick={() => handlePlaySong(index)}
																>
																	{isOwner && (
																		<div {...provided.dragHandleProps} className='flex items-center cursor-grab active:cursor-grabbing'>
																			<GripVertical className='h-4 w-4 text-zinc-500' />
																		</div>
																	)}
																	{!isOwner && <div></div>}

																	<div className='flex items-center justify-center'>
																		{isCurrentSong && isPlaying ? (
																			<div className='size-4 text-blue-500'>♫</div>
																		) : (
																			<span className='group-hover:hidden'>{index + 1}</span>
																		)}
																		{!isCurrentSong && <Play className='h-4 w-4 hidden group-hover:block' />}
																	</div>

																	<div className='flex items-center gap-3'>
																		<img src={song.imageUrl} alt={song.title} className='size-10 rounded' />
																		<div>
																			<div className={`font-medium text-white ${isCurrentSong ? 'text-blue-500' : ''}`}>
																				{song.title}
																			</div>
																		</div>
																	</div>

																	<div className='flex items-center'>
																		<ArtistLinks artists={song.artists} />
																		{song.playCount !== undefined && (
																			<span className='text-zinc-500'> • {song.playCount.toLocaleString()} plays</span>
																		)}
																	</div>

																	<div className='flex items-center'>{formatDuration(song.duration)}</div>

																	<div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
																		{isOwner && (
																			<Button
																				size='icon'
																				variant='ghost'
																				className='h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500'
																				onClick={(e) => {
																					e.stopPropagation();
																					handleRemoveSong(song._id);
																				}}
																			>
																				<X size={16} />
																			</Button>
																		)}
																		{!isOwner && <AddToPlaylistButton songId={song._id} />}
																	</div>
																</div>
															)}
														</Draggable>
													);
												})}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
							) : (
								<div className='flex flex-col items-center justify-center py-20'>
									<Music size={64} className='text-zinc-600 mb-4' />
									<p className='text-zinc-400'>no songs in this playlist</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default PlaylistPage;

