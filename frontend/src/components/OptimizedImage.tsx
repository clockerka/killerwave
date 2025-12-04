import { useState, useEffect, useRef } from "react";

interface OptimizedImageProps {
	src: string;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	priority?: boolean;
}

const OptimizedImage = ({
	src,
	alt,
	className = "",
	width,
	height,
	priority = false
}: OptimizedImageProps) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(priority);
	const imgRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		if (priority) return; // Skip lazy loading for priority images

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsInView(true);
						observer.disconnect();
					}
				});
			},
			{ rootMargin: "50px" }
		);

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, [priority]);

	return (
		<div className={`relative ${className}`} ref={imgRef}>
			{!isLoaded && (
				<div className="absolute inset-0 bg-zinc-800 animate-pulse" />
			)}
			{isInView && (
				<img
					src={src}
					alt={alt}
					width={width}
					height={height}
					loading={priority ? "eager" : "lazy"}
					decoding="async"
					className={`${className} transition-opacity duration-300 ${
						isLoaded ? "opacity-100" : "opacity-0"
					}`}
					onLoad={() => setIsLoaded(true)}
				/>
			)}
		</div>
	);
};

export default OptimizedImage;

