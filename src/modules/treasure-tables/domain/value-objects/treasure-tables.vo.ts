/**
 * Tables of random treasure and standard magic item pricing (Treasure Law 7.1, 2.4 and chapter 6; workspace spec 067).
 * The values come from the rulebook and are imported from the gitignored data directory
 * (data/treasure-law/treasure-tables.json), never written in code. Strategic reads them to roll and price treasure.
 */

/** Id of the only document of the treasure-tables collection. */
export const TREASURE_TABLES_ID = 'treasure';

/** Inclusive range of a roll: d100, or 1-300 for the magic tables. */
export interface RangeRow {
  min: number;
  max: number;
}

export const QUALITIES = ['very-poor', 'poor', 'normal', 'rich', 'very-rich'] as const;
export type Quality = (typeof QUALITIES)[number];

/** The magic item tables of 7-1h: each one is rolled 1-300. */
export const MAGIC_TABLES = ['melee', 'ranged', 'armor', 'utility', 'spell', 'charged'] as const;
export type MagicTable = (typeof MAGIC_TABLES)[number];

// The magic item contract of rmu-api-items (features.magic, spec 067), repeated here for the generic items.
export const MAGIC_ITEM_KINDS = [
  'daily',
  'constant',
  'at-will',
  'triggered',
  'emplaced',
  'charged',
  'single-use',
  'potion',
  'rune-paper',
  'power-enhancer',
  'general-bonus',
  'stat-bonus',
  'skill',
  'armor',
  'weapon',
  'other',
] as const;
export type MagicItemKind = (typeof MAGIC_ITEM_KINDS)[number];

export const MAGIC_BONUS_KINDS = [
  'ob',
  'db',
  'shield',
  'skill',
  'rr',
  'stat',
  'spell-adder',
  'pp-multiplier',
  'pp-adder',
  'armor-penalty',
] as const;
export type MagicBonusKind = (typeof MAGIC_BONUS_KINDS)[number];

export const MAGIC_SPELL_USES = ['recipe', 'constant', 'daily', 'charges', 'at-will', 'triggered', 'emplaced', 'single-use'] as const;
export type MagicSpellUse = (typeof MAGIC_SPELL_USES)[number];

/** A bonus of a magic item; `against: 'random'` is rolled on the creature types (7-1k). */
export interface MagicItemBonus {
  kind: MagicBonusKind;
  value: number;
  target?: string | null;
  against?: string | null;
}

/** The book codes (7-1a) of each kind of treasure: a..e wealth, l..p lifestyle, u..z magic. */
export interface TreasureCodes {
  wealth: Record<string, Quality>;
  lifestyle: Record<string, Quality>;
  magic: Record<string, Quality>;
}

export const WEALTH_TYPES = ['coins', 'gems', 'jewelry', 'art'] as const;
export type WealthType = (typeof WEALTH_TYPES)[number];

export type WealthRollsRow = RangeRow & { rolls: number };
/** valueMin may be -999 for "0 or less" and valueMax 999 for "201+". */
export type WealthValueRow = RangeRow & { valueMin: number; valueMax: number };
/** Own keys: power-superior... */
export interface WealthValueModifier {
  key: string;
  value: number;
}
export type WealthTypeRow = RangeRow & { type: WealthType; multiplier: number };
/** A jewelry catalog id of rmu-api-items. */
export type JewelryTypeRow = RangeRow & { itemTypeId: string };
/** Own kebab keys (i18n in assets). */
export type KeyRow = RangeRow & { key: string };
export interface GearQualityCell {
  total: number;
  max: number | null;
}
export type GearQualityRow = RangeRow & Record<Quality, GearQualityCell>;
/** The modifiers of each quality; [] is none. */
export type MagicTreasureRow = RangeRow & Record<Quality, number[]>;
export type ItemTypeRow = RangeRow & { table: MagicTable };

export const GENERIC_MAGIC_BASES = ['weapon', 'missile', 'ranged', 'armor', 'shield', 'jewelry', 'potion', 'spell-item', 'other'] as const;
export type GenericMagicBase = (typeof GENERIC_MAGIC_BASES)[number];

export interface GenericMagicSpell {
  levelMin: number;
  levelMax: number;
  use: MagicSpellUse;
  perDay?: number | null;
  charges?: number | null;
}

/** A magic item the generator resolves: a base and the bonuses or the spell it gets. */
export interface GenericMagicItem {
  base: GenericMagicBase;
  /** Fixed base, e.g. wand */
  baseItemTypeId?: string | null;
  kind: MagicItemKind;
  itemLevel?: number | null;
  bonuses: MagicItemBonus[];
  spell?: GenericMagicSpell | null;
}

export interface MagicTableRow extends RangeRow {
  /** Book row text, data only */
  label: string;
  /** Silver */
  price: { min: number; max: number };
  /** A named compendium item */
  itemTypeId?: string | null;
  /** Resolved by the generator */
  generic?: GenericMagicItem | null;
}

export type RandomWeaponTableRow = RangeRow & { group: string };
export type RandomWeaponSizeRow = RangeRow & { size: string };
export type RandomWeaponRow = RangeRow & { itemTypeId: string | null; missile?: boolean };
/** 7-1j */
export interface RandomWeapons {
  table: RandomWeaponTableRow[];
  size: RandomWeaponSizeRow[];
  groups: Record<string, RandomWeaponRow[]>;
}

/** 7-1n */
export type RandomArmorRow = RangeRow & { itemTypeId: string | null; at: number | null; shield?: boolean };

export type RandomSpellRealmRow = RangeRow & { realm: string };
/** listCode of rmu-api-spells; null is "other". */
export type RandomSpellListRow = RangeRow & { listCode: string | null };
/** 7-1r */
export interface RandomSpells {
  realm: RandomSpellRealmRow[];
  lists: Record<string, RandomSpellListRow[]>;
}

export type GemRandomRow = RangeRow & { itemTypeId: string };
export interface GemRandomColumn {
  min: number;
  max: number;
  rows: GemRandomRow[];
}
export interface GemRandomTable {
  columns: GemRandomColumn[];
}
/** 2-4d, 2-4e */
export interface TreasureGems {
  precious: GemRandomTable;
  semiPrecious: GemRandomTable;
}

/** Price in silver. */
export interface StandardBonusRow {
  bonus: number;
  days: number;
  level: number;
  price: number;
}

/** Price in silver. */
export interface StandardPriceRow {
  days: number;
  level: number;
  price: number;
}

/** 6-1a: price per day = itemLevel + extraSp. */
export interface PricePerDayRow {
  ppMin: number;
  ppMax: number | null;
  extraSp: number;
}

export const GENERAL_BONUS_MATERIALS = ['wood', 'metal', 'leather'] as const;
export type GeneralBonusMaterial = (typeof GENERAL_BONUS_MATERIALS)[number];

export const SPELL_PRICE_REALMS = ['essence', 'channeling-mentalism', 'hybrid'] as const;
export type SpellPriceRealm = (typeof SPELL_PRICE_REALMS)[number];

export const CHARGED_STICKS = ['wand', 'rod', 'staff', 'half-bole', 'bole'] as const;
export type ChargedStick = (typeof CHARGED_STICKS)[number];

export interface SpellPriceRow {
  spellLevel: number;
  realm: SpellPriceRealm;
  row: StandardPriceRow;
}

/** Chapter 6: the standard pricing tables. */
export interface StandardPricing {
  /** Extra chapter 6 tables of the import (rune paper, sacred, single use…), passed through as stored. */
  [extra: string]: unknown;
  pricePerDay: PricePerDayRow[];
  /** 6-5 */
  weapon: StandardBonusRow[];
  /** 6-6 */
  ranged: StandardBonusRow[];
  /** 6-2 */
  armor: { at: number; rows: StandardBonusRow[] }[];
  shield: StandardBonusRow[];
  /** 6-1e */
  generalBonus: { material: GeneralBonusMaterial; rows: StandardBonusRow[] }[];
  /** 6-1f, own keys */
  powerEnhancers: { effect: string; held: StandardPriceRow; worn: StandardPriceRow }[];
  /** 6-1b */
  daily: SpellPriceRow[];
  /** 6-1c */
  constant: SpellPriceRow[];
  /** 6-1d */
  emplaced: { spellLevel: number; row: StandardPriceRow & { itemPp: number } }[];
  /** 6-7 */
  potions: { spellLevel: number; row: StandardPriceRow }[];
  /** 6-8 */
  charged: { stick: ChargedStick; spellLevel: number; charges: number; row: StandardPriceRow }[];
}

/** The document of the treasure-tables collection, as GET v1/treasure-tables returns it (TreasureTablesDto). */
export interface TreasureTables {
  id: typeof TREASURE_TABLES_ID;
  /** Extra parts of the import beyond the plan (armorTables, baseOptions), passed through as stored. */
  extras?: Record<string, unknown>;
  /** 7-1a */
  codes: TreasureCodes;
  /** 7-1b */
  wealthRolls: WealthRollsRow[];
  /** 7-1c value */
  wealthValue: WealthValueRow[];
  /** 7-1c modifiers */
  wealthValueModifiers: WealthValueModifier[];
  wealthType: WealthTypeRow[];
  /** 0.01 … 100 */
  wealthMultipliers: Record<Quality, number>;
  /** 7-1d */
  jewelryTypes: JewelryTypeRow[];
  /** 7-1e */
  artTypes: KeyRow[];
  /** 7-1f */
  gearQuality: GearQualityRow[];
  /** 7-1g */
  magicTreasure: MagicTreasureRow[];
  magicMaxLevel: Record<Quality, number | null>;
  /** 7-1h */
  itemType: ItemTypeRow[];
  /** 7-1i, l, m, o, p, q (1-300) */
  magicTables: Record<MagicTable, MagicTableRow[]>;
  randomWeapons: RandomWeapons;
  /** 7-1k, own kebab keys */
  creatureTypes: KeyRow[];
  randomArmor: RandomArmorRow[];
  randomSpells: RandomSpells;
  gems: TreasureGems;
  standardPricing: StandardPricing;
  /** Bumped by the import when the tables change; 0 when the document has none */
  version: number;
}
