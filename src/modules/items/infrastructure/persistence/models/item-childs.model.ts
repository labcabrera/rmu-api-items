import { Prop, Schema } from '@nestjs/mongoose';
import type { ArmorSlot } from 'src/modules/items/domain/value-objects/armor-slot.vo';
import type { DifficultyCode } from 'src/modules/items/domain/value-objects/difficulty-code.vo';

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
}

@Schema({ _id: false })
export class ItemShield {
  @Prop({ type: Number, required: true })
  db: number;

  @Prop({ type: Number, required: true })
  blockCount: number;
}
