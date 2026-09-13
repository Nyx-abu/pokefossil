import { describe, it, expect } from 'vitest';
import { MISSINGNO_SVG } from './PokemonSprite';

describe('PokemonSprite', () => {
    it('defines a valid offline MissingNo SVG data URI', () => {
        expect(MISSINGNO_SVG).toContain('data:image/svg+xml');
        expect(MISSINGNO_SVG).toContain('crispEdges');
        expect(MISSINGNO_SVG.length).toBeGreaterThan(100);
    });

    it('identifies valid vs invalid species IDs correctly', () => {
        const checkValid = (species?: number | null) => 
            typeof species === 'number' && !isNaN(species) && species > 0 && species <= 1025;

        // Valid PokeAPI species IDs
        expect(checkValid(1)).toBe(true);    // Bulbasaur
        expect(checkValid(25)).toBe(true);   // Pikachu
        expect(checkValid(1025)).toBe(true); // Pecharunt

        // Invalid species IDs that should immediately fallback to MissingNo
        expect(checkValid(0)).toBe(false);
        expect(checkValid(-1)).toBe(false);
        expect(checkValid(NaN)).toBe(false);
        expect(checkValid(null)).toBe(false);
        expect(checkValid(undefined)).toBe(false);
        expect(checkValid(9999)).toBe(false);
    });
});
