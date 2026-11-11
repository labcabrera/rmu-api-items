import request from 'supertest';
import { startApp, type E2eApp, type UserName } from './support/app.js';

// The permission matrix of the global catalog (items without realm): it is readable by everyone with a token (spec 021,
// decision 2, F-items-06); creating, changing, deleting and the modifiers are only for an admin (spec 073, decision 3),
// whoever created the item. Items with a realm follow the realm level: see realm-access.e2e-spec.ts.
type Caller = Exclude<UserName, 'writer' | 'reader' | 'coreLaw' | 'treasureLaw'> | 'anonymous';

const info = { weight: 1, stackable: false, rarity: 'common', unique: false };
const armor = (name: string) => ({
  name,
  category: 'armor',
  armor: { slot: 'body', at: 5, enc: 10, maneuverPenalty: -10, rangedPenalty: 0, perceptionPenalty: 0, baseDifficulty: 'm' },
  info,
});
const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

let e2e: E2eApp;
let counter = 0;

beforeAll(async () => {
  e2e = await startApp();
});

afterAll(async () => {
  await e2e?.stop();
});

const as = (caller: Caller, test: request.Test) => (caller === 'anonymous' ? test : test.set('Authorization', e2e.auth(caller)));

/** A new global item created by the admin, with a modifier, for each case. */
async function globalItem(): Promise<{ id: string; modifierId: string }> {
  const name = `E2E Perm Armor ${++counter}`;
  const created = await request(e2e.server).post('/v1/items').set('Authorization', e2e.auth('admin')).send(armor(name));
  expect(created.status).toBe(201);
  const withModifier = await request(e2e.server)
    .post(`/v1/items/${slug(name)}/modifiers`)
    .set('Authorization', e2e.auth('admin'))
    .send({ type: 'bonus', value: 5 });
  expect(withModifier.status).toBe(201);
  return { id: slug(name), modifierId: (withModifier.body as { modifiers: { id: string }[] }).modifiers[0].id };
}

type Expected = { read: number; create: number; createCode?: string; write: number; remove: number; modifier: number };

const expected: Record<Caller, Expected> = {
  admin: { read: 200, create: 201, write: 200, remove: 204, modifier: 201 },
  owner: { read: 200, create: 403, createCode: 'global-entity-admin-only', write: 403, remove: 403, modifier: 403 },
  other: { read: 200, create: 403, createCode: 'global-entity-admin-only', write: 403, remove: 403, modifier: 403 },
  noRole: { read: 200, create: 403, createCode: 'forbidden', write: 403, remove: 403, modifier: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401, modifier: 401 },
};

describe.each(Object.keys(expected) as Caller[])('as %s', caller => {
  const status = expected[caller];

  it(`reads the catalog: ${status.read}`, async () => {
    const { id } = await globalItem();
    expect((await as(caller, request(e2e.server).get(`/v1/items/${id}`))).status).toBe(status.read);
    expect((await as(caller, request(e2e.server).get('/v1/items'))).status).toBe(status.read);
  });

  it(`creates an item without realm: ${status.create}`, async () => {
    const name = `E2E Perm New ${caller}`;
    const response = await as(caller, request(e2e.server).post('/v1/items')).send(armor(name));
    expect(response.status).toBe(status.create);
    if (status.createCode) expect((response.body as { code: string }).code).toBe(status.createCode);
    const stored = await request(e2e.server)
      .get(`/v1/items/${slug(name)}`)
      .set('Authorization', e2e.auth('admin'));
    expect(stored.status).toBe(status.create === 201 ? 200 : 404);
  });

  it(`changes a global item: ${status.write}`, async () => {
    const { id } = await globalItem();
    const response = await as(caller, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: `By ${caller}` });
    expect(response.status).toBe(status.write);
    const stored = await request(e2e.server).get(`/v1/items/${id}`).set('Authorization', e2e.auth('admin'));
    expect((stored.body as { description: string | null }).description === `By ${caller}`).toBe(status.write === 200);
  });

  it(`deletes a global item: ${status.remove}`, async () => {
    const { id } = await globalItem();
    expect((await as(caller, request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(status.remove);
    const stored = await request(e2e.server).get(`/v1/items/${id}`).set('Authorization', e2e.auth('admin'));
    expect(stored.status).toBe(status.remove === 204 ? 404 : 200);
  });

  it(`adds and removes a modifier of a global item: ${status.modifier}`, async () => {
    const { id, modifierId } = await globalItem();
    const added = await as(caller, request(e2e.server).post(`/v1/items/${id}/modifiers`)).send({ type: 'bonus', value: 1 });
    expect(added.status).toBe(status.modifier);
    const removed = await as(caller, request(e2e.server).delete(`/v1/items/${id}/modifiers/${modifierId}`));
    expect(removed.status).toBe(status.modifier === 201 ? 200 : status.modifier);
  });
});
