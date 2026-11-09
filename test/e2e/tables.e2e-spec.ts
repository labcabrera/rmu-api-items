import request from 'supertest';
import { startApp, type E2eApp } from './support/app.js';

// Moved from rmu-api-core (workspace spec 095). Invented documents with the shape of the import, not the rulebook.
describe('Trading and treasure tables (e2e)', () => {
  let e2e: E2eApp;

  beforeAll(async () => {
    e2e = await startApp();
  });

  beforeEach(async () => {
    await e2e.connection.collection('trading-tables').deleteMany({});
    await e2e.connection.collection('treasure-tables').deleteMany({});
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  describe('trading tables', () => {
    it('requires Core Law access, answers 404 until imported and returns the tables once they are', async () => {
      await request(e2e.server).get('/v1/trading-tables').expect(401);
      await request(e2e.server).get('/v1/trading-tables').set('Authorization', e2e.auth('owner')).expect(403);
      await request(e2e.server).get('/v1/trading-tables').set('Authorization', e2e.auth('coreLaw')).expect(404);

      // Made-up values with the shape of the import, not the rulebook tables.
      const tables = {
        negotiation: [
          { min: null, max: 0, purchase: null, sale: null, outcome: 'no-agreement' },
          { min: 1, max: null, purchase: 90, sale: 60 },
        ],
        priceFactors: [{ key: 'e2e-demand', type: 'choice', mode: 'multiplier', options: [{ key: 'high', value: 2 }], contexts: ['sale'] }],
      };
      await e2e.connection.collection('trading-tables').insertOne({ _id: 'treasure-law', ...tables } as never);

      const res = await request(e2e.server).get('/v1/trading-tables').set('Authorization', e2e.auth('coreLaw')).expect(200);
      expect(res.body).toEqual({ ...tables, taxation: [] });

      // Spec 062: the taxes and tolls, in their own document of the collection. Made-up rows.
      const rows = [
        { key: 'e2e-bridge', cost: 0.2, unit: 'per crossing', notes: 'Made-up note' },
        { key: 'e2e-tithe', cost: null, unit: null },
      ];
      await e2e.connection.collection('trading-tables').insertOne({ _id: 'taxation', rows } as never);
      const withTaxes = await request(e2e.server).get('/v1/trading-tables').set('Authorization', e2e.auth('coreLaw')).expect(200);
      expect(withTaxes.body).toEqual({ ...tables, taxation: [rows[0], { ...rows[1], notes: null }] });
    });

    it('does not serve the taxes without Core Law access', async () => {
      await request(e2e.server).get('/v1/trading-tables').set('Authorization', e2e.auth('owner')).expect(403);
    });
  });

  describe('treasure tables (spec 067)', () => {
    it('requires Treasure Law access, answers 404 until imported and returns the tables once they are', async () => {
      await request(e2e.server).get('/v1/treasure-tables').expect(401);
      await request(e2e.server).get('/v1/treasure-tables').set('Authorization', e2e.auth('owner')).expect(403);
      await request(e2e.server).get('/v1/treasure-tables').set('Authorization', e2e.auth('coreLaw')).expect(403);
      const missing = await request(e2e.server).get('/v1/treasure-tables').set('Authorization', e2e.auth('treasureLaw')).expect(404);
      expect(missing.body).toMatchObject({ statusCode: 404, code: 'treasure-tables-not-found', path: '/v1/treasure-tables' });

      // A small invented document with the shape of the import, not the rulebook tables.
      const codes = { wealth: { a: 'poor' }, lifestyle: { l: 'normal' }, magic: { u: 'rich' } };
      const wealthRolls = [
        { min: 41, max: 100, rolls: 2 },
        { min: 1, max: 40, rolls: 1 },
      ];
      const melee = [{ min: 1, max: 300, label: 'E2E blade', price: { min: 5, max: 9 }, itemTypeId: 'e2e-blade' }];
      const standardPricing = { weapon: [{ bonus: 5, days: 1, level: 1, price: 10 }] };
      await e2e.connection
        .collection('treasure-tables')
        .insertOne({ _id: 'treasure', codes, wealthRolls, magicTables: { melee }, standardPricing, version: 3 } as never);

      const res = await request(e2e.server).get('/v1/treasure-tables').set('Authorization', e2e.auth('treasureLaw')).expect(200);
      const body = res.body as {
        id: string;
        version: number;
        codes: object;
        wealthRolls: object[];
        magicTables: Record<string, object[]>;
        standardPricing: Record<string, object[]>;
        gems: object;
      };
      expect(body).toMatchObject({ id: 'treasure', codes, version: 3 });
      expect(body.wealthRolls).toEqual([wealthRolls[1], wealthRolls[0]]);
      expect(body.magicTables.melee).toEqual(melee);
      expect(Object.keys(body.magicTables)).toHaveLength(6);
      expect(body.magicTables.charged).toEqual([]);
      expect(body.standardPricing.weapon).toEqual(standardPricing.weapon);
      expect(body.standardPricing.potions).toEqual([]);
      expect(body.gems).toEqual({ precious: { columns: [] }, semiPrecious: { columns: [] } });
      await request(e2e.server).get('/v1/treasure-tables').set('Authorization', e2e.auth('admin')).expect(200);
    });
  });
});
