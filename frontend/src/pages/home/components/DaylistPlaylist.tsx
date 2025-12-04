import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axios';

const DAYLIST_ID = '6903a8fcf3c46d242519832d';

const DaylistPlaylist = () => {
	const [daylist, setDaylist] = useState<any>(null);
	const [coverImage, setCoverImage] = useState<string>('');

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

	useEffect(() => {
		const fetchDaylist = async () => {
			try {
				const response = await axiosInstance.get(`/playlists/${DAYLIST_ID}`);
				setDaylist(response.data);
			} catch (error) {
				console.error('Error fetching daylist:', error);
			}
		};

		fetchDaylist();
		setCoverImage(getDaylistCover());

		// Update cover every minute to check for time changes
		const interval = setInterval(() => {
			setCoverImage(getDaylistCover());
		}, 60000);

		return () => clearInterval(interval);
	}, []);

	if (!daylist || !daylist.songs || daylist.songs.length === 0) {
		return null;
	}

	const displayedSongs = daylist.songs.slice(0, 4);

	return (
		<div className='mb-8'>
			<Link to={`/playlists/${DAYLIST_ID}`}>
				<Card className='bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 hover:from-blue-500/30 hover:via-blue-600/30 hover:to-cyan-500/30 transition-all duration-300 cursor-pointer border-blue-500/30 overflow-hidden shadow-lg hover:shadow-blue-500/20'>
					<CardContent className='p-0'>
						<div className='flex items-center'>
							<div className='relative w-32 h-32 flex-shrink-0'>
								<img
									src={coverImage}
									alt="daylist"
									className='w-full h-full object-cover'
								/>
								<div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent'></div>
							</div>
							<div className='px-6 flex-1 min-w-0'>
								<h3 className='text-2xl font-bold text-white mb-2 truncate'>{daylist.title || 'daylist'}</h3>
								<p className='text-base text-blue-200 truncate mb-1'>
									your personalized playlist
								</p>
								<p className='text-sm text-zinc-400 truncate'>
									{daylist.songs.length} {daylist.songs.length === 1 ? 'song' : 'songs'}
								</p>
							</div>
							<div className='hidden xl:flex items-center gap-2 pr-6'>
								{displayedSongs.map((song: any, idx: number) => (
									<div key={song._id} className='relative' style={{ marginLeft: idx > 0 ? '-12px' : '0' }}>
										<img
											src={song.imageUrl}
											alt={song.title}
											className='w-16 h-16 rounded-lg object-cover border-2 border-blue-500/30 shadow-lg'
										/>
									</div>
								))}
								{daylist.songs.length > 4 && (
									<div className='w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/50 to-cyan-500/50 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-white border-2 border-blue-500/30 shadow-lg'>
										+{daylist.songs.length - 4}
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		</div>
	);
};

export default DaylistPlaylist;

