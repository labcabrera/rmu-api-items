import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ItemCost {
  @Prop({ type: Number, required: true })
  min: number;

  @Prop({ type: Number, required: true })
  average: number;

  @Prop({ type: Number, required: true })
  max: number;
}
