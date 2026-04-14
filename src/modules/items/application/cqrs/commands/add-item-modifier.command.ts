import { ItemModifierType } from 'src/modules/items/domain/value-objects/item-modifier-type.vo';
import { AuthenticatedCommand } from 'src/modules/shared/application/cqrs/authenticated-command';

export class AddItemModifierCommand extends AuthenticatedCommand {
  constructor(
    public readonly itemId: string,
    public readonly type: ItemModifierType,
    public readonly modifier: string | undefined,
    public readonly value: number | undefined,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}
