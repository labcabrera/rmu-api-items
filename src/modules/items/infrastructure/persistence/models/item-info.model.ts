import { Prop, Schema } from '@nestjs/mongoose';
import { ItemCost } from './item-cost.model';
import type { ItemRarity } from 'src/modules/items/domain/value-objects/item-rarity.vo';

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

  @Prop({ type: String, enum: ['common', 'uncommon', 'rare', 'very-rare'], required: false, default: 'common' })
  rarity!: ItemRarity;

  @Prop({ type: Boolean, required: false, default: false })
  unique!: boolean;
}
