export type ItemCategory = 'weapon' | 'armor' | 'shield' | 'other';
export type ArmorSlot = 'chest' | 'head';

export interface Item {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeapon | undefined;
  armor: ItemArmor | undefined;
  info: ItemInfo;
  description: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export interface ItemInfo {
  cost: number | undefined;
  length: number | undefined;
  weight: number | undefined;
  strength: number | undefined;
  productionHours: number | undefined;
}

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

export interface ItemWeaponRange {
  from: number;
  to: number;
  bonus: number;
}

export interface ItemArmor {
  slot: ArmorSlot;
  at: number;
  enc: number;
  maneuver: number;
  rangedPenalty: number;
  perception: number;
}
