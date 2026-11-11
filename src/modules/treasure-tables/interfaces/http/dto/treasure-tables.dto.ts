import { ApiProperty } from '@nestjs/swagger';
import {
  type GearQualityRow,
  type ItemTypeRow,
  type JewelryTypeRow,
  type KeyRow,
  type MagicTable,
  type MagicTableRow,
  type MagicTreasureRow,
  type Quality,
  type RandomArmorRow,
  type RandomSpells,
  type RandomWeapons,
  type StandardPricing,
  TREASURE_TABLES_ID,
  type TreasureCodes,
  type TreasureGems,
  type TreasureTables,
  type WealthRollsRow,
  type WealthTypeRow,
  type WealthValueModifier,
  type WealthValueRow,
} from '../../../domain/value-objects/treasure-tables.vo.js';

const rows = (description: string) => ({ type: 'array', items: { type: 'object' }, description }) as const;
const object = (description: string) => ({ type: 'object', additionalProperties: true, description }) as const;

/**
 * GET v1/treasure-tables (spec 067). The OpenAPI schema describes the nested parts loosely; the TypeScript types of
 * treasure-tables.vo.ts are the contract.
 */
export class TreasureTablesDto implements TreasureTables {
  @ApiProperty({ type: String, enum: [TREASURE_TABLES_ID], example: TREASURE_TABLES_ID })
  id: typeof TREASURE_TABLES_ID;

  @ApiProperty(object('7-1a: the book code of each quality, by kind (wealth a..e, lifestyle l..p, magic u..z)'))
  codes: TreasureCodes;

  @ApiProperty(rows('7-1b: {min, max, rolls}'))
  wealthRolls: WealthRollsRow[];

  @ApiProperty(rows('7-1c: {min, max, valueMin, valueMax}'))
  wealthValue: WealthValueRow[];

  @ApiProperty(rows('7-1c modifiers: {key, value}'))
  wealthValueModifiers: WealthValueModifier[];

  @ApiProperty(rows('{min, max, type: coins | gems | jewelry | art, multiplier}'))
  wealthType: WealthTypeRow[];

  @ApiProperty(object('Wealth multiplier by quality'))
  wealthMultipliers: Record<Quality, number>;

  @ApiProperty(rows('7-1d: {min, max, itemTypeId} of the jewelry catalog'))
  jewelryTypes: JewelryTypeRow[];

  @ApiProperty(rows('7-1e: {min, max, key}'))
  artTypes: KeyRow[];

  @ApiProperty(rows('7-1f: {min, max} and {total, max} by quality'))
  gearQuality: GearQualityRow[];

  @ApiProperty(rows('7-1g: {min, max} and the modifiers by quality'))
  magicTreasure: MagicTreasureRow[];

  @ApiProperty(object('Highest item level by quality; null has no limit'))
  magicMaxLevel: Record<Quality, number | null>;

  @ApiProperty(rows('7-1h: {min, max, table}'))
  itemType: ItemTypeRow[];

  @ApiProperty(object('7-1i, l, m, o, p, q: rows 1-300 by table (melee, ranged, armor, utility, spell, charged)'))
  magicTables: Record<MagicTable, MagicTableRow[]>;

  @ApiProperty(object('7-1j: {table, size, groups}'))
  randomWeapons: RandomWeapons;

  @ApiProperty(rows('7-1k: {min, max, key}'))
  creatureTypes: KeyRow[];

  @ApiProperty(rows('7-1n: {min, max, itemTypeId, at, shield?}'))
  randomArmor: RandomArmorRow[];

  @ApiProperty(object('7-1r: {realm, lists}'))
  randomSpells: RandomSpells;

  @ApiProperty(object('2-4d, 2-4e: {precious, semiPrecious}'))
  gems: TreasureGems;

  @ApiProperty(object('Chapter 6: standard pricing tables (prices in silver)'))
  standardPricing: StandardPricing;

  @ApiProperty({ example: 1, description: 'Bumped by the import when the tables change' })
  version: number;

  static fromEntity(entity: TreasureTables): TreasureTablesDto {
    return Object.assign(new TreasureTablesDto(), entity);
  }
}
