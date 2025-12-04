import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import { MessageSquare } from "lucide-react";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser, fetchMessages]);

	return (
		<main className='h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden'>
			<Topbar />
			<div className='grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]'>
				<UsersList />

				<div className='flex flex-col h-full'>
					{selectedUser ? (
						<>
							<ChatHeader />

							<ScrollArea className='h-[calc(100vh-340px)]'>
								<div className='p-4 space-y-4'>
									{messages.map((message) => (
										<div
											key={message._id}
											className={`flex items-start gap-3 ${message.senderId === user?.id ? "flex-row-reverse" : ""}`}
										>
											<Avatar className='size-8'>
												<AvatarImage
													src={message.senderId === user?.id ? user.imageUrl : selectedUser.imageUrl}
												/>
											</Avatar>

											<div
												className={`rounded-lg p-3 max-w-[70%] ${
													message.senderId === user?.id
														? "bg-[#e8ecf3] text-black"
														: "bg-zinc-800 text-zinc-100"
												}`}
											>
												<p className='text-sm'>{message.content}</p>
												<span className='text-xs opacity-70 mt-1 block'>{formatTime(message.createdAt)}</span>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>

							<MessageInput />
						</>
					) : (
						<div className='flex flex-col items-center justify-center h-full'>
							<MessageSquare size={64} className='text-zinc-600 mb-4' />
							<p className='text-zinc-400 text-lg'>Select a user to start chatting</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
};

export default ChatPage;

