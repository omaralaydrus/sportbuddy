import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeStore } from '../src/store/index';
import * as A from '../src/modules/sportbuddy/store/sportbuddy.action';
import { seedState, courts } from '../src/shared/data/sportbuddy';
import { distanceKm, mapsUrl } from '../src/core/location/location';
import { gameProblem } from '../src/shared/services/demo.service';
const now = Date.now();
function setup() {
  // In-memory browser storage substitutes only the persistence boundary.
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v) } });
  const store = makeStore(); store.dispatch(A.hydrate(seedState())); return store;
}
test('join is idempotent and leaving releases exactly one spot', () => {
  const store = setup(); const before = store.getState().sportbuddy.data!.games[0];
  store.dispatch(A.join({ id: before.id, now })); store.dispatch(A.join({ id: before.id, now }));
  assert.equal(store.getState().sportbuddy.data!.games[0].playerIds.length, before.playerIds.length + 1);
  store.dispatch(A.leave({ id: before.id, now })); assert.deepEqual(store.getState().sportbuddy.data!.games[0].playerIds, before.playerIds);
});
test('full, past, and cancelled games reject joining', () => {
  for (const kind of ['full', 'past', 'cancelled']) {
    const store = setup(); const data = seedState(); const g = data.games[0];
    if (kind === 'full') g.capacity = g.playerIds.length;
    if (kind === 'past') g.start = new Date(now - 1000).toISOString();
    if (kind === 'cancelled') g.status = 'cancelled';
    store.dispatch(A.hydrate(data)); store.dispatch(A.join({ id: g.id, now }));
    assert.equal(store.getState().sportbuddy.data!.games[0].playerIds.includes('you'), false, kind);
  }
});
test('only host can edit or cancel and host cannot leave', () => {
  const store = setup(); const game = store.getState().sportbuddy.data!.games[0];
  store.dispatch(A.saveGame({ game: { ...game, title: 'Unauthorized', hostId: 'you' }, now }));
  store.dispatch(A.cancelGame(game.id));
  assert.equal(store.getState().sportbuddy.data!.games[0].title, game.title);
  assert.equal(store.getState().sportbuddy.data!.games[0].status, 'open');
  store.dispatch(A.switchViewer(game.hostId)); store.dispatch(A.leave({ id: game.id, now }));
  assert.ok(store.getState().sportbuddy.data!.games[0].playerIds.includes(game.hostId));
  store.dispatch(A.cancelGame(game.id)); assert.equal(store.getState().sportbuddy.data!.games[0].status, 'cancelled');
});
test('editing cannot remove participants or shrink below their count', () => {
  const store = setup(); const game = store.getState().sportbuddy.data!.games[0];
  store.dispatch(A.join({ id: game.id, now })); store.dispatch(A.switchViewer(game.hostId));
  store.dispatch(A.saveGame({ game: { ...game, capacity: 2, playerIds: [game.hostId] }, now }));
  assert.equal(store.getState().sportbuddy.data!.games[0].capacity, 4);
  assert.ok(store.getState().sportbuddy.data!.games[0].playerIds.includes('you'));
  store.dispatch(A.saveGame({ game: { ...game, title: 'Updated session', playerIds: [game.hostId] }, now }));
  assert.equal(store.getState().sportbuddy.data!.games[0].title, 'Updated session');
  assert.ok(store.getState().sportbuddy.data!.games[0].playerIds.includes('you'));
});
test('hosted games count the host and reject mismatched courts', () => {
  const store = setup(); const game = { ...store.getState().sportbuddy.data!.games[0], id: 'new-game', hostId: 'you', playerIds: [] };
  store.dispatch(A.saveGame({ game, now }));
  assert.deepEqual(store.getState().sportbuddy.data!.games[0].playerIds, ['you']);
  store.dispatch(A.saveGame({ game: { ...game, id: 'invalid', courtId: 'baseline' }, now }));
  assert.equal(store.getState().sportbuddy.data!.games.some(g => g.id === 'invalid'), false);
});
test('connection lifecycle checks recipient, duplicate and self requests', () => {
  const store = setup(); store.dispatch(A.connect({ id: 'you', operation: 'request' }));
  store.dispatch(A.connect({ id: 'maya', operation: 'request' })); store.dispatch(A.connect({ id: 'maya', operation: 'request' }));
  store.dispatch(A.connect({ id: 'maya', operation: 'accept' }));
  assert.equal(store.getState().sportbuddy.data!.connections.length, 2);
  assert.equal(store.getState().sportbuddy.data!.connections[1].status, 'pending');
  store.dispatch(A.switchViewer('maya')); store.dispatch(A.connect({ id: 'you', operation: 'accept' }));
  assert.equal(store.getState().sportbuddy.data!.connections[1].status, 'accepted');
  store.dispatch(A.connect({ id: 'you', operation: 'remove' })); assert.equal(store.getState().sportbuddy.data!.connections.length, 1);
});
test('saved courts and profile edits are scoped to the viewer', () => {
  const store = setup(); store.dispatch(A.toggleSave('rally')); store.dispatch(A.switchViewer('maya'));
  const d = store.getState().sportbuddy.data!; assert.deepEqual(d.saved.you, ['rally']); assert.equal(d.saved.maya, undefined);
  store.dispatch(A.updateProfile({ ...d.players[0], name: 'Not allowed' })); assert.equal(store.getState().sportbuddy.data!.players[0].name, 'Alex Tan');
});
test('invalid time, capacity and contribution fail hosting validation', () => {
  const game = seedState().games[0];
  for (const fields of [{ start: 'invalid' }, { capacity: 1 }, { capacity: 3.5 }, { cost: -1 }, { duration: 0 }]) assert.ok(gameProblem({ ...game, ...fields }, game.hostId, now));
});
test('distance and directions preserve the venue coordinates', () => {
  assert.equal(distanceKm(courts[0], courts[0]), 0);
  assert.ok(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) > 111);
  const url = new URL(mapsUrl(courts[0], true));
  assert.equal(url.searchParams.get('api'), '1'); assert.equal(url.searchParams.get('destination'), `${courts[0].lat},${courts[0].lng}`);
});
