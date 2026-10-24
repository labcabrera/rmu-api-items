import { Prop, Schema } from '@nestjs/mongoose';

// Each bound is optional: the item form sends the ones the user filled in, and a PATCH already stored them so.
@Schema({ _id: false })
export class ItemCost {
  @Prop({ type: Number, required: false })
  min: number;

  @Prop({ type: Number, required: false })
  average: number;

  @Prop({ type: Number, required: false })
  max: number;
}
