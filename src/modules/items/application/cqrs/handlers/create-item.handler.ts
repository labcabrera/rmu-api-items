import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { CreateItemCommand } from '../commands/create-item.command.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { type RealmPort, REALM_PORT } from '../../ports/realm.port.js';
import { ValidationError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler implements ICommandHandler<CreateItemCommand, Item> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    @Inject(REALM_PORT) private readonly realmPort: RealmPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateItemCommand): Promise<Item> {
    this.itemGuard.checkCreate(command.roles);
    // Before asking core for the realm, so invalid data is a 400 without a call.
    Item.checkCategoryData(command.category, command);

    // realmId is validated by checking existence; store only realmId on the item
    if (command.realmId) {
      const realmEntity = await this.realmPort.fetchRealmById(command.realmId);
      if (!realmEntity) throw new ValidationError(`Realm ${command.realmId} does not exist`);
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
    });
    const saved = await this.itemRepository.save(item);
    await this.eventPublisher.publishChanges('item', item);
    return saved;
  }
}
