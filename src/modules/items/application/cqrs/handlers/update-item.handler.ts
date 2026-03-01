import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateItemCommand } from '../commands/update-item.command';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import type { ItemEventBusPort } from '../../ports/item-event-bus.port';
import type { ItemRepository } from '../../ports/item.repository';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler implements ICommandHandler<UpdateItemCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly itemRepository: ItemRepository,
    @Inject('ItemEventProducer') private readonly itemEventBus: ItemEventBusPort,
  ) {}

  async execute(command: UpdateItemCommand): Promise<Item> {
    const item = await this.itemRepository.findById(command.id);
    if (!item) {
      throw new NotFoundError('Item', command.id);
    }
    item.update({
      weapon: command.weapon,
      armor: command.armor,
      shield: command.shield,
      info: command.info,
      modifiers: command.modifiers,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.itemRepository.update(command.id, item);
    updated.getUncommittedEvents().forEach((event) => this.itemEventBus.publish(event));
    return updated;
  }
}
