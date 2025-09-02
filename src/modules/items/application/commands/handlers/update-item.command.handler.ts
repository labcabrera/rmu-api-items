import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateItemCommand } from '../update-item.command';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import { Item } from 'src/modules/items/domain/entities/item';
import * as ir from '../../ports/out/item-repository';
import * as iep from '../../ports/out/item-event-producer';

@CommandHandler(UpdateItemCommand)
export class UpdateItemCommandHandler implements ICommandHandler<UpdateItemCommand, Item> {
  constructor(
    @Inject('ItemRepository') private readonly gameRepository: ir.ItemRepository,
    @Inject('ItemEventProducer') private readonly raceNotificationPort: iep.ItemEventProducer,
  ) {}

  async execute(command: UpdateItemCommand): Promise<Item> {
    const current = await this.gameRepository.findById(command.id);
    if (!current) {
      throw new NotFoundError('Item', command.id);
    }
    //TODO
    const partial: Partial<Item> = { ...command, updatedAt: new Date() };
    const updated = await this.gameRepository.update(command.id, partial);
    await this.raceNotificationPort.updated(updated);
    return updated;
  }
}
