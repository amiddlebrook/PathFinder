import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trip } from '../types';
import { DownloadCloudIcon, MapIcon, CheckSquareIcon, Trash2Icon } from './icons';

declare var L: any; // Leaflet is loaded from a CDN

interface MapComponentProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

type LayerType = 'topo' | 'satellite';
type DownloadSize = 'small' | 'medium' | 'large';

const downloadOptions: Record<DownloadSize, { area: string; size: string; miles: number }> = {
    small: { area: '5x5 miles', size: '~15 MB', miles: 5 },
    medium: { area: '10x10 miles', size: '~50 MB', miles: 10 },
    large: { area: '25x25 miles', size: '~200 MB', miles: 25 },
};

// Helper to calculate bounding box. Note: This is an approximation.
const getBoundsForArea = (lat: number, lng: number, miles: number) => {
    const latDelta = miles / 69;
    const lngDelta = miles / (Math.cos(lat * (Math.PI / 180)) * 69);
    const southWest: [number, number] = [lat - latDelta / 2, lng - lngDelta / 2];
    const northEast: [number, number] = [lat + latDelta / 2, lng + lngDelta / 2];
    return [southWest, northEast];
};


const MapComponent: React.FC<MapComponentProps> = ({ trip, onUpdateTrip }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const previewRectangleRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<LayerType>('topo');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadOptionsOpen, setIsDownloadOptionsOpen] = useState(false);
  const [hoveredDownloadSize, setHoveredDownloadSize] = useState<DownloadSize | null>(null);

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
    if (mapContainerRef.current && !mapRef.current && trip.mapLocation) {
      const map = L.map(mapContainerRef.current).setView([trip.mapLocation.lat, trip.mapLocation.lng], 10);
      mapRef.current = map;
      L.tileLayer(tileLayers.topo.url, tileLayers.topo.options).addTo(map);
      L.marker([trip.mapLocation.lat, trip.mapLocation.lng]).addTo(map)
        .bindPopup(`<b>${trip.name}</b><br>${trip.destination}`);
        
      if (trip.offlineMap) {
          const miles = downloadOptions[trip.offlineMap.size].miles;
          const bounds = getBoundsForArea(trip.mapLocation.lat, trip.mapLocation.lng, miles);
          L.rectangle(bounds, { color: "#16a34a", weight: 2, fillOpacity: 0.1, interactive: false }).addTo(mapRef.current);
      }
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trip.mapLocation, trip.offlineMap]);

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

  // Draw download preview area
  useEffect(() => {
    if (!mapRef.current || !trip.mapLocation) return;

    if (previewRectangleRef.current) {
        previewRectangleRef.current.remove();
        previewRectangleRef.current = null;
    }

    if (hoveredDownloadSize) {
        const miles = downloadOptions[hoveredDownloadSize].miles;
        const bounds = getBoundsForArea(trip.mapLocation.lat, trip.mapLocation.lng, miles);
        previewRectangleRef.current = L.rectangle(bounds, { color: "var(--color-accent)", weight: 2, fillOpacity: 0.1, interactive: false }).addTo(mapRef.current);
    }
  }, [hoveredDownloadSize, trip.mapLocation]);

  const handleDownload = (size: DownloadSize) => {
    setIsDownloading(true);
    setIsDownloadOptionsOpen(false);
    setHoveredDownloadSize(null);
    setTimeout(() => {
        onUpdateTrip({ 
            ...trip, 
            offlineMap: { size, area: downloadOptions[size].area }
        });
        setIsDownloading(false);
    }, 2000);
  };

  const handleDeleteMap = () => {
    const { offlineMap, ...restOfTrip } = trip;
    onUpdateTrip(restOfTrip);
  };
  
  if (!trip.mapLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[var(--color-bg-tertiary)]/50 rounded-xl border-2 border-dashed border-[var(--color-border)]">
        <MapIcon className="w-16 h-16 text-[var(--color-text-tertiary)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Pinpoint Your Destination</h3>
        <p className="text-[var(--color-text-secondary)] mt-2 max-w-md">
          Run an AI Risk Assessment first. This will analyze your destination and provide geographic coordinates to display on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[var(--color-bg-secondary)] flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
        <div className="p-4 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm z-10 border-b border-[var(--color-border)]">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveLayer('topo')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeLayer === 'topo' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-interactive)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-interactive-hover)]'}`}>Topographic</button>
                    <button onClick={() => setActiveLayer('satellite')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeLayer === 'satellite' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-interactive)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-interactive-hover)]'}`}>Satellite</button>
                </div>

                {trip.offlineMap ? (
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-bold py-2 px-3 rounded-lg">
                            <CheckSquareIcon className="w-5 h-5" />
                            <span>Saved: <span className="capitalize">{trip.offlineMap.size}</span> ({trip.offlineMap.area})</span>
                        </div>
                         <button onClick={handleDeleteMap} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-md transition-colors" aria-label="Delete offline map">
                            <Trash2Icon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <button onClick={() => setIsDownloadOptionsOpen(prev => !prev)} disabled={isDownloading} className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {isDownloading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <DownloadCloudIcon className="w-5 h-5" />
                            )}
                            {isDownloading ? 'Downloading...' : 'Download Offline Map'}
                        </button>
                        {isDownloadOptionsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg shadow-2xl p-2 z-20">
                                <p className="text-xs text-[var(--color-text-secondary)] px-2 pb-2">Select area to save:</p>
                                {Object.keys(downloadOptions).map(key => {
                                    const option = downloadOptions[key as DownloadSize];
                                    return (
                                        <button 
                                            key={key}
                                            onMouseEnter={() => setHoveredDownloadSize(key as DownloadSize)}
                                            onMouseLeave={() => setHoveredDownloadSize(null)}
                                            onClick={() => handleDownload(key as DownloadSize)}
                                            className="w-full text-left flex justify-between items-center p-2 rounded-md hover:bg-[var(--color-accent)]/20"
                                        >
                                            <div>
                                                <span className="font-semibold text-[var(--color-text-primary)] capitalize">{key}</span>
                                                <span className="text-sm text-[var(--color-text-secondary)] ml-2">{option.area}</span>
                                            </div>
                                            <span className="text-xs text-[var(--color-text-tertiary)]">{option.size}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        <div ref={mapContainerRef} className="flex-grow w-full h-full z-0"></div>
    </div>
  );
};

export default MapComponent;