import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NamedEntity {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;
}
