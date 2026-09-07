'use client';
import { useState } from 'react';
import { areas } from '@shared/data/sportbuddy';
import { sports, type Point } from '@shared/models/sportbuddy.model';
import { Icon } from './icon';
import { sportMark } from './cards';
export function SportFilters({ selected, onChange }: { selected: string; onChange: (s: string) => void }) { return <div className="sport-filters" aria-label="Filter by sport">{['All sports', ...sports].map(s => <button key={s} aria-label={s} aria-pressed={selected === s} className={selected === s ? 'selected' : ''} onClick={() => onChange(s)}><span>{s === 'All sports' ? '✳' : sportMark[s]}</span>{s}</button>)}</div>; }
export function useLocation() {
  const [area, setArea] = useState('Kuala Lumpur'); const [center, setCenter] = useState<Point>(areas[0]); const [locationError, setError] = useState(''); const [locating, setLocating] = useState(false);
  const chooseArea = (name: string) => { const area = areas.find(a => a.name === name); if (area) { setArea(name); setCenter(area); setError(''); } };
  const locate = () => {
    if (!navigator.geolocation) { setError('Location is unavailable. Please select an area.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(p => { setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }); setArea('Current location'); setLocating(false); }, () => { setError('Couldn’t get your location. Please select an area.'); setLocating(false); }, { timeout: 10000, maximumAge: 60000 });
  };
  const searchArea = (p: Point) => { setCenter(p); setArea('Map area'); };
  return { area, center, chooseArea, locate, locationError, locating, searchArea };
}
export function LocationControls({ location }: { location: ReturnType<typeof useLocation> }) { return <><div className="location-controls"><label><Icon name="pin" size={17}/><span className="sr-only">Search location</span><select value={location.area} onChange={e => location.chooseArea(e.target.value)}>{!areas.some(a => a.name === location.area) && <option>{location.area}</option>}{areas.map(a => <option key={a.name}>{a.name}</option>)}</select></label><button className="icon-button" disabled={location.locating} onClick={location.locate} aria-label="Use my location" title="Use my location"><Icon name="target"/>{location.locating && <span>Locating…</span>}</button></div>{location.locationError && <span className="field-error" role="status">{location.locationError}</span>}</>; }
export function ViewToggle({ map, setMap }: { map: boolean; setMap: (v: boolean) => void }) { return <div className="view-toggle"><button aria-pressed={!map} className={!map ? 'selected' : ''} onClick={() => setMap(false)}><Icon name="grid" size={16}/> List</button><button aria-pressed={map} className={map ? 'selected' : ''} onClick={() => setMap(true)}><Icon name="map" size={16}/> Map</button></div>; }
