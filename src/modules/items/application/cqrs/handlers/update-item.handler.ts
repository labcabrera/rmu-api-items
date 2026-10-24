import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UpdateItemCommand } from '../commands/update-item.command.js';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler implements ICommandHandler<UpdateItemCommand, Item> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateItemCommand): Promise<Item> {
    const item = await this.itemRepository.findById(command.id);
    if (!item) {
      throw new NotFoundError('Item', command.id);
    }
    item.update({
      name: command.name,
      weapon: command.weapon,
      armor: command.armor,
      shield: command.shield,
      info: command.info,
      modifiers: command.modifiers,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const updated = await this.itemRepository.update(command.id, item);
    // F-items-03: `updated` is the copy read back from Mongo, without the aggregate's events, so nothing is published.
    await this.eventPublisher.publishChanges('item', updated);
    return updated;
  }
}
