import request from 'supertest';
import { type E2eApp, startApp } from './support/app.js';

// Workspace spec 043: superior materials, rulebook content behind Core Law access. Made-up values.
describe('Materials (e2e)', () => {
  let e2e: E2eApp;

  beforeAll(async () => {
    e2e = await startApp();
    await e2e.connection.collection('materials').insertMany([
      {
        _id: 'e2e-steel',
        group: 'metal',
        durability: 3,
        workability: -7,
        bonus: 4,
        cost: { add: 1.5, multiplier: null },
        uses: ['weapon'],
      },
      { _id: 'e2e-oak', group: 'wood', durability: 2, workability: -1, bonus: 1, cost: { add: null, multiplier: 0.5 }, uses: ['shield'] },
    ] as never[]);
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('requires Core Law access', async () => {
    await request(e2e.server).get('/v1/materials').expect(401);
    await request(e2e.server).get('/v1/materials').set('Authorization', e2e.auth('owner')).expect(403);
    await request(e2e.server).get('/v1/materials/e2e-steel').set('Authorization', e2e.auth('noRole')).expect(403);
  });

  it('lists the materials by group and finds one by id', async () => {
    const list = await request(e2e.server).get('/v1/materials').set('Authorization', e2e.auth('coreLaw')).expect(200);
    expect((list.body as { id: string }[]).map(material => material.id)).toEqual(['e2e-steel', 'e2e-oak']);

    const found = await request(e2e.server).get('/v1/materials/e2e-oak').set('Authorization', e2e.auth('admin')).expect(200);
    expect(found.body).toMatchObject({ id: 'e2e-oak', group: 'wood', bonus: 1, cost: { add: null, multiplier: 0.5 }, magical: false });
  });

  it('answers 404 for an unknown material', async () => {
    await request(e2e.server).get('/v1/materials/mithril').set('Authorization', e2e.auth('coreLaw')).expect(404);
  });
});
