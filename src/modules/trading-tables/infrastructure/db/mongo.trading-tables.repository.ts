import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TAXATION_ID, type TradingTablesRepository } from '../../application/ports/trading-tables-repository.port.js';
import type { NegotiationRow, PriceFactor, TaxRow, TradingTables } from '../../domain/value-objects/trading-tables.vo.js';
import { type TradingTablesDocument, TradingTablesModel } from '../persistence/models/trading-tables.model.js';

const optional = <T extends object>(entries: T): T =>
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined && value !== null)) as T;

@Injectable()
export class MongoTradingTablesRepository implements TradingTablesRepository {
  constructor(@InjectModel(TradingTablesModel.name) private readonly model: Model<TradingTablesDocument>) {}

  async findById(id: string): Promise<Omit<TradingTables, 'taxation'> | null> {
    const doc = await this.model.findById(id).lean<TradingTablesModel>();
    return doc ? MongoTradingTablesRepository.mapToTables(doc) : null;
  }

  async findTaxation(): Promise<TaxRow[]> {
    const doc = await this.model.findById(TAXATION_ID).lean<TradingTablesModel>();
    return MongoTradingTablesRepository.mapToTaxRows(doc?.rows);
  }

  static mapToTaxRows(rows: TaxRow[] | null | undefined): TaxRow[] {
    return (rows || []).map(row => ({ key: row.key, cost: row.cost ?? null, unit: row.unit ?? null, notes: row.notes ?? null }));
  }

  static mapToTables(doc: TradingTablesModel): Omit<TradingTables, 'taxation'> {
    return {
      negotiation: (doc.negotiation || []).map((row): NegotiationRow => ({
        min: row.min ?? null,
        max: row.max ?? null,
        purchase: row.purchase ?? null,
        sale: row.sale ?? null,
        ...(row.outcome ? { outcome: row.outcome } : {}),
      })),
      priceFactors: (doc.priceFactors || []).map((factor): PriceFactor =>
        optional({
          key: factor.key,
          type: factor.type,
          mode: factor.mode,
          value: factor.value,
          options: factor.options?.map(option => ({ key: option.key, value: option.value })),
          perUnit: factor.perUnit,
          min: factor.min,
          max: factor.max,
          contexts: factor.contexts?.length ? [...factor.contexts] : undefined,
          description: factor.description,
        }),
      ),
    };
  }
}
