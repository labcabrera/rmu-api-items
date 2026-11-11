import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetItemQuery } from '../queries/get-item.query.js';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { RealmAccessService } from '../../services/realm-access.service.js';
import type { ItemWithAccess } from '../item-with-access.js';

@QueryHandler(GetItemQuery)
export class GetItemHandler implements IQueryHandler<GetItemQuery, ItemWithAccess> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    private readonly realmAccess: RealmAccessService,
  ) {}

  async execute(query: GetItemQuery): Promise<ItemWithAccess> {
    const item = await this.itemRepository.findById(query.itemId);
    if (!item) {
      throw new NotFoundError('Item', query.itemId);
    }
    const caller = await this.realmAccess.caller(query.userId, query.roles, item.realmId);
    return { item, access: this.itemGuard.checkRead(item, caller) };
  }
}
