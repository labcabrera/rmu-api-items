export type ItemCategory = 'weapon' | 'armor' | 'shield' | 'clothes' | 'other';
export type ArmorSlot = 'body' | 'head' | 'legs' | 'arms';
export type DifficultyCode = 'c' | 's' | 'r' | 'e' | 'l' | 'm' | 'h' | 'vh' | 'xh' | 'sf' | 'a' | 'ni';

export interface Item {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeapon | undefined;
  armor: ItemArmor | undefined;
  shield: ItemShield | undefined;
  info: ItemInfo;
  description: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export interface ItemInfo {
  cost: ItemCost | undefined;
  length: number | undefined;
  weight: number | undefined;
  weightPercent: number | undefined;
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
  baseDifficulty: DifficultyCode;
}

export interface ItemShield {
  attacks: number;
}

export interface ItemCost {
  min: number;
  average: number;
  max: number;
}
