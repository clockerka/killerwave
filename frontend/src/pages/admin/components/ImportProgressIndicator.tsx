import { useImportStore } from "@/stores/useImportStore";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

const ImportProgressIndicator = () => {
	const { progress, resetImport } = useImportStore();

	// Auto-clear completed or error operations
	useEffect(() => {
		if (!progress) return;

		if (progress.status === 'complete') {
			const timer = setTimeout(() => {
				resetImport();
			}, 3000);
			return () => clearTimeout(timer);
		}

		// If operation shows error, clear after 5s
		if (progress.status === 'error') {
			const timer = setTimeout(() => {
				resetImport();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [progress, resetImport]);

	if (!progress) return null;

	let progressPercentage = 0;
	if (progress.status === 'complete') {
		progressPercentage = 100;
	} else if (progress.status === 'error') {
		progressPercentage = 0;
	} else {
		// Real progress based ONLY on processed tracks
		// 0-5%: creating album structure
		// 5-100%: processing tracks (each track adds equal percentage)

		if (progress.status === 'creating' || progress.status === 'fetching') {
			// Creating stage: stay at 5% until tracks start processing
			progressPercentage = 5;
		} else if (progress.status === 'uploading') {
			// Each processed track adds percentage
			if (progress.totalTracks > 0 && progress.processedTracks > 0) {
				// 5% base + (95% divided by total tracks * processed tracks)
				const trackPercentage = 95 / progress.totalTracks;
				progressPercentage = 5 + Math.floor(trackPercentage * progress.processedTracks);
			} else {
				// No tracks processed yet - stay at 5%
				progressPercentage = 5;
			}
		}

		// Cap at 99% until backend confirms complete
		progressPercentage = Math.min(progressPercentage, 99);
	}

	const getStatusText = () => {
		if (progress.operation === 'delete') {
			switch (progress.status) {
				case 'deleting':
					return 'deleting track...';
				case 'complete':
					return 'track deleted!';
				case 'error':
					return 'delete failed';
				default:
					return 'deleting...';
			}
		}

		switch (progress.status) {
			case 'fetching':
			case 'creating':
				return 'creating album structure...';
			case 'uploading':
				if (progress.processedTracks > 0) {
					return `processing tracks (${progress.processedTracks}/${progress.totalTracks})...`;
				} else {
					return 'preparing tracks...';
				}
			case 'complete':
				return 'import complete!';
			case 'error':
				return 'import failed';
			default:
				return 'importing...';
		}
	};

	const getStatusIcon = () => {
		if (progress.status === 'complete') {
			return <CheckCircle2 className="h-5 w-5 text-green-400" />;
		}
		if (progress.status === 'error') {
			return <XCircle className="h-5 w-5 text-red-400" />;
		}
		return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
	};

	return (
		<div className="fixed top-4 right-4 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl p-4 min-w-[320px]">
			<div className="flex items-start gap-3">
				{getStatusIcon()}
				<div className="flex-1">
					<h4 className="text-sm font-semibold text-white mb-1">
						{progress.albumTitle}
					</h4>
					<p className="text-xs text-zinc-400 mb-2">
						{getStatusText()}
					</p>

					{/* Progress Ring with Percentage */}
					<div className="relative w-16 h-16 mx-auto">
						<svg className="transform -rotate-90 w-16 h-16">
							{/* Background circle */}
							<circle
								cx="32"
								cy="32"
								r="28"
								stroke="currentColor"
								strokeWidth="4"
								fill="transparent"
								className="text-zinc-700"
							/>
							{/* Progress circle */}
							<circle
								cx="32"
								cy="32"
								r="28"
								stroke="currentColor"
								strokeWidth="4"
								fill="transparent"
								strokeDasharray={`${2 * Math.PI * 28}`}
								strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
								className={`transition-all duration-700 ease-out ${
									progress.status === 'complete' 
										? 'text-green-400' 
										: progress.status === 'error' 
										? 'text-red-400' 
										: 'text-blue-400'
								}`}
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="text-sm font-semibold text-white">
								{progressPercentage}%
							</span>
						</div>
					</div>

					{progress.error && (
						<p className="text-xs text-red-400 mt-2">
							{progress.error}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ImportProgressIndicator;

