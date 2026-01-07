import { Prop, Schema } from '@nestjs/mongoose';
import type { AttackTable } from 'src/modules/items/domain/value-objects/attack-table.vo';
import type { FumbleTable } from 'src/modules/items/domain/value-objects/fumble-table.vo';
import type { WeaponMode } from 'src/modules/items/domain/value-objects/weapon-mode.vo';
import { ItemWeaponRange } from './item-childs.model';

@Schema({ _id: false })
export class ItemWeaponMode {
  @Prop({ type: String, required: true })
  type: WeaponMode;

  @Prop({ type: Number, required: true })
  attackTable: AttackTable;

  @Prop({ type: Number, required: true })
  fumbleTable: FumbleTable;

  @Prop({ type: Number, required: true })
  sizeAdjustment: number;

  @Prop({ type: [ItemWeaponRange], required: false })
  ranges: ItemWeaponRange[] | undefined;

  @Prop({ type: String, required: false })
  alternativeTable: AttackTable | undefined;
}
