import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Item } from '../../../domain/aggregates/item.aggregate';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port';
import { GetItemsQuery } from '../queries/get-items.query';
import { Page } from '../../../../shared/application/pagination/page';

@QueryHandler(GetItemsQuery)
export class GetItemsHandler implements IQueryHandler<GetItemsQuery, Page<Item>> {
  constructor(@Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository) {}

  async execute(query: GetItemsQuery): Promise<Page<Item>> {
    return await this.itemRepository.findByRsql(query.rsql, query.page, query.size);
  }
}
