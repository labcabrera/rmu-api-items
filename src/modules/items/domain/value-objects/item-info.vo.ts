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
}
