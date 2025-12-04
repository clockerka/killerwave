import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, Headphones } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
	_id: string;
	email: string;
	fullName: string;
	imageUrl: string;
	isSupportAgent: boolean;
	clerkId: string;
}

const SupportAgentsTabContent = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [agents, setAgents] = useState<User[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const fetchAgents = async () => {
		try {
			const response = await axiosInstance.get("/users/support-agents");
			setAgents(response.data);
		} catch (error: any) {
			console.error("Error fetching support agents:", error);
			toast.error("failed to fetch support agents");
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
		fetchAgents();
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

	const handleMakeSupportAgent = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/users/${userId}/make-support-agent`);
			toast.success("user is now a support agent");
			await fetchAgents();
			setSearchQuery("");
			setSearchResults([]);
		} catch (error: any) {
			console.error("Error making support agent:", error);
			toast.error(error.response?.data?.message || "failed to make user support agent");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveSupportAgent = async (userId: string) => {
		setIsLoading(true);
		try {
			await axiosInstance.post(`/users/${userId}/remove-support-agent`);
			toast.success("support agent privileges removed");
			await fetchAgents();
		} catch (error: any) {
			console.error("Error removing support agent:", error);
			toast.error(error.response?.data?.message || "failed to remove support agent");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Search Section */}
			<Card className="p-6 bg-zinc-900/50 border-zinc-800">
				<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Headphones className="h-5 w-5" />
					add new support agent
				</h3>
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
						{searchResults.map((user) => {
							const isAlreadyAgent = user.isSupportAgent;
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
										{isAlreadyAgent && (
											<div className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
												<Headphones className="h-3 w-3" />
												support agent
											</div>
										)}
									</div>
									{!isAlreadyAgent ? (
										<Button
											onClick={() => handleMakeSupportAgent(user._id)}
											disabled={isLoading}
											size="sm"
											className="bg-blue-500 hover:bg-blue-600"
										>
											<UserPlus className="h-4 w-4 mr-1" />
											make agent
										</Button>
									) : (
										<span className="text-sm text-zinc-500">already an agent</span>
									)}
								</div>
							);
						})}
					</div>
				)}

				{isSearching && (
					<div className="mt-4 text-center text-zinc-400">searching...</div>
				)}

				{searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
					<div className="mt-4 text-center text-zinc-400">no users found</div>
				)}
			</Card>

			{/* Support Agents List */}
			<Card className="p-6 bg-zinc-900/50 border-zinc-800">
				<h3 className="text-lg font-semibold mb-4">
					support agents ({agents.length})
				</h3>
				<div className="space-y-2">
					{agents.map((agent) => (
						<div
							key={agent._id}
							className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
						>
							<div className="flex items-center gap-3">
								<Avatar>
									<AvatarImage src={agent.imageUrl} alt={agent.fullName} />
									<AvatarFallback>{agent.fullName.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium flex items-center gap-2">
										{agent.fullName}
										<Headphones className="h-4 w-4 text-blue-400" />
									</p>
									<p className="text-sm text-zinc-400">{agent.email}</p>
								</div>
							</div>
							<Button
								onClick={() => handleRemoveSupportAgent(agent._id)}
								disabled={isLoading}
								size="sm"
								variant="destructive"
							>
								<UserMinus className="h-4 w-4 mr-1" />
								remove
							</Button>
						</div>
					))}

					{agents.length === 0 && (
						<div className="text-center py-8 text-zinc-400">
							no support agents yet
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};

export default SupportAgentsTabContent;
