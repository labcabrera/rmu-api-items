import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { DeleteItemModifierCommand } from '../commands/delete-item-modifier.command.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { RealmAccessService } from '../../services/realm-access.service.js';
import type { ItemWithAccess } from '../item-with-access.js';

@CommandHandler(DeleteItemModifierCommand)
export class DeleteItemModifierHandler implements ICommandHandler<DeleteItemModifierCommand, ItemWithAccess> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    private readonly realmAccess: RealmAccessService,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: DeleteItemModifierCommand): Promise<ItemWithAccess> {
    const item = await this.itemRepository.findById(command.itemId);
    if (!item) throw new NotFoundError('Item', command.itemId);
    const caller = await this.realmAccess.caller(command.userId, command.roles, item.realmId);
    this.itemGuard.checkUpdate(item, caller);

    item.removeModifier(command.modifierId);

    const saved = await this.itemRepository.update(item);
    await this.eventPublisher.publishChanges('item', item);
    return { item: saved, access: this.itemGuard.checkRead(saved, caller) };
  }
}
