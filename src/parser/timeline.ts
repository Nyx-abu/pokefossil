import { Pokemon } from './types';

export type Confidence = 'High' | 'Medium' | 'Low';

export interface JourneyEvent {
    type: 'CAPTURE' | 'BADGE' | 'HOF';
    title: string;
    description: string;
    confidence: Confidence;
    orderHeuristic: number;
    pokemon?: Pokemon;
}

export function estimateJourney(pokemonList: Pokemon[]): JourneyEvent[] {
    const events: JourneyEvent[] = [];

    for (const p of pokemonList) {
        // High confidence for starters (level 5)
        let confidence: Confidence = 'Medium';
        if (p.metLevel === 5 && isStarter(p.species)) {
            confidence = 'High';
        }

        events.push({
            type: 'CAPTURE',
            title: `Caught ${p.nickname || 'Pokemon'}`,
            description: `Met at level ${p.metLevel}.`,
            confidence,
            orderHeuristic: p.metLevel, // Roughly order by met level
            pokemon: p
        });
    }

    // Sort by met level
    events.sort((a, b) => a.orderHeuristic - b.orderHeuristic);

    // TODO: Parse Hall of fame and badges from Game State block
    return events;
}

function isStarter(species: number): boolean {
    const starters = [1, 4, 7, 152, 155, 158, 252, 255, 258];
    return starters.includes(species);
}
