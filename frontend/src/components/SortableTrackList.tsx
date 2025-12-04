import { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { ArtistLinks } from '@/components/ArtistLinks';
import { Button } from './ui/button';
interface Track {
	_id: string;
	title: string;
	artists?: any[];
	imageUrl?: string;
	duration?: number;
}
interface SortableTrackListProps {
	tracks: Track[];
	onReorder: (reorderedTracks: Track[]) => void;
	onDelete?: (trackId: string) => void;
}
export const SortableTrackList = ({ tracks, onReorder, onDelete }: SortableTrackListProps) => {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null) return;
		setDragOverIndex(index);
	};
	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) {
			setDraggedIndex(null);
			setDragOverIndex(null);
			return;
		}
		const newTracks = [...tracks];
		const [removed] = newTracks.splice(draggedIndex, 1);
		newTracks.splice(dropIndex, 0, removed);
		onReorder(newTracks);
		setDraggedIndex(null);
		setDragOverIndex(null);
	};
	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};
	const formatDuration = (seconds?: number) => {
		if (!seconds) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};
	return (
		<div className='space-y-1'>
			{tracks.map((track, index) => (
				<div
					key={track._id}
					draggable
					onDragStart={() => handleDragStart(index)}
					onDragOver={(e) => handleDragOver(e, index)}
					onDrop={(e) => handleDrop(e, index)}
					onDragEnd={handleDragEnd}
			className={`group flex items-center gap-3 p-2 rounded-md transition-all cursor-move
				${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
				${dragOverIndex === index ? 'bg-purple-500/20' : 'hover:bg-zinc-800/50'}
			`}
				>
					<GripVertical className='h-4 w-4 text-zinc-500 flex-shrink-0' />
					<span className='w-6 text-zinc-400 text-sm'>{index + 1}</span>
					{track.imageUrl && (
						<img src={track.imageUrl} alt={track.title} className='w-10 h-10 rounded object-cover flex-shrink-0' />
					)}
				<div className='flex-1 min-w-0'>
					<div className='font-medium text-sm truncate'>{track.title}</div>
					{track.artists && (
						<ArtistLinks artists={track.artists} className='text-xs text-zinc-400' />
					)}
				</div>
				<span className='text-sm text-zinc-400 flex-shrink-0'>{formatDuration(track.duration)}</span>
				{onDelete && (
					<Button
						variant='ghost'
						size='sm'
						onClick={(e) => {
							e.stopPropagation();
							onDelete(track._id);
						}}
						className='opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-400/10 flex-shrink-0'
					>
						<X className='h-4 w-4' />
					</Button>
				)}
			</div>
			))}
		</div>
	);
};