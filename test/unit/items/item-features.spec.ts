import { Item } from '../../../src/modules/items/domain/aggregates/item.aggregate.js';
import type { ItemCategory } from '../../../src/modules/items/domain/value-objects/item-category.vo.js';
import type { ItemFeatures } from '../../../src/modules/items/domain/value-objects/item-features.vo.js';
import { ItemFeaturesDto } from '../../../src/modules/items/interfaces/http/dto/item-features.dto.js';

// Workspace spec 062. Synthetic values only: the book rows live outside the public repos.
const herb: NonNullable<ItemFeatures['herb']> = {
  group: 'stun',
  biomes: ['T'],
  highAltitude: false,
  find: 'e',
  form: 'berry',
  prep: 'ingest',
  season: null,
  effectDelay: 'immediate',
  magical: true,
  addictionFactor: 3,
  effects: { heal: null, stunRelief: 2, treats: null, recoveryBonus: null },
};
const acid: NonNullable<ItemFeatures['acid']> = {
  strength: 'weak',
  splash: { severity: 'B', modifier: -10 },
  immersion: null,
  ingestion: null,
  breakageMod: 0,
  craftDifficulty: 'r',
  targets: 'undead-demon',
};
const gem: NonNullable<ItemFeatures['gem']> = {
  grade: 'semi-precious',
  mineral: 'test-quartz',
  valuePerCarat: 1,
  hardness: { min: 5, max: 5 },
  specificGravity: null,
  luster: null,
  caratsPerCm: null,
  magic: null,
};
const jewelry: NonNullable<ItemFeatures['jewelry']> = { value: { min: 2, max: 20, dice: null, openEnded: false }, slot: null };
const animal: NonNullable<ItemFeatures['animal']> = { npcId: null, trained: false, stage: 'egg', domesticated: false };
const property: NonNullable<ItemFeatures['property']> = { rent: null, size: null, height: null };
const intoxicant: NonNullable<ItemFeatures['intoxicant']> = { addictionFactor: null, form: null, prep: null };

const check = (category: ItemCategory, features: ItemFeatures) => () => Item.checkCategoryData(category, { features });

describe('Item.checkCategoryData with the spec 062 blocks', () => {
  it.each<[ItemCategory, ItemFeatures]>([
    ['herb', { herb }],
    ['herb', { herb, antidote: { categories: ['any'], level: 1, withinHours: null } }],
    ['acid', { acid }],
    ['intoxicant', { intoxicant }],
    ['gem', { gem }],
    ['jewelry', { jewelry }],
    ['animal', { animal }],
    ['mount', { animal }],
    ['property', { property }],
    ['animal', {}],
  ])('accepts %s with %o', (category, features) => {
    expect(check(category, features)).not.toThrow();
  });

  it.each<[ItemCategory, ItemFeatures, string]>([
    [
      'poison',
      { poison: { category: 'nerve', level: 1, form: 'paste', maxSeverity: null, immediateHits: null, onsetRounds: null }, herb },
      'Herb info not allowed',
    ],
    ['tools', { acid }, 'Acid info not allowed'],
    ['herb', { intoxicant }, 'Intoxicant info not allowed'],
    ['jewelry', { gem }, 'Gem info not allowed'],
    ['gem', { jewelry }, 'Jewelry info not allowed'],
    ['vehicle', { animal }, 'Animal info not allowed'],
    ['other', { property }, 'Property info not allowed'],
    ['weapon', { gem }, 'Container, light, transport or ammunition info not allowed'],
  ])('rejects on %s the blocks %o', (category, features, message) => {
    expect(check(category, features)).toThrow(message);
  });

  it('rejects inverted ranges', () => {
    expect(check('herb', { herb: { ...herb, effects: { ...herb.effects!, heal: { min: 4, max: 1 } } } })).toThrow(
      'Invalid herb heal range',
    );
    expect(check('gem', { gem: { ...gem, specificGravity: { min: 3, max: 2 } } })).toThrow('Invalid gem specific gravity range');
    expect(check('jewelry', { jewelry: { ...jewelry, value: { ...jewelry.value, max: 1 } } })).toThrow('Invalid jewelry value range');
  });
});

describe('ItemFeaturesDto with the spec 062 blocks', () => {
  it('maps every block both ways and drops repeated biomes and treated injuries', () => {
    const features: ItemFeatures = { herb, acid, intoxicant, gem, jewelry, animal, property };
    const dto = Object.assign(new ItemFeaturesDto(), structuredClone(features));
    dto.herb!.biomes = ['T', 'T'];
    dto.herb!.effects!.treats = ['organ', 'organ'];
    const entity = ItemFeaturesDto.toEntity(dto);
    expect(entity).toEqual({ ...features, herb: { ...herb, effects: { ...herb.effects, treats: ['organ'] } } });
    expect(ItemFeaturesDto.fromEntity(entity)).toEqual({ ...entity });
  });

  it('fills the optional fields with null', () => {
    const dto = Object.assign(new ItemFeaturesDto(), {
      herb: { ...herb, season: undefined, addictionFactor: undefined, effects: undefined },
      acid: { ...acid, splash: undefined },
      gem: { grade: 'precious', mineral: 'test-gem', valuePerCarat: 2 },
      jewelry: { value: { min: 1, max: 2, openEnded: false } },
      animal: { trained: true, stage: 'adult', domesticated: true },
      property: {},
      intoxicant: {},
    });
    expect(ItemFeaturesDto.toEntity(dto)).toEqual({
      herb: { ...herb, season: null, addictionFactor: null, effects: null },
      acid: { ...acid, splash: null },
      gem: {
        grade: 'precious',
        mineral: 'test-gem',
        valuePerCarat: 2,
        hardness: null,
        specificGravity: null,
        luster: null,
        caratsPerCm: null,
        magic: null,
      },
      jewelry: { value: { min: 1, max: 2, dice: null, openEnded: false }, slot: null },
      animal: { npcId: null, trained: true, stage: 'adult', domesticated: true },
      property: { rent: null, size: null, height: null },
      intoxicant: { addictionFactor: null, form: null, prep: null },
    });
  });
});
