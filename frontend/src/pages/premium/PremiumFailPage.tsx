import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
const PremiumFailPage = () => {
	const navigate = useNavigate();
	const { dbUser } = useAuthStore();
	useEffect(() => {
		if (dbUser?.premium) {
			navigate('/premium');
		}
	}, [dbUser, navigate]);
	return (
		<div className='h-full flex items-center justify-center px-4'>
			<div className='max-w-2xl w-full'>
				<div className='bg-gradient-to-br from-red-900/30 to-zinc-900 border-2 border-red-500/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-red-500/20 text-center space-y-8'>
					<div className='flex justify-center'>
						<div className='w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center'>
							<XCircle className='w-16 h-16 text-white' />
						</div>
					</div>
					<div className='space-y-4'>
						<h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent pb-2'>
							something went wrong
						</h1>
						<p className='text-xl text-zinc-300'>
							please try again
						</p>
					</div>
					<div className='space-y-4 pt-8'>
						<Button
							onClick={() => navigate('/premium')}
							className='w-full h-14 text-lg font-bold bg-gradient-to-r from-[#e8ecf3] to-[#d4dce8] hover:from-[#d4dce8] hover:to-[#c0cbd9] text-black rounded-xl shadow-lg shadow-[#e8ecf3]/30 transition-all duration-300 hover:scale-105'
						>
							try again
						</Button>
						<Button
							onClick={() => navigate('/')}
							variant='ghost'
							className='w-full h-12 text-zinc-400 hover:text-white hover:bg-zinc-800'
						>
							go back to home
						</Button>
					</div>
					<div className='pt-8 border-t border-zinc-800'>
						<p className='text-sm text-zinc-500'>
							if the problem persists, please contact our support team.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PremiumFailPage;