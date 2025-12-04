import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const DMCAWarning = () => {
	return (
		<div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
				<div className="flex-1">
					<p className="text-sm text-yellow-200/90">
						<span className="font-semibold">warning!</span> if you are a copyright holder of the content, please read{" "}
						<Link to="/dmca" className="underline hover:text-yellow-100 transition-colors">
							this page
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
};

export default DMCAWarning;

