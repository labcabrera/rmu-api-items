import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { Page } from 'src/modules/shared/domain/entities/page.entity';
import type { ItemRepository } from '../../ports/item.repository';
import { GetItemsQuery } from '../queries/get-items.query';

@QueryHandler(GetItemsQuery)
export class GetItemsHandler implements IQueryHandler<GetItemsQuery, Page<Item>> {
  constructor(@Inject('ItemRepository') private readonly itemRepository: ItemRepository) {}

  async execute(query: GetItemsQuery): Promise<Page<Item>> {
    return await this.itemRepository.findByRsql(query.rsql, query.page, query.size);
  }
}
