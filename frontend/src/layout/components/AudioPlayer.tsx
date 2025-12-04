import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const lastProgressRef = useRef<number>(0);
	const progressCheckInterval = useRef<NodeJS.Timeout | null>(null);
	const { currentSong, isPlaying, playNext } = usePlayerStore();

	useEffect(() => {
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying]);

	useEffect(() => {
		const audio = audioRef.current;
		let lastKnownTime = 0;

		const handleTimeUpdate = () => {
			if (audio) {
				lastKnownTime = audio.currentTime;
			}
		};

		const handleSeeking = () => {
			if (audio && currentSong) {
				const targetTime = audio.currentTime;
				const bufferedEnd = audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) : 0;

				console.log('🔍 SEEKING EVENT DETECTED');
				console.log('  Song:', currentSong.title);
				console.log('  From:', lastKnownTime, 'to:', targetTime);
				console.log('  Buffered end:', bufferedEnd);
				console.log('  Stack trace:', new Error().stack);

				// Защита: если перемотка за пределы буфера больше чем на 2 секунды
				if (bufferedEnd > 0 && targetTime > bufferedEnd + 2) {
					console.warn('🚫 BLOCKED: Seek beyond buffered range!');
					console.warn(`  Attempted to seek to ${targetTime}s but only buffered to ${bufferedEnd}s`);
					console.warn('  Reverting to last known position:', lastKnownTime);

					// Возвращаем на безопасную позицию
					setTimeout(() => {
						if (audioRef.current) {
							audioRef.current.currentTime = Math.min(lastKnownTime, bufferedEnd - 1);
						}
					}, 0);
					return;
				}

				// Защита: если огромный скачок вперед (больше 60 секунд)
				if (Math.abs(targetTime - lastKnownTime) > 60) {
					console.warn('🚫 BLOCKED: Huge jump detected!');
					console.warn(`  Jump from ${lastKnownTime}s to ${targetTime}s (${Math.abs(targetTime - lastKnownTime)}s difference)`);
					console.warn('  Reverting to last known position:', lastKnownTime);

					setTimeout(() => {
						if (audioRef.current) {
							audioRef.current.currentTime = lastKnownTime;
						}
					}, 0);
					return;
				}
			}
		};

		const handleEnded = () => {
			const audio = audioRef.current;
			if (audio && currentSong) {
				console.log('🎵 Audio ended naturally');
				console.log('Ended at:', audio.currentTime, 'seconds');
				console.log('Reported duration:', audio.duration, 'seconds');
				console.log('DB duration:', currentSong.duration, 'seconds');

				// Просто переходим к следующему треку
				playNext();
			} else {
				playNext();
			}
		};

		const handleError = (e: any) => {
			console.error('Audio playback error:', e);
			toast.error('audio playback error - trying next song');
			playNext();
		};

		const handleStalled = () => {
			console.warn('Audio stalled, attempting to continue...');
			if (audio) {
				audio.load();
				if (isPlaying) {
					audio.play().catch(() => {
						console.error('Failed to resume after stall');
						toast.error('playback issue detected - skipping to next song');
						playNext();
					});
				}
			}
		};

		const handleWaiting = () => {
			console.log('Audio is waiting for data...');
		};

		const handleCanPlay = () => {
			console.log('Audio can start playing');
		};

		const handleSeeked = () => {
			console.log('Audio seeked to:', audio?.currentTime);
		};

		const handlePause = () => {
			const audio = audioRef.current;
			if (audio && currentSong && isPlaying) {
				console.log('⏸️ PAUSE detected at:', audio.currentTime);
				console.log('Song:', currentSong.title);
				console.log('Ended?', audio.ended);
				console.log('Error?', audio.error);

				// Если трек закончился естественным образом, переходим к следующему
				if (audio.ended) {
					console.log('Track ended, going to next');
					playNext();
				}
			}
		};

		const handleProgress = () => {
			const audio = audioRef.current;
			if (audio && currentSong?.title.toLowerCase().includes('tobey')) {
				console.log('Tobey track progress - Current time:', audio.currentTime, 'Duration:', audio.duration);
			}
		};

		const handleLoadStart = () => {
			console.log('Audio load started');
		};

		const handleLoadedData = () => {
			const audio = audioRef.current;
			if (audio && currentSong) {
				console.log('=== AUDIO FILE DIAGNOSTICS ===');
				console.log('Song title:', currentSong.title);
				console.log('Audio URL:', currentSong.audioUrl);
				console.log('Audio duration from metadata:', audio.duration);
				console.log('Audio readyState:', audio.readyState);
				console.log('Audio networkState:', audio.networkState);
				console.log('Audio buffered ranges:', audio.buffered.length);

				// Check if this is the problematic track
				if (currentSong.title.toLowerCase().includes('tobey')) {
					console.log('🚨 TOBEY TRACK DETECTED - Extra monitoring enabled');

					// Log buffering progress
					const checkBuffering = () => {
						if (audio.buffered.length > 0) {
							for (let i = 0; i < audio.buffered.length; i++) {
								console.log(`Buffer range ${i}: ${audio.buffered.start(i)} - ${audio.buffered.end(i)}`);
							}
						}
					};

					checkBuffering();
					setTimeout(checkBuffering, 5000); // Check again after 5 seconds
				}
			}
		};

		audio?.addEventListener("ended", handleEnded);
		audio?.addEventListener("error", handleError);
		audio?.addEventListener("stalled", handleStalled);
		audio?.addEventListener("waiting", handleWaiting);
		audio?.addEventListener("canplay", handleCanPlay);
		audio?.addEventListener("seeked", handleSeeked);
		audio?.addEventListener("seeking", handleSeeking);
		audio?.addEventListener("timeupdate", handleTimeUpdate);
		audio?.addEventListener("pause", handlePause);
		audio?.addEventListener("loadstart", handleLoadStart);
		audio?.addEventListener("loadeddata", handleLoadedData);
		audio?.addEventListener("progress", handleProgress);

		return () => {
			audio?.removeEventListener("ended", handleEnded);
			audio?.removeEventListener("error", handleError);
			audio?.removeEventListener("stalled", handleStalled);
			audio?.removeEventListener("waiting", handleWaiting);
			audio?.removeEventListener("canplay", handleCanPlay);
			audio?.removeEventListener("seeked", handleSeeked);
			audio?.removeEventListener("seeking", handleSeeking);
			audio?.removeEventListener("timeupdate", handleTimeUpdate);
			audio?.removeEventListener("pause", handlePause);
			audio?.removeEventListener("loadstart", handleLoadStart);
			audio?.removeEventListener("loadeddata", handleLoadedData);
			audio?.removeEventListener("progress", handleProgress);
		};
	}, [playNext, isPlaying]);

	// Check for stuck playback
	useEffect(() => {
		if (isPlaying && audioRef.current) {
			progressCheckInterval.current = setInterval(() => {
				const audio = audioRef.current;
				if (!audio) return;

				const currentProgress = audio.currentTime;
				const duration = audio.duration;

				// Skip check if duration is not valid
				if (!duration || isNaN(duration) || duration <= 0) {
					return;
				}

				// If audio is supposed to be playing but hasn't progressed
				if (currentProgress === lastProgressRef.current && !audio.paused && !audio.ended) {
					console.warn('⚠️ Audio stuck at:', currentProgress);
					console.log('Duration:', duration, 'Ready:', audio.readyState, 'Network:', audio.networkState);

					// If stuck and not near beginning/end, skip to next song
					if (currentProgress > 5 && currentProgress < duration - 10) {
						console.error('Audio permanently stuck, skipping to next song');
						toast.error('playback stuck - skipping to next song');
						playNext();
					}
				}

				lastProgressRef.current = currentProgress;
			}, 5000);
		} else {
			if (progressCheckInterval.current) {
				clearInterval(progressCheckInterval.current);
				progressCheckInterval.current = null;
			}
		}

		return () => {
			if (progressCheckInterval.current) {
				clearInterval(progressCheckInterval.current);
			}
		};
	}, [isPlaying, playNext]);

	// Effect for song change - register play only when song actually changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;

		if (isSongChange) {
			console.log('Song changing from', prevSongRef.current, 'to', currentSong?.audioUrl);

			// Clear any existing progress check
			if (progressCheckInterval.current) {
				clearInterval(progressCheckInterval.current);
				progressCheckInterval.current = null;
			}

			// Reset tracking variables
			lastProgressRef.current = 0;

			audio.src = currentSong?.audioUrl;
			audio.currentTime = 0;
			prevSongRef.current = currentSong?.audioUrl;

			// Register play count IMMEDIATELY when song changes (only once!)
			if (currentSong?._id) {
				console.log('🎵 Registering play for:', currentSong.title);
				fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/songs/${currentSong._id}/play`, {
					method: 'POST',
					credentials: 'include'
				})
				.then(res => res.json())
				.then(data => console.log('✅ Play registered! New count:', data.playCount))
				.catch(err => console.error('❌ Failed to register play:', err));
			}

			if (isPlaying) {
				audio.play().catch((error) => {
					console.error('Failed to play audio:', error);
					toast.error('failed to play audio');
				});
			}
		}
	}, [currentSong]); // Only depend on currentSong, NOT isPlaying

	// Separate effect for play/pause without triggering play count
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;

		// Don't handle play/pause on song change (handled above)
		if (isSongChange) return;

		if (isPlaying) {
			audio.play().catch((error) => {
				console.error('Failed to play audio:', error);
				toast.error('failed to play audio');
			});
		} else {
			audio.pause();
		}
	}, [isPlaying, currentSong]);

	return <audio ref={audioRef} preload="metadata" />;
};
export default AudioPlayer;