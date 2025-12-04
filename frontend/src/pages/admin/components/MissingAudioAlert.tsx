import { AlertCircle } from "lucide-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";

const MissingAudioAlert = () => {
	const { songs } = useMusicStore();
	const [missingCount, setMissingCount] = useState(0);

	useEffect(() => {
		const count = songs.filter(song => song.audioUrl?.includes('placeholder')).length;
		setMissingCount(count);
	}, [songs]);

	if (missingCount === 0) return null;

	return (
		<div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
				<div className="flex-1">
					<p className="text-sm text-blue-200/90">
						<span className="font-semibold">{missingCount} track{missingCount > 1 ? 's' : ''}</span> need{missingCount === 1 ? 's' : ''} manual audio upload.
						{" "}Check the songs tab for highlighted tracks.
					</p>
				</div>
			</div>
		</div>
	);
};

export default MissingAudioAlert;

