import { Prop, Schema } from '@nestjs/mongoose';
import { ItemWeaponMode } from './item-weapon-mode.model';

@Schema({ _id: false })
export class ItemWeapon {
  @Prop({ type: String, required: true })
  skillId: string;

  @Prop({ type: Number, required: true })
  fumble: number;

  @Prop({ type: [ItemWeaponMode], required: false })
  modes: ItemWeaponMode[] | undefined;
}
