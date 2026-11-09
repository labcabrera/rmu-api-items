import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { GetTreasureTablesQuery } from '../../application/cqrs/queries/get-treasure-tables.query.js';
import type { TreasureTables } from '../../domain/value-objects/treasure-tables.vo.js';
import { TreasureTablesDto } from './dto/treasure-tables.dto.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/treasure-tables')
@ApiTags('Treasure tables')
export class TreasureTablesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({
    operationId: 'getTreasureTables',
    summary: 'Get the treasure tables',
    description:
      'The random treasure tables (codes, wealth, art, gear quality, magic items, random weapons, armor and spells), ' +
      'the random gem tables and the standard magic item pricing. Requires Treasure Law access.',
  })
  @ApiOkResponse({ type: TreasureTablesDto, description: 'Success' })
  @ApiErrors({ 403: 'The user has no Treasure Law access', 404: 'The treasure tables have not been imported (treasure-tables-not-found)' })
  async getTreasureTables(@CurrentUser() user: AuthenticatedUser): Promise<TreasureTablesDto> {
    const query = new GetTreasureTablesQuery(user.id, user.roles);
    const tables = await this.queryBus.execute<GetTreasureTablesQuery, TreasureTables>(query);
    return TreasureTablesDto.fromEntity(tables);
  }
}
