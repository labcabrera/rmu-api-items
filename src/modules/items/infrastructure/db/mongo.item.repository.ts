import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ItemRepository } from '../../application/ports/item-repository.port.js';
import { Item } from '../../domain/aggregates/item.aggregate.js';
import { ItemWeapon } from '../../domain/value-objects/item-weapon.vo.js';
import { ItemWeaponMode } from '../../domain/value-objects/item-weapon-mode.vo.js';
import { ItemModifier } from '../../domain/value-objects/item-modifier.vo.js';
import { type ItemDocument, ItemModel } from '../persistence/models/item.model.js';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository.js';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';

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
      name: doc.name,
      realmId: doc.realmId,
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
