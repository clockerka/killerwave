import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MessageCircle, Upload, X, FileText, Image, Video, ExternalLink, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Attachment {
	url: string;
	type: string;
	originalName: string;
}

interface Message {
	_id: string;
	senderId: string;
	senderName: string;
	senderRole: 'user' | 'support' | 'admin';
	message: string;
	attachments: Attachment[];
	createdAt: string;
}

interface Ticket {
	_id: string;
	category: string;
	description: string;
	status: string;
	attachments: Attachment[];
	messages: Message[];
	createdAt: string;
	updatedAt: string;
	lastResponseAt?: string;
}

const MyTicketsPage = () => {
	const navigate = useNavigate();
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Give some time for auth to initialize
		const timer = setTimeout(() => {
			setIsCheckingAuth(false);
			fetchTickets();
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (selectedTicket && messagesEndRef.current) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			}, 100);
		}
	}, [selectedTicket?.messages, selectedTicket]);

	const fetchTickets = async () => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get("/support/tickets/my");
			setTickets(response.data);
		} catch (error: any) {
			console.error("Error fetching tickets:", error);
			toast.error("failed to fetch tickets");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchTicketDetails = async (ticketId: string) => {
		try {
			const response = await axiosInstance.get(`/support/tickets/${ticketId}`);
			setSelectedTicket(response.data);
		} catch (error: any) {
			console.error("Error fetching ticket details:", error);
			toast.error("failed to fetch ticket details");
		}
	};

	const handleSendMessage = async () => {
		if (!selectedTicket || (!newMessage.trim() && files.length === 0)) {
			toast.error("please enter a message or attach a file");
			return;
		}

		setIsSending(true);
		try {
			const formData = new FormData();
			formData.append('message', newMessage);

			files.forEach(file => {
				formData.append('files', file);
			});

			await axiosInstance.post(`/support/tickets/${selectedTicket._id}/messages`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			setNewMessage("");
			setFiles([]);
			await fetchTicketDetails(selectedTicket._id);
			toast.success("Message sent");
		} catch (error: any) {
			console.error("Error sending message:", error);
			toast.error("failed to send message");
		} finally {
			setIsSending(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const selectedFiles = Array.from(e.target.files);
			const validFiles = selectedFiles.filter(file => {
				const isValid = file.size <= 50 * 1024 * 1024;
				if (!isValid) {
					toast.error(`File ${file.name} is too large (max 50MB)`);
				}
				return isValid;
			});
			setFiles(prev => [...prev, ...validFiles].slice(0, 5));
		}
	};

	const getCategoryLabel = (category: string) => {
		const categoryMap: Record<string, string> = {
			"link-account-to-artist": "Link Account to Artist",
			"dmca": "DMCA",
			"bugs": "Bugs",
			"government": "Government",
			"other": "Other"
		};
		return categoryMap[category] || category;
	};

	const getStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			"open": "bg-blue-500",
			"in-progress": "bg-yellow-500",
			"resolved": "bg-green-500",
			"closed": "bg-gray-500"
		};
		return statusColors[status] || "bg-gray-500";
	};

	const getFileIcon = (type: string) => {
		switch (type) {
			case 'image': return <Image className="h-4 w-4" />;
			case 'video': return <Video className="h-4 w-4" />;
			default: return <FileText className="h-4 w-4" />;
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case 'admin': return 'bg-red-500';
			case 'support': return 'bg-blue-500';
			default: return 'bg-zinc-600';
		}
	};

	if (isLoading || isCheckingAuth) {
		return (
			<div className="h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-zinc-400">loading your tickets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full bg-gradient-to-b from-zinc-900 to-black">
			<div className="h-full overflow-y-auto">
				<div className="p-6">
					<div className="max-w-6xl mx-auto">
						<div className="flex items-center gap-4 mb-6">
							<Button
								variant="ghost"
								onClick={() => navigate("/support")}
								className="flex items-center gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								back to support
							</Button>
							<h1 className="text-3xl font-bold">my support tickets</h1>
						</div>

						{tickets.length === 0 ? (
							<Card className="p-12 text-center bg-zinc-900/50 border-zinc-800">
								<MessageCircle className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
								<h2 className="text-xl font-semibold mb-2">no tickets yet</h2>
								<p className="text-zinc-400 mb-6">you haven't created any support tickets</p>
								<Button onClick={() => navigate("/support")}>
									create a ticket
								</Button>
							</Card>
						) : (
							<div className="grid grid-cols-1 gap-4">
								{tickets.map((ticket) => (
									<Card
										key={ticket._id}
										className="p-6 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
										onClick={() => {
											setSelectedTicket(ticket);
											fetchTicketDetails(ticket._id);
										}}
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3">
												<Badge className={getStatusColor(ticket.status)}>
													{ticket.status}
												</Badge>
												<Badge variant="outline">
													{getCategoryLabel(ticket.category)}
												</Badge>
											</div>
											<div className="flex items-center text-sm text-zinc-400">
												<Clock className="h-4 w-4 mr-1" />
												{new Date(ticket.createdAt).toLocaleDateString()}
											</div>
										</div>
										<p className="text-sm line-clamp-2 mb-3">{ticket.description}</p>
										<div className="flex items-center gap-4 text-sm text-zinc-400">
											<div className="flex items-center gap-1">
												<MessageCircle className="h-4 w-4" />
												{ticket.messages?.length || 0} replies
											</div>
											{ticket.attachments.length > 0 && (
												<div className="flex items-center gap-1">
													<FileText className="h-4 w-4" />
													{ticket.attachments.length} attachments
												</div>
											)}
										</div>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Ticket Dialog */}
			<Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
				<DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl h-[80vh] flex flex-col">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							<Badge className={getStatusColor(selectedTicket?.status || '')}>
								{selectedTicket?.status}
							</Badge>
							<span>{getCategoryLabel(selectedTicket?.category || '')}</span>
						</DialogTitle>
					</DialogHeader>

					{selectedTicket && (
						<div className="flex-1 flex flex-col overflow-hidden min-h-0">
							{/* Original Message */}
							<div className="mb-4 p-4 bg-zinc-800/50 rounded-lg shrink-0">
								<p className="text-sm font-medium mb-2">Original Request:</p>
								<p className="text-sm text-zinc-300">{selectedTicket.description}</p>
								{selectedTicket.attachments.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-2">
										{selectedTicket.attachments.map((att, idx) => (
											<Button
												key={idx}
												size="sm"
												variant="outline"
												onClick={() => window.open(att.url, '_blank')}
												className="text-xs"
											>
												{getFileIcon(att.type)}
												<span className="ml-1">{att.originalName}</span>
											</Button>
										))}
									</div>
								)}
							</div>

							{/* Messages */}
							<div className="flex-1 min-h-0 flex flex-col">
								<ScrollArea className="flex-1 pr-4">
									<div className="space-y-4 pb-4">
										{selectedTicket.messages.map((msg) => (
											<div
												key={msg._id}
											className={`flex ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
										>
											<div className={`max-w-[70%] ${msg.senderRole === 'user' ? 'bg-blue-600' : 'bg-zinc-800'} rounded-lg p-4`}>
												<div className="flex items-center gap-2 mb-2">
													<span className="font-medium text-sm">{msg.senderName}</span>
													{msg.senderRole !== 'user' && (
														<Badge className={`${getRoleBadgeColor(msg.senderRole)} text-xs`}>
															{msg.senderRole}
														</Badge>
													)}
												</div>
												<p className="text-sm whitespace-pre-wrap">{msg.message}</p>
												{msg.attachments.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-2">
														{msg.attachments.map((att, idx) => (
															<Button
																key={idx}
																size="sm"
																variant="ghost"
																onClick={() => window.open(att.url, '_blank')}
																className="text-xs h-auto py-1"
															>
																{getFileIcon(att.type)}
																<span className="ml-1">{att.originalName}</span>
																<ExternalLink className="h-3 w-3 ml-1" />
															</Button>
														))}
													</div>
												)}
												<p className="text-xs text-zinc-400 mt-2">
													{new Date(msg.createdAt).toLocaleString()}
												</p>
											</div>
										</div>
									))}
									<div ref={messagesEndRef} />
								</div>
							</ScrollArea>
							</div>

							{/* Input Area */}
							{selectedTicket.status !== 'closed' && (
								<div className="mt-4 space-y-3 shrink-0">
									{files.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{files.map((file, idx) => (
												<div key={idx} className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm">
													<FileText className="h-4 w-4" />
													<span className="truncate max-w-[150px]">{file.name}</span>
													<button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}>
														<X className="h-4 w-4" />
													</button>
												</div>
											))}
										</div>
									)}
									<div className="flex gap-2">
										<Textarea
											value={newMessage}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
											placeholder="Type your message..."
											className="flex-1 bg-zinc-800 border-zinc-700 resize-none"
											rows={3}
										/>
										<div className="flex flex-col gap-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() => fileInputRef.current?.click()}
											>
												<Upload className="h-4 w-4" />
											</Button>
											<Button
												onClick={handleSendMessage}
												disabled={isSending}
												className="bg-blue-600 hover:bg-blue-700"
											>
												{isSending ? "Sending..." : "Send"}
											</Button>
										</div>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											className="hidden"
											accept="image/*,video/*,.pdf,.doc,.docx,.txt"
											onChange={handleFileSelect}
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MyTicketsPage;
