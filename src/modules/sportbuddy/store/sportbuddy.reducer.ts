import { createReducer } from '@reduxjs/toolkit';
import { initialState } from './sportbuddy.state';
import * as A from './sportbuddy.action';
import { connectionBetween, gameProblem, joinProblem, profileProblem } from '@shared/services/demo.service';
import { courts } from '@shared/data/sportbuddy';
export const sportBuddyReducer = createReducer(initialState, b => b
  .addCase(A.hydrate, (s, a) => { s.data = a.payload; })
  .addCase(A.notify, (s, a) => { s.notice = a.payload; })
  .addCase(A.storageFailed, (s, a) => { s.storageError = a.payload; })
  .addCase(A.switchViewer, (s, a) => { if (s.data?.players.some(p => p.id === a.payload)) { s.data.viewerId = a.payload; s.notice = 'Demo player switched.'; } })
  .addCase(A.join, (s, a) => {
    const d = s.data, g = d?.games.find(g => g.id === a.payload.id); if (!d || !g) return;
    const problem = joinProblem(g, d.viewerId, a.payload.now); if (problem) { s.notice = problem; return; }
    g.playerIds.push(d.viewerId); s.notice = 'You’re in! Your game is saved in My games.';
  })
  .addCase(A.leave, (s, a) => {
    const d = s.data, g = d?.games.find(g => g.id === a.payload.id); if (!d || !g) return;
    if (g.hostId === d.viewerId) { s.notice = 'As host, cancel the game instead of leaving.'; return; }
    if (Date.parse(g.start) <= a.payload.now) { s.notice = 'Past game participation cannot be changed.'; return; }
    g.playerIds = g.playerIds.filter(id => id !== d.viewerId); s.notice = 'You left the game. Your spot is available again.';
  })
  .addCase(A.saveGame, (s, a) => {
    const d = s.data; if (!d) return;
    const old = d.games.find(g => g.id === a.payload.game.id);
    if (old && (old.hostId !== d.viewerId || old.status === 'cancelled' || Date.parse(old.start) <= a.payload.now)) { s.notice = 'This game cannot be edited.'; return; }
    const game = { ...a.payload.game, playerIds: old ? [...old.playerIds] : [d.viewerId], hostId: old?.hostId ?? d.viewerId, status: 'open' as const };
    const problem = gameProblem(game, d.viewerId, a.payload.now);
    if (problem) { s.notice = problem; return; }
    if (!courts.some(c => c.id === game.courtId && c.sport === game.sport)) { s.notice = 'Choose a court for this sport.'; return; }
    if (old) d.games[d.games.findIndex(g => g.id === old.id)] = game; else d.games.unshift(game);
    s.notice = old ? 'Game updated.' : 'Game created. Let’s get your crew together!';
  })
  .addCase(A.cancelGame, (s, a) => { const d = s.data, g = d?.games.find(g => g.id === a.payload); if (d && g && g.hostId === d.viewerId && Date.parse(g.start) > Date.now()) { g.status = 'cancelled'; s.notice = 'Game cancelled. Participants can see its updated status.'; } })
  .addCase(A.toggleSave, (s, a) => { const d = s.data; if (!d || !courts.some(c => c.id === a.payload)) return; const saved = d.saved[d.viewerId] ?? []; d.saved[d.viewerId] = saved.includes(a.payload) ? saved.filter(id => id !== a.payload) : [...saved, a.payload]; })
  .addCase(A.connect, (s, a) => {
    const d = s.data; if (!d || a.payload.id === d.viewerId || !d.players.some(p => p.id === a.payload.id)) return;
    const existing = connectionBetween(d.connections, d.viewerId, a.payload.id);
    if (a.payload.operation === 'request' && !existing) { d.connections.push({ from: d.viewerId, to: a.payload.id, status: 'pending' }); s.notice = 'Connection request sent in this demo.'; }
    if (a.payload.operation === 'accept' && existing?.to === d.viewerId && existing.status === 'pending') { existing.status = 'accepted'; s.notice = 'You’re now connected!'; }
    if (a.payload.operation === 'remove' && existing) { d.connections = d.connections.filter(c => c !== existing); s.notice = 'Connection updated.'; }
  })
  .addCase(A.updateProfile, (s, a) => {
    const d = s.data; if (!d || a.payload.id !== d.viewerId) return;
    const problem = profileProblem(a.payload); if (problem) { s.notice = problem; return; }
    d.players[d.players.findIndex(p => p.id === d.viewerId)] = a.payload; s.notice = 'Profile saved.';
  }));
