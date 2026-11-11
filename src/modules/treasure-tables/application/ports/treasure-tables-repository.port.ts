import type { TreasureTables } from '../../domain/value-objects/treasure-tables.vo.js';

export const TREASURE_TABLES_REPOSITORY = Symbol('TreasureTablesRepository');

/** Treasure tables stored in the database (collection treasure-tables, one document `treasure`). */
export interface TreasureTablesRepository {
  /** The tables; null when they have not been imported */
  find(): Promise<TreasureTables | null>;
}
