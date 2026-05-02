import { ItemCost } from './item-cost.vo';
import { ItemRarity } from './item-rarity.vo';

export interface ItemInfo {
  cost: ItemCost | null;
  length: number | null;
  weight: number | null;
  strength: number | null;
  productionHours: number | null;
  stackable: boolean | null;
  rarity: ItemRarity | null;
  unique: boolean | null;
}
