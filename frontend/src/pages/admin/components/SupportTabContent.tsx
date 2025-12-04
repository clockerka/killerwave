import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { Clock, FileText, Image, Video, ExternalLink, Lock, LockOpen, Upload, X, MessageCircle } from "lucide-react";

interface Attachment {
	url: string;
	type: string;
	originalName: string;
}

interface Message {
	_id: string;
	senderName: string;
	senderRole: string;
	message: string;
	attachments: Attachment[];
	createdAt: string;
}

interface SupportTicket {
	_id: string;
	userName: string;
	userEmail: string;
	category: string;
	description: string;
	status: string;
	attachments: Attachment[];
	messages: Message[];
	assignedTo?: {
		_id: string;
		fullName: string;
		email: string;
	};
	createdAt: string;
	lastResponseAt?: string;
}

const SupportTabContent = () => {
	const { isSuperAdmin } = useAuthStore();
	const [activeTab, setActiveTab] = useState("unassigned");
	const [subFilter, setSubFilter] = useState("all"); // for filtering in my/others tabs
	const [tickets, setTickets] = useState<SupportTicket[]>([]);
	const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const [newStatus, setNewStatus] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchTickets(activeTab);
		setSubFilter("all"); // Reset subfilter when changing tabs
	}, [activeTab]);

	useEffect(() => {
		if (selectedTicket && messagesEndRef.current) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			}, 100);
		}
	}, [selectedTicket?.messages, selectedTicket]);

	const fetchTickets = async (filter: string) => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get(`/support/tickets?filter=${filter}`);
			setTickets(response.data);
		} catch (error: any) {
			console.error("Error fetching tickets:", error);
			toast.error("Failed to fetch tickets");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchTicketDetails = async (ticketId: string) => {
		try {
			const response = await axiosInstance.get(`/support/tickets/${ticketId}`);
			setSelectedTicket(response.data);
			setNewStatus(response.data.status);
		} catch (error: any) {
			console.error("Error fetching ticket details:", error);
			toast.error("Failed to fetch ticket details");
		}
	};

	const handleReserveTicket = async (ticketId: string) => {
		try {
			await axiosInstance.post(`/support/tickets/${ticketId}/reserve`);
			toast.success("Ticket reserved");
			await fetchTickets(activeTab);
			if (selectedTicket?._id === ticketId) {
				await fetchTicketDetails(ticketId);
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to reserve ticket");
		}
	};

	const handleUnreserveTicket = async (ticketId: string) => {
		try {
			await axiosInstance.post(`/support/tickets/${ticketId}/unreserve`);
			toast.success("Ticket unreserved");
			await fetchTickets(activeTab);
			if (selectedTicket?._id === ticketId) {
				await fetchTicketDetails(ticketId);
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to unreserve ticket");
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
			toast.error("Failed to send message");
		} finally {
			setIsSending(false);
		}
	};

	const handleUpdateStatus = async () => {
		if (!selectedTicket || !newStatus) return;

		try {
			await axiosInstance.patch(`/support/tickets/${selectedTicket._id}`, { status: newStatus });
			toast.success("Status updated");
			await fetchTickets(activeTab);
			await fetchTicketDetails(selectedTicket._id);
		} catch {
			toast.error("Failed to update status");
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

	// Filter tickets by subFilter for my/others tabs
	const getFilteredTickets = () => {
		if ((activeTab === 'my' || activeTab === 'others') && subFilter !== 'all') {
			return tickets.filter(ticket => ticket.status === subFilter);
		}
		return tickets;
	};

	const filteredTickets = getFilteredTickets();

	if (isLoading && tickets.length === 0) {
		return (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-zinc-400">loading support tickets...</p>
					</div>
				</div>
		);
	}

	return (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="bg-zinc-800/50">
					<TabsTrigger value="unassigned">
						Unassigned
					</TabsTrigger>
					<TabsTrigger value="my">
						My Reserved
					</TabsTrigger>
					{isSuperAdmin && (
						<TabsTrigger value="others">
							Others' Tickets
						</TabsTrigger>
					)}
					{isSuperAdmin && (
						<TabsTrigger value="closed">
							All Closed
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value={activeTab} className="mt-6">
					{/* Subfilter for My Reserved and Others' Tickets */}
					{(activeTab === 'my' || activeTab === 'others') && (
						<div className="flex gap-2 mb-4 flex-wrap">
							<Button
								size="sm"
								variant={subFilter === 'all' ? 'default' : 'outline'}
								onClick={() => setSubFilter('all')}
							>
								All
							</Button>
							<Button
								size="sm"
								variant={subFilter === 'open' ? 'default' : 'outline'}
								onClick={() => setSubFilter('open')}
							>
								Open
							</Button>
							<Button
								size="sm"
								variant={subFilter === 'in-progress' ? 'default' : 'outline'}
								onClick={() => setSubFilter('in-progress')}
							>
								In Progress
							</Button>
							<Button
								size="sm"
								variant={subFilter === 'resolved' ? 'default' : 'outline'}
								onClick={() => setSubFilter('resolved')}
							>
								Resolved
							</Button>
							{/* Closed filter only for My Reserved for support agents */}
							{!isSuperAdmin && activeTab === 'my' && (
								<Button
									size="sm"
									variant={subFilter === 'closed' ? 'default' : 'outline'}
									onClick={() => setSubFilter('closed')}
								>
									Closed
								</Button>
							)}
						</div>
					)}

					<div className="grid grid-cols-1 gap-4">
						{filteredTickets.map((ticket) => (
									<Card
											key={ticket._id}
											className="p-6 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
											onClick={() => {
												setSelectedTicket(ticket);
												fetchTicketDetails(ticket._id);
											}}
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3 flex-wrap">
												<Badge className={getStatusColor(ticket.status)}>
													{ticket.status}
												</Badge>
												<Badge variant="outline">
													{getCategoryLabel(ticket.category)}
												</Badge>
												{ticket.assignedTo && (
														<Badge className="bg-purple-500 flex items-center gap-1">
															<Lock className="h-3 w-3" />
															{ticket.assignedTo.fullName}
														</Badge>
												)}
											</div>
											<div className="flex items-center text-sm text-zinc-400">
												<Clock className="h-4 w-4 mr-1" />
												{new Date(ticket.createdAt).toLocaleDateString()}
											</div>
										</div>

										<h3 className="font-medium mb-2">{ticket.userName}</h3>
										<p className="text-sm text-zinc-400 mb-2">{ticket.userEmail}</p>
										<p className="text-sm line-clamp-2 mb-3">{ticket.description}</p>

										<div className="flex items-center gap-4 text-sm text-zinc-400">
											<div className="flex items-center gap-1">
												<MessageCircle className="h-4 w-4" />
												{ticket.messages?.length || 0} messages
											</div>
											{ticket.attachments.length > 0 && (
													<div className="flex items-center gap-1">
														<FileText className="h-4 w-4" />
														{ticket.attachments.length} attachments
													</div>
											)}
										</div>

										{activeTab === 'unassigned' && (
												<div className="mt-4">
													<Button
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleReserveTicket(ticket._id);
															}}
															className="bg-purple-500 hover:bg-purple-600"
													>
														<Lock className="h-4 w-4 mr-1" />
														Reserve Ticket
													</Button>
												</div>
										)}

										{(activeTab === 'my' || activeTab === 'others') && ticket.assignedTo && (
												<div className="mt-4">
													<Button
															size="sm"
															variant="outline"
															onClick={(e) => {
																e.stopPropagation();
																handleUnreserveTicket(ticket._id);
															}}
													>
														<LockOpen className="h-4 w-4 mr-1" />
														Unreserve
													</Button>
												</div>
										)}
							</Card>
						))}

						{filteredTickets.length === 0 && (
							<Card className="p-12 text-center bg-zinc-900/50 border-zinc-800">
								<p className="text-zinc-400">No tickets in this category</p>
							</Card>
						)}
						</div>
					</TabsContent>
				</Tabs>

				{/* Ticket Dialog with Chat */}
				<Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
					<DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl h-[80vh] flex flex-col">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3 flex-wrap">
								<Badge className={getStatusColor(selectedTicket?.status || '')}>
									{selectedTicket?.status}
								</Badge>
								<span>{getCategoryLabel(selectedTicket?.category || '')}</span>
								{selectedTicket?.assignedTo && (
										<Badge className="bg-purple-500 flex items-center gap-1">
											<Lock className="h-3 w-3" />
											{selectedTicket.assignedTo.fullName}
										</Badge>
								)}
							</DialogTitle>
						</DialogHeader>

						{selectedTicket && (
								<div className="flex-1 flex flex-col overflow-hidden min-h-0">
									{/* Original Message */}
									<div className="mb-4 p-4 bg-zinc-800/50 rounded-lg shrink-0">
										<div className="flex items-center justify-between mb-2">
											<div>
												<p className="font-medium">{selectedTicket.userName}</p>
												<p className="text-sm text-zinc-400">{selectedTicket.userEmail}</p>
											</div>
											<div className="flex gap-2">
												<Select value={newStatus} onValueChange={setNewStatus}>
													<SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700">
														<SelectValue />
													</SelectTrigger>
													<SelectContent className="bg-zinc-800 border-zinc-700">
														<SelectItem value="open">Open</SelectItem>
														<SelectItem value="in-progress">In Progress</SelectItem>
														<SelectItem value="resolved">Resolved</SelectItem>
														<SelectItem value="closed">Closed</SelectItem>
													</SelectContent>
												</Select>
												<Button size="sm" onClick={handleUpdateStatus}>Update</Button>
											</div>
										</div>
										<p className="text-sm text-zinc-300 mb-2">{selectedTicket.description}</p>
										{selectedTicket.attachments.length > 0 && (
												<div className="flex flex-wrap gap-2">
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

									{/* Chat Messages */}
									<div className="flex-1 min-h-0 flex flex-col">
										<ScrollArea className="flex-1 pr-4">
											<div className="space-y-4 pb-4">
												{selectedTicket.messages.map((msg) => (
														<div
																key={msg._id}
																className={`flex ${msg.senderRole === 'user' ? 'justify-start' : 'justify-end'}`}
														>
														<div className={`max-w-[70%] ${msg.senderRole === 'user' ? 'bg-zinc-800' : 'bg-blue-600'} rounded-lg p-4`}>
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
															placeholder="Type your response..."
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

export default SupportTabContent;
