import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DeleteItemCommand } from '../commands/delete-item.command.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { ItemDeletedEvent } from '../../../domain/events/item.events.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(DeleteItemCommand)
export class DeleteItemHandler implements ICommandHandler<DeleteItemCommand> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: DeleteItemCommand): Promise<void> {
    const item = await this.itemRepository.findById(command.id);
    if (!item) {
      throw new NotFoundError('Item', command.id);
    }
    await this.itemRepository.deleteById(command.id);
    await this.eventPublisher.publish('item', new ItemDeletedEvent(item.getProps()));
  }
}
