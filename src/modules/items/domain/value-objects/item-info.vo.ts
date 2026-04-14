import { ItemCost } from './item-cost.vo';

export interface ItemInfo {
  cost: ItemCost | undefined;
  length: number | undefined;
  weight: number | undefined;
  weightPercent: number | undefined;
  strength: number | undefined;
  productionHours: number | undefined;
  stackable: boolean | undefined;
}
