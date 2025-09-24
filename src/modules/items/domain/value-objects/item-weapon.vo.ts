import { ItemWeaponRange } from './item-weapon-range.vo';

export interface ItemWeapon {
  attackTable: string;
  fumbleTable: string;
  skillId: string;
  fumble: number;
  sizeAdjustment: number;
  requiredHands: number;
  throwable: boolean;
  ranges: ItemWeaponRange[] | undefined;
}
