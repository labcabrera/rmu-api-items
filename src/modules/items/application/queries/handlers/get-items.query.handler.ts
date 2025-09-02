import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Item } from 'src/modules/items/domain/entities/item';
import { Page } from 'src/modules/shared/domain/entities/page.entity';
import * as ir from '../../ports/out/item-repository';
import { GetItemsQuery } from '../get-items.query';

@QueryHandler(GetItemsQuery)
export class GetItemsQueryHandler implements IQueryHandler<GetItemsQuery, Page<Item>> {
  constructor(@Inject('GameRepository') private readonly gameRepository: ir.ItemRepository) {}

  async execute(query: GetItemsQuery): Promise<Page<Item>> {
    return await this.gameRepository.findByRsql(query.rsql, query.page, query.size);
  }
}
