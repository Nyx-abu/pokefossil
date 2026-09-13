import React, { useState, useEffect } from 'react';
import { getNationalDexId } from '../utils/speciesMapping';

/**
 * High-definition pixel-art SVG data URI of MissingNo / glitch block fallback.
 * Works completely offline without external network dependencies.
 */
export const MISSINGNO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" shape-rendering="crispEdges"><rect x="0" y="0" width="48" height="48" fill="%2314121c" rx="4"/><rect x="2" y="2" width="44" height="44" fill="%23201b2f" rx="3"/><rect x="6" y="6" width="4" height="6" fill="%238c7bc4"/><rect x="6" y="14" width="4" height="4" fill="%23e056fd"/><rect x="6" y="20" width="4" height="8" fill="%232b2638"/><rect x="6" y="30" width="4" height="4" fill="%23ffffff"/><rect x="6" y="36" width="4" height="6" fill="%23686de0"/><rect x="10" y="8" width="4" height="4" fill="%2338a3a5"/><rect x="10" y="16" width="4" height="8" fill="%238c7bc4"/><rect x="10" y="26" width="4" height="4" fill="%23e09f3e"/><rect x="10" y="32" width="4" height="6" fill="%232b2638"/><rect x="20" y="10" width="14" height="4" fill="%23ffffff"/><rect x="18" y="12" width="4" height="6" fill="%23ffffff"/><rect x="32" y="12" width="4" height="8" fill="%23ffffff"/><rect x="28" y="18" width="4" height="6" fill="%23ffffff"/><rect x="24" y="22" width="4" height="6" fill="%23ffffff"/><rect x="24" y="32" width="4" height="4" fill="%23ffffff"/><rect x="16" y="14" width="2" height="4" fill="%23ff0055" opacity="0.8"/><rect x="36" y="12" width="2" height="8" fill="%2300ffff" opacity="0.8"/><rect x="22" y="22" width="2" height="6" fill="%23ff0055" opacity="0.8"/><rect x="28" y="22" width="2" height="6" fill="%2300ffff" opacity="0.8"/><rect x="22" y="32" width="2" height="4" fill="%23ff0055" opacity="0.8"/><rect x="28" y="32" width="2" height="4" fill="%2300ffff" opacity="0.8"/><rect x="38" y="6" width="4" height="8" fill="%238c7bc4"/><rect x="38" y="16" width="4" height="4" fill="%23ffffff"/><rect x="38" y="22" width="4" height="8" fill="%23e056fd"/><rect x="38" y="32" width="4" height="6" fill="%2338a3a5"/><rect x="14" y="40" width="6" height="2" fill="%238c7bc4"/><rect x="22" y="40" width="8" height="2" fill="%2300ffff"/><rect x="32" y="40" width="6" height="2" fill="%23ff0055"/></svg>`;

export interface PokemonSpriteProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    species?: number | null;
    fallbackSrc?: string;
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
    species,
    alt,
    className = '',
    style,
    fallbackSrc = MISSINGNO_SVG,
    onError,
    ...rest
}) => {
    const nationalId = typeof species === 'number' && !isNaN(species) ? getNationalDexId(species) : 0;
    const isValid = nationalId > 0 && nationalId <= 1025;
    
    const defaultUrl = isValid
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`
        : fallbackSrc;

    const [imgSrc, setImgSrc] = useState<string>(defaultUrl);
    const [hasFailed, setHasFailed] = useState<boolean>(!isValid);

    useEffect(() => {
        if (isValid) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`);
            setHasFailed(false);
        } else {
            setImgSrc(fallbackSrc);
            setHasFailed(true);
        }
    }, [nationalId, isValid, fallbackSrc]);

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasFailed) {
            setHasFailed(true);
            setImgSrc(fallbackSrc);
        }
        if (onError) {
            onError(e);
        }
    };

    const resolvedAlt = alt || (isValid ? `Pokemon #${nationalId}` : 'MissingNo');

    return (
        <img
            src={imgSrc}
            alt={resolvedAlt}
            onError={handleImgError}
            className={`pixelated object-contain ${className}`}
            style={{
                imageRendering: 'pixelated',
                ...style,
            }}
            {...rest}
        />
    );
};
