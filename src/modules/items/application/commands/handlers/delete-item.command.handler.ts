import { Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import { DeleteItemCommand } from '../delete-item.command';
import * as ir from '../../ports/out/item-repository';
import * as iep from '../../ports/out/item-event-producer';

@CommandHandler(DeleteItemCommand)
export class DeleteItemCommandHandler implements ICommandHandler<DeleteItemCommand> {
  constructor(
    @Inject('ItemRepository') private readonly gameRepository: ir.ItemRepository,
    @Inject('ItemEventProducer') private readonly gameNotificationPort: iep.ItemEventProducer,
  ) {}

  async execute(command: DeleteItemCommand): Promise<void> {
    const item = await this.gameRepository.findById(command.id);
    if (!item) {
      throw new NotFoundError('Item', command.id);
    }
    await this.gameRepository.deleteById(command.id);
    await this.gameNotificationPort.deleted(item);
  }
}
