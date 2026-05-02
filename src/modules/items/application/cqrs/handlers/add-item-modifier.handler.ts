import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import type { ItemEventBusPort } from '../../ports/item-event-bus.port';
import type { ItemRepository } from '../../ports/item.repository';
import { AddItemModifierCommand } from '../commands/add-item-modifier.command';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';

@CommandHandler(AddItemModifierCommand)
export class AddItemModifierHandler implements ICommandHandler<AddItemModifierCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly itemRepository: ItemRepository,
    @Inject('ItemEventProducer') private readonly itemEventBus: ItemEventBusPort,
  ) {}

  async execute(command: AddItemModifierCommand): Promise<Item> {
    const item = await this.itemRepository.findById(command.itemId);
    if (!item) throw new NotFoundError('Item', command.itemId);

    item.addModifier(command.type, command.modifier ?? null, command.value ?? null);

    const saved = await this.itemRepository.update(command.itemId, item);
    item.getUncommittedEvents().forEach(event => this.itemEventBus.publish(event));
    return saved;
  }
}
