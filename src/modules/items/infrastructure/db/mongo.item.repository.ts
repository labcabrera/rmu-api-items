import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemRepository } from 'src/modules/items/application/ports/item.repository';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';
import { ItemWeaponMode } from 'src/modules/items/domain/value-objects/item-weapon-mode.vo';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';
import { ItemDocument, ItemModel } from '../persistence/models/item-model';
import { MongoBaseRepository } from 'src/modules/shared/infrastructure/db/mongo.base.repository';
import { RsqlParser } from 'src/modules/shared/infrastructure/persistence/repositories/rsql-parser';

@Injectable()
export class MongoItemRepository extends MongoBaseRepository<Item, ItemDocument> implements ItemRepository {
  constructor(@InjectModel(ItemModel.name) gameModel: Model<ItemDocument>, rsqlParser: RsqlParser) {
    super(gameModel, rsqlParser);
  }

  protected mapToEntity(doc: ItemDocument): Item {
    const weapon = doc.weapon
      ? new ItemWeapon(
          doc.weapon.skillId,
          doc.weapon.fumble,
          (doc.weapon.modes ?? []).map(
            m => new ItemWeaponMode(m.type, m.attackTypes, m.attackTable, m.fumbleTable, m.sizeAdjustment, m.ranges, m.alternativeTable),
          ),
        )
      : null;
    const modifiers = doc.modifiers ? doc.modifiers.map(m => new ItemModifier(m.id, m.type, m.modifier, m.value)) : null;
    return Item.fromProps({
      id: doc._id,
      realm: doc.realm,
      category: doc.category,
      weapon: weapon,
      armor: doc.armor,
      shield: doc.shield,
      info: doc.info,
      description: doc.description,
      modifiers: modifiers,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
