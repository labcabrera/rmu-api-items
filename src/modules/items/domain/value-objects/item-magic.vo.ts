import { ValidationError } from '../../../shared/domain/errors/errors.js';

/**
 * The magic block of an item type (workspace spec 067, decision 4): any category may have it, so a magic sword stays a
 * weapon. It is data for strategic (enchantment, modifiers and charges of the instance) and for the treasure generator.
 * The effect text is in the description, as in the rest of the Treasure Law catalog.
 */

/** Types of magic item of Treasure Law 3.3, plus the compendium groups of chapter 6. */
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

/** How a spell of the item is used: the recipe spells only make it, the rest are cast by the item. */
export const MAGIC_SPELL_USES = ['recipe', 'constant', 'daily', 'charges', 'at-will', 'triggered', 'emplaced', 'single-use'] as const;
export type MagicSpellUse = (typeof MAGIC_SPELL_USES)[number];

export const MAGIC_REALMS = ['channeling', 'essence', 'mentalism', 'hybrid'] as const;
export type MagicRealm = (typeof MAGIC_REALMS)[number];

/** A structured bonus: target is the skill, stat or resistance; against is a creature type (slaying, holy...). */
export interface MagicItemBonus {
  kind: MagicBonusKind;
  value: number;
  target?: string | null;
  against?: string | null;
}

/** A spell of the recipe or one the item casts; perDay only for the daily use. */
export interface MagicItemSpell {
  name: string;
  level: number;
  list?: string | null;
  use: MagicSpellUse;
  perDay?: number | null;
}

export interface MagicItemFeature {
  /** ≥ 0 */
  itemLevel: number;
  kind: MagicItemKind;
  /** Working days of the recipe */
  days: number | null;
  /** Gold, power level Superior, includes the base item */
  standardPrice: number | null;
  /** Gold, the base item part of standardPrice */
  basePrice: number | null;
  attunement: boolean;
  /** Max charges */
  charges: number | null;
  /** 'channeling' | 'essence' | 'mentalism' | 'hybrid' | null */
  realm: string | null;
  bonuses: MagicItemBonus[];
  spells: MagicItemSpell[];
  /** Book section, e.g. '6.5' */
  section: string | null;
}

/** The rules the DTO cannot check alone; the messages are the 400 of the API. */
export function checkMagicItemFeature(magic: MagicItemFeature): void {
  if (!MAGIC_ITEM_KINDS.includes(magic.kind)) throw new ValidationError('Invalid magic item kind');
  if (!Number.isInteger(magic.itemLevel) || magic.itemLevel < 0) throw new ValidationError('Invalid magic item level');
  if (magic.realm != null && !(MAGIC_REALMS as readonly string[]).includes(magic.realm)) {
    throw new ValidationError('Invalid magic item realm');
  }
  for (const [name, value] of Object.entries({ days: magic.days, 'standard price': magic.standardPrice, 'base price': magic.basePrice })) {
    if (value != null && value < 0) throw new ValidationError(`Invalid magic item ${name}`);
  }
  if (magic.basePrice != null && magic.standardPrice != null && magic.basePrice > magic.standardPrice) {
    throw new ValidationError('The magic item base price exceeds its standard price');
  }
  if (magic.charges != null && (!Number.isInteger(magic.charges) || magic.charges < 1)) {
    throw new ValidationError('Invalid magic item charges');
  }
  for (const bonus of magic.bonuses) {
    if (!MAGIC_BONUS_KINDS.includes(bonus.kind)) throw new ValidationError('Invalid magic item bonus kind');
  }
  for (const spell of magic.spells) {
    if (!MAGIC_SPELL_USES.includes(spell.use)) throw new ValidationError('Invalid magic item spell use');
    if (!Number.isInteger(spell.level) || spell.level < 0) throw new ValidationError('Invalid magic item spell level');
    if (spell.perDay != null && spell.use !== 'daily') throw new ValidationError('Only a daily spell has uses per day');
    if (spell.perDay != null && (!Number.isInteger(spell.perDay) || spell.perDay < 1)) {
      throw new ValidationError('Invalid magic item spell uses per day');
    }
  }
}
