import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UpdateItemCommand } from '../commands/update-item.command.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { RealmAccessService } from '../../services/realm-access.service.js';
import type { ItemWithAccess } from '../item-with-access.js';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler implements ICommandHandler<UpdateItemCommand, ItemWithAccess> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    private readonly realmAccess: RealmAccessService,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateItemCommand): Promise<ItemWithAccess> {
    const item = await this.itemRepository.findById(command.id);
    if (!item) {
      throw new NotFoundError('Item', command.id);
    }
    const caller = await this.realmAccess.caller(command.userId, command.roles, item.realmId);
    this.itemGuard.checkUpdate(item, caller);
    this.itemGuard.checkEntitySource(command.roles, command.entitySource);
    item.checkVersion(command.expectedVersion);
    item.update({
      name: command.name,
      weapon: command.weapon,
      armor: command.armor,
      shield: command.shield,
      features: command.features,
      info: command.info,
      modifiers: command.modifiers,
      description: command.description,
      imageUrl: command.imageUrl,
      entitySource: command.entitySource,
    });
    // A PATCH without changes neither writes nor publishes (spec 021, decision 9).
    if (!item.hasChanges()) return { item, access: this.itemGuard.checkRead(item, caller) };
    const updated = await this.itemRepository.update(item);
    // The events are those of the loaded aggregate: `updated` is the copy read back from Mongo (F-items-03).
    await this.eventPublisher.publishChanges('item', item);
    return { item: updated, access: this.itemGuard.checkRead(updated, caller) };
  }
}
