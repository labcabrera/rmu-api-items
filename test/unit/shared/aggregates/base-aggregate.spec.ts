import { Item } from '../../../../src/modules/items/domain/aggregates/item.aggregate.js';
import type { ItemProps } from '../../../../src/modules/items/domain/aggregates/item-props.js';

const props = (): ItemProps => ({
  id: 'e2e-sack',
  name: 'Sack',
  realmId: null,
  category: 'other',
  weapon: null,
  armor: null,
  shield: null,
  info: { cost: null, length: null, weight: 1, strength: null, productionHours: null, stackable: false, rarity: 'common', unique: false },
  modifiers: null,
  description: 'A sack',
  imageUrl: null,
  owner: 'u1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: null,
});

describe('BaseAggregateRoot', () => {
  it('keeps the version out of the JSON of the aggregate [F-receta-27]', () => {
    const item = Item.fromProps(props()).restoreVersion(3);
    expect(item.version).toBe(3);
    const json = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
    expect(Object.keys(json).some(key => key.toLowerCase().includes('version'))).toBe(false);
  });

  it('has changes when it was never stored', () => {
    expect(Item.fromProps(props()).hasChanges()).toBe(true);
  });

  it('compares the state with the one it was loaded with, without updatedAt [F-receta-23]', () => {
    const item = Item.fromProps(props()).restoreVersion(0);
    expect(item.hasChanges()).toBe(false);
    item.update({ description: 'A sack' });
    expect(item.updatedAt).not.toBeNull();
    expect(item.hasChanges()).toBe(false);
    item.update({ description: 'A big sack' });
    expect(item.hasChanges()).toBe(true);
  });

  it('takes a new snapshot when the version is restored after a write', () => {
    const item = Item.fromProps(props()).restoreVersion(0);
    item.update({ description: 'Changed' });
    item.restoreVersion(1);
    expect(item.hasChanges()).toBe(false);
  });

  it('rejects a stale version', () => {
    const item = Item.fromProps(props()).restoreVersion(2);
    expect(() => item.checkVersion(undefined)).not.toThrow();
    expect(() => item.checkVersion(2)).not.toThrow();
    expect(() => item.checkVersion(1)).toThrow(expect.objectContaining({ statusCode: 409, code: 'version-conflict' }) as Error);
  });
});
