'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Court, Point } from '@shared/models/sportbuddy.model';
import { mapsUrl } from '@core/location/location';
import { Icon } from './icon';
type MapInstance = { getCenter(): { lat(): number; lng(): number } | undefined; setCenter(p: Point): void };
type MarkerInstance = { map: MapInstance | null; addListener(event: string, callback: () => void): { remove(): void } };
type MapsApi = {
  importLibrary(name: string): Promise<unknown>;
};
declare global { interface Window { google?: { maps: MapsApi }; gm_authFailure?: () => void; } }
let loading: Promise<MapsApi> | undefined;
function loadMaps(key: string): Promise<MapsApi> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loading) return loading;
  loading = new Promise<MapsApi>((resolve, reject) => {
    const script = document.createElement('script');
    let timer: ReturnType<typeof setTimeout>;
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('Map unavailable')); };
    timer = setTimeout(fail, 15000);
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: 'weekly' })}`;
    script.async = true;
    script.onload = () => { clearTimeout(timer); if (window.google?.maps) resolve(window.google.maps); else fail(); };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(e => { loading = undefined; throw e; });
  return loading;
}
export function VenueMap({ venues, center, onSearch, games }: { venues: Court[]; center: Point; onSearch?: (point: Point) => void; games?: { id: string; title: string; courtId: string }[] }) {
  const container = useRef<HTMLDivElement>(null); const map = useRef<MapInstance | null>(null);
  const [ready, setReady] = useState(false); const [failed, setFailed] = useState(false); const [selected, setSelected] = useState<string | null>(null);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const initialCenter = useRef(center);
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => { if (!cancelled) setFailed(true); };
    loadMaps(key).then(async api => {
      const { Map } = await api.importLibrary('maps') as { Map: new (el: HTMLElement, options: object) => MapInstance };
      if (cancelled || !container.current) return;
      map.current = new Map(container.current, { center: initialCenter.current, zoom: 12, mapId: 'DEMO_MAP_ID', disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative' });
      setReady(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; window.gm_authFailure = previous; map.current = null; };
  }, [key]);
  useEffect(() => { if (ready) map.current?.setCenter(center); }, [center.lat, center.lng, ready]);
  useEffect(() => {
    if (!ready || !window.google) return;
    let cancelled = false; const markers: MarkerInstance[] = []; const listeners: { remove(): void }[] = [];
    window.google.maps.importLibrary('marker').then(lib => {
      if (cancelled || !map.current) return;
      const { AdvancedMarkerElement } = lib as { AdvancedMarkerElement: new (options: object) => MarkerInstance };
      venues.forEach(c => {
        const marker = new AdvancedMarkerElement({ map: map.current, position: { lat: c.lat, lng: c.lng }, title: c.name });
        listeners.push(marker.addListener('click', () => setSelected(c.id))); markers.push(marker);
      });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; listeners.forEach(l => l.remove()); markers.forEach(m => { m.map = null; }); };
  }, [ready, venues]);
  const venue = venues.find(c => c.id === selected);
  return <div className="map-panel"><div className="google-map" ref={container} aria-label="Map of venue locations"/>{(!key || failed) ? <div className="map-fallback"><Icon name="map" size={38}/><h3>{failed ? 'The map couldn’t load.' : 'Explore the neighbourhood.'}</h3><p>{failed ? 'You can still browse the list and open directions.' : 'The interactive map is awaiting Google Maps setup. Court lists and directions are ready to explore.'}</p><a href={mapsUrl(center)} target="_blank" rel="noreferrer" className="button dark">Open Google Maps <Icon name="arrow" size={16}/></a></div> : !ready ? <div className="map-fallback" role="status">Loading Google Maps…</div> : <>{onSearch && <button className="button dark map-search" onClick={() => { const p = map.current?.getCenter(); if (p) { onSearch({ lat: p.lat(), lng: p.lng() }); setSelected(null); } }}><Icon name="search" size={16}/> Search this area</button>}{venue && <div className="map-preview"><button className="icon-button" aria-label="Close venue preview" onClick={() => setSelected(null)}><Icon name="close" size={15}/></button><b>{venue.name}</b><p>{venue.area} · {venue.sport}</p><Link href={`/courts/${venue.id}`}>View court →</Link>{games?.filter(g => g.courtId === venue.id).map(g => <Link key={g.id} href={`/games/${g.id}`}>{g.title} →</Link>)}</div>}</>}<span className="map-note">Example venues · no live player locations</span></div>;
}
