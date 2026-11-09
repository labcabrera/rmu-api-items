import { describe, expect, it } from 'vitest';
import { ForbiddenError, NotFoundError } from '../../../src/modules/shared/domain/errors/errors.js';
import { GetTradingTablesHandler } from '../../../src/modules/trading-tables/application/cqrs/handlers/get-trading-tables.handler.js';
import { GetTradingTablesQuery } from '../../../src/modules/trading-tables/application/cqrs/queries/get-trading-tables.query.js';
import type { TradingTablesRepository } from '../../../src/modules/trading-tables/application/ports/trading-tables-repository.port.js';
import type { TaxRow, TradingTables } from '../../../src/modules/trading-tables/domain/value-objects/trading-tables.vo.js';
import { MongoTradingTablesRepository } from '../../../src/modules/trading-tables/infrastructure/db/mongo.trading-tables.repository.js';
import type { TradingTablesModel } from '../../../src/modules/trading-tables/infrastructure/persistence/models/trading-tables.model.js';

// Fixture values, not the rulebook ones
const TABLES: Omit<TradingTables, 'taxation'> = {
  negotiation: [
    { min: null, max: 0, purchase: null, sale: null, outcome: 'no-agreement' },
    { min: 1, max: 50, purchase: 120, sale: 40 },
    { min: 51, max: null, purchase: 80, sale: 90 },
  ],
  priceFactors: [
    { key: 'demand', type: 'choice', mode: 'multiplier', options: [{ key: 'high', value: 2 }] },
    { key: 'days', type: 'number', mode: 'percent', perUnit: 3, min: 0, max: 10, contexts: ['purchase'] },
  ],
};

const TAXATION: TaxRow[] = [
  { key: 'e2e-gate-fee', cost: 0.5, unit: 'per wagon', notes: null },
  { key: 'e2e-levy', cost: null, unit: null, notes: 'Made-up note' },
];

const repository = (tables: Omit<TradingTables, 'taxation'> | null, taxation: TaxRow[] = []): TradingTablesRepository => ({
  findById: () => Promise.resolve(tables),
  findTaxation: () => Promise.resolve(taxation),
});

describe('GetTradingTablesHandler', () => {
  it('returns the stored tables to Core Law users and administrators', async () => {
    const handler = new GetTradingTablesHandler(repository(TABLES));
    await expect(handler.execute(new GetTradingTablesQuery('user', ['rmu-core-law']))).resolves.toEqual({ ...TABLES, taxation: [] });
    await expect(handler.execute(new GetTradingTablesQuery('service', ['rmu-admin']))).resolves.toEqual({ ...TABLES, taxation: [] });
  });

  it('adds the taxes and tolls of their own document (spec 062)', async () => {
    const handler = new GetTradingTablesHandler(repository(TABLES, TAXATION));
    await expect(handler.execute(new GetTradingTablesQuery('user', ['rmu-core-law']))).resolves.toEqual({ ...TABLES, taxation: TAXATION });
  });

  it('maps the stored tax rows with the missing fields as null', () => {
    expect(MongoTradingTablesRepository.mapToTaxRows([{ key: 'e2e-toll' } as TaxRow, TAXATION[0]])).toEqual([
      { key: 'e2e-toll', cost: null, unit: null, notes: null },
      TAXATION[0],
    ]);
    expect(MongoTradingTablesRepository.mapToTaxRows(undefined)).toEqual([]);
  });

  it('rejects users without Core Law access', async () => {
    const handler = new GetTradingTablesHandler(repository(TABLES));
    await expect(handler.execute(new GetTradingTablesQuery('guest', ['rmu-user']))).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('fails with not found when the tables have not been imported', async () => {
    const handler = new GetTradingTablesHandler(repository(null));
    await expect(handler.execute(new GetTradingTablesQuery('user', ['rmu-core-law']))).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps a stored document without its _id, missing limits as null and without empty fields', () => {
    const doc = {
      _id: 'treasure-law',
      negotiation: [{ min: 1, purchase: 100, sale: 50 }],
      priceFactors: [{ key: 'black', type: 'flag', mode: 'multiplier', value: 0.5, contexts: [], description: null }],
    };
    expect(MongoTradingTablesRepository.mapToTables(doc as unknown as TradingTablesModel)).toEqual({
      negotiation: [{ min: 1, max: null, purchase: 100, sale: 50 }],
      priceFactors: [{ key: 'black', type: 'flag', mode: 'multiplier', value: 0.5 }],
    });
    expect(MongoTradingTablesRepository.mapToTables({ _id: 'treasure-law', ...TABLES })).toEqual(TABLES);
  });
});
