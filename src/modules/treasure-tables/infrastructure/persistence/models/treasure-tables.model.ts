import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { TreasureTables } from '../../../domain/value-objects/treasure-tables.vo.js';

export type TreasureTablesDocument = HydratedDocument<TreasureTablesModel>;

type Stored<K extends keyof TreasureTables> = Partial<TreasureTables[K]>;

/**
 * Same shape as TreasureTables, with `treasure` as _id. Imported with data/scripts/import-treasure-tables-067.js, which
 * bumps the version when the tables change. The parts are stored as they come: the import builds them.
 */
@Schema({ collection: 'treasure-tables', id: true, versionKey: false })
export class TreasureTablesModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: Object })
  codes?: Stored<'codes'>;

  @Prop({ type: Array })
  wealthRolls?: TreasureTables['wealthRolls'];

  @Prop({ type: Array })
  wealthValue?: TreasureTables['wealthValue'];

  @Prop({ type: Array })
  wealthValueModifiers?: TreasureTables['wealthValueModifiers'];

  @Prop({ type: Array })
  wealthType?: TreasureTables['wealthType'];

  @Prop({ type: Object })
  wealthMultipliers?: Stored<'wealthMultipliers'>;

  @Prop({ type: Array })
  jewelryTypes?: TreasureTables['jewelryTypes'];

  @Prop({ type: Array })
  artTypes?: TreasureTables['artTypes'];

  @Prop({ type: Array })
  gearQuality?: TreasureTables['gearQuality'];

  @Prop({ type: Array })
  magicTreasure?: TreasureTables['magicTreasure'];

  @Prop({ type: Object })
  magicMaxLevel?: Stored<'magicMaxLevel'>;

  @Prop({ type: Array })
  itemType?: TreasureTables['itemType'];

  @Prop({ type: Object })
  magicTables?: Stored<'magicTables'>;

  @Prop({ type: Object })
  randomWeapons?: Stored<'randomWeapons'>;

  @Prop({ type: Array })
  creatureTypes?: TreasureTables['creatureTypes'];

  @Prop({ type: Array })
  randomArmor?: TreasureTables['randomArmor'];

  @Prop({ type: Object })
  randomSpells?: Stored<'randomSpells'>;

  @Prop({ type: Object })
  gems?: Stored<'gems'>;

  @Prop({ type: Object })
  standardPricing?: Stored<'standardPricing'>;

  @Prop({ type: Object })
  armorTables?: Record<string, unknown>;

  @Prop({ type: Object })
  baseOptions?: Record<string, unknown>;

  @Prop({ type: Number, default: 0 })
  version: number;
}

export const TreasureTablesSchema = SchemaFactory.createForClass(TreasureTablesModel);
