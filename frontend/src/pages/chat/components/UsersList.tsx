import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers } = useChatStore();

	return (
		<div className='border-r border-zinc-800'>
			<div className='flex flex-col h-full'>
				<ScrollArea className='h-[calc(100vh-280px)]'>
					<div className='space-y-2 p-4'>
						{isLoading ? (
							<UsersListSkeleton />
						) : (
							users.map((user) => (
								<div
									key={user._id}
									onClick={() => setSelectedUser(user)}
									className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
										selectedUser?.clerkId === user.clerkId ? "bg-zinc-800" : "hover:bg-zinc-800/50"
									}`}
								>
									<div className='relative'>
										<Avatar className='size-8 md:size-12'>
											<AvatarImage src={user.imageUrl} />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										{onlineUsers.has(user.clerkId) && (
											<div
												className='absolute bottom-0 right-0 size-2.5 bg-green-500
                        rounded-full border-2 border-zinc-900'
											/>
										)}
									</div>

									<div className='hidden lg:block text-left min-w-0 flex-1'>
										<div className='font-medium truncate'>{user.fullName}</div>
										<div className='text-sm text-zinc-400'>
											{onlineUsers.has(user.clerkId) ? "Online" : "Offline"}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default UsersList;

