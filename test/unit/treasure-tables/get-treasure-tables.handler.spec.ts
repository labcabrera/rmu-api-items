import { describe, expect, it } from 'vitest';
import { GetTreasureTablesHandler } from '../../../src/modules/treasure-tables/application/cqrs/handlers/get-treasure-tables.handler.js';
import { GetTreasureTablesQuery } from '../../../src/modules/treasure-tables/application/cqrs/queries/get-treasure-tables.query.js';
import type { TreasureTablesRepository } from '../../../src/modules/treasure-tables/application/ports/treasure-tables-repository.port.js';
import {
  MAGIC_TABLES,
  QUALITIES,
  type TreasureTables,
} from '../../../src/modules/treasure-tables/domain/value-objects/treasure-tables.vo.js';
import { MongoTreasureTablesRepository } from '../../../src/modules/treasure-tables/infrastructure/db/mongo.treasure-tables.repository.js';
import type { TreasureTablesModel } from '../../../src/modules/treasure-tables/infrastructure/persistence/models/treasure-tables.model.js';
import { TreasureTablesDto } from '../../../src/modules/treasure-tables/interfaces/http/dto/treasure-tables.dto.js';
import { ForbiddenError, NotFoundError } from '../../../src/modules/shared/domain/errors/errors.js';

// Invented rows with the shape of the import, not the rulebook tables
const row = { days: 1, level: 2, price: 30 };
const TABLES: TreasureTables = {
  id: 'treasure',
  codes: { wealth: { a: 'very-poor', b: 'normal' }, lifestyle: { l: 'poor' }, magic: { u: 'rich' } },
  wealthRolls: [{ min: 1, max: 100, rolls: 1 }],
  wealthValue: [
    { min: -999, max: 50, valueMin: 1, valueMax: 10 },
    { min: 51, max: 999, valueMin: 11, valueMax: 99 },
  ],
  wealthValueModifiers: [{ key: 'fixture-bonus', value: 5 }],
  wealthType: [{ min: 1, max: 100, type: 'coins', multiplier: 1 }],
  wealthMultipliers: { 'very-poor': 0.1, poor: 0.5, normal: 1, rich: 2, 'very-rich': 4 },
  jewelryTypes: [{ min: 1, max: 100, itemTypeId: 'fixture-ring' }],
  artTypes: [{ min: 1, max: 100, key: 'fixture-art' }],
  gearQuality: [
    {
      min: 1,
      max: 100,
      'very-poor': { total: 0, max: null },
      poor: { total: 1, max: 1 },
      normal: { total: 2, max: 2 },
      rich: { total: 3, max: 3 },
      'very-rich': { total: 4, max: null },
    },
  ],
  magicTreasure: [{ min: 1, max: 100, 'very-poor': [], poor: [-5], normal: [0], rich: [5, 10], 'very-rich': [20] }],
  magicMaxLevel: { 'very-poor': 1, poor: 2, normal: 3, rich: 4, 'very-rich': null },
  itemType: [{ min: 1, max: 100, table: 'melee' }],
  magicTables: {
    melee: [
      {
        min: 1,
        max: 300,
        label: 'Fixture blade',
        price: { min: 10, max: 20 },
        generic: { base: 'weapon', kind: 'weapon', bonuses: [{ kind: 'ob', value: 5, against: 'random' }] },
      },
    ],
    ranged: [],
    armor: [],
    utility: [],
    spell: [],
    charged: [],
  },
  randomWeapons: {
    table: [{ min: 1, max: 100, group: 'fixture-group' }],
    size: [{ min: 1, max: 100, size: 'medium' }],
    groups: { 'fixture-group': [{ min: 1, max: 100, itemTypeId: 'fixture-sword', missile: false }] },
  },
  creatureTypes: [{ min: 1, max: 100, key: 'fixture-beast' }],
  randomArmor: [{ min: 1, max: 100, itemTypeId: null, at: 5 }],
  randomSpells: { realm: [{ min: 1, max: 100, realm: 'essence' }], lists: { essence: [{ min: 1, max: 100, listCode: null }] } },
  gems: {
    precious: { columns: [{ min: 1, max: 100, rows: [{ min: 1, max: 100, itemTypeId: 'fixture-gem' }] }] },
    semiPrecious: { columns: [] },
  },
  standardPricing: {
    pricePerDay: [{ ppMin: 0, ppMax: null, extraSp: 1 }],
    weapon: [{ bonus: 5, ...row }],
    ranged: [],
    armor: [{ at: 5, rows: [{ bonus: 5, ...row }] }],
    shield: [],
    generalBonus: [{ material: 'wood', rows: [] }],
    powerEnhancers: [{ effect: 'fixture-adder', held: row, worn: row }],
    daily: [{ spellLevel: 1, realm: 'hybrid', row }],
    constant: [],
    emplaced: [{ spellLevel: 1, row: { ...row, itemPp: 2 } }],
    potions: [{ spellLevel: 1, row }],
    charged: [{ stick: 'wand', spellLevel: 1, charges: 10, row }],
  },
  version: 4,
};

const repository = (tables: TreasureTables | null): TreasureTablesRepository => ({ find: () => Promise.resolve(tables) });

describe('GetTreasureTablesHandler', () => {
  it('returns the stored tables to Treasure Law users and administrators', async () => {
    const handler = new GetTreasureTablesHandler(repository(TABLES));
    await expect(handler.execute(new GetTreasureTablesQuery('user', ['rmu-treasure-law']))).resolves.toEqual(TABLES);
    await expect(handler.execute(new GetTreasureTablesQuery('service', ['rmu-admin']))).resolves.toEqual(TABLES);
  });

  it('rejects users without Treasure Law access, even with Core Law', async () => {
    const handler = new GetTreasureTablesHandler(repository(TABLES));
    await expect(handler.execute(new GetTreasureTablesQuery('guest', ['rmu-user']))).rejects.toBeInstanceOf(ForbiddenError);
    await expect(handler.execute(new GetTreasureTablesQuery('guest', ['rmu-core-law']))).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('fails with treasure-tables-not-found when the tables have not been imported', async () => {
    const handler = new GetTreasureTablesHandler(repository(null));
    const error = handler.execute(new GetTreasureTablesQuery('user', ['rmu-treasure-law']));
    await expect(error).rejects.toBeInstanceOf(NotFoundError);
    await expect(error).rejects.toMatchObject({ statusCode: 404, code: 'treasure-tables-not-found' });
  });
});

describe('MongoTreasureTablesRepository.mapToTables', () => {
  it('maps a complete stored document as it is', () => {
    const { id: _id, ...rest } = TABLES;
    expect(MongoTreasureTablesRepository.mapToTables({ _id, ...rest })).toEqual({
      ...TABLES,
      extras: { armorTables: null, baseOptions: null },
    });
  });

  it('passes the extra parts of the import through', () => {
    const { id: _id, ...rest } = TABLES;
    const armorTables = { coverage: [{ min: 1, max: 100 }] };
    const mapped = MongoTreasureTablesRepository.mapToTables({
      _id,
      ...rest,
      armorTables,
      standardPricing: { ...TABLES.standardPricing, runePaper: [{ days: 1 }] },
    });
    expect(mapped.extras?.armorTables).toEqual(armorTables);
    expect(mapped.standardPricing.runePaper).toEqual([{ days: 1 }]);
  });

  it('fills the missing parts, sorts the range rows and defaults the version to 0', () => {
    const doc = {
      _id: 'treasure',
      wealthRolls: [
        { min: 51, max: 100, rolls: 2 },
        { min: 1, max: 50, rolls: 1 },
      ],
      magicTables: { spell: [{ min: 151, max: 300, label: 'B', price: { min: 1, max: 2 } }, TABLES.magicTables.melee[0]] },
      magicMaxLevel: { rich: 7 },
    } as unknown as TreasureTablesModel;

    const tables = MongoTreasureTablesRepository.mapToTables(doc);

    expect(tables.wealthRolls.map(r => r.min)).toEqual([1, 51]);
    expect(Object.keys(tables.magicTables)).toEqual([...MAGIC_TABLES]);
    expect(tables.magicTables.spell.map(r => r.min)).toEqual([1, 151]);
    expect(tables.magicTables.melee).toEqual([]);
    expect(Object.keys(tables.magicMaxLevel)).toEqual([...QUALITIES]);
    expect(tables.magicMaxLevel).toMatchObject({ rich: 7, normal: null });
    expect(tables.codes).toEqual({ wealth: {}, lifestyle: {}, magic: {} });
    expect(tables.randomWeapons).toEqual({ table: [], size: [], groups: {} });
    expect(tables.randomSpells).toEqual({ realm: [], lists: {} });
    expect(tables.gems).toEqual({ precious: { columns: [] }, semiPrecious: { columns: [] } });
    expect(Object.values(tables.standardPricing).every(part => Array.isArray(part) && part.length === 0)).toBe(true);
    expect(tables).toMatchObject({ id: 'treasure', wealthMultipliers: {}, creatureTypes: [], version: 0 });
  });
});

describe('TreasureTablesDto.fromEntity', () => {
  it('copies the tables', () => {
    const dto = TreasureTablesDto.fromEntity(TABLES);
    expect(dto).toBeInstanceOf(TreasureTablesDto);
    expect({ ...dto }).toEqual(TABLES);
  });
});
