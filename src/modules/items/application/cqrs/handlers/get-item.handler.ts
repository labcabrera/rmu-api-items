import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { GetItemQuery } from '../queries/get-item.query.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@QueryHandler(GetItemQuery)
export class GetItemHandler implements IQueryHandler<GetItemQuery, Item> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
  ) {}

  async execute(query: GetItemQuery): Promise<Item> {
    const data = await this.itemRepository.findById(query.itemId);
    if (!data) {
      throw new NotFoundError('Item', query.itemId);
    }
    this.itemGuard.checkRead(data, query.userId, query.roles);
    return data;
  }
}
