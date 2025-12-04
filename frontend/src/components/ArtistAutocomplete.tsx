import { useState, useEffect, useRef } from 'react';
import { useMusicStore } from '@/stores/useMusicStore';
import { X } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { matchesWithLayoutFix } from '@/lib/keyboardLayout';
interface ArtistAutocompleteProps {
	selectedArtists?: string[];
	value?: string[];
	onArtistsChange?: (artists: string[]) => void;
	onChange?: (artists: string[]) => void;
	placeholder?: string;
}
export const ArtistAutocomplete = ({
	selectedArtists: selectedArtistsProp,
	value: valueProp,
	onArtistsChange: onArtistsChangeProp,
	onChange: onChangeProp,
	placeholder = 'search artists...'
}: ArtistAutocompleteProps) => {
	const selectedArtists = selectedArtistsProp || valueProp || [];
	const onArtistsChange = onArtistsChangeProp || onChangeProp || (() => {});
	const [searchQuery, setSearchQuery] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const { artists, fetchArtists } = useMusicStore();
	const wrapperRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		fetchArtists();
	}, [fetchArtists]);
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);
	const filteredArtists = artists.filter(
		(artist) =>
			matchesWithLayoutFix(artist.name, searchQuery) &&
			!selectedArtists.includes(artist._id)
	);
	const handleAddArtist = (artistId: string) => {
		onArtistsChange([...selectedArtists, artistId]);
		setSearchQuery('');
		setIsOpen(false);
	};
	const handleRemoveArtist = (artistId: string) => {
		onArtistsChange(selectedArtists.filter((id) => id !== artistId));
	};
	const getArtist = (artistId: string) => {
		return artists.find((a) => a._id === artistId);
	};
	return (
		<div ref={wrapperRef} className='relative'>
			{selectedArtists.length > 0 && (
				<div className='flex flex-wrap gap-2 mb-2'>
					{selectedArtists.map((artistId) => {
						const artist = getArtist(artistId);
						return (
							<div
								key={artistId}
								className='flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-sm'
							>
								<span className='flex items-center gap-1'>
									{artist?.name || 'Unknown'}
									<VerifiedBadge verified={artist?.verified} size='sm' />
								</span>
								<button
									type='button'
									onClick={() => handleRemoveArtist(artistId)}
									className='hover:text-purple-100'
								>
									<X className='h-3 w-3' />
								</button>
							</div>
						);
					})}
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
				placeholder={placeholder}
				className='w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none'
			/>
			{isOpen && searchQuery && (
				<div className='absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					{filteredArtists.length > 0 ? (
						filteredArtists.map((artist) => (
							<button
								key={artist._id}
								type='button'
								onClick={() => handleAddArtist(artist._id)}
								className='w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex items-center gap-2'
							>
								{artist.imageUrl && (
									<img src={artist.imageUrl} alt={artist.name} className='w-8 h-8 rounded-full object-cover' />
								)}
								<span className='text-sm text-zinc-100 flex items-center gap-1'>
									{artist.name}
									<VerifiedBadge verified={artist.verified} size='sm' />
								</span>
							</button>
						))
					) : (
						<div className='px-3 py-2 text-sm text-zinc-400'>no artists found</div>
					)}
				</div>
			)}
		</div>
	);
};