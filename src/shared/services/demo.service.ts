import type { DemoState, Game, Connection, Player } from '../models/sportbuddy.model';
const KEY = 'sportbuddy.demo.v1';
export function readDemo(): DemoState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  const data = JSON.parse(raw) as DemoState;
  if (data.version !== 1 || !Array.isArray(data.games) || !Array.isArray(data.players) || !Array.isArray(data.connections) || !data.saved || !data.players.some(p => p.id === data.viewerId)) throw new Error('Saved demo is incompatible.');
  if (!data.games.every(g => typeof g.id === 'string' && Array.isArray(g.playerIds) && Number.isFinite(g.capacity) && Number.isFinite(Date.parse(g.start))) || !data.players.every(p => typeof p.name === 'string' && Array.isArray(p.sports))) throw new Error('Saved demo is invalid.');
  return data;
}
export function saveDemo(state: DemoState) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function joinProblem(game: Game, playerId: string, now: number): string | null {
  if (game.status === 'cancelled') return 'This game has been cancelled.';
  if (Date.parse(game.start) <= now) return 'This game has already started.';
  if (game.playerIds.includes(playerId)) return 'You have already joined this game.';
  if (game.playerIds.length >= game.capacity) return 'This game is full.';
  return null;
}
export function gameProblem(game: Game, viewerId: string, now: number): string | null {
  if (game.hostId !== viewerId) return 'Only the host can change this game.';
  if (!game.title.trim() || game.title.length > 100 || !game.description.trim()) return 'Add a title and description.';
  if (!Number.isFinite(Date.parse(game.start)) || Date.parse(game.start) <= now) return 'Choose a future date and time.';
  if (!Number.isInteger(game.capacity) || game.capacity < Math.max(2, game.playerIds.length) || game.capacity > 100) return 'Capacity must be 2–100 and fit all current players.';
  if (!Number.isFinite(game.duration) || game.duration < 30 || game.duration > 480) return 'Duration must be 30–480 minutes.';
  if (!Number.isFinite(game.cost) || game.cost < 0 || game.cost > 1000) return 'Contribution must be RM 0–1,000.';
  return null;
}
export function connectionBetween(connections: Connection[], a: string, b: string) {
  return connections.find(c => (c.from === a && c.to === b) || (c.from === b && c.to === a));
}
export function profileProblem(player: Player) {
  return !player.name.trim() || player.name.length > 60 || player.bio.length > 300 || player.sports.length === 0 ? 'Add a name and at least one sport; keep your bio under 300 characters.' : null;
}
