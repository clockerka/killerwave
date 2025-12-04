import { useEffect, useState, useRef } from "react";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Play, Plus, Disc3, User, ListMusic, ImagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { formatArtists } from "@/lib/utils-artists";
import AddToLibraryButton from "@/components/AddToLibraryButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import toast from "react-hot-toast";

const MyLibraryPage = () => {
	const { dbUser } = useAuthStore();
	const navigate = useNavigate();
	const { library, userPlaylists, fetchLibrary, fetchUserPlaylists, createPlaylist, isLoading } = useLibraryStore();
	const { playAlbum } = usePlayerStore();
	const hasShownError = useRef(false);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
	const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
	const [newPlaylistImage, setNewPlaylistImage] = useState<File | null>(null);

	// Redirect to auth if not authenticated and load library data
	useEffect(() => {
		if (!dbUser) {
			navigate('/');
			if (!hasShownError.current) {
				toast.error('please sign in to access your library');
				hasShownError.current = true;
			}
			return;
		}

		// Load library data only if authenticated
		const loadLibraryData = async () => {
			try {
				await fetchLibrary();
				await fetchUserPlaylists();
			} catch (error) {
				console.error('failed to load library:', error);
			}
		};
		loadLibraryData();
	}, [dbUser, navigate, fetchLibrary, fetchUserPlaylists]);

	const handleCreatePlaylist = async () => {
		if (!newPlaylistTitle.trim()) {
			toast.error("please enter a playlist title");
			return;
		}

		try {
			await createPlaylist(newPlaylistTitle, newPlaylistDescription, newPlaylistImage || undefined);
			setIsCreateDialogOpen(false);
			setNewPlaylistTitle("");
			setNewPlaylistDescription("");
			setNewPlaylistImage(null);
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setNewPlaylistImage(e.target.files[0]);
		}
	};

	if (isLoading && !library) {
		return (
			<div className='h-full flex items-center justify-center'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-[#e8ecf3] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-zinc-400'>loading your library...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full rounded-md overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<ScrollArea className='h-full'>
			<div className='p-8'>
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-4xl font-bold mb-2'>your library</h1>
						<p className='text-zinc-400'>
							{library?.albums.length || 0} albums • {library?.artists.length || 0} artists
						</p>
					</div>

					<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button className='bg-[#e8ecf3] hover:bg-[#d4dce8] text-black'>
								<Plus className='mr-2 h-4 w-4' />
								create playlist
							</Button>
						</DialogTrigger>
						<DialogContent className='bg-zinc-900 text-white border-zinc-800'>
							<DialogHeader>
								<DialogTitle>create new playlist</DialogTitle>
								<DialogDescription className='text-zinc-400'>give your playlist a name and description</DialogDescription>
							</DialogHeader>
							<div className='space-y-4 mt-4'>
								<div>
									<label className='text-sm text-zinc-400 mb-2 block'>title *</label>
									<Input
										value={newPlaylistTitle}
										onChange={(e) => setNewPlaylistTitle(e.target.value)}
										placeholder='my playlist'
										className='bg-zinc-800 border-zinc-700 text-white'
									/>
								</div>
								<div>
									<label className='text-sm text-zinc-400 mb-2 block'>description</label>
									<Input
										value={newPlaylistDescription}
										onChange={(e) => setNewPlaylistDescription(e.target.value)}
										placeholder='description (optional)'
										className='bg-zinc-800 border-zinc-700 text-white'
									/>
								</div>
								<div>
									<label className='text-sm text-zinc-400 mb-2 block'>cover image</label>
									<div
										className='border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-[#e8ecf3] transition-colors cursor-pointer bg-zinc-800/50'
										onClick={() => document.getElementById('playlist-image-input')?.click()}
									>
										{newPlaylistImage ? (
											<div className='space-y-2'>
												<ImagePlus className='mx-auto text-[#e8ecf3]' size={48} />
												<p className='text-sm text-white font-medium'>{newPlaylistImage.name}</p>
												<p className='text-xs text-zinc-500'>click to change</p>
											</div>
										) : (
											<div className='space-y-2'>
												<ImagePlus className='mx-auto text-zinc-500' size={48} />
												<p className='text-sm text-zinc-400'>click to upload image</p>
												<p className='text-xs text-zinc-500'>png, jpg up to 10mb</p>
											</div>
										)}
										<input
											id='playlist-image-input'
											type='file'
											accept='image/*'
											className='hidden'
											onChange={handleImageChange}
										/>
									</div>
								</div>
							</div>
							<div className='flex gap-2 mt-4'>
								<Button onClick={handleCreatePlaylist} className='flex-1 bg-[#e8ecf3] hover:bg-[#d4dce8] text-black'>
									create
								</Button>
								<Button onClick={() => setIsCreateDialogOpen(false)} variant='outline' className='border-zinc-700'>
									cancel
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				<Tabs defaultValue='all' className='space-y-6'>
					<TabsList className='bg-zinc-800/50 border border-zinc-700'>
						<TabsTrigger value='all' className='data-[state=active]:bg-[#e8ecf3] data-[state=active]:text-black'>
							All
						</TabsTrigger>
						<TabsTrigger value='playlists' className='data-[state=active]:bg-[#e8ecf3] data-[state=active]:text-black'>
							playlists
						</TabsTrigger>
						<TabsTrigger value='albums' className='data-[state=active]:bg-[#e8ecf3] data-[state=active]:text-black'>
							albums
						</TabsTrigger>
						<TabsTrigger value='artists' className='data-[state=active]:bg-[#e8ecf3] data-[state=active]:text-black'>
							artists
						</TabsTrigger>
					</TabsList>

					<TabsContent value='all' className='space-y-8'>
						{userPlaylists && userPlaylists.length > 0 && (
							<div>
								<h2 className='text-2xl font-bold mb-4'>your playlists</h2>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
									{userPlaylists.map((playlist) => (
										<Link key={playlist._id} to={`/playlists/${playlist._id}`}>
											<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50'>
												<CardContent className='p-4'>
													<div className='flex items-center gap-4'>
													{playlist.imageUrl ? (
														<img src={playlist.imageUrl} alt={playlist.title} className='w-16 h-16 rounded object-cover' />
													) : (
														<div className='w-16 h-16 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
															<ListMusic className='text-white' size={32} />
														</div>
													)}
														<div className='flex-1 min-w-0'>
															<h3 className='font-semibold text-white truncate mb-1'>{playlist.title}</h3>
															<p className='text-sm text-zinc-400 truncate'>
																{playlist.songs?.length || 0} songs
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							</div>
						)}

						{library?.artists && library.artists.length > 0 && (
							<div>
								<h2 className='text-2xl font-bold mb-4'>artists</h2>
								<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
									{library.artists.slice(0, 5).map((artist) => (
										<Link key={artist._id} to={`/artists/${artist._id}`}>
											<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50'>
												<CardContent className='p-4'>
													<div className='aspect-square mb-4 rounded-full overflow-hidden bg-zinc-700'>
														<img src={artist.imageUrl} alt={artist.name} className='w-full h-full object-cover' />
													</div>
													<h3 className='font-semibold text-white truncate mb-1 flex items-center justify-center gap-1'>
														{artist.name}
														<VerifiedBadge verified={artist.verified} size='sm' />
													</h3>
													<p className='text-sm text-zinc-400 text-center'>artist</p>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							</div>
						)}

						{library?.albums && library.albums.length > 0 && (
							<div>
								<h2 className='text-2xl font-bold mb-4'>albums</h2>
								<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
									{library.albums.slice(0, 5).map((album) => (
										<Link key={album._id} to={`/albums/${album._id}`}>
											<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50'>
												<CardContent className='p-4'>
													<div className='aspect-square mb-4 rounded overflow-hidden bg-zinc-700'>
														<img src={album.imageUrl} alt={album.title} className='w-full h-full object-cover' />
													</div>
													<h3 className='font-semibold text-white truncate mb-1'>{album.title}</h3>
													<p className='text-sm text-zinc-400 truncate'>{formatArtists(album.artists)}</p>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value='playlists'>
						{userPlaylists && userPlaylists.length > 0 ? (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
								{userPlaylists.map((playlist) => (
									<Link key={playlist._id} to={`/playlists/${playlist._id}`}>
										<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50'>
											<CardContent className='p-4'>
												<div className='flex items-center gap-4'>
													{playlist.imageUrl ? (
														<img src={playlist.imageUrl} alt={playlist.title} className='w-20 h-20 rounded object-cover' />
													) : (
														<div className='w-20 h-20 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
															<ListMusic className='text-white' size={40} />
														</div>
													)}
													<div className='flex-1 min-w-0'>
														<h3 className='font-semibold text-white truncate mb-1'>{playlist.title}</h3>
														<p className='text-sm text-zinc-400 truncate'>
															{playlist.songs?.length || 0} songs
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-20'>
								<ListMusic size={64} className='text-zinc-600 mb-4' />
								<p className='text-zinc-400 mb-4'>no playlists yet</p>
								<Button onClick={() => setIsCreateDialogOpen(true)} className='bg-blue-500 hover:bg-blue-600'>
									<Plus className='mr-2 h-4 w-4' />
									create your first playlist
								</Button>
							</div>
						)}
					</TabsContent>

					<TabsContent value='albums'>
						{library?.albums && library.albums.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
								{library.albums.map((album) => (
									<Link key={album._id} to={`/albums/${album._id}`}>
										<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50 group'>
											<CardContent className='p-4'>
												<div className='relative aspect-square mb-4 rounded overflow-hidden bg-zinc-700'>
													<img src={album.imageUrl} alt={album.title} className='w-full h-full object-cover' />
													<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
														<Button
															size='icon'
															className='rounded-full bg-blue-500 hover:bg-blue-600 hover:scale-110 transition-all'
															onClick={(e) => {
																e.preventDefault();
																playAlbum(album.songs, 0);
															}}
														>
															<Play className='h-6 w-6 text-white' fill='white' />
														</Button>
													</div>
													<div className='absolute top-2 right-2'>
														<AddToLibraryButton type='album' id={album._id} size={32} />
													</div>
												</div>
												<h3 className='font-semibold text-white truncate mb-1'>{album.title}</h3>
												<p className='text-sm text-zinc-400 truncate'>{formatArtists(album.artists)}</p>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-20'>
								<Disc3 size={64} className='text-zinc-600 mb-4' />
								<p className='text-zinc-400'>no albums in your library</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value='artists'>
						{library?.artists && library.artists.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
								{library.artists.map((artist) => (
									<Link key={artist._id} to={`/artists/${artist._id}`}>
										<Card className='bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors cursor-pointer border-zinc-700/50'>
											<CardContent className='p-4'>
										<div className='aspect-square mb-4 rounded-full overflow-hidden bg-zinc-700'>
											<img src={artist.imageUrl} alt={artist.name} className='w-full h-full object-cover' />
										</div>
										<h3 className='font-semibold text-white truncate mb-1 text-center flex items-center justify-center gap-1'>
											{artist.name}
											<VerifiedBadge verified={artist.verified} size='sm' />
										</h3>
										<p className='text-sm text-zinc-400 text-center'>artist</p>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center py-20'>
								<User size={64} className='text-zinc-600 mb-4' />
								<p className='text-zinc-400'>no artists in your library</p>
							</div>
						)}
					</TabsContent>
			</Tabs>
		</div>
		</ScrollArea>
	</div>
);
};

export default MyLibraryPage;

