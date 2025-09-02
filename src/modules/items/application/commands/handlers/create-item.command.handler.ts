import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Item } from 'src/modules/items/domain/entities/item';
import * as iep from '../../ports/out/item-event-producer';
import * as ir from '../../ports/out/item-repository';
import { CreateItemCommand } from '../create-item.command';

@CommandHandler(CreateItemCommand)
export class CreateItemCommandHandler implements ICommandHandler<CreateItemCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly itemRepository: ir.ItemRepository,
    @Inject('ItemEventProducer') private readonly itemNotificationPort: iep.ItemEventProducer,
  ) {}

  async execute(command: CreateItemCommand): Promise<Item> {
    const Item: Partial<Item> = {
      ...command,
      owner: command.userId,
      createdAt: new Date(),
    };
    const savedItem = await this.itemRepository.save(Item);
    await this.itemNotificationPort.created(savedItem);
    return savedItem;
  }
}
