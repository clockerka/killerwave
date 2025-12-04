import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
	_id: string;
	email: string;
	fullName: string;
	imageUrl: string;
	isAdmin: boolean;
	clerkId: string;
}

const AdminsTabContent = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [admins, setAdmins] = useState<User[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const fetchAdmins = async () => {
		try {
			const response = await axiosInstance.get("/users/admins");
			setAdmins(response.data);
		} catch (error: any) {
			console.error("Error fetching admins:", error);
			toast.error("failed to fetch admins");
		}
	};

	const searchUsers = useCallback(async () => {
		setIsSearching(true);
		try {
			const response = await axiosInstance.get(`/users/search?query=${searchQuery}`);
			setSearchResults(response.data);
		} catch (error: any) {
			console.error("Error searching users:", error);
			toast.error("failed to search users");
		} finally {
			setIsSearching(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		fetchAdmins();
	}, []);

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

	const handleMakeAdmin = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/users/${userId}/make-admin`);
			toast.success("user is now an admin");
			await fetchAdmins();
			setSearchQuery("");
			setSearchResults([]);
		} catch (error: any) {
			console.error("Error making admin:", error);
			toast.error(error.response?.data?.message || "failed to make user admin");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveAdmin = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/users/${userId}/remove-admin`);
			toast.success("admin privileges removed");
			await fetchAdmins();
		} catch (error: any) {
			console.error("Error removing admin:", error);
			toast.error(error.response?.data?.message || "failed to remove admin");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Search Section */}
			<Card className="p-6 bg-zinc-900/50 border-zinc-800">
				<h3 className="text-lg font-semibold mb-4">add new admin</h3>
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
					<div className="mt-4 space-y-2">
						{searchResults.map((user) => (
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
									{user.isAdmin && (
										<div className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
											<Shield className="h-3 w-3" />
											Admin
										</div>
									)}
								</div>
								{!user.isAdmin ? (
									<Button
										onClick={() => handleMakeAdmin(user._id)}
										disabled={isLoading}
										size="sm"
										className="bg-blue-500 hover:bg-blue-600"
									>
										<UserPlus className="h-4 w-4 mr-1" />
										make admin
									</Button>
								) : (
									<span className="text-sm text-zinc-500">already an admin</span>
								)}
							</div>
						))}
					</div>
				)}

				{isSearching && (
					<div className="mt-4 text-center text-zinc-400">searching...</div>
				)}

				{searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
					<div className="mt-4 text-center text-zinc-400">no users found</div>
				)}
			</Card>

			{/* Current Admins */}
			<Card className="p-6 bg-zinc-900/50 border-zinc-800">
				<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Shield className="h-5 w-5 text-blue-400" />
					Current Admins ({admins.length})
				</h3>
				<div className="space-y-2">
					{admins.map((admin) => (
						<div
							key={admin._id}
							className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
						>
							<div className="flex items-center gap-3">
								<Avatar>
									<AvatarImage src={admin.imageUrl} alt={admin.fullName} />
									<AvatarFallback>{admin.fullName.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">{admin.fullName}</p>
									<p className="text-sm text-zinc-400">{admin.email}</p>
								</div>
							</div>
							<Button
								onClick={() => handleRemoveAdmin(admin._id)}
								disabled={isLoading}
								size="sm"
								variant="destructive"
							>
								<UserMinus className="h-4 w-4 mr-1" />
								remove admin
							</Button>
						</div>
					))}

					{admins.length === 0 && (
						<div className="text-center py-8 text-zinc-400">
							No admins found. Add your first admin above.
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default AdminsTabContent;

