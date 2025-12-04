import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DMCAPage = () => {
	const navigate = useNavigate();

	return (
		<div className="h-full overflow-y-auto bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
			<div className="max-w-4xl mx-auto px-6 py-16">
				<Button
					onClick={() => navigate(-1)}
					variant="ghost"
					size="icon"
					className="mb-8 hover:bg-white/10 text-white"
				>
					<ArrowLeft className="h-6 w-6" />
				</Button>

				<div className="space-y-8">
					<div className="flex items-center gap-4 mb-8">
						<FileText className="h-12 w-12 text-blue-400" />
						<h1 className="text-4xl md:text-5xl font-bold text-white">
							copyright notice
						</h1>
					</div>

					<div className="space-y-6 text-white/90">
						<section className="space-y-4">
							<h2 className="text-2xl md:text-3xl font-semibold text-white">
								our position on piracy
							</h2>
							<p className="text-lg md:text-xl leading-relaxed">
								our service does not welcome the pirate use of music. we respect the rights
								of copyright holders and are committed to protecting their intellectual property.
							</p>
						</section>

						<section className="space-y-4 mt-8">
							<h2 className="text-2xl md:text-3xl font-semibold text-white">
								copyright infringement notice
							</h2>
							<p className="text-lg md:text-xl leading-relaxed">
								if any user has uploaded content protected by copyright, and you are the
								copyright holder, you can contact our support team with the following information:
							</p>
							<ul className="list-disc list-inside space-y-2 text-lg md:text-xl ml-4 text-white/80">
								<li>reason: <span className="font-semibold text-white">dmca</span></li>
								<li>link to the song or content in question</li>
								<li>documents confirming copyright ownership</li>
							</ul>
						</section>

						<section className="space-y-4 mt-8">
							<h2 className="text-2xl md:text-3xl font-semibold text-white">
								how to report
							</h2>
							<p className="text-lg md:text-xl leading-relaxed">
								please submit your dmca notice through our support system:
							</p>
							<a
								href="/support"
								className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-xl transition-colors mt-4"
							>
								<span>go to support page</span>
								<ExternalLink className="h-5 w-5" />
							</a>
						</section>

						<section className="space-y-4 mt-8">
							<h2 className="text-2xl md:text-3xl font-semibold text-white">
								response time
							</h2>
							<p className="text-lg md:text-xl leading-relaxed">
								we will review your claim and resolve the issue within <span className="font-semibold text-white">14 business days</span>.
							</p>
						</section>

						<div className="mt-12 p-6 bg-white/5 rounded-lg border border-white/10">
							<p className="text-white/70 text-base md:text-lg leading-relaxed">
								by submitting a dmca notice, you confirm that you are the copyright holder
								or authorized to act on behalf of the copyright holder, and that the information
								provided is accurate.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DMCAPage;

