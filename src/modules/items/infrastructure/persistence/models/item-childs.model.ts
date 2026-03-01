import { Prop, Schema } from '@nestjs/mongoose';
import type { ArmorSlot } from 'src/modules/items/domain/value-objects/armor-slot.vo';
import type { DifficultyCode } from 'src/modules/items/domain/value-objects/difficulty-code.vo';

@Schema({ _id: false })
export class ItemCost {
  @Prop({ type: Number, required: true })
  min!: number;

  @Prop({ type: Number, required: true })
  average!: number;

  @Prop({ type: Number, required: true })
  max!: number;
}

@Schema({ _id: false })
export class ItemInfo {
  @Prop({ type: ItemCost, required: false })
  cost: ItemCost | undefined;

  @Prop({ type: Number, required: false })
  length: number | undefined;

  @Prop({ type: Number, required: false })
  weight: number | undefined;

  @Prop({ type: Number, required: false })
  weightPercent: number | undefined;

  @Prop({ type: Number, required: false })
  strength: number | undefined;

  @Prop({ type: Number, required: false })
  productionHours: number | undefined;

  @Prop({ type: Boolean, required: false })
  stackable: boolean | undefined;
}

@Schema({ _id: false })
export class ItemWeaponRange {
  @Prop({ type: Number, required: true })
  from!: number;

  @Prop({ type: Number, required: true })
  to!: number;

  @Prop({ type: Number, required: true })
  bonus!: number;
}

@Schema({ _id: false })
export class ItemArmor {
  @Prop({ type: String, required: true })
  slot!: ArmorSlot;

  @Prop({ type: Number, required: true })
  at!: number;

  @Prop({ type: Number, required: true })
  enc!: number;

  @Prop({ type: Number, required: true })
  maneuver!: number;

  @Prop({ type: Number, required: true })
  rangedPenalty!: number;

  @Prop({ type: Number, required: true })
  perception!: number;

  @Prop({ type: String, required: true })
  baseDifficulty!: DifficultyCode;
}

@Schema({ _id: false })
export class ItemShield {
  @Prop({ type: Number, required: true })
  attacks!: number;
}
