import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate';
import { GetItemQuery } from '../queries/get-item.query';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port';
import { NotFoundError } from '../../../../shared/domain/errors/errors';

@QueryHandler(GetItemQuery)
export class GetItemHandler implements IQueryHandler<GetItemQuery, Item> {
  constructor(@Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository) {}

  async execute(query: GetItemQuery): Promise<Item> {
    const data = await this.itemRepository.findById(query.itemId);
    if (!data) {
      throw new NotFoundError('Item', query.itemId);
    }
    return data;
  }
}
