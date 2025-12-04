import { usePlayerStore } from "@/stores/usePlayerStore";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LyricsViewerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const LyricsViewer = ({ open, onOpenChange }: LyricsViewerProps) => {
	const { currentSong } = usePlayerStore();
	const [lyrics, setLyrics] = useState("");

	useEffect(() => {
		if (currentSong) {
			setLyrics(currentSong.lyrics || "");
		}
	}, [currentSong]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-900/95 via-blue-800/95 to-blue-900/95 overflow-y-auto">
			{/* Header with close button */}
			<div className="sticky top-0 z-10 bg-blue-900/50 backdrop-blur-md border-b border-white/10">
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white mb-1">
							{currentSong?.title}
						</h1>
						<p className="text-white/70">
							{currentSong?.artists?.map(a => a.name).join(", ")}
						</p>
					</div>
					<button
						onClick={() => onOpenChange(false)}
						className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
					>
						<X className="w-6 h-6 text-white" />
					</button>
				</div>
			</div>

			{/* Lyrics content */}
			<div className="max-w-4xl mx-auto px-6 py-16">
				{!lyrics ? (
					<div className="text-center py-20">
						<p className="text-white text-2xl font-medium">
							there is no text rn(((
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{lyrics.split('\n').map((line, index) => (
							<p
								key={index}
								className="text-white text-3xl font-semibold leading-relaxed"
								style={{
									textShadow: '0 2px 8px rgba(0,0,0,0.3)',
								}}
							>
								{line || '\u00A0'}
							</p>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

