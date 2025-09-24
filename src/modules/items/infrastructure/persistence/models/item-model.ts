import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemArmor, ItemInfo, ItemShield, ItemWeapon } from './item-childs.model';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';

export type ItemDocument = ItemModel & Document;

@Schema({ collection: 'items', versionKey: false })
export class ItemModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  realm: string;

  @Prop({ required: true })
  category: ItemCategory;

  @Prop({ type: ItemWeapon, required: false })
  weapon: ItemWeapon | undefined;

  @Prop({ type: ItemArmor, required: false })
  armor: ItemArmor | undefined;

  @Prop({ type: ItemShield, required: false })
  shield: ItemShield | undefined;

  @Prop({ type: ItemInfo, required: true })
  info: ItemInfo;

  @Prop({ required: true })
  stackable: boolean;

  @Prop({ type: String, required: false })
  description: string | undefined;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | undefined;
}

export const ItemSchema = SchemaFactory.createForClass(ItemModel);
