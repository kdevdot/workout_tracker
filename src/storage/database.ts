import { openDB, type IDBPDatabase } from 'idb';
import { emptyState, encodeBackup, stateSchema, type AppState } from '../domain/state';

export class RevisionConflict extends Error {
  constructor() {
    super('Another tab changed your records. Reload before saving again; this edit was not saved.');
  }
}

export class WorkoutDatabase {
  private database: Promise<IDBPDatabase>;

  constructor(name = 'steady-workout-v1') {
    this.database = openDB(name, 1, {
      upgrade(database) {
        database.createObjectStore('records');
      },
    });
  }

  async load(): Promise<AppState> {
    const record = await (await this.database).get('records', 'state');
    return record === undefined ? emptyState() : stateSchema.parse(record);
  }

  async save(next: AppState, expectedRevision: number): Promise<AppState> {
    const candidate = stateSchema.parse(next);
    const saved = stateSchema.parse({
      ...candidate,
      revision: expectedRevision + 1,
      savedAt: new Date().toISOString(),
    });
    encodeBackup(saved);
    const database = await this.database;
    const transaction = database.transaction('records', 'readwrite');
    const record = await transaction.store.get('state');
    const current = record === undefined ? emptyState() : stateSchema.parse(record);
    if (current.revision !== expectedRevision) {
      transaction.abort();
      await transaction.done.catch(() => undefined);
      throw new RevisionConflict();
    }
    await transaction.store.put(saved, 'state');
    await transaction.done;
    return saved;
  }

  async close() {
    (await this.database).close();
  }
}
