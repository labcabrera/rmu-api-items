import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Item } from '../../../src/modules/items/domain/aggregates/item.aggregate.js';
import type { ItemCategory } from '../../../src/modules/items/domain/value-objects/item-category.vo.js';
import { ITEM_CATEGORIES } from '../../../src/modules/items/domain/value-objects/item-category.vo.js';
import { checkMagicItemFeature, type MagicItemFeature } from '../../../src/modules/items/domain/value-objects/item-magic.vo.js';
import { ItemFeaturesDto } from '../../../src/modules/items/interfaces/http/dto/item-features.dto.js';
import { ItemMagicDto } from '../../../src/modules/items/interfaces/http/dto/item-magic.dto.js';

// Workspace spec 067. Invented values only: the book compendium lives outside the public repos.
const magic: MagicItemFeature = {
  itemLevel: 4,
  kind: 'weapon',
  days: 9,
  standardPrice: 120,
  basePrice: 3,
  attunement: false,
  charges: null,
  realm: 'essence',
  bonuses: [
    { kind: 'ob', value: 10, target: null, against: null },
    { kind: 'ob', value: 15, target: null, against: 'test-beast' },
  ],
  spells: [
    { name: 'Test Glow', level: 2, list: 'test-list', use: 'recipe', perDay: null },
    { name: 'Test Spark', level: 3, list: null, use: 'daily', perDay: 2 },
  ],
  section: '9.9',
};

const weapon = {
  skillId: 'dagger',
  fumble: 3,
  modes: [{ type: 'one-hand', attackTypes: ['melee'], attackTable: 'dagger', fumbleTable: 'dagger', sizeAdjustment: 0 }],
} as never;

describe('categories of spec 067', () => {
  it('include potion and spell-item', () => {
    expect(ITEM_CATEGORIES).toContain('potion');
    expect(ITEM_CATEGORIES).toContain('spell-item');
  });
});

describe('checkMagicItemFeature', () => {
  it('accepts a complete block', () => {
    expect(() => checkMagicItemFeature(magic)).not.toThrow();
  });

  it.each<[Partial<MagicItemFeature>, string]>([
    [{ kind: 'flying' as never }, 'Invalid magic item kind'],
    [{ itemLevel: -1 }, 'Invalid magic item level'],
    [{ itemLevel: 1.5 }, 'Invalid magic item level'],
    [{ realm: 'arcane' }, 'Invalid magic item realm'],
    [{ days: -2 }, 'Invalid magic item days'],
    [{ standardPrice: -1, basePrice: null }, 'Invalid magic item standard price'],
    [{ basePrice: 500 }, 'The magic item base price exceeds its standard price'],
    [{ charges: 0 }, 'Invalid magic item charges'],
    [{ bonuses: [{ kind: 'speed' as never, value: 1 }] }, 'Invalid magic item bonus kind'],
    [{ spells: [{ name: 'X', level: 1, use: 'often' as never }] }, 'Invalid magic item spell use'],
    [{ spells: [{ name: 'X', level: -1, use: 'constant' }] }, 'Invalid magic item spell level'],
    [{ spells: [{ name: 'X', level: 1, use: 'constant', perDay: 1 }] }, 'Only a daily spell has uses per day'],
    [{ spells: [{ name: 'X', level: 1, use: 'daily', perDay: 0 }] }, 'Invalid magic item spell uses per day'],
  ])('rejects %o', (change, message) => {
    expect(() => checkMagicItemFeature({ ...magic, ...change })).toThrow(message);
  });

  it('accepts a base price without a standard price', () => {
    expect(() => checkMagicItemFeature({ ...magic, standardPrice: null, basePrice: 10 })).not.toThrow();
  });
});

describe('Item.checkCategoryData with the magic block', () => {
  it.each<ItemCategory>(['potion', 'spell-item', 'jewelry', 'clothes', 'other'])('accepts it on %s', category => {
    expect(() => Item.checkCategoryData(category, { features: { magic } })).not.toThrow();
  });

  it('accepts it on a weapon, which keeps its category', () => {
    expect(() => Item.checkCategoryData('weapon', { weapon, features: { magic } })).not.toThrow();
  });

  it('still rejects the equipment blocks on a weapon', () => {
    expect(() => Item.checkCategoryData('weapon', { weapon, features: { magic, light: { radius: 1, durationHours: 1 } } })).toThrow(
      'Container, light, transport or ammunition info not allowed',
    );
  });

  it('validates the block', () => {
    expect(() => Item.checkCategoryData('potion', { features: { magic: { ...magic, charges: -3 } } })).toThrow(
      'Invalid magic item charges',
    );
  });

  it('rejects weapon data on a spell item', () => {
    expect(() => Item.checkCategoryData('spell-item', { weapon })).toThrow('Weapon info not allowed');
  });
});

describe('ItemMagicDto', () => {
  const validate = (plain: object) => validateSync(plainToInstance(ItemMagicDto, plain)).map(error => error.property);

  it('validates a complete block, nested bonuses and spells included', () => {
    expect(validate(magic)).toEqual([]);
    expect(validate({ ...magic, kind: 'flying', bonuses: [{ kind: 'speed', value: 1 }], spells: [{ level: 1, use: 'daily' }] })).toEqual([
      'kind',
      'bonuses',
      'spells',
    ]);
    expect(validate({ ...magic, realm: 'arcane', itemLevel: -1, charges: 0 })).toEqual(['itemLevel', 'charges', 'realm']);
  });

  it('fills the optional fields', () => {
    const dto = plainToInstance(ItemMagicDto, { itemLevel: 1, kind: 'potion', bonuses: [{ kind: 'rr', value: 5 }], spells: undefined });
    expect(ItemMagicDto.toEntity(dto)).toEqual({
      itemLevel: 1,
      kind: 'potion',
      days: null,
      standardPrice: null,
      basePrice: null,
      attunement: false,
      charges: null,
      realm: null,
      bonuses: [{ kind: 'rr', value: 5, target: null, against: null }],
      spells: [],
      section: null,
    });
  });

  it('maps the block both ways inside the features', () => {
    const dto = plainToInstance(ItemFeaturesDto, { magic });
    const entity = ItemFeaturesDto.toEntity(dto);
    expect(entity).toEqual({ magic });
    expect(ItemFeaturesDto.fromEntity(entity)).toEqual({ magic });
  });
});
