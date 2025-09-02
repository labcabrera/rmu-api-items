import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Item } from 'src/modules/items/domain/entities/item';
import { ConflictError, ValidationError } from 'src/modules/shared/domain/errors';
import * as iep from '../../ports/out/item-event-producer';
import * as ir from '../../ports/out/item-repository';
import { CreateItemCommand } from '../create-item.command';

@CommandHandler(CreateItemCommand)
export class CreateItemCommandHandler implements ICommandHandler<CreateItemCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly itemRepository: ir.ItemRepository,
    @Inject('ItemEventProducer') private readonly itemNotificationPort: iep.ItemEventProducer,
  ) {}

  async execute(command: CreateItemCommand): Promise<Item> {
    this.validate(command);
    const current = await this.itemRepository.findById(command.id);
    if (current) {
      throw new ConflictError(`Item ${command.id} already exists`);
    }
    const item: Partial<Item> = {
      ...command,
      owner: command.userId,
      createdAt: new Date(),
    };
    const savedItem = await this.itemRepository.save(item);
    await this.itemNotificationPort.created(savedItem);
    return savedItem;
  }

  validate(command: CreateItemCommand) {
    switch (command.category) {
      case 'weapon':
        if (!command.weapon) {
          throw new ValidationError('Required weapon info');
        } else if (command.armor) {
          throw new ValidationError('Armor info not allowed');
        }
        break;
      case 'armor':
        if (!command.armor) {
          throw new ValidationError('Required armor info');
        } else if (command.weapon) {
          throw new ValidationError('Weapon info not allowed');
        }
        break;
      default:
        break;
    }
  }
}
