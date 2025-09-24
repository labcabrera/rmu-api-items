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
    const current = await this.itemRepository.findById(command.id);
    if (!current) {
      throw new NotFoundError('Item', command.id);
    }
    //TODO
    const partial: Partial<Item> = { ...command, updatedAt: new Date() };
    const updated = await this.itemRepository.update(command.id, partial);
    updated.getUncommittedEvents().forEach((event) => this.itemEventBus.publish(event));
    return updated;
  }
}
