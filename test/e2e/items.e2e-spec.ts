import request from 'supertest';
import { ids, REALM_ACCESS, startApp, type E2eApp, type UserName } from './support/app.js';

type ItemBody = {
  id: string;
  name: string;
  realmId: string | null;
  category: string;
  weapon: { skillId: string; fumble: number; modes: { type: string; attackTable: string }[] } | null;
  armor: { slot: string; at: number } | null;
  shield: { db: number; blockCount: number } | null;
  info: Record<string, unknown>;
  modifiers: { id: string; type: string; modifier?: string; value?: number }[] | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
};

type PageBody = { content: ItemBody[]; pagination: { page: number; size: number; totalElements: number; totalPages: number } };

const info = { weight: 1.5, stackable: false, rarity: 'common', unique: false, cost: { min: 1, average: 2, max: 3 } };

const weapon = (name: string, extra: Record<string, unknown> = {}) => ({
  name,
  category: 'weapon',
  weapon: {
    skillId: 'dagger',
    fumble: 3,
    modes: [{ type: 'one-hand', attackTypes: ['melee'], attackTable: 'dagger', fumbleTable: 'dagger', sizeAdjustment: 0 }],
  },
  info,
  description: 'An e2e weapon',
  ...extra,
});

const armor = (name: string) => ({
  name,
  category: 'armor',
  armor: { slot: 'body', at: 5, enc: 10, maneuverPenalty: -10, rangedPenalty: 0, perceptionPenalty: 0, baseDifficulty: 'm' },
  info,
});

const shield = (name: string) => ({ name, category: 'shield', shield: { db: 20, blockCount: 1 }, info });

let e2e: E2eApp;

beforeAll(async () => {
  e2e = await startApp();
});

afterAll(async () => {
  await e2e?.stop();
});

// Spec 073, decision 3: only an admin creates items without realm, so the items of the suite live in e2e-realm, which
// every user writes unless REALM_ACCESS says otherwise. A body with its own realmId (also null) keeps it.
const REALM = 'e2e-realm';
const create = (user: UserName, body: object) =>
  request(e2e.server)
    .post('/v1/items')
    .set('Authorization', e2e.auth(user))
    .send({ realmId: REALM, ...body });
const get = (user: UserName, path: string) => request(e2e.server).get(path).set('Authorization', e2e.auth(user));
const patch = (user: UserName, id: string, body: object) =>
  request(e2e.server).patch(`/v1/items/${id}`).set('Authorization', e2e.auth(user)).send(body);
const remove = (user: UserName, id: string) => request(e2e.server).delete(`/v1/items/${id}`).set('Authorization', e2e.auth(user));
const eventsOf = (id: string) => e2e.events.filter(event => event.message.data.id === id);

describe('authentication', () => {
  it('rejects a request without a token', async () => {
    const response = await request(e2e.server).get('/v1/items');
    expect(response.status).toBe(401);
  });

  it('rejects a token signed with another key', async () => {
    const response = await request(e2e.server).get('/v1/items').set('Authorization', 'Bearer a.b.c');
    expect(response.status).toBe(401);
  });

  it('rejects a token from another issuer', async () => {
    const token = e2e.jwks.token({ sub: 'e2e-owner', groups: ['rmu-user'], iss: 'http://localhost/sso/realms/other' });
    const response = await request(e2e.server).get('/v1/items').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const token = e2e.jwks.token({ sub: 'e2e-owner', groups: ['rmu-user'], exp: Math.floor(Date.now() / 1000) - 60 });
    const response = await request(e2e.server).get('/v1/items').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('answers the health check without a token', async () => {
    const response = await request(e2e.server).get('/v1/health');
    expect(response.status).toBe(200);
  });

  // The catalog is readable by everyone (spec 021, decision 2); writing needs a role (see permissions.e2e-spec.ts).
  it('lets a user without roles list the items', async () => {
    const response = await get('noRole', '/v1/items');
    expect(response.status).toBe(200);
  });

  it('rejects an item from a user without roles [F-items-06]', async () => {
    const response = await create('noRole', armor('E2E Guest Armor 2'));
    expect(response.status).toBe(403);
  });
});

describe('create', () => {
  it('creates a weapon with an id derived from its name and publishes item.created', async () => {
    const response = await create('owner', weapon('E2E Long Dagger'));
    expect(response.status).toBe(201);
    const item = response.body as ItemBody;
    expect(item).toMatchObject({
      id: 'e2e-long-dagger',
      name: 'E2E Long Dagger',
      realmId: REALM,
      category: 'weapon',
      armor: null,
      shield: null,
      modifiers: null,
      description: 'An e2e weapon',
      owner: 'e2e-owner',
      info: { weight: 1.5, rarity: 'common', cost: { min: 1, average: 2, max: 3 } },
    });
    expect(item.weapon).toMatchObject({ skillId: 'dagger', fumble: 3, modes: [{ type: 'one-hand', attackTable: 'dagger' }], tags: [] });

    const events = eventsOf('e2e-long-dagger');
    expect(events.map(event => event.topic)).toEqual(['internal.rmu-items.item.created.v1']);
    // F-items-07: the producer is the Kafka client id of the API.
    expect(events[0].message).toMatchObject({ eventType: 'created', producer: 'rmu-api-items-e2e', data: { name: 'E2E Long Dagger' } });
  });

  it('creates an armor and a shield', async () => {
    const armorResponse = await create('owner', armor('E2E Chain Shirt'));
    expect(armorResponse.status).toBe(201);
    expect((armorResponse.body as ItemBody).armor).toMatchObject({ slot: 'body', at: 5 });

    const shieldResponse = await create('owner', shield('E2E Round Shield'));
    expect(shieldResponse.status).toBe(201);
    expect((shieldResponse.body as ItemBody).shield).toEqual({ db: 20, blockCount: 1 });
  });

  it('checks the realm against core', async () => {
    const response = await create('owner', weapon('E2E Realm Dagger', { realmId: 'e2e-realm' }));
    expect(response.status).toBe(201);
    expect((response.body as ItemBody).realmId).toBe('e2e-realm');
    expect(e2e.realmLookups).toContain('e2e-realm');
  });

  it('needs the user to read the realm, unless an admin (spec 071)', async () => {
    REALM_ACCESS.set('e2e-realm:e2e-owner', 'none');
    try {
      const response = await create('owner', weapon('E2E Hidden Dagger', { realmId: 'e2e-realm' }));
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'realm-not-readable' });
      REALM_ACCESS.set('e2e-realm:e2e-admin', 'none');
      expect((await create('admin', weapon('E2E Admin Dagger', { realmId: 'e2e-realm' }))).status).toBe(201);
    } finally {
      REALM_ACCESS.clear();
      // The create asked core fresh and kept "none" for the owner
      e2e.clearRealmAccess();
    }
  });

  it('rejects a realm core does not know', async () => {
    const response = await create('owner', weapon('E2E Lost Dagger', { realmId: 'missing-realm' }));
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Realm missing-realm does not exist');
  });

  it('keeps the weapon tags read by the fighting styles (spec 032), without repeating them', async () => {
    const base = weapon('E2E Tagged Rapier');
    const response = await create('owner', { ...base, weapon: { ...base.weapon, tags: ['fencing', 'fencing', 'light-blade'] } });
    expect(response.status).toBe(201);
    expect((response.body as { weapon: { tags: string[] } }).weapon.tags).toEqual(['fencing', 'light-blade']);

    const invalid = await create('owner', { ...weapon('E2E Bad Tags'), weapon: { ...base.weapon, tags: ['Not Valid'] } });
    expect(invalid.status).toBe(400);
  });

  it('requires the weapon info of a weapon', async () => {
    const response = await create('owner', { name: 'E2E Bare Weapon', category: 'weapon', info });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Required weapon info');
  });

  it('rejects armor info on a weapon', async () => {
    const response = await create('owner', { ...weapon('E2E Armored Weapon'), armor: armor('x').armor });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Armor info not allowed');
  });

  it('rejects an unknown category', async () => {
    const response = await create('owner', { name: 'E2E Thing', category: 'spaceship', info });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Invalid item category');
  });

  it('requires a name and the item info', async () => {
    const noName = await create('owner', { category: 'other', info });
    expect(noName.status).toBe(400);
    const noInfo = await create('owner', { name: 'E2E No Info', category: 'other' });
    expect(noInfo.status).toBe(400);
  });

  // The id is the name in lower case with dashes, so a second item with the same name, from any user or realm, hits
  // the unique _id: a 409. Strategic and tactical store these ids, so they stay (spec 021, decision 5: F-items-08
  // descartado).
  it('answers 409 duplicate-key to a second item with the same name', async () => {
    expect((await create('owner', armor('E2E Twin Armor'))).status).toBe(201);
    const response = await create('other', armor('E2E Twin Armor'));
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ statusCode: 409, error: 'ConflictError', code: 'duplicate-key' });
  });

  it('answers 409 duplicate-key to the same name in another realm (here the global catalog) [F-items-08]', async () => {
    const response = await create('admin', { ...armor('E2E Twin Armor'), realmId: null });
    expect(response.status).toBe(409);
    expect((response.body as { code: string }).code).toBe('duplicate-key');
  });

  // F-items-09: the nested objects are validated, so invalid data is a 400 and never reaches the mapping or Mongo.
  it('answers 400 to a weapon without modes [F-items-09]', async () => {
    const response = await create('owner', { name: 'E2E Modeless', category: 'weapon', weapon: { skillId: 'dagger', fumble: 1 }, info });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'bad-request', message: ['weapon.modes must be an array'] });
  });

  it('answers 400 to an armor without its penalties [F-items-09]', async () => {
    const response = await create('owner', { name: 'E2E Partial Armor', category: 'armor', armor: { slot: 'body', at: 5 }, info });
    expect(response.status).toBe(400);
    expect((response.body as { message: string[] }).message).toContain(
      'armor.maneuverPenalty must be a number conforming to the specified constraints',
    );
  });

  it('answers 400 to invalid values inside the nested objects [F-items-09]', async () => {
    const badMode = { type: 'three-hands', attackTypes: ['magic'], attackTable: 'dagger', fumbleTable: 'dagger', sizeAdjustment: 0 };
    const cases: object[] = [
      { name: 'E2E Bad Mode', category: 'weapon', weapon: { skillId: 'dagger', fumble: 1, modes: [badMode] }, info },
      { ...armor('E2E Bad Slot'), armor: { ...armor('x').armor, slot: 'chest', baseDifficulty: 'impossible' } },
      { ...shield('E2E Bad Shield'), shield: { db: 'big', blockCount: 1 } },
      { ...shield('E2E Bad Info'), info: { ...info, rarity: 'legendary' } },
      { ...shield('E2E No Rarity'), info: { weight: 1, stackable: false, unique: false } },
      { ...shield('E2E Bad Cost'), info: { ...info, cost: { min: 'one' } } },
      {
        ...shield('E2E Bad Range'),
        category: 'weapon',
        shield: null,
        weapon: {
          skillId: 'bow',
          fumble: 1,
          modes: [{ ...badMode, type: 'two-hands', attackTypes: ['ranged'], ranges: [{ from: 'near' }] }],
        },
      },
      { ...shield('E2E Bad Modifier'), modifiers: [{ id: 'm1', type: 'teleport' }] },
      { ...shield('E2E String Info'), info: 'cheap' },
    ];
    for (const body of cases) {
      const response = await create('owner', body);
      expect(response.status, JSON.stringify(body)).toBe(400);
    }
  });

  it('accepts the cost bounds the item form sends, also a partial cost', async () => {
    const response = await create('owner', { ...shield('E2E Partial Cost Shield'), info: { ...info, cost: { min: 5 } } });
    expect(response.status).toBe(201);
    expect((response.body as ItemBody).info.cost).toEqual({ min: 5 });
  });

  it('rejects data of another category on an item without category data', async () => {
    const response = await create('owner', { ...shield('E2E Armed Rope'), category: 'tools' });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Shield info not allowed');
  });

  // F-items-17: realmId goes in the URL of core, so it must be an id.
  it('rejects a realmId that is not an id [F-items-17]', async () => {
    for (const realmId of ['../users', 'a/b', 'x?y=1', '']) {
      const response = await create('owner', weapon(`E2E Path Dagger ${realmId.length}`, { realmId }));
      expect(response.status, realmId).toBe(400);
    }
    expect(e2e.realmLookups).not.toContain('../users');
  });
});

describe('read', () => {
  it('finds an item by id', async () => {
    await create('owner', shield('E2E Tower Shield'));
    const response = await get('other', '/v1/items/e2e-tower-shield');
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).name).toBe('E2E Tower Shield');
  });

  it('answers 404 to an unknown id, in the common error format', async () => {
    const response = await get('owner', '/v1/items/missing-item');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      error: 'NotFoundError',
      code: 'not-found',
      message: 'Item missing-item not found',
      path: '/v1/items/missing-item',
    });
    expect(typeof (response.body as { timestamp: string }).timestamp).toBe('string');
  });
});

describe('list', () => {
  beforeAll(async () => {
    for (const name of ['E2E List Axe', 'E2E List Bow', 'E2E List Club']) {
      await create('owner', weapon(name, { description: 'listed' }));
    }
  });

  it('filters by RSQL', async () => {
    const response = await get('owner', '/v1/items?q=description==listed');
    expect(response.status).toBe(200);
    expect(ids(response.body)).toEqual(['e2e-list-axe', 'e2e-list-bow', 'e2e-list-club']);
  });

  it('filters by nested fields, as the item selector does', async () => {
    const response = await get('owner', '/v1/items?q=category==armor;armor.slot==body;armor.at==5&size=250');
    expect(response.status).toBe(200);
    expect(ids(response.body)).toContain('e2e-chain-shirt');
    expect((response.body as PageBody).content.every(item => item.category === 'armor')).toBe(true);
  });

  it('pages the results sorted by id', async () => {
    const first = await get('owner', '/v1/items?q=description==listed&page=0&size=2');
    expect(ids(first.body)).toEqual(['e2e-list-axe', 'e2e-list-bow']);
    expect((first.body as PageBody).pagination).toMatchObject({ page: 0, size: 2, totalElements: 3, totalPages: 2 });
    const second = await get('owner', '/v1/items?q=description==listed&page=1&size=2');
    expect(ids(second.body)).toEqual(['e2e-list-club']);
  });

  it('uses page 0 and size 10 by default', async () => {
    const response = await get('owner', '/v1/items');
    expect((response.body as PageBody).pagination).toMatchObject({ page: 0, size: 10 });
  });

  it('rejects an invalid RSQL expression, with the path without the query [F-receta-22]', async () => {
    const response = await get('owner', '/v1/items?q=name==');
    expect(response.status).toBe(400);
    expect((response.body as { path: string }).path).toBe('/v1/items');
  });

  it('rejects a negative page and a size of 0', async () => {
    expect((await get('owner', '/v1/items?page=-1')).status).toBe(400);
    expect((await get('owner', '/v1/items?size=0')).status).toBe(400);
  });

  // The item selector of rmu-mfe-strategic asks for 250, so items is a catalog listing (decision 7).
  it('accepts pages of up to 1000 items', async () => {
    expect((await get('owner', '/v1/items?size=1000')).status).toBe(200);
    const rejected = await get('owner', '/v1/items?size=1001');
    expect(rejected.status).toBe(400);
    expect((rejected.body as { code: string }).code).toBe('bad-request');
  });
});

describe('update', () => {
  beforeAll(async () => {
    await create('owner', weapon('E2E Patch Sword'));
  });

  it('changes the fields it receives and keeps the rest', async () => {
    const response = await patch('owner', 'e2e-patch-sword', { description: 'Patched', imageUrl: 'images/sword.png' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'e2e-patch-sword',
      name: 'E2E Patch Sword',
      description: 'Patched',
      imageUrl: 'images/sword.png',
      category: 'weapon',
    });
    const read = await get('owner', '/v1/items/e2e-patch-sword');
    expect((read.body as ItemBody).description).toBe('Patched');
  });

  it('renames an item without changing its id', async () => {
    const response = await patch('owner', 'e2e-patch-sword', { name: 'E2E Renamed Sword' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 'e2e-patch-sword', name: 'E2E Renamed Sword' });
  });

  it('publishes item.updated with the new state [F-items-03]', async () => {
    const before = eventsOf('e2e-patch-sword').length;
    await patch('owner', 'e2e-patch-sword', { description: 'Patched again' });
    const events = eventsOf('e2e-patch-sword');
    expect(events.length).toBe(before + 1);
    expect(events.at(-1)?.topic).toBe('internal.rmu-items.item.updated.v1');
    expect(events.at(-1)?.message).toMatchObject({ eventType: 'updated', data: { description: 'Patched again' } });
  });

  it('counts the writes in the version and rejects a change made on a stale version', async () => {
    const created = (await create('owner', weapon('E2E Versioned Sword'))).body as ItemBody & { version: number };
    expect(created.version).toBe(0);
    const first = await patch('owner', created.id, { description: 'First', version: 0 });
    expect(first.status).toBe(200);
    expect((first.body as { version: number }).version).toBe(1);
    const stale = await patch('owner', created.id, { description: 'Stale', version: 0 });
    expect(stale.status).toBe(409);
    expect((stale.body as { code: string }).code).toBe('version-conflict');
    const withoutVersion = await patch('owner', created.id, { description: 'Latest' });
    expect(withoutVersion.body).toMatchObject({ version: 2, description: 'Latest' });
  });

  it('rejects a version that is not a non-negative integer', async () => {
    expect((await patch('owner', 'e2e-patch-sword', { version: -1 })).status).toBe(400);
    expect((await patch('owner', 'e2e-patch-sword', { version: 'one' })).status).toBe(400);
  });

  // Spec 021, decision 9: a PATCH without changes neither writes (same version) nor publishes.
  it('answers 200 to a PATCH without changes, without writing or publishing', async () => {
    const before = (await get('owner', '/v1/items/e2e-patch-sword')).body as ItemBody & { version: number };
    const eventsBefore = eventsOf('e2e-patch-sword').length;
    const empty = await patch('owner', 'e2e-patch-sword', {});
    expect(empty.status).toBe(200);
    expect(empty.body).toMatchObject({ description: before.description, version: before.version });
    const same = await patch('owner', 'e2e-patch-sword', { description: before.description, name: before.name });
    expect(same.status).toBe(200);
    expect((same.body as { version: number }).version).toBe(before.version);
    expect(eventsOf('e2e-patch-sword').length).toBe(eventsBefore);
  });

  it('answers 404 to an unknown id', async () => {
    const response = await patch('owner', 'missing-item', { description: 'x' });
    expect(response.status).toBe(404);
  });

  it('rejects a change from a user who only reads the realm [F-items-06]', async () => {
    REALM_ACCESS.set(`${REALM}:e2e-other`, 'read');
    e2e.clearRealmAccess();
    try {
      const response = await patch('other', 'e2e-patch-sword', { description: 'Changed by another user' });
      expect(response.status).toBe(403);
    } finally {
      REALM_ACCESS.clear();
      e2e.clearRealmAccess();
    }
  });
});

describe('delete', () => {
  it('deletes an item and publishes item.deleted', async () => {
    await create('owner', armor('E2E Doomed Armor'));
    const response = await remove('owner', 'e2e-doomed-armor');
    expect(response.status).toBe(204);
    expect((await get('owner', '/v1/items/e2e-doomed-armor')).status).toBe(404);
    expect(eventsOf('e2e-doomed-armor').map(event => event.topic)).toEqual([
      'internal.rmu-items.item.created.v1',
      'internal.rmu-items.item.deleted.v1',
    ]);
  });

  it('answers 404 to an unknown id', async () => {
    const response = await remove('owner', 'missing-item');
    expect(response.status).toBe(404);
  });

  it('rejects the deletion from a user who only reads the realm [F-items-06]', async () => {
    await create('owner', armor('E2E Kept Armor'));
    REALM_ACCESS.set(`${REALM}:e2e-other`, 'read');
    e2e.clearRealmAccess();
    try {
      const response = await remove('other', 'e2e-kept-armor');
      expect(response.status).toBe(403);
      expect((await get('owner', '/v1/items/e2e-kept-armor')).status).toBe(200);
    } finally {
      REALM_ACCESS.clear();
      e2e.clearRealmAccess();
    }
  });
});

// Workspace spec 041: the general equipment categories and blocks, full suits, armor classes and improvised weapons.
describe('poisons and antidotes (spec 042)', () => {
  const poison = {
    category: 'nerve',
    level: 3,
    form: 'paste',
    maxSeverity: 'moderate',
    immediateHits: { min: 2, max: 8 },
    onsetRounds: null,
  };

  it('stores and returns a poison and an antidote', async () => {
    const created = await create('owner', {
      name: 'E2E Toadpaste',
      category: 'poison',
      features: { poison },
      info: { ...info, stackable: true },
    });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const read = (await get('owner', '/v1/items/e2e-toadpaste')).body as ItemBody & { features: object };
    expect(read.features).toEqual({ poison });

    const antidote = { categories: ['nerve', 'nerve', 'muscle'], level: 6, withinHours: 24 };
    const herb = await create('owner', { name: 'E2E Bluebell', category: 'herb', features: { antidote }, info });
    expect(herb.status, JSON.stringify(herb.body)).toBe(201);
    const readHerb = (await get('owner', '/v1/items/e2e-bluebell')).body as ItemBody & { features: object };
    expect(readHerb.features).toEqual({ antidote: { categories: ['nerve', 'muscle'], level: 6, withinHours: 24 } });
  });

  it('requires the poison block in a poison and keeps each block in its category', async () => {
    const noBlock = await create('owner', { name: 'E2E Empty Vial', category: 'poison', info });
    expect(noBlock.status).toBe(400);
    expect((noBlock.body as { message: string }).message).toBe('Required poison info');
    const onFood = await create('owner', { name: 'E2E Bad Stew', category: 'food', features: { poison }, info });
    expect((onFood.body as { message: string }).message).toBe('Poison info not allowed');
    const antidoteOnTool = await create('owner', {
      name: 'E2E Bad Kit',
      category: 'tools',
      features: { antidote: { categories: ['any'], level: 1, withinHours: null } },
      info,
    });
    expect((antidoteOnTool.body as { message: string }).message).toBe('Antidote info not allowed');
  });

  it('rejects an unknown category, an inverted range and an antidote without categories', async () => {
    const unknown = await create('owner', {
      name: 'E2E Odd',
      category: 'poison',
      features: { poison: { ...poison, category: 'mystic' } },
      info,
    });
    expect(unknown.status).toBe(400);
    const inverted = await create('owner', {
      name: 'E2E Odd Two',
      category: 'poison',
      features: { poison: { ...poison, immediateHits: { min: 9, max: 2 } } },
      info,
    });
    expect((inverted.body as { message: string }).message).toBe('Invalid poison immediate hits range');
    const empty = await create('owner', {
      name: 'E2E Odd Three',
      category: 'herb',
      features: { antidote: { categories: [], level: 1 } },
      info,
    });
    expect(empty.status).toBe(400);
  });
});

describe('general equipment (spec 041)', () => {
  const featured = (name: string, category: string, features: object, extra: Record<string, unknown> = {}) => ({
    name,
    category,
    features,
    info: { ...info, stackable: true, lotSize: 10 },
    ...extra,
  });

  it('stores and returns a container, a light, a mount and ammunition with their blocks and lot size', async () => {
    const bodies = [
      featured('E2E Sack', 'container', { container: { weight: 40, volume: 2, units: null } }),
      featured('E2E Glowstick', 'light', { light: { radius: 15, durationHours: 3 } }),
      featured('E2E Pony', 'mount', { transport: { capacity: 150, speed: null } }),
      featured('E2E Pebble', 'ammunition', { ammunition: { launchers: ['e2e-sling', 'e2e-sling'], sizeAdjustment: 1 } }),
    ];
    for (const body of bodies) {
      const response = await create('owner', body);
      expect(response.status, body.name).toBe(201);
    }
    const sack = (await get('owner', '/v1/items/e2e-sack')).body as ItemBody & { features: object };
    expect(sack.category).toBe('container');
    expect(sack.features).toEqual({ container: { weight: 40, volume: 2, liquid: null, units: null } });
    expect(sack.info.lotSize).toBe(10);
    const pebble = (await get('owner', '/v1/items/e2e-pebble')).body as ItemBody & { features: object };
    expect(pebble.features).toEqual({ ammunition: { launchers: ['e2e-sling'], sizeAdjustment: 1 } });
  });

  it('rejects the blocks on a weapon and ammunition data on other categories', async () => {
    const onWeapon = await create('owner', weapon('E2E Lamp Sword', { features: { light: { radius: 5, durationHours: 1 } } }));
    expect(onWeapon.status).toBe(400);
    const onTool = await create('owner', featured('E2E Bad Bolt', 'tools', { ammunition: { launchers: [], sizeAdjustment: 0 } }));
    expect(onTool.status).toBe(400);
    expect((onTool.body as { message: string }).message).toBe('Ammunition info not allowed');
  });

  it('accepts a tool used as an improvised weapon, with the OB modifier of its mode', async () => {
    const response = await create('owner', {
      name: 'E2E Spanner',
      category: 'tools',
      weapon: {
        skillId: 'melee-weapon@hafted',
        fumble: 4,
        modes: [
          {
            type: 'one-hand',
            attackTypes: ['melee'],
            attackTable: 'mace',
            fumbleTable: 'melee-one-hand',
            sizeAdjustment: 0,
            obModifier: -20,
          },
        ],
        tags: ['improvised'],
      },
      info,
    });
    expect(response.status).toBe(201);
    const read = (await get('owner', '/v1/items/e2e-spanner')).body as { weapon: { modes: { obModifier: number }[] } };
    expect(read.weapon.modes[0].obModifier).toBe(-20);
  });

  it('still rejects weapon data on clothes', async () => {
    const response = await create('owner', { ...weapon('E2E Armed Hat'), category: 'clothes' });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Weapon info not allowed');
  });

  it('stores the coverage of a full suit and the class of a piece', async () => {
    const suit = await create('owner', {
      ...armor('E2E Full Suit'),
      armor: { ...armor('x').armor, coverage: ['body', 'head', 'arms', 'legs'] },
    });
    expect(suit.status).toBe(201);
    expect((suit.body as ItemBody & { armor: { coverage: string[] } }).armor.coverage).toEqual(['body', 'head', 'arms', 'legs']);
    const helmet = await create('owner', {
      ...armor('E2E Medium Helmet'),
      armor: { ...armor('x').armor, slot: 'head', at: 5, class: 'medium' },
    });
    expect(helmet.status).toBe(201);
    expect((helmet.body as ItemBody & { armor: { class: string } }).armor.class).toBe('medium');
  });

  it('rejects a coverage without the slot of the piece and an unknown class', async () => {
    const coverage = await create('owner', { ...armor('E2E Odd Suit'), armor: { ...armor('x').armor, coverage: ['head'] } });
    expect(coverage.status).toBe(400);
    const klass = await create('owner', { ...armor('E2E Odd Helmet'), armor: { ...armor('x').armor, class: 'huge' } });
    expect(klass.status).toBe(400);
  });

  it('replaces the blocks on update and removes them with null', async () => {
    await create('owner', featured('E2E Lantern Box', 'light', { light: { radius: 10, durationHours: 4 } }));
    const changed = await patch('owner', 'e2e-lantern-box', { features: { light: { radius: 25, durationHours: 6 } } });
    expect(changed.status).toBe(200);
    expect((changed.body as { features: object }).features).toEqual({ light: { radius: 25, durationHours: 6 } });
    const removed = await patch('owner', 'e2e-lantern-box', { features: null });
    expect(removed.status).toBe(200);
    expect((removed.body as { features: object | null }).features).toBeNull();
  });
});

// Workspace spec 062: herbs, acids, intoxicants, gems, jewelry, animals and properties. Synthetic values only.
describe('treasure goods (spec 062)', () => {
  const herb = {
    group: 'general',
    biomes: ['F', 'D'],
    highAltitude: true,
    find: 'h',
    form: 'leaf',
    prep: 'brew',
    season: 'Spring',
    effectDelay: 'rounds',
    magical: true,
    addictionFactor: null,
    effects: { heal: { min: 2, max: 12 }, stunRelief: null, treats: ['bone', 'any'], recoveryBonus: 5 },
  };
  const acid = {
    strength: 'mild',
    splash: { severity: 'A', modifier: -40 },
    immersion: { severity: 'B', count: 2, everyRounds: 1 },
    ingestion: { level: 4, penalty: -2, perFailure: 5 },
    breakageMod: 5,
    craftDifficulty: 'm',
    targets: 'any',
  };
  const gem = {
    grade: 'precious',
    mineral: 'test-stone',
    valuePerCarat: 7.5,
    hardness: { min: 6, max: 6.5 },
    specificGravity: { min: 2.1, max: 2.4 },
    luster: 'V',
    caratsPerCm: 3.2,
    magic: { spells: 'Synthetic list', stats: ['in'], skills: null, other: null },
  };
  const jewelry = { value: { min: 1, max: 50, dice: '1d50', openEnded: true }, slot: 'finger' };
  const animal = { npcId: 'e2e-creature', trained: true, stage: 'young', domesticated: true };
  const property = { rent: 4, size: '10x10 ft', height: null };
  const intoxicant = { addictionFactor: 7, form: 'root', prep: 'ingest' };
  const goods: [string, string, object][] = [
    ['E2E Greenleaf', 'herb', { herb, antidote: { categories: ['any'], level: 2, withinHours: null } }],
    ['E2E Sourwash', 'acid', { acid }],
    ['E2E Dreamroot', 'intoxicant', { intoxicant }],
    ['E2E Bluestone', 'gem', { gem }],
    ['E2E Plain Ring', 'jewelry', { jewelry }],
    ['E2E Young Goat', 'animal', { animal }],
    ['E2E Trained Pony', 'mount', { animal: { ...animal, stage: 'adult' }, transport: { capacity: 100, speed: 30 } }],
    ['E2E Hut', 'property', { property }],
  ];

  beforeAll(async () => {
    for (const [name, category, features] of goods) {
      const response = await create('owner', { name, category, features, info: category === 'gem' ? { ...info, cost: null } : info });
      expect(response.status, JSON.stringify(response.body)).toBe(201);
    }
  });

  it('stores and returns every block as sent', async () => {
    for (const [name, category, features] of goods) {
      const id = name.toLowerCase().replaceAll(' ', '-');
      const read = (await get('owner', `/v1/items/${id}`)).body as ItemBody & { features: object };
      expect(read.category).toBe(category);
      expect(read.features).toEqual(features);
    }
    const gemItem = (await get('owner', '/v1/items/e2e-bluestone')).body as ItemBody;
    expect(gemItem.info.cost).toBeNull();
  });

  it('carries the blocks in the item.created event', () => {
    const [event] = eventsOf('e2e-bluestone');
    expect(event.topic).toBe('internal.rmu-items.item.created.v1');
    expect(event.message.data.features).toEqual({ gem });
  });

  it('filters herbs by group and biome, and gems by grade', async () => {
    const byGroup = await get('owner', '/v1/items?q=category==herb;features.herb.group==general&size=100');
    expect(byGroup.status).toBe(200);
    expect(ids(byGroup.body)).toEqual(['e2e-greenleaf']);
    const byBiome = await get('owner', '/v1/items?q=features.herb.biomes=in=(D,J)&size=100');
    expect(ids(byBiome.body)).toEqual(['e2e-greenleaf']);
    const otherBiome = await get('owner', '/v1/items?q=features.herb.biomes==J&size=100');
    expect(ids(otherBiome.body)).toEqual([]);
    const byGrade = await get('owner', '/v1/items?q=features.gem.grade==precious&size=100');
    expect(ids(byGrade.body)).toEqual(['e2e-bluestone']);
  });

  it('keeps each block in its category', async () => {
    const cases: [string, object, string][] = [
      ['food', { herb }, 'Herb info not allowed'],
      ['poison', { poison: { category: 'nerve', level: 1, form: 'paste' }, acid }, 'Acid info not allowed'],
      ['food', { intoxicant }, 'Intoxicant info not allowed'],
      ['jewelry', { gem, jewelry }, 'Gem info not allowed'],
      ['gem', { gem, jewelry }, 'Jewelry info not allowed'],
      ['vehicle', { animal }, 'Animal info not allowed'],
      ['service', { property }, 'Property info not allowed'],
    ];
    for (const [index, [category, features, message]] of cases.entries()) {
      const response = await create('owner', { name: `E2E Misplaced ${index}`, category, features, info });
      expect(response.status).toBe(400);
      expect((response.body as { message: string }).message).toBe(message);
    }
    const onWeapon = await create('owner', weapon('E2E Gem Sword', { features: { gem } }));
    expect(onWeapon.status).toBe(400);
  });

  it('rejects invalid values and inverted ranges', async () => {
    const invalid: [string, object][] = [
      ['herb', { herb: { ...herb, biomes: ['Q'] } }],
      ['herb', { herb: { ...herb, find: 'zz' } }],
      ['herb', { herb: { ...herb, form: 'Big Leaf' } }],
      ['herb', { herb: { ...herb, effects: { ...herb.effects, treats: ['fracture'] } } }],
      ['acid', { acid: { ...acid, targets: 'elves' } }],
      ['acid', { acid: { ...acid, splash: { severity: 'Z', modifier: 0 } } }],
      ['gem', { gem: { ...gem, grade: 'common' } }],
      ['animal', { animal: { ...animal, stage: 'old' } }],
      ['jewelry', { jewelry: { slot: 'finger' } }],
    ];
    for (const [index, [category, features]] of invalid.entries()) {
      const response = await create('owner', { name: `E2E Invalid ${index}`, category, features, info });
      expect(response.status, JSON.stringify(features)).toBe(400);
    }
    const ranges: [string, object, string][] = [
      ['herb', { herb: { ...herb, effects: { ...herb.effects, heal: { min: 9, max: 1 } } } }, 'Invalid herb heal range'],
      ['gem', { gem: { ...gem, hardness: { min: 8, max: 7 } } }, 'Invalid gem hardness range'],
      ['jewelry', { jewelry: { ...jewelry, value: { ...jewelry.value, min: 90 } } }, 'Invalid jewelry value range'],
    ];
    for (const [index, [category, features, message]] of ranges.entries()) {
      const response = await create('owner', { name: `E2E Inverted ${index}`, category, features, info });
      expect((response.body as { message: string }).message).toBe(message);
    }
  });

  it('changes a block with a PATCH and checks it against the category', async () => {
    const changed = await patch('owner', 'e2e-hut', { features: { property: { rent: 9, size: null, height: '1 floor' } } });
    expect(changed.status).toBe(200);
    expect((changed.body as { features: object }).features).toEqual({ property: { rent: 9, size: null, height: '1 floor' } });
    const misplaced = await patch('owner', 'e2e-hut', { features: { gem } });
    expect(misplaced.status).toBe(400);
  });
});

// Workspace spec 067: the magic block and the potion and spell-item categories. Invented values only.
describe('magic items (spec 067)', () => {
  const magic = {
    itemLevel: 6,
    kind: 'weapon',
    days: 14,
    standardPrice: 300,
    basePrice: 4,
    attunement: true,
    charges: null,
    realm: 'channeling',
    bonuses: [{ kind: 'ob', value: 15, target: null, against: 'test-wyrm' }],
    spells: [{ name: 'Test Ward', level: 5, list: 'test-list', use: 'daily', perDay: 1 }],
    section: '9.1',
  };
  const wand = {
    itemLevel: 2,
    kind: 'charged',
    days: null,
    standardPrice: null,
    basePrice: null,
    attunement: false,
    charges: 10,
    realm: 'essence',
    bonuses: [],
    spells: [{ name: 'Test Bolt', level: 2, list: null, use: 'charges', perDay: null }],
    section: null,
  };

  beforeAll(async () => {
    const sword = await create('owner', weapon('E2E Wyrm Blade', { features: { magic } }));
    expect(sword.status, JSON.stringify(sword.body)).toBe(201);
    const stick = await create('owner', { name: 'E2E Test Wand', category: 'spell-item', features: { magic: wand }, info });
    expect(stick.status, JSON.stringify(stick.body)).toBe(201);
    const potion = await create('owner', {
      name: 'E2E Test Draught',
      category: 'potion',
      features: { magic: { itemLevel: 1, kind: 'potion' } },
      info,
    });
    expect(potion.status, JSON.stringify(potion.body)).toBe(201);
  });

  it('stores and returns the block, filling the optional fields', async () => {
    const sword = (await get('owner', '/v1/items/e2e-wyrm-blade')).body as ItemBody & { features: object };
    expect(sword.category).toBe('weapon');
    expect(sword.weapon?.skillId).toBe('dagger');
    expect(sword.features).toEqual({ magic });
    const stick = (await get('owner', '/v1/items/e2e-test-wand')).body as ItemBody & { features: object };
    expect(stick.features).toEqual({ magic: wand });
    const potion = (await get('owner', '/v1/items/e2e-test-draught')).body as ItemBody & { features: { magic: object } };
    expect(potion.category).toBe('potion');
    expect(potion.features.magic).toEqual({
      itemLevel: 1,
      kind: 'potion',
      days: null,
      standardPrice: null,
      basePrice: null,
      attunement: false,
      charges: null,
      realm: null,
      bonuses: [],
      spells: [],
      section: null,
    });
  });

  it('filters by magic kind and item level', async () => {
    const byKind = await get('owner', '/v1/items?q=features.magic.kind==weapon&size=100');
    expect(byKind.status).toBe(200);
    expect(ids(byKind.body)).toEqual(['e2e-wyrm-blade']);
    const byLevel = await get('owner', '/v1/items?q=features.magic.itemLevel=le=2&size=100');
    expect(ids(byLevel.body).sort()).toEqual(['e2e-test-draught', 'e2e-test-wand']);
    const byCategory = await get('owner', '/v1/items?q=category==spell-item&size=100');
    expect(ids(byCategory.body)).toEqual(['e2e-test-wand']);
  });

  it('rejects an invalid block', async () => {
    const invalid: object[] = [
      { ...magic, kind: 'flying' },
      { ...magic, bonuses: [{ kind: 'speed', value: 1 }] },
      { ...magic, spells: [{ name: 'X', level: 1, use: 'often' }] },
      { ...magic, realm: 'arcane' },
    ];
    for (const [index, block] of invalid.entries()) {
      const response = await create('owner', { name: `E2E Bad Magic ${index}`, category: 'other', features: { magic: block }, info });
      expect(response.status, JSON.stringify(block)).toBe(400);
    }
    const priced = await create('owner', {
      name: 'E2E Bad Magic Price',
      category: 'other',
      features: { magic: { ...magic, basePrice: 999 } },
      info,
    });
    expect((priced.body as { message: string }).message).toBe('The magic item base price exceeds its standard price');
  });

  it('changes the block with a PATCH', async () => {
    const changed = await patch('owner', 'e2e-test-wand', { features: { magic: { ...wand, charges: 20 } } });
    expect(changed.status).toBe(200);
    expect((changed.body as { features: { magic: { charges: number } } }).features.magic.charges).toBe(20);
  });
});
