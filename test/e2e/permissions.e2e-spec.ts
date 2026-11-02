import request from 'supertest';
import { startApp, type E2eApp, type UserName } from './support/app.js';

// The permission matrix of items (spec 021, decision 2, F-items-06): the catalog is readable by everyone; creating
// needs rmu-user or rmu-admin; changing, deleting and the modifiers are for the owner or an admin.
type Caller = UserName | 'anonymous';

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

/** A new item of the owner, with a modifier, for each case. */
async function ownerItem(): Promise<{ id: string; modifierId: string }> {
  const name = `E2E Perm Armor ${++counter}`;
  const created = await request(e2e.server).post('/v1/items').set('Authorization', e2e.auth('owner')).send(armor(name));
  expect(created.status).toBe(201);
  const withModifier = await request(e2e.server)
    .post(`/v1/items/${slug(name)}/modifiers`)
    .set('Authorization', e2e.auth('owner'))
    .send({ type: 'bonus', value: 5 });
  expect(withModifier.status).toBe(201);
  return { id: slug(name), modifierId: (withModifier.body as { modifiers: { id: string }[] }).modifiers[0].id };
}

const expected: Record<Caller, { read: number; create: number; write: number; remove: number; modifier: number }> = {
  owner: { read: 200, create: 201, write: 200, remove: 204, modifier: 201 },
  admin: { read: 200, create: 201, write: 200, remove: 204, modifier: 201 },
  other: { read: 200, create: 201, write: 403, remove: 403, modifier: 403 },
  noRole: { read: 200, create: 403, write: 403, remove: 403, modifier: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401, modifier: 401 },
};

describe.each(Object.keys(expected) as Caller[])('as %s', caller => {
  const status = expected[caller];

  it(`reads the catalog: ${status.read}`, async () => {
    const { id } = await ownerItem();
    expect((await as(caller, request(e2e.server).get(`/v1/items/${id}`))).status).toBe(status.read);
    expect((await as(caller, request(e2e.server).get('/v1/items'))).status).toBe(status.read);
  });

  it(`creates an item: ${status.create}`, async () => {
    const response = await as(caller, request(e2e.server).post('/v1/items')).send(armor(`E2E Perm New ${caller}`));
    expect(response.status).toBe(status.create);
    if (status.create === 403) expect((response.body as { code: string }).code).toBe('forbidden');
  });

  it(`changes the owner's item: ${status.write}`, async () => {
    const { id } = await ownerItem();
    const response = await as(caller, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: `By ${caller}` });
    expect(response.status).toBe(status.write);
    const stored = await request(e2e.server).get(`/v1/items/${id}`).set('Authorization', e2e.auth('owner'));
    expect((stored.body as { description: string | null }).description === `By ${caller}`).toBe(status.write === 200);
  });

  it(`deletes the owner's item: ${status.remove}`, async () => {
    const { id } = await ownerItem();
    expect((await as(caller, request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(status.remove);
    const stored = await request(e2e.server).get(`/v1/items/${id}`).set('Authorization', e2e.auth('owner'));
    expect(stored.status).toBe(status.remove === 204 ? 404 : 200);
  });

  it(`adds and removes a modifier of the owner's item: ${status.modifier}`, async () => {
    const { id, modifierId } = await ownerItem();
    const added = await as(caller, request(e2e.server).post(`/v1/items/${id}/modifiers`)).send({ type: 'bonus', value: 1 });
    expect(added.status).toBe(status.modifier);
    const removed = await as(caller, request(e2e.server).delete(`/v1/items/${id}/modifiers/${modifierId}`));
    expect(removed.status).toBe(status.modifier === 201 ? 200 : status.modifier);
  });
});
