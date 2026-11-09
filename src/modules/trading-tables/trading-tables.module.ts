import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { GetTradingTablesHandler } from './application/cqrs/handlers/get-trading-tables.handler.js';
import { TRADING_TABLES_REPOSITORY } from './application/ports/trading-tables-repository.port.js';
import { MongoTradingTablesRepository } from './infrastructure/db/mongo.trading-tables.repository.js';
import { TradingTablesModel, TradingTablesSchema } from './infrastructure/persistence/models/trading-tables.model.js';
import { TradingTablesController } from './interfaces/http/trading-tables.controller.js';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: TradingTablesModel.name, schema: TradingTablesSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [TradingTablesController],
  providers: [GetTradingTablesHandler, { provide: TRADING_TABLES_REPOSITORY, useClass: MongoTradingTablesRepository }],
})
export class TradingTablesModule {}
