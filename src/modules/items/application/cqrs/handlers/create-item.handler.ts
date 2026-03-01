import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { ConflictError, ValidationError } from 'src/modules/shared/domain/errors';
import { CreateItemCommand } from '../commands/create-item.command';
import type { ItemEventBusPort } from '../../ports/item-event-bus.port';
import type { ItemRepository } from '../../ports/item.repository';
import type { RealmPort } from '../../ports/realm.port';

@CommandHandler(CreateItemCommand)
export class CreateItemHandler implements ICommandHandler<CreateItemCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly itemRepository: ItemRepository,
    @Inject('RealmPort') private readonly realmPort: RealmPort,
    @Inject('ItemEventProducer') private readonly itemEventBus: ItemEventBusPort,
  ) {}

  async execute(command: CreateItemCommand): Promise<Item> {
    this.validate(command);

    const current = await this.itemRepository.findById(command.id);
    if (current) throw new ConflictError(`Item ${command.id} already exists`);

    const realm = await this.realmPort.fetchRealmById(command.realmId);
    if (!realm) throw new ValidationError(`Realm ${command.realmId} does not exist`);

    const item = Item.create({
      id: command.id,
      realm: realm,
      category: command.category,
      weapon: command.weapon,
      armor: command.armor,
      shield: command.shield,
      info: command.info,
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
    });
    const saved = await this.itemRepository.save(item);
    item.getUncommittedEvents().forEach((event) => this.itemEventBus.publish(event));
    return saved;
  }

  validate(command: CreateItemCommand) {
    switch (command.category) {
      case 'weapon':
        if (!command.weapon) {
          throw new ValidationError('Required weapon info');
        } else if (command.armor) {
          throw new ValidationError('Armor info not allowed');
        } else if (command.shield) {
          throw new ValidationError('Armor info not allowed');
        }
        break;
      case 'armor':
        if (!command.armor) {
          throw new ValidationError('Required armor info');
        } else if (command.weapon) {
          throw new ValidationError('Weapon info not allowed');
        } else if (command.shield) {
          throw new ValidationError('Weapon info not allowed');
        }
        break;
      case 'shield':
        if (!command.shield) {
          throw new ValidationError('Required shield info');
        } else if (command.weapon) {
          throw new ValidationError('Weapon info not allowed');
        } else if (command.armor) {
          throw new ValidationError('Armor info not allowed');
        }
        break;
      default:
        break;
    }
  }
}
