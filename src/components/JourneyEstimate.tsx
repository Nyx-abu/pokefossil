import React from 'react';
import { useStore } from '../store';
import { Confidence } from '../parser/timeline';

export const JourneyEstimate: React.FC = () => {
    const { timeline, setScreen } = useStore();

    return (
        <div className="flex flex-col h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4 flex-shrink-0">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline">&larr; Back to Dashboard</button>
                <h1 className="text-xl font-bold">Journey Estimate</h1>
            </div>

            <div className="bg-[#1A1815] border border-gray-700 p-4 rounded mb-6 flex-shrink-0">
                <p className="text-sm text-gray-400">
                    Order inferred from met-level; this Pokémon could have been caught earlier and leveled less.
                </p>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin py-8 px-4 relative flex items-center">
                <div className="absolute h-0.5 bg-gray-700 top-1/2 left-0 right-0 -z-10"></div>
                <div className="flex space-x-16">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-4 h-4 bg-gray-500 rounded-full mb-2"></div>
                        <span className="font-bold text-gray-500">Start</span>
                    </div>

                    {timeline.map((event, i) => (
                        <div key={i} className="flex flex-col items-center justify-center relative group" style={{ opacity: getOpacity(event.confidence) }}>
                            <div className="w-4 h-4 bg-[var(--color-brand-accent)] rounded-full mb-2"></div>
                            <span className="font-bold">{event.pokemon?.nickname || `Species ${event.pokemon?.species}`}</span>
                            <span className="text-xs text-gray-500">({event.confidence})</span>
                            
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-700 p-2 rounded text-xs z-20 whitespace-normal w-48 text-center pointer-events-none">
                                {event.description}
                                {event.confidence !== 'High' && (
                                    <div className="mt-1 text-amber-500">Order inferred from met-level; could be inaccurate.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function getOpacity(confidence: Confidence): number {
    switch (confidence) {
        case 'High': return 1;
        case 'Medium': return 0.7;
        case 'Low': return 0.4;
    }
}
