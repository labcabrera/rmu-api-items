import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { NegotiationRow, PriceFactor, TaxRow } from '../../../domain/value-objects/trading-tables.vo.js';

export type TradingTablesDocument = HydratedDocument<TradingTablesModel>;

/**
 * Same shape as TradingTables, with the rulebook as _id. Imported with data/scripts/import-trading-tables.js. The
 * document `taxation` of the same collection has only `rows`, the taxes and tolls (spec 062).
 */
@Schema({ collection: 'trading-tables', id: true, versionKey: false })
export class TradingTablesModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: [Object], required: true })
  negotiation: NegotiationRow[];

  @Prop({ type: [Object], required: true })
  priceFactors: PriceFactor[];

  @Prop({ type: [Object], required: false })
  rows?: TaxRow[];
}

export const TradingTablesSchema = SchemaFactory.createForClass(TradingTablesModel);
