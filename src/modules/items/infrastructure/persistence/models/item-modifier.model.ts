import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ItemModifier {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  type!: string;

  @Prop({ type: String, required: false })
  modifier: string | undefined;

  @Prop({ type: Number, required: false })
  value: number | undefined;
}
