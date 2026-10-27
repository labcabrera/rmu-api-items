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

export interface ItemFeatures {
  container?: ItemContainer | null;
  light?: ItemLight | null;
  transport?: ItemTransport | null;
  ammunition?: ItemAmmunition | null;
}

export const ARMOR_CLASSES = ['light', 'medium', 'heavy'] as const;

/** Class of a helmet, vambraces or greaves (Core Law, piecemeal armor). */
export type ArmorClass = (typeof ARMOR_CLASSES)[number];
