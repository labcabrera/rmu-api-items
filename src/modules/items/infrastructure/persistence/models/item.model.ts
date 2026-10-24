import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { ItemArmor, ItemShield } from './item-childs.model.js';
import type { ItemCategory } from '../../../domain/value-objects/item-category.vo.js';
import { ItemWeapon } from './item-weapon.model.js';
import { ItemModifier } from '../../../domain/value-objects/item-modifier.vo.js';
import { ItemInfo } from './item-info.model.js';

export type ItemDocument = HydratedDocument<ItemModel>;

@Schema({ collection: 'items', versionKey: false })
export class ItemModel {
  @Prop({ required: true })
  _id: string;

  /** Optimistic concurrency: +1 on each write. Documents stored before it existed have none (version 0). */
  @Prop({ type: Number, default: 0 })
  version: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  realmId: string | null;

  @Prop({ type: String, required: true })
  category: ItemCategory;

  @Prop({ type: ItemWeapon, required: false })
  weapon: ItemWeapon | null;

  @Prop({ type: ItemArmor, required: false })
  armor: ItemArmor | null;

  @Prop({ type: ItemShield, required: false })
  shield: ItemShield | null;

  @Prop({ type: ItemInfo, required: true })
  info: ItemInfo;

  @Prop({ type: [ItemModifier], required: false })
  modifiers: ItemModifier[] | null;

  @Prop({ type: String, required: false })
  description: string | null;

  @Prop({ type: String, required: false })
  imageUrl: string | null;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | null;
}

export const ItemSchema = SchemaFactory.createForClass(ItemModel);
