import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Users, MessageCircle, Music, CreditCard, Bitcoin } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
const PremiumPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedMethod, setSelectedMethod] = useState<'card' | 'crypto'>('card');
	const [selectedPlan, setSelectedPlan] = useState<'daily' | 'yearly'>('yearly');
	const [isCancelling, setIsCancelling] = useState(false);
	const { dbUser, fetchUser } = useAuthStore();
	const features = [
		{
			icon: <Music className='w-8 h-8' />,
			title: 'unlimited music streaming',
			description: 'listen to your favorite tracks without any restrictions, anytime, anywhere',
		},
		{
			icon: <Users className='w-8 h-8' />,
			title: 'support the creators',
			description: 'help us continue building amazing features and maintaining the platform',
		},
		{
			icon: <MessageCircle className='w-8 h-8' />,
			title: 'exclusive telegram role',
			description: 'get special access and role in our premium telegram community',
		},
		{
			icon: <Sparkles className='w-8 h-8' />,
			title: 'premium experience',
			description: 'enjoy an ad-free, enhanced music streaming experience',
		},
	];
	const handleBuyPremium = async () => {
		try {
			setIsLoading(true);
			console.log('Creating payment invoice with method:', selectedMethod, 'plan:', selectedPlan);
			const response = await axiosInstance.post('/payments/create-invoice', {
				paymentMethod: selectedMethod,
				plan: selectedPlan
			});
			console.log('Payment response:', response.data);
			if (response.data.payUrl) {
				console.log('Redirecting to payment page:', response.data.payUrl);
				window.location.href = response.data.payUrl;
			} else {
				console.error('No payment URL in response:', response.data);
				toast.error('no payment url received');
			}
		} catch (error: any) {
			console.error('Error creating payment:', error);
			const errorMessage = error.response?.data?.error || error.response?.data?.message || 'failed to create payment';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelSubscription = async () => {
		if (!confirm('Are you sure you want to cancel your subscription?')) {
			return;
		}
		try {
			setIsCancelling(true);
			await axiosInstance.post('/payments/cancel-subscription');
			toast.success('Subscription cancelled successfully');
			await fetchUser();
		} catch (error: any) {
			console.error('Error cancelling subscription:', error);
			toast.error(error.response?.data?.message || 'failed to cancel subscription');
		} finally {
			setIsCancelling(false);
		}
	};
	if (dbUser?.premium) {
		return (
			<div className='h-full flex items-center justify-center px-4'>
				<div className='max-w-2xl w-full text-center space-y-6'>
					<div className='w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
						<Sparkles className='w-10 h-10 text-white' />
					</div>
					<h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-2'>
						you're already premium!
					</h1>
					<p className='text-xl text-zinc-300'>
						thank you for your support! enjoy unlimited music streaming.
					</p>
					<div className='pt-8 space-y-4'>
						<p className='text-lg text-zinc-400'>
							join our telegram group:
						</p>
						<a
							href='https://t.me/+yiKVYaAcWZoxYzMy'
							target='_blank'
							rel='noopener noreferrer'
							className='inline-block'
						>
							<Button
								className='h-14 px-8 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105'
							>
								<MessageCircle className='w-5 h-5 mr-2' />
								join telegram group
							</Button>
						</a>
						<div className='pt-4'>
							<Button
								onClick={handleCancelSubscription}
								disabled={isCancelling}
								variant='outline'
								className='h-12 px-6 text-red-400 border-red-400 hover:bg-red-400/10'
							>
								{isCancelling ? 'cancelling...' : 'cancel subscription'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className='h-full overflow-y-auto'>
			<div className='min-h-full bg-gradient-to-b from-purple-900/20 via-zinc-900 to-zinc-900'>
				<div className='relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent' />
					<div className='relative max-w-7xl mx-auto px-4 py-20 sm:py-32'>
						<div className='text-center space-y-8'>
							<div className='inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30'>
								<Sparkles className='w-5 h-5 text-purple-400' />
								<span className='text-purple-300 font-medium'>premium membership</span>
							</div>
							<h1 className='text-6xl md:text-8xl font-bold leading-tight pb-2'>
								<span className='block bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent pb-2'>
									buy premium,
								</span>
								<span className='block bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-2'>
									listen music
								</span>
							</h1>
							<p className='text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto'>
								unlock the ultimate music experience and join our exclusive community
							</p>
						</div>
					</div>
				</div>
				<div className='max-w-7xl mx-auto px-4 py-16'>
					<div className='grid md:grid-cols-2 gap-6 mb-16'>
						{features.map((feature, index) => (
							<div
								key={index}
								className='group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10'
							>
								<div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl' />
								<div className='relative space-y-4'>
									<div className='w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors'>
										{feature.icon}
									</div>
									<h3 className='text-2xl font-bold text-white'>{feature.title}</h3>
									<p className='text-zinc-400 leading-relaxed'>{feature.description}</p>
								</div>
							</div>
						))}
					</div>
					<div className='max-w-2xl mx-auto'>
						<div className='relative bg-gradient-to-br from-purple-900/50 to-zinc-900 border-2 border-purple-500/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-500/20'>
							<div className='absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full'>
								<span className='text-white font-bold text-sm'>best value</span>
							</div>
							<div className='text-center space-y-6 mb-8'>
								<h2 className='text-3xl font-bold text-white'>premium membership</h2>
							</div>

							{/* Plan Selection */}
							<div className='mb-8'>
								<p className='text-white font-semibold text-lg mb-4 text-center'>choose your plan:</p>
								<div className='grid grid-cols-2 gap-4'>
									<button
										onClick={() => setSelectedPlan('yearly')}
										className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
											selectedPlan === 'yearly'
												? 'border-purple-500 bg-purple-500/20'
												: 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
										}`}
									>
										<div className='flex flex-col items-center gap-3'>
											<div className='text-center'>
												<div className='font-bold text-white text-xl'>yearly</div>
												<div className='text-sm text-zinc-400 mt-1'>₽2,000 / year</div>
												<div className='text-xs text-purple-400 mt-1'>~5₽/day</div>
											</div>
										</div>
										{selectedPlan === 'yearly' && (
											<div className='absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center'>
												<Check className='w-3 h-3 text-white' />
											</div>
										)}
									</button>
									<button
										onClick={() => {
											setSelectedPlan('daily');
											setSelectedMethod('card');
										}}
										className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
											selectedPlan === 'daily'
												? 'border-purple-500 bg-purple-500/20'
												: 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
										}`}
									>
										<div className='flex flex-col items-center gap-3'>
											<div className='text-center'>
												<div className='font-bold text-white text-xl'>daily</div>
												<div className='text-sm text-zinc-400 mt-1'>₽7 / day</div>
												<div className='text-xs text-zinc-500 mt-1'>card only</div>
											</div>
										</div>
										{selectedPlan === 'daily' && (
											<div className='absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center'>
												<Check className='w-3 h-3 text-white' />
											</div>
										)}
									</button>
								</div>
							</div>
							{/* Payment Method Selection */}
							<div className='mb-8'>
								<p className='text-white font-semibold text-lg mb-4 text-center'>choose payment method:</p>
								<div className={`grid ${selectedPlan === 'yearly' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
									<button
										onClick={() => setSelectedMethod('card')}
										className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
											selectedMethod === 'card'
												? 'border-purple-500 bg-purple-500/20'
												: 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
										}`}
									>
										<div className='flex flex-col items-center gap-3'>
											<div className={`w-12 h-12 rounded-full flex items-center justify-center ${
												selectedMethod === 'card' ? 'bg-purple-500' : 'bg-zinc-800'
											}`}>
												<CreditCard className='w-6 h-6 text-white' />
											</div>
											<div className='text-center'>
												<div className='font-bold text-white'>card</div>
												<div className='text-sm text-zinc-400'>
													{selectedPlan === 'daily' ? '₽7 rub' : '₽2,000 rub'}
												</div>
											</div>
										</div>
										{selectedMethod === 'card' && (
											<div className='absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center'>
												<Check className='w-3 h-3 text-white' />
											</div>
										)}
									</button>
									{selectedPlan === 'yearly' && (
										<button
											onClick={() => setSelectedMethod('crypto')}
											className={`relative group p-6 rounded-xl border-2 transition-all duration-300 ${
												selectedMethod === 'crypto'
													? 'border-purple-500 bg-purple-500/20'
													: 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
											}`}
										>
											<div className='flex flex-col items-center gap-3'>
												<div className={`w-12 h-12 rounded-full flex items-center justify-center ${
													selectedMethod === 'crypto' ? 'bg-purple-500' : 'bg-zinc-800'
												}`}>
													<Bitcoin className='w-6 h-6 text-white' />
												</div>
												<div className='text-center'>
													<div className='font-bold text-white'>crypto</div>
													<div className='text-sm text-zinc-400'>$25 usd</div>
												</div>
											</div>
											{selectedMethod === 'crypto' && (
												<div className='absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center'>
													<Check className='w-3 h-3 text-white' />
												</div>
											)}
										</button>
									)}
								</div>
							</div>
							<div className='space-y-4 mb-8'>
								{[
									'unlimited music streaming',
									'support independent creators',
									'exclusive telegram community access',
									'premium role and benefits',
									'ad-free experience',
									'priority support',
								].map((feature, index) => (
									<div key={index} className='flex items-center gap-3'>
										<div className='w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0'>
											<Check className='w-4 h-4 text-white' />
										</div>
										<span className='text-zinc-300'>{feature}</span>
									</div>
								))}
							</div>
							<Button
								onClick={handleBuyPremium}
								disabled={isLoading}
								className='w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{isLoading ? (
									<div className='flex items-center gap-2'>
										<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
										processing...
									</div>
								) : (
									<div className='flex items-center gap-2'>
										<Sparkles className='w-6 h-6' />
										buy now
									</div>
								)}
							</Button>
							<p className='text-center text-sm text-zinc-500 mt-6'>
								{selectedMethod === 'card'
									? 'secure payment powered by yookassa'
									: 'secure payment powered by cryptocloud'
								}
							</p>
						</div>
					</div>
				</div>
				<div className='max-w-4xl mx-auto px-4 py-16 text-center'>
					<p className='text-zinc-500 text-sm'>
						by purchasing, you agree to our terms of service. payment is processed securely.
					</p>
				</div>
			</div>
		</div>
	);
};
export default PremiumPage;

