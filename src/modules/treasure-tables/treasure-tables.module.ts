import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { GetTreasureTablesHandler } from './application/cqrs/handlers/get-treasure-tables.handler.js';
import { TREASURE_TABLES_REPOSITORY } from './application/ports/treasure-tables-repository.port.js';
import { MongoTreasureTablesRepository } from './infrastructure/db/mongo.treasure-tables.repository.js';
import { TreasureTablesModel, TreasureTablesSchema } from './infrastructure/persistence/models/treasure-tables.model.js';
import { TreasureTablesController } from './interfaces/http/treasure-tables.controller.js';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: TreasureTablesModel.name, schema: TreasureTablesSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [TreasureTablesController],
  providers: [GetTreasureTablesHandler, { provide: TREASURE_TABLES_REPOSITORY, useClass: MongoTreasureTablesRepository }],
})
export class TreasureTablesModule {}
