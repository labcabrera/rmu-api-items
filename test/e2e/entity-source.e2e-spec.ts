import request from 'supertest';
import { startApp, type E2eApp, type UserName } from './support/app.js';

// Spec 063: rulebook (system) items are changed only by an admin, even by their owner; user items by their owner or an
// admin. Only an admin asks for system, on create or in a PATCH. A document without the field is a user item.
type ItemBody = { id: string; owner: string; entitySource: string; description: string | null; modifiers: { id: string }[] | null };
type ErrorBody = { statusCode: number; code: string };

const info = { weight: 1, stackable: false, rarity: 'common', unique: false };
const armor = (name: string, extra: object = {}) => ({
  name,
  category: 'armor',
  armor: { slot: 'body', at: 5, enc: 10, maneuverPenalty: -10, rangedPenalty: 0, perceptionPenalty: 0, baseDifficulty: 'm' },
  info,
  ...extra,
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

const as = (user: UserName, test: request.Test) => test.set('Authorization', e2e.auth(user));

/** An item created by the owner, with a modifier; system when an admin then marks it so (the owner stays). */
async function ownerItem(source: 'system' | 'user'): Promise<{ id: string; modifierId: string }> {
  const name = `E2E Source Armor ${++counter}`;
  const id = slug(name);
  const created = await as('owner', request(e2e.server).post('/v1/items')).send(
    armor(name, { modifiers: [{ id: 'm1', type: 'bonus', value: 5 }] }),
  );
  expect(created.status).toBe(201);
  expect((created.body as ItemBody).entitySource).toBe('user');
  if (source === 'system') {
    const marked = await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ entitySource: 'system' });
    expect(marked.status).toBe(200);
    expect(marked.body as ItemBody).toMatchObject({ entitySource: 'system', owner: 'e2e-owner' });
  }
  return { id, modifierId: 'm1' };
}

const expectSystemAdminOnly = (response: request.Response) => {
  expect(response.status).toBe(403);
  expect(response.body as ErrorBody).toMatchObject({ statusCode: 403, code: 'system-entity-admin-only' });
};

describe('a system item', () => {
  it('cannot be changed by its rmu-user owner', async () => {
    const { id } = await ownerItem('system');
    expectSystemAdminOnly(await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By owner' }));
    const stored = await as('owner', request(e2e.server).get(`/v1/items/${id}`));
    expect((stored.body as ItemBody).description).toBeUndefined();
  });

  it('cannot be deleted by its rmu-user owner', async () => {
    const { id } = await ownerItem('system');
    expectSystemAdminOnly(await as('owner', request(e2e.server).delete(`/v1/items/${id}`)));
    expect((await as('owner', request(e2e.server).get(`/v1/items/${id}`))).status).toBe(200);
  });

  it('does not take or lose modifiers from its rmu-user owner', async () => {
    const { id, modifierId } = await ownerItem('system');
    expectSystemAdminOnly(await as('owner', request(e2e.server).post(`/v1/items/${id}/modifiers`)).send({ type: 'bonus', value: 1 }));
    expectSystemAdminOnly(await as('owner', request(e2e.server).delete(`/v1/items/${id}/modifiers/${modifierId}`)));
  });

  it('cannot be changed by another rmu-user', async () => {
    const { id } = await ownerItem('system');
    expectSystemAdminOnly(await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By other' }));
  });

  it('is changed and deleted by an admin', async () => {
    const { id, modifierId } = await ownerItem('system');
    const changed = await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' });
    expect(changed.status).toBe(200);
    expect(changed.body as ItemBody).toMatchObject({ description: 'By admin', entitySource: 'system', owner: 'e2e-owner' });
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}/modifiers/${modifierId}`))).status).toBe(200);
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });

  it('goes back to user only through an admin', async () => {
    const { id } = await ownerItem('system');
    expectSystemAdminOnly(await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ entitySource: 'user' }));
    const back = await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ entitySource: 'user' });
    expect(back.status).toBe(200);
    expect(back.body as ItemBody).toMatchObject({ entitySource: 'user', owner: 'e2e-owner' });
    expect((await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'Mine again' })).status).toBe(200);
  });
});

describe('a user item', () => {
  it('is changed and deleted by its owner', async () => {
    const { id } = await ownerItem('user');
    const changed = await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By owner' });
    expect(changed.status).toBe(200);
    expect((changed.body as ItemBody).entitySource).toBe('user');
    expect((await as('owner', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });

  it('is changed and deleted by an admin', async () => {
    const { id } = await ownerItem('user');
    expect((await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' })).status).toBe(200);
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });

  it('keeps the plain forbidden code for another rmu-user', async () => {
    const { id } = await ownerItem('user');
    const response = await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By other' });
    expect(response.status).toBe(403);
    expect((response.body as ErrorBody).code).toBe('forbidden');
  });

  it('cannot be made system by its rmu-user owner', async () => {
    const { id } = await ownerItem('user');
    expectSystemAdminOnly(await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ entitySource: 'system' }));
    expect(((await as('owner', request(e2e.server).get(`/v1/items/${id}`))).body as ItemBody).entitySource).toBe('user');
  });
});

describe('creation', () => {
  it('rejects system from an rmu-user with system-entity-admin-only', async () => {
    const name = 'E2E Source User System';
    expectSystemAdminOnly(await as('owner', request(e2e.server).post('/v1/items')).send(armor(name, { entitySource: 'system' })));
    expect((await as('owner', request(e2e.server).get(`/v1/items/${slug(name)}`))).status).toBe(404);
  });

  it('stores system for an admin who asks for it, and user by default', async () => {
    const system = await as('admin', request(e2e.server).post('/v1/items')).send(
      armor('E2E Source Admin System', { entitySource: 'system' }),
    );
    expect(system.status).toBe(201);
    expect((system.body as ItemBody).entitySource).toBe('system');
    const plain = await as('admin', request(e2e.server).post('/v1/items')).send(armor('E2E Source Admin Default'));
    expect(plain.status).toBe(201);
    expect((plain.body as ItemBody).entitySource).toBe('user');
    const stored = await e2e.connection.collection('items').findOne({ _id: 'e2e-source-admin-default' as never });
    expect(stored?.entitySource).toBe('user');
  });

  it('rejects an unknown source with a 400', async () => {
    const response = await as('admin', request(e2e.server).post('/v1/items')).send(armor('E2E Source Bad', { entitySource: 'book' }));
    expect(response.status).toBe(400);
  });
});

describe('a document stored without the field', () => {
  beforeAll(async () => {
    const { id } = await ownerItem('user');
    await e2e.connection.collection('items').updateOne({ _id: id as never }, { $unset: { entitySource: '' } });
    legacyId = id;
  });

  let legacyId: string;

  it('is read as user', async () => {
    const response = await as('other', request(e2e.server).get(`/v1/items/${legacyId}`));
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).entitySource).toBe('user');
    const page = await as(
      'other',
      request(e2e.server)
        .get('/v1/items')
        .query({ q: `id==${legacyId}` }),
    );
    expect((page.body as { content: ItemBody[] }).content.map(item => item.entitySource)).toEqual(['user']);
  });

  it('is changed by its owner, as a user item', async () => {
    const response = await as('owner', request(e2e.server).patch(`/v1/items/${legacyId}`)).send({ description: 'Legacy' });
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).entitySource).toBe('user');
  });
});
