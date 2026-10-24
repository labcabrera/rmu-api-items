import request from 'supertest';
import { startApp, type E2eApp, type UserName } from './support/app.js';

type Modifier = { id: string; type: string; modifier?: string; value?: number };
type ItemBody = { id: string; category: string; weapon: unknown; armor: unknown; modifiers: Modifier[] | null };

const info = { weight: 1, stackable: false, rarity: 'common', unique: false };
const armor = { slot: 'chest', at: 5, enc: 10, maneuverPenalty: -10, rangedPenalty: 0, perceptionPenalty: 0, baseDifficulty: 'm' };

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

  beforeAll(async () => {
    expect((await createArmor('E2E Magic Armor')).status).toBe(201);
  });

  it('adds a modifier with a generated id and publishes item.updated', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'bonus', value: 10 });
    expect(response.status).toBe(201);
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

  // F-items-11: neither the type nor the required and forbidden fields of the options are checked.
  it('accepts an unknown modifier type and a value the option forbids', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'teleport', value: 3 });
    expect(response.status).toBe(201);
    const forbidden = await addModifier('owner', 'e2e-magic-armor', { type: 'material', value: 3 });
    expect(forbidden.status).toBe(201);
  });

  it.skip('rejects an unknown modifier type [F-items-11]', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { type: 'teleport', value: 3 });
    expect(response.status).toBe(400);
  });

  it('requires the type', async () => {
    const response = await addModifier('owner', 'e2e-magic-armor', { value: 3 });
    expect(response.status).toBe(400);
  });

  it('removes a modifier', async () => {
    const response = await removeModifier('owner', 'e2e-magic-armor', modifierId);
    expect(response.status).toBe(200);
    expect((response.body as ItemBody).modifiers!.map(modifier => modifier.id)).not.toContain(modifierId);
  });

  // F-items-12: removing a modifier the item does not have answers 200 and publishes item.updated.
  it('answers 200 to a modifier the item does not have', async () => {
    const before = e2e.events.length;
    const response = await removeModifier('owner', 'e2e-magic-armor', 'missing-modifier');
    expect(response.status).toBe(200);
    expect(e2e.events.length).toBe(before + 1);
  });

  it.skip('answers 404 to a modifier the item does not have [F-items-12]', async () => {
    const response = await removeModifier('owner', 'e2e-magic-armor', 'missing-modifier');
    expect(response.status).toBe(404);
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

describe('update of the category data', () => {
  beforeAll(async () => {
    expect((await createArmor('E2E Plain Armor')).status).toBe(201);
  });

  // F-items-13: PATCH sets weapon or shield info on an item of another category, which create rejects.
  it('accepts weapon info on an armor', async () => {
    const response = await request(e2e.server)
      .patch('/v1/items/e2e-plain-armor')
      .set('Authorization', auth('owner'))
      .send({ weapon: { skillId: 'dagger', fumble: 2, modes: [] } });
    expect(response.status).toBe(200);
    const item = response.body as ItemBody;
    expect(item.category).toBe('armor');
    expect(item.weapon).toMatchObject({ skillId: 'dagger' });
  });

  it.skip('rejects weapon info on an armor [F-items-13]', async () => {
    const response = await request(e2e.server)
      .patch('/v1/items/e2e-plain-armor')
      .set('Authorization', auth('owner'))
      .send({ weapon: { skillId: 'dagger', fumble: 2, modes: [] } });
    expect(response.status).toBe(400);
  });
});
