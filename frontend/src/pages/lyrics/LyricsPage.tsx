import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const LyricsPage = () => {
	const { currentSong } = usePlayerStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!currentSong) {
			navigate("/");
		}
	}, [currentSong, navigate]);

	if (!currentSong) {
		return null;
	}

	return (
		<div className="h-full overflow-y-auto">
			<div className="min-h-full bg-gradient-to-b from-blue-900/95 via-blue-800/95 to-blue-900/95">
				<div className="max-w-4xl mx-auto px-6 py-16">
					<Button
						onClick={() => navigate(-1)}
						variant="ghost"
						size="icon"
						className="mb-6 hover:bg-white/10 text-white"
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>

					<div className="text-center py-20 space-y-8">
						<div className="space-y-4">
							<p className="text-white text-2xl md:text-3xl font-medium leading-relaxed">
								unfortunately, we don't have the money to use the api to get song lyrics.
							</p>
							<p className="text-white/80 text-xl md:text-2xl leading-relaxed">
								you can support the project in the following ways:
							</p>
						</div>

						<div className="flex flex-col items-center gap-4 mt-8">
							<a
								href="https://dalink.to/clockerka"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-lg md:text-xl transition-colors"
							>
								<span>dalink.to/clockerka</span>
								<ExternalLink className="h-5 w-5" />
							</a>
							<a
								href="https://www.donationalerts.com/r/clockerka"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-lg md:text-xl transition-colors"
							>
								<span>donationalerts.com/r/clockerka</span>
								<ExternalLink className="h-5 w-5" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LyricsPage;

