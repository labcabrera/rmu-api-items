import { Prop, Schema } from '@nestjs/mongoose';
import type { AttackTable } from '../../../domain/value-objects/attack-table.vo.js';
import type { FumbleTable } from '../../../domain/value-objects/fumble-table.vo.js';
import type { WeaponMode } from '../../../domain/value-objects/weapon-mode.vo.js';
import type { AttackType } from '../../../domain/value-objects/attack-type.vo.js';
import { ItemWeaponRange } from './item-childs.model.js';

@Schema({ _id: false })
export class ItemWeaponMode {
  @Prop({ type: String, required: true })
  type: WeaponMode;

  @Prop({ type: String, required: true })
  attackTable: AttackTable;

  @Prop({ type: String, required: true })
  fumbleTable: FumbleTable;

  @Prop({ type: Number, required: true })
  sizeAdjustment: number;

  @Prop({ type: [String], required: false })
  attackTypes: AttackType[];

  @Prop({ type: [ItemWeaponRange], required: false })
  ranges: ItemWeaponRange[] | undefined;

  @Prop({ type: String, required: false })
  alternativeTable: AttackTable | undefined;

  @Prop({ type: Number, required: false })
  obModifier?: number;
}
