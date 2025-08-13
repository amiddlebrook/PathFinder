import React, { useEffect, useRef, useState } from 'react';
import { getCoordinatesForLocation } from '../services/geminiService';
import { SearchIcon } from './icons';

declare var L: any; // Leaflet is loaded from a CDN

type LayerType = 'topo' | 'satellite';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ExploreView: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [activeLayer, setActiveLayer] = useState<LayerType>('topo');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const tileLayers = {
        topo: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            options: {
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            },
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            },
        },
    };

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false // Disable default zoom control
            }).setView([39.8283, -98.5795], 4); // Center of the US
            
            mapRef.current = map;
            L.tileLayer(tileLayers.topo.url, tileLayers.topo.options).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Handle map layer changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.eachLayer((layer: any) => {
                if (layer instanceof L.TileLayer) {
                    layer.remove();
                }
            });
            L.tileLayer(tileLayers[activeLayer].url, tileLayers[activeLayer].options).addTo(mapRef.current);
        }
    }, [activeLayer]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        try {
            const coords = await getCoordinatesForLocation(searchQuery);
            if (mapRef.current) {
                mapRef.current.flyTo([coords.lat, coords.lng], 13);
                 // Clear existing markers before adding a new one
                mapRef.current.eachLayer((layer: any) => {
                    if (layer instanceof L.Marker) {
                        layer.remove();
                    }
                });
                L.marker([coords.lat, coords.lng]).addTo(mapRef.current)
                    .bindPopup(`<b>${searchQuery}</b>`)
                    .openPopup();
            }
        } catch (err) {
            setSearchError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setTimeout(() => setSearchError(null), 5000); // Clear error after 5s
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative h-full w-full bg-[var(--color-bg-secondary)] flex flex-col">
            <div className="absolute top-0 left-0 p-4 z-20 w-full max-w-md">
                <div className="bg-[var(--color-bg-secondary)]/70 backdrop-blur-md rounded-xl p-2 border border-[var(--color-border)] shadow-2xl flex flex-col gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search any location..."
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
                            />
                        </div>
                        <button type="submit" disabled={isSearching} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold p-2.5 rounded-lg transition-colors disabled:bg-[var(--color-accent)]/50 disabled:cursor-not-allowed flex items-center justify-center w-11 h-11 flex-shrink-0">
                            {isSearching ? <LoadingSpinner /> : <SearchIcon className="w-5 h-5" />}
                        </button>
                    </form>
                    {searchError && <p className="text-red-400 text-sm px-2 text-center">{searchError}</p>}
                </div>
            </div>

             <div className="absolute top-4 right-4 z-20">
                 <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)]/70 backdrop-blur-md rounded-lg p-1 border border-[var(--color-border)] shadow-2xl">
                    <button onClick={() => setActiveLayer('topo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeLayer === 'topo' ? 'bg-[var(--color-accent)] text-white' : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-interactive)]/50'}`}>Topo</button>
                    <button onClick={() => setActiveLayer('satellite')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeLayer === 'satellite' ? 'bg-[var(--color-accent)] text-white' : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-interactive)]/50'}`}>Satellite</button>
                </div>
            </div>

            <div ref={mapContainerRef} className="flex-grow w-full h-full z-0"></div>
        </div>
    );
};

export default ExploreView;