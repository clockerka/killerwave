import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Album, TrendingUp, Upload, X } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useMusicStore } from '@/stores/useMusicStore';

const ArtistHubPage = () => {
	const { isSignedIn, isLoaded } = useAuth();
	const navigate = useNavigate();
	const { forceRefreshStats } = useMusicStore();
	const [isLoading, setIsLoading] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [stats, setStats] = useState({ albums: 0, songs: 0 });
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, setFormData] = useState({
		name: '',
		bio: '',
		imageUrl: ''
	});

	// Проверка авторизации
	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			toast.error('please sign in to access artist hub');
			navigate('/');
		}
	}, [isSignedIn, isLoaded, navigate]);

	useEffect(() => {
		// Only fetch data when auth is loaded and user is signed in
		if (isLoaded && isSignedIn) {
			fetchArtistProfile();
			fetchStats();
		}
	}, [isLoaded, isSignedIn]);

	const fetchArtistProfile = async () => {
		try {
			const response = await axiosInstance.get('/artist-hub/profile');
			if (response.data.artistProfile) {
				const profile = response.data.artistProfile;
				setFormData({
					name: profile.name || '',
					bio: profile.bio || '',
					imageUrl: profile.imageUrl || ''
				});
				if (profile.imageUrl) {
					setImagePreview(profile.imageUrl);
				}
			}
		} catch (error) {
			console.error('Error fetching artist profile:', error);
		}
	};

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

	const uploadImage = async (): Promise<string> => {
		if (!imageFile) return formData.imageUrl;

		try {
			setIsUploadingImage(true);
			const formDataToSend = new FormData();
			formDataToSend.append('files', imageFile);

			const response = await axiosInstance.post('/admin/upload', formDataToSend, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});

			if (response.data.imageUrl) {
				return response.data.imageUrl;
			}
			throw new Error('No image URL returned');
		} catch (error) {
			console.error('Error uploading image:', error);
			toast.error('failed to upload image');
			throw error;
		} finally {
			setIsUploadingImage(false);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview('');
		setFormData({ ...formData, imageUrl: '' });
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const fetchStats = async () => {
		try {
			const response = await axiosInstance.get('/artist-hub/stats');
			setStats({
				albums: response.data.albums || 0,
				songs: response.data.songs || 0
			});
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsLoading(true);

			// Загружаем изображение, если есть новый файл
			let imageUrl = formData.imageUrl;
			if (imageFile) {
				imageUrl = await uploadImage();
			}

			const dataToSubmit = {
				...formData,
				imageUrl
			};

		await axiosInstance.post('/artist-hub/profile', dataToSubmit);
		toast.success('artist profile updated successfully!');
		fetchStats();
		setImageFile(null);
		// Update admin dashboard stats immediately
		forceRefreshStats();
		} catch (error: any) {
			console.error('Error updating profile:', error);
			toast.error(error.response?.data?.message || 'failed to update profile');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isLoaded || (!isSignedIn && isLoaded)) {
		return (
			<div className="h-screen flex items-center justify-center bg-zinc-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-zinc-400">loading artist hub...</p>
				</div>
			</div>
		);
	}

	if (!isSignedIn) {
		return null;
	}

	return (
		<div className='h-full overflow-y-auto'>
			<div className='min-h-full bg-gradient-to-b from-sky-900/20 via-zinc-900 to-zinc-900'>
				<div className='relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent' />
					<div className='relative max-w-7xl mx-auto px-4 py-20'>
					<div className='text-center space-y-4 mb-12'>
						<h1 className='text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent pb-2'>
							artist hub
						</h1>
						<p className='text-xl text-zinc-400'>
							manage your artist profile and releases
						</p>
					</div>
					{formData.name && (
						<div className='space-y-4 mb-8'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<Button
									onClick={() => navigate('/artist-hub/create-album')}
									className='h-16 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-lg'
								>
									<Album className='w-6 h-6 mr-2' />
									create album
								</Button>
								<Button
									onClick={() => navigate('/artist-hub/create-song')}
									className='h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg'
								>
									<Music className='w-6 h-6 mr-2' />
									upload song
								</Button>
							</div>
							{(stats.albums > 0 || stats.songs > 0) && (
								<Button
									onClick={() => navigate('/artist-hub/manage')}
									variant='outline'
									className='w-full h-14 border-zinc-700 hover:border-sky-500 text-lg'
								>
									<TrendingUp className='w-5 h-5 mr-2' />
									manage my content
								</Button>
							)}
						</div>
					)}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
							<div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center'>
										<Album className='w-6 h-6 text-sky-400' />
									</div>
									<div>
										<p className='text-2xl font-bold text-white'>{stats.albums}</p>
										<p className='text-sm text-zinc-400'>albums</p>
									</div>
								</div>
							</div>
							<div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center'>
										<Music className='w-6 h-6 text-sky-400' />
									</div>
									<div>
										<p className='text-2xl font-bold text-white'>{stats.songs}</p>
										<p className='text-sm text-zinc-400'>songs</p>
									</div>
								</div>
							</div>
							<div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
								<div className='flex items-center gap-4'>
									<div className='w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center'>
										<TrendingUp className='w-6 h-6 text-sky-400' />
									</div>
									<div>
										<p className='text-2xl font-bold text-white'>active</p>
										<p className='text-sm text-zinc-400'>status</p>
									</div>
								</div>
							</div>
						</div>
						<div className='max-w-2xl mx-auto'>
							<div className='bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8'>
								<h2 className='text-2xl font-bold text-white mb-6'>artist profile</h2>
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div>
										<label className='block text-sm font-medium text-zinc-300 mb-2'>
											artist name
										</label>
										<Input
											type='text'
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder='your artist name'
											className='bg-zinc-800 border-zinc-700 text-white'
											required
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-zinc-300 mb-2'>
											bio
										</label>
										<textarea
											value={formData.bio}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
											placeholder='tell us about yourself...'
											className='w-full bg-zinc-800 border border-zinc-700 text-white min-h-[120px] rounded-md px-3 py-2'
											rows={5}
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-zinc-300 mb-2'>
											profile image
										</label>
										{imagePreview ? (
											<div className='relative w-48 h-48 mx-auto mb-4'>
												<img
													src={imagePreview}
													alt='Preview'
												className='w-full h-full rounded-full object-cover border-4 border-sky-500'
											/>
											<button
												type='button'
												onClick={removeImage}
												className='absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
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
												drag and drop your image here, or click to browse
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
									disabled={isLoading || isUploadingImage}
									className='w-full h-12 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold'
								>
									{isUploadingImage ? 'uploading image...' : isLoading ? 'saving...' : 'save profile'}
								</Button>
							</form>
						</div>
						<div className='mt-6 bg-sky-900/20 border border-sky-500/30 rounded-xl p-6'>
							<h3 className='text-lg font-bold text-sky-300 mb-2'>📌 getting started</h3>
							<ul className='space-y-2 text-sm text-zinc-300'>
								<li>• <strong>step 1:</strong> create your artist profile (fill the form above)</li>
								<li>• <strong>step 2:</strong> create an album with cover art</li>
								<li>• <strong>step 3:</strong> upload songs to your album</li>
								<li>• your artist profile will appear on the homepage after you release your first album</li>
								<li>• songs automatically use their album's cover art</li>
								<li>• contact admin for verification badge</li>
							</ul>
						</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ArtistHubPage;

