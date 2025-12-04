import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, ArrowLeft, Music } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Album {
	_id: string;
	title: string;
	imageUrl: string;
}

const CreateSongPage = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioDuration, setAudioDuration] = useState<number>(0);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, setFormData] = useState({
		title: '',
		albumId: ''
	});

	useEffect(() => {
		fetchAlbums();
	}, []);

	const fetchAlbums = async () => {
		try {
			const response = await axiosInstance.get('/artist-hub/albums');
			setAlbums(response.data.albums || []);
		} catch (error) {
			console.error('Error fetching albums:', error);
			toast.error('failed to load albums');
		}
	};
	const handleAudioChange = (file: File) => {
		if (!file.type.startsWith('audio/')) {
			toast.error('please select an audio file');
			return;
		}
		if (file.size > 50 * 1024 * 1024) {
			toast.error('audio file size must be less than 50mb');
			return;
		}

		setAudioFile(file);

		// Get duration
		const audio = new Audio();
		audio.src = URL.createObjectURL(file);
		audio.addEventListener('loadedmetadata', () => {
			setAudioDuration(Math.round(audio.duration));
			URL.revokeObjectURL(audio.src);
		});
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleAudioChange(file);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			handleAudioChange(file);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const removeAudio = () => {
		setAudioFile(null);
		setAudioDuration(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!audioFile) {
			toast.error('please upload an audio file');
			return;
		}
		if (!formData.albumId) {
			toast.error('please select an album');
			return;
		}

		try {
			setIsLoading(true);

			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title);
			formDataToSend.append('albumId', formData.albumId);
			formDataToSend.append('duration', audioDuration.toString());
			formDataToSend.append('audioFile', audioFile);

			await axiosInstance.post('/artist-hub/songs', formDataToSend, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			toast.success('song created successfully!');
			navigate('/artist-hub');
		} catch (error: any) {
			console.error('Error creating song:', error);
			toast.error(error.response?.data?.message || 'failed to create song');
		} finally {
			setIsLoading(false);
		}
	};

	if (albums.length === 0 && !isLoading) {
		return (
			<div className='h-full overflow-y-auto'>
				<div className='min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900'>
					<div className='max-w-2xl mx-auto px-4 py-20'>
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
						<h2 className='text-2xl font-bold text-white mb-4'>no albums found</h2>
						<p className='text-zinc-400 mb-6'>
							you need to create an album before you can upload songs.
						</p>
						<Button
							onClick={() => navigate('/artist-hub/create-album')}
							className='bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700'
						>
							create your first album
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
				<div className='max-w-2xl mx-auto px-4 py-20'>
					<Button
						onClick={() => navigate('/artist-hub')}
						variant='ghost'
						className='mb-6'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						back to artist hub
					</Button>
					<div className='bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8'>
						<h1 className='text-3xl font-bold text-white mb-6'>upload new song</h1>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									song title *
								</label>
								<Input
									type='text'
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder='enter song title'
									className='bg-zinc-800 border-zinc-700 text-white'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									album *
								</label>
								<select
									value={formData.albumId}
									onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
									className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2'
									required
								>
									<option value=''>select an album</option>
									{albums.map((album) => (
										<option key={album._id} value={album._id}>
											{album.title}
										</option>
									))}
								</select>
								<p className='text-xs text-zinc-500 mt-1'>
									song will use the album's cover art
								</p>
							</div>
							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									audio file *
								</label>

							{audioFile ? (
								<div className='bg-zinc-800 border border-zinc-700 rounded-lg p-4'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<Music className='w-8 h-8 text-sky-400' />
											<div>
												<p className='text-white font-medium'>{audioFile.name}</p>
													<p className='text-sm text-zinc-400'>
														{(audioFile.size / (1024 * 1024)).toFixed(2)} MB
														{audioDuration > 0 && ` • ${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`}
													</p>
												</div>
											</div>
											<button
												type='button'
												onClick={removeAudio}
												className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
											>
												<X className='w-4 h-4 text-white' />
											</button>
										</div>
									</div>
							) : (
								<div
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onClick={() => fileInputRef.current?.click()}
									className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
										isDragging
											? 'border-sky-500 bg-sky-500/10'
											: 'border-zinc-700 hover:border-sky-500/50 bg-zinc-800/50'
									}`}
								>
										<Upload className='w-12 h-12 mx-auto mb-4 text-zinc-400' />
										<p className='text-zinc-300 mb-2'>
											drag and drop audio file here, or click to browse
										</p>
										<p className='text-sm text-zinc-500'>
											MP3, WAV, FLAC up to 50MB
										</p>
									</div>
								)}

								<input
									ref={fileInputRef}
									type='file'
									accept='audio/*'
									onChange={handleFileInputChange}
									className='hidden'
								/>
							</div>

						<Button
							type='submit'
							disabled={isLoading}
							className='w-full h-12 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold'
						>
							{isLoading ? 'uploading song...' : 'upload song'}
						</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateSongPage;

