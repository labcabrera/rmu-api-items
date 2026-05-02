import { Prop, Schema } from '@nestjs/mongoose';
import { ItemCost } from './item-cost.model';
import type { ItemRarity } from 'src/modules/items/domain/value-objects/item-rarity.vo';

@Schema({ _id: false })
export class ItemInfo {
  @Prop({ type: ItemCost, required: false })
  cost: ItemCost | null;

  @Prop({ type: Number, required: false })
  length: number | null;

  @Prop({ type: Number, required: false })
  weight: number | null;

  @Prop({ type: Number, required: false })
  strength: number | null;

  @Prop({ type: Number, required: false })
  productionHours: number | null;

  @Prop({ type: Boolean, required: true })
  stackable: boolean;

  @Prop({ type: String, required: true })
  rarity: ItemRarity;

  @Prop({ type: Boolean, required: true })
  unique: boolean;
}
