/**
 * What an item of the general equipment does besides being carried (workspace spec 041, decision 4): optional blocks
 * that any category but weapon, armor and shield may have. They are information; no rule reads them yet.
 */

/** What a container holds: pounds, cubic feet, gallons or units (e.g. 20 arrows). */
export interface ItemContainer {
  weight: number | null;
  volume: number | null;
  liquid: number | null;
  units: number | null;
}

/** A light source: radius lit in feet and hours of each load (candle, oil, torch). */
export interface ItemLight {
  radius: number | null;
  durationHours: number | null;
}

/** A mount or a vehicle: pounds it carries and feet per round. */
export interface ItemTransport {
  capacity: number | null;
  speed: number | null;
}

/** Ammunition: the item types that shoot it and its attack size adjustment. */
export interface ItemAmmunition {
  launchers: string[];
  sizeAdjustment: number;
}

/** Poison categories of Core Law §15.6 plus the irritants of Treasure Law, which have no general effects (spec 042). */
export const POISON_CATEGORIES = [
  'circulatory',
  'conversion',
  'muscle',
  'nerve',
  'paralytic',
  'reduction',
  'respiratory',
  'irritant',
] as const;
export type PoisonCategory = (typeof POISON_CATEGORIES)[number];

export const POISON_SEVERITIES = ['mild', 'moderate', 'severe', 'extreme'] as const;
export type PoisonSeverity = (typeof POISON_SEVERITIES)[number];

/** How a poison is delivered: liquids and pastes can coat a weapon (Treasure Law 2.3, "Prep"). */
export const POISON_FORMS = ['liquid', 'paste', 'powder', 'ingest', 'gas'] as const;
export type PoisonForm = (typeof POISON_FORMS)[number];

/** Inclusive range rolled when used (hits, rounds). */
export interface ItemRange {
  min: number;
  max: number;
}

/**
 * A poison (spec 042, decision 2): its category gives the general effects (core poison tables), the level is the
 * attack level of the resistance roll. Its own effects beyond these fields are in the description.
 */
export interface ItemPoison {
  category: PoisonCategory;
  level: number;
  form: PoisonForm;
  /** Worst severity it can reach, whatever the RR failure; null is extreme */
  maxSeverity: PoisonSeverity | null;
  /** Hits dealt at once when the RR fails */
  immediateHits: ItemRange | null;
  /** Rounds until its first effects, instead of the onset of the table */
  onsetRounds: ItemRange | null;
}

/** An antidote (spec 042, decision 10): it stops poisonings of these categories up to its level. */
export interface ItemAntidote {
  categories: (PoisonCategory | 'any')[];
  level: number;
  /** Hours after the exposure it still works; null is any time */
  withinHours: number | null;
}

export interface ItemFeatures {
  container?: ItemContainer | null;
  light?: ItemLight | null;
  transport?: ItemTransport | null;
  ammunition?: ItemAmmunition | null;
  poison?: ItemPoison | null;
  antidote?: ItemAntidote | null;
}

export const ARMOR_CLASSES = ['light', 'medium', 'heavy'] as const;

/** Class of a helmet, vambraces or greaves (Core Law, piecemeal armor). */
export type ArmorClass = (typeof ARMOR_CLASSES)[number];
