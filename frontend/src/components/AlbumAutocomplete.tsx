import { useState, useEffect, useRef } from 'react';
import { useMusicStore } from '@/stores/useMusicStore';
import { X } from 'lucide-react';
import { matchesWithLayoutFix } from '@/lib/keyboardLayout';

interface AlbumAutocompleteProps {
	value?: string;
	onChange?: (albumId: string) => void;
	placeholder?: string;
}

export const AlbumAutocomplete = ({
	value,
	onChange,
	placeholder = 'search albums...'
}: AlbumAutocompleteProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const { albums, fetchAlbums } = useMusicStore();
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const filteredAlbums = albums.filter(
		(album) =>
			matchesWithLayoutFix(album.title, searchQuery) ||
			album.artists.some(artist => matchesWithLayoutFix(artist.name, searchQuery))
	);

	const handleSelectAlbum = (albumId: string) => {
		onChange?.(albumId);
		setSearchQuery('');
		setIsOpen(false);
	};

	const handleClearAlbum = () => {
		onChange?.('');
		setSearchQuery('');
	};

	const getAlbum = (albumId: string) => {
		return albums.find((a) => a._id === albumId);
	};

	const selectedAlbum = value ? getAlbum(value) : null;

	return (
		<div ref={wrapperRef} className='relative'>
			{selectedAlbum && (
				<div className='flex items-center gap-3 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3'>
					<img
						src={selectedAlbum.imageUrl || '/placeholder-song.png'}
						alt={selectedAlbum.title}
						className='w-12 h-12 rounded object-cover'
					/>
					<div className='flex-1 min-w-0'>
						<div className='text-sm font-medium text-white truncate'>
							{selectedAlbum.title}
						</div>
						<div className='text-xs text-zinc-400 truncate'>
							{selectedAlbum.artists.map(a => a.name).join(', ')}
						</div>
					</div>
					<button
						type='button'
						onClick={handleClearAlbum}
						className='text-zinc-400 hover:text-white transition-colors'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
			)}

			<input
				type='text'
				value={searchQuery}
				onChange={(e) => {
					setSearchQuery(e.target.value);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				placeholder={selectedAlbum ? 'change album...' : placeholder}
				className='w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none'
			/>

			{isOpen && searchQuery && (
				<div className='absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					{filteredAlbums.length > 0 ? (
						filteredAlbums.map((album) => (
							<button
								key={album._id}
								type='button'
								onClick={() => handleSelectAlbum(album._id)}
								className='w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex items-center gap-3'
							>
								<img
									src={album.imageUrl || '/placeholder-song.png'}
									alt={album.title}
									className='w-10 h-10 rounded object-cover'
								/>
								<div className='flex-1 min-w-0'>
									<div className='text-sm text-zinc-100 truncate'>
										{album.title}
									</div>
									<div className='text-xs text-zinc-400 truncate'>
										{album.artists.map(a => a.name).join(', ')}
									</div>
								</div>
							</button>
						))
					) : (
						<div className='px-3 py-2 text-sm text-zinc-400'>no albums found</div>
					)}
				</div>
			)}
		</div>
	);
};

