import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { CreateItemCommand } from '../commands/create-item.command.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { type RealmPort, REALM_PORT } from '../../ports/realm.port.js';
import { ForbiddenError, ValidationError } from '../../../../shared/domain/errors/errors.js';
import { RealmAccessService } from '../../services/realm-access.service.js';
import { type AccessCaller, type AccessLevel, atLeast } from '../../../domain/services/realm-child-access.js';
import type { ItemWithAccess } from '../item-with-access.js';
import { RMU_ADMIN } from '../../../../shared/domain/entities/user-roles.js';

/** 403 to create an item in a realm the user only reads (spec 073, decision 4). */
export const REALM_NOT_WRITABLE = 'realm-not-writable';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler implements ICommandHandler<CreateItemCommand, ItemWithAccess> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    @Inject(REALM_PORT) private readonly realmPort: RealmPort,
    private readonly realmAccess: RealmAccessService,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateItemCommand): Promise<ItemWithAccess> {
    this.itemGuard.checkCreate(command.roles);
    this.itemGuard.checkEntitySource(command.roles, command.entitySource);
    // Before asking core for the realm, so invalid data is a 400 without a call.
    Item.checkCategoryData(command.category, command);

    let caller: AccessCaller = { userId: command.userId, roles: command.roles, realmLevels: new Map() };
    // realmId is validated by checking existence; store only realmId on the item
    if (command.realmId) {
      const realmEntity = await this.realmPort.fetchRealmById(command.realmId);
      if (!realmEntity) throw new ValidationError(`Realm ${command.realmId} does not exist`);
      // Spec 073, decision 4: the user must write the realm (an admin writes them all). Fresh, so a new share counts.
      if (!command.roles.includes(RMU_ADMIN)) {
        const realmLevels = await this.realmAccess.levels(command.userId, { fresh: true });
        const level: AccessLevel = realmLevels.get(command.realmId) ?? 'none';
        if (level === 'none') throw new ValidationError('You cannot read the realm of the item', 'realm-not-readable');
        if (!atLeast(level, 'write')) throw new ForbiddenError('You cannot write the realm of the item', REALM_NOT_WRITABLE);
        caller = { ...caller, realmLevels };
      }
    }

    const item = Item.create({
      name: command.name,
      realmId: command.realmId || null,
      category: command.category,
      weapon: command.weapon,
      armor: command.armor,
      shield: command.shield,
      features: command.features,
      info: command.info,
      modifiers: command.modifiers,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
      entitySource: command.entitySource ?? 'user',
    });
    const saved = await this.itemRepository.save(item);
    await this.eventPublisher.publishChanges('item', item);
    return { item: saved, access: this.itemGuard.checkRead(saved, caller) };
  }
}
