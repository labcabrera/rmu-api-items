import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemArmor, ItemInfo, ItemShield } from './item-childs.model';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { ItemWeapon } from './item-weapon.model';
import { NamedEntity } from 'src/modules/shared/infrastructure/persistence/models/named-item.model';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';

export type ItemDocument = ItemModel & Document;

@Schema({ collection: 'items', versionKey: false })
export class ItemModel {
  @Prop({ required: true })
  _id!: string;

  @Prop({ type: NamedEntity, required: false })
  realm: NamedEntity | null;

  @Prop({ required: true })
  category!: ItemCategory;

  @Prop({ type: ItemWeapon, required: false })
  weapon: ItemWeapon | undefined;

  @Prop({ type: ItemArmor, required: false })
  armor: ItemArmor | undefined;

  @Prop({ type: ItemShield, required: false })
  shield: ItemShield | undefined;

  @Prop({ type: ItemInfo, required: true })
  info!: ItemInfo;

  @Prop({ type: [ItemModifier], required: false })
  modifiers: ItemModifier[] | undefined;

  @Prop({ type: String, required: false })
  description: string | undefined;

  @Prop({ type: String, required: false })
  imageUrl: string | undefined;

  @Prop({ type: String, required: true })
  owner!: string;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | undefined;
}

export const ItemSchema = SchemaFactory.createForClass(ItemModel);
