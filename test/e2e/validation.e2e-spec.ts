import request from 'supertest';
import { startApp, type E2eApp } from './support/app.js';

// Spec 044, fallo 10: the body is validated as sent (no implicit conversion); the query converts page and size itself.
describe('explicit conversion', () => {
  let e2e: E2eApp;

  const info = { weight: 1, stackable: false, rarity: 'common', unique: false };
  const item = (extra: Record<string, unknown> = {}) => ({
    name: 'Conversion shield',
    category: 'shield',
    shield: { db: 20, blockCount: 1 },
    info,
    ...extra,
  });
  const create = (body: object) => request(e2e.server).post('/v1/items').set('Authorization', e2e.auth('owner')).send(body);

  beforeAll(async () => {
    e2e = await startApp();
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('accepts the item as typed', async () => {
    expect((await create(item())).status).toBe(201);
  });

  it('rejects a number in a string field', async () => {
    const response = await create(item({ name: 42 }));
    expect(response.status).toBe(400);
    expect((response.body as { message: string[] }).message).toContain('name must be a string');
  });

  it('rejects a string in a boolean field', async () => {
    expect((await create(item({ info: { ...info, stackable: 'true' } }))).status).toBe(400);
    expect((await create(item({ info: { ...info, unique: 'false' } }))).status).toBe(400);
  });

  it('rejects a string in a number field', async () => {
    expect((await create(item({ info: { ...info, weight: '1' } }))).status).toBe(400);
  });

  it('still converts page and size from the query', async () => {
    const response = await request(e2e.server).get('/v1/items?page=0&size=20').set('Authorization', e2e.auth('owner'));
    expect(response.status).toBe(200);
    expect((response.body as { pagination: unknown }).pagination).toMatchObject({ page: 0, size: 20 });
    const bad = await request(e2e.server).get('/v1/items?size=abc').set('Authorization', e2e.auth('owner'));
    expect(bad.status).toBe(400);
  });
});
