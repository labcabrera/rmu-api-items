import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { GetItemHandler } from './application/cqrs/handlers/get-item.handler.js';
import { GetItemsHandler } from './application/cqrs/handlers/get-items.handler.js';
import { ItemModel, ItemSchema } from './infrastructure/persistence/models/item.model.js';
import { ItemController } from './interfaces/http/item.controller.js';
import { ItemModifierController } from './interfaces/http/item-modifier.controller.js';
import { CreateItemHandler } from './application/cqrs/handlers/create-item.handler.js';
import { DeleteItemHandler } from './application/cqrs/handlers/delete-item.handler.js';
import { UpdateItemHandler } from './application/cqrs/handlers/update-item.handler.js';
import { MongoItemRepository } from './infrastructure/db/mongo.item.repository.js';
import { ApiRealmAdapter } from './infrastructure/api-clients/api.realm.adapter.js';
import { AddItemModifierHandler } from './application/cqrs/handlers/add-item-modifier.handler.js';
import { DeleteItemModifierHandler } from './application/cqrs/handlers/delete-item-modifier.handler.js';
import { ItemModifierOptionService } from './domain/services/item-modifier-option.service.js';
import { ITEM_REPOSITORY } from './application/ports/item-repository.port.js';
import { REALM_PORT } from './application/ports/realm.port.js';
import { ITEM_GUARD } from './application/ports/item-guard.port.js';
import { ItemGuardAdapter } from './infrastructure/security/item-guard.adapter.js';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: ItemModel.name, schema: ItemSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [ItemController, ItemModifierController],
  providers: [
    ItemModifierOptionService,
    GetItemHandler,
    GetItemsHandler,
    CreateItemHandler,
    UpdateItemHandler,
    DeleteItemHandler,
    AddItemModifierHandler,
    DeleteItemModifierHandler,
    {
      provide: ITEM_REPOSITORY,
      useClass: MongoItemRepository,
    },
    { provide: ITEM_GUARD, useClass: ItemGuardAdapter },
    {
      provide: REALM_PORT,
      useClass: ApiRealmAdapter,
    },
  ],
  exports: [ITEM_REPOSITORY],
})
export class ItemsModule {}
