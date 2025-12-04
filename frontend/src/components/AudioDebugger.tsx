import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

export const AudioDebugger = () => {
	const { currentSong, isPlaying } = usePlayerStore();

	const handleForceReload = () => {
		const audio = document.querySelector("audio") as HTMLAudioElement;
		if (audio && currentSong) {
			const currentTime = audio.currentTime;
			console.log('Force reloading audio from:', currentTime);

			audio.load();

			setTimeout(() => {
				const audioElement = document.querySelector("audio") as HTMLAudioElement;
				if (audioElement) {
					audioElement.currentTime = currentTime + 0.1;
					if (isPlaying) {
						audioElement.play().catch(error => {
							console.error('Failed to resume after force reload:', error);
							toast.error('Failed to resume playback');
						});
					}
				}
			}, 500);

			toast.success('Audio reloaded');
		}
	};

	const handleSkipToPosition = (seconds: number) => {
		const audio = document.querySelector("audio") as HTMLAudioElement;
		if (audio) {
			audio.currentTime = seconds;
			console.log(`Skipped to ${seconds} seconds`);
			toast.success(`Skipped to ${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`);
		}
	};

	const handleInspectAudio = () => {
		const audio = document.querySelector("audio") as HTMLAudioElement;
		if (audio && currentSong) {
			console.log('=== DETAILED AUDIO INSPECTION ===');
			console.log('Song from DB:', currentSong.title);
			console.log('Duration from DB:', currentSong.duration, 'seconds');
			console.log('Audio src:', audio.src);
			console.log('Audio duration (metadata):', audio.duration);
			console.log('Audio current time:', audio.currentTime);
			console.log('Audio ready state:', audio.readyState);
			console.log('Audio network state:', audio.networkState);
			console.log('Audio ended:', audio.ended);
			console.log('Audio paused:', audio.paused);
			console.log('Audio seeking:', audio.seeking);

			// Check buffered ranges
			console.log('Buffered ranges:');
			for (let i = 0; i < audio.buffered.length; i++) {
				console.log(`  Range ${i}: ${audio.buffered.start(i)} - ${audio.buffered.end(i)}`);
			}

			// Check if we can seek beyond the current "end"
			console.log('Attempting to seek to 5 minutes to test...');
			audio.currentTime = 300; // 5 minutes

			setTimeout(() => {
				console.log('After seek to 300s:');
				console.log('Current time:', audio.currentTime);
				console.log('Duration:', audio.duration);
				console.log('Ended:', audio.ended);
			}, 100);

			toast.success('Audio inspection logged to console');
		}
	};

	const handleClearStuck = () => {
		const audio = document.querySelector("audio") as HTMLAudioElement;
		if (audio && currentSong) {
			console.log('🔧 CLEARING STUCK DETECTION AND RESETTING AUDIO');

			// Force audio to not think it's ended
			const currentTime = audio.currentTime;
			audio.load();

			setTimeout(() => {
				const audioElement = document.querySelector("audio") as HTMLAudioElement;
				if (audioElement) {
					audioElement.currentTime = currentTime;
					if (isPlaying) {
						audioElement.play().catch(error => {
							console.error('Failed to resume after clearing stuck:', error);
							toast.error('Failed to resume playback');
						});
					}
				}
			}, 200);

			toast.success('Reset audio state');
		}
	};

	const handleFixDuration = async () => {
		const audio = document.querySelector("audio") as HTMLAudioElement;
		if (audio && currentSong) {
			const actualDuration = audio.duration;
			const dbDuration = currentSong.duration;

			if (!actualDuration || isNaN(actualDuration)) {
				toast.error("Cannot detect actual audio duration");
				return;
			}

			console.log(`Fixing duration for "${currentSong.title}"`);
			console.log(`DB duration: ${dbDuration}s, Actual duration: ${actualDuration}s`);

			try {
				const response = await axiosInstance.patch(`/admin/songs/${currentSong._id}/duration`, {
					duration: Math.round(actualDuration)
				});

				console.log('Duration fix response:', response.data);
				toast.success(`Duration fixed: ${dbDuration}s → ${Math.round(actualDuration)}s`);
			} catch (error: any) {
				console.error('Error fixing duration:', error);
				toast.error(error.response?.data?.message || 'Failed to fix duration');
			}
		}
	};

	if (!currentSong) return null;

	return (
		<div className="fixed bottom-24 right-4 bg-zinc-800 p-3 rounded-lg border border-zinc-700 z-50 max-w-sm">
			<div className="text-xs text-zinc-400 mb-2">Audio Debug Tools</div>
			<div className="text-xs text-zinc-300 mb-2 truncate">{currentSong.title}</div>
			<div className="grid grid-cols-2 gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={handleForceReload}
					className="text-xs"
				>
					<RefreshCw className="h-3 w-3 mr-1" />
					Reload
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => handleSkipToPosition(100)}
					className="text-xs"
				>
					Skip 1:40
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => handleSkipToPosition(300)}
					className="text-xs"
				>
					Skip 5:00
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={handleInspectAudio}
					className="text-xs"
				>
					Inspect
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={handleClearStuck}
					className="text-xs col-span-2 bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
				>
					<RefreshCw className="h-3 w-3 mr-1" />
					Clear Stuck & Reset
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={handleFixDuration}
					className="text-xs col-span-2 bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30"
				>
					<Wrench className="h-3 w-3 mr-1" />
					Fix Duration in DB
				</Button>
			</div>
		</div>
	);
};
