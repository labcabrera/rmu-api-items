import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { MaterialCost, MaterialGroup, MaterialUse } from '../../../domain/value-objects/material.vo.js';

export type MaterialDocument = HydratedDocument<MaterialModel>;

/** Same shape as Material, with its id as _id. Imported with data/scripts/import-materials-043.js. */
@Schema({ collection: 'materials', id: true, versionKey: false })
export class MaterialModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  group: MaterialGroup;

  @Prop({ type: Number, required: true })
  durability: number;

  @Prop({ type: Number, default: null })
  workability: number | null;

  @Prop({ type: Number, required: true })
  bonus: number;

  @Prop({ type: Number, default: null })
  bluntBonus: number | null;

  @Prop({ type: Number, default: null })
  metalBonus: number | null;

  @Prop({ type: Object, required: true })
  cost: MaterialCost;

  @Prop({ type: Number, default: null })
  costPerPound: number | null;

  @Prop({ type: Number, default: null })
  density: number | null;

  @Prop({ type: Boolean, default: false })
  magical: boolean;

  @Prop({ type: Boolean, default: false })
  alloy: boolean;

  @Prop({ type: String, default: null })
  alloyDifficulty: string | null;

  @Prop({ type: Number, default: null })
  armorWeightMultiplier: number | null;

  @Prop({ type: [String], default: [] })
  uses: MaterialUse[];
}

export const MaterialSchema = SchemaFactory.createForClass(MaterialModel);
