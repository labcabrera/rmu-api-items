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
    const Item: Partial<Item> = {
      ...command,
      owner: command.userId,
      createdAt: new Date(),
    };
    const savedItem = await this.itemRepository.save(Item);
    await this.itemNotificationPort.created(savedItem);
    return savedItem;
  }

  validate(command: CreateItemCommand) {
    switch (command.category) {
      case 'weapon':
        if (!command.weapon) {
          throw new ValidationError('Required weapon info');
        }
        break;
      default:
        break;
    }
  }
}
