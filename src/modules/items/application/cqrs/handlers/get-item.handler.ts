import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { GetItemQuery } from '../queries/get-item.query';
import type { ItemRepository } from '../../ports/item.repository';
import { NotFoundError } from 'src/modules/shared/domain/errors/errors';

@QueryHandler(GetItemQuery)
export class GetItemHandler implements IQueryHandler<GetItemQuery, Item> {
  constructor(@Inject('ItemRepository') private readonly itemRepository: ItemRepository) {}

  async execute(query: GetItemQuery): Promise<Item> {
    const data = await this.itemRepository.findById(query.itemId);
    if (!data) {
      throw new NotFoundError('Item', query.itemId);
    }
    return data;
  }
}
