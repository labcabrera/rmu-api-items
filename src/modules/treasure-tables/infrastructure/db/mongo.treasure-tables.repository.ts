import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { TreasureTablesRepository } from '../../application/ports/treasure-tables-repository.port.js';
import {
  MAGIC_TABLES,
  type MagicTable,
  type MagicTableRow,
  QUALITIES,
  type Quality,
  type RangeRow,
  type StandardPricing,
  TREASURE_TABLES_ID,
  type TreasureTables,
} from '../../domain/value-objects/treasure-tables.vo.js';
import { type TreasureTablesDocument, TreasureTablesModel } from '../persistence/models/treasure-tables.model.js';

const sorted = <T extends RangeRow>(rows: T[] | null | undefined): T[] => [...(rows ?? [])].sort((a, b) => a.min - b.min);

@Injectable()
export class MongoTreasureTablesRepository implements TreasureTablesRepository {
  constructor(@InjectModel(TreasureTablesModel.name) private readonly model: Model<TreasureTablesDocument>) {}

  async find(): Promise<TreasureTables | null> {
    const doc = await this.model.findById(TREASURE_TABLES_ID).lean<TreasureTablesModel>();
    return doc ? MongoTreasureTablesRepository.mapToTables(doc) : null;
  }

  /**
   * Every part present, so a partial import never breaks a reader: missing lists are empty, the range rows of the
   * top-level tables are sorted by min, every magic table exists and a missing max level is null (no limit).
   */
  static mapToTables(doc: TreasureTablesModel): TreasureTables {
    const magicTables = Object.fromEntries(MAGIC_TABLES.map(table => [table, sorted(doc.magicTables?.[table])])) as Record<
      MagicTable,
      MagicTableRow[]
    >;
    const magicMaxLevel = Object.fromEntries(QUALITIES.map(quality => [quality, doc.magicMaxLevel?.[quality] ?? null])) as Record<
      Quality,
      number | null
    >;
    const pricing = doc.standardPricing ?? {};
    const standardPricing: StandardPricing = {
      ...pricing,
      pricePerDay: pricing.pricePerDay ?? [],
      weapon: pricing.weapon ?? [],
      ranged: pricing.ranged ?? [],
      armor: pricing.armor ?? [],
      shield: pricing.shield ?? [],
      generalBonus: pricing.generalBonus ?? [],
      powerEnhancers: pricing.powerEnhancers ?? [],
      daily: pricing.daily ?? [],
      constant: pricing.constant ?? [],
      emplaced: pricing.emplaced ?? [],
      potions: pricing.potions ?? [],
      charged: pricing.charged ?? [],
    };
    return {
      id: TREASURE_TABLES_ID,
      codes: { wealth: doc.codes?.wealth ?? {}, lifestyle: doc.codes?.lifestyle ?? {}, magic: doc.codes?.magic ?? {} },
      wealthRolls: sorted(doc.wealthRolls),
      wealthValue: sorted(doc.wealthValue),
      wealthValueModifiers: doc.wealthValueModifiers ?? [],
      wealthType: sorted(doc.wealthType),
      wealthMultipliers: (doc.wealthMultipliers ?? {}) as Record<Quality, number>,
      jewelryTypes: sorted(doc.jewelryTypes),
      artTypes: sorted(doc.artTypes),
      gearQuality: sorted(doc.gearQuality),
      magicTreasure: sorted(doc.magicTreasure),
      magicMaxLevel,
      itemType: sorted(doc.itemType),
      magicTables,
      randomWeapons: {
        table: sorted(doc.randomWeapons?.table),
        size: sorted(doc.randomWeapons?.size),
        groups: doc.randomWeapons?.groups ?? {},
      },
      creatureTypes: sorted(doc.creatureTypes),
      randomArmor: sorted(doc.randomArmor),
      randomSpells: { realm: sorted(doc.randomSpells?.realm), lists: doc.randomSpells?.lists ?? {} },
      gems: {
        precious: doc.gems?.precious ?? { columns: [] },
        semiPrecious: doc.gems?.semiPrecious ?? { columns: [] },
      },
      standardPricing,
      extras: { armorTables: doc.armorTables ?? null, baseOptions: doc.baseOptions ?? null },
      version: doc.version ?? 0,
    };
  }
}
