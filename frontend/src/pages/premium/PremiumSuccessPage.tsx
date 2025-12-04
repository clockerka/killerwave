import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@/lib/axios';
const PremiumSuccessPage = () => {
	const { fetchUser } = useAuthStore();
	const navigate = useNavigate();
	const [isVerifying, setIsVerifying] = useState(true);
	const [verificationFailed, setVerificationFailed] = useState(false);
	useEffect(() => {
		const verifyAndFetchUser = async () => {
			try {
				console.log('Verifying payment...');

				// Ждем немного для обработки webhook
				await new Promise(resolve => setTimeout(resolve, 3000));

				// Проверяем статус оплаты
				await axiosInstance.get('/payments/check-yookassa');
				const verifyResponse = await axiosInstance.get('/payments/verify');
				console.log('verification response:', verifyResponse.data);

				if (!verifyResponse.data.premium) {
					console.error('Payment not verified');
					setVerificationFailed(true);
					setTimeout(() => navigate('/premium'), 3000);
					return;
				}

				await fetchUser();
				setIsVerifying(false);
			} catch (error) {
				console.error('error:', error);
				setVerificationFailed(true);
				setTimeout(() => navigate('/premium'), 3000);
			}
		};
		verifyAndFetchUser();
	}, [fetchUser, navigate]);
	if (isVerifying) {
		return (
			<div className='h-full flex items-center justify-center px-4'>
				<div className='text-center space-y-4'>
					<Loader2 className='w-16 h-16 mx-auto text-blue-400 animate-spin' />
					<p className='text-xl text-zinc-300'>verifying your payment...</p>
				</div>
			</div>
		);
	}
	if (verificationFailed) {
		return (
			<div className='h-full flex items-center justify-center px-4'>
				<div className='max-w-2xl w-full text-center space-y-6'>
					<div className='w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center'>
						<ExternalLink className='w-10 h-10 text-white' />
					</div>
					<h1 className='text-4xl md:text-5xl font-bold text-red-400 pb-2'>
						payment not verified
					</h1>
					<p className='text-xl text-zinc-300'>
						redirecting you back to premium page...
					</p>
				</div>
			</div>
		);
	}
	return (
		<div className='h-full flex items-center justify-center px-4'>
			<div className='max-w-2xl w-full'>
				<div className='bg-gradient-to-br from-purple-900/50 to-zinc-900 border-2 border-purple-500/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-500/20 text-center space-y-8'>
					<div className='flex justify-center'>
						<div className='w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
							<CheckCircle className='w-16 h-16 text-white' />
						</div>
					</div>
					<div className='space-y-4'>
						<h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-2'>
							thank you for your purchase!
						</h1>
						<p className='text-xl text-zinc-300'>
							now you can listen to music without restrictions!
						</p>
					</div>
					<div className='space-y-4 pt-8'>
						<p className='text-lg text-zinc-400'>
							to get your role in the group, join it via the link:
						</p>
						<a
							href='https://t.me/+yiKVYaAcWZoxYzMy'
							target='_blank'
							rel='noopener noreferrer'
							className='inline-block w-full'
						>
							<Button
								className='w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105'
							>
								<ExternalLink className='w-5 h-5 mr-2' />
								join telegram group
							</Button>
						</a>
					</div>
					<div className='pt-8 border-t border-zinc-800'>
						<p className='text-sm text-zinc-500'>
							enjoy your premium experience! if you have any questions, feel free to reach out in the telegram group.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PremiumSuccessPage;