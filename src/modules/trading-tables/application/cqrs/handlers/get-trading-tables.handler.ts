import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { checkCoreLawAccess } from '../../../../shared/domain/services/core-law-access.js';
import type { TradingTables } from '../../../domain/value-objects/trading-tables.vo.js';
import { TRADING_TABLES_REPOSITORY, type TradingTablesRepository } from '../../ports/trading-tables-repository.port.js';
import { GetTradingTablesQuery } from '../queries/get-trading-tables.query.js';

@QueryHandler(GetTradingTablesQuery)
export class GetTradingTablesHandler implements IQueryHandler<GetTradingTablesQuery, TradingTables> {
  constructor(@Inject(TRADING_TABLES_REPOSITORY) private readonly repository: TradingTablesRepository) {}

  async execute(query: GetTradingTablesQuery): Promise<TradingTables> {
    // Rulebook content, gated like the other rulebook tables (Treasure Law content, but it keeps its Core Law check: workspace spec 095)
    checkCoreLawAccess(query.roles);
    const tables = await this.repository.findById(query.id);
    if (!tables) throw new NotFoundError('Trading tables', query.id);
    // Spec 062: the taxes and tolls are a reference table of their own document
    const taxation = await this.repository.findTaxation();
    return { ...tables, taxation };
  }
}
