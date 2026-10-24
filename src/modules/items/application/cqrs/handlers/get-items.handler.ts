import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { GetItemsQuery } from '../queries/get-items.query.js';
import { Page } from '../../../../shared/application/pagination/page.js';

@QueryHandler(GetItemsQuery)
export class GetItemsHandler implements IQueryHandler<GetItemsQuery, Page<Item>> {
  constructor(@Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository) {}

  async execute(query: GetItemsQuery): Promise<Page<Item>> {
    return await this.itemRepository.findByRsql(query.rsql, query.page, query.size);
  }
}
