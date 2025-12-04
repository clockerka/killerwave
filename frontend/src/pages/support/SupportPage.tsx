import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Upload, X, FileText, Image, Video, MessageCircle } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SupportPage = () => {
	const { dbUser } = useAuthStore();
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState({
		category: "",
		description: "",
	});
	const [files, setFiles] = useState<File[]>([]);
	const [dragActive, setDragActive] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	useEffect(() => {
		// Give some time for auth to initialize
		const timer = setTimeout(() => {
			setIsCheckingAuth(false);
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	if (isCheckingAuth) {
		return (
			<div className='h-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-zinc-400'>loading...</p>
				</div>
			</div>
		);
	}

	if (!dbUser) {
		return (
			<div className='h-full flex items-center justify-center'>
				<Card className="p-8 text-center bg-zinc-900 border-zinc-800">
					<h2 className="text-2xl font-bold mb-4">sign in required</h2>
					<p className="text-zinc-400 mb-6">please sign in to access support</p>
					<Button onClick={() => navigate("/")}>go to home</Button>
				</Card>
			</div>
		);
	}

	const categories = [
		{ value: "link-account-to-artist", label: "link account to artist" },
		{ value: "dmca", label: "dmca" },
		{ value: "bugs", label: "bugs" },
		{ value: "government", label: "government" },
		{ value: "other", label: "other" },
	];

	const getWarningMessage = (category: string) => {
		switch (category) {
			case "dmca":
				return "please provide proofs that you own content you want to delete";
			case "link-account-to-artist":
				return "please provide proofs that you are artist you want to link to your account";
			case "bugs":
				return "please provide video when we can see bug";
			case "government":
				return "please provide proofs that you are government representative";
			default:
				return "";
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const droppedFiles = Array.from(e.dataTransfer.files);
		handleFiles(droppedFiles);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const selectedFiles = Array.from(e.target.files);
			handleFiles(selectedFiles);
		}
	};

	const handleFiles = (newFiles: File[]) => {
		const validFiles = newFiles.filter(file => {
			const isValid = file.size <= 50 * 1024 * 1024; // 50MB limit
			if (!isValid) {
				toast.error(`file ${file.name} is too large (max 50mb)`);
			}
			return isValid;
		});

		setFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 files
	};

	const removeFile = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index));
	};

	const getFileIcon = (file: File) => {
		if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
		if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
		return <FileText className="h-4 w-4" />;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.category || !formData.description.trim()) {
			toast.error("please fill in all required fields");
			return;
		}

		setIsSubmitting(true);

		try {
			const submitData = new FormData();
			submitData.append('category', formData.category);
			submitData.append('description', formData.description);

			files.forEach(file => {
				submitData.append('files', file);
			});

			await axiosInstance.post('/support/tickets', submitData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			toast.success("support ticket submitted successfully!");
			setFormData({ category: "", description: "" });
			setFiles([]);
		} catch (error: any) {
			console.error("Error submitting support ticket:", error);
			toast.error(error.response?.data?.message || "failed to submit support ticket");
		} finally {
			setIsSubmitting(false);
		}
	};

	const warningMessage = getWarningMessage(formData.category);

	return (
		<div className="h-full bg-gradient-to-b from-zinc-900 to-black">
			<div className="h-full overflow-y-auto">
				<div className="p-6">
					<div className="max-w-4xl mx-auto">
						<div className="mb-8 flex items-center justify-between">
							<div>
								<h1 className="text-4xl font-bold mb-2">support center</h1>
								<p className="text-zinc-400">need help? submit a support ticket and we'll get back to you.</p>
							</div>
							<Button
								variant="outline"
								onClick={() => navigate("/support/my-tickets")}
								className="flex items-center gap-2"
							>
								<MessageCircle className="h-4 w-4" />
								my tickets
							</Button>
						</div>

					<Card className="p-8 bg-zinc-900/50 border-zinc-800">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Category Selection */}
							<div>
								<Label htmlFor="category" className="text-sm font-medium mb-2 block">
									category <span className="text-red-400">*</span>
								</Label>
								<Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
									<SelectTrigger className="bg-zinc-800 border-zinc-700">
										<SelectValue placeholder="select a category" />
									</SelectTrigger>
									<SelectContent className="bg-zinc-800 border-zinc-700">
										{categories.map(category => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Warning Message */}
							{warningMessage && (
							<div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium text-red-200 mb-1">attention!</p>
									<p className="text-red-300 text-sm">{warningMessage}</p>
								</div>
							</div>
						)}

						{/* File Upload */}
						<div>
							<Label className="text-sm font-medium mb-2 block">
								attachments
							</Label>
							<div
								className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
									dragActive 
										? "border-blue-500 bg-blue-500/10" 
										: "border-zinc-700 hover:border-zinc-600"
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<Upload className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
								<p className="text-zinc-400 mb-2">
									drag & drop files here, or{" "}
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="text-blue-400 hover:text-blue-300 underline"
									>
										browse
									</button>
								</p>
								<p className="text-xs text-zinc-500">
									max 50mb per file, 10 files total. supports images, videos, and documents.
								</p>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									className="hidden"
									accept="image/*,video/*,.pdf,.doc,.docx,.txt"
									onChange={handleFileSelect}
								/>
							</div>

							{/* File List */}
							{files.length > 0 && (
								<div className="mt-4 space-y-2">
									{files.map((file, index) => (
										<div
											key={index}
											className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg"
										>
											{getFileIcon(file)}
											<span className="flex-1 text-sm truncate">{file.name}</span>
											<span className="text-xs text-zinc-400">
												{(file.size / 1024 / 1024).toFixed(1)} MB
											</span>
											<button
												type="button"
												onClick={() => removeFile(index)}
												className="text-red-400 hover:text-red-300"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Description */}
						<div>
							<Label htmlFor="description" className="text-sm font-medium mb-2 block">
								description <span className="text-red-400">*</span>
							</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
								placeholder="please describe your issue in detail..."
								className="min-h-[150px] bg-zinc-800 border-zinc-700 resize-none"
								required
							/>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-blue-600 hover:bg-blue-700 px-8"
							>
								{isSubmitting ? "submitting..." : "submit ticket"}
							</Button>
						</div>
					</form>
				</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SupportPage;
