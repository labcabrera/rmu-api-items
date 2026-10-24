import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { AddItemModifierCommand } from '../commands/add-item-modifier.command.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(AddItemModifierCommand)
export class AddItemModifierHandler implements ICommandHandler<AddItemModifierCommand, Item> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: AddItemModifierCommand): Promise<Item> {
    const item = await this.itemRepository.findById(command.itemId);
    if (!item) throw new NotFoundError('Item', command.itemId);

    item.addModifier(command.type, command.modifier ?? null, command.value ?? null);

    const saved = await this.itemRepository.update(item);
    await this.eventPublisher.publishChanges('item', item);
    return saved;
  }
}
