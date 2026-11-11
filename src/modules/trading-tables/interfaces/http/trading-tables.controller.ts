import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { GetTradingTablesQuery } from '../../application/cqrs/queries/get-trading-tables.query.js';
import type { TradingTables } from '../../domain/value-objects/trading-tables.vo.js';
import { TradingTablesDto } from './dto/trading-tables.dto.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/trading-tables')
@ApiTags('Trading tables')
export class TradingTablesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({
    operationId: 'getTradingTables',
    summary: 'Get the trading tables',
    description:
      'Negotiation table (percent of the expected price by total, buying and selling) and the market conditions of ' +
      'the expected price, and the taxes and tolls as a reference table. Requires Core Law access.',
  })
  @ApiOkResponse({ type: TradingTablesDto, description: 'Success' })
  @ApiErrors({ 403: 'The user has no Core Law access', 404: 'The trading tables have not been imported' })
  async getTradingTables(@CurrentUser() user: AuthenticatedUser): Promise<TradingTablesDto> {
    const query = new GetTradingTablesQuery(user.id, user.roles);
    const tables = await this.queryBus.execute<GetTradingTablesQuery, TradingTables>(query);
    return TradingTablesDto.fromEntity(tables);
  }
}
