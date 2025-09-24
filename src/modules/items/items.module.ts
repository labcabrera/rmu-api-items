import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { GetItemHandler } from './application/cqrs/handlers/get-item.handler';
import { GetItemsHandler } from './application/cqrs/handlers/get-items.handler';
import { KafkaItemProducerService } from './infrastructure/messaging/kafka-item-producer.service';
import { ItemModel, ItemSchema } from './infrastructure/persistence/models/item-model';
import { ItemController } from './interfaces/http/item.controller';
import { CreateItemHandler } from './application/cqrs/handlers/create-item..handler';
import { DeleteItemHandler } from './application/cqrs/handlers/delete-item.handler';
import { UpdateItemHandler } from './application/cqrs/handlers/update-item.handler';
import { MongoItemRepository } from './infrastructure/db/mongo.item.repository';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: ItemModel.name, schema: ItemSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [ItemController],
  providers: [
    GetItemHandler,
    GetItemsHandler,
    CreateItemHandler,
    UpdateItemHandler,
    DeleteItemHandler,
    {
      provide: 'ItemRepository',
      useClass: MongoItemRepository,
    },
    {
      provide: 'ItemEventProducer',
      useClass: KafkaItemProducerService,
    },
  ],
  exports: ['ItemRepository'],
})
export class ItemsModule {}
