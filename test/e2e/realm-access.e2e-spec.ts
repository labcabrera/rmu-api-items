import type { KafkaContext } from '@nestjs/microservices';
import request from 'supertest';
import { REALM_PORT, type RealmPort } from '../../src/modules/items/application/ports/realm.port.js';
import { KafkaRealmEventConsumer, REALM_DELETED_TOPIC } from '../../src/modules/items/interfaces/messaging/kafka.realm-event-consumer.js';
import { BadGatewayError } from '../../src/modules/shared/domain/errors/errors.js';
import { ids, REALM_ACCESS, REALMS, startApp, type E2eApp, type UserName } from './support/app.js';

// Spec 073: an item of a realm takes the access of the caller to the realm (read to read and list it, write to create,
// change and delete it); its owner gives nothing; a system item is read only; an admin manages everything without
// asking core. The global catalog (no realm) is read by everyone and created and changed only by an admin (decision 3).
type ItemBody = { id: string; realmId: string | null; owner: string; entitySource: string; access: string; description?: string };
type ErrorBody = { statusCode: number; code: string };

const PRIVATE = 'e2e-private';
const PUBLIC = 'e2e-public';
const OTHER_REALM = 'e2e-other-realm';
const DOOMED = 'e2e-doomed';

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
  for (const id of [PRIVATE, PUBLIC, OTHER_REALM, DOOMED]) REALMS.set(id, { id, name: id });
  e2e = await startApp();
});

afterAll(async () => {
  await e2e?.stop();
  for (const id of [PRIVATE, PUBLIC, OTHER_REALM, DOOMED]) REALMS.delete(id);
});

/** The levels core answers: Ana (owner) owns the private realm and shares it with write and read; the public one is read by all. */
const shareRealms = () => {
  REALM_ACCESS.clear();
  const levels: Record<string, Partial<Record<UserName, string>>> = {
    [PRIVATE]: { owner: 'manage', writer: 'write', reader: 'read', other: 'none', noRole: 'none' },
    [PUBLIC]: { owner: 'manage', writer: 'read', reader: 'read', other: 'read', noRole: 'read' },
    [OTHER_REALM]: { owner: 'manage', writer: 'none', reader: 'none', other: 'none', noRole: 'none' },
  };
  for (const [realmId, byUser] of Object.entries(levels)) {
    for (const [user, level] of Object.entries(byUser)) {
      REALM_ACCESS.set(`${realmId}:e2e-${user === 'noRole' ? 'guest' : user}`, level as never);
    }
  }
  e2e.clearRealmAccess();
};

beforeEach(() => {
  shareRealms();
  e2e.accessLookups.length = 0;
});

afterAll(() => REALM_ACCESS.clear());

const as = (user: UserName, test: request.Test) => test.set('Authorization', e2e.auth(user));
const get = (user: UserName, id: string) => as(user, request(e2e.server).get(`/v1/items/${id}`));
const list = async (user: UserName, q?: string) => {
  const response = await as(user, request(e2e.server).get('/v1/items')).query({ size: 1000, ...(q ? { q } : {}) });
  expect(response.status).toBe(200);
  return response.body as { content: ItemBody[] };
};

/** A new item created by `user` (Ana by default) in `realmId`; system when an admin marks it so. */
async function newItem(realmId: string | null, options: { user?: UserName; system?: boolean } = {}): Promise<string> {
  const name = `E2E Realm Access ${++counter}`;
  const created = await as(options.user ?? 'owner', request(e2e.server).post('/v1/items')).send(
    armor(name, { realmId, modifiers: [{ id: 'm1', type: 'bonus', value: 5 }] }),
  );
  expect(created.status, JSON.stringify(created.body)).toBe(201);
  if (options.system) {
    const marked = await as('admin', request(e2e.server).patch(`/v1/items/${slug(name)}`)).send({ entitySource: 'system' });
    expect(marked.status).toBe(200);
  }
  return slug(name);
}

describe('an item of a private realm', () => {
  const expected: Record<string, { read: number; access?: string; write: number; remove: number; modifier: number }> = {
    owner: { read: 200, access: 'write', write: 200, remove: 204, modifier: 201 },
    writer: { read: 200, access: 'write', write: 200, remove: 204, modifier: 201 },
    reader: { read: 200, access: 'read', write: 403, remove: 403, modifier: 403 },
    other: { read: 403, write: 403, remove: 403, modifier: 403 },
    admin: { read: 200, access: 'manage', write: 200, remove: 204, modifier: 201 },
  };

  describe.each(Object.keys(expected) as UserName[])('as %s', user => {
    const status = expected[user];

    it(`reads it: ${status.read} (${status.access ?? '-'})`, async () => {
      const id = await newItem(PRIVATE);
      const response = await get(user, id);
      expect(response.status).toBe(status.read);
      if (status.access) expect((response.body as ItemBody).access).toBe(status.access);
      else expect((response.body as ErrorBody).code).toBe('forbidden');
    });

    it(`changes it: ${status.write}`, async () => {
      const id = await newItem(PRIVATE);
      const response = await as(user, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: `By ${user}` });
      expect(response.status).toBe(status.write);
      if (status.write === 200) expect((response.body as ItemBody).access).toBe(status.access);
    });

    it(`deletes it: ${status.remove}`, async () => {
      const id = await newItem(PRIVATE);
      expect((await as(user, request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(status.remove);
      expect((await get('admin', id)).status).toBe(status.remove === 204 ? 404 : 200);
    });

    it(`adds and removes its modifiers: ${status.modifier}`, async () => {
      const id = await newItem(PRIVATE);
      const added = await as(user, request(e2e.server).post(`/v1/items/${id}/modifiers`)).send({ type: 'bonus', value: 1 });
      expect(added.status).toBe(status.modifier);
      const removed = await as(user, request(e2e.server).delete(`/v1/items/${id}/modifiers/m1`));
      expect(removed.status).toBe(status.modifier === 201 ? 200 : status.modifier);
    });
  });

  it('gives nothing to its creator without access to the realm (answer 3)', async () => {
    const id = await newItem(PRIVATE, { user: 'writer' });
    REALM_ACCESS.set(`${PRIVATE}:e2e-writer`, 'read');
    e2e.clearRealmAccess();
    expect((await get('writer', id)).body as ItemBody).toMatchObject({ owner: 'e2e-writer', access: 'read' });
    expect((await as('writer', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(403);
    REALM_ACCESS.set(`${PRIVATE}:e2e-writer`, 'none');
    e2e.clearRealmAccess();
    expect((await get('writer', id)).status).toBe(403);
  });
});

describe('an item of a public realm', () => {
  it('is read by everyone and changed only with write', async () => {
    const id = await newItem(PUBLIC);
    expect(((await get('other', id)).body as ItemBody).access).toBe('read');
    const patched = await as('other', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By other' });
    expect(patched.status).toBe(403);
    expect((patched.body as ErrorBody).code).toBe('forbidden');
  });
});

describe('a system item of a realm', () => {
  it('is read with the realm and changed only by an admin', async () => {
    const id = await newItem(PRIVATE, { system: true });
    expect(((await get('owner', id)).body as ItemBody).access).toBe('read');
    expect(((await get('writer', id)).body as ItemBody).access).toBe('read');
    expect((await get('other', id)).status).toBe(403);
    for (const user of ['owner', 'writer'] as UserName[]) {
      const patched = await as(user, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'x' });
      expect(patched.status).toBe(403);
      expect((patched.body as ErrorBody).code).toBe('system-entity-admin-only');
    }
    expect((await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' })).status).toBe(200);
  });
});

describe('the global catalog (decision 3)', () => {
  it('answers 403 global-entity-admin-only to a user who creates without realm', async () => {
    const name = `E2E Global By User ${++counter}`;
    for (const realmId of [null, undefined]) {
      const response = await as('owner', request(e2e.server).post('/v1/items')).send(armor(name, realmId === null ? { realmId } : {}));
      expect(response.status).toBe(403);
      expect(response.body as ErrorBody).toMatchObject({ statusCode: 403, code: 'global-entity-admin-only' });
    }
    expect((await get('admin', slug(name))).status).toBe(404);
  });

  it('is created by an admin, who manages it', async () => {
    const created = await as('admin', request(e2e.server).post('/v1/items')).send(armor(`E2E Global By Admin ${++counter}`));
    expect(created.status).toBe(201);
    expect(created.body as ItemBody).toMatchObject({ realmId: null, owner: 'e2e-admin', access: 'manage' });
  });

  it('is listed and read by every user with read access, without asking core to read it', async () => {
    const id = await newItem(null, { user: 'admin' });
    e2e.accessLookups.length = 0;
    for (const user of ['owner', 'other', 'reader', 'noRole'] as UserName[]) {
      expect(((await get(user, id)).body as ItemBody).access).toBe('read');
    }
    expect(((await get('admin', id)).body as ItemBody).access).toBe('manage');
    // Reading a global item needs no call to core
    expect(e2e.accessLookups).toEqual([]);
    const listed = await list('other', `id==${id}`);
    expect(listed.content.map(item => [item.id, item.access])).toEqual([[id, 'read']]);
  });

  it('is changed and deleted only by an admin, also when a user owns it', async () => {
    const id = await newItem(null, { user: 'admin' });
    await e2e.connection.collection('items').updateOne({ _id: id as never }, { $set: { owner: 'e2e-owner' } });
    expect(((await get('owner', id)).body as ItemBody).access).toBe('read');
    for (const user of ['owner', 'other'] as UserName[]) {
      const patched = await as(user, request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'x' });
      expect(patched.status).toBe(403);
      expect((patched.body as ErrorBody).code).toBe('forbidden');
      const deleted = await as(user, request(e2e.server).delete(`/v1/items/${id}`));
      expect(deleted.status).toBe(403);
      expect((deleted.body as ErrorBody).code).toBe('forbidden');
    }
    expect(((await get('admin', id)).body as ItemBody).description).not.toBe('x');
    expect((await as('admin', request(e2e.server).patch(`/v1/items/${id}`)).send({ description: 'By admin' })).status).toBe(200);
    expect((await as('admin', request(e2e.server).delete(`/v1/items/${id}`))).status).toBe(204);
  });
});

describe('lists', () => {
  it('show the global catalog and the realms the caller reads, with the access of each row', async () => {
    const global = await newItem(null, { user: 'admin' });
    const privateItem = await newItem(PRIVATE);
    const publicItem = await newItem(PUBLIC);
    const hidden = await newItem(OTHER_REALM);
    e2e.accessLookups.length = 0;

    const q = `id=in=(${[global, privateItem, publicItem, hidden].join(',')})`;
    expect(ids(await list('other', q)).sort()).toEqual([global, publicItem].sort());
    const asReader = await list('reader', q);
    expect(ids(asReader).sort()).toEqual([global, privateItem, publicItem].sort());
    expect(asReader.content.find(item => item.id === privateItem)?.access).toBe('read');
    const asWriter = await list('writer', q);
    expect(asWriter.content.find(item => item.id === privateItem)?.access).toBe('write');
    expect(asWriter.content.find(item => item.id === publicItem)?.access).toBe('read');
    const asAdmin = await list('admin', q);
    expect(ids(asAdmin).sort()).toEqual([global, privateItem, publicItem, hidden].sort());
    expect(asAdmin.content.every(item => item.access === 'manage')).toBe(true);

    // One call per user, and none for the admin
    expect(e2e.accessLookups).toEqual(['e2e-other', 'e2e-reader', 'e2e-writer']);
  });

  it('keep the levels of a user 30 seconds (decision 6)', async () => {
    const privateItem = await newItem(PRIVATE);
    const q = `id==${privateItem}`;
    expect(ids(await list('reader', q))).toEqual([privateItem]);
    REALM_ACCESS.set(`${PRIVATE}:e2e-reader`, 'none');
    expect(ids(await list('reader', q))).toEqual([privateItem]);
    e2e.clearRealmAccess();
    expect(ids(await list('reader', q))).toEqual([]);
  });

  it('fail with 502 when core fails, never opening the access', async () => {
    const port = e2e.app.get<RealmPort>(REALM_PORT);
    const spy = vi.spyOn(port, 'fetchUserRealms').mockRejectedValue(new BadGatewayError('core is not available'));
    try {
      const response = await as('reader', request(e2e.server).get('/v1/items'));
      expect(response.status).toBe(502);
      expect((response.body as ErrorBody).code).toBe('bad-gateway');
      // An admin does not ask core
      expect((await as('admin', request(e2e.server).get('/v1/items'))).status).toBe(200);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('create in a realm (decision 4)', () => {
  it('needs write on the realm', async () => {
    const created = await as('writer', request(e2e.server).post('/v1/items')).send(
      armor(`E2E Writer Armor ${++counter}`, { realmId: PRIVATE }),
    );
    expect(created.status).toBe(201);
    expect(created.body as ItemBody).toMatchObject({ realmId: PRIVATE, owner: 'e2e-writer', access: 'write' });
  });

  it('answers 403 realm-not-writable to a reader', async () => {
    const response = await as('reader', request(e2e.server).post('/v1/items')).send(
      armor(`E2E Reader Armor ${++counter}`, { realmId: PRIVATE }),
    );
    expect(response.status).toBe(403);
    expect(response.body as ErrorBody).toMatchObject({ statusCode: 403, code: 'realm-not-writable' });
  });

  it('answers 400 realm-not-readable to a stranger', async () => {
    const response = await as('other', request(e2e.server).post('/v1/items')).send(
      armor(`E2E Stranger Armor ${++counter}`, { realmId: PRIVATE }),
    );
    expect(response.status).toBe(400);
    expect((response.body as ErrorBody).code).toBe('realm-not-readable');
  });

  it('asks core again, so a new share counts at once', async () => {
    await list('reader');
    REALM_ACCESS.set(`${PRIVATE}:e2e-reader`, 'write');
    const created = await as('reader', request(e2e.server).post('/v1/items')).send(
      armor(`E2E New Share ${++counter}`, { realmId: PRIVATE }),
    );
    expect(created.status).toBe(201);
  });

  it('lets an admin create in any realm without asking core', async () => {
    const created = await as('admin', request(e2e.server).post('/v1/items')).send(
      armor(`E2E Admin Armor ${++counter}`, { realmId: OTHER_REALM }),
    );
    expect(created.status).toBe(201);
    expect((created.body as ItemBody).access).toBe('manage');
    expect(e2e.accessLookups).toEqual([]);
  });
});

describe('realm.deleted (decision 9)', () => {
  const context = { getTopic: () => REALM_DELETED_TOPIC } as unknown as KafkaContext;
  const deleteRealm = (realmId: string) => e2e.app.get(KafkaRealmEventConsumer).handleRealmDeleted({ data: { id: realmId } }, context);

  it('deletes the items of the realm, publishing item.deleted, and keeps the rest', async () => {
    const first = await newItem(DOOMED);
    const second = await newItem(DOOMED, { system: true });
    const kept = await newItem(PRIVATE);
    const global = await newItem(null, { user: 'admin' });
    e2e.events.length = 0;

    await deleteRealm(DOOMED);

    expect((await get('admin', first)).status).toBe(404);
    expect((await get('admin', second)).status).toBe(404);
    expect((await get('admin', kept)).status).toBe(200);
    expect((await get('admin', global)).status).toBe(200);
    expect(e2e.events.map(event => [event.topic, event.message.data.id]).sort()).toEqual(
      [
        ['internal.rmu-items.item.deleted.v1', first],
        ['internal.rmu-items.item.deleted.v1', second],
      ].sort(),
    );
  });

  it('does nothing when repeated', async () => {
    await newItem(DOOMED);
    await deleteRealm(DOOMED);
    e2e.events.length = 0;

    await deleteRealm(DOOMED);

    expect(e2e.events).toEqual([]);
  });
});
