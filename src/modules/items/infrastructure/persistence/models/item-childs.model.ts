import { Prop, Schema } from '@nestjs/mongoose';
import type { ArmorSlot } from '../../../domain/value-objects/armor-slot.vo.js';
import type { DifficultyCode } from '../../../domain/value-objects/difficulty-code.vo.js';
import type { ArmorClass } from '../../../domain/value-objects/item-features.vo.js';

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
export class ItemArmor {
  @Prop({ type: String, required: true })
  slot: ArmorSlot;

  @Prop({ type: Number, required: true })
  at: number;

  @Prop({ type: Number, required: true })
  enc: number;

  @Prop({ type: Number, required: true })
  maneuverPenalty: number;

  @Prop({ type: Number, required: true })
  rangedPenalty: number;

  @Prop({ type: Number, required: true })
  perceptionPenalty: number;

  @Prop({ type: String, required: true })
  baseDifficulty: DifficultyCode;

  @Prop({ type: [String], required: false, default: undefined })
  coverage?: ArmorSlot[] | null;

  @Prop({ type: String, required: false })
  class?: ArmorClass | null;
}

@Schema({ _id: false })
export class ItemShield {
  @Prop({ type: Number, required: true })
  db: number;

  @Prop({ type: Number, required: true })
  blockCount: number;
}

@Schema({ _id: false })
export class ItemContainer {
  @Prop({ type: Number, required: false })
  weight: number | null;

  @Prop({ type: Number, required: false })
  volume: number | null;

  @Prop({ type: Number, required: false })
  liquid: number | null;

  @Prop({ type: Number, required: false })
  units: number | null;
}

@Schema({ _id: false })
export class ItemLight {
  @Prop({ type: Number, required: false })
  radius: number | null;

  @Prop({ type: Number, required: false })
  durationHours: number | null;
}

@Schema({ _id: false })
export class ItemTransport {
  @Prop({ type: Number, required: false })
  capacity: number | null;

  @Prop({ type: Number, required: false })
  speed: number | null;
}

@Schema({ _id: false })
export class ItemAmmunition {
  @Prop({ type: [String], required: true })
  launchers: string[];

  @Prop({ type: Number, required: true })
  sizeAdjustment: number;
}

/** Spec 041, decision 4. */
@Schema({ _id: false })
export class ItemFeatures {
  @Prop({ type: ItemContainer, required: false })
  container?: ItemContainer | null;

  @Prop({ type: ItemLight, required: false })
  light?: ItemLight | null;

  @Prop({ type: ItemTransport, required: false })
  transport?: ItemTransport | null;

  @Prop({ type: ItemAmmunition, required: false })
  ammunition?: ItemAmmunition | null;
}
