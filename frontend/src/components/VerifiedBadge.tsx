interface VerifiedBadgeProps {
	verified?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg';
	className?: string;
}
export const VerifiedBadge = ({ verified, size = 'sm', className = '' }: VerifiedBadgeProps) => {
	if (!verified) return null;
	const sizeMap = {
		xs: 14,
		sm: 16,
		md: 20,
		lg: 32,
	};
	const iconSize = sizeMap[size];
	return (
		<span title="verified artist" className={`inline-flex items-center mt-1 ${className}`}>
			<svg
				width={iconSize}
				height={iconSize}
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="12" cy="12" r="10" fill="#3b82f6" />
				<path
					d="M9 12L11 14L15 10"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</span>
	);
};