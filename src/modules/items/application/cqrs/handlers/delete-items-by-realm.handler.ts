import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { ItemDeletedEvent } from '../../../domain/events/item.events.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { DeleteItemsByRealmCommand } from '../commands/delete-items-by-realm.command.js';

/**
 * Deletes the items of a deleted realm one at a time, publishing an item.deleted per item like DeleteItemHandler
 * (spec 073, decision 9). Idempotent: a repeated message no longer finds any item.
 */
@CommandHandler(DeleteItemsByRealmCommand)
export class DeleteItemsByRealmHandler implements ICommandHandler<DeleteItemsByRealmCommand, void> {
  private readonly logger = new Logger(DeleteItemsByRealmHandler.name);

  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: DeleteItemsByRealmCommand): Promise<void> {
    const items = await this.itemRepository.findByRealmId(command.realmId);
    this.logger.log(`Deleting ${items.length} items of realm ${command.realmId}`);
    for (const item of items) {
      // Another delivery may have deleted it in between: only the one that deletes it publishes.
      const deleted = await this.itemRepository.deleteById(item.id);
      if (deleted) await this.eventPublisher.publish('item', new ItemDeletedEvent(item.getProps()));
    }
  }
}
