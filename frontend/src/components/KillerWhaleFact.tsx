import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const killerWhaleFacts = [
	"Killer whales are actually dolphins, not whales. They're the largest members of the dolphin family.",
	"Orcas are found in all the world's oceans, from the Arctic to the Antarctic.",
	"A killer whale can swim at speeds of up to 56 km/h (34.8 mph).",
	"Orcas have the second-largest brain of any marine mammal, weighing up to 6.8 kg (15 lb).",
	"Each killer whale pod has its own unique dialect of calls that members use to communicate.",
	"Orcas can live for 50-80 years in the wild, with females typically living longer than males.",
	"A male orca's dorsal fin can grow up to 1.8 meters (6 feet) tall.",
	"Killer whales are apex predators and have no natural predators in the ocean.",
	"Orcas hunt in coordinated packs and use sophisticated hunting techniques.",
	"Different orca populations have different diets - some eat fish, others prefer seals or even other whales.",
	"Baby orcas are born after a 17-month gestation period and can weigh up to 180 kg (400 lb).",
	"Orcas are highly social animals and live in matriarchal family groups called pods.",
	"An orca's distinctive black and white coloring helps them camouflage while hunting.",
	"Killer whales can eat up to 227 kg (500 lb) of food per day.",
	"Orcas have been observed teaching their young hunting techniques, showing cultural transmission.",
	"The name 'killer whale' comes from ancient sailors who saw them hunting larger whales.",
	"Orcas can dive to depths of over 100 meters (330 feet) while hunting.",
	"Each orca has a unique pattern of white and gray markings called a saddle patch behind its dorsal fin.",
	"Killer whales sleep by resting one half of their brain at a time, staying partially conscious.",
	"Orcas have been known to swim over 160 km (100 miles) in a single day.",
];

const KillerWhaleFact = () => {
	const [fact, setFact] = useState('');

	useEffect(() => {
		// Get random fact on component mount
		const randomFact = killerWhaleFacts[Math.floor(Math.random() * killerWhaleFacts.length)];
		setFact(randomFact);

		// Change fact every 30 seconds
		const interval = setInterval(() => {
			const newRandomFact = killerWhaleFacts[Math.floor(Math.random() * killerWhaleFacts.length)];
			setFact(newRandomFact);
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	if (!fact) return null;

	return (
		<div className='mb-8'>
			<Card className='bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-500/20 hover:from-cyan-500/30 hover:via-blue-600/30 hover:to-indigo-500/30 transition-all duration-300 border-cyan-500/30 overflow-hidden shadow-lg'>
				<CardContent className='p-6'>
					<div className='flex items-start gap-4'>
						<div className='text-4xl'>🐋</div>
						<div className='flex-1'>
							<h3 className='text-lg font-bold text-cyan-400 mb-2'>killer whale fact</h3>
							<p className='text-zinc-200 leading-relaxed'>{fact}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default KillerWhaleFact;

