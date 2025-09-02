import { ItemInfo } from '../../domain/entities/item';

export class UpdateItemCommand {
  id: string;
  realm: string | undefined;
  info: ItemInfo | undefined;
  description: string | undefined;
  userId: string;
  roles: string[];
}
