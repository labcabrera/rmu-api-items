import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../auth/auth.module';

import { SharedModule } from '../shared/shared.module';
import { CreateItemCommandHandler } from './application/commands/handlers/create-item.command.handler';
import { DeleteItemCommandHandler } from './application/commands/handlers/delete-item.command.handler';
import { UpdateItemCommandHandler } from './application/commands/handlers/update-item.command.handler';
import { GetItemQueryHandler } from './application/queries/handlers/get-item.query.handler';
import { GetItemsQueryHandler } from './application/queries/handlers/get-items.query.handler';
import { GameController } from './infrastructure/controllers/item.controller';
import { KafkaGameProducerService } from './infrastructure/messaging/kafka-game-producer.service';
import { GameModel, GameSchema } from './infrastructure/persistence/models/item-model';
import { MongoGameRepository } from './infrastructure/persistence/repositories/mongo-item.repository';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [GameController],
  providers: [
    GetItemQueryHandler,
    GetItemsQueryHandler,
    CreateItemCommandHandler,
    UpdateItemCommandHandler,
    DeleteItemCommandHandler,
    {
      provide: 'ItemRepository',
      useClass: MongoGameRepository,
    },
    {
      provide: 'ItemEventProducer',
      useClass: KafkaGameProducerService,
    },
  ],
  exports: ['GameRepository'],
})
export class ItemsModule {}
