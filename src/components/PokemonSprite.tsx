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
    trim?: boolean;
}

const trimCache = new Map<string, string>();

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
    species,
    alt,
    className = '',
    style,
    fallbackSrc = MISSINGNO_SVG,
    trim = false,
    onError,
    ...rest
}) => {
    const nationalId = typeof species === 'number' && !isNaN(species) ? getNationalDexId(species) : 0;
    const isValid = nationalId > 0 && nationalId <= 1025;
    
    // Prefer authentic Gen 3 FireRed/LeafGreen sprites for Gen 1-3, with modern PokeAPI fallback
    const defaultUrl = isValid
        ? (nationalId <= 386 
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${nationalId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`)
        : fallbackSrc;

    const [imgSrc, setImgSrc] = useState<string>(() => {
        if (trim && isValid && trimCache.has(defaultUrl)) {
            return trimCache.get(defaultUrl)!;
        }
        return defaultUrl;
    });
    const [hasFailed, setHasFailed] = useState<boolean>(!isValid);

    useEffect(() => {
        if (!isValid) {
            setImgSrc(fallbackSrc);
            setHasFailed(true);
            return;
        }

        const sourceUrl = nationalId <= 386
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${nationalId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`;

        if (trim) {
            if (trimCache.has(sourceUrl)) {
                setImgSrc(trimCache.get(sourceUrl)!);
                setHasFailed(false);
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const c = document.createElement('canvas');
                    c.width = img.naturalWidth;
                    c.height = img.naturalHeight;
                    const ctx = c.getContext('2d');
                    if (!ctx) {
                        setImgSrc(sourceUrl);
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, c.width, c.height).data;
                    let minY = c.height, maxY = 0, minX = c.width, maxX = 0;
                    let hasVisiblePixels = false;
                    for (let y = 0; y < c.height; y++) {
                        for (let x = 0; x < c.width; x++) {
                            if (imgData[(y * c.width + x) * 4 + 3] > 10) {
                                hasVisiblePixels = true;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                            }
                        }
                    }
                    if (hasVisiblePixels) {
                        const cropW = maxX - minX + 1;
                        const cropH = maxY - minY + 1;
                        const c2 = document.createElement('canvas');
                        c2.width = cropW;
                        c2.height = cropH;
                        const ctx2 = c2.getContext('2d');
                        if (ctx2) {
                            ctx2.drawImage(c, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
                            const trimmedUrl = c2.toDataURL('image/png');
                            trimCache.set(sourceUrl, trimmedUrl);
                            setImgSrc(trimmedUrl);
                            setHasFailed(false);
                            return;
                        }
                    }
                    setImgSrc(sourceUrl);
                    setHasFailed(false);
                } catch {
                    setImgSrc(sourceUrl);
                    setHasFailed(false);
                }
            };
            img.onerror = () => {
                // Fallback to standard PokeAPI sprite if FRLG version 404s
                const fallbackMonUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`;
                setImgSrc(fallbackMonUrl);
            };
            img.src = sourceUrl;
        } else {
            setImgSrc(sourceUrl);
            setHasFailed(false);
        }
    }, [nationalId, isValid, fallbackSrc, trim]);

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasFailed) {
            // If FRLG version failed, try standard PokeAPI
            if (imgSrc.includes('firered-leafgreen')) {
                const fallbackStandard = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalId}.png`;
                setImgSrc(fallbackStandard);
                return;
            }
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
