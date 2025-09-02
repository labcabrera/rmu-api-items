import { Prop, Schema } from '@nestjs/mongoose';
import * as item from 'src/modules/items/domain/entities/item';

@Schema({ _id: false })
export class ItemCost {
  @Prop({ type: Number, required: true })
  min: number;

  @Prop({ type: Number, required: true })
  average: number;

  @Prop({ type: Number, required: true })
  max: number;
}

@Schema({ _id: false })
export class ItemInfo {
  @Prop({ type: ItemCost, required: false })
  cost: ItemCost;

  @Prop({ type: Number, required: false })
  length: number;

  @Prop({ type: Number, required: false })
  weight: number;

  @Prop({ type: Number, required: false })
  weigthPercent: number;

  @Prop({ type: Number, required: false })
  strength: number;

  @Prop({ type: Number, required: false })
  productionHours: number;
}

@Schema({ _id: false })
export class ItemWeaponRange {
  @Prop({ type: Number, required: true })
  from: number;

  @Prop({ type: Number, required: true })
  to: number;

  @Prop({ type: Number, required: true })
  bonus: number;
}

@Schema({ _id: false })
export class ItemWeapon {
  @Prop({ type: String, required: true })
  attackTable: string;

  @Prop({ type: String, required: true })
  fumbleTable: string;

  @Prop({ type: String, required: true })
  skillId: string;

  @Prop({ type: Number, required: true })
  fumble: number;

  @Prop({ type: Number, required: true })
  sizeAdjustment: number;

  @Prop({ type: Number, required: true })
  requiredHands: number;

  @Prop({ type: Boolean, required: true })
  throwable: boolean;

  @Prop({ type: [ItemWeaponRange], required: false })
  ranges: ItemWeaponRange[] | undefined;
}

@Schema({ _id: false })
export class ItemArmor {
  @Prop({ type: String, required: true })
  slot: item.ArmorSlot;

  @Prop({ type: Number, required: true })
  at: number;

  @Prop({ type: Number, required: true })
  enc: number;

  @Prop({ type: Number, required: true })
  maneuver: number;

  @Prop({ type: Number, required: true })
  rangedPenalty: number;

  @Prop({ type: Number, required: true })
  perception: number;

  @Prop({ type: String, required: true })
  baseDifficulty: item.DifficultyCode;
}

@Schema({ _id: false })
export class ItemShield {
  @Prop({ type: Number, required: true })
  attacks: number;
}
