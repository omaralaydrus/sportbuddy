export const sports = ['Badminton', 'Basketball', 'Futsal', 'Tennis', 'Pickleball'] as const;
export type Sport = typeof sports[number];
export type Level = 'All levels' | 'Beginner' | 'Intermediate' | 'Advanced';
export type Point = { lat: number; lng: number };
export interface Court extends Point {
  id: string; name: string; area: string; address: string; sport: Sport;
  indoor: boolean; price: number; facilities: string[]; hours: string; image: string;
}
export interface Player {
  id: string; name: string; initials: string; area: string; bio: string;
  sports: Sport[]; level: Level; color: string;
}
export interface Game {
  id: string; title: string; courtId: string; hostId: string; sport: Sport;
  start: string; duration: number; capacity: number; playerIds: string[];
  level: Level; cost: number; description: string; status: 'open' | 'cancelled';
}
export interface Connection { from: string; to: string; status: 'pending' | 'accepted' }
export interface DemoState {
  version: 1; viewerId: string; games: Game[]; players: Player[];
  connections: Connection[]; saved: Record<string, string[]>;
}
