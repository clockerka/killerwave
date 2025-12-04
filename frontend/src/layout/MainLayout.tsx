import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import QuickLibrary from "./components/QuickLibrary";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { initializeAuthInstance, clearAuthCache } from "@/lib/axios";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const auth = useAuth();
	const { isSignedIn, isLoaded } = auth;

	useEffect(() => {
		// Initialize auth instance for axios interceptors
		if (isLoaded) {
			initializeAuthInstance(auth);
		}
	}, [auth, isLoaded]);

	// Clear auth cache when user signs out
	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			clearAuthCache();
		}
	}, [isSignedIn, isLoaded]);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);
	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				<ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
					<LeftSidebar />
				</ResizablePanel>
				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<Outlet />
				</ResizablePanel>
				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
							<QuickLibrary />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
			<PlaybackControls />
		</div>
	);
};
export default MainLayout;