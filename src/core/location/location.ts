import type { Point } from '../../shared/models/sportbuddy.model';
export function distanceKm(a: Point, b: Point): number {
  const r = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function mapsUrl(point: Point, directions = false): string {
  const query = new URLSearchParams({ api: '1', [directions ? 'destination' : 'query']: `${point.lat},${point.lng}` });
  return `https://www.google.com/maps/${directions ? 'dir' : 'search'}/?${query}`;
}
