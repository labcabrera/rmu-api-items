import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port';
import { AddItemModifierCommand } from '../commands/add-item-modifier.command';
import { NotFoundError } from '../../../../shared/domain/errors/errors';

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

    const saved = await this.itemRepository.update(command.itemId, item);
    await this.eventPublisher.publishChanges('item', item);
    return saved;
  }
}
