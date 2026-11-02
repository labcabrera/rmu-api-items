import request from 'supertest';
import { startApp, type E2eApp, type UserName } from './support/app.js';

type Modifier = { id: string; type: string; modifier?: string; value?: number };
type ItemBody = { id: string; category: string; weapon: unknown; armor: unknown; modifiers: Modifier[] | null };

const info = { weight: 1, stackable: false, rarity: 'common', unique: false };
const armor = { slot: 'body', at: 5, enc: 10, maneuverPenalty: -10, rangedPenalty: 0, perceptionPenalty: 0, baseDifficulty: 'm' };

let e2e: E2eApp;

beforeAll(async () => {
  e2e = await startApp();
});

afterAll(async () => {
  await e2e?.stop();
});

const auth = (user: UserName) => e2e.auth(user);
const createArmor = (name: string) =>
  request(e2e.server).post('/v1/items').set('Authorization', auth('owner')).send({ name, category: 'armor', armor, info });
const addModifier = (user: UserName, itemId: string, body: object) =>
  request(e2e.server).post(`/v1/items/${itemId}/modifiers`).set('Authorization', auth(user)).send(body);
const removeModifier = (user: UserName, itemId: string, modifierId: string) =>
  request(e2e.server).delete(`/v1/items/${itemId}/modifiers/${modifierId}`).set('Authorization', auth(user));

describe('modifier options', () => {
  // The options are a static list, public also without a token (spec 021, decision 2: F-items-20 descartado).
  it('lists the options without a token', async () => {
    const response = await request(e2e.server).get('/v1/item-modifiers/options');
    expect(response.status).toBe(200);
    const options = response.body as { modifierType: string; value: string; modifier: string }[];
    expect(options.map(option => option.modifierType)).toEqual(['bonus', 'item-damage', 'skill-bonus', 'material', 'slayer']);
    expect(options[0]).toMatchObject({ modifierType: 'bonus', selectorType: null, value: 'required', modifier: 'forbidden' });
  });
});

describe('item modifiers', () => {
  let modifierId: string;

  const storedUpdatedAt = async () => {
    const doc = await e2e.connection.collection('items').findOne({ _id: 'e2e-magic-armor' as never });
    return (doc as { updatedAt?: Date | null } | null)?.updatedAt ?? null;
  };

  beforeAll(async () => {
    expect((await createArmor('E2E Magic Armor')).status).toBe(201);
  });

  it('adds a modifier with a generated id, updates updatedAt and publishes item.updated [F-items-19]', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'bonus', value: 10 });
    expect(response.status).toBe(201);
    expect(await storedUpdatedAt()).toBeInstanceOf(Date);
    const item = response.body as ItemBody;
    expect(item.modifiers).toHaveLength(1);
    expect(item.modifiers![0]).toMatchObject({ type: 'bonus', value: 10 });
    modifierId = item.modifiers![0].id;
    expect((response.body as { version: number }).version).toBe(1);
    expect(modifierId).toMatch(/^[0-9a-f-]{36}$/);
    const topics = e2e.events.filter(event => event.message.data.id === 'e2e-magic-armor').map(event => event.topic);
    expect(topics).toEqual(['internal.rmu-items.item.created.v1', 'internal.rmu-items.item.updated.v1']);
  });

  it('adds a second modifier with a target', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'slayer', modifier: 'dragons' });
    expect(response.status).toBe(201);
    expect((response.body as ItemBody).modifiers!.map(modifier => modifier.type)).toEqual(['bonus', 'slayer']);
  });

  it('rejects an unknown modifier type [F-items-11]', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'teleport', value: 3 });
    expect(response.status).toBe(400);
  });

  // F-items-11: the fields each option requires and forbids (GET /v1/item-modifiers/options).
  it.each([
    [{ type: 'material', value: 3, modifier: 'mithril' }, 'A material modifier does not allow a value'],
    [{ type: 'material' }, 'A material modifier requires a modifier'],
    [{ type: 'bonus' }, 'A bonus modifier requires a value'],
    [{ type: 'bonus', value: 5, modifier: 'animals' }, 'A bonus modifier does not allow a modifier'],
    [{ type: 'skill-bonus', value: 5 }, 'A skill-bonus modifier requires a modifier'],
  ])('rejects a modifier its option does not allow: %j [F-items-11]', async (body, message) => {
    const response = await addModifier('owner', 'e2e-magic-armor', body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation', message });
  });

  it('accepts a modifier as its option describes it', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'skill-bonus', value: 5, modifier: 'climbing' });
    expect(response.status).toBe(201);
  });

  it('requires the type', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { value: 3 });
    expect(response.status).toBe(400);
  });

  it('removes a modifier and updates updatedAt [F-items-19]', async () => {
    const before = await storedUpdatedAt();
    const response = await removeModifier('owner', 'e2e-magic-armor', modifierId);
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).modifiers!.map(modifier => modifier.id)).not.toContain(modifierId);
    const after = await storedUpdatedAt();
    expect(after).toBeInstanceOf(Date);
    expect(after!.getTime()).toBeGreaterThan(before?.getTime() ?? 0);
  });

  it('answers 404 to a modifier the item does not have, without writing or publishing [F-items-12]', async () => {
    const eventsBefore = e2e.events.length;
    const versionBefore = (
      (await request(e2e.server).get('/v1/items/e2e-magic-armor').set('Authorization', auth('owner'))).body as { version: number }
    ).version;
    const response = await removeModifier('owner', 'e2e-magic-armor', 'missing-modifier');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ code: 'not-found', message: 'Item modifier missing-modifier not found' });
    expect(e2e.events.length).toBe(eventsBefore);
    const read = await request(e2e.server).get('/v1/items/e2e-magic-armor').set('Authorization', auth('owner'));
    expect((read.body as { version: number }).version).toBe(versionBefore);
  });

  it('answers 404 to an unknown item', async () => {
    expect((await addModifier('owner', 'missing-item', { type: 'bonus', value: 1 })).status).toBe(404);
    expect((await removeModifier('owner', 'missing-item', 'x')).status).toBe(404);
  });

  it("rejects a modifier on another user's item [F-items-06]", async () => {
    const response = await addModifier('other', 'e2e-magic-armor', { type: 'bonus', value: 1 });
    expect(response.status).toBe(403);
  });
});

// Spec 044, decision 10 (F-items-23): the creation and the PATCH check the modifiers they send like POST .../modifiers.
describe('modifiers sent with the item', () => {
  const create = (name: string, modifiers: object[]) =>
    request(e2e.server).post('/v1/items').set('Authorization', auth('owner')).send({ name, category: 'armor', armor, info, modifiers });
  const patch = (body: object) => request(e2e.server).patch('/v1/items/e2e-checked-armor').set('Authorization', auth('owner')).send(body);

  const invalid: [object, string][] = [
    [{ id: 'm1', type: 'material', value: 3, modifier: 'mithril' }, 'A material modifier does not allow a value'],
    [{ id: 'm1', type: 'slayer' }, 'A slayer modifier requires a modifier'],
    [{ id: 'm1', type: 'bonus', value: null, modifier: null }, 'A bonus modifier requires a value'],
    [{ id: 'm1', type: 'item-damage', value: 1, modifier: 'animals' }, 'A item-damage modifier does not allow a modifier'],
    [{ id: 'm1', type: 'skill-bonus', value: 5 }, 'A skill-bonus modifier requires a modifier'],
  ];

  it.each(invalid)('rejects the creation with %j [F-items-23]', async (modifier, message) => {
    const response = await create('E2E Rejected Armor', [{ id: 'm0', type: 'bonus', value: 5 }, modifier]);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation', message });
    expect((await request(e2e.server).get('/v1/items/e2e-rejected-armor').set('Authorization', auth('owner'))).status).toBe(404);
  });

  it('creates an item whose modifiers follow their options', async () => {
    const response = await create('E2E Checked Armor', [
      { id: 'm1', type: 'bonus', value: 5, modifier: null },
      { id: 'm2', type: 'slayer', modifier: 'dragons', value: null },
    ]);
    expect(response.status).toBe(201);
    expect((response.body as ItemBody).modifiers!.map(m => m.type)).toEqual(['bonus', 'slayer']);
  });

  it.each(invalid)('rejects a PATCH with %j and keeps the stored modifiers [F-items-23]', async (modifier, message) => {
    const response = await patch({ modifiers: [modifier] });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation', message });
    const read = await request(e2e.server).get('/v1/items/e2e-checked-armor').set('Authorization', auth('owner'));
    expect((read.body as ItemBody).modifiers!.map(m => m.id)).toEqual(['m1', 'm2']);
  });

  it('accepts a PATCH with valid modifiers, and one without modifiers', async () => {
    const valid = await patch({ modifiers: [{ id: 'm3', type: 'skill-bonus', value: 5, modifier: 'climbing' }] });
    expect(valid.status).toBe(200);
    expect((valid.body as ItemBody).modifiers).toMatchObject([{ id: 'm3', type: 'skill-bonus', value: 5, modifier: 'climbing' }]);
    expect((await patch({ description: 'No modifiers sent' })).status).toBe(200);
  });

  it('lets a PATCH that does not send the modifiers change an item whose stored modifiers break the rules', async () => {
    await e2e.connection
      .collection('items')
      .updateOne(
        { _id: 'e2e-checked-armor' as never },
        { $set: { modifiers: [{ id: 'old', type: 'bonus', value: null, modifier: null }] } },
      );
    expect((await patch({ description: 'Legacy item' })).status).toBe(200);
    expect((await patch({ modifiers: [{ id: 'old', type: 'bonus', value: null, modifier: null }] })).status).toBe(400);
  });
});

describe('update of the category data', () => {
  beforeAll(async () => {
    expect((await createArmor('E2E Plain Armor')).status).toBe(201);
  });

  const patch = (body: object) => request(e2e.server).patch('/v1/items/e2e-plain-armor').set('Authorization', auth('owner')).send(body);

  // F-items-13: the PATCH applies the rules of the creation.
  it('rejects weapon info on an armor [F-items-13]', async () => {
    const response = await patch({ weapon: { skillId: 'dagger', fumble: 2, modes: [] } });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('Weapon info not allowed');
    const read = await request(e2e.server).get('/v1/items/e2e-plain-armor').set('Authorization', auth('owner'));
    expect((read.body as ItemBody).weapon).toBeNull();
  });

  it('validates the nested objects of the PATCH [F-items-09, F-items-13]', async () => {
    expect((await patch({ armor: { ...armor, slot: 'tail' } })).status).toBe(400);
    expect((await patch({ armor: { slot: 'body', at: 3 } })).status).toBe(400);
    expect((await patch({ info: { ...info, rarity: 'legendary' } })).status).toBe(400);
    expect((await patch({ modifiers: [{ id: 'm1', type: 'teleport' }] })).status).toBe(400);
  });

  it('accepts the whole item as rmu-mfe-items sends it, with null for the other categories', async () => {
    const read = await request(e2e.server).get('/v1/items/e2e-plain-armor').set('Authorization', auth('owner'));
    // The item form sends everything it read except the id.
    const item: Record<string, unknown> = { ...(read.body as Record<string, unknown>) };
    delete item.id;
    const response = await patch({
      ...item,
      armor: { ...armor, at: 7 },
      modifiers: [{ id: 'm1', type: 'bonus', value: 2, modifier: null, specialization: null }],
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      category: 'armor',
      weapon: null,
      shield: null,
      armor: { at: 7 },
      modifiers: [{ id: 'm1', type: 'bonus', value: 2 }],
    });
  });

  it('requires a mode in the weapon of a weapon', async () => {
    const mode = { type: 'one-hand', attackTypes: ['melee'], attackTable: 'dagger', fumbleTable: 'dagger', sizeAdjustment: 0 };
    const created = await request(e2e.server)
      .post('/v1/items')
      .set('Authorization', auth('owner'))
      .send({ name: 'E2E Patched Knife', category: 'weapon', weapon: { skillId: 'dagger', fumble: 1, modes: [mode] }, info });
    expect(created.status).toBe(201);
    const response = await request(e2e.server)
      .patch('/v1/items/e2e-patched-knife')
      .set('Authorization', auth('owner'))
      .send({ weapon: { skillId: 'dagger', fumble: 1, modes: [] } });
    expect(response.status).toBe(400);
    expect((response.body as { message: string }).message).toBe('At least one weapon mode is required for weapon items');
  });
});
