import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Pause, Play, Repeat, SkipBack, SkipForward, Volume1, Mic, Shuffle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ArtistLinks } from "@/components/ArtistLinks";
import { useNavigate } from "react-router-dom";
const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, repeatMode, toggleRepeat, isShuffle, toggleShuffle } = usePlayerStore();
	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const navigate = useNavigate();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	useEffect(() => {
		audioRef.current = document.querySelector("audio");
		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => {
			const currentAudioTime = audio.currentTime;
			const audioDuration = audio.duration;

			if (currentAudioTime && !isNaN(currentAudioTime)) {
				setCurrentTime(currentAudioTime);

				// Debug for problematic tracks
				if (currentSong?.title.toLowerCase().includes('tobey')) {
					// Check if we're approaching the problem time
					if (currentAudioTime > 95 && currentAudioTime < 100) {
						console.log(`Tobey at ${currentAudioTime}s, duration: ${audioDuration}, ended: ${audio.ended}`);
					}
				}

				// Check for inconsistencies that might cause issues
				if (audioDuration && currentAudioTime >= audioDuration && !audio.ended) {
					console.warn('Time exceeded duration but track not ended:', {
						currentTime: currentAudioTime,
						duration: audioDuration,
						ended: audio.ended
					});
				}
			}
		};

		const updateDuration = () => {
			const audioDuration = audio.duration;
			if (audioDuration && !isNaN(audioDuration) && audioDuration > 0) {
				console.log('Duration updated to:', audioDuration);
				setDuration(audioDuration);
			}
		};

		const handleError = (e: any) => {
			console.error('Playback error in controls:', e);
			setCurrentTime(0);
		};

		const handleEnded = () => {
			playNext();
		};

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);
		audio.addEventListener("error", handleError);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("error", handleError);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong, playNext]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current && !isNaN(value[0]) && isFinite(value[0])) {
			const targetTime = value[0];
			const validDuration = duration && duration > 0 ? duration : audioRef.current.duration;

			// Extra safety check to prevent jumping to end
			if (validDuration && validDuration > 0) {
				const safeTime = Math.max(0, Math.min(targetTime, validDuration - 0.1)); // Keep 0.1s buffer from end
				console.log('Seeking from', audioRef.current.currentTime, 'to', safeTime, 'duration:', validDuration);
				audioRef.current.currentTime = safeTime;
			} else {
				console.warn('Invalid duration for seek operation:', validDuration);
			}
		}
	};
	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4'>
			{/* Mobile Layout */}
			<div className='sm:hidden flex flex-col h-full'>
				{/* Progress bar for mobile */}
				<div className='flex items-center gap-1 py-1'>
					<div className='text-xs text-zinc-400 min-w-[35px]'>{formatTime(currentTime)}</div>
					<Slider
						value={[currentTime]}
						max={duration || 100}
						step={1}
						className='flex-1 h-1'
						onValueChange={handleSeek}
					/>
					<div className='text-xs text-zinc-400 min-w-[35px]'>{formatTime(duration)}</div>
				</div>

				{/* Controls and song info */}
				<div className='flex items-center justify-between flex-1'>
					{currentSong && (
						<div className='flex items-center gap-3 flex-1 min-w-0 mr-4'>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-10 h-10 object-cover rounded-md shrink-0'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate text-sm'>
									{currentSong.title}
								</div>
								<div className='text-xs truncate'>
									<ArtistLinks artists={currentSong.artists} className='text-zinc-400' />
								</div>
							</div>
						</div>
					)}

					{/* Mobile controls */}
					<div className='flex items-center gap-3'>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400 h-8 w-8'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							className='bg-blue-500 hover:bg-blue-400 text-white rounded-full h-10 w-10'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400 h-8 w-8'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			{/* Desktop Layout */}
			<div className='hidden sm:flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				<div className='flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer'>
									{currentSong.title}
								</div>
								<div className='text-sm truncate'>
									<ArtistLinks artists={currentSong.artists} className='text-zinc-400' />
								</div>
							</div>
						</>
					)}
				</div>

				<div className='flex flex-col items-center gap-2 flex-1 max-w-[45%]'>
					<div className='flex items-center gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							className='bg-blue-500 hover:bg-blue-400 text-white rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={`hover:text-white transition-colors ${
								isShuffle ? 'text-blue-500' : 'text-zinc-400'
							}`}
							onClick={toggleShuffle}
						>
							<Shuffle className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={`hover:text-white transition-colors relative ${
								repeatMode === 'off' ? 'text-zinc-400' : 'text-blue-500'
							}`}
							onClick={toggleRepeat}
						>
							<Repeat className='h-4 w-4' />
							{repeatMode === 'one' && (
								<span className='absolute text-[10px] font-bold' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
									1
								</span>
							)}
						</Button>
					</div>
					<div className='flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>

				<div className='flex items-center gap-2 min-w-[180px] w-[30%] justify-end'>
					<Button
						size='icon'
						variant='ghost'
						className='hover:text-white text-zinc-400'
						onClick={() => navigate('/lyrics')}
						disabled={!currentSong}
					>
						<Mic className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Volume1 className='h-4 w-4' />
					</Button>
					<Slider
						value={[volume]}
						max={100}
						step={1}
						className='w-24 hover:cursor-grab active:cursor-grabbing'
						onValueChange={(value) => {
							setVolume(value[0]);
							if (audioRef.current) {
								audioRef.current.volume = value[0] / 100;
							}
						}}
					/>
				</div>
			</div>
		</footer>
	);
};