import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { type ItemRepository, ITEM_REPOSITORY } from '../../ports/item-repository.port.js';
import { type ItemGuardPort, ITEM_GUARD } from '../../ports/item-guard.port.js';
import { GetItemsQuery } from '../queries/get-items.query.js';
import { Page } from '../../../../shared/application/pagination/page.js';
import { RealmAccessService } from '../../services/realm-access.service.js';
import type { ItemWithAccess } from '../item-with-access.js';

@QueryHandler(GetItemsQuery)
export class GetItemsHandler implements IQueryHandler<GetItemsQuery, Page<ItemWithAccess>> {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: ItemRepository,
    @Inject(ITEM_GUARD) private readonly itemGuard: ItemGuardPort,
    private readonly realmAccess: RealmAccessService,
  ) {}

  /** One call to core per user (cached), for the filter and the access of every row (spec 073, decision 6). */
  async execute(query: GetItemsQuery): Promise<Page<ItemWithAccess>> {
    const caller = await this.realmAccess.caller(query.userId, query.roles, true);
    const filter = this.itemGuard.buildQueryPredicate(caller);
    const page = await this.itemRepository.findByRsql(query.rsql, query.page, query.size, filter);
    const content = page.content.map(item => ({ item, access: this.itemGuard.checkRead(item, caller) }));
    return new Page<ItemWithAccess>(content, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }
}
