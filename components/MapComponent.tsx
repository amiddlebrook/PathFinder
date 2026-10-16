import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import type { Trip } from '../types';
import { MapIcon } from './icons';

interface Props { trip: Trip; onUpdateTrip: (trip: Trip) => void }
type LayerType = 'topo' | 'satellite';
const layers = {
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, SRTM; map © OpenTopoMap (CC BY-SA)',
    maxZoom: 17
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery © Esri and contributors',
    maxZoom: 18
  }
};
const MapComponent: React.FC<Props> = ({ trip }) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const [layer, setLayer] = useState<LayerType>('topo');
  const lat = trip.mapLocation?.lat;
  const lng = trip.mapLocation?.lng;

  useEffect(() => {
    if (!container.current || lat === undefined || lng === undefined) return;
    const m = L.map(container.current, {zoomControl:true}).setView([lat,lng],10);
    map.current = m;
    const popup = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = trip.name;
    const destination = document.createElement('div');
    destination.textContent = trip.destination;
    popup.append(heading,destination);
    L.marker([lat,lng]).addTo(m).bindPopup(popup);
    return () => { m.remove(); map.current=null; tileLayer.current=null; };
  }, [lat,lng,trip.name,trip.destination]);

  useEffect(() => {
    if (!map.current) return;
    tileLayer.current?.remove();
    const chosen = layers[layer];
    tileLayer.current = L.tileLayer(chosen.url,{attribution: chosen.attribution,maxZoom:chosen.maxZoom}).addTo(map.current);
  }, [layer,lat,lng]);

  if (lat === undefined || lng === undefined) return (
    <div className="min-h-72 h-full flex flex-col gap-3 items-center justify-center text-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-8">
      <MapIcon className="w-12 h-12 text-[var(--color-accent)]" />
      <h3 className="text-xl font-bold">Find your destination</h3>
      <p className="max-w-sm text-[var(--color-text-secondary)]">Use the Trip Risk tab to resolve your destination into coordinates, then return here to view the map.</p>
    </div>
  );
  return (
    <section className="flex flex-col min-h-[400px] h-[60vh] rounded-2xl overflow-hidden bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
      <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex gap-1 rounded-xl p-1 bg-[var(--color-bg-tertiary)]">
          <button aria-pressed={layer==='topo'} onClick={()=>setLayer('topo')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${layer==='topo'?'bg-[var(--color-accent)] text-white':'text-[var(--color-text-secondary)]'}`}>Terrain</button>
          <button aria-pressed={layer==='satellite'} onClick={()=>setLayer('satellite')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${layer==='satellite'?'bg-[var(--color-accent)] text-white':'text-[var(--color-text-secondary)]'}`}>Satellite</button>
        </div>
        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--color-accent-text)] hover:underline">Open full map ↗</a>
      </div>
      <div className="min-h-0 flex-1" ref={container} aria-label={`Map of ${trip.destination}`} role="region"/>
      <div className="px-4 py-2 text-xs text-[var(--color-text-secondary)]">Live map tiles require internet. Maps are not stored for offline navigation.</div>
    </section>
  );
};
export default MapComponent;
