import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as item from 'src/modules/items/domain/entities/item';
import { ItemArmor, ItemInfo, ItemWeapon } from './item-childs.model';

export type ItemDocument = ItemModel & Document;

@Schema({ collection: 'items', versionKey: false })
export class ItemModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  realm: string;

  @Prop({ required: true })
  category: item.ItemCategory;

  @Prop({ type: ItemWeapon, required: false })
  weapon: ItemWeapon | undefined;

  @Prop({ type: ItemArmor, required: false })
  armor: ItemArmor | undefined;

  @Prop({ type: ItemInfo, required: true })
  info: ItemInfo;

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
