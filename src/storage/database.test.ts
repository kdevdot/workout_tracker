import 'fake-indexeddb/auto';
import { openDB, deleteDB } from 'idb';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyState } from '../domain/state';
import { recordSet, startSession } from '../domain/sessions';
import { WorkoutDatabase } from './database';

const opened: WorkoutDatabase[] = [];
const names: string[] = [];
function database(name = `steady-test-${crypto.randomUUID()}`) {
  names.push(name);
  const instance = new WorkoutDatabase(name);
  opened.push(instance);
  return instance;
}
afterEach(async () => {
  await Promise.all(opened.splice(0).map((instance) => instance.close()));
  await Promise.all(names.splice(0).map((name) => deleteDB(name)));
});

describe('durable storage', () => {
  it('returns an empty state only for a genuinely new database', async () => {
    expect(await database().load()).toEqual(emptyState());
  });
  it('persists workout records through closing and reopening the database', async () => {
    const name = `steady-test-${crypto.randomUUID()}`;
    const first = database(name);
    const session = startSession('upperA', '2026-11-02', 'intro');
    const logged = recordSet(session, session.exercises[0]!.exercise.id, {
      index: 1,
      load: 20,
      reps: 7,
      effort: 3,
      loggedAt: new Date().toISOString(),
    });
    const saved = await first.save({ ...emptyState(), sessions: [logged] }, 0);
    await first.close();
    const reopened = database(name);
    expect(await reopened.load()).toEqual(saved);
    expect((await reopened.load()).sessions[0]!.exercises[0]!.logs[0]!.reps).toBe(7);
  });
  it('rejects stale-tab writes rather than overwriting newer records', async () => {
    const name = `steady-test-${crypto.randomUUID()}`;
    const first = database(name);
    const second = database(name);
    const saved = await first.save(emptyState(), 0);
    await expect(second.save(emptyState(), 0)).rejects.toThrow('Another tab');
    expect(await second.load()).toEqual(saved);
  });
  it('does not reset corrupted saved data', async () => {
    const name = `steady-test-${crypto.randomUUID()}`;
    const instance = database(name);
    await instance.load();
    const raw = await openDB(name, 1);
    await raw.put('records', { schemaVersion: 999, records: 'do not erase' }, 'state');
    await expect(instance.load()).rejects.toThrow();
    expect(await raw.get('records', 'state')).toEqual({
      schemaVersion: 999,
      records: 'do not erase',
    });
    raw.close();
  });
  it('rejects invalid saves and leaves the last successful state intact', async () => {
    const instance = database();
    const saved = await instance.save(emptyState(), 0);
    await expect(instance.save({ ...saved, revision: -1 }, 1)).rejects.toThrow();
    expect(await instance.load()).toEqual(saved);
  });
  it('restores records as a new local revision, not an imported revision', async () => {
    const instance = database();
    const saved = await instance.save(emptyState(), 0);
    const restored = await instance.save({ ...emptyState(), revision: 90 }, saved.revision);
    expect(restored.revision).toBe(2);
  });
});
