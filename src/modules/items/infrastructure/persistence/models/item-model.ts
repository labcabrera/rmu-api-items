import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemArmor, ItemShield } from './item-childs.model';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { ItemWeapon } from './item-weapon.model';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';
import { ItemInfo } from './item-info.model';

export type ItemDocument = ItemModel & Document;

@Schema({ collection: 'items', versionKey: false })
export class ItemModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  realmId: string | null;

  @Prop({ required: true })
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
