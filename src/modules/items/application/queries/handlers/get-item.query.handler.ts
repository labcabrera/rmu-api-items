import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Item } from 'src/modules/items/domain/entities/item';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import * as ir from '../../ports/out/item-repository';
import { GetItemQuery } from '../get-item.query';

@QueryHandler(GetItemQuery)
export class GetItemQueryHandler implements IQueryHandler<GetItemQuery, Item> {
  constructor(@Inject('GameRepository') private readonly gameRepository: ir.ItemRepository) {}

  async execute(query: GetItemQuery): Promise<Item> {
    const data = await this.gameRepository.findById(query.itemId);
    if (!data) {
      throw new NotFoundError('Item', query.itemId);
    }
    return data;
  }
}
