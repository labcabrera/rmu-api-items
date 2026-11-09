import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { checkTreasureLawAccess } from '../../../../shared/domain/services/treasure-law-access.js';
import { TREASURE_TABLES_ID, type TreasureTables } from '../../../domain/value-objects/treasure-tables.vo.js';
import { TREASURE_TABLES_REPOSITORY, type TreasureTablesRepository } from '../../ports/treasure-tables-repository.port.js';
import { GetTreasureTablesQuery } from '../queries/get-treasure-tables.query.js';

@QueryHandler(GetTreasureTablesQuery)
export class GetTreasureTablesHandler implements IQueryHandler<GetTreasureTablesQuery, TreasureTables> {
  constructor(@Inject(TREASURE_TABLES_REPOSITORY) private readonly repository: TreasureTablesRepository) {}

  async execute(query: GetTreasureTablesQuery): Promise<TreasureTables> {
    checkTreasureLawAccess(query.roles);
    const tables = await this.repository.find();
    if (!tables) throw new NotFoundError('Treasure tables', TREASURE_TABLES_ID, 'treasure-tables-not-found');
    return tables;
  }
}
