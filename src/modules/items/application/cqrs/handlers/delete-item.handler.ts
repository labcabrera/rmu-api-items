import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteItemCommand } from '../commands/delete-item.command';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port';
import { ItemDeletedEvent } from '../../../domain/events/item.events';
import { NotFoundError } from '../../../../shared/domain/errors/errors';

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
