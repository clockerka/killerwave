import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { axiosInstance, initializeAuthInstance } from "@/lib/axios";
import SupportTabContent from "../admin/components/SupportTabContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@clerk/clerk-react";

const SupportDashboardPage = () => {
	const navigate = useNavigate();
	const { isSuperAdmin, isLoading } = useAuthStore();
	const [isVerifying, setIsVerifying] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const auth = useAuth();

	// Initialize auth instance for axios interceptors
	useEffect(() => {
		initializeAuthInstance(auth);
	}, [auth]);

	const verifyAccess = useCallback(async () => {
		try {
			// Add a small delay to ensure auth state is stable
			await new Promise(resolve => setTimeout(resolve, 100));

			// Verify on server side
			const response = await axiosInstance.get("/admin/check-support");
			const { supportAgent } = response.data;

			if (supportAgent) {
				setHasAccess(true);
			} else {
				// Redirect to 404 if no access
				navigate("/404", { replace: true });
			}
		} catch (error) {
			console.error("Error verifying access:", error);
			navigate("/404", { replace: true });
		} finally {
			setIsVerifying(false);
		}
	}, [navigate]);

	useEffect(() => {
		// Only verify access after auth loading is complete
		if (!isLoading) {
			verifyAccess();
		}
	}, [verifyAccess, isLoading]);

	if (isVerifying || isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-zinc-900">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-zinc-400">verifying access...</p>
				</div>
			</div>
		);
	}

	if (!hasAccess) {
		return null; // Will be redirected
	}

	return (
		<div className="h-screen bg-zinc-900">
			<ScrollArea className="h-full">
				<div className="flex flex-col min-h-full">
					{/* Header */}
					<div className="bg-gradient-to-b from-blue-500 to-blue-700 p-8">
						<div className="max-w-7xl mx-auto">
							<div className="flex items-center gap-4 mb-6">
								<div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
									<svg
										className="w-8 h-8 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
								</div>
								<div>
									<h1 className="text-3xl font-bold text-white mb-1">Support Dashboard</h1>
									<p className="text-blue-100">
										{isSuperAdmin ? "Super Admin Access" : "Support Agent Access"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1 p-6">
						<div className="max-w-7xl mx-auto">
							<SupportTabContent />
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default SupportDashboardPage;
