'use client';
import Link from 'next/link';
import { Icon } from './icon';
import { CourtArt } from './court-art';
import type { Court, Game, Player } from '@shared/models/sportbuddy.model';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleSave, connect } from '@modules/sportbuddy/store/sportbuddy.action';
import { connectionBetween } from '@shared/services/demo.service';
import { courts } from '@shared/data/sportbuddy';
export const sportMark: Record<string, string> = { Badminton: '↗', Basketball: '◉', Futsal: '⬡', Tennis: '◍', Pickleball: '◒' };
export function dateLabel(start: string) { return new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(start)); }
export function timeLabel(start: string) { return new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit' }).format(new Date(start)); }
export function CourtCard({ court, distance }: { court: Court; distance?: number }) {
  const d = useAppSelector(s => s.sportbuddy.data); const dispatch = useAppDispatch();
  const saved = !!d?.saved[d.viewerId]?.includes(court.id);
  return <article className="court-card"><div className="card-image"><Link href={`/courts/${court.id}`} aria-label={`View ${court.name}`}><CourtArt sport={court.sport}/></Link><span className="image-tag">{court.indoor ? 'Indoor' : 'Outdoor'}</span><button className={`save-button ${saved ? 'saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${court.name}`} aria-pressed={saved} onClick={() => dispatch(toggleSave(court.id))}><Icon name="heart" size={18}/></button></div><div className="card-body"><div className="eyebrow-row"><span className="sport-label">{sportMark[court.sport]} {court.sport}</span><span className="muted">Sample venue</span></div><Link href={`/courts/${court.id}`}><h3>{court.name}</h3></Link><p className="icon-line"><Icon name="pin" size={15}/>{court.area}{distance !== undefined && <span>· {distance.toFixed(1)} km away*</span>}</p><div className="card-bottom"><span>{court.price ? <><b>RM {court.price}</b><small> / hour</small></> : <b>Free to play</b>}</span><Link href={`/courts/${court.id}`} className="circle-link" aria-label={`Explore ${court.name}`}><Icon name="arrow" size={19}/></Link></div></div></article>;
}
export function GameCard({ game }: { game: Game }) {
  const data = useAppSelector(s => s.sportbuddy.data);
  const court = courts.find(c => c.id === game.courtId)!;
  const host = data?.players.find(p => p.id === game.hostId);
  const remaining = game.capacity - game.playerIds.length;
  const isPast = Date.parse(game.start) <= Date.now();
  return <article className="game-card"><div className="game-top"><span className={`sport-tile tile-${game.sport.toLowerCase()}`}>{sportMark[game.sport]}</span><span className="tag">{game.level}</span></div><span className="sport-label">{game.sport}</span><Link href={`/games/${game.id}`}><h3>{game.title}</h3></Link><p className="icon-line"><Icon name="pin" size={15}/>{court.name}</p><p className="icon-line"><Icon name="calendar" size={15}/>{dateLabel(game.start)} · {timeLabel(game.start)}</p><div className="game-members"><div className="avatar-stack">{game.playerIds.slice(0, 3).map(id => { const p = data?.players.find(p => p.id === id); return <span key={id} className="avatar tiny" style={{ background: p?.color }}>{p?.initials}</span>; })}</div><span>{game.status === 'cancelled' ? 'Cancelled' : isPast ? 'Past game' : remaining === 0 ? 'Game full' : <><b>{remaining} spots left</b> · {game.playerIds.length}/{game.capacity} joined</>}</span></div><div className="game-bottom"><span>{game.cost ? <><b>RM {game.cost}</b><small> / player</small></> : <b>Free to join</b>}<small>Hosted by {host?.name.split(' ')[0]}</small></span><Link className="button outline small" href={`/games/${game.id}`}>{data && game.playerIds.includes(data.viewerId) ? 'View game' : 'Let’s play'}<Icon name="arrow" size={15}/></Link></div></article>;
}
export function ConnectButton({ player }: { player: Player }) {
  const data = useAppSelector(s => s.sportbuddy.data); const dispatch = useAppDispatch();
  if (!data || data.viewerId === player.id) return <Link href="/profile" className="button outline small">Your profile</Link>;
  const connection = connectionBetween(data.connections, data.viewerId, player.id);
  const action = (operation: 'request' | 'accept' | 'remove') => dispatch(connect({ id: player.id, operation }));
  if (!connection) return <button className="button outline small" onClick={() => action('request')}><Icon name="plus" size={15}/> Connect</button>;
  if (connection.status === 'accepted') return <button className="button outline small" onClick={() => action('remove')} title="Remove connection"><Icon name="check" size={15}/> Connected · Remove</button>;
  if (connection.from === data.viewerId) return <button className="button outline small" onClick={() => action('remove')}>Requested · Cancel</button>;
  return <div className="inline-actions"><button className="button dark small" onClick={() => action('accept')}>Accept request</button><button className="text-button" onClick={() => action('remove')}>Decline</button></div>;
}
export function PlayerCard({ player }: { player: Player }) { return <article className="player-card"><Link href={`/players/${player.id}`} className="avatar large" style={{ background: player.color }}>{player.initials}</Link><Link href={`/players/${player.id}`}><h3>{player.name}</h3></Link><p className="icon-line"><Icon name="pin" size={14}/>{player.area}</p><div className="chips">{player.sports.map(s => <span className="tag" key={s}>{s}</span>)}</div><p className="player-bio">{player.bio}</p><ConnectButton player={player}/></article>; }
export function Empty({ title = 'No matches just yet.', children }: { title?: string; children?: React.ReactNode }) { return <div className="empty"><Icon name="search" size={32}/><h2>{title}</h2><p>{children ?? 'Try a different sport or widen your search area.'}</p></div>; }
