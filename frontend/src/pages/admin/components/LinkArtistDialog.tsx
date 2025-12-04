import { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
	_id: string;
	email: string;
	fullName: string;
	imageUrl: string;
	artistProfile?: {
		artistId?: string;
	};
}

interface LinkArtistDialogProps {
	artistId: string;
	artistName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const LinkArtistDialog = ({ artistId, artistName, open, onOpenChange }: LinkArtistDialogProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [linkedUsers, setLinkedUsers] = useState<User[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const fetchLinkedUsers = useCallback(async () => {
		try {
			const response = await axiosInstance.get(`/artists/${artistId}/linked-users`);
			setLinkedUsers(response.data);
		} catch (error: any) {
			console.error("Error fetching linked users:", error);
			toast.error("Failed to fetch linked users");
		}
	}, [artistId]);

	const searchUsers = useCallback(async () => {
		setIsSearching(true);
		try {
			const response = await axiosInstance.get(`/users/search?query=${searchQuery}`);
			setSearchResults(response.data);
		} catch (error: any) {
			console.error("Error searching users:", error);
			toast.error("Failed to search users");
		} finally {
			setIsSearching(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		if (open && artistId) {
			fetchLinkedUsers();
		}
	}, [open, artistId, fetchLinkedUsers]);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchQuery.length >= 2) {
				searchUsers();
			} else {
				setSearchResults([]);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery, searchUsers]);

	const handleLinkUser = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/artists/${artistId}/link-user`, { userId });
			toast.success(`user linked to ${artistName}`);
			await fetchLinkedUsers();
			setSearchQuery("");
			setSearchResults([]);
		} catch (error: any) {
			console.error("Error linking user:", error);
			toast.error(error.response?.data?.message || "failed to link user");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnlinkUser = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/artists/${artistId}/unlink-user`, { userId });
			toast.success("user unlinked from artist");
			await fetchLinkedUsers();
		} catch (error: any) {
			console.error("Error unlinking user:", error);
			toast.error(error.response?.data?.message || "failed to unlink user");
		} finally {
			setIsLoading(false);
		}
	};

	const isUserLinked = (user: User) => {
		return user.artistProfile?.artistId === artistId;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Link2 className="h-5 w-5" />
						link users to {artistName}
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						link users to this artist so they can upload songs as this artist
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Search Section */}
					<div>
						<h3 className="text-sm font-semibold mb-3">add user</h3>
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
							<Input
								type="text"
								placeholder="search by email or name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						{/* Search Results */}
						{searchResults.length > 0 && (
							<div className="mt-3 space-y-2">
								{searchResults.map((user) => {
									const alreadyLinked = isUserLinked(user);
									return (
										<div
											key={user._id}
											className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
										>
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarImage src={user.imageUrl} alt={user.fullName} />
													<AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{user.fullName}</p>
													<p className="text-sm text-zinc-400">{user.email}</p>
												</div>
												{alreadyLinked && (
													<div className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
														linked
													</div>
												)}
											</div>
											{!alreadyLinked ? (
												<Button
													onClick={() => handleLinkUser(user._id)}
													disabled={isLoading}
													size="sm"
													className="bg-blue-500 hover:bg-blue-600"
												>
													<UserPlus className="h-4 w-4 mr-1" />
													link
												</Button>
											) : (
												<span className="text-sm text-zinc-500">already linked</span>
											)}
										</div>
									);
								})}
							</div>
						)}

						{isSearching && (
							<div className="mt-3 text-center text-zinc-400">searching...</div>
						)}

						{searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
							<div className="mt-3 text-center text-zinc-400">no users found</div>
						)}
					</div>

					{/* Linked Users Section */}
					<div>
						<h3 className="text-sm font-semibold mb-3">
							linked users ({linkedUsers.length})
						</h3>
						<div className="space-y-2">
							{linkedUsers.map((user) => (
								<div
									key={user._id}
									className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
								>
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarImage src={user.imageUrl} alt={user.fullName} />
											<AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium">{user.fullName}</p>
											<p className="text-sm text-zinc-400">{user.email}</p>
										</div>
									</div>
									<Button
										onClick={() => handleUnlinkUser(user._id)}
										disabled={isLoading}
										size="sm"
										variant="destructive"
									>
										<UserMinus className="h-4 w-4 mr-1" />
										unlink
									</Button>
								</div>
							))}

							{linkedUsers.length === 0 && (
								<div className="text-center py-8 text-zinc-400">
									No users linked to this artist yet
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default LinkArtistDialog;

