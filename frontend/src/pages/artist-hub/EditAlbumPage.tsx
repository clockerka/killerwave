import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const EditAlbumPage = () => {
	const navigate = useNavigate();
	const { albumId } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, setFormData] = useState({
		title: '',
		releaseYear: new Date().getFullYear().toString()
	});

	const fetchAlbum = useCallback(async () => {
		try {
			setIsFetching(true);
			const response = await axiosInstance.get(`/artist-hub/albums/${albumId}`);
			const album = response.data.album;
			setFormData({
				title: album.title,
				releaseYear: album.releaseYear.toString()
			});
			setImagePreview(album.imageUrl);
		} catch (error) {
			console.error('Error fetching album:', error);
			toast.error('failed to load album');
			navigate('/artist-hub/manage');
		} finally {
			setIsFetching(false);
		}
	}, [albumId, navigate]);
	useEffect(() => {
		fetchAlbum();
	}, [fetchAlbum]);
	const handleImageChange = (file: File) => {
		if (!file.type.startsWith('image/')) {
			toast.error('please select an image file');
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error('image size must be less than 10mb');
			return;
		}
		setImageFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			handleImageChange(file);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleImageChange(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsLoading(true);

			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title);
			formDataToSend.append('releaseYear', formData.releaseYear);
			if (imageFile) {
				formDataToSend.append('imageFile', imageFile);
			}

			await axiosInstance.put(`/artist-hub/albums/${albumId}`, formDataToSend, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			toast.success('album updated successfully!');
			navigate('/artist-hub/manage');
		} catch (error: any) {
			console.error('Error updating album:', error);
			toast.error(error.response?.data?.message || 'failed to update album');
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
	return (
		<div className='h-full flex items-center justify-center'>
			<div className='text-center'>
				<div className='w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
				<p className='text-zinc-400'>loading album...</p>
			</div>
		</div>
	);
	}

	return (
		<div className='h-full overflow-y-auto'>
			<div className='min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900'>
				<div className='max-w-2xl mx-auto px-4 py-20'>
					<Button
						onClick={() => navigate('/artist-hub/manage')}
						variant='ghost'
						className='mb-6'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						back to manage content
					</Button>
					<div className='bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8'>
						<h1 className='text-3xl font-bold text-white mb-6'>edit album</h1>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									album title *
								</label>
								<Input
									type='text'
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder='enter album title'
									className='bg-zinc-800 border-zinc-700 text-white'
									required
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									release year
								</label>
								<Input
									type='number'
									value={formData.releaseYear}
									onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
									placeholder='2024'
									className='bg-zinc-800 border-zinc-700 text-white'
									min='1900'
									max='2100'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-zinc-300 mb-2'>
									album cover
								</label>

								{imagePreview ? (
									<div className='relative w-64 h-64 mx-auto mb-4'>
									<img
										src={imagePreview}
										alt='Preview'
										className='w-full h-full rounded-lg object-cover border-4 border-sky-500'
									/>
									<button
										type='button'
										onClick={removeImage}
										className='absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
									>
										<X className='w-4 h-4 text-white' />
									</button>
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
											drag and drop album cover here, or click to browse
										</p>
										<p className='text-sm text-zinc-500'>
											png, jpg up to 10mb
										</p>
									</div>
								)}
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleFileInputChange}
									className='hidden'
								/>
							</div>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full h-12 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold'
						>
							{isLoading ? 'updating album...' : 'update album'}
						</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditAlbumPage;

