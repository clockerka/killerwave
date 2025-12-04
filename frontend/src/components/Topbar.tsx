import { SignedOut, SignedIn, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Music, HelpCircle, Headphones, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Button } from "./ui/button";
import { useEffect } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Topbar = () => {
	const { isAdmin, isSupportAgent, fetchUser, checkAdminStatus } = useAuthStore();

	useEffect(() => {
		checkAdminStatus();
		fetchUser();
	}, [checkAdminStatus, fetchUser]);


	const NavButton = ({ to, icon: Icon, children, className = "" }: any) => (
		<Link to={to} className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}>
			<Icon className='size-4 mr-2' />
			{children}
		</Link>
	);

	const renderDesktopNav = () => (
		<>
			{isAdmin && (
				<NavButton to="/admin" icon={LayoutDashboardIcon} className="hidden md:flex">
					admin dashboard
				</NavButton>
			)}
			{isSupportAgent && (
				<NavButton to="/sup" icon={Headphones} className="hidden lg:flex">
					support dashboard
				</NavButton>
			)}
			<SignedIn>
				<NavButton to="/artist-hub" icon={Music} className="hidden sm:flex">
					artist hub
				</NavButton>
			</SignedIn>
			<NavButton to="/support" icon={HelpCircle} className="hidden md:flex">
				support
			</NavButton>
		</>
	);

	const renderMobileMenu = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="md:hidden">
					<Menu className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
				<SignedIn>
					<DropdownMenuItem asChild>
						<Link to="/artist-hub" className="flex items-center">
							<Music className="size-4 mr-2" />
							artist hub
						</Link>
					</DropdownMenuItem>
				</SignedIn>
				{isAdmin && (
					<DropdownMenuItem asChild>
						<Link to="/admin" className="flex items-center">
							<LayoutDashboardIcon className="size-4 mr-2" />
							admin dashboard
						</Link>
					</DropdownMenuItem>
				)}
				{isSupportAgent && (
					<DropdownMenuItem asChild>
						<Link to="/sup" className="flex items-center">
							<Headphones className="size-4 mr-2" />
							support dashboard
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild>
					<Link to="/support" className="flex items-center">
						<HelpCircle className="size-4 mr-2" />
						support
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
			<div className="flex gap-2 items-center min-w-0">
				<img src="/killerwave.png" className="size-8 shrink-0" alt="killerwave logo" />
				<span className="truncate">killerwave</span>
			</div>

			<div className="flex items-center gap-2 ml-2">
				{renderDesktopNav()}
				{renderMobileMenu()}

				<SignedOut>
					<div className="hidden sm:block">
						<SignInOAuthButtons />
					</div>
				</SignedOut>
				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;