import type { ItemCost } from './item-cost.vo.js';
import type { ItemRarity } from './item-rarity.vo.js';

export interface ItemInfo {
  cost: ItemCost | null;
  length: number | null;
  weight: number | null;
  strength: number | null;
  productionHours: number | null;
  stackable: boolean;
  rarity: ItemRarity;
  unique: boolean;
  /** Units of the lot the book sells (20 arrows): cost and weight are per unit (spec 041, decision 2). */
  lotSize?: number | null;
}
