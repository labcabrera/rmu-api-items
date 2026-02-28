import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page } from 'src/modules/shared/domain/entities/page.entity';
import { RsqlParser } from 'src/modules/shared/infrastructure/messaging/rsql-parser';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import { ItemRepository } from 'src/modules/items/application/ports/item.repository';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { ItemWeapon as ItemWeaponVO } from 'src/modules/items/domain/value-objects/item-weapon.vo';
import { ItemWeaponMode as ItemWeaponModeVO } from 'src/modules/items/domain/value-objects/item-weapon-mode.vo';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';
import { ItemDocument, ItemModel } from '../persistence/models/item-model';

@Injectable()
export class MongoItemRepository implements ItemRepository {
  constructor(
    @InjectModel(ItemModel.name) private gameModel: Model<ItemDocument>,
    private rsqlParser: RsqlParser,
  ) {}

  async findById(id: string): Promise<Item | null> {
    const readed = await this.gameModel.findById(id);
    return readed ? this.mapToEntity(readed) : null;
  }

  async findByRsql(rsql: string, page: number, size: number): Promise<Page<Item>> {
    const skip = page * size;
    const mongoQuery = this.rsqlParser.parse(rsql);
    const [gamesDocs, totalElements] = await Promise.all([
      this.gameModel.find(mongoQuery).skip(skip).limit(size).sort({ name: 1 }),
      this.gameModel.countDocuments(mongoQuery),
    ]);
    const content = gamesDocs.map((doc) => this.mapToEntity(doc));
    return new Page<Item>(content, page, size, totalElements);
  }

  async save(item: Item): Promise<Item> {
    const props = { ...item.toProps(), _id: item.id } as any;
    const model = new this.gameModel(props);
    await model.save();
    return this.mapToEntity(model);
  }

  async update(id: string, request: Partial<Item>): Promise<Item> {
    const updatedItem = await this.gameModel.findByIdAndUpdate(id, { $set: request }, { new: true });
    if (!updatedItem) {
      throw new NotFoundError('Item', id);
    }
    return this.mapToEntity(updatedItem);
  }

  async deleteById(id: string): Promise<Item | null> {
    const result = await this.gameModel.findByIdAndDelete(id);
    return result ? this.mapToEntity(result) : null;
  }

  private mapToEntity(doc: ItemDocument): Item {
    const weapon = doc.weapon
      ? new ItemWeaponVO(
          doc.weapon.skillId,
          doc.weapon.fumble,
          (doc.weapon.modes ?? []).map(
            (m) =>
              new ItemWeaponModeVO(m.type, m.attackTypes, m.attackTable, m.fumbleTable, m.sizeAdjustment, m.ranges, m.alternativeTable),
          ),
        )
      : undefined;

    const modifiers = doc.modifiers ? doc.modifiers.map((m) => new ItemModifier(m.id, m.type, m.modifier, m.value)) : undefined;

    return Item.fromProps({
      id: doc._id,
      realm: doc.realm,
      category: doc.category,
      weapon,
      armor: doc.armor,
      shield: doc.shield,
      info: doc.info,
      stackable: doc.stackable,
      description: doc.description,
      modifiers,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
