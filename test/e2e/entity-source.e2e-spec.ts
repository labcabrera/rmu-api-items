import request from 'supertest';
import { REALM_ACCESS, startApp, type E2eApp, type UserName } from './support/app.js';

// Spec 063: rulebook (system) items are changed only by an admin, even by their owner or a writer of their realm; user
// items by whoever writes their realm (spec 073) or an admin. Only an admin asks for system, on create or in a PATCH. A
// document without the field is a user item. Items without realm (global) are changed only by an admin (spec 073,
// decision 3), whatever their source or owner.
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

/** The realm of the suite: every user writes it unless REALM_ACCESS says otherwise. */
const REALM = 'e2e-realm';

/** Makes `e2e-other` a reader of the realm, for the cases that deny another user. */
const otherOnlyReads = () => {
  REALM_ACCESS.set(`${REALM}:e2e-other`, 'read');
  e2e.clearRealmAccess();
};

afterEach(() => {
  REALM_ACCESS.clear();
  e2e.clearRealmAccess();
});

/** An item created by the owner in the realm, with a modifier; system when an admin then marks it so (the owner stays). */
async function ownerItem(source: 'system' | 'user'): Promise<{ id: string; modifierId: string }> {
  const name = `E2E Source Armor ${++counter}`;
  const id = slug(name);
  const created = await as('owner', request(e2e.server).post('/v1/items')).send(
    armor(name, { realmId: REALM, modifiers: [{ id: 'm1', type: 'bonus', value: 5 }] }),
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

  it('cannot be changed by another rmu-user, even a writer of the realm', async () => {
    const { id } = await ownerItem('system');
    expectSystemAdminOnly(await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By other' }));
    otherOnlyReads();
    expectSystemAdminOnly(await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By reader' }));
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
  it('is changed and deleted by a writer of the realm', async () => {
    const { id } = await ownerItem('user');
    const changed = await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By writer' });
    expect(changed.status).toBe(200);
    expect((changed.body as ItemBody).entitySource).toBe('user');
    expect((await as('other', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });

  it('is changed and deleted by an admin', async () => {
    const { id } = await ownerItem('user');
    expect((await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' })).status).toBe(200);
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });

  it('keeps the plain forbidden code for an rmu-user who only reads the realm', async () => {
    const { id } = await ownerItem('user');
    otherOnlyReads();
    const response = await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By other' });
    expect(response.status).toBe(403);
    expect((response.body as ErrorBody).code).toBe('forbidden');
  });

  it('cannot be made system by its rmu-user owner, a writer of the realm', async () => {
    const { id } = await ownerItem('user');
    expectSystemAdminOnly(await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ entitySource: 'system' }));
    expect(((await as('owner', request(e2e.server).get(`/v1/items/${id}`))).body as ItemBody).entitySource).toBe('user');
  });
});

describe('creation', () => {
  it('rejects system from an rmu-user with system-entity-admin-only', async () => {
    const name = 'E2E Source User System';
    expectSystemAdminOnly(
      await as('owner', request(e2e.server).post('/v1/items')).send(armor(name, { realmId: REALM, entitySource: 'system' })),
    );
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

  it('is changed by a writer of the realm, as a user item', async () => {
    const response = await as('owner', request(e2e.server).patch(`/v1/items/${legacyId}`)).send({ description: 'Legacy' });
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).entitySource).toBe('user');
  });
});

// Spec 073, decision 3: an item without realm belongs to the global catalog; its owner and its source give nothing, and
// only an admin creates, changes or deletes it or its modifiers.
describe('a global item', () => {
  async function globalItem(source: 'system' | 'user'): Promise<string> {
    const name = `E2E Source Global ${++counter}`;
    const created = await as('admin', request(e2e.server).post('/v1/items')).send(
      armor(name, { entitySource: source, modifiers: [{ id: 'm1', type: 'bonus', value: 5 }] }),
    );
    expect(created.status).toBe(201);
    expect(created.body as ItemBody).toMatchObject({ entitySource: source, owner: 'e2e-admin' });
    return slug(name);
  }

  it('of the user source is changed by no rmu-user, not even one who owns it, with forbidden', async () => {
    const id = await globalItem('user');
    // Even when the document says the rmu-user owns it
    await e2e.connection.collection('items').updateOne({ _id: id as never }, { $set: { owner: 'e2e-owner' } });
    for (const user of ['owner', 'other'] as UserName[]) {
      const patched = await as(user, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'x' });
      expect(patched.status).toBe(403);
      expect((patched.body as ErrorBody).code).toBe('forbidden');
      expect((await as(user, request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(403);
      expect((await as(user, request(e2e.server).post(`/v1/items/${id}/modifiers`)).send({ type: 'bonus', value: 1 })).status).toBe(403);
      expect((await as(user, request(e2e.server).delete(`/v1/items/${id}/modifiers/m1`))).status).toBe(403);
    }
    expect((await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' })).status).toBe(200);
  });

  it('of the system source answers system-entity-admin-only to an rmu-user and is changed by an admin', async () => {
    const id = await globalItem('system');
    expectSystemAdminOnly(await as('owner', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'x' }));
    expectSystemAdminOnly(await as('owner', request(e2e.server).delete(`/v1/items/${id}`)));
    const changed = await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' });
    expect(changed.status).toBe(200);
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });
});
