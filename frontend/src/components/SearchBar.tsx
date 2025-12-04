import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";

interface SearchResult {
	songs: any[];
	albums: any[];
	artists: any[];
}

export const SearchBar = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult>({ songs: [], albums: [], artists: [] });
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const { initializeQueue } = usePlayerStore();

	// Detect mobile
	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

	// Prevent body scroll when mobile fullscreen is open
	useEffect(() => {
		if (isMobileFullscreen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isMobileFullscreen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				if (!isMobile || !isMobileFullscreen) {
					setIsOpen(false);
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isMobile, isMobileFullscreen]);

	useEffect(() => {
		const searchDelayed = setTimeout(async () => {
			if (query.trim().length === 0) {
				setResults({ songs: [], albums: [], artists: [] });
				setIsOpen(false);
				setIsMobileFullscreen(false);
				return;
			}

			setIsLoading(true);
			try {
				const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
				setResults(response.data);
				setIsOpen(true);

				// On mobile, open fullscreen
				if (isMobile && !isMobileFullscreen) {
					setIsMobileFullscreen(true);
				}
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(searchDelayed);
	}, [query, isMobile, isMobileFullscreen]);

	const handleSongClick = (song: any) => {
		initializeQueue([song]);
		setIsOpen(false);
		setQuery("");
		setIsMobileFullscreen(false);
	};

	const handleAlbumClick = (albumId: string) => {
		navigate(`/albums/${albumId}`);
		setIsOpen(false);
		setQuery("");
		setIsMobileFullscreen(false);
	};

	const handleArtistClick = (artistId: string) => {
		navigate(`/artists/${artistId}`);
		setIsOpen(false);
		setQuery("");
		setIsMobileFullscreen(false);
	};

	const handleClear = () => {
		setQuery("");
		setResults({ songs: [], albums: [], artists: [] });
		setIsOpen(false);
		setIsMobileFullscreen(false);
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsOpen(false);
			setIsMobileFullscreen(false);
			inputRef.current?.blur();
		}
	};

	// Swipe down to close on mobile
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.targetTouches[0].clientY);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientY);
	};

	const handleTouchEnd = () => {
		if (touchStart - touchEnd < -100) {
			// Swiped down more than 100px
			handleClear();
		}
	};

	const totalResults = results.songs.length + results.albums.length + results.artists.length;

	// Limit results on mobile for better performance
	const displayResults = isMobile ? {
		artists: results.artists.slice(0, 5),
		albums: results.albums.slice(0, 5),
		songs: results.songs.slice(0, 10)
	} : results;

	// Mobile fullscreen overlay
	if (isMobileFullscreen && isOpen) {
		return (
			<div
				className='fixed inset-0 z-[100] bg-black animate-slide-up-mobile'
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div className='h-full flex flex-col'>
					{/* Swipe indicator */}
					<div className='flex justify-center pt-2 pb-1'>
						<div className='w-10 h-1 bg-zinc-700 rounded-full'></div>
					</div>

					{/* Header with search */}
					<div className='p-4 border-b border-zinc-800'>
						<div className='relative'>
							<Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400' />
							<input
								ref={inputRef}
								type='text'
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='search...'
								className='w-full bg-zinc-900 border border-zinc-700 rounded-full py-3 pl-12 pr-12 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50'
								autoFocus
							/>
							<button
								onClick={handleClear}
								className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 active:text-white transition-colors'
							>
								<X className='h-5 w-5' />
							</button>
						</div>
					</div>

					{/* Results */}
					<div className='flex-1 overflow-y-auto'>
						{isLoading ? (
							<div className='p-12 text-center text-zinc-400'>
								<div className='animate-spin h-8 w-8 border-3 border-sky-500 border-t-transparent rounded-full mx-auto mb-3'></div>
								<p className='text-sm'>searching...</p>
							</div>
						) : totalResults === 0 ? (
							<div className='p-12 text-center text-zinc-400'>
								<p className='text-sm break-words whitespace-normal overflow-wrap-anywhere px-4'>no results found for "{query.trim()}"</p>
							</div>
						) : (
							<div className='pb-4'>
								{displayResults.artists.length > 0 && (
									<div className='mb-3'>
										<div className='px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
											artists
										</div>
										{displayResults.artists.map((artist: any) => (
											<button
												key={artist._id}
												onClick={() => handleArtistClick(artist._id)}
												className='w-full px-5 py-4 flex items-center gap-4 active:bg-zinc-800/70 transition-colors'
											>
												<img
													src={artist.imageUrl || "/placeholder-song.png"}
													alt={artist.name}
													className='w-14 h-14 rounded-full object-cover flex-shrink-0'
												/>
												<div className='flex-1 text-left min-w-0'>
													<div className='text-base font-medium text-white truncate'>
														{artist.name}
													</div>
													<div className='text-sm text-zinc-500'>artist</div>
												</div>
											</button>
										))}
									</div>
								)}

								{displayResults.albums.length > 0 && (
									<div className='mb-3'>
										<div className='px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
											albums
										</div>
										{displayResults.albums.map((album: any) => (
											<button
												key={album._id}
												onClick={() => handleAlbumClick(album._id)}
												className='w-full px-5 py-4 flex items-center gap-4 active:bg-zinc-800/70 transition-colors'
											>
												<img
													src={album.imageUrl || "/placeholder-song.png"}
													alt={album.title}
													className='w-14 h-14 rounded object-cover flex-shrink-0'
												/>
												<div className='flex-1 text-left min-w-0'>
													<div className='text-base font-medium text-white truncate'>
														{album.title}
													</div>
													<div className='text-sm text-zinc-500 truncate'>{album.artist}</div>
												</div>
											</button>
										))}
									</div>
								)}

								{displayResults.songs.length > 0 && (
									<div>
										<div className='px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
											songs
										</div>
										{displayResults.songs.map((song: any) => (
											<button
												key={song._id}
												onClick={() => handleSongClick(song)}
												className='w-full px-5 py-4 flex items-center gap-4 active:bg-zinc-800/70 transition-colors'
											>
												<img
													src={song.imageUrl || "/placeholder-song.png"}
													alt={song.title}
													className='w-14 h-14 rounded object-cover flex-shrink-0'
												/>
												<div className='flex-1 text-left min-w-0'>
													<div className='text-base font-medium text-white truncate'>
														{song.title}
													</div>
													<div className='text-sm text-zinc-500 truncate'>{song.artist}</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Desktop/tablet view
	return (
		<div ref={searchRef} className='relative w-full'>
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors duration-200 peer-focus:text-sky-400' />
				<input
					ref={inputRef}
					type='text'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='search songs, albums, artists...'
					className='peer w-full bg-zinc-800/50 border border-zinc-700/50 rounded-full py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:bg-zinc-800 transition-all duration-300'
					onFocus={() => query.trim().length > 0 && setIsOpen(true)}
				/>
				{query && (
					<button
						onClick={handleClear}
						className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-all duration-200 hover:rotate-90'
					>
						<X className='h-4 w-4' />
					</button>
				)}
			</div>

			{isOpen && (
				<div className='absolute top-full mt-2 w-full left-0 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-600'>
					{isLoading ? (
						<div className='p-8 text-center text-zinc-400 text-sm'>
							<div className='animate-spin h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-2'></div>
							searching...
						</div>
					) : totalResults === 0 ? (
						<div className='p-8 text-center text-zinc-400 text-sm'>
							<p className='break-words whitespace-normal overflow-wrap-anywhere'>no results found for "{query.trim()}"</p>
						</div>
					) : (
						<div className='py-2'>
							{results.artists.length > 0 && (
								<div className='mb-2 animate-in fade-in slide-in-from-left-3 duration-300'>
									<div className='px-3 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
										artists
									</div>
									{results.artists.map((artist: any, index: number) => (
										<button
											key={artist._id}
											onClick={() => handleArtistClick(artist._id)}
											className='w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-3 hover:bg-zinc-800/70 active:bg-zinc-800 transition-all duration-200 group'
											style={{ animationDelay: `${index * 30}ms` }}
										>
											<img
												src={artist.imageUrl || "/placeholder-song.png"}
												alt={artist.name}
												className='w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-sky-500/50 transition-all duration-200 flex-shrink-0'
											/>
											<div className='flex-1 text-left min-w-0'>
												<div className='text-sm font-medium text-white group-hover:text-sky-400 transition-colors duration-200 truncate'>
													{artist.name}
												</div>
												<div className='text-xs text-zinc-500'>artist</div>
											</div>
										</button>
									))}
								</div>
							)}

							{results.albums.length > 0 && (
								<div className='mb-2 animate-in fade-in slide-in-from-left-3 duration-300' style={{ animationDelay: '100ms' }}>
									<div className='px-3 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
										albums
									</div>
									{results.albums.map((album: any, index: number) => (
										<button
											key={album._id}
											onClick={() => handleAlbumClick(album._id)}
											className='w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-3 hover:bg-zinc-800/70 active:bg-zinc-800 transition-all duration-200 group'
											style={{ animationDelay: `${100 + index * 30}ms` }}
										>
											<img
												src={album.imageUrl || "/placeholder-song.png"}
												alt={album.title}
												className='w-10 h-10 md:w-12 md:h-12 rounded object-cover ring-2 ring-transparent group-hover:ring-sky-500/50 transition-all duration-200 flex-shrink-0'
											/>
											<div className='flex-1 text-left min-w-0'>
												<div className='text-sm font-medium text-white group-hover:text-sky-400 transition-colors duration-200 truncate'>
													{album.title}
												</div>
												<div className='text-xs text-zinc-500 truncate'>{album.artist}</div>
											</div>
										</button>
									))}
								</div>
							)}

							{results.songs.length > 0 && (
								<div className='animate-in fade-in slide-in-from-left-3 duration-300' style={{ animationDelay: '200ms' }}>
									<div className='px-3 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
										songs
									</div>
									{results.songs.map((song: any, index: number) => (
										<button
											key={song._id}
											onClick={() => handleSongClick(song)}
											className='w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-3 hover:bg-zinc-800/70 active:bg-zinc-800 transition-all duration-200 group'
											style={{ animationDelay: `${200 + index * 30}ms` }}
										>
											<img
												src={song.imageUrl || "/placeholder-song.png"}
												alt={song.title}
												className='w-10 h-10 md:w-12 md:h-12 rounded object-cover ring-2 ring-transparent group-hover:ring-sky-500/50 transition-all duration-200 flex-shrink-0'
											/>
											<div className='flex-1 text-left min-w-0'>
												<div className='text-sm font-medium text-white group-hover:text-sky-400 transition-colors duration-200 truncate'>
													{song.title}
												</div>
												<div className='text-xs text-zinc-500 truncate'>{song.artist}</div>
											</div>
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

