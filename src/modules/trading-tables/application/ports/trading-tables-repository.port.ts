import type { TaxRow, TradingTables } from '../../domain/value-objects/trading-tables.vo.js';

export const TRADING_TABLES_REPOSITORY = Symbol('TradingTablesRepository');

/** Id of the taxes and tolls document in the trading-tables collection (spec 062). */
export const TAXATION_ID = 'taxation';

/**
 * Trading tables stored in the database (collection trading-tables): one document per rulebook, and the taxes and
 * tolls in the document `taxation`.
 */
export interface TradingTablesRepository {
  /** The tables of a rulebook, with no taxation */
  findById(id: string): Promise<Omit<TradingTables, 'taxation'> | null>;
  /** The rows of the taxation document; empty when it has not been imported */
  findTaxation(): Promise<TaxRow[]>;
}
